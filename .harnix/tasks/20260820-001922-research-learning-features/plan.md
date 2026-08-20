# Plan — Nghiên cứu tính năng học tập dựa trên bằng chứng

## Checklist

- [x] `S1` — Audit runtime desktop/mobile và inventory repository.
- [x] `S2` — Research các cơ chế có khả năng đổi quyết định P0.
- [x] `S3` — Tổng hợp candidate matrix, roadmap và P0 pilot.
- [x] `S4` — Verify artifacts, scope preservation và hoàn tất task.

Task này là research/docs-only; không có product behavior edit nên RED–GREEN không tạo meaningful signal. Strongest alternatives là exact artifact checks, scope diff và fresh Harnix snapshots.

### Slice `S1`

Chạy các flow bắt buộc trong prompt trên app thật, sau đó đọc content/schema/UI/storage liên quan để phân biệt behavior quan sát được với inference. Ghi evidence và gap map.

Criteria: `AC-1`
Checks: `check-current-feature-audit`
Paths: `LEARNING_FEATURE_RESEARCH_PROMPT.md`, `.harnix/tasks/20260820-001922-research-learning-features/research/current-feature-audit.md`, `content/**/*.json`, `src/features/**/*`

### Slice `S2`

Dùng nguồn primary/authoritative và synthesis chất lượng. Ghi protocol, source log, facts, inference, conflicts, limitations và decision impact; hạ confidence khi population/outcome không khớp.

Criteria: `AC-2`
Checks: `check-evidence-synthesis`
Paths: `LEARNING_FEATURE_RESEARCH_PROMPT.md`, `.harnix/tasks/20260820-001922-research-learning-features/research/evidence-synthesis.md`

### Slice `S3`

So sánh candidate bằng evidence–fit–impact–cost–risk, phân loại Must-have/experiment/later/reject, xây P0/P1/P2 và falsifiable pilot brief.

Criteria: `AC-3`, `AC-4`
Checks: `check-feature-roadmap`
Paths: `LEARNING_FEATURE_RESEARCH_PROMPT.md`, `.harnix/tasks/20260820-001922-research-learning-features/research/feature-decision-roadmap.md`

### Slice `S4`

Chạy required checks với snapshot trước/sau, review compliance trước quality, xác nhận không thay product files và hoàn tất chỉ khi mọi AC có fresh evidence.

Criteria: `AC-1`, `AC-2`, `AC-3`, `AC-4`, `AC-5`
Checks: `check-current-feature-audit`, `check-evidence-synthesis`, `check-feature-roadmap`, `check-research-scope`
Paths: `.harnix/tasks/20260820-001922-research-learning-features`, `PRODUCT.md`, `CONTENT.md`, `ARCHITECTURE.md`, `README.md`, `START_HERE.md`, `content`, `src`

## Ready gate

- Không còn unresolved product choice trong research scope.
- P0 giới hạn ở hai function và có success/failure/rollback contract.
- Không yêu cầu dependency, cloud, account, analytics hoặc product mutation.
- Dirty worktree trước task được giữ nguyên; task chỉ sở hữu artifacts trong thư mục task.