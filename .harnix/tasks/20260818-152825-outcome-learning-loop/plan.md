# Plan — Vòng lặp luyện nói Daily Standup theo năng lực

## Implementation checklist

- [x] `S1` — Hoàn tất research và đồng bộ ba tài liệu owner.
- [x] `S2` — RED/GREEN schema v2, parser compatibility và content validation.
- [x] `S3` — Tạo lesson Daily Standup B1 và kiểm chứng content contract.
- [x] `S4` — RED/GREEN performance progress, completion và backup round-trip.
- [x] `S5` — Triển khai performance UI, MediaRecorder lifecycle và fallback.
- [x] `S6` — Tích hợp, full regression và manual critical flow.
- [x] `S7` — Review độc lập, sửa finding trong scope và hoàn tất evidence.

## S1 — Research và specs

Cập nhật PRODUCT.md, CONTENT.md, ARCHITECTURE.md và research/learning-loop.md. Chốt capability metrics, v2 contract, local-only media, fallback và compatibility. check-specs chứng minh consistency.

## S2 — Schema

Thêm test RED cho v2 hợp lệ, field thiếu, time sai, rubric sai và sáu fixture v1. GREEN bằng common schema + LessonV1Schema/LessonV2Schema discriminated union. Chạy check-schema và check-content.

## S3 — Content

Tạo content/modules/workplace-communication/daily_standup.json: scenario B1, attempt 60–90 giây, model sau attempt, rubric clarity/structure/blocker/comprehensibility và transfer scenario. Chạy check-content.

## S4 — State và backup

Test RED cho hydrate state cũ, completion sau hai attempt, export/import metadata và reject malformed input. GREEN bằng performanceProgress + action nguyên tử + persist migration nhỏ nhất + backup validation tách khỏi UI. Chạy check-performance.

## S5 — UI và media

Tách PerformanceTask, media_recorder và pure state helper. Test RED state machine và unsupported/denied states. GREEN thêm practice tab chỉ cho v2, in-memory record/playback, revoke URL và timer-only fallback. Chạy check-performance/build/manual-flow.

## S6 — Integration

Nối completion gate; xác minh v1 giữ hành vi, reload giữ metadata không media, reset và backup round-trip. Chạy mọi required check với snapshot trước/sau.

## S7 — Review

Review compliance trước, sau đó correctness/security/maintainability; sửa finding trong scope và chạy lại check bị ảnh hưởng.

## Preservation và rollback

Working tree hiện chưa track; mọi file ngoài scope là user-owned. Không xóa pronunciation, commit, push hoặc PR. V2 thêm song song v1 nên rollback không rewrite v1. Audio chỉ ở memory. performanceProgress phải có default/migration để dữ liệu cũ an toàn.

## Slice ownership

### Slice `S1`
Criteria: `AC-1`
Checks: `check-specs`
Paths: `PRODUCT.md`, `CONTENT.md`, `ARCHITECTURE.md`, `.harnix/tasks/20260818-152825-outcome-learning-loop/research/learning-loop.md`

### Slice `S2`
Criteria: `AC-2`, `AC-6`
Checks: `check-schema`
Paths: `src/shared/types/lesson.ts`, `src/shared/types/lesson.test.ts`, `src/shared/utils/lesson_parser.ts`, `src/shared/utils/lesson_parser.test.ts`, `content/modules/pronunciation/**`

### Slice `S3`
Criteria: `AC-3`, `AC-6`
Checks: `check-content`
Paths: `content/modules/workplace-communication/daily_standup.json`, `src/shared/utils/validate_all_lessons.test.ts`

### Slice `S4`
Criteria: `AC-5`, `AC-6`
Checks: `check-performance`
Paths: `src/shared/hooks/use_app_store.ts`, `src/shared/hooks/use_app_store.test.ts`, `src/features/settings/Settings.tsx`

### Slice `S5`
Criteria: `AC-4`, `AC-5`
Checks: `check-performance`, `check-build`
Paths: `src/features/lesson-player/**`

### Slice `S6`
Criteria: `AC-2`, `AC-3`, `AC-4`, `AC-5`, `AC-6`, `AC-7`
Checks: `check-all-tests`, `check-lint`, `check-build`, `check-manual-flow`
Paths: `src/**`, `content/modules/**`

### Slice `S7`
Criteria: `AC-1`, `AC-2`, `AC-3`, `AC-4`, `AC-5`, `AC-6`, `AC-7`
Checks: `check-specs`, `check-schema`, `check-content`, `check-performance`, `check-all-tests`, `check-lint`, `check-build`, `check-manual-flow`
Paths: `PRODUCT.md`, `CONTENT.md`, `ARCHITECTURE.md`, `src/**`, `content/modules/**`
