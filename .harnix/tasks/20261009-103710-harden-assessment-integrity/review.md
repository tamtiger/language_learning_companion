# Siết toàn vẹn bài kiểm tra: xáo trộn, chấm điểm, cổng chất lượng đáp án

- **ID:** 20261009-103710-harden-assessment-integrity
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** planning/planning
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 10:48:14 +07:00

**Verdict:** PENDING — 0/5 acceptance criteria met

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 0% | 0/5 met or waived |
| Required checks | 0% | 0/4 passed |

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

## Acceptance criteria

- [ ] `ac-1` (pending): Thứ tự lựa chọn của choice, perception và reading ladder được xáo trộn xác định theo seed (id item + lượt làm); đáp án đúng không còn cố định ở vị trí đầu (hiện 91/96 item perception/ladder đúng ở options[0]).
- [ ] `ac-2` (pending): Bài ordering và matching không hiển thị sẵn theo đúng đáp án (technical-doc-action-b1 runbook-recovery-order, pronunciation-shadowing-routine).
- [ ] `ac-3` (pending): Chấm fill chuẩn hóa NFC, nháy cong/thẳng, hoa thường, dấu câu cuối và hỗ trợ acceptedAnswers; câu q3 của pronunciation-sounds không còn phụ thuộc ký tự U+02C8.
- [ ] `ac-4` (pending): Cổng nội dung tự động chặn: phân bố vị trí đáp án lệch, đáp án đúng luôn là lựa chọn dài nhất (hiện 74%), perception/ladder dưới 3 lựa chọn, distractor lặp từ khóa của audio.
- [ ] `ac-5` (pending): Toàn bộ item perception/ladder và choice hiện có được viết lại (3-4 lựa chọn, distractor hợp lý) để vượt cổng ở tiêu chí 4.

## Required checks

- [ ] `check-option-order` (focused): Xáo trộn lựa chọn, ordering và matching — chưa chạy / not yet run
- [ ] `check-grading` (focused): Chuẩn hóa chấm fill — chưa chạy / not yet run
- [ ] `check-assessment-gate` (focused): Cổng chất lượng đáp án và nội dung viết lại — chưa chạy / not yet run
- [ ] `check-suite` (full): Toàn bộ test của dự án (suite) — chưa chạy / not yet run

## Evidence

_None recorded yet._
