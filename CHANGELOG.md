# Changelog

Mọi thay đổi đáng chú ý của dự án được ghi tại đây theo cấu trúc của [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Dự án hiện chưa phát hành version công khai.

## [Unreleased]

### Added

- Thêm sáu mission v3 nghề nghiệp mới, nâng catalog lên 12 mission với hai mission cho mỗi capability.
- Thêm learner-output comparison trong session, playback local, transfer assessment có reason codes và glossary learning loop.
- Thêm pronunciation completion gate lưu exercise ID đã đúng và restart xóa sạch progress của bài.
- Thêm `IMPROVEMENT_PROMPT.md` làm prompt tổng review, research và cải tiến end-to-end theo sáu outcome, từ audit và research có mục tiêu đến implement, verification và báo cáo evidence.
- Xây dựng capability-first learning engine cho sáu outcome của Software Engineer: giao tiếp công việc, đọc tài liệu kỹ thuật, họp quốc tế, giải thích kỹ thuật, phỏng vấn quốc tế và học công nghệ bằng tiếng Anh.
- Thêm năm mission schema v3 và normalize Daily Standup v2 thành mission thứ sáu; mỗi mission có baseline, input, performance, self-feedback, retry, transfer và delayed review.
- Thêm Today queue, Catalog theo capability, trang evidence tiến bộ và Settings cho backup/import/reset metadata.
- Thêm learning/progress domain thuần, lịch review 1–3–7 ngày, attempt history có giới hạn và progress aggregation theo capability.
- Thêm `focusCriterionId` optional, pure transfer assessment và regression tests cho retry/progress evidence.
- Thêm test harness React, accessibility smoke, mission matrix, storage migration, privacy và spoken timer-only fallback.

### Changed

- Chuyển progress sang fresh-only `ProgressEnvelopeV3`: attempt bắt buộc có duration/word count/preparation đo thật, phase checkpoint và exercise progress; từ chối toàn bộ backup v1/v2.
- Refactor spoken capture thành `idle → running → ready → reset`, không thể hoàn thành ở 0 giây và cleanup object URL theo ownership.
- Nâng Progress để hiển thị lịch sử transfer, measured metadata và lý do actionable khi chưa qualifying; navigation reset scroll/focus và ẩn scrollbar trên mobile.
- Refactor UI thành app shell, Today/Catalog/Progress/Settings, generic `LessonFlow`, section renderers và spoken/written capability tasks.
- Chuẩn hóa content bằng canonical schema v3, đồng thời giữ compatibility cho sáu lesson pronunciation v1 và Daily Standup v2 qua parse/normalization thay vì rewrite dữ liệu nguồn.
- Chuyển Zustand thành adapter mỏng trên storage contract v3 có strict validation và import fail-closed.
- Đồng bộ `PRODUCT.md`, `CONTENT.md`, `ARCHITECTURE.md`, `README.md`, `START_HERE.md` và các prompt owner theo product local-only và time-to-capability.
- Refactor self-feedback để chọn một `retry focus` từ criterion chưa đạt, bắt buộc chấm lại rubric sau retry và lưu evidence thật thay vì `not-rated`.
- Đổi Progress từ số “Độc lập” trên mọi attempt sang `Transfer attempts` và `qualifying transfer` đạt toàn bộ rubric trong điều kiện độc lập, kèm định nghĩa công khai.

### Removed

- Xóa migration/compatibility progress pre-release, `legacy-unknown` và nhánh bảo toàn completion cũ.
- Xóa các bản thảo Markdown legacy không executable đã được thay bằng owner docs và curriculum JSON.
- Xóa `PROJECT_CONVENTIONS.md` lỗi thời cùng các prompt triển khai/tổng quát trùng với Harnix workflow và `IMPROVEMENT_PROMPT.md`.
- Xóa asset scaffold Vite/React, sprite không dùng, compatibility facade không importer và wrapper parser/type cũ trùng canonical content layer.
- Xóa performance completion helper cũ; learning loop hiện dùng state machine canonical trong domain.

### Security

- Không persist hoặc upload audio, transcript hay nội dung câu trả lời; written response chỉ tồn tại trong session và audio chỉ dùng local object URL có cleanup.
- Backup chỉ chứa metadata allowlist; import malformed hoặc sai version bị từ chối mà không thay state hiện tại.
- Dependency audit sau refactor không còn vulnerability đã biết.

### Verification

- Regression suite hiện tại đạt 18 test files và 77 tests; lint và production build đều PASS.
- Manual QA xác nhận learning loop written, resume không lưu learner output, pronunciation completion gate/restart và navigation mobile hoạt động đúng.
