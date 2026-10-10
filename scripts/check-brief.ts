// Assert-based self-check for brief generation. Run: npx tsx scripts/check-brief.ts
import assert from "node:assert/strict";
import { findDeadline } from "../lib/ai/deadline";
import { generateBrief } from "../lib/ai/service";
import { SAMPLE_ACME_SOURCE } from "../lib/sample-data";

const D = "2026-10-09";

// BUG-01: "maybe" must never become the month May
const acme = findDeadline(
  "Hey, can you make us a website kind of like Apple but maybe darker? We want it before the middle of October.",
  D
);
assert.equal(acme?.wording, "before the middle of October");
assert.equal(acme?.start, "2026-10-11");
assert.equal(acme?.end, "2026-10-20");
for (const noDate of ["maybe darker", "May I ask a question?", "send it by email", "a shop nearby", "it may be useful"]) {
  assert.equal(findDeadline(noDate, D), null, `false deadline in: ${noDate}`);
}
assert.equal(findDeadline("launch by May 5", D)?.start, "2027-05-05");
assert.equal(findDeadline("ready in May please", D)?.wording, "in May");
assert.equal(findDeadline("about the end of October", D)?.end, "2026-10-31");
assert.equal(findDeadline("soft launch in 3 weeks", D)?.start, "2026-10-30");
assert.equal(findDeadline("first week of next month", D)?.start, "2026-11-01");
assert.equal(findDeadline("we need it by Friday", D)?.start, "2026-10-16");
assert.equal(findDeadline("mid-November would be great", D)?.start, "2026-11-11");

console.log("deadline checks passed");

// BUG-05..13: the ACME sample through the offline generator
async function checkAcme() {
  delete process.env.GEMINI_API_KEY;
  const { brief, validation } = await generateBrief({ text: SAMPLE_ACME_SOURCE, createdDateStr: D, weekdayStr: "Friday" });
  const labels = (brief.structuredDeliverables ?? []).map((d) => d.label);
  for (const l of ["Home page", "About page", "Products page", "Contact page", "Mobile-friendly layout", "Homepage look and feel"]) {
    assert.ok(labels.includes(l), `missing deliverable ${l}`);
  }
  assert.equal(new Set(labels).size, labels.length, "duplicate deliverable labels");
  assert.ok(!labels.some((l) => /whatsapp/i.test(l)), "conditional WhatsApp must not be a deliverable");
  const pendingLabels = (brief.structuredOutOfScope ?? []).filter((o) => o.group === "Pending client decision").map((o) => o.label);
  assert.ok(pendingLabels.includes("WhatsApp integration"));
  assert.ok(!validation.issues.some((i) => /^V[26]:/.test(i)), `grounding issues: ${validation.issues}`);
  assert.equal(brief.targetDeadline?.displayLine1, "Before the middle of October");
  assert.ok(!/client provided initial specifications/i.test(brief.executiveSummary!.paragraph));
  assert.ok(!(brief.structuredAmbiguities ?? []).some((a) => /does not mention whether copy and graphics/i.test(a.whatIsUnclear)));
  const countFact = brief.executiveSummary!.keyFacts.find((f) => f.label === "Confirmed deliverables")!.value;
  assert.ok(countFact.endsWith(`of ${labels.length}`), "key fact count must match section 2");
  assert.equal(brief.title, "Apple-Inspired Website Project");
  console.log("ACME fallback checks passed");
}
checkAcme();

// BUG-14/16/18: fallback is reported, ids are unique
(async () => {
  delete process.env.GEMINI_API_KEY;
  const a = await generateBrief({ text: "Need a logo", createdDateStr: D });
  const b = await generateBrief({ text: "Need a logo", createdDateStr: D });
  assert.notEqual(a.brief.id, b.brief.id);
  assert.equal(a.brief.generated_by, "fallback");
  assert.match(a.brief.generation_note ?? "", /GEMINI_API_KEY is not set/);
  assert.equal(a.brief.status, "NEEDS REVIEW");
  console.log("generation-mode checks passed");
})();

// BUG-19/21: honest API results without a key
import { regenerateBriefSection, buildClientReadyMarkdown } from "../lib/ai/service";
import { SAMPLE_ACME_BRIEF } from "../lib/sample-data";
(async () => {
  delete process.env.GEMINI_API_KEY;
  const r = await regenerateBriefSection("questions", SAMPLE_ACME_SOURCE, "{}");
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.status, 503);
  const md = buildClientReadyMarkdown(SAMPLE_ACME_BRIEF);
  assert.match(md, /^# ACME Website Redesign/);
  assert.match(md, /## Questions for You/);
  assert.ok(!/risk/i.test(md), "client-ready must not expose risks");
  console.log("API response checks passed");
})();
