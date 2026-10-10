# Requirements: bugs and text errors to fix

Every bug comes with a concrete case. "ACME" means `SAMPLE_ACME_SOURCE`, created Oct 9, 2026, as in the user's screenshots.

## A. Deadline and dates

| ID | File | Bug | Concrete case |
|---|---|---|---|
| BUG-01 | lib/ai/service.ts:783, lib/ai/validation.ts:256 | The deadline regex has no word boundaries, so `may` matches inside "maybe". `by [a-z]+` matches "by email" and "nearby". | ACME → deadline **"May"**, evidence `"may"` (screenshot). The message says "before the middle of October". |
| BUG-02 | components/brief/create-brief-canvas.tsx:126, lib/ai/prompts.ts:111 | `createdDate` comes from the UTC date but `weekday` comes from local time. | Dhaka at 02:00 Oct 10 sends `2026-10-09` with "Saturday", so relative dates resolve against the wrong day. |
| BUG-03 | app/api/briefs/route.ts | `createdDate` from the client is used without any check. | Sending `createdDate: "hello"` makes `formatStandardDate` silently fall back to today and the date math goes wrong. |
| BUG-04 | lib/ai/service.ts | The fallback never resolves the date window, so line 2 is filler text. | "Target timeline derived from client message (may)…" |

## B. Deterministic fallback content (what the screenshots show)

| ID | Bug | Concrete case |
|---|---|---|
| BUG-05 | The sentence split also breaks on `:`. | "We need around five pages:" is cut off and the page list goes into a separate sentence. |
| BUG-06 | Deliverable labels are fixed per category, so two "page" sentences get the same label and validation V6 drops the second as a duplicate. | The page list (home, about, products, contact) and WhatsApp are dropped, and the brief is forced to NEEDS REVIEW. |
| BUG-07 | Only the first 6 sentences are read. | "look good on mobile" and "homepage to feel premium" are ignored. |
| BUG-08 | Keyword checks use `includes()`, so "app" matches inside "WhatsApp" and "if" inside "specific". Anything left over defaults to the **Pages** group. | "We already have the logo…" ends up as **Pages → "Core functional scope"**. |
| BUG-09 | The goal is just the first sentence, and the summary is the same boilerplate for every brief. | Project goal reads "Hey, can you make us a website…". Every dashboard card shows "The client provided initial specifications…". |
| BUG-10 | The "Extracted requirements" key fact is counted before validation drops items. | "5 deliverables" at a glance vs "3 deliverables" in section 2. |
| BUG-11 | Ambiguities, questions and risks are hardcoded and can contradict the message. | A2 says copy and graphics are "not mentioned", but the message says the logo is ready and product images are in progress. Every brief gets 5 questions and 4 risks. |
| BUG-12 | Without a title hint, the title is the first 5 words plus "Intake Specification". | "Hey can you make us Intake Specification" |
| BUG-13 | Conditional ("maybe") features are listed as deliverables. The prompt's Rule 3 says they belong in "Pending client decision". | "Also maybe WhatsApp integration…" |

## C. AI path and validation

| ID | File | Bug | Concrete case |
|---|---|---|---|
| BUG-14 | lib/ai/service.ts:116-166 | A missing key or a Gemini failure falls back silently. Nothing in the brief says so. | The user's screenshots: fallback output looks like an AI brief. |
| BUG-15 | lib/ai/validation.ts:225 | V8 requires 5–10 ambiguities, but the prompt never asks for a count. | A good Gemini brief with 4 ambiguities is still marked NEEDS REVIEW. |
| BUG-16 | lib/ai/validation.ts:194 | An empty question text makes `includes("")` true, so every ambiguity gets a duplicate-question warning. | Question text `""` gives N false V6 issues. |
| BUG-17 | lib/ai/service.ts:277-280 | Legacy scores use `||` defaults, so a real score of 0 is replaced with 14, 9 or 6. | A timeline score of 0 shows as 59% timeline clarity. |
| BUG-18 | lib/ai/service.ts:177 | The brief id is `Date.now().toString(36).substring(0,6)`, which only changes every ~1.3 s. | Two briefs built within about a second get the same id, and the second overwrites the first in localStorage. |

## D. API responses

| ID | File | Bug | Concrete case |
|---|---|---|---|
| BUG-19 | lib/ai/service.ts:1080, app/api/briefs/regenerate/route.ts | With no key the service returns `{success:true}`, and on a Gemini error `{success:false}`. In both cases the route sends HTTP 200 `success:true`. | The client shows "regenerated!" and nothing has changed. |
| BUG-20 | lib/ai/prompts.ts:152, service.ts | The regenerate prompt never states the output shape, uses today's date instead of the brief's date, and its output skips validation. | Regenerated items can carry quotes that are not in the source, and relative dates resolve to the wrong day. |
| BUG-21 | lib/ai/service.ts:1109 | Without a key, or on failure, the client-ready document is the literal placeholder "Client-Ready Overview generated from brief." | The Client Brief modal shows only that sentence. |
| BUG-22 | create-brief-canvas.tsx:150 | Calls `await res.json()` on an error response that may be HTML. | A 504 or 413 page throws "Unexpected token <" instead of a readable error. |

## E. Display, export and share

| ID | File | Bug | Concrete case |
|---|---|---|---|
| BUG-23 | dashboard-view.tsx:233 | Clarity defaults to 85 when the score is 0 or missing (`|| 85`). | A brief with score 0 shows "85% clear". |
| BUG-24 | dashboard-view.tsx:221,226 | Counts prefer the legacy arrays over the structured ones. | After regeneration the cards show stale counts. |
| BUG-25 | dashboard-view.tsx | The label says "Verified" while the brief page says "EVIDENCE CHECKED". "Verified" reads as "approved". | "text test 2" shows VERIFIED at 45% clear. |
| BUG-26 | dashboard-view.tsx:195 | `{filtered.length} briefs in workspace` gives "1 briefs" and reports the filtered count as the workspace total. | Filter "Needs Review": "9 briefs in workspace" when there are 14. |
| BUG-27 | dashboard-view.tsx:122 | Guests always see "GOOD MORNING." | At 11 pm it still says "GOOD MORNING." |
| BUG-28 | brief-view.tsx | The footer always says "Quotes verified against client communication", even when the status is NEEDS REVIEW. | Contradicts the badge. |
| BUG-29 | brief-view.tsx | The "Not mentioned, excluded unless confirmed" group has no empty state. | An empty bordered box. |
| BUG-30 | brief-view.tsx | Client-ready text is cached across briefs. | Open Client Brief on brief A, switch to B, and you see A's text. |
| BUG-31 | lib/export-pdf.ts:122-127,222,237 | Deadline line 2 and key-fact values are cut to one line. | PDF: "Target timeline derived from client message" (cut off; see screenshot). |
| BUG-32 | lib/export-pdf.ts, brief-view.tsx, share/[id]/page.tsx | Legacy normalization is copied in 2 places and missing from the PDF. | Exporting a legacy brief (Nova, Orbit) gives empty sections 2–6. |
| BUG-33 | app/share/[id]/page.tsx:31 | An unknown id silently shows the ACME sample. | A recipient opens a share link and sees a different client's brief. |
| BUG-34 | create-brief-canvas.tsx | .docx is listed as accepted but read with `readAsText`, so binary ZIP junk is pasted into the message. | Uploading brief.docx fills the textbox with "PK\u0003\u0004…". |

## Reported, not changed (outside the allowed scope)

- R-1: `docs/supabase-schema.sql` declares `id UUID` with no `(id,user_id)` unique key, while the code upserts `brief_xxx` ids with `onConflict: "id,user_id"`. Your live DB must differ from the doc. Changing it touches the Supabase schema.
- R-2: Share links read only the sharer's localStorage, so they are not public. Making them public needs a Supabase read policy.
- R-3: The "regenerate section" handler in brief-view has no button. It is dead UI, though the README lists it as a feature.
- R-4: `components/landing/transformation-demo.tsx` is unused. It also says "346 characters" for a sample that is 420.
- R-5: The existing lint error `react-hooks/set-state-in-effect` in app/page.tsx is in the cloud-sync effect next to auth, so it is left as is.
