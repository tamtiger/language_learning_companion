# Sửa logic hoàn thành, ôn tập và bền vững dữ liệu

- **ID:** 20261009-103712-fix-learning-state-logic
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 13:51:27 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 6/6 met or waived |
| Required checks | 100% | 4/4 passed |
| Residual risks | 5 | r-sig-change: low, r-multitab: low, r-backup-forward: low, r-review-during-repeat: low, r-tz-test: low |

## Goal

Trạng thái hoàn thành, lịch ôn và lưu trữ phản ánh đúng năng lực thật và không mất dữ liệu âm thầm.

## Non-goals

- Không đổi giao diện ngoài banner, xác nhận và nhãn trạng thái
- Không đổi định dạng backup đã xuất mà không migration

## Relevant paths

- `ARCHITECTURE.md`
- `src/app`
- `src/domain`
- `src/features`
- `src/infrastructure/storage`
- `src/shared`
- `tests`

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): Transfer chưa đạt hợp đồng không đặt mission completed và không lên lịch ôn; quyết định nằm trong domain (applyTransferOutcome), khớp ARCHITECTURE.md.
- [x] `ac-2` (met): Review chỉ tính đạt khi rubric không rỗng và đạt cả độc lập lẫn hợp đồng output (assessReview trong domain).
- [x] `ac-3` (met): Lịch ôn tính theo ngày lịch địa phương; test với TZ cố định ở ranh 23:59/00:01; Today cập nhật khi qua giờ đến hạn.
- [x] `ac-4` (met): Luyện lại không che bài ôn đến hạn, giữ nguyên reviewStage, có bước xác nhận trước khi luyện lại.
- [x] `ac-5` (met): Attempt lưu kèm assessment và contentRevision; Progress không chấm lại attempt cũ bằng content hiện tại.
- [x] `ac-6` (met): Có trạng thái persistence (ok/quarantined/memory-only) hiện banner có hướng xử lý; lỗi setItem/quota không làm kẹt phase; nhiều tab đồng bộ qua sự kiện storage.

## Required checks

- [x] `check-domain-logic` (focused): Domain và schema: transfer, review, lịch ngày địa phương, hợp đồng, attempt — pass (2026-10-09 13:49:58 +07:00)
- [x] `check-store-persistence` (focused): Store: transfer, review, luyện lại, quota, đồng bộ tab — pass (2026-10-09 13:50:01 +07:00)
- [x] `check-state-ui` (focused): UI: Today, xác nhận luyện lại, transfer chưa đạt, banner persistence — pass (2026-10-09 13:50:20 +07:00)
- [x] `check-suite` (full): Toàn bộ test của dự án (suite) — pass (2026-10-09 13:50:50 +07:00)

## Decisions

- **d-domain-first** — Quyết định đạt/hoàn thành/ôn nằm trong domain (applyTransferOutcome, assessReview); store nhận hợp đồng qua policy và trả assessment.
  - _Why:_ Hiện UI tự gọi assessTransfer sau khi store đã completed; chuyển vào domain để khớp ARCHITECTURE.md và test được.
- **d-local-day** — Review đến hạn từ 00:00 địa phương của ngày đích; lưu ISO, so sánh nextReviewAt <= now, không migration.
  - _Why:_ Mốc 24 giờ làm bài học 23:50 đến hạn 23:50; dữ liệu cũ vẫn dùng được.
- **d-additive-attempt** — Thêm assessment và contentRevision tùy chọn vào attempt v5, giữ storageVersion 5; attempt cũ hiện chưa có đánh giá và không tính đạt.
  - _Why:_ Tránh chấm lại attempt cũ bằng nội dung mới mà không phải bump version; backup cũ vẫn nhập được.
- **d-review-parallel** — Lesson đang luyện lại mà review đến hạn phát hai mục review và resume; lối vào mang entry review|continue; luyện lại cần xác nhận và giữ reviewStage.
  - _Why:_ Đã thống nhất với người dùng: luyện lại không được che bài ôn đến hạn.

## Residual risks

- **r-sig-change** (low) — Đổi chữ ký recordCapabilityAttempt ảnh hưởng nhiều test; sửa cùng slice.
- **r-multitab** (low) — Đồng bộ nhiều tab chỉ là bản ghi sau cùng thắng; hai tab ghi cùng lúc vẫn có thể mất một lượt.
- **r-backup-forward** (low) — Backup mới có trường assessment/contentRevision không nhập được vào bản app cũ hơn do schema strict.
- **r-review-during-repeat** (low) — Sau khi nộp review trong lúc đang luyện lại, màn hình vẫn hiện 'Mission hoàn thành' dù vòng luyện lại còn dở (dữ liệu đúng: status in-progress); chỉ là copy UI, nên xử lý ở task UX.
- **r-tz-test** (low) — Test múi giờ đặt process.env.TZ lúc chạy (Asia/Ho_Chi_Minh, America/Los_Angeles); đã pass trên Node 25, chưa kiểm chứng trên Node 22.

## Evidence

- `check-domain-logic` — pass (2026-10-09 13:49:58 +07:00): npx vitest run tests/domain tests/infrastructure tests/features/progress — exit 0
- `check-store-persistence` — pass (2026-10-09 13:50:01 +07:00): npx vitest run tests/shared/hooks/useAppStore.test.ts — exit 0
- `check-state-ui` — pass (2026-10-09 13:50:20 +07:00): npx vitest run tests/features/today tests/features/practice tests/features/lesson tests/app — exit 0
- `check-suite` — pass (2026-10-09 13:50:50 +07:00): npm test — exit 0
