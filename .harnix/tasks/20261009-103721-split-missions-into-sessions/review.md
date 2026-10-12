# Chia mission thành các phiên học ngắn có checkpoint

- **ID:** 20261009-103721-split-missions-into-sessions
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-12 08:54:30 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 3/3 met or waived |
| Required checks | 100% | 2/2 passed |

## Goal

Một dev có 10-15 phút vẫn hoàn thành một phiên có ý nghĩa và quay lại không mất tiến độ.

## Non-goals

- Không đổi nội dung bài học

## Relevant paths

- `src/features/practice`
- `src/features/today`
- `src/domain/learning`

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): Mission chia phiên khoảng 10 phút có checkpoint persist (phiên 1 baseline và input, phiên 2 performance đến retry, phiên 3 transfer).
- [x] `ac-2` (met): Input hiển thị từng section; output contract thu gọn sau lần xem đầu.
- [x] `ac-3` (met): Today cam kết đúng thời lượng phiên hiện tại; durationMinutes khớp thực tế.

## Required checks

- [x] `check-sessions` (focused): Phiên, checkpoint và Today — pass (2026-10-12 08:53:06 +07:00)
- [x] `check-suite` (full): Toàn bộ test của dự án (suite) — pass (2026-10-12 08:54:01 +07:00)

## Evidence

- `check-sessions` — pass (2026-10-12 08:53:06 +07:00): npx vitest run tests/features/practice tests/features/today tests/domain — exit 0
- `check-suite` — pass (2026-10-12 08:54:01 +07:00): npm test — exit 0
