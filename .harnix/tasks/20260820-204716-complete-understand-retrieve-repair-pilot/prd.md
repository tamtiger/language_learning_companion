# PRD — Hoàn thiện pilot Understand Retrieve Repair

### AC `AC-1`

Hai mission `meeting-disagree-and-recap-b2` và `technical-tradeoff-explanation-b2` có tag `p0-pilot`. Catalog hiển thị badge; lesson có stage navigator theo phase.

### AC `AC-2`

Với spoken learning loop có recording URL, playback phải xảy ra và mọi item `listenBackChecklist` phải được xác nhận. Timer-only không giả vờ đã listen-back.

### AC `AC-3`

`LessonProgress.activeProcessEvidence` chỉ chứa metadata allowlist; không chứa audio URL, transcript hoặc learner response. Evidence được ghi sau input, đọc lại khi resume và xóa khi reset.

### AC `AC-4`

`EvidenceContract` có `requireListenBack` và `requiredInteractionTurnIds`. `assessTransfer` trả `listen-back-missing` hoặc `interaction-incomplete`. Storage migrate v4 an toàn.

### AC `AC-5`

Focused/full tests, lint, build và browser QA desktop/mobile phải pass.

## Compatibility, privacy, rollback

Content schema không đổi; pilot dùng workflow tag sẵn có. Backup mới đọc v4/v5 và tiếp tục từ chối v1/v2. Chỉ metadata allowlist được persist; rollback không xóa progress cũ.
