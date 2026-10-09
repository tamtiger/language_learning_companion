# Quy tắc release và changelog

Tài liệu này là nguồn của quy tắc phát hành. `scripts/check-changelog-rule.mjs` (chạy bằng
`npm run check:changelog`) kiểm tra từng câu bắt buộc bên dưới còn xuất hiện, đồng bộ version và
heading CHANGELOG. `scripts/check-release.mjs` (`npm run check:release`) đọc version từ
`package.json` và xác nhận lock cùng heading CHANGELOG khớp version đó.

## Khi nào phát hành

1. Sau mỗi lần implement có thay đổi production (mã, nội dung học, cấu hình build hoặc hành vi
   người dùng thấy được), thêm một mục vào CHANGELOG và tăng version.
2. Entry mới nằm ở đầu lịch sử changelog, ngay dưới mục `[Unreleased]` nếu có. Nội dung chưa
   phát hành ghi ở `[Unreleased]`; khi phát hành, đổi thành heading `## [X.Y.Z] - YYYY-MM-DD`.

## Chọn version

3. `MAJOR` khi phá vỡ hợp đồng đã công bố (định dạng backup, schema nội dung không tương thích).
4. `MINOR` khi thêm khả năng hoặc nội dung mới tương thích ngược.
5. `PATCH` khi sửa lỗi hoặc cải thiện không đổi hợp đồng.
6. Cập nhật `package.json` và `package-lock.json` cùng một version (dùng `npm version` để hai file
   luôn đồng bộ), rồi chạy `npm run check:release`.

## Khi nào không phát hành

7. Task chỉ đổi `docs-only` hoặc `prompt-only` thì không phải thay đổi production.
8. Không tăng version và không thêm release cho các task đó; chỉ ghi vào `[Unreleased]` nếu thay
   đổi đáng nhắc.
9. Một task trộn (vừa tài liệu vừa production) được coi là production và phát hành như bình thường.

## Epic nhiều task

10. Task ở giữa epic không tự phát hành. Task cuối của epic viết một entry gom toàn bộ thay đổi
    và tăng version một lần.

## Giữ lịch sử

11. CHANGELOG là lịch sử: không sửa, xóa, gộp, đổi tên hoặc sắp xếp lại bất kỳ mục cũ nào, kể cả
    khi một số liệu trong mục đó đã lỗi thời. Sai sót được sửa bằng mục mới.

## Cổng hoàn thành

12. Trước khi đóng task có phát hành, `npm run check:changelog` và `npm run check:release` phải
    pass; đây là một phần của completion gate cùng lint, build và toàn bộ test.
