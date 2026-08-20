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

## Bằng chứng runtime sau triển khai
- Desktop Chrome ở viewport 1920×855 không có horizontal overflow. Cold baseline của pilot hiển thị đúng ba artifact checkout, không hiển thị instructional input, model response hoặc transfer evidence.
- Sau khi lưu baseline, UI chỉ mở scaffold F-I-A-R và auto-check. Reload quay lại đúng phase `input`; câu trả lời baseline duy nhất của phiên không được phục dựng hoặc hiển thị lại.
- Flow thực tế hoàn tất `baseline → input → performance → self-feedback → retry → transfer`. Model chỉ xuất hiện sau performance; một criterion `not-met` bắt buộc chọn retry focus; retry giữ output trước đó trong session.
- Transfer chỉ hiển thị bộ artifact upload, không còn artifact checkout hoặc model. Lượt transfer hoàn tất trên viewport mobile 390×844, không horizontal overflow. Progress hiển thị 4 attempts, 1 transfer attempt và 1 qualifying transfer.
- Spoken Daily Standup hiển thị timer-only fallback, đo 1 giây thật, cho phép lưu baseline và chuyển sang input mà không cần microphone permission.
- Technical-reading baseline render đúng written task/textbox và vẫn không có source hoặc model; đây là bằng chứng black-box xác nhận gap còn lại ở các mission chưa rollout `practiceContexts`.
- Pronunciation flow chuyển từ 0/3 với nút Finish disabled sang 3/3 với Finish enabled và màn hình hoàn thành sau khi trả lời đúng cả ba auto-check.
- Không có console error từ origin của app; warning quan sát được đến từ browser extension bên thứ ba, không phải ứng dụng.
- Chưa đo: learner usability với ba người dùng mục tiêu, expert walkthrough, delayed retention thực tế và microphone vật lý.

## Mission matrix

| Mission | Capability | Job | Artifact | Decision / gap | Scaffold | Transfer | Main evidence |
|---|---|---:|---:|---:|---:|---:|---|
| daily-standup-b1 | meetings | 4 | 2 | 3 | 3 | 3 | Personal work content is naturally authentic, but no supplied artifact and v2 transfer is a prompt only. |
| workplace-issue-update-b1 | workplace | 4 | 4 | 4 | 4 | 4 | Pilot cung cấp ba artifact cho cold baseline, scaffold F-I-A-R, retry focus và bộ artifact khác cho transfer/review. |
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
1. S1 — Mười mission v3 chưa rollout vẫn có baseline dựa trên source bị ẩn đến sau submission; pilot issue-update đã sửa gap này.
2. S1 — Mười mission v3 chưa rollout vẫn thiếu artifact mới cho transfer/review; learner có thể tái dùng template mà không chọn evidence mới.
3. S2 — One short, cleaned source per mission: weak information-gap and uncertainty handling.
4. S2 — Self-rubric cannot verify factual accuracy; it must remain reflection, not mastery evidence.
5. S2 — Progression is topical more than difficulty-controlled.
6. S3 — Spoken/meeting tasks have no scripted interlocutor response.

## Facts, interpretations and hypotheses
- Fact: pilot issue-update đã sửa baseline/source mismatch; mười mission v3 còn lại vẫn dùng source trong phase input.
- Fact: no free-text learner output is persisted.
- Interpretation: current transfer primarily measures structured production and self-report, not evidence selection.
- Hypothesis: phase-specific varied artifacts will improve task comprehension and unseen transfer; real learners are required to test this.
- Not tested: three-person learner usability study, real delayed retention and physical microphone behavior.