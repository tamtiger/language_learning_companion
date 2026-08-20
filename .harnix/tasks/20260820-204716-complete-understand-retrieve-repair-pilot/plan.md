# Plan — Hoàn thiện pilot Understand Retrieve Repair

## Checklist

- [x] `S1` — Khóa pilot identity và stage navigator.
- [x] `S2` — Thêm listen-back checklist gate bằng test-first.
- [x] `S3` — Persist/resume process evidence và honest transfer bằng test-first.
- [x] `S4` — Chạy regression, build và browser QA.

### Slice `S1`

Criteria: `AC-1`

Checks: `check-pilot-ui`

Paths: `content/modules/capabilities/meeting-disagree-and-recap-b2.json`, `content/modules/capabilities/technical-tradeoff-explanation-b2.json`, `src/features/catalog/CatalogPage.tsx`, `src/features/catalog/CatalogPage.test.tsx`, `src/features/lesson/LessonFlow.tsx`, `src/features/lesson/LessonFlow.test.tsx`

RED kiểm tra badge và stage; GREEN dùng `workflowTags`.

### Slice `S2`

Criteria: `AC-2`

Checks: `check-pilot-ui`

Paths: `src/features/practice/ListenBackChecklist.tsx`, `src/features/practice/CapabilityTask.tsx`, `src/features/practice/CapabilityTask.test.tsx`

RED chứng minh playback chưa tick checklist không thể tiếp tục; GREEN thêm checkbox semantic và reset theo phase.

### Slice `S3`

Criteria: `AC-3`, `AC-4`

Checks: `check-evidence-storage`, `check-full-suite`

Paths: `src/domain/progress/progress.ts`, `src/domain/progress/progress.test.ts`, `src/infrastructure/storage/progress_storage.ts`, `src/infrastructure/storage/progress_storage.test.ts`, `src/shared/hooks/use_app_store.ts`, `src/shared/hooks/use_app_store.test.ts`, `src/features/progress/ProgressPage.tsx`

RED chứng minh reload mất evidence và transfer thiếu evidence vẫn qualifying; GREEN thêm allowlist, migration và reason codes.

### Slice `S4`

Criteria: `AC-5`

Checks: `check-static-build`, `check-responsive-qa`

Paths: `CHANGELOG.md`, `src/**/*.ts`, `src/**/*.tsx`, `content/**/*.json`

Chạy fresh snapshots, regression, lint/build và browser QA; cập nhật changelog, không đổi package version.
