# Plan — Làm rõ Sentence Chunks và Luyện phát âm

## Checklist
- [x] `S1` — Refactor discovery trên Catalog bằng test-first.
- [x] `S2` — Thêm learning-loop stepper và trạng thái pronunciation bằng test-first.
- [x] `S3` — Nâng Guided Shadowing với chunk progress và điều hướng bằng test-first.
- [x] `S4` — Chạy regression, static checks và browser QA responsive.

### Slice `S1`
Criteria: `AC-1`, `AC-4`
Checks: `check-catalog-ui`, `check-full-suite`
Paths: `src/features/catalog/CatalogPage.tsx`, `src/features/catalog/CatalogPage.test.tsx`, `src/content/schema.ts`
RED kiểm tra nhãn feature đúng theo learning loop; GREEN thay tín hiệu kỹ thuật bằng discovery từ canonical content.

### Slice `S2`
Criteria: `AC-2`, `AC-4`
Checks: `check-learning-loop-ui`, `check-full-suite`
Paths: `src/features/practice/LearningLoopPractice.tsx`, `src/features/practice/LearningLoopPractice.test.tsx`, `src/features/practice/CapabilityTask.tsx`, `src/features/practice/CapabilityTask.test.tsx`, `src/features/practice/PronunciationCueCard.tsx`
RED kiểm tra current/completed/skipped; GREEN thêm semantic stepper và trạng thái pronunciation mà không đổi evidence.

### Slice `S3`
Criteria: `AC-3`, `AC-4`
Checks: `check-learning-loop-ui`, `check-full-suite`
Paths: `src/features/practice/GuidedShadowing.tsx`, `src/features/practice/GuidedShadowing.test.tsx`, `src/features/practice/ModelAudioPlayer.tsx`
RED kiểm tra chunk/step progress và quay lại; GREEN thêm điều hướng ổn định và accessible names.

### Slice `S4`
Criteria: `AC-4`, `AC-5`
Checks: `check-full-suite`, `check-static-build`, `check-responsive-qa`
Paths: `src/**/*.ts`, `src/**/*.tsx`, `content/**/*.json`, `CHANGELOG.md`
Chạy snapshots, regression, lint/build và browser QA; cập nhật changelog, không đổi package version.