# Bắt đầu ở đây

English Companion là app local-only giúp bạn luyện sáu capability dùng trực tiếp trong nghề Software Engineer:

- Giao tiếp tiếng Anh tự tin trong công việc.
- Đọc tài liệu kỹ thuật mà không cần bản dịch.
- Tham gia họp với đồng nghiệp quốc tế.
- Giải thích ý tưởng kỹ thuật bằng tiếng Anh.
- Phỏng vấn và làm việc tại công ty nước ngoài.
- Học công nghệ mới hoàn toàn bằng tiếng Anh.

## Cách học nhanh nhất

1. Mở **Today** và làm baseline capability được đề xuất.
2. Đọc evidence packet của phase (nếu task cung cấp) và chỉ dùng dữ kiện có trong đó.
3. Tạo output trước khi xem model answer; đánh dấu rõ fact và điều chưa chắc chắn.
4. Đọc input/scaffold, làm auto-check nếu có.
5. Với learning-loop pilot: nghe pretest, học cue cần thiết, luyện functional
   chunks bằng shadowing → delayed imitation → variation.
6. Đọc hợp đồng đầu ra, rồi nói hoặc viết trong timebox; nếu ghi âm, nghe lại
   trước khi tiếp tục.
7. Trả lời clarification/repair turn, rồi tự đánh giá rubric trung thực.
8. Chọn một ưu tiên để retry và làm transfer với evidence mới.
9. Quay lại Today khi review đến hạn.

Mục tiêu không phải hoàn thành nhiều bài mà là transfer độc lập trong task giống công việc thật.

## Privacy

App chạy offline-first. Audio và nội dung bạn nói/viết chỉ ở phiên hiện tại, không persist hoặc upload. Backup chỉ chứa metadata tiến độ đã allowlist. Nếu trình duyệt không hỗ trợ hoặc từ chối microphone, bạn vẫn luyện bằng timer-only fallback.

## Thuật ngữ trong learning loop

- **Baseline**: lượt làm đầu tiên trước khi xem input hoặc model.
- **Retry**: lượt sửa có trọng tâm sau khi tự đối chiếu rubric.
- **Transfer**: dùng cùng kỹ năng trong một tình huống mới.
- **Qualifying transfer**: transfer đáp ứng rubric, độ dài/thời gian và điều kiện độc lập.
- **Review**: lượt kiểm tra lại theo lịch để củng cố khả năng dùng độc lập.
- **Functional chunk**: khung câu gắn với một chức năng như phản biện, làm rõ,
  recap hoặc repair; bạn thay slot để phản xạ thay vì học thuộc script.
- **Pronunciation cue**: chỉ dẫn ngắn cho âm/nhịp có thể làm người nghe hiểu sai;
  IPA chỉ là ký hiệu hỗ trợ, không cần học toàn bộ trước khi nói.

## Nội dung hiện có

- Mười hai mission, hai mission ứng với mỗi capability.
- `Actionable issue update` là pilot có evidence packet riêng cho baseline,
  transfer và review; hãy phản hồi nếu dữ kiện thiếu, thừa hoặc khó hiểu.
- `Disagree and recap` và `Technical trade-off` là hai pilot có perception,
  pronunciation cue, guided shadowing, listen-back và interaction/repair.
- Daily Standup và sáu lesson pronunciation vẫn chạy qua normalization; các bài
  pronunciation v1 là knowledge/reference quiz, không phải đánh giá phát âm khi nói.
- Artifact có nguồn thật hiển thị provenance; scenario độc lập ghi rõ là dữ liệu
  mô phỏng/non-production và không cần network để học.
- Catalog có thể lọc theo capability, workflow và CEFR.

Chi tiết product xem `PRODUCT.md`; content schema v3 xem `CONTENT.md`; kiến trúc và migration xem `ARCHITECTURE.md`.
