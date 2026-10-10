# Roadmap: Brief Generation Bug-Fix Milestone

## Overview

There are five phases, ordered by dependency. The deadline finder comes first because both the fallback and validation use it. Next comes the fallback rewrite, which removes most of the screenshot bugs. The last three phases fix the AI path, the API responses and the screens that display them. Every plan ends in one atomic commit.

## Phases

- [x] **Phase 1: Deadline and dates**: one word-bounded deadline finder with window resolution, plus consistent created dates
- [x] **Phase 2: Grounded fallback**: rewrite `generateGroundedFallback` so its output is grounded, complete and non-contradictory
- [x] **Phase 3: AI path and validation**: report fallback briefs, align validation with the prompt, use safe ids and scores
- [x] **Phase 4: API responses**: correct status codes for regenerate and client-ready, a real offline client-ready document, safe error parsing
- [x] **Phase 5: Display, export and share**: one shared normalizer, plus text fixes in the dashboard, brief view, PDF and share page

## Phase Details

### Phase 1: Deadline and dates
**Goal**: The deadline shown always comes from a real time expression in the message.
**Depends on**: Nothing
**Requirements**: BUG-01, BUG-02, BUG-03, BUG-04
**Success Criteria**:
  1. ACME gives "Before the middle of October" with Oct 11 to Oct 20, 2026, not "May".
  2. "maybe", "may I", "by email" and "nearby" never produce a deadline.
  3. createdDate and weekday describe the same calendar day.
**Plans**: 01-01

### Phase 2: Grounded fallback
**Goal**: A fallback brief reads like a brief about *this* message.
**Depends on**: Phase 1
**Requirements**: BUG-05 … BUG-13
**Success Criteria**:
  1. ACME lists the Home, About, Products and Contact pages, mobile-friendly layout, premium homepage and the logo/images, with no duplicate drops.
  2. WhatsApp and the customer area appear under Pending client decision and as ambiguities, not as Confirmed.
  3. No ambiguity contradicts the message, and the question and risk counts vary with the input.
  4. The key-fact deliverable count equals the section 2 count.
**Plans**: 02-01

### Phase 3: AI path and validation
**Goal**: The user can tell AI briefs from fallback briefs, and validation only flags real problems.
**Depends on**: Phase 2
**Requirements**: BUG-14 … BUG-18
**Plans**: 03-01

### Phase 4: API responses
**Goal**: Every API returns the truth: an HTTP error when nothing was generated, and useful content offline.
**Depends on**: Phase 3
**Requirements**: BUG-19 … BUG-22
**Plans**: 04-01

### Phase 5: Display, export and share
**Goal**: The dashboard, brief page, PDF and share page show the same numbers and honest labels.
**Depends on**: Phase 3
**Requirements**: BUG-23 … BUG-34
**Plans**: 05-01

## Progress

| Phase | Plans | Status |
|---|---|---|
| 1 | 1/1 | Complete |
| 2 | 1/1 | Complete |
| 3 | 1/1 | Complete |
| 4 | 1/1 | Complete |
| 5 | 1/1 | Complete |
