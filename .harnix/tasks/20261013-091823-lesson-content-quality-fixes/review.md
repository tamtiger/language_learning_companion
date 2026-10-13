# Sửa chất lượng nội dung bài học theo báo cáo rà soát

- **ID:** 20261013-091823-lesson-content-quality-fixes
- **Mode:** full
- **Status:** completed/finishing
- **Created:** 2026-10-13 09:18:23 +07:00
- **Updated:** 2026-10-13 09:40:55 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 9/9 met or waived |
| Required checks | 100% | 3/3 passed |
| Residual risks | 2 | rk-native-review: medium, rk-rubric-ids: low |

## Goal

Sửa toàn bộ các lỗi nội dung bài học đã nêu trong báo cáo rà soát (Blocker, Major, Minor) ở 46 mission và 6 bài pronunciation, và thêm test chống tái phát.

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): Mọi lỗi Blocker về trọng âm, IPA và đáp án tự mâu thuẫn trong báo cáo rà soát được sửa đúng và khớp IPA của chính bài.
- [x] `ac-2` (met): Không còn cụm đệm 'for the team', 'at work', 'right now' trong lựa chọn của bài tập, distractor được viết lại thành hiểu nhầm có thật và vẫn qua ngưỡng assessmentQuality.
- [x] `ac-3` (met): Mọi câu fill của vocabulary-review có gợi ý nghĩa hoặc acceptedAnswers để đáp án hợp lệ khác không bị chấm sai.
- [x] `ac-4` (met): transferPrompt khớp context transfer, số từ trong prompt khớp outputContract.maxWords và minSeconds khớp độ dài mẫu.
- [x] `ac-5` (met): modelResponse chỉ dùng dữ kiện có trong packet baseline và hội thoại nghe khớp model, đáp án và ghi chú.
- [x] `ac-6` (met): Các lỗi Major về tiếng Anh, dịch tiếng Việt, đáp án và thứ tự bài tập trong báo cáo được sửa.
- [x] `ac-7` (met): Các lỗi Minor về commonMistake, rubric, metadata, nhãn nội bộ và nhất quán thuật ngữ trong báo cáo được sửa.
- [x] `ac-8` (met): Bài pronunciation dạy lỗi đặc thù của người Việt và có thêm nội dung âm cuối -s/-es.
- [x] `ac-9` (met): Có test chống tái phát cho cụm đệm, gợi ý fill, transferPrompt, số từ và các lỗi đã ghim; toàn bộ test, lint và build đều pass.

## Required checks

- [x] `check-suite` (full): Toàn bộ test, lint và typecheck của dự án phải xanh — pass (2026-10-13 09:40:21 +07:00)
- [x] `chk-regression` (focused): chk-regression — pass (2026-10-13 09:39:16 +07:00)
- [x] `chk-content` (focused): chk-content — pass (2026-10-13 09:39:23 +07:00)

## Decisions

- **dc-keep-p0-pilot** — Nhãn p0-pilot trong workflowTags là cờ chức năng (evidenceContract, useTaskState), không phải nhãn nội bộ; giữ nguyên.
  - _Why:_ Báo cáo rà soát ban đầu nhầm; gỡ nhãn làm hỏng test pilot.

## Residual risks

- **rk-native-review** (medium) — Chưa có người bản ngữ hoặc giáo viên rà soát các câu mới; các mục 'cần xác nhận' trong báo cáo vẫn cần kiểm.
- **rk-rubric-ids** (low) — Không thêm tiêu chí rubric mới vì id rubric nằm trong digest hợp đồng chứng cứ (evidenceContract) và có test ghim; thêm tiêu chí accuracy cần một thay đổi hợp đồng có chủ đích.

## Evidence

- `chk-regression` — pass (2026-10-13 09:39:16 +07:00): npm test -- tests/content/contentRegression.test.ts — exit 0
- `chk-content` — pass (2026-10-13 09:39:23 +07:00): npm test -- tests/content — exit 0
- `check-suite` — pass (2026-10-13 09:40:21 +07:00): npm test — exit 0
