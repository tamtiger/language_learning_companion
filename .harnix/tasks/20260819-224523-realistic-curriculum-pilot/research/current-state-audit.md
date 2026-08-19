# Current-state curriculum audit

- Task: 20260819-224523-realistic-curriculum-pilot
- Date: 2026-08-19
- Scale: 1 weak, 2 limited, 3 credible, 4 high fidelity.
- Evidence boundary: ratings are repository/runtime audit signals, not proof of learning efficacy.

## Runtime evidence
- Black-box observed the app shell and a pronunciation lesson on localhost. The pronunciation flow exposed section navigation, 0/3 correct gate and disabled completion; this is a real observable completion contract.
- The external browser session disconnected when moving to a clean origin. Written, spoken and technical-reading end-to-end observations are therefore pending and must be repeated after implementation; they are not marked pass.
- Source inspection then confirmed CapabilityTask renders lesson.sections only in input, after baseline submission. The baseline page renders scenario and baselinePrompt but no source artifact or model.
- For all v3 missions, the source needed by the task lives in lesson.sections. Therefore baseline prompts such as “read the log”, “from the notes” or “explain the diagram” cannot be completed from supplied evidence.
- Transfer/review render only transferPrompt/reviewPrompt strings; no new source artifacts exist in the current contract.

## Post-implementation runtime evidence
- Automated DOM runtime now renders baseline controls for all 12 capability missions and canonical navigation for all six pronunciation lessons.
- The issue-update pilot runtime exposes only the checkout evidence packet at cold baseline, keeps instructional input/model/transfer evidence hidden, and exposes only the upload packet when transfer is resumed.
- The generic written loop completes baseline → input → performance → self-feedback → retry → transfer; a delayed review uses the third packet, and session output is absent from persisted progress.
- Spoken runtime exposes explicit timer-only start and measured positive duration; pronunciation still requires every auto-check before completion; technical-reading missions render their written baseline controls.
- The in-app browser transport disconnected (`Transport closed`) before a clean post-implementation desktop/mobile pass. A policy-protected Chrome fallback was not permitted. Therefore desktop/mobile black-box QA remains pending and is not counted as pass.

## Mission matrix

| Mission | Capability | Job | Artifact | Decision / gap | Scaffold | Transfer | Main evidence |
|---|---|---:|---:|---:|---:|---:|---|
| daily-standup-b1 | meetings | 4 | 2 | 3 | 3 | 3 | Personal work content is naturally authentic, but no supplied artifact and v2 transfer is a prompt only. |
| workplace-issue-update-b1 | workplace | 4 | 3 | 1 | 3 | 1 | Useful incident task, but baseline hides incident notes and transfer supplies only a summary. |
| workplace-clarification-request-b1 | workplace | 4 | 2 | 1 | 3 | 1 | Ambiguous ticket is realistic but hidden at cold attempt; answer-worthy ambiguity is already preselected. |
| technical-doc-action-b1 | reading | 4 | 3 | 1 | 3 | 1 | Plausible runbook, but cold attempt cannot see it and transfer paraphrases a second runbook in one sentence. |
| technical-log-diagnosis-b1 | reading | 4 | 3 | 2 | 3 | 1 | Log signal/noise is useful; only four lines and no baseline artifact/varied transfer evidence. |
| meeting-disagree-and-recap-b2 | meetings | 4 | 2 | 2 | 3 | 2 | Stakes and disagreement exist, but no interactive turn or changing information. |
| technical-tradeoff-explanation-b2 | explanation | 4 | 3 | 2 | 3 | 2 | Constraints are credible but fully summarized; transfer has no decision artifact. |
| architecture-walkthrough-b2 | explanation | 4 | 2 | 1 | 2 | 1 | Diagram is a one-line text and hidden at baseline; no audience questions. |
| technical-interview-decision-b2 | interview | 4 | 2 | 2 | 3 | 2 | STAR/ownership target is relevant; supplied notes and transfer constrain real autobiographical variation. |
| behavioral-interview-ownership-b2 | interview | 4 | 1 | 2 | 3 | 2 | Weak-answer critique is useful but model may dominate; no interviewer follow-up. |
| learn-api-from-docs-b2 | technology | 4 | 3 | 1 | 3 | 1 | Good API concepts, but quickstart is hidden at baseline and new API transfer is compressed into one sentence. |
| technology-troubleshooting-from-docs-b2 | technology | 4 | 2 | 2 | 3 | 1 | Safe experiment is relevant; source is tiny and transfer lacks actual docs/config. |

## Cross-cutting facts
- Exactly 12 capability missions: 11 v3 plus Daily Standup v2.
- Every v3 mission has one source section and one auto-check.
- V3 source length ranges from 97 to 460 characters.
- Current transfer evidence can check output length, time, self-rubric and independence flags, but cannot establish factual correctness.
- The two missions per capability cover different topics, but most do not implement an explicit progression in artifact count, ambiguity, audience pressure or scaffold fading.

## Capability/job map

| Capability | Target job output | Main current gap | Pilot/rollout direction |
|---|---|---|---|
| Workplace communication | issue update, clarification, handoff | no cold-attempt evidence set | multi-artifact issue update with named audience/owner |
| Technical reading | safe checklist, evidence-based diagnosis | short cleaned source; no varied transfer artifact | runbook/log bundle after pilot proves context contract |
| International meetings | standup, disagreement, recap | no interlocutor turn or new evidence | later scripted turn cards; not first pilot |
| Technical explanation | trade-off recommendation, walkthrough | diagrams/constraints over-summarized | decision packet and audience question |
| International interview | ownership/decision story | limited follow-up and calibration | interviewer probe cards; learner-owned story |
| Technology learning | mental model, experiment plan | transfer has no fresh docs/config | new API/doc artifact in each context |

## Prioritized findings
1. S1 — Impossible evidence-based baseline for v3: source is hidden until after submission. High frequency (11 missions), direct integrity impact.
2. S1 — Transfer/review lack unseen artifacts: learner can reuse the learned template without selecting new evidence.
3. S2 — One short, cleaned source per mission: weak information-gap and uncertainty handling.
4. S2 — Self-rubric cannot verify factual accuracy; it must remain reflection, not mastery evidence.
5. S2 — Progression is topical more than difficulty-controlled.
6. S3 — Spoken/meeting tasks have no scripted interlocutor response.

## Facts, interpretations and hypotheses
- Fact: rendering order and JSON structure create the baseline/source mismatch.
- Fact: no free-text learner output is persisted.
- Interpretation: current transfer primarily measures structured production and self-report, not evidence selection.
- Hypothesis: phase-specific varied artifacts will improve task comprehension and unseen transfer; real learners are required to test this.
- Not tested: three-person learner usability study, real delayed retention and physical microphone behavior.