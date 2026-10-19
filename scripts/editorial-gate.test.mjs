import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { blobSha, protectedPath, changedFiles, contentMatches, reviewAuthorizes, enforceEditorialReview } from './editorial-gate.mjs';
const commit = 'a'.repeat(40);
const reviewer = { login: 'qualified-human', name: 'Fixture only', roles: ['editorial','electrical'], qualifications: { electrical: { credential: 'fixture-license', jurisdiction: 'fixture-state', verifiedBy: 'fixture-owner', verificationUrl: 'https://example.invalid/fixture', verifiedOn: '2026-10-01', validThrough: '2026-12-31' } } };
const approval = { id: 1, state: 'APPROVED', commit_id: commit, user: { type: 'User', login: reviewer.login }, body: 'BAYHEAT-EDITORIAL-APPROVED BAYHEAT-ELECTRICAL-APPROVED' };
test('omission, automation, dismissal, wrong revision and wrong reviewer never authorize', () => {
  for (const candidate of [null,{...approval,state:'COMMENTED'},{...approval,state:'DISMISSED'},{...approval,commit_id:'b'.repeat(40)},{...approval,user:{type:'Bot',login:reviewer.login}},{...approval,user:{type:'User',login:'different'}}])
    assert.equal(reviewAuthorizes(candidate,reviewer,'editorial',commit,'2026-10-19'),false);
  assert.equal(reviewAuthorizes(approval,reviewer,'editorial',commit,'2026-10-19'),true);
});
test('technical approval needs a current, recorded credential and correct domain', () => {
  assert.equal(reviewAuthorizes(approval,reviewer,'electrical',commit,'2026-10-19'),true);
  assert.equal(reviewAuthorizes(approval,reviewer,'gas',commit,'2026-10-19'),false);
  assert.equal(reviewAuthorizes(approval,{...reviewer,qualifications:{}},'electrical',commit,'2026-10-19'),false);
  assert.equal(reviewAuthorizes(approval,reviewer,'electrical',commit,'2027-01-01'),false);
});
test('content edits with unchanged page revision and added/deleted inputs invalidate receipts', () => {
  const a={'app/(site)/garage-heater-thermostat/page.tsx':blobSha(Buffer.from('rev 2: approved words'))};
  const b={...a,'app/(site)/garage-heater-thermostat/page.tsx':blobSha(Buffer.from('rev 2: new recommendation'))};
  assert.equal(changedFiles(a,b).length,1);
  assert.equal(contentMatches(Object.keys(b),b,a),false);
  assert.equal(contentMatches(Object.keys(a),a,a),true);
  assert.equal(changedFiles(a,{}).length,1);
  assert.equal(changedFiles({},a).length,1);
  assert.equal(protectedPath('lib/facts/electric.ts'),true);
  assert.equal(protectedPath('app/(site)/unclassified-guide/page.tsx'),true);
});
test('real production gate rejects missing receipts before any GitHub access', async () => {
  const root=mkdtempSync(join(tmpdir(),'bayheat-gate-'));
  try {
    for(const dir of ['docs/editorial','app/(site)','lib','components/evidence']) mkdirSync(join(root,dir),{recursive:true});
    cpSync('docs/editorial/baseline.json',join(root,'docs/editorial/baseline.json'));
    writeFileSync(join(root,'docs/editorial/approvals.json'),'[]');
    writeFileSync(join(root,'docs/editorial/reviewers.json'),'[]');
    await assert.rejects(enforceEditorialReview(root),/Recorded editorial review required/);
    writeFileSync(join(root,'docs/editorial/baseline.json'),'{}');
    await assert.rejects(enforceEditorialReview(root),/Editorial baseline changed/);
  } finally {rmSync(root,{recursive:true,force:true});}
});
