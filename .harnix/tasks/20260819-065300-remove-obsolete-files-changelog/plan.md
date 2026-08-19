# Plan — Xóa file dư thừa và lập changelog

## Implementation checklist

- [x] `S1` — Chốt inventory, consumer audit và baseline.
- [x] `S2` — Xóa Markdown legacy và asset scaffold không dùng.
- [x] `S3` — Xóa facade/adapter dead code, giữ media tests dưới tên đúng.
- [x] `S4` — Cập nhật PROJECT_PROMPT và CHANGELOG.
- [x] `S5` — Reference audit, full tests, lint, build và finish.

### Slice `S1`
Criteria: `AC-1`
Checks: `check-reference-audit`
Paths: `docs/**`, `lessons/**`, `modules/**`, `src/**`, `public/**`

1. Dùng `rg`, import graph và owner docs để chứng minh candidate không có consumer.
2. Bảo toàn content executable, favicon, Harnix history và test có trách nhiệm riêng.

### Slice `S2`
Criteria: `AC-1`, `AC-2`
Checks: `check-reference-audit`, `check-tests`, `check-build`
Paths: `docs/**`, `lessons/**`, `modules/**`, `src/assets/**`, `public/icons.svg`

1. Xóa toàn bộ Markdown legacy đã được thay bằng owner docs/JSON.
2. Xóa asset scaffold và sprite không được reference; giữ `public/favicon.svg`.

### Slice `S3`
Criteria: `AC-1`, `AC-2`
Checks: `check-reference-audit`, `check-tests`, `check-build`
Paths: `src/features/course-browser/CourseBrowser.tsx`, `src/features/lesson-player/LessonPlayer.tsx`, `src/features/lesson-player/performance_task.ts`, `src/features/lesson-player/performance_task.test.ts`, `src/features/lesson-player/media_recorder.test.ts`, `src/shared/types/lesson.ts`, `src/shared/types/lesson.test.ts`, `src/shared/utils/lesson_parser.ts`, `src/shared/utils/lesson_parser.test.ts`

1. Xóa facade/adapter và duplicate wrapper tests không có importer.
2. Chuyển media-recorder coverage còn giá trị sang `media_recorder.test.ts`; giữ nguyên runtime behavior.

### Slice `S4`
Criteria: `AC-3`
Checks: `check-changelog`, `check-reference-audit`
Paths: `CHANGELOG.md`, `PROJECT_PROMPT.md`

1. Sửa prompt để không nhắc đường dẫn legacy đã xóa.
2. Tạo changelog có Added, Changed, Removed, Security và Verification, không claim ngoài implementation.

### Slice `S5`
Criteria: `AC-1`, `AC-2`, `AC-3`, `AC-4`
Checks: `check-reference-audit`, `check-changelog`, `check-tests`, `check-lint`, `check-build`
Paths: `CHANGELOG.md`, `PROJECT_PROMPT.md`, `src/**`, `content/modules/**`

1. Chạy mọi required check với snapshot trước/sau.
2. Review diff/name-status để xác nhận không xóa executable content hoặc workflow history.
3. Persist evidence và chỉ finish khi mọi criterion met.