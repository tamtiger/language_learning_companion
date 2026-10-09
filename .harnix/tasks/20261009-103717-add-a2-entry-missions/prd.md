# PRD: Mission A2 làm lối vào cho người mới

## Vấn đề

Nội dung hiện chỉ có B1 đến C1. Người học A2 (câu ngắn, từ vựng nền tảng) không có bài nào vừa sức, và app không chỉ cho họ lối vào hay đường lên B1. Các điểm dưới đây đã được xác minh trên repo hiện tại.

1. **Không có mission A2.** 12 mission đều từ B1; mỗi capability có đúng 2 bài B1 hoặc B2. Task 9 đã thêm A2 vào schema nhưng chưa có nội dung.
2. **Schema chặn thời lượng A2.** `outputContract` spoken yêu cầu `timeLimitSeconds ≥ 30` và `targetSeconds ≥ 30`, trong khi mục tiêu A2 là 20 đến 40 giây.
3. **Cổng chất lượng của vòng học nói không chạm bài mới.** `tests/content/contentQuality.test.ts` kiểm trọng âm và cue phát âm trên danh sách `SPOKEN_LESSONS` viết cứng sáu bài; một mission nói mới sẽ không qua hai cổng đó. Quy tắc "không để dữ kiện của phase sau lọt vào learning loop" cũng viết cứng theo từng bài.
4. **Today và Catalog không biết lộ trình.** `buildTodayQueue` xếp theo capability rồi `lessonId` (không theo level); Catalog không phân biệt A2 và không nói "bài tiếp theo". Người học đã làm bài khó vẫn bị đề xuất bài dễ.

## Mục tiêu

Mỗi capability có một mission A2 vừa sức, qua mọi cổng chất lượng hiện có và cổng riêng cho A2; Catalog và Today đề xuất A2 cho người mới và chỉ đường lên B1.

## Không thuộc phạm vi

- Mission B1 hoặc B2 (task khác); từ vựng chuyên ngành mở rộng (task 13); bài nghe và đọc dài (task 12); chia phiên (task 14).
- Hiển thị khảo sát trình độ hay tự chọn level.
- Dịch toàn bộ giao diện sang song ngữ.

## Sáu mission

| Capability | `lessonId` | Chế độ | Tình huống | Đầu ra |
| --- | --- | --- | --- | --- |
| workplace-communication | `workplace-ask-for-help-a2` | viết | nhắn đồng nghiệp xin giúp một lỗi nhỏ: vấn đề, đã thử gì, câu hỏi | 40 đến 60 từ |
| technical-reading | `technical-readme-steps-a2` | viết | đọc README cài đặt ngắn, viết các bước theo thứ tự (first, then, finally) | 40 đến 60 từ |
| international-meetings | `meeting-join-and-repeat-a2` | nói | vào họp: chào, nói một cập nhật một câu, xin nhắc lại khi không nghe rõ | 20 đến 40 giây |
| technical-explanation | `explain-what-a-service-does-a2` | nói | nói dịch vụ làm gì, dùng gì, gửi gì trong ba câu ngắn | 20 đến 40 giây |
| international-interview | `interview-describe-your-job-a2` | nói | trả lời phỏng vấn đơn giản: vai trò, việc hằng ngày, công cụ | 20 đến 40 giây |
| technology-learning | `learn-a-tool-from-short-docs-a2` | viết | đọc tài liệu bốn dòng của một công cụ, viết nó làm gì, một lệnh ví dụ, một câu hỏi | 40 đến 60 từ |

Kịch bản tránh trùng các mission hiện có: B1 `workplace-issue-update` (cập nhật sự cố), `technical-doc-action` (migration), `daily-standup` (báo cáo ba phần), và mission phỏng vấn B1 sẽ viết ở task 11 (kể câu chuyện nghề nghiệp, không chỉ mô tả công việc).

## Yêu cầu

| Mã | Yêu cầu |
| --- | --- |
| ac-1 | Mỗi capability có đúng sáu mission A2 như bảng trên; chunk đơn giản (tối đa 8 từ), câu của model response ngắn, đầu ra 20 đến 40 giây (nói) hoặc 40 đến 60 từ (viết), prompt song ngữ giảm dần và câu cuối của vòng ôn chỉ còn tiếng Anh. |
| ac-2 | Mỗi mission A2 qua schema và mọi cổng chất lượng: perception đúng ba lựa chọn, mọi nguồn có khai báo synthetic hoặc provenance, rubric có tiêu chí ngôn ngữ kèm anchors, trọng âm và cue phát âm hợp lệ, không lộ dữ kiện phase sau vào learning loop. |
| ac-3 | Today xếp bài theo level trong cùng capability và không đề xuất bài A2 cho người đã bắt đầu hoặc hoàn thành bài cao hơn của capability đó; Catalog gắn nhãn A2, hiện "tiếp theo" (đường lên B1) trên bài A2 và có lối "Bắt đầu với A2" cho người mới. |

## Quyết định thiết kế

- **Nguồn là synthetic có khai báo, không có `sourceRegistry`.** Mọi artifact mở đầu bằng "Synthetic training artifact — non-production." như `workplace-clarification-request-b1`. Không bịa vị trí trích dẫn từ CEFR hay tài liệu ngoài mà tôi không kiểm chứng được; các kịch bản đều là tình huống mô phỏng nên khai báo synthetic là trung thực nhất. Mọi mission vẫn qua cổng "nguồn phải có provenance hoặc khai báo synthetic".
- **Quy tắc A2 đo được** (test `tests/content/a2Missions.test.ts`, áp dụng cho mọi lesson `A2` suy ra từ nội dung):
  - Mỗi capability có ít nhất một lesson A2 (cho phép thêm bài sau).
  - Đầu ra: nói `targetSeconds` 20 đến 30 và `timeLimitSeconds` ≤ 45; viết `minWords` 40, `maxWords` ≤ 70 và `timeLimitSeconds` ≤ 300.
  - Prompt: tỷ lệ chữ tiếng Việt của baseline, performance, retry, transfer, review không tăng và review không còn chữ tiếng Việt; baseline có tiếng Việt.
  - Mỗi chunk dài tối đa 8 từ (không tính `___`); mỗi câu của `modelResponse` tối đa 14 từ và trung bình tối đa 10 từ; câu trong nguồn trung bình tối đa 14 từ.
  - Perception: mọi mục (pretest, training, posttest) có đúng 3 lựa chọn.
  - Rubric 3 đến 5 tiêu chí: ít nhất một `task`, ít nhất một ngôn ngữ (`accuracy`, `range` hoặc `register`) và mọi tiêu chí có anchors; anchors `met` và `notMet` khác nhau.
  - Language support: ít nhất 4 từ vựng có ít nhất một collocation, ít nhất 3 cụm diễn đạt; tối thiểu 4 bài tập tự kiểm trong đó có ít nhất một `fill` hoặc `ordering`.
  - `durationMinutes` 10 đến 15; `reviewPolicy.interleave` bật và `intervalDays` có ít nhất 5 mốc.
  - Dữ kiện chỉ xuất hiện ở transfer hoặc review (từ đặc trưng dài từ 6 chữ cái hoặc có chữ số) không được lọt vào `learningLoop`.
- **Sửa các cổng cứng thành suy ra.** `SPOKEN_LESSONS` suy ra từ catalog (mọi lesson nói có vòng học), nên trọng âm, cue phát âm và quy tắc phase sau áp dụng cho cả mission mới.
- **Schema.** Spoken `targetSeconds` tối thiểu 15 và `timeLimitSeconds` tối thiểu 20 (trước đây 30); ràng buộc `targetSeconds ≤ timeLimitSeconds` giữ nguyên. Mọi mission cũ không đổi.
- **Lộ trình.**
  - `src/domain/progress/pathway.ts`: `CEFR_RANK`, `nextLessonAfter(lesson, lessons)` (lesson cùng capability có level cao hơn gần nhất, rồi theo `lessonId`) và `isEntryLevelSkipped` (đã có tiến độ ở lesson cao hơn cùng capability).
  - `buildTodayQueue`: thêm `cefrLevel` vào mục catalog; trong cùng capability sắp theo level tăng dần rồi `lessonId`; bỏ mục `new` hoặc `baseline` A2 khi `isEntryLevelSkipped`. Mục `review` và `resume` không bị lọc.
  - Catalog: nhãn "Lối vào A2" trên thẻ A2; dòng "Tiếp theo: …" khi có bài kế tiếp; nút "Bắt đầu với A2" (đặt bộ lọc level A2) chỉ hiện khi người học chưa có tiến độ nào và có bài A2.
- **Giữ nguyên đường ôn.** `reviewPolicy` A2: `[1, 2, 5, 10, 21]`, `interleave: true`.
- **Vòng học nói A2.** Cùng cấu trúc `learningLoop` v1 (pretest 4, training 6, posttest 4, 4 chunk, 5 bước shadowing, 2 lượt tương tác) nhưng câu nghe ngắn hơn, ba lựa chọn, ba giọng (en-US, en-GB, en-AU), một đến hai cue.

## Rủi ro

- Nội dung viết tay dễ có lỗi ngữ pháp hoặc khai báo sai kiến thức; mỗi mission được đọc lại bằng mắt và chạy cổng chất lượng, nhưng chưa có người bản ngữ rà soát (ghi vào rủi ro).
- Cổng "đáp án đúng không phải phương án dài nhất" áp dụng toàn bộ kho (≤ 45%); thêm nhiều mục mới có thể làm tỷ lệ này vượt ngưỡng, cần viết phương án nhiễu cân bằng.
- Quy tắc "từ đặc trưng của phase sau" là heuristic; có thể báo nhầm với từ phổ biến, khi đó sửa nội dung hoặc thu hẹp quy tắc kèm lý do.
- Xếp bài theo level đổi thứ tự Today của người dùng hiện có (bài B1 trước B2 trong cùng capability); chấp nhận vì app chưa phát hành.
- A2 viết "đơn giản" nhưng vẫn là tiếng Anh nghề nghiệp; mức độ vừa sức thật chỉ kiểm được với người học thực.
