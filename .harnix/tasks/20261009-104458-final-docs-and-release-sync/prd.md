# PRD: Đồng bộ tài liệu cuối epic và đóng release

## Vấn đề

Sau mười lăm task, tài liệu trong `docs/` và README còn nêu hành vi cũ (mười hai mission, phiên 15 đến 20 phút, thiếu phiên học, lộ trình A2, nghe và đọc dài, từ vựng), CHANGELOG chưa có mục cho epic và version vẫn là 1.1.5. Chưa có quyết định ghi lại về việc giữ `.harnix/tasks`.

## Mục tiêu

Tài liệu khớp kết quả cuối của epic; một bản phát hành minor 1.2.0 đúng quy tắc `docs/RELEASE.md`; quyết định về lịch sử Harnix được ghi lại.

## Không thuộc phạm vi

- Đổi hành vi ứng dụng hay nội dung bài học.
- Di chuyển hay xóa research lịch sử.

## Yêu cầu

| Mã | Yêu cầu |
| --- | --- |
| ac-1 | README, PRODUCT, START_HERE, ADDING_LESSONS, CONTENT, ARCHITECTURE mô tả đúng: bốn mươi sáu mission, lộ trình A2, nghe và đọc dài, từ vựng và ôn từ, phiên học và checkpoint, luyện lại, lịch ôn theo ngày, offline, khóa lưu v6, cấu trúc practice. |
| ac-2 | CHANGELOG có mục `[1.2.0] - 2026-10-12` gộp toàn epic; `package.json` và `package-lock.json` đồng bộ 1.2.0; `check-release` và `check-changelog` pass. |
| ac-3 | `docs/CONVENTIONS.md` ghi quyết định giữ nguyên `.harnix/tasks`; test bảo vệ quyết định; `check-curriculum-research` vẫn pass. |

## Quyết định

- Phát hành MINOR (1.2.0): thêm khả năng và nội dung tương thích ngược; khóa lưu mới có đường chuyển từ khóa cũ không mất dữ liệu và `contractRevision` giữ nguyên.
- Giữ `.harnix/tasks` (khoảng 10 MB): validator research đọc đường dẫn cố định.
