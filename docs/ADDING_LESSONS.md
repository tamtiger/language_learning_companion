# Thêm bài học

Hướng dẫn từng bước để thêm một bài (mission) mới. Quy tắc nội dung đầy đủ nằm ở
[CONTENT.md](./CONTENT.md); tài liệu này là checklist thao tác. Test lấy số bài, số nguồn và số
mission theo capability từ chính thư mục `content/`, nên thêm bài **không** cần sửa test.

## 1. Chọn capability và level

1. Chọn đúng một capability chính trong sáu capability (xem `CAPABILITY_IDS` ở
   `src/content/schema.ts`): `workplace-communication`, `technical-reading`,
   `international-meetings`, `technical-explanation`, `international-interview`,
   `technology-learning`.
2. Chọn `cefrLevel` (`A2`, `B1`, `B2`, `C1`). Bài A2 bắt buộc có tiêu chí ngôn ngữ kèm mẫu neo ở
   rubric.
3. Chọn chế độ đầu ra: `written` (có `minWords` và `maxWords`) hoặc `spoken` (có `targetSeconds`
   và có thể có `learningLoop`).
4. Kiểm tra nội dung mới không trùng kịch bản với mission hiện có (đọc `scenario` và các
   `practiceContexts`).

## 2. Tạo file đúng đường dẫn

1. Đặt file tại `content/missions/<capability>/<lessonId>.json`. `lessonId` là chữ thường, số và
   dấu gạch ngang, trùng tên file, và duy nhất trong toàn bộ catalog. Bài pronunciation tham khảo
   nằm ở `content/reference/pronunciation/`.
2. Bắt đầu từ một mission cùng loại làm mẫu (written hoặc spoken); đổi `lessonId`, `title`,
   `summary` và mọi `id` bên trong sao cho không trùng id trong cùng lesson.
3. Điền các trường bắt buộc: `schemaVersion: "v3"`, `capabilities` (đúng một giá trị),
   `workflowTags`, `sections` (có ít nhất một `source` và một `auto-check`), `performanceTask`
   (prompt cho baseline, performance, retry, transfer, review; `outputContract`;
   `independenceContract`; `rubric` 3 đến 6 tiêu chí) và `reviewPolicy.intervalDays` (tăng dần).
4. `practiceContexts` cho baseline, transfer và review phải là bộ dữ kiện khác nhau (transfer và
   review không lặp nguồn của baseline).

## 3. Ghi provenance và nguồn

1. Mọi nguồn dùng làm cơ sở phải có trong `sourceRegistry` (URL HTTPS, giấy phép, `reuseMode`,
   vị trí chính xác, ngày truy cập).
2. Mỗi `source` section và mỗi artifact tham chiếu nguồn bằng `provenance.sourceIds`; bài tổng hợp
   (`synthetic`) hoặc chuyển thể (`adapted`) phải có `adaptationNote`.
3. Dùng `reference-only` khi giấy phép không cho chép nguyên văn, và chỉ viết lại bằng lời của
   bài, không sao chép.

## 4. Viết bài tập và đáp án

1. Câu hỏi lựa chọn có 3 hoặc 4 phương án, không để đáp án đúng luôn là phương án dài nhất; chi
   tiết ở mục "Viết đáp án" trong [CONTENT.md](./CONTENT.md).
2. Mỗi bài tập có `explanation`; mỗi mission có ít nhất ba bài tập tự kiểm và phần
   `language-support` có tối thiểu ba biểu thức.
3. Prompt cho bài B2 trở lên viết bằng tiếng Anh; bài thấp hơn có thể song ngữ.

## 5. Chạy cổng kiểm tra

1. Chạy `npx vitest run tests/content` (schema, catalog, chất lượng nội dung, cổng đáp án). Mọi
   lỗi chỉ ra file và đường dẫn trường cần sửa.
2. Chạy `npm test` để chắc không có hồi quy ở nơi khác (Today, Catalog, tài liệu).
3. Chạy `npm run lint` và `npm run build`.
4. Cập nhật tài liệu nếu số mission thay đổi: `README.md` và `docs/CONTENT.md` nêu số mission và
   `npm run check:docs` so con số đó với số file thật.
5. Nếu bài thuộc một epic, chỉ viết mục changelog ở task cuối epic (xem [RELEASE.md](./RELEASE.md)).

## Gặp lỗi thường gặp

- `Unknown sourceRegistry reference`: `sourceIds` trỏ tới nguồn chưa khai báo ở `sourceRegistry`.
- `Exercise ids must be unique across the lesson`: id bài tập trùng giữa các section.
- Lỗi ở cổng đáp án: đáp án đúng quá dễ đoán; viết lại phương án nhiễu cho cân bằng độ dài và từ khóa.
