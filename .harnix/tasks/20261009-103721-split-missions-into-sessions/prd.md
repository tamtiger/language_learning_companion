# PRD: Chia mission thành các phiên học ngắn có checkpoint

## Vấn đề

- Mission chạy một mạch gồm baseline, input, auto-check, performance, retry, transfer; ước lượng thời gian thực tế của một mission là 24 đến 57 phút (đo từ nội dung), trong khi `durationMinutes` ghi 12 đến 30 và Today không nói người học cần dành bao lâu cho bước hiện tại.
- Giai đoạn input hiển thị mọi section cùng lúc nên màn hình rất dài.
- Hợp đồng đầu ra luôn mở rộng chiếm chỗ ở mọi lượt dù người học đã đọc.
- Tiến độ giữa các giai đoạn đã được lưu (`activePhase`, `currentSectionId`) nhưng không có khái niệm "phiên" để người học biết điểm dừng hợp lý.

## Mục tiêu

Một dev có 10 đến 15 phút vẫn hoàn thành một phiên có ý nghĩa và quay lại không mất tiến độ.

## Không thuộc phạm vi

- Đổi nội dung bài học (chỉ chỉnh metadata `durationMinutes`).
- Chia lại luồng giai đoạn hay đổi quy tắc qualifying.

## Mô hình phiên

| Phiên | Nhãn | Giai đoạn |
| --- | --- | --- |
| 1 | Thử sức và học | baseline, input, auto-check |
| 2 | Luyện và sửa | performance, interaction, self-feedback, retry |
| 3 | Vận dụng mới | transfer |

Thời lượng mỗi phiên suy ra từ nội dung (`estimateSessionMinutes`): đọc 120 từ/phút, 40 giây mỗi câu auto-check, 20 và 15 giây cho mỗi từ và cụm trong language-support, thời gian chuẩn bị cộng thời lượng đầu ra điển hình (nói: `targetSeconds`; viết: trung bình min-max từ × 4 giây), cộng vòng học nói (15 giây mỗi mục perception, 20 giây mỗi chunk, 150 giây shadowing, 40 giây mỗi lượt tương tác, 60 giây nghe lại). `durationMinutes` ghi thời lượng của phiên dài nhất (đơn vị cam kết một lần ngồi).

## Yêu cầu

| Mã | Yêu cầu |
| --- | --- |
| ac-1 | Có `sessionOf(phase)`, `currentSession(progress)` và kế hoạch ba phiên suy ra từ nội dung; checkpoint đã lưu (`activePhase`) đưa người học về đúng phiên khi quay lại. |
| ac-2 | Giai đoạn input hiển thị từng section với điều hướng Trước/Tiếp và nhớ vị trí (`currentSectionId`); hợp đồng đầu ra mở ở lần xem đầu và thu gọn sau đó. |
| ac-3 | Today nêu "Phiên n/3 · khoảng m phút" cho phiên hiện tại; `durationMinutes` của mọi mission bằng thời lượng phiên dài nhất. |

## Quyết định thiết kế

- Phiên 1 chứa input nên là phiên dài nhất ở các bài nghe và đọc; chấp nhận đến 22 phút thay vì tách input (không đổi luồng).
- `durationMinutes` giữ giới hạn schema 5 đến 30 và giới hạn A2 10 đến 15; ước lượng được làm tròn lên, kẹp vào 5 đến 30.
- Rủi ro: ước lượng dựa trên hệ số cố định, chưa đo thời gian người học thật; app nên đối chiếu `durationSeconds` thật của attempt ở task sau.
