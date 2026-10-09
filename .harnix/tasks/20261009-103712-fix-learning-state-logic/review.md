# Sửa logic hoàn thành, ôn tập và bền vững dữ liệu

- **ID:** 20261009-103712-fix-learning-state-logic
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** planning/planning
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 10:48:15 +07:00

**Verdict:** PENDING — 0/6 acceptance criteria met

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 0% | 0/6 met or waived |
| Required checks | 0% | 0/4 passed |

## Goal

Trạng thái hoàn thành, lịch ôn và lưu trữ phản ánh đúng năng lực thật và không mất dữ liệu âm thầm.

## Non-goals

- Không đổi giao diện ngoài banner, xác nhận và nhãn trạng thái
- Không đổi định dạng backup đã xuất mà không migration

## Relevant paths

- `src/domain`
- `src/shared/hooks/use_app_store.ts`
- `src/infrastructure/storage`
- `src/features/today`
- `src/features/progress`
- `ARCHITECTURE.md`

## Acceptance criteria

- [ ] `ac-1` (pending): Transfer chưa đạt hợp đồng không đặt mission completed và không lên lịch ôn; quyết định nằm trong domain (applyTransferOutcome), khớp ARCHITECTURE.md.
- [ ] `ac-2` (pending): Review chỉ tính đạt khi rubric không rỗng và đạt cả độc lập lẫn hợp đồng output (assessReview trong domain).
- [ ] `ac-3` (pending): Lịch ôn tính theo ngày lịch địa phương; test với TZ cố định ở ranh 23:59/00:01; Today cập nhật khi qua giờ đến hạn.
- [ ] `ac-4` (pending): Luyện lại không che bài ôn đến hạn, giữ nguyên reviewStage, có bước xác nhận trước khi luyện lại.
- [ ] `ac-5` (pending): Attempt lưu kèm assessment và contentRevision; Progress không chấm lại attempt cũ bằng content hiện tại.
- [ ] `ac-6` (pending): Có trạng thái persistence (ok/quarantined/memory-only) hiện banner có hướng xử lý; lỗi setItem/quota không làm kẹt phase; nhiều tab đồng bộ qua sự kiện storage.

## Required checks

- [ ] `check-domain-logic` (focused): Domain: transfer, review, lịch ôn theo ngày, assessment — chưa chạy / not yet run
- [ ] `check-store-persistence` (focused): Store: luyện lại, quota, đồng bộ tab — chưa chạy / not yet run
- [ ] `check-state-ui` (focused): UI: banner persistence, xác nhận luyện lại, Today — chưa chạy / not yet run
- [ ] `check-suite` (full): Toàn bộ test của dự án (suite) — chưa chạy / not yet run

## Evidence

_None recorded yet._
