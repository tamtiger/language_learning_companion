# Design — Fresh learning integrity architecture

## Storage

`ProgressEnvelopeV3` là trust boundary duy nhất. Parser từ chối version khác 3. Load lỗi hoặc v2 trả progress rỗng; import lỗi fail-closed và không thay state. Attempt chỉ lưu measured metadata, rubric và independence. `LessonProgress` lưu `activePhase` và `completedExerciseIds`. Không có migration hoặc `legacy-unknown`.

## Session output

`CapabilityTask` sở hữu `attemptKey` và learner snapshot. Typed text/audio URL chỉ ở memory. Capture phát started/ready/reset; parent revoke URL khi reset, đổi attempt hoặc unmount. Persist/export không nhận response/transcript/blob/URL/free text.

## Assessment

Pure function trả `{ qualifies, reasons }` với stable reason codes cho incomplete, rubric, independence, hint và output-contract violations. Today, feedback và Progress dùng chung function; presentation layer map tiếng Việt.

## State machines

Spoken: idle → running → ready, reset về idle. Finish chỉ hợp lệ sau Start và elapsed dương.

Learning: baseline → input → performance → retry → transfer → completed; self-feedback là view session-only của performance. Persist phase ở evidence boundaries, review due giữ precedence.

Pronunciation: AutoCheck báo exercise ID đúng; LessonFlow union ID vào progress; Finish enable khi mọi exercise ID có mặt; restart clear set.

## UX/content

Route change reset scroll và focus main; mobile nav ẩn scrollbar và scroll item active vào view; glossary giải thích baseline/retry/transfer/qualifying/review. Sáu mission mới dùng schema v3 hiện hữu và được kiểm tra qua catalog integration.