# Epic: Khắc phục toàn bộ phát hiện từ review tổng thể và mở rộng bài học

Sửa nền đo lường, logic, trợ năng, offline và nợ kỹ thuật (đợt 1), rồi mở rộng nội dung để đủ cho 6 mục tiêu học (đợt 2).

- **Cập nhật:** 2026-10-09 11:26:10 +07:00

## Non-goals

- Không chấm nói tự động bằng AI
- Không thêm backend hay đồng bộ đám mây

## Next task

- `20261009-103717-add-a2-entry-missions` — Thêm mission A2 làm lối vào cho người mới (`planning`)

## Members (16 tasks)

| # | Task ID | Title | Mode | Status |
|---|---------|-------|------|--------|
| 1 | `20261009-103709-stabilize-test-environment` | Ổn định môi trường test và ghim phiên bản Node | `lite` | `completed` |
| 2 | `20261009-103710-harden-assessment-integrity` | Siết toàn vẹn bài kiểm tra: xáo trộn, chấm điểm, cổng chất lượng đáp án | `full` | `completed` |
| 3 | `20261009-112609-standardize-file-naming-and-test-layout` | Thống nhất quy ước tên file, đuôi file và gom test vào thư mục tests | `full` | `completed` |
| 4 | `20261009-103711-fix-content-accuracy-errors` | Sửa lỗi chính xác nội dung đã phát hiện khi review | `full` | `completed` |
| 5 | `20261009-103712-fix-learning-state-logic` | Sửa logic hoàn thành, ôn tập và bền vững dữ liệu | `full` | `completed` |
| 6 | `20261009-103713-clean-repo-hygiene-and-docs` | Dọn nợ kỹ thuật, đồng bộ tài liệu và quy trình release | `full` | `completed` |
| 7 | `20261009-103714-improve-accessibility-and-learning-ux` | Cải thiện trợ năng, đồng hồ và bảo toàn tiến độ khi học | `full` | `completed` |
| 8 | `20261009-103715-add-offline-pwa-and-audio-reliability` | Offline thật (PWA), bền dữ liệu trên Safari và audio mẫu tin cậy | `full` | `completed` |
| 9 | `20261009-103716-extend-curriculum-schema` | Mở rộng schema chương trình để nhận nội dung mới | `full` | `completed` |
| 10 | `20261009-103717-add-a2-entry-missions` | Thêm mission A2 làm lối vào cho người mới | `full` | `planning` |
| 11 | `20261009-103718-add-interview-and-work-pathway` | Thêm lộ trình phỏng vấn và làm việc ở công ty nước ngoài | `full` | `planning` |
| 12 | `20261009-103719-add-listening-and-long-reading` | Thêm luyện nghe hội thoại và bài đọc dài | `full` | `planning` |
| 13 | `20261009-103720-add-vocabulary-and-fill-content-gaps` | Thêm từ vựng chuyên ngành và lấp ô trống ma trận nội dung | `full` | `planning` |
| 14 | `20261009-103721-split-missions-into-sessions` | Chia mission thành các phiên học ngắn có checkpoint | `full` | `planning` |
| 15 | `20261009-104509-refactor-practice-feature-structure` | Refactor cấu trúc feature practice và dọn đặt tên | `full` | `planning` |
| 16 | `20261009-104458-final-docs-and-release-sync` | Đồng bộ tài liệu cuối epic và đóng release | `full` | `planning` |

## Task Overview & Scope

### 1. `20261009-103709-stabilize-test-environment` — Ổn định môi trường test và ghim phiên bản Node

- **Trạng thái:** `completed`
- **Mục tiêu:** npm run test chạy xanh trên Node 25 mặc định và repo khai báo rõ phiên bản Node được hỗ trợ.
- **Tiêu chí nghiệm thu:** 2 tiêu chí

### 2. `20261009-103710-harden-assessment-integrity` — Siết toàn vẹn bài kiểm tra: xáo trộn, chấm điểm, cổng chất lượng đáp án

- **Trạng thái:** `completed`
- **Mục tiêu:** Bài kiểm tra không thể đoán đúng bằng vị trí hoặc độ dài đáp án, và việc chấm điểm không phạt oan người học.
- **Tiêu chí nghiệm thu:** 5 tiêu chí

### 3. `20261009-112609-standardize-file-naming-and-test-layout` — Thống nhất quy ước tên file, đuôi file và gom test vào thư mục tests

- **Trạng thái:** `completed`
- **Mục tiêu:** Mã nguồn dùng một quy ước đặt tên và đuôi file duy nhất, và toàn bộ test nằm trong thư mục tests phản chiếu cấu trúc nguồn.
- **Tiêu chí nghiệm thu:** 5 tiêu chí

### 4. `20261009-103711-fix-content-accuracy-errors` — Sửa lỗi chính xác nội dung đã phát hiện khi review

- **Trạng thái:** `completed`
- **Mục tiêu:** Mọi lỗi trọng âm, câu hỏi, ngữ pháp, model response và provenance đã liệt kê được sửa và có test chặn tái diễn.
- **Tiêu chí nghiệm thu:** 5 tiêu chí

### 5. `20261009-103712-fix-learning-state-logic` — Sửa logic hoàn thành, ôn tập và bền vững dữ liệu

- **Trạng thái:** `completed`
- **Mục tiêu:** Trạng thái hoàn thành, lịch ôn và lưu trữ phản ánh đúng năng lực thật và không mất dữ liệu âm thầm.
- **Tiêu chí nghiệm thu:** 6 tiêu chí

### 6. `20261009-103713-clean-repo-hygiene-and-docs` — Dọn nợ kỹ thuật, đồng bộ tài liệu và quy trình release

- **Trạng thái:** `completed`
- **Mục tiêu:** Repo gọn, tài liệu khớp code, quy trình release chạy được và bundle không còn cảnh báo kích thước.
- **Tiêu chí nghiệm thu:** 8 tiêu chí

### 7. `20261009-103714-improve-accessibility-and-learning-ux` — Cải thiện trợ năng, đồng hồ và bảo toàn tiến độ khi học

- **Trạng thái:** `completed`
- **Mục tiêu:** Người dùng bàn phím và trình đọc màn hình hoàn thành được vòng học; không mất bản nháp; thời gian được tính công bằng.
- **Tiêu chí nghiệm thu:** 6 tiêu chí

### 8. `20261009-103715-add-offline-pwa-and-audio-reliability` — Offline thật (PWA), bền dữ liệu trên Safari và audio mẫu tin cậy

- **Trạng thái:** `completed`
- **Mục tiêu:** App tải và chạy được khi offline, dữ liệu được bảo vệ, audio mẫu báo trạng thái thật.
- **Tiêu chí nghiệm thu:** 4 tiêu chí

### 9. `20261009-103716-extend-curriculum-schema` — Mở rộng schema chương trình để nhận nội dung mới

- **Trạng thái:** `completed`
- **Mục tiêu:** Schema, rubric và lịch ôn đủ biểu đạt các loại nội dung của đợt mở rộng và thêm bài mới không cần sửa test.
- **Tiêu chí nghiệm thu:** 4 tiêu chí

### 10. `20261009-103717-add-a2-entry-missions` — Thêm mission A2 làm lối vào cho người mới

- **Trạng thái:** `planning`
- **Mục tiêu:** Người học A2 có đường vào từng capability và đường lên B1.
- **Tiêu chí nghiệm thu:** 3 tiêu chí

### 11. `20261009-103718-add-interview-and-work-pathway` — Thêm lộ trình phỏng vấn và làm việc ở công ty nước ngoài

- **Trạng thái:** `planning`
- **Mục tiêu:** Mục tiêu 5 được phủ: người học luyện được phỏng vấn bằng câu chuyện của chính mình và các tình huống làm việc.
- **Tiêu chí nghiệm thu:** 3 tiêu chí

### 12. `20261009-103719-add-listening-and-long-reading` — Thêm luyện nghe hội thoại và bài đọc dài

- **Trạng thái:** `planning`
- **Mục tiêu:** Mục tiêu 2, 3 và 6 có luyện nghe thật và đọc tài liệu đủ dài.
- **Tiêu chí nghiệm thu:** 4 tiêu chí

### 13. `20261009-103720-add-vocabulary-and-fill-content-gaps` — Thêm từ vựng chuyên ngành và lấp ô trống ma trận nội dung

- **Trạng thái:** `planning`
- **Mục tiêu:** Mỗi capability đạt độ phủ B1 đến B2 với từ vựng và nhiều loại bài tập.
- **Tiêu chí nghiệm thu:** 4 tiêu chí

### 14. `20261009-103721-split-missions-into-sessions` — Chia mission thành các phiên học ngắn có checkpoint

- **Trạng thái:** `planning`
- **Mục tiêu:** Một dev có 10-15 phút vẫn hoàn thành một phiên có ý nghĩa và quay lại không mất tiến độ.
- **Tiêu chí nghiệm thu:** 3 tiêu chí

### 15. `20261009-104509-refactor-practice-feature-structure` — Refactor cấu trúc feature practice và dọn đặt tên

- **Trạng thái:** `planning`
- **Mục tiêu:** src/features/practice có cấu trúc rõ ràng, tên gọi đúng nghĩa và không còn file nhập nhằng.
- **Tiêu chí nghiệm thu:** 3 tiêu chí

### 16. `20261009-104458-final-docs-and-release-sync` — Đồng bộ tài liệu cuối epic và đóng release

- **Trạng thái:** `planning`
- **Mục tiêu:** Tài liệu trong docs/ khớp với kết quả cuối của epic và release minor được đóng đúng quy tắc.
- **Tiêu chí nghiệm thu:** 3 tiêu chí
