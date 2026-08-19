# Plan — Implement learning integrity refactor

## Checklist

- [x] `S1` — Fresh evidence/storage/domain contract.
- [x] `S2` — Spoken capture lifecycle.
- [x] `S3` — Session comparison và transfer feedback.
- [x] `S4` — Safe phase resume.
- [x] `S5` — Actionable Progress.
- [x] `S6` — Navigation, mobile và glossary.
- [x] `S7` — Pronunciation completion gate.
- [x] `S8` — Sáu companion mission v3.
- [x] `S9` — Docs và full verification.

Mỗi behavioral slice theo RED → GREEN → REFACTOR. Docs/content wiring dùng schema/integration validation. Storage là v3 fresh-only; không triển khai compatibility v2 hay legacy bypass.

### Slice `S1`

Tạo focused RED cho schema v3, measured metadata, rejection v2, privacy, phase/exercise fields và transfer reason matrix; triển khai types, strict parser/store và pure assessment.

Criteria: `AC-4`, `AC-5`, `AC-10`
Checks: `check-domain-storage`, `check-fresh-schema`
Paths: `src/types/progress.ts`, `src/domain/progress/progress.ts`, `src/infrastructure/storage/progress_storage.ts`, `src/shared/hooks/use_app_store.ts`

### Slice `S2`

Tạo RED cho timer complete 0 giây và capture lifecycle; refactor timer/recorder theo idle-running-ready-reset, đo duration/preparation thật và cleanup playback URL.

Criteria: `AC-1`
Checks: `check-practice-ui`
Paths: `src/features/practice/SpokenResponse.tsx`, `src/features/practice/SpokenResponse.test.tsx`, `src/features/practice/CapabilityTask.tsx`

### Slice `S3`

Tạo RED cho learner/model comparison; giữ typed/audio snapshot trong memory, render comparison/focus và nối transfer assessment/reasons mà không persist output.

Criteria: `AC-3`, `AC-5`
Checks: `check-practice-ui`, `check-progress-ui`
Paths: `src/features/practice/CapabilityTask.tsx`, `src/features/practice/CapabilityTask.test.tsx`, `src/domain/progress/progress.ts`

### Slice `S4`

Tạo ma trận RED cho reload ở từng boundary và review precedence; persist/restore `activePhase`, đưa session-only self-feedback về performance khi reload.

Criteria: `AC-4`
Checks: `check-domain-storage`, `check-practice-ui`
Paths: `src/features/practice/CapabilityTask.tsx`, `src/shared/hooks/use_app_store.ts`, `src/types/progress.ts`

### Slice `S5`

Tạo RED cho detailed evidence và reasons; triển khai Progress cards/history từ assessment chung, chỉ trình bày measured metadata.

Criteria: `AC-5`
Checks: `check-progress-ui`
Paths: `src/features/progress/ProgressPage.tsx`, `src/features/progress/ProgressPage.test.tsx`, `src/domain/progress/progress.ts`

### Slice `S6`

Tạo RED cho page navigation và mobile shell; reset scroll/focus, ẩn scrollbar, giữ active nav visible và thêm glossary.

Criteria: `AC-6`
Checks: `check-shell-legacy`
Paths: `src/app/App.tsx`, `src/app/App.test.tsx`, `src/styles.css`, `START_HERE.md`

### Slice `S7`

Tạo RED cho unfinished pronunciation completion; phát correct exercise ID, persist set, khóa Finish đến khi đủ và clear khi restart, không legacy bypass.

Criteria: `AC-11`
Checks: `check-fresh-schema`, `check-shell-legacy`
Paths: `src/features/lesson/SectionRenderer.tsx`, `src/features/lesson/SectionRenderer.test.tsx`, `src/features/lesson/LessonFlow.tsx`, `src/features/lesson/LessonFlow.test.tsx`

### Slice `S8`

Thêm sáu mission JSON v3 và content test cho unique ID, capability mapping, output contract, rubric, transfer và catalog loading.

Criteria: `AC-8`
Checks: `check-content`
Paths: `content/modules/**/*.json`, `src/content/content.ts`, `src/content/content.test.ts`

### Slice `S9`

Đồng bộ PRODUCT/ARCHITECTURE/CONTENT/README/START_HERE/CHANGELOG; chạy toàn bộ focused gates, tests, lint, build và manual matrix.

Criteria: `AC-9`
Checks: `check-all-tests`, `check-build`, `check-docs`, `check-lint`, `check-manual-critical`
Paths: `PRODUCT.md`, `ARCHITECTURE.md`, `CONTENT.md`, `README.md`, `START_HERE.md`, `CHANGELOG.md`, `src/**/*`, `content/**/*.json`

## Manual matrix

Timer/recorder; typed comparison/privacy; reload boundaries; qualifying reasons; v2 rejection/v3 export; pronunciation gate/restart; mobile navigation; 12 capability missions mở được.