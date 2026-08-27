# Design — source trust vertical slice

## Quyết định dữ liệu

Authoring contract lesson v3 có optional `sourceRegistry[]`. Mỗi record gồm `sourceId`, `kind`, `title`, `publisher`, `canonicalUrl`, `versionOrPublishedAt`, `accessedAt`, `exactLocation`, `licenseIdOrRightsUrl`, `reuseMode` và optional `requiredAttribution`.

`SourceSection.provenance` gồm `origin: original|adapted|synthetic`, `sourceIds[]` và optional `adaptationNote`. `synthetic|adapted` bắt buộc có note. Registry và provenance đều opt-in để không ép migration lesson cũ.

## Validation boundary

`LessonV3Schema.superRefine` duyệt source trong:

1. `lesson.sections`;
2. mọi `performanceTask.practiceContexts.*.artifacts`;
3. `performanceTask.readingLadder.trainingSource` khi có.

Nó reject duplicate registry ID, duplicate provenance ref, ref không tồn tại, URL không phải HTTPS, ngày truy cập sai và provenance thiếu note. Parse hoàn tất hoàn toàn offline.

## Canonical data flow

`normalizeLesson` dựng map registry một lần và clone mọi source có provenance với `resolvedSources` theo đúng thứ tự `sourceIds`. Canonical source vẫn giữ reference authoring để diagnostics, nhưng UI chỉ render metadata từ `resolvedSources`; không lookup JSON, fetch, iframe hay suy luận quyền ở feature layer.

`raw JSON → Zod validation → normalization/resolution → CanonicalLesson → SectionRenderer`

## UI

`SectionRenderer` map raw source format sang tiếng Việt, luôn hiển thị origin badge khi có provenance và dùng native `details/summary` “Nguồn và quyền sử dụng”. Metadata dùng danh sách semantic, link canonical ghi rõ cần Internet và chỉ mở sau thao tác người dùng. Source legacy không metadata render như cũ và không bịa unknown.

`CapabilityTask` dùng mapping mode/phase cùng mô tả ngắn, không thay state machine hoặc phase-only mounting. `LessonFlow` bỏ schema version khỏi learner header; version vẫn tồn tại trong canonical model cho diagnostics.

## Content policy của pilot

- Artifact: `origin: synthetic`; tên, số liệu, ticket và sự cố do dự án biên soạn.
- Scrum Guide 2020: `reference-only`, CC BY-SA 4.0; three-part là team convention.
- CEFR Companion Volume 2020: `reference-only`, all rights reserved; chỉ paraphrase rationale, không claim certification/endorsement.
- Mỗi phase giữ evidence set khác nhau để không làm yếu transfer/review.

## Compatibility, privacy và rollback

Không đổi storage schema, progress contract hoặc learner-output persistence. Không dependency mới và không network tự động. Rollback chỉ cần bỏ optional metadata/UI branch; legacy normalization vẫn dùng source không provenance.