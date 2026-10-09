# PRD: Siết toàn vẹn bài kiểm tra

## Vấn đề

Review tổng thể phát hiện các bài kiểm tra tự động (auto-check, perception, reading ladder) không đo được năng lực thật vì người học có thể đoán đúng mà không cần nghe hoặc đọc:

- Không có đoạn code nào xáo trộn lựa chọn; mọi `options` hiển thị đúng thứ tự trong JSON. Có 91/96 item perception và reading ladder có đáp án đúng ở `options[0]`, và cả 96 item chỉ có 2 lựa chọn (đoán đúng 50%, thực tế gần 100%).
- Trong 47 câu `choice`, 30 câu có đáp án đúng ở vị trí đầu và 34 câu (74%) có đáp án đúng là lựa chọn dài nhất.
- Bài `ordering` hiển thị sẵn các nút theo đúng thứ tự đáp án (`technical-doc-action-b1`, câu `runbook-recovery-order`). Bài `matching` liệt kê giá trị theo đúng thứ tự cặp, nên chỉ cần chọn lần lượt.
- Chấm `fill` bằng so khớp chuỗi tuyệt đối (`SectionRenderer.tsx:98`): không chuẩn hóa hoa/thường, dấu câu, nháy cong/thẳng hay Unicode. Câu `q3` của `pronunciation-sounds` chỉ chấp nhận ký tự `ˈ` (U+02C8) trong khi người học không thể gõ ký tự này dễ dàng.
- Distractor thường vô lý (ví dụ "Lunch starts", "Wait silently", "The"), và đáp án đúng thường lặp lại từ khóa có trong audio, nên đoán được mà không cần hiểu.

## Mục tiêu

1. Vị trí đáp án đúng không còn dự đoán được ở mọi loại bài kiểm tra.
2. Chấm `fill` không phạt oan người học vì khác biệt hình thức.
3. Cổng nội dung tự động ngăn các lỗi thiết kế đáp án quay lại khi thêm bài mới ở các task sau.
4. Toàn bộ nội dung hiện có vượt cổng đó.

## Không thuộc phạm vi

- Thêm bài học mới (đợt mở rộng nội dung).
- Cho phép thử đến khi đúng ở bước extraction của reading ladder, cùng các vấn đề focus và live region (thuộc task `improve-accessibility-and-learning-ux`).
- Thay đổi giao diện ngoài thứ tự các lựa chọn.

## Yêu cầu

| Mã | Yêu cầu |
| --- | --- |
| ac-1 | Thứ tự lựa chọn của `choice`, `perception` và `reading ladder` được xáo trộn theo seed. Seed gồm id bài, id item và một giá trị riêng cho mỗi lần mở component, nên cùng seed luôn cho cùng thứ tự và mỗi lượt làm khác nhau. |
| ac-2 | `ordering` không bao giờ hiển thị đúng thứ tự đáp án. `matching` hiển thị giá trị đã xáo trộn thay vì theo thứ tự cặp. |
| ac-3 | Chấm `fill` chuẩn hóa NFC, nháy cong/thẳng, hoa/thường, khoảng trắng và dấu câu cuối; schema có `acceptedAnswers` tùy chọn cho `fill`; `q3` của `pronunciation-sounds` không còn phụ thuộc việc gõ U+02C8. |
| ac-4 | Cổng nội dung tự động chặn các lỗi thiết kế đáp án (xem bảng ngưỡng bên dưới). |
| ac-5 | Toàn bộ `perception`, `reading ladder` và `choice` hiện có được viết lại để vượt cổng ở ac-4. |

### Ngưỡng của cổng nội dung (ac-4)

| Quy tắc | Ngưỡng |
| --- | --- |
| Số lựa chọn của perception, reading ladder và choice một đáp án | 3 đến 4 |
| Tỉ lệ item có đáp án đúng là lựa chọn dài nhất | tối đa 45% trên toàn corpus, tối đa 60% trong từng bài |
| Độ dài lựa chọn dài nhất so với ngắn nhất trong một item | tối đa 2,5 lần |
| Hai lựa chọn trùng nhau sau khi chuẩn hóa | không được có |
| Đáp án đúng nằm nguyên văn trong audio (perception) hoặc source (ladder) | thì phải có ít nhất 1 distractor cũng nằm nguyên văn |
| Bài `ordering` | `options` tác giả không được trùng thứ tự `correctAnswer` |

## Quyết định thiết kế

- Seed xáo trộn kết hợp một salt ngẫu nhiên tạo mỗi lần mở component (không lưu). Người học không ghi nhớ được vị trí giữa các lượt, và test điều khiển được kết quả bằng cách giả lập `Math.random`.
- Hàm xáo trộn là hàm thuần (`seededShuffle`) dùng xmur3 để băm seed và mulberry32 làm bộ sinh số, kèm Fisher-Yates.
- `q3` chuyển thành bài `choice`; engine vẫn hỗ trợ `fill` để các task sau dùng.
- Chuẩn hóa không biến `ˈ` thành `'` để không làm mất khác biệt giữa các ký hiệu IPA.

## Rủi ro

- Viết lại khoảng 96 item perception/ladder và 47 câu choice là khối lượng lớn và dễ đưa lỗi ngôn ngữ mới; cần review nội dung theo từng nhóm capability.
- Ngưỡng của cổng có thể chặn nội dung hợp lệ; các ngưỡng nằm ở một hằng số duy nhất để điều chỉnh có lý do.
- Test hiện có có thể phụ thuộc vào thứ tự lựa chọn; xử lý bằng cách chọn theo tên thay vì theo vị trí.
