# PRD: Daily mission gameful

## Outcome

Người học thấy một mục tiêu ngắn, có tiến trình và phản hồi mang cảm giác hoàn thành ngay trên Today, nhưng mọi trạng thái vẫn dựa trên learning evidence thật.

## Material unknown

Mechanic nào từ các app học ngôn ngữ tạo động lực bắt đầu/tiếp tục tốt nhất cho sản phẩm capability-first mà không cần leaderboard, currency, lives hoặc proficiency giả?

## In scope

- Research pattern gameful của ít nhất năm app bằng nguồn chính thức.
- Chọn đúng một mechanic nhỏ cho recommendation chính trên Today.
- Dùng progress/evidence hiện có; ưu tiên không migration storage.
- Thêm focused tests, responsive/keyboard QA và release metadata.

## Out of scope

- Economy, avatar, shop, social graph, leaderboard, push notification.
- Thay đổi learning loop, transfer qualification hoặc content schema.
- Claim hiệu quả học tập khi chưa có learner study.

### AC `AC-1`

Benchmark ít nhất năm app học ngôn ngữ bằng nguồn chính thức, tách fact/inference và chọn mechanic theo motivation, fit, integrity, accessibility cùng implementation risk.

### AC `AC-2`

Today có một daily mission gameful với goal, tiến trình và reward/feedback dễ hiểu; trạng thái được suy ra từ evidence hiện có và không tạo proficiency claim giả.

### AC `AC-3`

Daily mission giữ đúng ưu tiên review → resume → baseline → new, mở đúng lesson content-driven và không làm yếu baseline, retry, transfer hoặc delayed review.

### AC `AC-4`

Critical path dùng được bằng keyboard, có semantic progress/status, không phụ thuộc animation và không overflow ở 390x844 cùng 1440x900.

### AC `AC-5`

Focused tests, full tests, lint, build, browser QA và release/version check pass trên source cuối.


