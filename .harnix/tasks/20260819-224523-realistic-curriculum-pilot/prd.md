# PRD — Realistic curriculum pilot

## Outcome
Ship an evidence-backed pilot for workplace issue updates where a learner extracts relevant signals from realistic incident artifacts, writes for a named audience, calibrates against an evidence-safe model, retries, and transfers to a genuinely new artifact set.

## Selected bottleneck
All v3 missions hide lesson source sections until after baseline, yet most baseline prompts require facts from those sources. The learner must fabricate a baseline rather than perform the target task. Transfer and review provide only one sentence instead of new evidence, so they test template reuse more than signal selection.

## Pilot
Rewrite workplace-issue-update-b1 and add optional generic performanceTask.practiceContexts:
- baseline: role/audience/stakes plus 2–4 source artifacts available before the cold attempt;
- transfer: a different incident and artifact set shown only at transfer;
- review: a third artifact set shown only when delayed review is due.

Instructional lesson.sections remain hidden until input and teach the reusable workflow: facts versus hypotheses, impact, owner/action, explicit request. Existing missions without practiceContexts keep current behavior.

## In scope
Schema/parser validation, generic CapabilityTask rendering, one pilot mission, focused/full/manual evidence, and owner docs.

## Non-goals
No bulk rewrite, branching conversation engine, AI grader, cloud/account/analytics, learner-output persistence, storage migration, efficacy claim, commit, push, publish, or PR.

## Acceptance criteria

### AC `AC-1`
Audit scores all 12 missions and records honest black-box evidence for written, spoken, technical-reading and pronunciation flows, separating observations from hypotheses.

### AC `AC-2`
Task research answers the material design question with authoritative sources, source log, limitations, facts, inferences and a plan-changing decision.

### AC `AC-3`
The issue-update mission runs with realistic phase-specific artifacts, audience, stakes, information gap, observable deliverable, scaffold fading, retry, varied transfer and delayed review.

### AC `AC-4`
Cold-attempt/model separation, local-only privacy and ProgressEnvelopeV3 integrity remain intact; no learner response, transcript or audio persists or exports.

### AC `AC-5`
Focused/full tests, lint, production build and black-box desktop/mobile pilot flow pass with fresh evidence.

### AC `AC-6`
PRODUCT, CONTENT, README, START_HERE and CHANGELOG describe the pilot, measured evidence, limitations and rollout gate without efficacy overclaim.

## Contract
A practice context has title, brief and 1–4 source artifacts with IDs unique inside the context. practiceContexts is optional, but when present baseline, transfer and review are all required. Context is bundled content and never stored in progress.

## Rollout gate
Do not add practiceContexts to other missions until expert walkthrough and real learner tests show that users can identify the deliverable, select relevant signals and complete unseen transfer without facilitator explanation.