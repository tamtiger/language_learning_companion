# PRD: Refactor UX theo đường ngắn nhất tới capability

## Outcome

Rút ngắn đường từ Today tới meaningful practice cho Minh khi có một việc công việc sắp xảy ra, đồng thời giữ nguyên ưu tiên review/resume và toàn bộ learning gate.

## Phạm vi đã chốt

- Refactor `TodayPage` thành hai lựa chọn rõ: tiếp tục việc hệ thống ưu tiên hoặc chọn trực tiếp việc sắp làm.
- Hiển thị sáu job intent bằng nút native, để người học thấy và so sánh mà không mở `select` hay vào Catalog.
- Mỗi job intent lấy lesson tốt nhất từ canonical content và thứ tự `review → resume → baseline → new`; không hard-code lesson ID.
- Với spoken lesson, hiển thị ngay `Sentence chunks` và `Luyện phát âm` để feature có information scent trước khi mở lesson.
- Giữ nguyên lesson flow, baseline/model lock, retry, transfer, review, progress/storage và local-only privacy.
- Bump PATCH một lần và prepend changelog vì đây là production UX behavior.

## Ngoài phạm vi

- Không redesign Catalog, curriculum hoặc toàn bộ app.
- Không tự động bắt đầu timer/recording từ Today và không bỏ màn hình prompt/evidence.
- Không thêm account, cloud, analytics, AI scoring hoặc dependency.
- Không thay đổi dữ liệu progress/storage hoặc lesson JSON.
- Không commit, push hoặc publish.

## Bottleneck và quyết định

Baseline first-run cho job “sắp standup” cần `Catalog → chọn Daily Standup → bắt đầu timer-only`: 3 primary actions, 2 decision points và phải quét danh sách 18 lesson; trên 390x844 Daily Standup nằm dưới first viewport. Today chỉ đưa một recommendation thuật toán và không cho đổi theo nhu cầu tức thời.

Chọn bottleneck `DISCOVERY + COGNITIVE LOAD`: thiếu đường job-first trên Today. Sau refactor, cùng state/persona dùng `Luyện standup / meeting → bắt đầu timer-only`: 2 primary actions và 1 decision point, giảm 33,3% actions và 50% decision points mà không bỏ learning gate. Timing không được dùng làm acceptance vì baseline không đo bằng stopwatch.

## Contract UI

- Heading và copy dùng ngôn ngữ công việc, tránh buộc người mới hiểu `capability` hoặc `learning loop`.
- Khối recommendation nêu lý do ưu tiên, outcome lesson và đúng một CTA chính.
- Khối `Bạn cần luyện việc gì ngay?` render tối đa một nút cho mỗi capability theo thứ tự ổn định; mỗi nút có job label, lesson title, trạng thái kế tiếp và mode.
- Candidate của mỗi capability là item đầu tiên trong Today queue của capability; nếu không còn queue item thì fallback về performance lesson đầu tiên của capability và gắn trạng thái luyện lại.
- Spoken candidate hiển thị `Sentence chunks` và `Luyện phát âm`; written candidate hiển thị `Viết đầu ra công việc`.
- Nút là semantic `button`, có accessible name từ toàn bộ nội dung, focus-visible, target cao ít nhất 44 CSS px và không đổi ngữ cảnh cho tới khi người dùng kích hoạt.
- Queue tiếp theo vẫn tồn tại nhưng giảm visual competition so với recommendation/job picker.

## Acceptance

### AC `AC-1`
Có baseline journey và research synthesis phân biệt observation, fact, inference; chọn một bottleneck bằng impact, frequency, confidence và effort/risk.

### AC `AC-2`
Journey first-run standup giảm từ 3 xuống 2 primary actions và từ 2 xuống 1 decision point, đo từ Today tới lúc timer/recording bắt đầu; không bỏ baseline prompt hay gate.

### AC `AC-3`
First viewport desktop và mobile nêu việc nên làm tiếp, outcome công việc, CTA chính; job-first control cùng nhãn feature spoken có thể tìm bằng UI/accessible name mà không cần README hoặc mở Catalog.

### AC `AC-4`
Critical path dùng được bằng keyboard và screen reader surface, không overflow/chồng lấn ở 390x844 và 1440x900; recommendation, status, empty queue và resume state rõ.

### AC `AC-5`
Không regression learning integrity, content-driven behavior, local-only privacy, legacy/non-slice lessons hoặc progress evidence.

### AC `AC-6`
Focused tests, full tests, lint, build, browser QA và release/version check pass trên source cuối.