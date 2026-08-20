# PRD — Mở rộng spoken capability learning loop P1

## Outcome

Chuẩn hóa toàn bộ sáu mission nói bundled thành v3 capability missions có cold attempt, perception diagnostic, cue phát âm đúng lúc, functional chunks, guided shadowing có fading, production/listen-back, multi-turn repair, focused retry, unseen transfer và delayed review.

## Phạm vi

- Giữ hai loop P0 và bổ sung loop/context cho `architecture-walkthrough-b2`, `behavioral-interview-ownership-b2`, `technical-interview-decision-b2`.
- Migrate `daily_standup.json` từ v2 sang v3, giữ function yesterday–today–blocker và thêm context/cue/interaction/transfer.
- Thêm interaction kind `interruption`.
- Cue selection chỉ dùng miss từ pretest/posttest; training miss vẫn nhận immediate feedback nhưng không tự động gán pronunciation target nếu diagnostic không còn lỗi.
- Thêm protocol listener/expert có thể thực hiện bên ngoài app; không tạo dữ liệu giả và không gọi self-rating là mastery.

## Contract nội dung

Mỗi spoken v3 mission phải có `LearningLoopV1` gồm 4 pretest, 6–12 training, 4 posttest, 1–2 cues, 4–6 chunks, đúng 5 shadowing steps, 2–4 listen-back checks và 2–3 interaction turns. Bốn context `baseline`, `retry`, `transfer`, `review` phải dùng facts/artifacts khác nhau. Mission mới phải có ít nhất một turn thuộc `clarification|misunderstanding|repair|interruption`.

`InteractionTurn.kind` bổ sung `interruption`. Không thay đổi persistence schema. `PerceptionResult` tách `diagnosticMissedItemIds` khỏi training miss; `PronunciationCueCard` nhận diagnostic IDs và render thông điệp giới hạn đo lường.

## Privacy và đo lường

Audio/text learner chỉ ở memory như P0. Listener protocol thu thập bên ngoài app với consent riêng; repository chỉ cung cấp rubric/procedure, không lưu participant data. Chỉ gọi process/observer evidence, không gọi pronunciation accuracy hoặc mastery.

## Rollback

Các mission vẫn là static JSON; có thể bỏ `learningLoop` và dùng v3 renderer cũ mà không migrate storage. Daily Standup v2 tồn tại trong Git history để rollback. Không thay đổi ProgressEnvelopeV4.

## Acceptance criteria

### AC `AC-1`

Toàn bộ 6 bundled spoken missions dùng schema v3 và có LearningLoopV1 hoàn chỉnh; 4 mission mới mở rộng có 4 phase contexts khác facts, 4–6 chunks có slot, tối đa 2 cue và 2–3 interaction turns.

### AC `AC-2`

Cue chỉ được chọn từ lỗi ở pretest/posttest diagnostic, không từ lỗi training đã sửa; nếu không có diagnostic miss thì learner đi thẳng sang shadowing, và UI nói rõ cue là hỗ trợ tự kiểm chứ không phải chấm phát âm.

### AC `AC-3`

Interaction contract hỗ trợ interruption bên cạnh follow-up/clarification/misunderstanding/repair/recap; mỗi mission mới có ít nhất hai lượt buộc tạo response mới và có repair hoặc clarification/interruption phù hợp tình huống.

### AC `AC-4`

Daily Standup được migrate từ v2 sang v3 mà vẫn giữ giá trị nội dung chính, có cold baseline, model lock, retry context, unseen transfer, delayed review và learning loop giống các spoken capability khác.

### AC `AC-5`

Protocol listener/expert định nghĩa consent, blinded phase labels, intent/critical-fact recovery, comprehensibility, interaction success, agreement và cách diễn giải; app/docs dùng evidence observed thay vì mastery và không ghi nhận kết quả chưa đo.

### AC `AC-6`

Focused/full tests, lint, production build và desktop/mobile smoke QA cho bốn mission mới pass; không có app-origin error, model/chunks vẫn khóa trước baseline/transfer/review và privacy local-only không regress.