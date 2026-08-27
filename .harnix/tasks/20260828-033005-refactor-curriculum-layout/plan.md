# Plan — Refactor cấu trúc curriculum theo capability

## Checklist

- [x] `S1` — Thêm RED regression cho taxonomy đường dẫn.
- [x] `S2` — Rename 18 JSON sang missions/reference và đưa regression về GREEN.
- [x] `S3` — Giữ validator research archive tương thích mà không rewrite lịch sử.
- [x] `S4` — Đồng bộ owner docs và patch release 1.1.4.
- [x] `S5` — Chạy verification đầy đủ và review độc lập.

### Slice `S1`

Criteria: `AC-1`, `AC-2`
Checks: `check-content-focused`
Paths: `src/content/content_quality.test.ts`, `src/content/catalog.ts`, `content/**/*.json`

Thêm test tính expected file path từ `schemaVersion`, `lessonId` và `capabilities[0]`. Chạy test trước rename để ghi nhận RED đúng do layout cũ.

### Slice `S2`

Criteria: `AC-1`, `AC-2`
Checks: `check-content-focused`, `check-preservation`
Paths: `content/**/*.json`, `src/content/content_quality.test.ts`

Tạo thư mục đích và rename từng file đã xác minh. Không sửa JSON. Chạy focused content tests để đưa regression về GREEN và kiểm Git nhận đúng 18 rename 100%.

### Slice `S3`

Criteria: `AC-3`, `AC-5`
Checks: `check-archive-research`, `check-preservation`, `check-validator-unit`
Paths: `scripts/check-curriculum-research.mjs`, `scripts/check-curriculum-research.test.mjs`, `.harnix/tasks/20260827-224143-complete-realistic-curriculum/research/*.md`, `.harnix/tasks/20260827-224143-complete-realistic-curriculum/task.json`

Sau rename, chạy validator để ghi nhận RED do historical location drift. Thêm `locationPath` và projection giới hạn exact task ID với 18 mapping tĩnh; live path vẫn đọc nội dung. Test task được hỗ trợ, task khác no-op, missing/duplicate mapping fail; đưa unit và archive integration về GREEN.

### Slice `S4`

Criteria: `AC-4`
Checks: `check-docs`, `check-release`
Paths: `ARCHITECTURE.md`, `CONTENT.md`, `README.md`, `CHANGELOG.md`, `package.json`, `package-lock.json`, `scripts/check-release.mjs`

Mô tả cây taxonomy, ranh giới authoring path/runtime semantics và cập nhật patch release `1.1.4` ngày `2026-08-28`.

### Slice `S5`

Criteria: `AC-1`, `AC-2`, `AC-3`, `AC-4`, `AC-5`
Checks: `check-archive-research`, `check-build`, `check-content-focused`, `check-docs`, `check-full-tests`, `check-lint`, `check-preservation`, `check-release`, `check-validator-unit`
Paths: `content/**/*.json`, `scripts/**/*.mjs`, `src/**/*.ts`, `src/**/*.tsx`, `ARCHITECTURE.md`, `CONTENT.md`, `README.md`, `CHANGELOG.md`, `package.json`, `package-lock.json`, `.harnix/tasks/20260827-224143-complete-realistic-curriculum/research/*.md`, `.harnix/tasks/20260827-224143-complete-realistic-curriculum/task.json`

Chuyển task sang verifying, snapshot trước/sau từng required check, chạy review compliance rồi quality/security, xác minh no-op runtime và không có unrelated diff, sau đó mới hoàn tất Harnix.