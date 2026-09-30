import { test } from "node:test";
import assert from "node:assert/strict";
import { auditHtml, disclosureBeforeFirstLink } from "../../scripts/link-audit.mjs";

const link = (href: string) => `<a href="${href}" rel="sponsored nofollow noopener">x</a>`;
const DISC = "<p>Paid links: we earn a commission if you buy.</p>";

test("auditHtml tells /dp/, search and cart links apart and reads the tag", () => {
  const html = [
    link("https://www.amazon.com/dp/B009F1SWH8?tag=laqaer-20"),
    link("https://www.amazon.com/s?k=seal+kit&amp;tag=laqaer-20"),
    link("https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=laqaer-20&amp;ASIN.1=B009F1SWH8&amp;ASIN.2=B00PX0T37I"),
  ].join("");
  const out = auditHtml(html);
  assert.deepEqual(out.map((l: { kind: string }) => l.kind), ["dp", "search", "cart"]);
  assert.ok(out.every((l: { tag: string | null }) => l.tag === "laqaer-20"));
});

test("the disclosure must come before the first paid link", () => {
  assert.equal(disclosureBeforeFirstLink(`${DISC}${link("https://www.amazon.com/dp/B009F1SWH8")}`), true);
  assert.equal(disclosureBeforeFirstLink(`${link("https://www.amazon.com/dp/B009F1SWH8")}${DISC}`), false);
  assert.equal(disclosureBeforeFirstLink(link("https://www.amazon.com/dp/B009F1SWH8")), false);
  assert.equal(disclosureBeforeFirstLink("<p>no links</p>"), true);
});
