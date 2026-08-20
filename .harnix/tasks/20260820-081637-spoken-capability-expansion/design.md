# Design P1

## Diagnostic cue flow

`PerceptionPractice` vẫn phản hồi ngay trong training nhưng chỉ đưa ID sai ở pretest/posttest vào `diagnosticMissedItemIds`. `LearningLoopPractice` dùng danh sách này để quyết định có mở cue. `PronunciationCueCard` lọc `triggerItemIds` và ghi rõ cue là tự kiểm, không phải đánh giá phát âm.

## Spoken catalog invariant

Catalog test định nghĩa tập spoken bundled hiện hành và yêu cầu tất cả normalize về v3 + `LearningLoopV1`. Content giữ model isolation vì learning loop chỉ xuất hiện sau baseline; transfer/review không render model/chunk bank.

## Interaction

`interruption` là prompt mô phỏng người nghe chen vào để hỏi priority/timebox. Renderer dùng cùng local timer/recording contract như các turn khác, không branch bằng AI và không suy luận correctness.

## Evaluation

Protocol là artifact vận hành: script, blinded labels, observer form, agreement rule, missing-data rule và interpretation boundary. Nó không phải product claim hay database feature.