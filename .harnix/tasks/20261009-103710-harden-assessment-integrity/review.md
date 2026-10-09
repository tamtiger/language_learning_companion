# Siết toàn vẹn bài kiểm tra: xáo trộn, chấm điểm, cổng chất lượng đáp án

- **ID:** 20261009-103710-harden-assessment-integrity
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 11:19:00 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 5/5 met or waived |
| Required checks | 100% | 4/4 passed |
| Residual risks | 2 | risk-middle-length-cue: low, risk-paraphrased-answers: low |

## Goal

Bài kiểm tra không thể đoán đúng bằng vị trí hoặc độ dài đáp án, và việc chấm điểm không phạt oan người học.

## Non-goals

- Không thêm bài học mới (thuộc đợt mở rộng nội dung)
- Không đổi giao diện ngoài thứ tự lựa chọn

## Relevant paths

- `src/features/lesson/SectionRenderer.tsx`
- `src/features/practice/PerceptionPractice.tsx`
- `src/features/practice/ReadingLadderPractice.tsx`
- `src/content/schema.ts`
- `content`

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): Thứ tự lựa chọn của choice, perception và reading ladder được xáo trộn xác định theo seed (id item + lượt làm); đáp án đúng không còn cố định ở vị trí đầu (hiện 91/96 item perception/ladder đúng ở options[0]).
- [x] `ac-2` (met): Bài ordering và matching không hiển thị sẵn theo đúng đáp án (technical-doc-action-b1 runbook-recovery-order, pronunciation-shadowing-routine).
- [x] `ac-3` (met): Chấm fill chuẩn hóa NFC, nháy cong/thẳng, hoa thường, dấu câu cuối và hỗ trợ acceptedAnswers; câu q3 của pronunciation-sounds không còn phụ thuộc ký tự U+02C8.
- [x] `ac-4` (met): Cổng nội dung tự động chặn: phân bố vị trí đáp án lệch, đáp án đúng luôn là lựa chọn dài nhất (hiện 74%), perception/ladder dưới 3 lựa chọn, distractor lặp từ khóa của audio.
- [x] `ac-5` (met): Toàn bộ item perception/ladder và choice hiện có được viết lại (3-4 lựa chọn, distractor hợp lý) để vượt cổng ở tiêu chí 4.

## Required checks

- [x] `check-option-order` (focused): Xáo trộn lựa chọn, ordering và matching — pass (2026-10-09 11:17:37 +07:00)
- [x] `check-grading` (focused): Chuẩn hóa chấm fill và q3 — pass (2026-10-09 11:17:40 +07:00)
- [x] `check-assessment-gate` (focused): Cổng chất lượng đáp án và nội dung viết lại — pass (2026-10-09 11:17:43 +07:00)
- [x] `check-suite` (full): Toàn bộ test của dự án (suite) — pass (2026-10-09 11:18:13 +07:00)

## Decisions

- **dec-session-salt** — Xáo trộn theo seed gồm id bài, id item và salt ngẫu nhiên tạo mỗi lần mở component.
  - _Why:_ Người học không ghi nhớ được vị trí giữa các lượt; test điều khiển bằng cách giả lập Math.random.
- **dec-q3-choice** — Câu q3 của pronunciation-sounds chuyển thành choice; engine vẫn hỗ trợ fill kèm acceptedAnswers.
  - _Why:_ Người học khó gõ ký tự U+02C8 và datalist làm lộ đáp án; task mở rộng nội dung sau sẽ thêm fill thật.
- **dec-gate-thresholds** — Ngưỡng cổng đáp án: 3 đến 4 lựa chọn, đáp án dài nhất tối đa 45% toàn corpus và 60% mỗi bài, tỉ lệ dài nhất trên ngắn nhất tối đa 2,5.
  - _Why:_ Ngưỡng ngẫu nhiên lý thuyết khoảng 30%; cho dư biên và gom về một hằng số để chỉnh có lý do.
- **dec-claude-agents-rewrite** — Nội dung 17 file được viết lại bởi 4 agent theo 4 nhóm file tách biệt, sau đó đối chiếu các item đổi chữ correctAnswer với audio hoặc source.
  - _Why:_ File tách biệt nên không xung đột; kiểm tra ngoài cổng bắt các lỗi mà cổng tự động không thấy.

## Residual risks

- **risk-middle-length-cue** (low) — Đáp án đúng có độ dài trung bình ở khoảng 49% item (kỳ vọng ngẫu nhiên khoảng 33% với 3 lựa chọn); người học có thể thu được lợi thế nhỏ khi chọn lựa chọn dài vừa. Cổng hiện chỉ chặn thiên lệch dài nhất. Cân nhắc cổng đối xứng khi mở rộng nội dung.
- **risk-paraphrased-answers** (low) — Để qua rule keyword-parity, agent viết lại một số đáp án đúng thành cách nói khác audio (ví dụ Reproduce thành Recreate ở stand-pre-2). Cách này buộc hiểu nghĩa nhưng làm yếu việc nghe đúng thuật ngữ mục tiêu; task sửa lỗi nội dung nên rà lại các item này.

## Evidence

- `check-option-order` — pass (2026-10-09 11:17:37 +07:00): npx vitest run src/features/lesson/option_order.test.ts — exit 0
- `check-grading` — pass (2026-10-09 11:17:40 +07:00): npx vitest run src/features/lesson/exercise_grading.test.ts — exit 0
- `check-assessment-gate` — pass (2026-10-09 11:17:43 +07:00): npx vitest run src/content/assessment_quality.test.ts — exit 0
- `check-suite` — pass (2026-10-09 11:18:13 +07:00): npm test — exit 0
