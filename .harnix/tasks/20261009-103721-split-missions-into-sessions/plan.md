# Kế hoạch: Chia mission thành phiên

## Checklist theo slice

- [x] S1: test domain `sessions.ts` và test `durationMinutes` khớp ước lượng (đỏ) (ac-1, ac-3)
- [x] S2: domain `src/domain/learning/sessions.ts` và cập nhật `durationMinutes` của mọi mission (ac-1, ac-3)
- [x] S3: Today hiển thị phiên hiện tại và thời lượng; test Today (ac-3)
- [x] S4: input từng section, hợp đồng đầu ra thu gọn; test CapabilityTask (ac-2)
- [x] S5: tài liệu, lint, build, toàn bộ suite

## Mỗi check chứng minh điều gì

- `check-sessions`: ac-1, ac-2, ac-3 (domain, Today, practice).
- `check-suite`: không hồi quy.

## Rollback

Domain mới nằm trong một file; UI đổi ở TodayPage và CapabilityTask; `durationMinutes` là metadata có thể khôi phục từ git.
