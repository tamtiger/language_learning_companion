# Thống nhất quy ước tên file, đuôi file và gom test vào thư mục tests

- **ID:** 20261009-112609-standardize-file-naming-and-test-layout
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** ready/ready
- **Created:** 2026-10-09 11:26:09 +07:00
- **Updated:** 2026-10-09 11:28:18 +07:00

**Verdict:** PENDING — 0/5 acceptance criteria met

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 0% | 0/5 met or waived |
| Required checks | 0% | 0/3 passed |

## Goal

Mã nguồn dùng một quy ước đặt tên và đuôi file duy nhất, và toàn bộ test nằm trong thư mục tests phản chiếu cấu trúc nguồn.

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [ ] `ac-1` (pending): Component dùng PascalCase.tsx, hook bắt đầu bằng use và dùng camelCase.ts, mọi module khác dùng camelCase.ts; không còn tên snake_case trong src/ (use_app_store, model_audio, media_recorder, progress_storage, learning_loop, learning_loop_diagnostics, option_order, exercise_grading, answer_normalization).
- [ ] `ac-2` (pending): Đuôi file theo nội dung: .tsx chỉ khi file có JSX; test có JSX là .test.tsx, test không có JSX là .test.ts; test option_order chuyển sang JSX thay vì dùng createElement.
- [ ] `ac-3` (pending): Toàn bộ test (src và scripts) nằm trong thư mục tests/ phản chiếu cấu trúc nguồn, setup nằm tại tests/setup.ts; vitest.config.ts, tsconfig và lệnh node --test được cập nhật; không còn file *.test.* ngoài tests/.
- [ ] `ac-4` (pending): Quy ước được ghi trong docs/CONVENTIONS.md và được cưỡng chế bằng một test tự động quét src/, tests/ và scripts/ (tên file, đuôi file, vị trí test).
- [ ] `ac-5` (pending): Refactor không đổi hành vi: dùng git mv để giữ lịch sử, số lượng test trước và sau bằng nhau, build, lint và toàn bộ suite xanh, các lệnh check của task còn lại trong epic được cập nhật theo đường dẫn mới.

## Required checks

- [ ] `check-suite` (full): Toàn bộ test, lint và typecheck của dự án phải xanh — chưa chạy / not yet run
- [ ] `check-conventions` (focused): Quy ước tên file, đuôi file và vị trí test — chưa chạy / not yet run
- [ ] `check-rename-build` (focused): Build và type-check sau khi đổi tên và di chuyển — chưa chạy / not yet run

## Decisions

- **dec-camelcase-modules** — Module dùng camelCase, hook dùng useXxx, component PascalCase.tsx; script Node dùng kebab-case.mjs; main.tsx là ngoại lệ của Vite.
  - _Why:_ Tên file khớp tên export và là chuẩn phổ biến của TypeScript; snake_case hiện chỉ có ở 6 module cũ cộng 3 file mới.
- **dec-tests-root-alias** — Test nằm ở tests/ ngoài src/, phản chiếu cấu trúc src/, import mã nguồn qua alias @/ trỏ tới src/.
  - _Why:_ Yêu cầu của chủ dự án; alias tránh chuỗi đường dẫn tương đối dài và không đổi khi tổ chức lại thư mục.
- **dec-jsx-by-ast** — Kiểm tra .tsx có JSX bằng TypeScript compiler API.
  - _Why:_ Regex nhầm với generics và so sánh; typescript đã là devDependency.

## Evidence

_None recorded yet._
