# Learning-design decision

- Task: 20260819-224523-realistic-curriculum-pilot
- Date/access date: 2026-08-19
- Material unknown: For a local-only app without teacher/AI grading, should the pilot primarily add more model scaffolding, multi-signal job artifacts and decisions, or a branching conversation?

## Repository evidence
All v3 missions hide source until after baseline; each has one short source and one auto-check. Transfer/review have no new artifact. The app can reliably render content and track phase/metadata but cannot validate open-ended factual correctness.

## Source log

### Council of Europe — CEFR Companion Volume and action-oriented approach
URL: https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions
Supporting paper: https://rm.coe.int/0900001680a88678
Type/population: official European language-learning framework and implementation analysis; broad adult/education context.
Claim: action-oriented curricula start from needs analysis and real-life tasks, integrating context, purpose, texts and observable “can do” action.
Limit: framework guidance, not an experiment with Vietnamese software engineers.
Fact: the framework explicitly shifts from linear language structures toward needs-based real-life tasks.
Inference: a job deliverable plus audience and evidence is a better curriculum unit than one extra language explanation.
Recommendation: represent the target incident task and artifacts before expanding generic language content.

### Lambert 2010 — A task-based needs analysis: Putting principles into practice
DOI: https://doi.org/10.1177/1362168809346520
Accessible record: https://cir.nii.ac.jp/crid/1360298764259027328
Type/population: empirical needs analysis of graduates across work/life domains.
Claim: triangulating employment records, interviews and surveys can identify target task types and successful performance criteria; broad labels require probing into concrete target tasks.
Limit: graduates and heterogeneous workplaces, not software engineering or app efficacy.
Fact: concrete target tasks were more useful than generic activities such as “making reports.”
Inference: “write an update” must specify incident evidence, audience, owner and decision pressure.
Recommendation: design the pilot around a concrete incident handoff rather than a generic prose prompt.

### Butler, Black-Maier, Raley & Marsh 2017 — Varied retrieval and transfer
DOI: https://doi.org/10.1037/xap0000142
Institutional record: https://scholars.duke.edu/publication/1292911
Type/population: four controlled experiments using geology concepts; delayed test after two days.
Claim: retrieving/applying the same concept across different examples produced better transfer to new examples than repeating the same example.
Limit: conceptual science learning, not L2 workplace writing; direction supports a design hypothesis, not guaranteed effect here.
Fact: varied application improved novel-example transfer in all four reported experiments.
Inference: transfer/review should contain genuinely different evidence sets, not a one-line paraphrase of the model scenario.
Recommendation: require baseline, transfer and review contexts with different artifacts but the same communication workflow.

### Burnell, Pratt, Berg & Smith 2023 — Feedback for L2 writing
DOI: https://doi.org/10.1016/j.stueduc.2023.101291
Institutional record: https://ourarchive.otago.ac.nz/esploro/outputs/journalArticle/The-influence-of-three-approaches-to/9926495418601891
Type/population: randomized instructional study, 114 Chinese-speaking tertiary L2 English learners.
Claim: rubric and exemplar conditions improved performance/learning relative to control; self-assessment alone did not.
Limit: academic essay task and different population; abstract-level result does not select the exact UI.
Fact: self-assessment-only treatment was not effective in that study while rubrics and exemplars were.
Inference: this app should not treat self-rubric as sufficient feedback or mastery evidence.
Recommendation: keep post-attempt rubric plus evidence-safe exemplar, and add deterministic content checks where possible; do not add more pre-attempt model exposure.

### Google SRE Workbook — Incident Response
URL: https://sre.google/workbook/incident-response/
Type/population: authoritative practitioner documentation and incident case studies.
Claim: incident work separates command, operations and communication; communication leads give periodic stakeholder updates; incident channels record actions, owners and timestamps; drills use realistic scenarios and time pressure.
Limit: SRE practice at Google/PagerDuty may be more formal than small teams.
Fact: real incident communication aggregates changing signals across roles/channels rather than paraphrasing one narrative.
Inference: the issue-update pilot should expose monitoring, channel and ownership/handoff artifacts with some uncertainty.
Recommendation: use a synthetic incident packet and named communication role, without copying proprietary incident data.

## Option comparison
- More model/scaffold first: low runtime cost, but does not fix impossible baseline and may increase copying. Rejected as primary mechanism.
- Multi-signal job contexts: fixes baseline integrity, supports varied transfer, is generic across reading/explanation/technology missions, and needs a small additive schema/UI change. Selected.
- Branching conversation: high value for meetings, but introduces new interaction state and is less reusable for the shared source problem. Defer to a later pilot.

## Decision
Add optional phase-specific practiceContexts to the v3 performance task and pilot it on workplace-issue-update-b1. Keep instructional source/model after baseline. Show fresh artifacts only at baseline, transfer and delayed review. Do not change progress storage.

## Confidence and remaining uncertainty
Confidence: high that current baseline is invalid and that the selected mechanism improves task fidelity; moderate that varied artifacts improve learning transfer for this population.
Remaining trigger: expert Software Engineer walkthrough and at least three target learners must confirm artifact plausibility, comprehension and transfer before bulk rollout.