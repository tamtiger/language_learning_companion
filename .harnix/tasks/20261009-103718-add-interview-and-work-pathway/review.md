# Thêm lộ trình phỏng vấn và làm việc ở công ty nước ngoài

- **ID:** 20261009-103718-add-interview-and-work-pathway
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-12 08:15:17 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 3/3 met or waived |
| Required checks | 100% | 2/2 passed |

## Goal

Mục tiêu 5 được phủ: người học luyện được phỏng vấn bằng câu chuyện của chính mình và các tình huống làm việc.

## Non-goals

- Không thêm chấm nói tự động bằng AI

## Relevant paths

- `content/missions`
- `src/content`

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): Bộ mission phỏng vấn: tell me about yourself (B1), story bank cho behavioral, system design walkthrough, coding think-aloud, hỏi lại interviewer, đàm phán offer (B2).
- [x] `ac-2` (met): Bộ mission làm việc: nhận và góp feedback, performance review, 1:1, viết code review comment, small talk (workplace nói).
- [x] `ac-3` (met): Tất cả qua cổng chất lượng và không trùng kịch bản với mission khác.

## Required checks

- [x] `check-interview-content` (focused): Nội dung và cổng chất lượng lộ trình phỏng vấn — pass (2026-10-12 08:14:23 +07:00)
- [x] `check-suite` (full): Toàn bộ test của dự án (suite) — pass (2026-10-12 08:15:14 +07:00)

## Evidence

- `check-interview-content` — pass (2026-10-12 08:14:23 +07:00): npx vitest run tests/content/interviewPathway.test.ts — exit 0 _(1 earlier rerun not shown; see task.json for full history)_
- `check-suite` — pass (2026-10-12 08:15:14 +07:00): npm test — exit 0 _(1 earlier rerun not shown; see task.json for full history)_
