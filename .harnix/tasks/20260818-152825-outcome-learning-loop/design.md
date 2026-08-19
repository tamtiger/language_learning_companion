# Design — Spoken performance task v2

## Data contract

LessonSchema là discriminated union theo schemaVersion:

- v1: contract hiện tại, không có performanceTask.
- v2: contract v1 cộng performanceTask bắt buộc.

PerformanceTask:
- id: string theo pattern lowercase-hyphen/underscore.
- mode: literal spoken.
- title, scenario, prompt, modelResponse, retryPrompt, transferPrompt: string không rỗng.
- preparationSeconds: integer 0–300.
- performanceSeconds: integer 30–300, là timebox tối đa.
- requirements: array 1–6 string không rỗng.
- feedbackPriorities: array 1–4 string không rỗng.
- rubric: array 3–6 PerformanceRubricItem.

PerformanceRubricItem:
- id: lowercase identifier, unique trong rubric.
- criterion: nhãn ngắn.
- successDescription: mô tả yes/no quan sát được.

Zod superRefine kiểm tra rubric id unique. Lesson v2 invalid nếu performanceTask thiếu field hoặc vượt giới hạn. V1 không bị transform thành v2.

## Persisted state

PerformanceProgress:
- attemptCount: non-negative integer.
- lastAttemptAt: ISO timestamp hoặc null.
- latestRubric: Record rubricId -> boolean.
- transferCompleted: boolean.

AppState thêm performanceProgress: Record lessonId -> PerformanceProgress và action recordPerformanceAttempt.

recordPerformanceAttempt nhận:
- lessonId.
- rubricAnswers.
- isTransfer.
- attemptedAt.

Action tăng attemptCount đúng một lần cho mỗi attempt completed, thay latestRubric, cập nhật lastAttemptAt và OR transferCompleted. UI gọi action khi learner kết thúc self-assessment của attempt, không khi chỉ bắt đầu timer/recording.

Lesson v2 completion predicate:
- attemptCount >= 2.
- transferCompleted === true.
- latestRubric có key cho mọi rubric item.
- Giá trị rubric không bắt buộc đều true vì đây là completion của practice loop, không phải proficiency certification.

V1 tiếp tục dùng quiz completion hiện tại.

## Interaction state machine

Phase:
1. brief: scenario, requirements, preparation.
2. attempt: attempt chính; model chưa hiển thị.
3. reflect: playback nếu có, model, feedback priorities và rubric.
4. transfer: transferPrompt, attempt thứ hai.
5. transfer-reflect: playback/model/rubric.
6. complete: lưu metadata và mở completion action.

Không cho chuyển reflect nếu attempt chưa kết thúc. Không cho complete nếu rubric thiếu câu trả lời.

## Media boundary

Media state:
- idle.
- requesting.
- recording.
- recorded.
- unsupported.
- denied.
- error.

Luồng recorder:
1. Feature-detect navigator.mediaDevices.getUserMedia và globalThis.MediaRecorder.
2. Request audio only sau click trực tiếp của người dùng.
3. Giữ MediaStream, MediaRecorder, chunks và Blob URL trong component/adapter memory.
4. Stop mọi MediaStreamTrack sau stop, error, cancel và unmount.
5. Revoke Blob URL trước khi thay URL và khi unmount.
6. Không đưa Blob, stream, transcript hoặc permission state vào Zustand/localStorage.
7. Không có network request trong adapter.

Error precedence:
- API thiếu hoặc insecure context: unsupported.
- NotAllowedError hoặc SecurityError: denied.
- lỗi khác: error với message an toàn.
- Mọi failure chuyển sang timer-only fallback; learner không phải reload.

Timer fallback:
- Giữ cùng preparation/performance timebox.
- Người học bấm bắt đầu và nói ngoài cơ chế record.
- Nút kết thúc attempt chỉ bật sau 30 giây hoặc khi performanceSeconds nhỏ hơn 30 thì sau toàn bộ timebox; schema hiện không cho nhỏ hơn 30.
- UI nói rõ audio không được ghi và self-rubric là low-stakes.

Recorder path có thể stop sớm; duration không phải bằng chứng proficiency. Rubric và transfer vẫn bắt buộc.

## Model visibility

modelResponse bị ẩn ở phase brief/attempt. Nó xuất hiện từ reflect trở đi để tránh biến attempt đầu thành đọc script.

## Backup compatibility

Tách BackupSchema khỏi Settings UI:
- completedLessons: record boolean.
- incorrectAnswersLog: record array string.
- performanceProgress: optional record PerformanceProgress, default object rỗng.
- exportedAt: optional ISO string.

Import parse bằng Zod trước khi ghi state. Backup cũ thiếu performanceProgress hợp lệ. Backup sai shape không ghi partial state. Export luôn ghi performanceProgress. Reset xóa performanceProgress.

Zustand persist tăng version và migrate missing performanceProgress thành object rỗng; các field cũ giữ nguyên.

## Component boundary

- PerformanceTask.tsx: UI và orchestration.
- performance_task.ts: pure phase/completion helpers.
- media_recorder.ts: browser adapter và cleanup.
- LessonPlayer.tsx: tab routing, nhận completion callback, không chứa recorder internals.
- backup schema/helper: data validation, không phụ thuộc React.

## Privacy và accessibility

- Hiển thị thông báo audio local-only trước khi xin quyền.
- Microphone chỉ bật sau explicit button.
- Stop track ngay khi xong.
- Control dùng button native, label/status rõ, aria-live cho recorder/error/timer state.
- Playback dùng audio controls.
- Timer không là tín hiệu duy nhất; có text state.
- Keyboard dùng được toàn bộ flow.
