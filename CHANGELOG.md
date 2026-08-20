# Changelog

Mọi thay đổi đáng chú ý của dự án được ghi tại đây theo cấu trúc của [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Dự án hiện chưa phát hành version công khai.

## [Unreleased]

### Added

- Mở rộng `LearningLoopV1` tới cả 6 spoken missions; bổ sung four-phase context
  banks cho architecture walkthrough, ownership interview, technical decision và
  Daily Standup.
- Thêm scripted `interruption`, cue chỉ theo lỗi pre/post diagnostic và listener/
  expert protocol cho intent, critical facts, comprehensibility và agreement.

- Thêm `LearningLoopV1` optional cho spoken v3: perception pretest/training/posttest,
  pronunciation cue theo lỗi, 4–6 functional chunks, guided shadowing, delayed
  imitation, variation, listen-back và scripted clarification/repair.
- Thêm hai pilot `meeting-disagree-and-recap-b2` và
  `technical-tradeoff-explanation-b2`, với context riêng cho baseline, retry,
  transfer và delayed review.
- Thêm model-audio adapter local cho bundled assets hoặc browser TTS có nhãn,
  transcript theo phase, replay, voice-availability evidence và honest opt-out.
- Thêm process evidence tối thiểu cho perception/shadowing/listen-back/interaction.
- Thêm optional `performanceTask.practiceContexts` cho schema v3, gồm evidence
  packet riêng ở baseline, transfer và review với validation artifact ID.
- Thêm realism pilot cho `workplace-issue-update-b1`: ba incident evidence packet,
  scaffold F-I-A-R, worked signal map và auto-check về fact/hypothesis/request.
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

- Migrate Daily Standup từ v2 sang v3 capability mission; giữ function
  yesterday–today–blocker và thêm cold baseline, retry, unseen transfer, D2/D7.
- Training mistakes vẫn nhận immediate feedback nhưng không tự tạo pronunciation
  target nếu pre/post diagnostic không kích hoạt cue.

- Nâng backup/progress contract lên `ProgressEnvelopeV4`; backup V3 được migrate
  an toàn với `process: null`, còn learner response/audio vẫn session-only.
- Bổ sung complete runbook cho baseline `technical-doc-action-b1` trước yêu cầu
  đọc một lần rồi viết từ trí nhớ; thêm retry context cho practice contract.
- Spoken capture được key theo lesson/phase/interaction turn để timer, snapshot và
  object URL không rò sang attempt kế tiếp.
- Capability task chỉ render evidence của phase hiện tại; cold baseline không lộ
  instructional input, model response hoặc transfer evidence.
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

- Từ chối external audio URL trong content; bundled audio chỉ dùng đường dẫn
  `/audio/...` đã giới hạn và TTS chạy qua browser API tại thiết bị.
- Không persist hoặc upload audio, transcript hay nội dung câu trả lời; written response chỉ tồn tại trong session và audio chỉ dùng local object URL có cleanup.
- Backup chỉ chứa metadata allowlist; import malformed hoặc sai version bị từ chối mà không thay state hiện tại.
- Dependency audit sau refactor không còn vulnerability đã biết.

### Verification

- Thêm regression test cho parse/validation `practiceContexts`, độ khác biệt giữa
  ba evidence packet và phase isolation trong UI.
- Regression suite hiện tại đạt 24 test files và 97 tests; lint và production build đều PASS.
- Manual QA desktop/mobile xác nhận bốn spoken mission mới vào đúng cold baseline và Daily Standup đi trọn perception/shadowing, interruption/clarification, retry và unseen transfer. Model/chunks vẫn khóa trước attempt, viewport 390px không tràn ngang, console không có app-origin error; đây là QA chức năng synthetic, không phải evidence về efficacy.
