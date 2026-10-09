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

- `src/content`: Zod raw schemas, source-registry validation, `CanonicalLesson`,
  migration/normalization và catalog validation.
- `src/domain/learning`: phase transitions, rubric và completion rules.
- `src/domain/progress`: attempt evidence, capability aggregation, review scheduling và Today selectors.
- `src/infrastructure/storage`: `ProgressEnvelope` với `storageVersion: 5`, validated
  import/export/reset và canonical migration V3/V4 → V5.
- `src/app`: semantic app shell và typed in-memory navigation.
- `src/features/catalog`, `today`, `lesson`, `practice`, `progress`: UI orchestration.
- `src/shared`: UI primitives, media adapters và generic hooks; không chứa business rules.

Zustand là adapter mỏng: compose state/actions và persist allowlisted progress. Catalog loading, migration logic và completion logic không nằm trong store.

## Content discovery và taxonomy authoring

Mười hai mission v3 được biên soạn tại
`content/missions/<primary-capability>/<lesson-id>.json`; sáu pronunciation lesson
v1 dạng knowledge/reference nằm tại
`content/reference/pronunciation/<lesson-id>.json`. Các segment thư mục chỉ tổ
chức taxonomy authoring. Catalog vẫn khám phá JSON bằng glob
`content/**/*.json`, rồi parser/schema và các field trong từng lesson mới quyết
định schema version, capability, mode, completion semantics và runtime behavior.

## Canonical content và migration

`parseLesson(raw)` chọn `LessonV1Schema | LessonV2Schema | LessonV3Schema`; `normalizeLesson` trả cùng một `CanonicalLesson`.

- V1 normalize thành canonical sections và `completionMode: "legacy-quiz"`.
- V2 normalize thành canonical sections + spoken task và `completionMode: "performance"`.
- V3 đã có sections + spoken/written task và `completionMode: "capability-loop"`.
- V3 có thể khai báo lesson-local `sourceRegistry` và reference provenance trên
  source artifact. Parser fail closed với reference/HTTPS/date/note sai;
  normalization resolve metadata thành `resolvedSources` trên section, practice
  context và reading ladder trước khi canonical lesson tới UI.
- V3 performance task có thể khai báo `practiceContexts` cho baseline, optional retry, transfer
  và review. Mỗi context chứa 1–4 source artifact; parser validate ID duy nhất
  trong context và canonical task giữ nguyên dữ liệu đã parse.
- Written V3 task có thể khai báo `ReadingLadderV1`. Runtime giữ ladder state
  (`read → extract → apply`) trong component; answer/application draft không đi
  vào `AttemptEvidence` hoặc storage. Baseline/transfer/review dùng read-once gate
  và chỉ mở textarea sau khi artifact đã bị ẩn.
- Raw v1/v2 JSON không rewrite, là rollback anchor.

Catalog trả lessons hợp lệ cùng structured errors; một file lỗi không làm crash toàn app nhưng phải làm content validation test fail.

Spoken v3 task có thể khai báo `LearningLoopV1`. Model audio được resolve qua
adapter local: bundled relative asset hoặc browser speech synthesis. Adapter
không fetch URL bên ngoài; TTS được gắn nhãn và voice count thực tế được đưa vào
process evidence thay vì suy diễn speaker/accent coverage.
Player truyền playback rate 0.85/1/1.15 thật cho Web Speech hoặc bundled audio.
Locale/hints chỉ là yêu cầu chọn device voice và UI công khai fallback; không có
network fetch hoặc human-accent claim.

## Learning state machine

Capability loop: `baseline → input` (content và auto-check) `→ performance → self-feedback → retry → transfer → completed`, sau đó có thể vào `review` khi đến hạn. Spoken task có learning loop đi qua `interaction` giữa performance và self-feedback.

Với learning-loop pilot, phase `input` chứa domain state machine thuần
`perception → pronunciation-cue? → guided-shadowing → ready-for-performance`.
Riêng `PerceptionPractice` triển khai chuỗi nội bộ `pretest → training → posttest`
trước khi trả evidence cho domain reducer. Illegal transition bị từ chối trong domain.

Pure transition guards ngăn model answer xuất hiện trước baseline, ngăn mission hoàn thành khi chưa self-rate rubric hoặc transfer. UI chỉ dispatch events và render phase.

Practice renderer chọn context bằng phase hiện tại và chỉ mount artifacts của
context đó. Đây là content-driven behavior, không có branch theo lesson ID và
không thay đổi progress/storage contract.

Source renderer chỉ nhận canonical source. Origin luôn nhìn thấy khi metadata có
mặt; publisher/version/location/reuse/right nằm trong native disclosure. UI không
đọc raw registry, không fetch/iframe nguồn và không tạo claim khi lesson chưa opt-in.
External reference chỉ phát sinh network sau thao tác mở link của người dùng.

Với written reading ladder, `input` chỉ mở performance sau khi extraction đúng và
application checklist hoàn tất. Read-once là instructional constraint: source ẩn
trong phase hiện tại nhưng reload có thể bắt đầu phase lại; app không xem nó như
cơ chế chống gian lận.

Sau self-feedback, UI bắt buộc chọn một `retry focus` trong các criterion `not-met`
(nếu có). Retry phải tạo output và chấm lại toàn bộ rubric trước transfer. Focus được
lưu bằng ID có cấu trúc, không dùng free-text feedback.

## Progress và privacy

`ProgressEnvelope` V5 lưu status/current section, `activePhase`, các exercise đã đúng,
aggregate count, tối đa 50 attempt metadata gần nhất, optional `focusCriterionId`,
transfer flag, review stage/`nextReviewAt`, `activeProcessEvidence` và settings.
Mỗi attempt bắt buộc có duration dương, `wordCount` nullable và preparation time
đo từ phiên.

Attempt V5 có optional process metadata đã allowlist: perception counts,
training/shadowing/interaction completion IDs, listen-back cùng trạng thái hoàn tất
checklist nghe lại, cue latency, audio variant count/qualification và opt-out. Không
lưu answer, transcript, response, audio URL/blob hoặc pronunciation score. Backup
V3 hợp lệ được migrate với `process: null`; backup V4 được bổ sung
`listenBackChecklistCompleted: false`; cả hai được thêm
`activeProcessEvidence: null`. Local persist giữ cùng storage key và dùng middleware
version 5.

Attempt transfer và review lưu thêm `assessment` (`qualifies` và danh sách reason code) cùng
`contentRevision` (băm ổn định của hợp đồng bằng chứng lúc làm). Hai trường này là tùy chọn
nên `storageVersion` vẫn là 5 và backup cũ vẫn nhập được; attempt không có `assessment` hiển
thị là "chưa có đánh giá" và không tính đạt. Progress dùng kết quả đã lưu, không chấm lại
bằng nội dung hiện tại; nếu `contentRevision` khác hợp đồng hiện tại thì chỉ gắn nhãn
"bài đã đổi sau lượt này".

Pure progress selectors định nghĩa `qualifying transfer` là completed transfer có
rubric không rỗng và toàn bộ `met`, không dùng tiếng Việt, translation, model answer
và không vượt content-owned `maxHints`, time limit hoặc output length. Progress UI
hiển thị riêng attempts, transfer attempts, qualifying transfers và reason codes;
không đếm một independent baseline/retry như transfer đạt.

inputProgress (tùy chọn) là điểm tiếp tục của phần luyện đầu vào: vị trí và điểm perception, bước sentence chunks, trạng thái learning loop, stage và các lựa chọn của reading ladder. Nó chỉ là metadata, được xóa khi hoàn tất input hoặc luyện lại.

Không lưu audio/blob URL, transcript, written response hoặc free-text. Backup import
và Zustand hydration cùng đi qua canonical migration: parse v5 hoặc migrate v3/v4
→ validate → preview → explicit confirm → atomic replace. Import malformed,
v1/v2/future version giữ nguyên state và trả recoverable error; không reset ngầm.

Vì app chưa phát hành, state v1/v2 bị bỏ và khởi tạo rỗng; không có
`legacy-unknown` hoặc evidence giả.

## Resume và pronunciation

`activePhase` là checkpoint bền vững: input, performance, retry hoặc transfer.
Self-feedback giữ learner output trong memory; reload tại đây quay về performance.
Pronunciation lưu union các exercise ID đã đúng, chỉ bật Finish khi đủ toàn bộ và
restart tạo progress rỗng.

## Review scheduling

Scheduler là pure function nhận clock. Chỉ transfer đạt hợp đồng (`assessTransfer` qua
`applyTransferOutcome`) mới đặt `completed` và lên lịch review theo
`reviewPolicy.intervalDays` content-owned của lesson; transfer chưa đạt giữ mission ở phase
transfer, không đặt lịch. Review đạt khi `assessReview` không có reason (rubric không rỗng,
độc lập, đúng output contract) thì tăng stage; review chưa đạt giữ stage và lặp vào ngày kế
tiếp. Mốc đến hạn là 00:00 theo ngày lịch địa phương của ngày đích (`addLocalDays`), lưu
dạng ISO và so sánh `nextReviewAt <= now`. Today tính queue từ `useNow` (làm mới mỗi 60 giây
và khi tab hiện lại).

Today queue có thứ tự deterministic: overdue review → active loop → capability baseline
chưa có evidence → next new lesson. Lesson đang luyện lại mà review đến hạn phát hai mục
(`review` và `resume`); lối vào mang ý định `entry` (`review` hoặc `continue`) để mở đúng
phase. "Luyện lại" cần xác nhận, xóa tiến độ vòng hiện tại nhưng giữ lịch sử, `reviewStage`
và `nextReviewAt`.

## Persistence status

Store giữ `persistence.status` (không được lưu): `ok`, `memory-only` (trình duyệt chặn
localStorage, dùng bộ nhớ), `quarantined` (hydrate bị từ chối, không ghi đè dữ liệu cũ) và
`write-failed` (`setItem` ném lỗi như quota; không ném ra khỏi hành động UI, lần ghi thành
công sau đó đặt lại). `App` hiện `PersistenceBanner` có đường vào Cài đặt. Sự kiện `storage`
của khóa persist áp dụng theme, CEFR và progress từ tab khác mà không ghi ngược và không đổi
lesson đang mở; khi đang quarantined thì bỏ qua. Đồng bộ là bản ghi sau cùng thắng.

## Offline và bền dữ liệu

`scripts/vite-plugin-offline.mjs` phát `sw.js` khi build: precache mọi file của bundle cộng
`manifest.webmanifest` và icon; điều hướng ưu tiên mạng rồi rơi về `index.html` đã cache, asset
cùng origin ưu tiên cache. Tên cache gồm băm danh sách precache nên bản mới thay bản cũ ở lần mở
sau. `src/app/registerServiceWorker.ts` chỉ đăng ký ở production. `npm run check:offline` build rồi
kiểm tra `sw.js`, manifest và link trong `index.html`.

`src/infrastructure/storage/storageHealth.ts` bọc `navigator.storage.persist` và lưu
`lastExportedAt` ở khóa localStorage riêng (không đổi schema tiến độ); `ExportReminder` nhắc xuất
backup khi có tiến độ và quá 7 ngày. `playModelAudio` báo trạng thái thật (`onstart`, `onend`,
`onerror`, `play()` bị từ chối), ưu tiên voice `localService`, chờ `voiceschanged` tối đa 1,5 giây
và báo `unavailable` khi chỉ có voice cần mạng lúc offline.

## Accessibility

Native semantics trước ARIA. Mọi action dùng button/link/form control; focus order có nghĩa, focus visible, heading target sau navigation và live region cho timer/save/error/completion.

- **Nút bị chặn** dùng `GuardedButton` (`aria-disabled` + mô tả lý do) thay vì `disabled` để không mất focus và luôn nêu lý do; lựa chọn đã trả lời của perception cũng dùng `aria-disabled`.
- **Focus** chuyển sang điều khiển kế tiếp khi điều khiển đang giữ focus bị thay (ghi âm, perception, reading ladder); kết quả và phản hồi nằm trong `role="status"` luôn có mặt trong DOM.
- **Ngôn ngữ**: nội dung hiển thị có `lang` theo `languageOf` (có ký tự tiếng Việt là `vi`, còn lại `en`); bản nháp là `lang="en"`. Heading của task kèm tên phase (baseline, retry, transfer, review) cho trình đọc màn hình; mỗi tiêu chí rubric là một `role="group"` có tên.
- **Rời trang**: `useUnsavedWork` chặn `beforeunload` khi có bản nháp hoặc đang ghi âm; điều hướng nội bộ gọi `confirmLeave()` (`window.confirm`). `ErrorBoundary` bao nội dung chính và có nút về Today.
- **Thời gian**: bài viết có đồng hồ `role="timer"`; retry, transfer và review có bước "Chốt bản nháp" dừng đồng hồ trước khi mở rubric, nên `durationSeconds` không gồm thời gian chấm. Thời gian đọc source read-once và chờ quyền microphone không bị tính.
- **Kiểm thử**: axe chạy trên Today, Catalog, Progress, Settings và các phase của LessonFlow (`tests/app/axeMatrix.test.tsx`, `tests/features/lesson/lessonFlowAxe.test.tsx`); tương phản màu kiểm bằng bảng màu và `tests/app/App.test.tsx`. Source trust dùng `details/summary` keyboard-native; raw schema/mode/phase không xuất hiện trong learner-facing header. Recording luôn có textual state và unsupported/permission-denied fallback.

## Verification

- Node tests: schema, normalization, domain, scheduling, storage.
- DOM tests: app shell, keyboard, focus, live status, error/retry và các luồng của 12 mission.
- Catalog test đọc toàn bộ JSON.
- Gates: focused tests → full `npm test` → `npm run lint` → `npm run build` → manual critical flows.
- Mỗi Harnix required check được snapshot trước/sau cùng input digest trước khi ghi evidence.

Ứng dụng không commit, push, publish hoặc gửi network trong workflow này.

## P1 spoken coverage

Cả 6 spoken missions là v3 và dùng cùng generic `LearningLoopV1` renderer. Cue
selection nhận diagnostic miss từ pre/post; training errors không trở thành learner
profile. `interruption` là scripted turn local giống clarification/repair và mỗi
turn remount `SpokenResponse`, nên không cần ASR, backend hoặc persistence mới.
