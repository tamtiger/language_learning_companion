# PRD — Actionable retry evidence

## Outcome

Rút ngắn vòng self-feedback → retry → transfer: mỗi retry sửa một rubric gap, lưu evidence trước/sau; Progress chỉ gọi transfer là đạt khi rubric và independence thỏa contract. Áp dụng generic cho sáu capability trong `PRODUCT.md`. Transfer chưa đạt vẫn hoàn tất mission và lên review, nhưng không được báo là đạt.

## Evidence

Fact: retry hiện không có RubricEditor, lưu toàn bộ `not-rated`; Progress đếm transfer thô và mọi attempt không bật ba cờ. Storage v2 strict/local-only. Baseline 64 tests, lint, build PASS.

Inference từ research: authentic task đã có; feedback chưa dẫn tới hành động retry và không tạo improvement evidence là bottleneck nhỏ nhất tác động cả sáu capability.

## Contract

- Khi có `not-met`, phải chọn đúng một criterion chưa đạt làm retry focus; all-met không ép chọn.
- Retry hiển thị focus, yêu cầu output và chấm lại toàn bộ rubric.
- Retry lưu rubric thật và optional `focusCriterionId`; dữ liệu v2 cũ vẫn hợp lệ.
- Fully met = rubric không rỗng và mọi rating `met`.
- Independent = không Vietnamese/translation/model answer và số hint không vượt `maxHints` của task; fallback 0 khi không có contract.
- Qualifying transfer = completed transfer + fully met + independent.
- Progress hiển thị attempts, transfer attempts, qualifying transfers cùng định nghĩa.
- Không persist response/audio/free text; không bump storage; không đổi content/completion/scheduling; không AI/cloud; không sửa duration; không commit.

## Acceptance

### AC `AC-1`

Self-feedback chọn focus khi có gap; retry hiển thị focus, yêu cầu output và rerate đầy đủ.

### AC `AC-2`

Retry persist rubric và optional focus ID; storage v2 backward-compatible và privacy-safe.

### AC `AC-3`

Pure helpers và Progress phân loại/hiển thị qualifying transfer đúng contract.

### AC `AC-4`

Owner docs và CHANGELOG phản ánh runtime, compatibility, privacy.

### AC `AC-5`

Focused/full tests, lint, build PASS; manual keyboard, resume cũ, transfer đạt/chưa đạt.
