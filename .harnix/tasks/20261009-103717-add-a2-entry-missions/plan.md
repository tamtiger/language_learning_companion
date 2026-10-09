# Kế hoạch: Mission A2 làm lối vào cho người mới

## Checklist theo slice

- [x] S1: nền: schema thời lượng nói, cổng suy ra (`SPOKEN_LESSONS`, phase sau), test A2 (đỏ), lộ trình `pathway.ts` (ac-1, ac-2, ac-3)
- [x] S2: ba mission viết A2: `workplace-ask-for-help-a2`, `technical-readme-steps-a2`, `learn-a-tool-from-short-docs-a2` (ac-1, ac-2)
- [x] S3: ba mission nói A2: `meeting-join-and-repeat-a2`, `explain-what-a-service-does-a2`, `interview-describe-your-job-a2` (ac-1, ac-2)
- [x] S4: Today và Catalog hiển thị lộ trình A2 đến B1 (ac-3)
- [x] S5: tài liệu, lint, build, toàn bộ suite (ac-1 đến ac-3)

Đường dẫn tương đối với root repo. Mỗi slice viết test trước (RED) rồi viết nội dung hoặc mã (GREEN).

## S1: nền

Test trước:

- `tests/content/schemaExtensions.test.ts`: spoken `targetSeconds` 20 và `timeLimitSeconds` 40 hợp lệ; `targetSeconds` 14 hoặc `timeLimitSeconds` 19 bị từ chối; `targetSeconds` vượt `timeLimitSeconds` vẫn bị từ chối; viết vẫn nhận `timeLimitSeconds` 30.
- `tests/content/contentQuality.test.ts`: `SPOKEN_LESSONS` suy ra từ catalog (mọi lesson có `performanceTask.mode === 'spoken'`); test "keeps future phase facts out of every spoken learning loop" đổi sang quy tắc tổng quát: từ đặc trưng của transfer và review (chưa xuất hiện ở section nguồn, baseline hay retry; dài ít nhất 6 chữ cái hoặc có chữ số) không được xuất hiện trong `learningLoop`; danh sách regex viết cứng theo bài cũ giữ lại như cổng bổ sung.
- `tests/content/a2Missions.test.ts` (mới): mọi quy tắc A2 ở mục "Quyết định thiết kế" của PRD, kèm test tự kiểm bằng lesson tổng hợp vi phạm từng quy tắc để chứng minh cổng bắt được lỗi, và một test xác nhận sáu `lessonId` trong bảng tồn tại, đúng capability, đúng chế độ và đúng khoảng đầu ra. Ban đầu đỏ vì chưa có mission.
- `tests/domain/progress/pathway.test.ts` (mới): `nextLessonAfter` trả bài cùng capability với level cao hơn gần nhất rồi theo id, trả `null` ở level cao nhất và cho lesson không có capability; `isEntryLevelSkipped`.

Mã: `schema.ts` (min thời lượng nói), `src/domain/progress/pathway.ts`.

## S2: ba mission viết A2

Mỗi mission (JSON trong `content/missions/<capability>/<lessonId>.json`) gồm: section `source` kèm khai báo synthetic, `language-support` (≥ 4 từ vựng có collocation, ≥ 3 cụm), `auto-check` (≥ 4 bài, có `fill` hoặc `ordering`, đáp án cân bằng), `performanceTask` viết (prompt song ngữ giảm dần, bốn `practiceContexts` khác nhau, rubric có tiêu chí task và ngôn ngữ kèm anchors, `outputContract` 40 đến 60 từ), `reviewPolicy` `[1, 2, 5, 10, 21]` với `interleave`. Sau khi viết, đọc lại bằng mắt về ngữ pháp, độ dài câu và tính nhất quán dữ kiện, rồi chạy `npx vitest run tests/content`. Cổng đáp án (độ dài phương án, keyword parity, tỷ lệ đáp án đúng dài nhất toàn kho) được kiểm sau mỗi mission.

- `workplace-ask-for-help-a2`: lỗi build nhỏ; mẫu "I have a problem with ___. I tried ___. Can you help me with ___?".
- `technical-readme-steps-a2`: README bốn đến sáu dòng; dùng first, then, after that, finally.
- `learn-a-tool-from-short-docs-a2`: tài liệu bốn dòng của một công cụ dòng lệnh giả lập; "It is used to ___. For example, run `___`."

## S3: ba mission nói A2

Mỗi mission có thêm `learningLoop` v1: perception pretest 4, training 6 (mọi mục có feedback), posttest 4 với ba lựa chọn và ba giọng (en-US, en-GB, en-AU); 1 đến 2 cue phát âm (trigger hợp lệ, trọng âm chỉ chứa từ nội dung có trong khung câu); 4 chunk dài tối đa 8 từ kèm audio; 5 bước shadowing; checklist nghe lại; 2 lượt tương tác (có một lượt clarification, repair, misunderstanding hoặc interruption). `outputContract` `targetSeconds` 20, `timeLimitSeconds` 40; `modelResponse` 45 đến 70 từ (cổng thời lượng yêu cầu 37 đến 106 từ).

- `meeting-join-and-repeat-a2`: chào, tên, một cập nhật một câu, "Sorry, could you repeat that?", xác nhận.
- `explain-what-a-service-does-a2`: "This service ___. It uses ___. It sends ___ to ___."
- `interview-describe-your-job-a2`: "I work as ___. Every day, I ___. I use ___."

## S4: lộ trình

Test trước:

- `tests/domain/progress/progress.test.ts` hoặc `learningState.test.ts`: `buildTodayQueue` trong cùng capability xếp A2 trước B1 trước B2 cho người mới; bỏ mục `new` hoặc `baseline` A2 khi có tiến độ ở lesson cao hơn cùng capability (đã bắt đầu hoặc hoàn thành) nhưng giữ `review` và `resume` của A2; sau khi hoàn thành A2 mục B1 của capability đó là mục đầu; capability khác không bị ảnh hưởng.
- `tests/features/catalog/CatalogPage.test.tsx`: thẻ A2 có nhãn "Lối vào A2" và dòng "Tiếp theo: <tiêu đề bài kế tiếp>"; bài không có bài cao hơn không có dòng đó; nút "Bắt đầu với A2" hiện khi chưa có tiến độ và đặt bộ lọc A2; ẩn khi đã có tiến độ.
- `tests/features/today/TodayPage.test.tsx`: lần đầu mở, lối tắt của mỗi capability có bài A2 mở bài A2; sau khi đánh dấu hoàn thành A2 của một capability, lối tắt của capability đó mở bài B1.

Mã: `buildTodayQueue` (nhận `cefrLevel`, sắp theo level, lọc lối vào bị bỏ qua), `TodayPage` truyền `cefrLevel`, `CatalogPage` (nhãn, "Tiếp theo", nút bắt đầu).

## S5: tài liệu và xác minh

Cập nhật `docs/CONTENT.md` (mục A2: quy tắc đo được và danh sách sáu mission), `README.md` (số mission 18, lộ trình A2 đến B1) và `docs/PRODUCT.md` nếu nêu số mission. Chạy `npm run lint`, `npm run build`, `npm run check:docs`, `npm run check:bundle`, `harnix workflow --run-checks --brief`.

## Mỗi check chứng minh điều gì

- `check-a2-content`: ac-1, ac-2 (sáu mission tồn tại và qua mọi cổng nội dung, kể cả cổng A2 và cổng suy ra).
- `check-a2-path`: ac-3 (xếp bài theo level, lọc lối vào, Catalog và Today hiển thị lộ trình).
- `check-suite`: không hồi quy toàn dự án.

## Rollback

Mọi thay đổi nằm trong git. Nội dung mới là các file JSON thêm mới nên xóa chúng đưa catalog về trạng thái cũ; tiến độ đã lưu cho các lesson đó (nếu có) sẽ bị bỏ qua vì catalog không còn lesson tương ứng.
