# Cải thiện trợ năng, đồng hồ và bảo toàn tiến độ khi học

- **ID:** 20261009-103714-improve-accessibility-and-learning-ux
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 14:46:47 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 6/6 met or waived |
| Required checks | 100% | 3/3 passed |
| Residual risks | 5 | r-aria-disabled-tests: low, r-lang-heuristic: low, r-input-progress-rollback: low, r-no-real-screen-reader: low, r-confirm-native: low |

## Goal

Người dùng bàn phím và trình đọc màn hình hoàn thành được vòng học; không mất bản nháp; thời gian được tính công bằng.

## Non-goals

- Không chia mission thành phiên (task riêng ở đợt mở rộng)
- Không đổi nội dung bài học

## Relevant paths

- `docs/ARCHITECTURE.md`
- `index.html`
- `src/app`
- `src/domain/progress`
- `src/features/lesson`
- `src/features/practice`
- `src/features/settings`
- `src/features/today`
- `src/infrastructure/storage`
- `src/shared`
- `tests`

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): Focus không mất sau nút ghi âm, perception và reading ladder; kết quả có live region; không disable nút đang focus.
- [x] `ac-2` (met): Nội dung tiếng Anh có lang="en"; heading hoặc mô tả phase nêu baseline/retry/transfer; rubric là nhóm có tên tiêu chí; nút disabled nêu lý do.
- [x] `ac-3` (met): Cảnh báo khi rời trang lúc có bản nháp hoặc đang ghi âm (beforeunload và điều hướng nội bộ); tiến độ reading ladder và perception được lưu metadata để reload không phải làm lại.
- [x] `ac-4` (met): durationSeconds chốt khi xong bản nháp, tách thời gian chấm rubric; bài viết có đồng hồ hiển thị; thời gian đọc source read-once và xin quyền mic không bị tính.
- [x] `ac-5` (met): Có ErrorBoundary; UI nhất quán ngôn ngữ, không lộ enum pretest/training; input import có focus nhìn thấy; export revoke trễ; bài pronunciation không chiếm Nhiệm vụ hôm nay.
- [x] `ac-6` (met): axe chạy cho Today, Catalog, các phase của LessonFlow, Settings và Progress ở các trạng thái chính.

## Required checks

- [x] `check-a11y-practice` (focused): A11y practice: focus, ngữ nghĩa, rời trang, lưu input, thời gian — pass (2026-10-09 14:45:36 +07:00)
- [x] `check-a11y-app` (focused): A11y app: ErrorBoundary, enum, Settings, Today, ma trận axe — pass (2026-10-09 14:45:51 +07:00)
- [x] `check-suite` (full): Toàn bộ test của dự án (suite) — pass (2026-10-09 14:46:38 +07:00)

## Decisions

- **d-aria-disabled** — Nút bị chặn dùng aria-disabled + mô tả lý do (GuardedButton) thay vì disabled; lựa chọn đã trả lời dùng aria-disabled.
  - _Why:_ disabled làm mất focus và không nêu lý do cho trình đọc màn hình.
- **d-native-confirm** — Rời trang dùng beforeunload và window.confirm gốc cho điều hướng nội bộ.
  - _Why:_ Dialog gốc có sẵn hỗ trợ bàn phím và trình đọc màn hình, dễ test; dialog tùy biến để task UX sau.
- **d-input-progress-additive** — Lưu inputProgress (metadata perception, shadowing, ladder) là trường tùy chọn của LessonProgress, storageVersion giữ 5, xóa khi hoàn tất input hoặc luyện lại.
  - _Why:_ Không cần migration; không lưu bản nháp/transcript/audio nên giữ chính sách privacy.
- **d-freeze-draft** — Thêm nút Chốt bản nháp ở retry/transfer/review để dừng đồng hồ trước khi chấm rubric; durationSeconds lấy lúc chốt.
  - _Why:_ Rubric nằm cùng màn hình nên thời gian chấm đang bị tính vào duration.

## Residual risks

- **r-aria-disabled-tests** (low) — Đổi disabled sang aria-disabled làm vỡ test cũ kiểm .disabled; cập nhật sang kiểm hành vi.
- **r-lang-heuristic** (low) — languageOf dựa vào ký tự có dấu; câu tiếng Anh chứa tên riêng Việt có thể bị gắn vi.
- **r-input-progress-rollback** (low) — Hoàn tác code khi người dùng có inputProgress dở làm schema cũ từ chối dữ liệu; chấp nhận vì app chưa phát hành.
- **r-no-real-screen-reader** (low) — Chưa kiểm tay bằng trình đọc màn hình và bàn phím thật; axe, test focus và aria dựa trên jsdom, và tương phản màu không đo được trong jsdom (chỉ có bảng màu).
- **r-confirm-native** (low) — Điều hướng nội bộ dùng window.confirm gốc, khác phong cách giao diện; có thể thay bằng dialog tùy biến sau.

## Evidence

- `check-a11y-practice` — pass (2026-10-09 14:45:36 +07:00): npx vitest run tests/features/practice tests/features/lesson tests/shared tests/infrastructure tests/domain — exit 0 _(2 earlier reruns not shown; see task.json for full history)_
- `check-a11y-app` — pass (2026-10-09 14:45:51 +07:00): npx vitest run tests/app tests/features/settings tests/features/today tests/features/progress tests/features/catalog — exit 0 _(2 earlier reruns not shown; see task.json for full history)_
- `check-suite` — pass (2026-10-09 14:46:38 +07:00): npm test — exit 0 _(1 earlier rerun not shown; see task.json for full history)_
