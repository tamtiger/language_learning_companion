# Plan — Pilot nguồn đáng tin cậy cho Daily Standup

## Checklist

- [x] `S1` — Khóa registry/provenance contract bằng RED → GREEN.
- [x] `S2` — Áp dụng research chính thức vào Daily Standup.
- [x] `S3` — Refactor source UI và nhãn learner-facing.
- [x] `S4` — Đồng bộ docs/version, verification và browser before/after.

### Slice `S1`

Thêm RED cho registry/reference hợp lệ, duplicate/missing ID, HTTP URL, ngày không hợp lệ, synthetic/adapted thiếu note và compatibility lesson không provenance. Triển khai optional `sourceRegistry` trên v3 lesson cùng `provenance` trên mọi `SourceSection`. Normalization resolve refs thành `resolvedSources` cho lesson sections, practice contexts và reading ladder trước khi dữ liệu tới UI.

Criteria: `AC-1`, `AC-4`
Checks: `check-content-contract`, `check-full-suite`, `check-build`
Paths: `src/content/schema.ts`, `src/content/schema.test.ts`, `src/content/catalog.test.ts`, `src/content/normalization.ts`, `src/content/normalization.test.ts`

### Slice `S2`

Dùng Scrum Guide 2020 và CEFR Companion Volume 2020 ở chế độ `reference-only`; thêm lesson-local registry và gắn provenance cho source section cùng bốn practice context của Daily Standup. Sửa copy để three-part structure là team convention, dữ liệu là mô phỏng và CEFR chỉ là rationale.

Criteria: `AC-1`, `AC-3`
Checks: `check-content-contract`, `check-browser-journey`
Paths: `content/modules/workplace-communication/daily_standup.json`, `src/content/content.test.ts`, `CONTENT.md`

### Slice `S3`

Thêm RED cho learner-facing phase/mode, format và disclosure provenance. Render `provenance + resolvedSources` qua `SectionRenderer`, bỏ raw schema khỏi `LessonFlow`, giữ phase-only artifact mounting và source legacy không disclosure rỗng.

Criteria: `AC-2`, `AC-4`
Checks: `check-ui-trust`, `check-browser-journey`, `check-full-suite`
Paths: `src/features/lesson/SectionRenderer.tsx`, `src/features/lesson/SectionRenderer.test.tsx`, `src/features/lesson/LessonFlow.tsx`, `src/features/lesson/LessonFlow.test.tsx`, `src/features/practice/CapabilityTask.tsx`, `src/features/practice/CapabilityTask.test.tsx`

### Slice `S4`

Cập nhật `ARCHITECTURE.md`, `CONTENT.md`, release PATCH trong `CHANGELOG.md`/`package*.json`; chạy focused content/UI tests, full suite, lint, build và Browser QA mobile/desktop. Review diff về privacy, compatibility, attribution, phase isolation và complexity.

Criteria: `AC-1`, `AC-2`, `AC-3`, `AC-4`
Checks: `check-content-contract`, `check-ui-trust`, `check-full-suite`, `check-lint`, `check-build`, `check-browser-journey`
Paths: `ARCHITECTURE.md`, `CONTENT.md`, `CHANGELOG.md`, `content/**/*.json`, `src/**/*.ts`, `src/**/*.tsx`, `package.json`, `package-lock.json`

## Ý nghĩa verification

Focused checks chứng minh contract và semantics; full suite/lint/build bắt regression xuyên lớp. Browser QA dùng cùng mission và viewport trước/sau cho orientation, provenance, keyboard và overflow; screenshot không phải evidence learning efficacy.