# Kế hoạch: Đồng bộ tài liệu và release

## Checklist theo slice

- [x] S1: rà soát và cập nhật README, PRODUCT, START_HERE, ADDING_LESSONS, CONTENT, ARCHITECTURE (ac-1)
- [x] S2: mục CHANGELOG 1.2.0 và `npm version` 1.2.0 (ac-2)
- [x] S3: ghi quyết định về `.harnix/tasks` và test bảo vệ (ac-3)
- [x] S4: lint, build, `check:docs`, `check:release`, toàn bộ suite

## Mỗi check chứng minh điều gì

- `check-final-docs`: ac-1 (bố cục tài liệu, số mission khớp nội dung).
- `check-final-release`: ac-2.
- `check-harnix-history`: ac-3.
- `check-suite`: không hồi quy.

## Rollback

Chỉ đổi tài liệu, CHANGELOG và version; khôi phục từ git.
