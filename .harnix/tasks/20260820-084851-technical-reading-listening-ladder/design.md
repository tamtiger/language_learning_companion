# Design — Reading ladder and honest synthetic listening

## Data flow

`WrittenPerformanceTask.readingLadder` → `CapabilityTask` nhận biết task có ladder → phase baseline/transfer/review dùng read-once gate → phase input mount `ReadingLadderPractice` → chỉ khi extraction đúng và application checklist hoàn tất mới mở performance.

Không có ladder data nào đi vào `AttemptEvidence`; chỉ output metadata/rubric hiện có được persist. Draft application và đáp án extraction là component state bị hủy khi unmount.

## UI state

- `readOnceClosedPhase`: phase hiện đã đóng source; đổi phase tự khóa context mới.
- `inputPracticeReady`: true mặc định nếu không có spoken/reading loop; spoken dùng `LearningLoopPractice`, written ladder dùng `ReadingLadderPractice`.
- Read-once gate vô hiệu textarea/action cho đến khi source bị ẩn; retry không bị gate để hỗ trợ focused correction.

## Audio boundary

`ModelAudioPlayer` sở hữu rate selector và gọi `playModelAudio(source, rate)`. Web Speech đặt `utterance.rate`; bundled audio đặt `audio.playbackRate`. Locale/hints chỉ yêu cầu device voice, không xác nhận speaker accent. Không thêm network request hay persisted preference.