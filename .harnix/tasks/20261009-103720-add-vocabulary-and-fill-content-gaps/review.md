# Thêm từ vựng chuyên ngành và lấp ô trống ma trận nội dung

- **ID:** 20261009-103720-add-vocabulary-and-fill-content-gaps
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-12 08:44:34 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 4/4 met or waived |
| Required checks | 100% | 2/2 passed |

## Goal

Mỗi capability đạt độ phủ B1 đến B2 với từ vựng và nhiều loại bài tập.

## Non-goals

- Không đổi schema (đã làm ở task schema)

## Relevant paths

- `content`
- `src/content`
- `README.md`

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): Mỗi mission có 8-15 từ hoặc collocation chuyên ngành, được ôn trong delayed review.
- [x] `ac-2` (met): Lấp ô trống ma trận: workplace nói và B2, technical-reading B2, explanation B1 và viết, interview B1, technology-learning B1.
- [x] `ac-3` (met): Mỗi capability đạt tối thiểu 6 mission trải B1 đến B2; nếu chưa đạt thì README thu hẹp lời hứa cho khớp.
- [x] `ac-4` (met): Auto-check đa dạng hơn: fill, ordering, error-correction chiếm tối thiểu 30%.

## Required checks

- [x] `check-vocab-coverage` (focused): Từ vựng và độ phủ ma trận — pass (2026-10-12 08:43:10 +07:00)
- [x] `check-suite` (full): Toàn bộ test của dự án (suite) — pass (2026-10-12 08:44:03 +07:00)

## Evidence

- `check-vocab-coverage` — pass (2026-10-12 08:43:10 +07:00): npx vitest run tests/content/coverageMatrix.test.ts — exit 0
- `check-suite` — pass (2026-10-12 08:44:03 +07:00): npm test — exit 0
