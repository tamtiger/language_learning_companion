# PRD — Nghiên cứu tính năng học tập dựa trên bằng chứng

## Outcome

Tạo decision package đủ tin cậy để chọn tập feature nhỏ nhất giúp Software Engineer Việt Nam A2–B2 cải thiện capability thật trong 20–30 phút/ngày, thay vì thêm feature theo trực giác.

## Phạm vi

- Audit black-box desktop/mobile và đối chiếu repository cho các flow được prompt yêu cầu.
- Research một quyết định vật chất: tập intervention/feature nào nên là P0 cho app local-only.
- So sánh IPA, sentence chunks và các candidate pronunciation, automaticity, interaction, retrieval/spacing, reading, feedback/measurement.
- Tạo evidence synthesis, decision matrix, roadmap và P0 pilot brief.

## Ngoài phạm vi

- Không sửa code, content, schema, docs owner hoặc dependency.
- Không tiến hành learner/expert study thật; chỉ thiết kế protocol và ghi rõ evidence gap.
- Không dùng synthetic QA để tuyên bố hiệu quả học tập.

## Acceptance criteria

### AC `AC-1`

Audit black-box và repository lập inventory feature hiện có, bao phủ pronunciation, spoken, meeting/technical explanation, technical reading, retry, transfer, delayed review, desktop/mobile và gap map theo sáu mục tiêu.

### AC `AC-2`

Research synthesis dùng nguồn học thuật hoặc chính thức đáng tin cậy, ghi protocol, population, intervention, comparator, outcome, giới hạn và tách fact khỏi inference cho các cơ chế có thể đổi quyết định.

### AC `AC-3`

Decision matrix đánh giá IPA, sentence chunks và các candidate khác theo evidence–fit–impact–cost–risk, phân loại Must-have, experiment, later hoặc reject/defer và tạo roadmap P0/P1/P2.

### AC `AC-4`

P0 pilot brief xác định learner journey, local-only/privacy boundary, measurable success/failure threshold, unseen transfer, delayed retention, rollout và rollback mà không tuyên bố efficacy chưa đo.

### AC `AC-5`

Task chỉ tạo/cập nhật Harnix task artifacts và báo cáo nghiên cứu; không thay đổi product code, content hoặc owner docs.

## Quyết định nghiên cứu

**Câu hỏi:** Tập intervention tối thiểu nào nên được ưu tiên P0 để sửa bottleneck lớn nhất của app mà vẫn local-only, đo trung thực và phù hợp persona?

Evidence phân biệt option phải gồm: gap runtime thật; learning mechanism; population/outcome/dosage/retention của nguồn; fit với persona; feasibility/privacy; nguy cơ illusion of learning. Dừng khi mỗi P0 candidate có ít nhất hai nguồn độc lập hoặc được hạ confidence rõ ràng, và nguồn mới không còn khả năng đổi thứ tự P0.

## Preservation

Giữ nguyên toàn bộ dirty worktree có trước task. Chỉ task-owned artifacts dưới thư mục task mới được cập nhật.