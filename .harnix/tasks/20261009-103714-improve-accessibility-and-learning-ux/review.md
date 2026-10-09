# Cải thiện trợ năng, đồng hồ và bảo toàn tiến độ khi học

- **ID:** 20261009-103714-improve-accessibility-and-learning-ux
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** planning/planning
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 10:48:16 +07:00

**Verdict:** PENDING — 0/6 acceptance criteria met

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 0% | 0/6 met or waived |
| Required checks | 0% | 0/3 passed |

## Goal

Người dùng bàn phím và trình đọc màn hình hoàn thành được vòng học; không mất bản nháp; thời gian được tính công bằng.

## Non-goals

- Không chia mission thành phiên (task riêng ở đợt mở rộng)
- Không đổi nội dung bài học

## Relevant paths

- `src/features/practice`
- `src/features/lesson`
- `src/features/settings`
- `src/features/today`
- `src/app`
- `index.html`

## Acceptance criteria

- [ ] `ac-1` (pending): Focus không mất sau nút ghi âm, perception và reading ladder; kết quả có live region; không disable nút đang focus.
- [ ] `ac-2` (pending): Nội dung tiếng Anh có lang="en"; heading hoặc mô tả phase nêu baseline/retry/transfer; rubric là nhóm có tên tiêu chí; nút disabled nêu lý do.
- [ ] `ac-3` (pending): Cảnh báo khi rời trang lúc có bản nháp hoặc đang ghi âm (beforeunload và điều hướng nội bộ); tiến độ reading ladder và perception được lưu metadata để reload không phải làm lại.
- [ ] `ac-4` (pending): durationSeconds chốt khi xong bản nháp, tách thời gian chấm rubric; bài viết có đồng hồ hiển thị; thời gian đọc source read-once và xin quyền mic không bị tính.
- [ ] `ac-5` (pending): Có ErrorBoundary; UI nhất quán ngôn ngữ, không lộ enum pretest/training; input import có focus nhìn thấy; export revoke trễ; bài pronunciation không chiếm Nhiệm vụ hôm nay.
- [ ] `ac-6` (pending): axe chạy cho Today, Catalog, các phase của LessonFlow, Settings và Progress ở các trạng thái chính.

## Required checks

- [ ] `check-a11y-practice` (focused): Focus, lang, rubric, draft, đồng hồ trong practice — chưa chạy / not yet run
- [ ] `check-a11y-app` (focused): ErrorBoundary, nhãn UI và axe đa màn hình — chưa chạy / not yet run
- [ ] `check-suite` (full): Toàn bộ test của dự án (suite) — chưa chạy / not yet run

## Evidence

_None recorded yet._
