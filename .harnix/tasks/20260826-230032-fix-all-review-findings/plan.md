# Plan — Sửa toàn bộ finding của đợt review

## Checklist

- [x] `S1` — Khóa transfer và listen-back integrity.
- [x] `S2` — Hợp nhất migration và làm an toàn Settings import.
- [x] `S3` — Khóa mission flow và resume process evidence.
- [x] `S4` — Bổ sung repeat flow bảo toàn history.
- [x] `S5` — Sửa Progress aggregation và recent semantics.
- [x] `S6` — Làm exercise contract reachable và sửa perception count.
- [x] `S7` — Cleanup media và hoàn thiện accessibility/Catalog.
- [x] `S8` — Đồng bộ copy, docs, release và full regression.

Mọi behavioral slice thực hiện RED → GREEN → REFACTOR. Không sửa trực tiếp Harnix state, không ghi đè thay đổi Daily Mission hiện có và không tăng version trước slice release cuối.

### Slice `S1`

Thêm RED cho wrong task, missing/extra rubric và `play` chưa đủ; mở rộng expected evidence contract bằng `lessonId`, `taskId`, rubric IDs, dùng chung ở CapabilityTask/Progress và chỉ ghi listen-back sau `ended` của audio hiện tại.

Criteria: `AC-1`
Checks: `check-transfer-integrity`
Paths: `src/domain/progress/progress.ts`, `src/domain/progress/progress.test.ts`, `src/features/practice/CapabilityTask.tsx`, `src/features/practice/CapabilityTask.test.tsx`, `src/features/practice/SpokenResponse.tsx`, `src/features/practice/SpokenResponse.test.tsx`, `src/features/progress/ProgressPage.tsx`, `src/features/progress/ProgressPage.test.tsx`

### Slice `S2`

Thêm RED cho persisted v4 process, malformed/future state và stale import candidate; trích canonical migration/validation dùng cho backup lẫn Zustand hydration, fail closed và hoàn thiện trạng thái reading/error của Settings.

Criteria: `AC-2`
Checks: `check-storage-settings`
Paths: `src/infrastructure/storage/progress_storage.ts`, `src/infrastructure/storage/progress_storage.test.ts`, `src/shared/hooks/use_app_store.ts`, `src/shared/hooks/use_app_store.test.ts`, `src/features/settings/Settings.tsx`, `src/features/settings/Settings.test.tsx`

### Slice `S3`

Thêm RED chứng minh performance bị khóa khi auto-check thiếu và spoken loop không lặp sau reload; harden reducer event/step IDs, nối CapabilityTask với legal transitions và derive readiness từ active process evidence.

Criteria: `AC-3`
Checks: `check-learning-flow`
Paths: `src/domain/learning/flow.ts`, `src/domain/learning/flow.test.ts`, `src/features/practice/CapabilityTask.tsx`, `src/features/practice/CapabilityTask.test.tsx`, `src/features/practice/LearningLoopPractice.tsx`, `src/features/practice/LearningLoopPractice.test.tsx`

### Slice `S4`

Thêm RED cho repeat từ hai entry point; thêm store action reset cycle-only fields trong khi giữ attempts/count/review, rồi wire Today và completion screen bằng đúng lesson ID.

Criteria: `AC-4`
Checks: `check-repeat-flow`
Paths: `src/shared/hooks/use_app_store.ts`, `src/shared/hooks/use_app_store.test.ts`, `src/features/today/TodayPage.tsx`, `src/features/today/TodayPage.test.tsx`, `src/features/practice/CapabilityTask.tsx`, `src/features/practice/CapabilityTask.test.tsx`

### Slice `S5`

Thêm fixture vượt quá 50 attempts; dùng `attemptCount` cho total, relabel retained-buffer metrics thành recent và gọi transfer assessment với task/rubric contract thực.

Criteria: `AC-5`
Checks: `check-progress-aggregation`
Paths: `src/domain/progress/progress.ts`, `src/domain/progress/progress.test.ts`, `src/features/progress/ProgressPage.tsx`, `src/features/progress/ProgressPage.test.tsx`

### Slice `S6`

Thêm schema/UI RED cho duplicate, unreachable answers và bốn exercise types; triển khai control semantics theo type, exact ordered comparison và sửa công thức `trainingCompleted` cho opt-out ở pretest/training/posttest.

Criteria: `AC-6`
Checks: `check-content-exercises`
Paths: `content/modules/**/*.json`, `src/content/schema.ts`, `src/content/schema.test.ts`, `src/content/content.test.ts`, `src/features/lesson/SectionRenderer.tsx`, `src/features/lesson/SectionRenderer.test.tsx`, `src/features/practice/PerceptionPractice.tsx`, `src/features/practice/PerceptionPractice.test.tsx`

### Slice `S7`

Thêm RED cho source change/unmount cleanup, focus và empty filter; cleanup object URL/speech synthesis/recording snapshot, chuyển focus theo phase, đổi contrast token, bật axe contrast, đặt lang vi và thêm Catalog recovery action.

Criteria: `AC-7`
Checks: `check-a11y-media`
Paths: `index.html`, `src/app/App.test.tsx`, `src/features/catalog/CatalogPage.tsx`, `src/features/catalog/CatalogPage.test.tsx`, `src/features/lesson/SectionRenderer.tsx`, `src/features/practice/CapabilityTask.tsx`, `src/features/practice/InteractionPractice.tsx`, `src/features/practice/InteractionPractice.test.tsx`, `src/features/practice/ModelAudioPlayer.tsx`, `src/features/practice/ModelAudioPlayer.test.tsx`, `src/index.css`

### Slice `S8`

Phân biệt transfer/review/already-completed copy, sửa backup v5 và content-owned review policy trong docs, prepend release 1.1.1, đồng bộ manifests; chạy focused checks, full suite, lint, build, release checker và diff review trên source cuối.

Criteria: `AC-1`, `AC-2`, `AC-3`, `AC-4`, `AC-5`, `AC-6`, `AC-7`, `AC-8`
Checks: `check-docs-release`, `check-full-suite`, `check-static-quality`
Paths: `ARCHITECTURE.md`, `CHANGELOG.md`, `README.md`, `index.html`, `package.json`, `package-lock.json`, `scripts/check-changelog-rule`, `src/**/*`, `content/**/*.json`

## Verification meaning

Focused checks chứng minh từng regression tại boundary tương ứng. Full suite bắt regression xuyên luồng; lint/build chứng minh static integration và production bundle; changelog rule cùng diff inspection chứng minh release append-only và preservation. Browser QA được thử lại nếu kernel sẵn sàng nhưng không thay thế automated evidence.



