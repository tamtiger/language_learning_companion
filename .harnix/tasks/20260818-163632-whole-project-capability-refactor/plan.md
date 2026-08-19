# Plan — Refactor toàn dự án theo sáu capability

## Delivery strategy

Triển khai test-first theo tám vertical slices. Sau mỗi slice, app vẫn build/test được và 7 lesson legacy vẫn còn đường chạy. Không chuyển sang slice sau nếu focused checks của slice hiện tại đỏ; không xóa/move legacy docs trước khi executable replacement và link audit tồn tại.

## Implementation checklist

- [x] `S1` — Khóa contract owner, baseline và test harness.
- [x] `S2` — Canonical schema v3 và normalization v1/v2.
- [x] `S3` — Learning/progress domain và storage migration fail-closed.
- [x] `S4` — Sáu baseline mission và catalog capability-first.
- [x] `S5` — App shell, Today/Catalog và generic lesson orchestrator.
- [x] `S6` — Spoken/written tasks, review loop và accessibility.
- [x] `S7` — Consolidate owner docs, prompts và curriculum legacy.
- [x] `S8` — Regression, manual acceptance, independent review và handoff.

### Slice `S1`
Criteria: `AC-1`, `AC-10`
Checks: `check-specs`, `check-all-tests`, `check-lint`, `check-build`
Paths: `PRODUCT.md`, `CONTENT.md`, `ARCHITECTURE.md`, `README.md`, `START_HERE.md`, `package.json`, `package-lock.json`, `vite.config.ts`, `.harnix/tasks/20260818-163632-whole-project-capability-refactor/research/learning-engine.md`

1. Ghi baseline reproducible (50 tests, lint, build) và inventory v1/v2/content/docs vào owner docs/task evidence.
2. Đồng bộ PRODUCT/CONTENT/ARCHITECTURE ở mức contract: six capabilities, generic loop, v3, privacy, source-of-truth, migration; README/START_HERE chỉ trỏ đúng owner.
3. Thêm dev-only React DOM/user-event/a11y test harness với version tương thích React 19; khóa lockfile. Tạo một accessibility smoke test tối thiểu trước khi refactor UI.
4. Guard: runtime dependency graph và UX chưa đổi; nếu harness gây conflict, revert riêng dependency/test config, không đụng source.

### Slice `S2`
Criteria: `AC-2`, `AC-9`
Checks: `check-schema`, `check-content`, `check-all-tests`, `check-build`
Paths: `src/content/schema.ts`, `src/content/normalization.ts`, `src/content/catalog.ts`, `src/content/schema.test.ts`, `src/content/normalization.test.ts`, `src/content/catalog.test.ts`, `content/modules/**`

1. Viết failing tests cho v3 invariants, spoken/written mode constraints, cross-reference IDs và malformed catalog errors.
2. Tách raw `LessonV1Schema`, `LessonV2Schema`, `LessonV3Schema` khỏi `CanonicalLesson`; implement `parseLesson` và pure `normalizeLesson` exhaustive theo version.
3. Normalize sáu v1 thành canonical legacy sections/completion; normalize Daily Standup v2 thành canonical spoken task mà không sửa source JSON.
4. Catalog loader trả validated canonical modules + structured per-file errors; components không import raw JSON shape.
5. Rollback point: adapters mới tồn tại song song loader cũ đến khi tất cả 7 compatibility fixtures xanh.

### Slice `S3`
Criteria: `AC-3`, `AC-6`, `AC-7`, `AC-9`
Checks: `check-learning-domain`, `check-storage`, `check-all-tests`, `check-build`
Paths: `src/domain/learning/**`, `src/domain/progress/**`, `src/infrastructure/storage/**`, `src/shared/hooks/use_app_store.ts`, `src/shared/hooks/use_app_store.test.ts`

1. Test-first pure phase state machine, v3 completion guard, legacy completion, rubric/independence event validation và recent-attempt cap 50.
2. Implement deterministic `[1,3,7]` scheduler với injected clock, failed-review reschedule và Today queue ordering.
3. Định nghĩa `ProgressEnvelopeV2`; tách storage repository/migration/import/export/reset khỏi Zustand.
4. Test legacy migration: completed/incorrect/performance aggregates được bảo toàn bằng `legacyImport`, không fabricate evidence; invalid input giữ state cũ và trả recoverable error.
5. Test backup allowlist/round-trip và assert serialized output không có blob, object URL, response text, transcript/free-text.
6. Chuyển store thành adapter mỏng; giữ selector/action compatibility cho UI cũ trong slice này.

### Slice `S4`
Criteria: `AC-3`, `AC-4`, `AC-9`
Checks: `check-content`, `check-schema`, `check-learning-domain`, `check-all-tests`
Paths: `content/modules/**`, `src/content/catalog.ts`, `src/content/catalog.test.ts`

1. Viết catalog acceptance tests yêu cầu đúng 6 primary capability baseline missions và uniqueness/invariant v3.
2. Author/migrate sáu mission: `workplace-issue-update-b1`, `technical-doc-action-b1`, `daily-standup-b1`, `technical-tradeoff-explanation-b2`, `technical-interview-decision-b2`, `learn-api-from-docs-b2`.
3. Mỗi mission có original/licensed source, baseline/performance/retry/transfer/review prompts, output/independence contract và 3–5 rubric criteria.
4. Tổ chức catalog metadata/filter theo capability + workflow tags, giữ CEFR filter phụ và pronunciation legacy group.
5. Chạy toàn catalog; không accept hardcoded lesson ID/topic branch trong React để làm mission chạy.

### Slice `S5`
Criteria: `AC-5`, `AC-7`, `AC-8`, `AC-9`
Checks: `check-ui`, `check-learning-domain`, `check-all-tests`, `check-build`
Paths: `src/app/**`, `src/features/catalog/**`, `src/features/today/**`, `src/features/lesson/**`, `src/shared/components/**`, `src/App.tsx`

1. Viết component/integration tests cho navigation, Today ordering, catalog filters, resume reload, loading/error và keyboard activation.
2. Tạo app shell/page composition; thay local navigation ad-hoc bằng typed internal route state có focus restoration, chưa thêm router dependency.
3. Tách `LessonPlayer` thành `LessonFlow`, phase navigation, `SectionRendererRegistry` và renderers brief/language-support/source/auto-check.
4. Thay clickable div bằng native interactive elements; thêm page/phase headings, focus targets và live status contract.
5. Giữ legacy player behavior qua canonical lessons; chỉ xóa monolith path sau tests cho 6 pronunciation + Daily Standup xanh.

### Slice `S6`
Criteria: `AC-5`, `AC-6`, `AC-7`, `AC-8`, `AC-9`
Checks: `check-ui`, `check-learning-domain`, `check-storage`, `check-manual-flows`, `check-all-tests`, `check-build`
Paths: `src/features/practice/**`, `src/features/progress/**`, `src/features/today/**`, `src/shared/media/**`, `src/shared/components/**`

1. Viết interaction tests cho spoken/written baseline lock, timer, self-rubric, retry, transfer, delayed review và completion guards.
2. Tách `SpokenTask`/`WrittenTask`; media hook/service quản lý permission denial, unsupported fallback, timer và revoke object URL, tuyệt đối không persist media.
3. Written response là session-only controlled state; reload hiển thị thông báo draft không được lưu vì privacy thay vì giả resume content.
4. Nối domain events vào progress repository, Today queue và capability evidence view; hiển thị facts/trends, không opaque proficiency score.
5. Hoàn thiện keyboard/focus/live regions/error recovery/responsive behavior; chạy axe smoke và manual screen sizes/keyboard checklist.

### Slice `S7`
Criteria: `AC-1`, `AC-2`, `AC-4`, `AC-9`
Checks: `check-specs`, `check-schema`, `check-content`, `check-build`
Paths: `PRODUCT.md`, `CONTENT.md`, `ARCHITECTURE.md`, `README.md`, `START_HERE.md`, `IMPROVEMENT_PROMPT.md`, `PROJECT_PROMPT.md`, `PRODUCT_PROMPT.md`, `ARCHITECTURE_PROMPT.md`, `docs/**`, `lessons/**`, `modules/**`

1. Hoàn thiện owner docs theo implementation thực tế và thêm authoring example v3 validated.
2. Refactor prompts thành vai trò rõ, dẫn chiếu owner docs; `IMPROVEMENT_PROMPT.md` yêu cầu baseline → prioritize → implement → verify, không tự hứa AI/remote capability.
3. Chuyển knowledge còn đúng từ Markdown curriculum vào owner docs hoặc JSON; bảo tồn phần historical dưới `docs/legacy/` với index/banner non-current.
4. Cập nhật mọi relative link và terminology; `rg` không còn live docs quảng bá AI feedback, non-executable mission hoặc metric engagement như outcome chính.
5. Không delete file user-owned; mọi move cần mapping nguồn→đích trong review evidence.

### Slice `S8`
Criteria: `AC-1`, `AC-2`, `AC-3`, `AC-4`, `AC-5`, `AC-6`, `AC-7`, `AC-8`, `AC-9`, `AC-10`
Checks: `check-specs`, `check-schema`, `check-content`, `check-learning-domain`, `check-storage`, `check-ui`, `check-all-tests`, `check-lint`, `check-build`, `check-manual-flows`
Paths: `src/**`, `content/modules/**`, `PRODUCT.md`, `CONTENT.md`, `ARCHITECTURE.md`, `README.md`, `START_HERE.md`, `docs/**`

1. Chạy focused checks rồi full tests/lint/build trên cùng final snapshot; lưu evidence theo criterion.
2. Manual matrix: 6 baseline missions; spoken permission granted/denied/unsupported; written privacy message; retry/transfer/review; reload/resume; import preview/confirm; invalid import; export/reset; mobile/desktop; keyboard-only.
3. Regression từng 6 pronunciation v1 và Daily Standup v2 qua normalization, completion, recording fallback và backup round-trip.
4. Review độc lập correctness/security/privacy/accessibility/maintainability và task compliance; sửa mọi finding nghiêm trọng rồi rerun affected checks + full gates.
5. Chỉ finish Harnix khi evidence fresh, criteria met và working tree review không có accidental deletion; không commit/push/PR.

## Sequencing và dependency graph

`S1 → S2 → S3`; sau canonical/domain ổn định, `S4` và phần shell của `S5` có thể tiến song song về mặt thiết kế nhưng merge tuần tự để giữ green. `S6` phụ thuộc `S3–S5`; `S7` chỉ archive legacy sau `S4–S6`; `S8` là gate cuối.

## Preservation và rollback

Raw v1/v2 content và raw legacy backup là rollback anchors. Không rewrite tại chỗ; canonical adapters và versioned migration là seam chuyển đổi. Vì working tree chưa track, trước mọi move/delete khi implement phải inventory exact paths, copy-preserve nội dung và review diff; task này không cho phép destructive cleanup.
