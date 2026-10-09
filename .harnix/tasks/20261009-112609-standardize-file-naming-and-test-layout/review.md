# Thống nhất quy ước tên file, đuôi file và gom test vào thư mục tests

- **ID:** 20261009-112609-standardize-file-naming-and-test-layout
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 11:26:09 +07:00
- **Updated:** 2026-10-09 11:39:14 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 5/5 met or waived |
| Required checks | 100% | 3/3 passed |
| Residual risks | 2 | risk-alias-tests-only: low, risk-history-old-paths: low |

## Goal

Mã nguồn dùng một quy ước đặt tên và đuôi file duy nhất, và toàn bộ test nằm trong thư mục tests phản chiếu cấu trúc nguồn.

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): Component dùng PascalCase.tsx, hook bắt đầu bằng use và dùng camelCase.ts, mọi module khác dùng camelCase.ts; không còn tên snake_case trong src/ (use_app_store, model_audio, media_recorder, progress_storage, learning_loop, learning_loop_diagnostics, option_order, exercise_grading, answer_normalization).
- [x] `ac-2` (met): Đuôi file theo nội dung: .tsx chỉ khi file có JSX; test có JSX là .test.tsx, test không có JSX là .test.ts; test option_order chuyển sang JSX thay vì dùng createElement.
- [x] `ac-3` (met): Toàn bộ test (src và scripts) nằm trong thư mục tests/ phản chiếu cấu trúc nguồn, setup nằm tại tests/setup.ts; vitest.config.ts, tsconfig và lệnh node --test được cập nhật; không còn file *.test.* ngoài tests/.
- [x] `ac-4` (met): Quy ước được ghi trong docs/CONVENTIONS.md và được cưỡng chế bằng một test tự động quét src/, tests/ và scripts/ (tên file, đuôi file, vị trí test).
- [x] `ac-5` (met): Refactor không đổi hành vi: dùng git mv để giữ lịch sử, số lượng test trước và sau bằng nhau, build, lint và toàn bộ suite xanh, các lệnh check của task còn lại trong epic được cập nhật theo đường dẫn mới.

## Required checks

- [x] `check-suite` (full): Toàn bộ test, lint và typecheck của dự án phải xanh — pass (2026-10-09 11:38:32 +07:00)
- [x] `check-conventions` (focused): Quy ước tên file, đuôi file và vị trí test — pass (2026-10-09 11:37:56 +07:00)
- [x] `check-rename-build` (focused): Build và type-check sau khi đổi tên và di chuyển — pass (2026-10-09 11:38:01 +07:00)

## Decisions

- **dec-camelcase-modules** — Module dùng camelCase, hook dùng useXxx, component PascalCase.tsx; script Node dùng kebab-case.mjs; main.tsx là ngoại lệ của Vite.
  - _Why:_ Tên file khớp tên export và là chuẩn phổ biến của TypeScript; snake_case hiện chỉ có ở 6 module cũ cộng 3 file mới.
- **dec-tests-root-alias** — Test nằm ở tests/ ngoài src/, phản chiếu cấu trúc src/, import mã nguồn qua alias @/ trỏ tới src/.
  - _Why:_ Yêu cầu của chủ dự án; alias tránh chuỗi đường dẫn tương đối dài và không đổi khi tổ chức lại thư mục.
- **dec-jsx-by-ast** — Kiểm tra .tsx có JSX bằng TypeScript compiler API.
  - _Why:_ Regex nhầm với generics và so sánh; typescript đã là devDependency.
- **dec-baseline-tests** — Mốc trước refactor: 35 file test, 306 test, tất cả xanh (Node 25.8). Sau refactor chỉ được tăng đúng bằng số test của fileConventions.test.ts.
  - _Why:_ Chứng minh refactor không làm mất test nào (ac-5).

## Residual risks

- **risk-alias-tests-only** (low) — Alias @/ chỉ dùng trong test (cấu hình ở vitest.config.ts và tsconfig.app.json). Code trong src/ phải tiếp tục dùng đường dẫn tương đối; dùng alias trong src/ cần cấu hình thêm cho vite.config.ts.
- **risk-history-old-paths** (low) — Bản ghi của các task đã hoàn thành (.harnix/tasks) và CHANGELOG giữ tên và đường dẫn cũ (option_order, use_app_store, src/**/*.test.*) vì là lịch sử; không coi là tham chiếu hỏng.

## Evidence

- `check-conventions` — pass (2026-10-09 11:37:56 +07:00): npx vitest run tests/conventions/fileConventions.test.ts — exit 0
- `check-rename-build` — pass (2026-10-09 11:38:01 +07:00): npm build — exit 0
- `check-suite` — pass (2026-10-09 11:38:32 +07:00): npm test — exit 0
