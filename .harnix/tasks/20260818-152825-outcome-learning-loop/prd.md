# PRD — Vòng lặp luyện nói Daily Standup theo năng lực

## Vấn đề

App hiện có sáu lesson pronunciation B1 và chỉ đo recognition quiz. Schema v1 không biểu diễn spoken output, feedback, retry, transfer hoặc bằng chứng năng lực, nên lesson completion chưa chứng minh người học có thể tham gia meeting.

## Outcome và người dùng

Software Engineer B1 hoàn thành một Daily Standup 60–90 giây, nghe lại, tự đánh giá, làm lại bằng tình huống biến thể và giữ metadata tiến bộ cục bộ. Mục tiêu là rút ngắn time-to-capability cho giao tiếp công việc.

## Trong phạm vi

- Đồng bộ PRODUCT.md, CONTENT.md và ARCHITECTURE.md.
- Giữ lesson schema v1 và thêm schema v2 có performanceTask.
- Thêm một lesson Daily Standup B1 nguyên bản.
- Record/playback audio local bằng MediaRecorder; timer-only fallback.
- Self-rubric, retry, transfer và completion gate.
- Persist metadata, không persist media.
- Backup/import metadata mới an toàn.
- Test schema, content, state, logic và regression.

## Ngoài phạm vi

AI scoring, cloud/account, curriculum đầy đủ, rewrite pronunciation, lưu audio, redesign toàn app.

## Contract lesson v2

Lesson v2 giữ field v1 và thêm performanceTask bắt buộc:

- id: lowercase identifier.
- mode: spoken.
- title, scenario, prompt: string không rỗng.
- preparationSeconds: integer 0–300.
- performanceSeconds: integer 30–300.
- requirements: 1–6 string.
- modelResponse: model nguyên bản.
- rubric: 3–6 item gồm id, criterion, successDescription.
- retryPrompt và transferPrompt: string không rỗng.
- feedbackPriorities: 1–4 string theo communicative impact.

Parser dùng discriminated union theo schemaVersion. V1 không có performanceTask và giữ hành vi hiện tại.

## Contract tương tác

1. Attempt đầu xảy ra trước khi model hiện.
2. MediaRecorder khả dụng: audio chỉ ở memory qua Blob URL; revoke khi thay recording/unmount.
3. Unsupported/denied: thông báo rõ và timer-only fallback, không chặn task.
4. Sau attempt đầu, hiện model và yêu cầu yes/no cho mọi rubric item.
5. Attempt thứ hai dùng transferPrompt và tự đánh giá lại.
6. Completion cần attemptCount >= 2, transferCompleted true và rubric đầy đủ.
7. Persist chỉ attemptCount, lastAttemptAt ISO, latestRubric, transferCompleted.
8. Không persist/upload audio, transcript hay permission state.

## Compatibility

Persisted state cũ thiếu performanceProgress hydrate thành object rỗng. Export thêm field mới; import validate shape và chấp nhận backup cũ bằng default rỗng. Existing v1 lesson, quiz và incorrectAnswersLog không đổi.

## Acceptance

### AC `AC-1`

PRODUCT.md, CONTENT.md và ARCHITECTURE.md mô tả nhất quán capability-first, lesson schema v2 và ranh giới local-only của performance practice; research task-owned liên kết quyết định với nguồn trực tiếp và nêu giới hạn.

### AC `AC-2`

Runtime schema chấp nhận toàn bộ lesson v1 hiện có và lesson v2 có spoken performanceTask hợp lệ, đồng thời từ chối performanceTask thiếu field bắt buộc, sai giới hạn thời gian hoặc rubric không hợp lệ.

### AC `AC-3`

Có một lesson JSON B1 Daily Standup nguyên bản gồm scenario, model, output requirements, attempt chính, self-rubric, retry và transfer prompt; lesson vượt qua runtime validation và content rules.

### AC `AC-4`

Lesson Player chỉ hiển thị tab thực hành cho lesson v2, hỗ trợ ghi và phát lại audio hoàn toàn local khi MediaRecorder khả dụng, có timer-only fallback rõ ràng khi không khả dụng hoặc bị từ chối, và không persist hay upload audio.

### AC `AC-5`

Người học chỉ hoàn thành lesson v2 sau ít nhất hai attempt gồm transfer attempt và đã trả lời mọi mục self-rubric; app persist attemptCount, lastAttemptAt, latestRubric và transferCompleted nhưng không persist media.

### AC `AC-6`

Sáu lesson v1, quiz, progress và backup hiện có tiếp tục hoạt động; dữ liệu persisted cũ được đọc an toàn và export/import bảo toàn performance progress mới.

### AC `AC-7`

Toàn bộ test, content validation, lint và production build đều PASS sau thay đổi, và manual critical-flow check xác nhận record/playback, fallback, retry, transfer và reload không làm mất metadata.
