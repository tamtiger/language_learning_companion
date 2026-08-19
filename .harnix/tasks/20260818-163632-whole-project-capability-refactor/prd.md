# PRD — Refactor toàn dự án theo sáu capability

## 1. Outcome và nguyên tắc sản phẩm

Biến repository hiện tại từ hai hệ thống rời nhau — curriculum Markdown giàu ý tưởng nhưng không chạy trong app, và JSON content player chủ yếu luyện nhận biết — thành một offline-first capability learning engine duy nhất. Người học phải tạo được đầu ra nghề nghiệp có thể quan sát, retry trên feedback tự đánh giá, transfer sang ngữ cảnh mới và quay lại delayed review.

Sáu capability tối cao:

1. Giao tiếp tiếng Anh tự tin trong công việc.
2. Đọc tài liệu kỹ thuật mà không cần bản dịch.
3. Tham gia họp với đồng nghiệp quốc tế.
4. Giải thích ý tưởng kỹ thuật bằng tiếng Anh.
5. Phỏng vấn và làm việc tại công ty nước ngoài.
6. Học công nghệ mới hoàn toàn bằng tiếng Anh.

North-star là `time-to-capability`: thời gian từ baseline đầu tiên đến lần transfer độc lập đạt rubric của từng capability. Số lesson hoàn thành, streak và thời gian trong app chỉ là tín hiệu phụ, không phải outcome.

## 2. Baseline đã kiểm chứng ngày 2026-08-18

- Stack React 19 + TypeScript + Vite + Zustand + Zod đang khỏe; `npm test` PASS 50/50, `npm run lint` PASS và `npm run build` PASS. Không có lý do để rewrite framework.
- App có 6 lesson pronunciation v1 và 1 lesson Daily Standup v2. Sáu lesson v1 chỉ có recognition practice, dữ liệu không đạt chính content contract hiện hành; Daily Standup là performance loop duy nhất.
- `LessonPlayer.tsx` khoảng 699 dòng, `PerformanceTask.tsx` khoảng 371 dòng; điều hướng, quiz, media, completion và persistence bị kết dính.
- Store khoảng 226 dòng đang trộn content loading, UI state, progress, migration và backup.
- Có 5 test files; chưa có component/integration/a11y harness.
- `docs/`, `lessons/` và `modules/` chứa curriculum/mission/assessment phong phú nhưng app không consume; một phần giả định AI feedback dù runtime hiện tại local-only và không có AI.
- Toàn bộ working tree chưa được Git track, vì vậy mọi file hiện có được coi là user-owned và phải được bảo toàn.

## 3. Người dùng, constraint và non-goals

Người dùng chính là Software Engineer Việt Nam tự học, cần bài ngắn, chạy được một mình, ưu tiên task giống công việc thật. App tiếp tục chạy hoàn toàn trong browser, không account, không server, không network dependency trong learning flow.

Không thuộc task này:

- Sản xuất hàng chục lesson hoàn chỉnh; task chỉ cần 6 baseline mission nguyên bản và giữ 7 lesson hiện có.
- AI scoring, speech-to-text, cloud sync, server analytics, paid API hoặc third-party upload.
- Lưu audio, response text tự do hoặc dữ liệu nhạy cảm vào localStorage/backup.
- Big-bang rewrite, rewrite JSON legacy tại chỗ, xóa curriculum legacy trước khi có thay thế, commit/push/PR.

## 4. Learning loop chuẩn

Một loop chung phục vụ cả sáu capability:

1. `baseline`: thực hiện task trước khi xem model/scaffold.
2. `input`: đọc/nghe brief, source và language support bằng tiếng Anh.
3. `auto-check`: kiểm tra comprehension/ordering khi task cần.
4. `performance`: tạo spoken hoặc written output trong timebox.
5. `self-feedback`: chấm rubric và independence signals; app không giả lập AI score.
6. `retry`: làm lại cùng task với một ưu tiên feedback.
7. `transfer`: làm biến thể cùng workflow nhưng khác nội dung/ngữ cảnh.
8. `delayed-review`: làm lại transfer variant theo lịch content-owned.

Completion của mission v3 yêu cầu có performance attempt, rubric đã được tự đánh giá và transfer hoàn tất; auto-check không thể tự mình hoàn thành mission. Legacy v1 giữ completion rule cũ để không phá hành vi.

## 5. Canonical content contract v3

`LessonV3` là authoring contract; tất cả v1/v2/v3 được parse rồi normalize sang `CanonicalLesson` trước khi UI nhìn thấy dữ liệu.

Các trường bắt buộc của v3:

- Metadata: `schemaVersion: 3`, `id`, `title`, `summary`, `cefrLevel`, `durationMinutes`, `capabilities`, `workflowTags`.
- `sections`: ordered discriminated union gồm `brief`, `language-support`, `source`, `auto-check`. Source hỗ trợ `prose`, `dialogue`, `meeting-notes`, `technical-doc`, `code-snippet`; auto-check tái sử dụng `choice`, `matching`, `ordering`.
- `performanceTask`: `id`, `mode` (`spoken | written`), `scenario`, `baselinePrompt`, `performancePrompt`, `retryPrompt`, `transferPrompt`, `reviewPrompt`, `outputContract`, `independenceContract`, `rubric`, `feedbackPriorities`.
- `outputContract`: `timeLimitSeconds`, `requiredElements`, và constraint theo mode (`targetSeconds` cho spoken; `minWords`/`maxWords` cho written).
- `independenceContract`: `noVietnamese`, `noTranslation`, `noModelAnswer`, `maxHints`, `preparationSeconds`.
- `rubric`: 3–5 criterion có `id`, `label`, `description`; không dùng weight hoặc điểm tổng hợp giả chính xác.
- `reviewPolicy`: `intervalDays: [1, 3, 7]`. Đây là heuristic v1 có cấu hình trong content, không phải tuyên bố lịch tối ưu cho mọi người.

Invariant:

- Mỗi mission v3 có đúng một primary capability và ít nhất một performance task.
- ID duy nhất trong toàn catalog; reference từ task sang section phải tồn tại.
- Spoken/written constraint không được trộn sai mode.
- Baseline không lộ model response; model/scaffold chỉ xuất hiện sau attempt đầu tiên.
- UI render theo `type`/`mode`, không branch theo lesson ID, topic hoặc capability.
- V1 normalization tạo canonical sections và giữ legacy completion; v2 normalization chuyển spoken performance hiện tại sang task contract; source JSON cũ không bị rewrite.

## 6. Sáu baseline mission

| ID | Capability | Mode | Authentic output | Timebox |
|---|---|---|---|---|
| `workplace-issue-update-b1` | workplace communication | written | Viết issue update 80–120 từ: context, impact, next step, request | 8 phút |
| `technical-doc-action-b1` | technical reading | written | Đọc mini technical doc rồi ghi 4 action/error-recovery bullets không dịch | 10 phút |
| `daily-standup-b1` | international meetings | spoken | Standup 60–90 giây và trả lời một clarification prompt | 6 phút |
| `technical-tradeoff-explanation-b2` | explain technical ideas | spoken | Giải thích lựa chọn, trade-off và recommendation trong 90–120 giây | 8 phút |
| `technical-interview-decision-b2` | international interview/work | spoken | Trả lời behavioral/technical decision có evidence trong 2 phút | 10 phút |
| `learn-api-from-docs-b2` | learn technology in English | written | Đọc mini API docs, tóm tắt mental model và lập implementation plan 120–180 từ | 12 phút |

Daily Standup v2 được migrate nội dung thành mission thứ ba, không tạo bản sao. Mỗi mission có source/input, output contract, independence contract, rubric, retry, transfer và review prompt riêng. Nội dung phải nguyên bản hoặc có license/provenance rõ; không copy tài liệu proprietary.

## 7. Progress, privacy và scheduling

Persisted `ProgressEnvelopeV2` gồm `storageVersion`, `lessonProgress`, `settings` và metadata import; mọi import được Zod validate trước khi replace state.

`LessonProgress` gồm:

- `status: not-started | in-progress | completed`, `currentSectionId`, `completedSectionIds`.
- `attemptCount`, `recentAttempts` tối đa 50 metadata records/lesson.
- `transferCompleted`, `reviewStage`, `nextReviewAt`, `lastActivityAt`.
- `legacyImport` để bảo toàn completed/incorrect-answer/performance summary cũ mà không bịa attempt chi tiết.

`AttemptEvidence` chỉ lưu `attemptId`, `lessonId`, `taskId`, `capabilityId`, `phase`, `attemptedAt`, `durationSeconds`, rubric state (`met | not-met | not-rated`), independence booleans/counts và completion flag. Không persist audio blob, transcript, written response, model input hoặc free-text note.

Scheduler pure/deterministic:

- Attempt transfer đạt rubric tự đánh giá đặt review stage 0 vào `+1 ngày`.
- Review đạt rubric tăng stage theo `[1, 3, 7]`; hoàn tất stage cuối thì `nextReviewAt = null`.
- Review chưa đạt giữ nguyên stage và đặt lại `+1 ngày`.
- Today queue sort: review quá hạn lâu nhất → active loop đang dở → baseline capability chưa có evidence → next new lesson. Tie-break bằng capability order rồi lesson ID để test ổn định.
- Người dùng có thể resume section và queue sau reload; response draft/audio vẫn chỉ tồn tại trong session.

Migration fail-closed:

- Parse envelope hiện tại; nếu invalid thì giữ state đang chạy và báo lỗi, không tự reset.
- Map `completedLessons` sang status completed có `legacyImport`; map performance summary sang aggregate fields, không tạo timestamp/rubric giả.
- Import backup cũ/mới qua normalize → validate → preview summary → explicit confirm → atomic replace.
- Export chỉ từ allowlist contract; reset yêu cầu confirm và không ảnh hưởng source content.

## 8. Information architecture và UX

- `Today`: một next action rõ ràng, queue review/baseline/resume và evidence theo 6 capability.
- `Catalog`: group/filter theo capability và workflow; CEFR là filter phụ.
- `Lesson`: app shell + ordered section renderer + performance renderer; state machine rõ `baseline/input/practice/performance/feedback/retry/transfer/review/completed`.
- `Progress`: hiển thị observed evidence như transfer completed, rubric trend và independence trend; không tính phần trăm năng lực từ dữ liệu thiếu.

Critical UI dùng native `button`, `a`, form controls và headings; có visible focus, logical focus order, semantic labels, live region cho timer/save/error/completion, keyboard flow, error/retry states và responsive layout từ mobile đến desktop. Không còn clickable `div`.

## 9. Source of truth và tài liệu

- `PRODUCT.md`: outcome, user journey, success metrics, privacy/non-goals.
- `CONTENT.md`: v3 authoring/schema/invariants/examples và legacy policy.
- `ARCHITECTURE.md`: boundaries, data flow, persistence/migration, testing.
- `README.md`: developer quickstart; `START_HERE.md`: learner quickstart.
- `IMPROVEMENT_PROMPT.md`: continuous-improvement command; các prompt khác chỉ dẫn chiếu owner docs, không lặp contract.
- JSON dưới `content/modules/` là executable curriculum duy nhất.
- Markdown curriculum cũ được bảo tồn dưới `docs/legacy/` với banner non-executable/non-current sau khi link và nội dung còn giá trị đã được chuyển; không xóa trong task.

## 10. Target module boundaries

- `src/content`: schema v1/v2/v3, normalization, catalog loading/validation.
- `src/domain/learning`: pure task phase, rubric, completion và capability rules.
- `src/domain/progress`: evidence aggregation, scheduling và Today selectors.
- `src/infrastructure/storage`: envelope, migration, import/export/reset.
- `src/app`: shell và page composition.
- `src/features/catalog`, `src/features/today`, `src/features/lesson`, `src/features/practice`, `src/features/progress`: UI orchestration.
- `src/shared`: reusable UI/hooks only; không chứa business rule.

Zustand trở thành adapter mỏng gọi pure domain/storage functions; content loading không nằm chung persistence. Không thêm router, database wrapper hoặc network SDK. Chỉ thêm test-only dependencies cần thiết cho DOM/component/user-event/a11y smoke sau khi khóa version tương thích.

## 11. Acceptance

### AC `AC-1`

PRODUCT.md, CONTENT.md, ARCHITECTURE.md, README/START_HERE và các prompt owner mô tả nhất quán một capability-first product, sáu outcome, source-of-truth, migration và phạm vi offline/local-only; không còn contract lỗi thời hoặc mâu thuẫn được trình bày như hiện hành.

### AC `AC-2`

Content engine có canonical schema v3 data-driven cho input, auto-check và performance task spoken/written, rubric, retry, transfer và delayed review; parser vẫn đọc an toàn toàn bộ lesson v1/v2 hiện có qua normalization có test.

### AC `AC-3`

Có sáu baseline assessment/mission nguyên bản, mỗi mission đại diện đúng một outcome tối cao và khai báo authentic task, input, output, timebox, independence conditions, rubric, retry, transfer variant và delayed review.

### AC `AC-4`

Catalog và curriculum trong app được tổ chức theo capability/workflow thay vì chỉ CEFR hoặc pronunciation; mỗi content unit chạy được từ JSON mà không cần thêm topic-specific branch trong React.

### AC `AC-5`

UI architecture được tách thành app shell, catalog/today, lesson orchestration, section renderers và performance renderers; LessonPlayer không còn monolith sở hữu quiz, media, navigation và completion trong cùng component.

### AC `AC-6`

Progress model lưu attempt history metadata, rubric, independence signals, transfer, completion và nextReviewAt; migration và backup round-trip dữ liệu cũ/mới fail-closed, không persist media hoặc nội dung nhạy cảm ngoài contract.

### AC `AC-7`

Người học có Today/Review queue ưu tiên baseline chưa làm và practice đến hạn, có thể tiếp tục learning loop sau reload và thấy bằng chứng tiến bộ theo sáu capability thay vì chỉ phần trăm lesson.

### AC `AC-8`

Critical flows responsive, keyboard-operable và có semantic labels, focus behavior, live status và error states được kiểm tra tự động hoặc manual có evidence; clickable div và navigation/state không truy cập được bằng bàn phím được loại bỏ.

### AC `AC-9`

Sáu lesson pronunciation v1 và Daily Standup v2 vẫn tải/chạy sau refactor; local-only recording, timer fallback, reset và import/export giữ hành vi an toàn, có rollback qua normalization/migration thay vì rewrite dữ liệu người dùng.

### AC `AC-10`

Focused tests, content validation, component/integration tests, full test suite, lint, production build, accessibility smoke và manual critical flows đều PASS trên snapshot cuối; review độc lập không còn finding nghiêm trọng trong scope.
