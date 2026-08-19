# Changelog

Mọi thay đổi đáng chú ý của dự án được ghi tại đây theo cấu trúc của [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Dự án hiện chưa phát hành version công khai.

## [Unreleased]

### Added

- Xây dựng capability-first learning engine cho sáu outcome của Software Engineer: giao tiếp công việc, đọc tài liệu kỹ thuật, họp quốc tế, giải thích kỹ thuật, phỏng vấn quốc tế và học công nghệ bằng tiếng Anh.
- Thêm năm mission schema v3 và normalize Daily Standup v2 thành mission thứ sáu; mỗi mission có baseline, input, performance, self-feedback, retry, transfer và delayed review.
- Thêm Today queue, Catalog theo capability, trang evidence tiến bộ và Settings cho backup/import/reset metadata.
- Thêm learning/progress domain thuần, lịch review 1–3–7 ngày, attempt history có giới hạn và progress aggregation theo capability.
- Thêm `focusCriterionId` optional, pure qualifying-transfer selectors và regression tests cho retry/progress evidence mà vẫn tương thích backup v2 cũ.
- Thêm test harness React, accessibility smoke, mission matrix, storage migration, privacy và spoken timer-only fallback.

### Changed

- Refactor UI thành app shell, Today/Catalog/Progress/Settings, generic `LessonFlow`, section renderers và spoken/written capability tasks.
- Chuẩn hóa content bằng canonical schema v3, đồng thời giữ compatibility cho sáu lesson pronunciation v1 và Daily Standup v2 qua parse/normalization thay vì rewrite dữ liệu nguồn.
- Chuyển Zustand thành adapter mỏng trên storage contract v2 có strict validation, migration và import fail-closed.
- Đồng bộ `PRODUCT.md`, `CONTENT.md`, `ARCHITECTURE.md`, `README.md`, `START_HERE.md` và các prompt owner theo product local-only và time-to-capability.
- Refactor self-feedback để chọn một `retry focus` từ criterion chưa đạt, bắt buộc chấm lại rubric sau retry và lưu evidence thật thay vì `not-rated`.
- Đổi Progress từ số “Độc lập” trên mọi attempt sang `Transfer attempts` và `qualifying transfer` đạt toàn bộ rubric trong điều kiện độc lập, kèm định nghĩa công khai.

### Removed

- Xóa các bản thảo Markdown legacy không executable đã được thay bằng owner docs và curriculum JSON.
- Xóa `PROJECT_CONVENTIONS.md` lỗi thời cùng các prompt triển khai/tổng quát trùng với Harnix workflow và `IMPROVEMENT_PROMPT.md`.
- Xóa asset scaffold Vite/React, sprite không dùng, compatibility facade không importer và wrapper parser/type cũ trùng canonical content layer.
- Xóa performance completion helper cũ; learning loop hiện dùng state machine canonical trong domain.

### Security

- Không persist hoặc upload audio, transcript hay nội dung câu trả lời; written response chỉ tồn tại trong session và audio chỉ dùng local object URL có cleanup.
- Backup chỉ chứa metadata allowlist; import malformed hoặc sai version bị từ chối mà không thay state hiện tại.
- Dependency audit sau refactor không còn vulnerability đã biết.

### Verification

- Snapshot trước cleanup đạt 16 test files và 81 tests, lint và production build.
- Sau cleanup, regression suite còn 14 test files và 64 tests đều PASS; các test bị loại chỉ bao phủ facade/wrapper dead code, còn toàn bộ media recorder coverage có giá trị được giữ dưới test suite đúng trách nhiệm.
