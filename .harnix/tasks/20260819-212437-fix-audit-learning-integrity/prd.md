# PRD — Learning integrity refactor, fresh schema

## Kết quả

Sửa toàn bộ finding runtime audit để output được đo thật, feedback actionable, resume an toàn, Progress minh bạch, UX mobile tốt hơn, pronunciation completion đúng và mỗi capability có thêm một mission nghề nghiệp.

## Quyết định replan

App chưa có dữ liệu production. Theo chỉ thị người dùng, storage chuyển thẳng sang `ProgressEnvelopeV3`: không migrate/import v2, không `legacy-unknown`, không bảo toàn completion pre-release. Dữ liệu v2 bị từ chối và app bắt đầu với progress rỗng. Curriculum hiện tại và các file prompt/README ngoài implementation scope không bị xóa.

## Contract

- Attempt v3 bắt buộc có `durationSeconds`, `wordCount: number | null`, rubric, independence và preparation time đo thật.
- Response text, transcript, audio/blob/object URL và free text chỉ sống trong session memory, không persist/export.
- `LessonProgress` có `activePhase` và `completedExerciseIds`.
- Resume boundaries: baseline save → input; main capture start → performance; feedback save → retry; retry save → transfer; transfer save → completed/clear phase. Reload ở self-feedback quay lại performance vì output không persist.
- Pure transfer assessment trả qualifying state và reason codes dùng chung cho Today, feedback và Progress.
- Spoken capture dùng idle → running → ready → reset, không complete ở 0 giây.
- Pronunciation chỉ finish khi mọi exercise đúng; restart clear exercise progress.
- Thêm sáu mission v3: `workplace-clarification-request-b1`, `technical-log-diagnosis-b1`, `meeting-disagree-and-recap-b2`, `architecture-walkthrough-b2`, `behavioral-interview-ownership-b2`, `technology-troubleshooting-from-docs-b2`.

## Ngoài phạm vi

Không AI grading, backend, account, cloud sync, analytics, telemetry, persisted learner output, khóa general English lớn, dependency/E2E framework lớn hoặc Git publication.

## Acceptance criteria

### AC `AC-1`

Spoken capture có start/finish/reset rõ ràng, không complete 0 giây, playback hợp lệ và chuyển số đo thật tới attempt.

### AC `AC-2`

Waived theo chỉ thị fresh-only; criterion lịch sử được giữ nguyên trong TaskRecord và thay bằng `AC-10`.

### AC `AC-3`

Self-feedback/retry hiển thị learner output phiên cùng model/rubric/focus; reload/export không giữ response/audio.

### AC `AC-4`

Reload/resume về phase an toàn theo contract, không suy diễn từ last attempt.

### AC `AC-5`

Progress hiển thị evidence chi tiết, qualifying state và actionable reasons từ domain assessment chung.

### AC `AC-6`

Đổi page reset scroll/focus, mobile navigation không lộ scrollbar và glossary giải thích thuật ngữ learning loop.

### AC `AC-7`

Waived phần bảo toàn completion cũ; criterion lịch sử được thay bằng `AC-11`.

### AC `AC-8`

Có đúng sáu mission v3 mới, một mission mỗi capability, hợp lệ và mở được trong catalog/flow.

### AC `AC-9`

Owner docs và CHANGELOG phản ánh runtime; focused/full tests, lint, build và manual critical flow đều đạt.

### AC `AC-10`

Storage schema v3 fresh-only chỉ chấp nhận evidence đo thật, từ chối dữ liệu v2, export không chứa learner output và không có nhánh legacy-unknown.

### AC `AC-11`

Mọi pronunciation lesson chỉ hoàn tất sau khi tất cả exercise đúng và restart xóa exercise progress, không có ngoại lệ completion legacy.

## Rủi ro

Khóa privacy bằng strict schema/tests; revoke audio URL theo ownership; dùng một assessment function; dùng deterministic phase transitions; content wave giới hạn một mission/capability; giữ các thay đổi ngoài implementation scope.