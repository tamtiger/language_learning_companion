# Architecture — Capability-first, offline-first

## Runtime flow

```text
JSON v1/v2/v3
  → src/content: parse, validate, normalize, catalog
  → src/app + src/features: Today/Catalog/Lesson orchestration
  → spoken hoặc written performance renderer
  → pure learning/progress event
  → versioned storage repository
  → localStorage / allowlisted backup
```

Không component nào đọc raw JSON shape. Không domain module nào import React, Zustand, `window` hoặc localStorage.

## Boundaries

- `src/content`: Zod raw schemas, `CanonicalLesson`, migration/normalization và catalog validation.
- `src/domain/learning`: phase transitions, rubric và completion rules.
- `src/domain/progress`: attempt evidence, capability aggregation, review scheduling và Today selectors.
- `src/infrastructure/storage`: `ProgressEnvelopeV2`, migration, validated import/export/reset.
- `src/app`: semantic app shell và typed in-memory navigation.
- `src/features/catalog`, `today`, `lesson`, `practice`, `progress`: UI orchestration.
- `src/shared`: UI primitives, media adapters và generic hooks; không chứa business rules.

Zustand là adapter mỏng: compose state/actions và persist allowlisted progress. Catalog loading, migration logic và completion logic không nằm trong store.

## Canonical content và migration

`parseLesson(raw)` chọn `LessonV1Schema | LessonV2Schema | LessonV3Schema`; `normalizeLesson` trả cùng một `CanonicalLesson`.

- V1 normalize thành canonical sections và `completionMode: "legacy-quiz"`.
- V2 normalize thành canonical sections + spoken task và `completionMode: "performance"`.
- V3 đã có sections + spoken/written task và `completionMode: "capability-loop"`.
- Raw v1/v2 JSON không rewrite, là rollback anchor.

Catalog trả lessons hợp lệ cùng structured errors; một file lỗi không làm crash toàn app nhưng phải làm content validation test fail.

## Learning state machine

Capability loop: `baseline → input → auto-check → performance → self-feedback → retry → transfer → completed`, sau đó có thể vào `review` khi đến hạn.

Pure transition guards ngăn model answer xuất hiện trước baseline, ngăn mission hoàn thành khi chưa self-rate rubric hoặc transfer. UI chỉ dispatch events và render phase.

## Progress và privacy

`ProgressEnvelopeV2` lưu status/current section, aggregate count, tối đa 50 attempt metadata gần nhất, transfer flag, review stage/`nextReviewAt`, legacy import summary và settings.

Không lưu audio/blob URL, transcript, written response hoặc free-text. Import flow là parse → normalize → validate → preview → explicit confirm → atomic replace. Invalid import giữ nguyên state và trả recoverable error; không reset ngầm.

Migration từ legacy maps completion/performance aggregates nhưng không tạo timestamp, rubric hoặc attempt giả.

## Review scheduling

Scheduler là pure function nhận clock. Transfer thành công đặt review theo content policy `[1,3,7]`; review đạt tăng stage, review chưa đạt lặp sau một ngày. Today queue có thứ tự deterministic: overdue review → active loop → capability baseline chưa có evidence → next new lesson.

## Accessibility

Native semantics trước ARIA. Mọi action dùng button/link/form control; focus order có nghĩa, focus visible, heading target sau navigation và live region cho timer/save/error/completion. Recording luôn có textual state và unsupported/permission-denied fallback.

## Verification

- Node tests: schema, normalization, domain, scheduling, storage.
- DOM tests: app shell, keyboard, focus, live status, error/retry và six mission flows.
- Catalog test đọc toàn bộ JSON.
- Gates: focused tests → full `npm test` → `npm run lint` → `npm run build` → manual critical flows.
- Mỗi Harnix required check được snapshot trước/sau cùng input digest trước khi ghi evidence.

Ứng dụng không commit, push, publish hoặc gửi network trong workflow này.
