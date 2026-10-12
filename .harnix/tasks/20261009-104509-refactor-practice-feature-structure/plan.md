# Kế hoạch: Refactor practice

## Checklist theo slice

- [x] S1: test cấu trúc, test đổi tên/khóa lưu/revision và test nit (đỏ) (ac-1 đến ac-3)
- [x] S2: đổi tên `targetSeconds` thành `minSeconds` và khóa lưu có di chuyển (ac-2)
- [x] S3: nit: lớp CSS, landmark, tiêu đề tab, tsconfig (ac-3)
- [x] S4: di chuyển file vào thư mục theo vai trò, cập nhật import (ac-1)
- [x] S5: tách `CapabilityTask` thành các file dưới 300 dòng (ac-1)
- [x] S6: tài liệu, lint, build, toàn bộ suite

## Mỗi check chứng minh điều gì

- `check-practice-structure`: ac-1 (cấu trúc) và ac-3 (nit về giao diện).
- `check-rename-migration`: ac-2 (schema, nội dung, di chuyển khóa lưu, revision).
- `check-suite`: không hồi quy.

## Rollback

Mỗi slice là một nhóm thay đổi độc lập trong git; khóa lưu cũ chỉ bị xóa sau khi khóa mới ghi được nên không mất dữ liệu.
