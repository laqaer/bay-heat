import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function blobSha(bytes) {
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

// Includes every article, not just routes an author remembers to classify as safety.
// Shared factual inputs are protected too: changing a fact must not evade a page gate.
export function protectedPath(path) {
  return !/\.test\.[cm]?[jt]sx?$/.test(path) && (
    /^app\/\(site\)\/.*\.(tsx?|mdx|json)$/.test(path) ||
    /^lib\/(facts|pages|planner|safety|commerce\/products)\/.*\.(tsx?|json)$/.test(path) ||
    ['lib/site.ts', 'components/evidence/LabLabel.tsx'].includes(path)
  );
}

export function snapshot(root) {
  const files = {};
  function walk(dir) {
    for (const ent of readdirSync(resolve(root, dir), { withFileTypes: true })) {
      const path = `${dir}/${ent.name}`;
      if (ent.isSymbolicLink()) throw new Error(`Editorial gate: symlink not allowed: ${path}`);
      if (ent.isDirectory()) walk(path);
      else if (protectedPath(path)) files[path] = blobSha(readFileSync(resolve(root, path)));
    }
  }
  for (const dir of ['app/(site)', 'lib', 'components/evidence']) walk(dir);
  return files;
}

export function changedFiles(before, after) {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter(path => before[path] !== after[path]).sort();
}

export function reviewAuthorizes(review, reviewer, role, commit, today) {
  if (!review || !reviewer || review.state !== 'APPROVED' || review.commit_id !== commit ||
      review.user?.type !== 'User' || review.user.login !== reviewer.login ||
      !reviewer.name?.trim() || !reviewer.roles?.includes(role) ||
      !review.body?.includes(`BAYHEAT-${role.toUpperCase()}-APPROVED`)) return false;
  if (role !== 'editorial') {
    const q = reviewer.qualifications?.[role];
    if (!q?.credential || !q.jurisdiction || !q.verifiedBy ||
        !/^https:\/\//.test(q.verificationUrl ?? '') || !/^\d{4}-\d{2}-\d{2}$/.test(q.verifiedOn ?? '') ||
        q.verifiedOn > today || !/^\d{4}-\d{2}-\d{2}$/.test(q.validThrough ?? '') || q.validThrough < today) return false;
  }
  return true;
}

export function contentMatches(paths, current, reviewedTree) {
  return paths.every(path => (current[path] ?? null) === (reviewedTree[path] ?? null));
}

async function github(path) {
  const response = await fetch(`https://api.github.com/repos/laqaer/bay-heat/${path}`, {
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Editorial evidence unavailable: GitHub HTTP ${response.status}`);
  return response.json();
}

async function allReviews(pr) {
  const reviews = [];
  for (let page = 1; ; page++) {
    const batch = await github(`pulls/${pr}/reviews?per_page=100&page=${page}`);
    reviews.push(...batch);
    if (batch.length < 100) return reviews;
  }
}

export async function enforceEditorialReview(root = process.cwd()) {
  const baselineBytes = readFileSync(resolve(root, 'docs/editorial/baseline.json'));
  const expected = 'bfde9730a1dac38a9b2b12403e21d79315550afcc3e27ce444fd88be3158a548';
  if (createHash('sha256').update(baselineBytes).digest('hex') !== expected)
    throw new Error('Editorial baseline changed; it is an inventory, never an approval. Restore it.');
  const baseline = JSON.parse(baselineBytes);
  const current = snapshot(root);
  const changed = changedFiles(baseline.files, current);
  if (!changed.length) return;
  const records = JSON.parse(readFileSync(resolve(root, 'docs/editorial/approvals.json'), 'utf8'));
  // In trusted PR checks this file comes from the base branch, never the candidate.
  const reviewers = JSON.parse(readFileSync(new URL('../docs/editorial/reviewers.json', import.meta.url), 'utf8'));
  const { PAGES } = await import('../lib/pages/index.ts');
  const roles = new Set(['editorial']);
  for (const path of changed) {
    const page = PAGES.find(p => `app/(site)${p.href === '/' ? '' : p.href}/page.tsx` === path);
    if (page?.reviewed) roles.add(page.reviewed);
    if (baseline.domains[path]) for (const domain of baseline.domains[path]) roles.add(domain);
    // Shared safety inputs can affect both electrical and gas advice.
    if (/^lib\/(facts|planner|safety|commerce\/products)\//.test(path)) {
      if (/\/(electric|electrical)\.ts$/.test(path)) roles.add('electrical');
      else if (/\/(fuel|fuels)\.ts$/.test(path)) roles.add('gas');
      else { roles.add('electrical'); roles.add('gas'); }
    }
    // An unclassified new article or changed classification is not a way around technical review.
    if (!page && path.startsWith('app/(site)/')) {
      roles.add('electrical'); roles.add('gas');
    }
  }
  if (changed.some(p => p.startsWith('lib/pages/'))) {
    for (const p of PAGES) {
      if (JSON.stringify(p) !== JSON.stringify(baseline.pages.find(b => b.href === p.href)) && p.reviewed) roles.add(p.reviewed);
    }
  }
  for (const record of records) {
    if (!/^[a-f0-9]{40}$/.test(record.commit ?? '') || !Number.isInteger(record.pr)) continue;
    const tree = await github(`git/trees/${record.commit}?recursive=1`);
    if (tree.truncated) throw new Error('Editorial evidence tree truncated');
    const reviewed = Object.fromEntries(tree.tree.filter(x => x.type === 'blob').map(x => [x.path, x.sha]));
    if (!contentMatches(changed, current, reviewed)) continue;
    const reviews = await allReviews(record.pr);
    const latest = new Map();
    for (const review of reviews.filter(r => ['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(r.state)))
      latest.set(review.user.login, review);
    const valid = [...roles].every(role => {
      const review = reviews.find(r => r.id === record.reviews?.[role]);
      return review && latest.get(review.user.login)?.id === review.id &&
        reviewAuthorizes(review, reviewers.find(r => r.login === review.user.login), role, record.commit, new Date().toISOString().slice(0, 10));
    });
    if (valid) return;
  }
  throw new Error(`Recorded editorial review required (${[...roles].join(', ')}). No current, qualified approval covers these exact files:\n${changed.join('\n')}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  enforceEditorialReview(process.argv[2] ? resolve(process.argv[2]) : process.cwd()).then(() => {
    console.log('Editorial gate passed: unchanged baseline or verified exact-content approvals.');
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
