# PRD: Sửa lỗi chính xác nội dung đã phát hiện khi review

## Vấn đề

Review độ chính xác nội dung (đọc 100% 18 file) tìm thấy các lỗi mà cổng tự động hiện chưa bắt. Các số liệu dưới đây đã được xác minh lại trên nội dung hiện tại, sau khi task `harden-assessment-integrity` viết lại lựa chọn đáp án.

1. **Trọng âm nhấn sai từ.** Trường `stressPattern` của chunk liệt kê từ được nhấn nhưng có hư từ (BECAUSE, BUT, COULD) hoặc từ không có trong câu mẫu (OWNER, DEADLINE, ACTION). Điều này mâu thuẫn với chính bài `pronunciation-sentence-stress` (nhấn content word, giảm nhẹ function word). Các chỗ: `meet-chunk-ack`, `meet-chunk-alt`, `meet-chunk-recap`, `arch-chunk-3`, `trade-chunk-mitigate`, `dec-chunk-2`.
2. **Câu hỏi sai nghĩa hoặc mơ hồ, feedback và cue không khớp audio.**
   - `stand-pre-3`: audio "My blocker is access to the payment dashboard", câu hỏi "What is blocked?" nhưng đáp án "Dashboard access" mới chính là blocker.
   - `meet-train-3`: "Concern chính là gì?" mơ hồ giữa "schedule concern" và "risk".
   - `meet-train-1` feedback nói nghe âm cuối của "failed" để biết số ít hay số nhiều, trong khi "failed" không mang thông tin đó.
   - `dec-train-3` feedback nhắc "results and costs" nhưng audio chỉ có "result", "latency" và "load".
   - `trade-pre-1` được dùng làm trigger của cue `trade-cue-finals` (âm cuối plural) nhưng audio không có từ số nhiều.
   - `trade-train-2` hỏi "Từ nào mang decision?" nhưng đáp án là một cụm từ.
   - `dec-train-2` feedback nhấn BECAUSE; `arch-pre-1` và `arch-post-1` hỏi "both retries" khi audio nói khác nhau.
3. **Ngữ pháp, cách dùng từ và model response lệch.**
   - `technical-doc-action-b1`: "rollback the latest snapshot" (rollback là danh từ), "roll back the snapshot".
   - `workplace-clarification-request-b1`: "what completion time should pass".
   - `architecture-walkthrough-b2`: "use the event ID idempotently" và câu garden-path ở source.
   - `meeting-disagree-and-recap-b2`: "Minh could own the test by four".
   - Model response: `behavioral-interview-ownership-b2` lẫn ngôn ngữ rubric vào lời kể ("without suggesting that I resolved the incident alone"); `learn-api-from-docs-b2` bước "test failed processing" đứng trước "add status polling"; `technical-interview-decision-b2` mitigation lặp lại chính phương án đã chọn; `workplace-issue-update-b1` có hai quyết định trong khi prompt yêu cầu một.
   - Có đáp án bị viết lại thành cách nói khác audio khi sửa cổng đáp án (ví dụ `stand-pre-2` đổi "Reproduce" thành "Recreate") làm yếu việc nghe đúng thuật ngữ mục tiêu.
4. **Thời lượng spoken không khớp prompt.** Model response dài 50 đến 139 từ, ở 130 wpm chỉ khoảng 23 đến 64 giây trong khi prompt yêu cầu 30 đến 120 giây. Test hiện dùng sàn 75 wpm nên không bắt được.
5. **Provenance, nhãn và ngôn ngữ.**
   - Năm định nghĩa trong bài pronunciation giống gần nguyên văn từ điển hoặc trang tutorial nhưng được gắn nhãn do dự án biên soạn.
   - Artifact synthetic có `sourceIds` và `adaptationNote` (daily-standup, learn-api) không có dòng "Synthetic training artifact", trong khi quy tắc trong `CONTENT.md` chỉ nói rõ cho synthetic độc lập; chưa rõ trường hợp này.
   - Prompt tiếng Việt vẫn xuất hiện ở mission B2 (4 prompt và 4 brief baseline) và có câu trộn Việt-Anh; một câu dịch sát nghĩa ("bảo vệ được").

## Mục tiêu

Sửa toàn bộ các lỗi trên và thêm test khóa để lỗi cùng loại không quay lại.

## Không thuộc phạm vi

- Thêm mission mới hoặc đổi cấu trúc schema.
- Viết lại đáp án lần nữa ngoài các item bị ảnh hưởng.
- Thay đổi `id` của item, chunk hay cue (để không phá dữ liệu tiến độ).

## Yêu cầu

| Mã | Yêu cầu |
| --- | --- |
| ac-1 | Mọi `stressPattern` chỉ chứa content word có trong câu mẫu của chunk; test kiểm bằng danh sách function word. |
| ac-2 | Các câu hỏi, feedback và cue ở mục 2 được sửa và khớp với audio; test khóa các sửa đổi và kiểm cue âm cuối chỉ trigger item có từ phù hợp. |
| ac-3 | Các lỗi ngữ pháp và model response ở mục 3 được sửa; `stand-pre-2` giữ đáp án diễn đạt lại (xem quyết định trong plan) và các đáp án bị diễn đạt lại khác được rà soát. |
| ac-4 | Độ dài model response của mission spoken nằm trong khoảng hợp lý so với thời lượng yêu cầu ở tốc độ nói 110 đến 160 từ mỗi phút; test thay sàn 75 wpm. |
| ac-5 | Định nghĩa pronunciation được tự viết; quy tắc nhãn synthetic cho artifact có nguồn được làm rõ trong `CONTENT.md` và test; mọi prompt và brief của mission B2 chỉ dùng tiếng Anh. |

## Quyết định thiết kế

- Giữ nguyên thời lượng yêu cầu (`targetSeconds`, `timeLimitSeconds`) và kéo dài model response, thay vì giảm thời lượng. Giảm thời lượng làm nới lỏng điều kiện transfer đạt, còn người học bắt chước model response 50 giây sẽ bị đánh `too-short` so với yêu cầu 90 giây.
- Ngưỡng nói: tối thiểu 110 wpm (người học B1 đến B2), tối đa 160 wpm. Model response phải có số từ trong `[targetSeconds * 110 / 60, timeLimitSeconds * 160 / 60]`.
- Test kiểm trọng âm dùng một danh sách function word cố định thay vì phân tích ngôn ngữ tự động; từ viết hoa trong `stressPattern` phải khớp một từ trong câu mẫu theo tiền tố (CONCERN khớp concern và concerned).
- Với artifact synthetic có `sourceIds` và `adaptationNote`, `adaptationNote` là phần ghi nguồn hiển thị cho người học; dòng "Synthetic training artifact" chỉ bắt buộc với synthetic độc lập, đúng như đã viết trong `CONTENT.md`.

## Rủi ro

- Sửa nội dung bằng tay hàng chục chỗ dễ đưa lỗi mới; mỗi nhóm sửa được đọc lại bằng mắt và chạy toàn bộ test nội dung.
- Mở rộng model response có thể làm lệch fact so với source; mọi câu mới phải dựa trên dữ kiện đã có trong source hoặc brief.
- Một số lỗi (câu hỏi và cue) chỉ khóa được bằng test theo id cụ thể; test này dễ vỡ khi nội dung được viết lại ở task sau, nên mỗi test ghi rõ lỗi mà nó bảo vệ.
