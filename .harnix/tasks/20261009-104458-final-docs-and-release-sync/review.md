# Đồng bộ tài liệu cuối epic và đóng release

- **ID:** 20261009-104458-final-docs-and-release-sync
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 10:44:58 +07:00
- **Updated:** 2026-10-12 09:14:13 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 3/3 met or waived |
| Required checks | 100% | 4/4 passed |

## Goal

Tài liệu trong docs/ khớp với kết quả cuối của epic và release minor được đóng đúng quy tắc.

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): Mỗi tài liệu trong docs/ (ARCHITECTURE, CONTENT, PRODUCT, START_HERE, ADDING_LESSONS, README) mô tả đúng hành vi sau khi các task trước hoàn tất, kể cả luyện lại, lịch ôn theo ngày, offline và phiên học.
- [x] `ac-2` (met): CHANGELOG có mục release cho epic theo docs/RELEASE.md, version trong package.json và package-lock.json đồng bộ, và check-release pass.
- [x] `ac-3` (met): Có quyết định được ghi lại cho .harnix/tasks (giữ hay lưu trữ research lịch sử) mà không làm gãy check-curriculum-research.

## Required checks

- [x] `check-suite` (full): Toàn bộ test, lint và typecheck của dự án phải xanh — pass (2026-10-12 09:13:43 +07:00)
- [x] `check-final-docs` (focused): Tài liệu khớp code và link không gãy — pass (2026-10-12 09:12:46 +07:00)
- [x] `check-final-release` (focused): Release và version đồng bộ — pass (2026-10-12 09:12:46 +07:00)
- [x] `check-harnix-history` (focused): Lịch sử research không gãy — pass (2026-10-12 09:12:47 +07:00)

## Evidence

- `check-final-docs` — pass (2026-10-12 09:12:46 +07:00): node --test tests/scripts/check-docs-layout.test.mjs — exit 0
- `check-final-release` — pass (2026-10-12 09:12:46 +07:00): node scripts/check-release.mjs — exit 0
- `check-harnix-history` — pass (2026-10-12 09:12:47 +07:00): node --test tests/scripts/check-curriculum-research.test.mjs — exit 0
- `check-suite` — pass (2026-10-12 09:13:43 +07:00): npm test — exit 0
