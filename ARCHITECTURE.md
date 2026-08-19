# Architecture — Capability-first, offline-first

## Runtime flow

```text
JSON v1/v2/v3
  → src/content: parse, validate, normalize, catalog
  → src/app + src/features: Today/Catalog/Lesson orchestration
  → spoken hoặc written performance renderer
  → pure learning/progress event
  → strict fresh-only storage repository
  → localStorage / allowlisted backup
```

Không component nào đọc raw JSON shape. Không domain module nào import React, Zustand, `window` hoặc localStorage.

## Boundaries

- `src/content`: Zod raw schemas, `CanonicalLesson`, migration/normalization và catalog validation.
- `src/domain/learning`: phase transitions, rubric và completion rules.
- `src/domain/progress`: attempt evidence, capability aggregation, review scheduling và Today selectors.
- `src/infrastructure/storage`: `ProgressEnvelopeV3`, validated import/export/reset; không có progress migration pre-release.
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

Sau self-feedback, UI bắt buộc chọn một `retry focus` trong các criterion `not-met`
(nếu có). Retry phải tạo output và chấm lại toàn bộ rubric trước transfer. Focus được
lưu bằng ID có cấu trúc, không dùng free-text feedback.

## Progress và privacy

`ProgressEnvelopeV3` lưu status/current section, `activePhase`, các exercise đã đúng,
aggregate count, tối đa 50 attempt metadata gần nhất, optional `focusCriterionId`,
transfer flag, review stage/`nextReviewAt` và settings. Mỗi attempt bắt buộc có
duration dương, `wordCount` nullable và preparation time đo từ phiên.

Pure progress selectors định nghĩa `qualifying transfer` là completed transfer có
rubric không rỗng và toàn bộ `met`, không dùng tiếng Việt, translation, model answer
và không vượt content-owned `maxHints`, time limit hoặc output length. Progress UI
hiển thị riêng attempts, transfer attempts, qualifying transfers và reason codes;
không đếm một independent baseline/retry như transfer đạt.

Không lưu audio/blob URL, transcript, written response hoặc free-text. Import flow là
parse v3 → validate → preview → explicit confirm → atomic replace. Invalid/v1/v2
import giữ nguyên state và trả recoverable error; không reset ngầm.

Vì app chưa phát hành, state v1/v2 bị bỏ và khởi tạo rỗng; không có
`legacy-unknown` hoặc evidence giả.

## Resume và pronunciation

`activePhase` là checkpoint bền vững: input, performance, retry hoặc transfer.
Self-feedback giữ learner output trong memory; reload tại đây quay về performance.
Pronunciation lưu union các exercise ID đã đúng, chỉ bật Finish khi đủ toàn bộ và
restart tạo progress rỗng.

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
