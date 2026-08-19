# Design — Capability-first offline learning engine

## 1. Quyết định kiến trúc

Dùng một canonical task loop và hai response renderer (`spoken`, `written`), không xây sáu feature flow. Capability khác nhau bằng source, workflow tags, output contract, rubric, independence contract và prompts trong JSON. Quyết định này giữ UI/data-driven boundary nhỏ trong khi vẫn biểu diễn được reception, production, interaction và mediation bằng cách phối hợp section + output task.

Giữ React, TypeScript, Vite, Zustand, Zod và browser localStorage/media APIs. Refactor theo vertical slices; mọi slice phải giữ app chạy và legacy parser còn xanh. Không có server, AI hoặc background network.

## 2. Canonical model

```text
LessonV1 / LessonV2 / LessonV3
             │ parse + validate
             ▼
      normalizeLesson()
             │
             ▼
CanonicalLesson
  metadata + capabilities + workflowTags
  sections: Brief | LanguageSupport | Source | AutoCheck
  performanceTask?: SpokenTask | WrittenTask
  reviewPolicy?
```

V3 là authoring contract mới. Canonical model là internal boundary, không export raw Zod input sang components. V1/v2 adapters là pure functions; provenance `sourceSchemaVersion` chỉ phục vụ diagnostics/compatibility, không điều khiển topic UI.

Legacy v1 có thể không có performance task và dùng legacy completion. V2 Daily Standup được normalize sang `SpokenTask`. Mọi mission v3 phải có performance task và full loop contract.

## 3. Runtime boundaries

```text
content JSON
  → content/schema + normalization + catalog
  → app/Today or app/Catalog
  → lesson/LessonFlow (state machine)
  → lesson/SectionRendererRegistry
  → practice/SpokenTask | practice/WrittenTask
  → domain learning event
  → progress reducer + scheduler
  → storage repository
  → validated localStorage / backup JSON
```

- `src/content`: I/O boundary duy nhất cho JSON. Catalog validation trả structured error, không crash toàn app vì một module lỗi.
- `src/domain/learning`: không import React/Zustand/localStorage; chứa phase transitions, task/rubric/completion rules.
- `src/domain/progress`: pure reducer/selectors cho attempt evidence, capability evidence, scheduling và Today ordering.
- `src/infrastructure/storage`: Zod envelope, migration chain, safe import/export/reset; không phụ thuộc component.
- `src/app`: shell, navigation và top-level error/loading states.
- `src/features/lesson`: orchestrator + section registry; không xử lý MediaRecorder trực tiếp.
- `src/features/practice`: spoken/written controlled UI. Media service/hook chỉ quản lý browser object URLs trong memory và revoke khi dispose.
- `src/shared`: primitive components/hooks; không là nơi đẩy business logic dùng chung một cách mơ hồ.

## 4. Lesson flow state machine

V3 phases: `baseline → input → auto-check → performance → self-feedback → retry → transfer → completed`, sau đó `review` được mở bởi scheduler. Section không tồn tại được skip theo canonical data. Chuyển phase qua pure transition function; component chỉ dispatch user event.

Guard chính:

- Không mở scaffold/model trước khi baseline attempt được ghi.
- Không hoàn thành mission nếu chưa self-rate rubric và hoàn thành transfer.
- Retry được phép nhiều lần nhưng chỉ metadata 50 attempt gần nhất được giữ.
- Review không thay đổi source lesson; nó dùng `reviewPrompt`/transfer variant.
- Reload resume phase/section metadata nhưng không khôi phục audio hay written draft.

## 5. Progress và storage

Zustand store chỉ compose slices `navigation`, `session`, `progress`; persisted partialize chỉ lấy `ProgressEnvelopeV2`. Content catalog được load độc lập và không persist.

Migration chain:

1. Đọc raw value và giữ bản raw trong memory để có thể báo lỗi/restore trong session.
2. Detect storage version; validate input schema tương ứng.
3. Map legacy completed/incorrect/performance aggregates vào canonical progress với `legacyImport`, không tạo evidence giả.
4. Validate output V2; chỉ sau đó replace store atomically.
5. Nếu bất kỳ bước nào fail: giữ state trước đó, expose recoverable error, cho phép export raw diagnostic; không reset ngầm.

Backup export dùng explicit allowlist. Import đi qua `parse → normalize → validate → preview → confirm → replace`. Audio blobs, object URLs, written drafts và free text không đi qua progress events nên không thể lọt vào backup.

## 6. Scheduling và evidence

`scheduleReview(event, policy, now)` là pure function nhận clock inject được. Policy mặc định từ content `[1, 3, 7]`; failed review lặp stage sau 1 ngày. Queue selector deterministic theo `nextReviewAt`, active state, missing capability baseline và stable ID.

Capability view aggregate facts, không tạo opaque score:

- số baseline/transfer/review attempts;
- rubric criterion met/not-met qua các attempt;
- independence signals qua thời gian;
- lần cuối thực hành và review kế tiếp.

## 7. Accessibility và testing boundary

Native semantics trước ARIA. Navigation/card actions là `button`/`a`; focus chuyển đến page/phase heading sau explicit navigation; timer/save/error/completion dùng scoped live regions; modal reset/import có focus containment/return; recording có textual state và fallback khi MediaRecorder thiếu.

Thêm test environment cho React DOM, user-event và axe smoke dưới devDependencies; package version được khóa trong lockfile sau compatibility check. Pure domain/schema/storage tests vẫn chạy trong Node để nhanh. Component tests tập trung vào keyboard, focus, live status, error/retry và không branch theo lesson ID.

## 8. Documentation migration

Owner docs được cập nhật trước code để khóa ngôn ngữ và invariants. Sau khi six missions + v3 chạy, Markdown cũ được phân loại:

- ý tưởng còn đúng được chuyển vào owner docs hoặc executable JSON;
- tài liệu historical được move nguyên vẹn vào `docs/legacy/` và thêm index/banner;
- link nội bộ được cập nhật/test bằng `rg`;
- không xóa file user-owned trong task.

## 9. Rejected alternatives

- Sáu feature flows riêng: trùng orchestration/storage/a11y, buộc React hiểu topic, chi phí bảo trì cao.
- Ép legacy v1 thành performance lesson bằng dữ liệu giả: làm sai provenance và phá completion semantics.
- Rewrite toàn JSON và progress một lần: rollback kém, nguy cơ mất dữ liệu.
- AI/remote scoring: trái offline/privacy scope và chưa có consent/security model.
- IndexedDB/router ngay: chưa có constraint về volume/deep-link chứng minh độ phức tạp bổ sung.

## 10. Rollout/rollback

Mỗi slice merge-ready độc lập: owner contract → schema adapters → domain/storage → content → shell/player → practice/review → docs cleanup → full verification. Feature path mới chỉ thay path cũ khi focused compatibility tests xanh. Raw v1/v2 JSON không đổi; migration cũ vẫn đọc được trong suốt task. Nếu slice UI thất bại, app có thể quay về renderer cũ vì canonical adapter và storage migration không phụ thuộc component mới.
