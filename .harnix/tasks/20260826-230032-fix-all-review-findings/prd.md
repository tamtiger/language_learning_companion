# PRD — Sửa toàn bộ finding của đợt review

## Kết quả

Khôi phục tính đúng đắn của evidence học tập, migration, mission flow và Progress; đồng thời loại bỏ dead end, rò rỉ vòng đời media, lỗi accessibility và sai lệch tài liệu đã được review xác nhận.

## Phạm vi hành vi

- Transfer chỉ qualifying khi attempt thuộc đúng lesson/task, có đúng tập rubric của task, mọi rubric đều `met`, hoàn tất đúng process gate và đạt independence contract.
- Listen-back chỉ hoàn tất khi audio hiện tại phát đến `ended`; play, pause hoặc audio cũ không mở checklist hay qualifying.
- Persisted state và backup v3/v4 được migrate qua cùng một canonical converter sang v5; v5 malformed hoặc future version fail closed về state an toàn và không làm export ném lỗi.
- Settings import xóa candidate cũ ngay khi chọn file mới, khóa confirm trong khi đọc, hiển thị lỗi đọc/parse và chỉ restore candidate vừa được xác thực.
- Capability mission bắt buộc hoàn tất toàn bộ auto-check của lesson trước performance; transition dùng state-machine hợp lệ; process evidence spoken đã persist khôi phục readiness sau reload.
- Repeat lesson mở được từ Today và màn hoàn tất, reset state của vòng mới nhưng giữ `attemptCount`, `recentAttempts`, review schedule và evidence lịch sử.
- Progress dùng `attemptCount` cho tổng attempt; các số dựa trên buffer 50 attempt được ghi rõ là recent.
- Mọi exercise được schema chấp nhận đều có đáp án reachable: choice dùng options, fill dùng text input, matching dùng mapping key/value và ordering dùng thứ tự; schema từ chối duplicate hoặc correct answer nằm ngoài UI.
- Media owned resource được dọn khi source đổi hoặc component unmount; speech synthesis bị cancel theo ownership; perception opt-out ghi đúng số training item đã hoàn tất.
- Keyboard focus được chuyển tới heading mới khi phase nội bộ đổi; màu chữ đạt WCAG AA, axe color-contrast không bị tắt, document dùng `lang="vi"`, Catalog có empty state có thể xóa filter.
- Copy phân biệt transfer/review/already-completed; tài liệu mô tả backup v5 và content-owned review intervals.

## Ngoài phạm vi

- Không thêm backend, account, cloud sync, analytics, AI grading, dependency hoặc E2E framework mới.
- Không sửa công cụ Browser/kernel của môi trường; browser QA chỉ là bằng chứng bổ sung nếu công cụ hoạt động.
- Không xóa dữ liệu học tập hợp lệ, không sửa/xóa release cũ trong changelog và không thay đổi contract privacy không persist learner output.
- Không commit, branch, push, publish hoặc tạo pull request.

## Acceptance criteria

### AC `AC-1`

Transfer assessment ràng buộc đúng `lessonId`, `taskId` và tập rubric; rubric thiếu/thừa/sai task hoặc listen-back chưa `ended` đều fail closed với reason actionable, còn attempt hợp lệ vẫn qualifying.

### AC `AC-2`

Zustand hydration và backup import dùng cùng migration v3/v4→v5, thêm đầy đủ process defaults, từ chối malformed/future state an toàn; Settings không thể confirm candidate cũ trong lúc đọc file mới và export không ném lỗi sau migration.

### AC `AC-3`

Capability mission không thể bỏ qua auto-check, chỉ đi qua transition hợp lệ và khôi phục spoken input readiness từ persisted process evidence mà không yêu cầu lặp learning loop đã hoàn tất.

### AC `AC-4`

Người học có thể bắt đầu vòng repeat từ Today hoặc màn hoàn tất; vòng mới reset state cần luyện nhưng bảo toàn attempt history, total count và review evidence.

### AC `AC-5`

Progress hiển thị tổng Attempts từ `attemptCount`, dùng nhãn recent cho thống kê lấy từ retained buffer và đánh giá transfer bằng cùng expected-task contract.

### AC `AC-6`

Schema từ chối exercise có duplicate/unreachable correct answer; renderer có semantics đúng cho choice, fill, matching và ordering; perception opt-out ghi đúng `trainingCompleted` ở mọi stage.

### AC `AC-7`

Audio/recording/speech resources được cleanup khi source đổi hoặc unmount; phase focus, contrast, axe, document language và Catalog empty state đáp ứng kiểm tra accessibility tự động và keyboard-focused.

### AC `AC-8`

Copy và owner docs phản ánh đúng completion kind, backup v5 và content-owned review policy; version root tăng đúng một PATCH từ 1.1.0 lên 1.1.1, package-lock đồng bộ và release 2026-08-26 được prepend mà không sửa lịch sử.

## Compatibility và preservation

Storage v3/v4 hợp lệ tiếp tục migrate lên v5; state v5 hợp lệ giữ nguyên. State không xác thực hoặc version tương lai không được cast mù. Daily Mission và release 1.1.0 đang có trong dirty worktree là user-owned baseline: mọi thay đổi Today, package manifests và changelog phải được xây trên baseline này và giữ nguyên nội dung cũ.

## Rủi ro và rollback

Rủi ro chính là làm mất evidence khi repeat/migrate, khóa nhầm mission và tạo stale audio state. Mỗi contract được khóa bằng focused RED trước GREEN; các thay đổi tách theo slice để có thể rollback theo file mà không đụng lịch sử release. Không có network hoặc destructive action.



