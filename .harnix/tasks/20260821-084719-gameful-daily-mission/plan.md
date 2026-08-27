# Plan: Daily mission gameful

## Checklist

- [x] `S1` — Research và khóa mechanic
- [x] `S2` — Viết test RED cho daily mission
- [x] `S3` — Implement và refactor UI
- [x] `S4` — Verify responsive, regression và release

### Slice `S1`

Criteria: `AC-1`

Checks: `check-research`

Paths: `PRODUCT.md`, `src/features/today/TodayPage.tsx`

Benchmark ít nhất năm app, phân biệt fact/inference, chấm fit/risk và chọn một mechanic nhỏ nhất giải quyết motivation gap.

### Slice `S2`

Criteria: `AC-2`, `AC-3`, `AC-4`

Checks: `check-today-gameplay`

Paths: `src/features/today/TodayPage.test.tsx`, `src/features/today/TodayPage.tsx`, `src/domain/progress/progress.ts`

Viết test RED cho goal, semantic progress, reward copy, content-driven action và queue priority trước khi sửa production.

### Slice `S3`

Criteria: `AC-2`, `AC-3`, `AC-4`

Checks: `check-today-gameplay`, `check-browser-qa`

Paths: `src/features/today/TodayPage.tsx`, `src/index.css`

Implement mechanic trên recommendation chính bằng dữ liệu hiện có, semantic HTML và visual hierarchy phù hợp desktop/mobile.

### Slice `S4`

Criteria: `AC-5`

Checks: `check-today-gameplay`, `check-full-suite`, `check-static-build`, `check-browser-qa`, `check-release`

Paths: `CHANGELOG.md`, `package.json`, `package-lock.json`, `src/features/today/TodayPage.tsx`, `src/features/today/TodayPage.test.tsx`

Chạy toàn bộ verification, tăng MINOR cho feature tương thích ngược và ghi release mới ở đầu changelog.


