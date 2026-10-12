# Refactor cấu trúc feature practice và dọn đặt tên

- **ID:** 20261009-104509-refactor-practice-feature-structure
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 10:45:09 +07:00
- **Updated:** 2026-10-12 09:09:41 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 3/3 met or waived |
| Required checks | 100% | 3/3 passed |

## Goal

src/features/practice có cấu trúc rõ ràng, tên gọi đúng nghĩa và không còn file nhập nhằng.

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): src/features/practice được tổ chức lại theo vai trò (task, spoken, perception, ladder, interaction, shared), mỗi file dưới 300 dòng và import một chiều.
- [x] `ac-2` (met): targetSeconds đổi thành minSeconds và storage key khớp version, kèm migration không mất dữ liệu.
- [x] `ac-3` (met): Dọn các nit đã ghi nhận: text-current/80 vô tác dụng, nav thừa, tiêu đề tab khớp tên header, tsconfig ghi rõ strict.

## Required checks

- [x] `check-suite` (full): Toàn bộ test, lint và typecheck của dự án phải xanh — pass (2026-10-12 09:09:11 +07:00)
- [x] `check-practice-structure` (focused): Cấu trúc practice và nit — pass (2026-10-12 09:08:07 +07:00)
- [x] `check-rename-migration` (focused): Đổi tên minSeconds và migration — pass (2026-10-12 09:08:15 +07:00)

## Evidence

- `check-practice-structure` — pass (2026-10-12 09:08:07 +07:00): npx vitest run tests/features/practice — exit 0
- `check-rename-migration` — pass (2026-10-12 09:08:15 +07:00): npx vitest run tests/infrastructure/storage tests/content — exit 0
- `check-suite` — pass (2026-10-12 09:09:11 +07:00): npm test — exit 0
