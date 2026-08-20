# Plan: Refactor UX theo đường ngắn nhất tới capability

## Checklist

- [x] `S1` — Audit black-box, research và chốt bottleneck/contract before-after.
- [x] `S2` — Viết RED và implement job-first shortest path trên Today.
- [x] `S3` — Hoàn thiện responsive/accessibility/state coverage và refactor khi green.
- [x] `S4` — Cập nhật release, chạy full verification và review cuối.

### Slice `S1`

Criteria: `AC-1`
Checks: `check-responsive-qa`
Paths: `.harnix/tasks/20260821-003117-refactor-shortest-path-ux/research/ux-shortest-path.md`, `UX_RESEARCH_REFACTOR_PROMPT.md`, `PRODUCT.md`, `CONTENT.md`, `ARCHITECTURE.md`, `src/app/App.tsx`, `src/features/today/TodayPage.tsx`, `src/features/catalog/CatalogPage.tsx`

Đã audit first-run/returning state ở desktop và 390x844, research control discovery/accessibility, xếp hạng friction và khóa shortest-path contract trong PRD. Evidence chi tiết nằm trong research artifact; timing không đo nên không dùng làm success claim.

### Slice `S2`

Criteria: `AC-2`, `AC-3`
Checks: `check-primary-journey`
Paths: `src/features/today/TodayPage.tsx`, `src/features/today/TodayPage.test.tsx`

Viết RED xác nhận sáu job intent, Daily Standup candidate content-driven, feature labels theo mode, click callback và resume/review priority. Implement selector trình bày trong `TodayPage` bằng canonical lessons + `buildTodayQueue`, rồi đưa focused test về GREEN.

### Slice `S3`

Criteria: `AC-4`, `AC-5`
Checks: `check-full-suite`, `check-primary-journey`, `check-responsive-qa`
Paths: `src/features/today/TodayPage.tsx`, `src/features/today/TodayPage.test.tsx`, `src/app/App.test.tsx`, `src/index.css`, `src/domain/progress/progress.ts`, `src/infrastructure/storage/progress_storage.ts`

Kiểm tra keyboard order, semantic heading/button, target size, mobile/desktop overflow, first viewport, empty queue và returning resume. Chỉ sửa presentation/test trong slice; không đổi domain progress, storage hoặc lesson contract nếu không có failure bắt buộc.

### Slice `S4`

Criteria: `AC-6`
Checks: `check-full-suite`, `check-release`, `check-static-build`, `check-responsive-qa`
Paths: `AGENTS.md`, `CHANGELOG.md`, `package.json`, `package-lock.json`, `scripts/check-changelog-rule`, `src/**/*`

Bump `1.0.1 → 1.0.2`, prepend changelog entry mới mà không sửa release cũ, chạy snapshot-bound focused/full/lint/build/release checks, browser QA hai viewport, console/keyboard review và diff review cuối trước finishing.