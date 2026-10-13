# PRD: Sửa chất lượng nội dung bài học theo báo cáo rà soát

## Bối cảnh
Báo cáo rà soát nội dung (7 agent đọc 46 mission trong `content/missions/*` và 6 file `content/reference/pronunciation/*`) tìm thấy lỗi lặp lại ở hầu hết các nhóm. Schema và 168 test content đều pass, nên các lỗi này là lỗi ngôn ngữ và sư phạm mà máy chưa bắt được. Người dùng yêu cầu "sửa toàn bộ".

## Mục tiêu
Sửa toàn bộ phát hiện Blocker, Major và Minor trong báo cáo, ưu tiên sửa ở gốc (template, generator, test) để lỗi không tái phát.

## Ngoài phạm vi
- Không đổi schema (`src/content/schema.ts`), không đổi runtime UI, không đổi `lessonId`, `capabilities`, `schemaVersion` hay khóa lưu trữ.
- Không thêm bài mới ngoài phần bổ sung -s/-es trong bài pronunciation.
- Không nâng version phát hành tại bước này trừ khi `check:changelog` yêu cầu (xử lý ở bước implement theo quy tắc version của repo).
- Các mục báo cáo ghi "cần xác nhận" mà không có bằng chứng sai rõ ràng: kiểm lại với file nguồn, nếu không chắc thì ghi vào residual risk thay vì sửa.

## Nhóm lỗi cần sửa
1. Blocker: trọng âm và IPA sai (interview, technical-explanation, meetings), đáp án tự mâu thuẫn (technical-reading STK), dạy sai lỗi người Việt (pronunciation).
2. Cụm đệm trong lựa chọn (194 chỗ trong corpus) làm lộ đáp án và sai ngữ pháp.
3. Câu fill của vocabulary-review chỉ nhận một đáp án.
4. transferPrompt lệch context, số từ prompt khác maxWords, mẫu ngắn hơn minSeconds.
5. modelResponse và hội thoại nghe dùng dữ kiện ngoài packet hoặc mâu thuẫn.
6. Major khác: sai ngữ pháp trong đáp án mẫu, dịch sai nghĩa, thứ tự bài tập, bài hậu kiểm trùng bài huấn luyện, baseline lộ đáp án.
7. Minor: commonMistake không phải lỗi, rubric dimension, metadata và nhãn `p0-pilot`, thuật ngữ Việt.
8. Pronunciation: thêm lỗi đặc thù người Việt và nội dung -s/-es.

## Tiêu chí thành công
Xem 9 acceptance criteria (ac-1 đến ac-9) trong `task.json`. Tóm tắt: các lỗi đã nêu được sửa, test chống tái phát có mặt, `npm run test`, `npm run lint`, `npm run build` đều pass.

## Rủi ro
- Viết lại distractor có thể làm vi phạm ngưỡng `assessmentQuality` (tỉ lệ độ dài 2,5 và tỉ lệ đáp án dài nhất 45%). Mitigation: chạy `npm test -- tests/content` sau mỗi nhóm.
- Đổi `correctAnswer` hoặc `options` có thể phá khóa tiến độ đã lưu của người học. Mitigation: không đổi `id` của exercise; kiểm tra `contentRevision` theo `docs/CONTENT.md`.
- Không có người bản ngữ rà soát; mức "tự nhiên" của câu mới dựa vào đánh giá của agent.
- Sửa quy mô lớn dễ lệch văn phong giữa các bài. Mitigation: một lượt rà nhất quán thuật ngữ ở cuối.

## Rollback
Toàn bộ thay đổi là file JSON và test; hoàn tác bằng `git revert` hoặc checkout các file theo từng nhóm capability.
