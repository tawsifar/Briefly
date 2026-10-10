# Briefly: Brief Generation Bug-Fix Milestone

## What This Is

Briefly turns a messy client message into a structured project brief (deadline, deliverables, ambiguities, questions, risks, clarity score) shown in the app, exported to PDF and shared by link. This milestone fixes the bugs and text errors in that generation pipeline and in every response it feeds.

## Core Value

A brief must never say something the client did not say. Wrong deadlines, dropped requirements and boilerplate that contradicts the message are the failures to remove.

## Requirements

### Active

See `.planning/REQUIREMENTS.md` (BUG-01 … BUG-34).

### Out of Scope

- **Supabase auth** (`lib/auth-context.tsx`, `lib/supabase/*`, `middleware.ts`, `app/auth/*`, auth UI in `components/layout/navbar.tsx`). The user asked for these to stay untouched. Verified at the end with an empty `git diff` on those paths.
- **Supabase schema and RLS** (`docs/supabase-schema.sql`, DB policies). Public share links and the doc/DB id mismatch are reported, not changed.
- **Landing marketing demos** (`components/landing/*`). These are static demos, not generation. Reported only.
- **New features.** No wiring of the unused "regenerate section" UI, no new test framework.

## Context

- Next.js 15 / React 19 / TypeScript. AI path: Gemini (`lib/ai/service.ts`) → Zod → `validateAndCleanBrief`. When Gemini is missing or fails, `generateGroundedFallback` builds the brief deterministically.
- **Root cause of the screenshots:** the "ACME Website Redesign" brief in the user's screenshots came from the deterministic fallback, not from Gemini. Running the fallback locally on the ACME sample reproduces it exactly ("May" from "maybe", 3 of 5 deliverables, boilerplate summary). The model id `gemini-3.8-flash` exists, so on the user's machine either `GEMINI_API_KEY` is missing or the Gemini call/parse is failing, and the app hides that.

## Constraints

- **Method (Ponytail):** make the smallest complete change and fix each root cause once in shared code. Delete duplicated code where possible, and add no new dependencies.
- **Method (GSD):** work in phases with atomic plans and one commit per plan. Every plan has grep-able acceptance criteria and a verification step.
- **Compatibility:** stored briefs, including the legacy `requirements`/`questions` fields and data in Supabase `brief_data`, must still render.

## Key Decisions

| Decision | Why |
|---|---|
| One shared deadline finder (`lib/ai/deadline.ts`) | The same broken regex was duplicated in service.ts and validation.ts. |
| Rewrite the fallback around keyword rules over *all* sentences, not "first 6 sentences" | The old approach dropped half the message and produced duplicate labels that validation then discarded. |
| Record `generated_by` on every brief and show a notice for fallback briefs | Silent fallback is why the user could not tell Gemini was not running. |
| One shared `normalizeBrief()` for the brief view, share page and PDF | Three near-copies had drifted, and the PDF ignored legacy briefs. |
