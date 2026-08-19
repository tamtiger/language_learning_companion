# PRD — Xóa file dư thừa và lập changelog

## Outcome

Repository chỉ còn source of truth, runtime, content executable, test có giá trị và workflow history; người bảo trì không còn nhầm Markdown lịch sử hoặc compatibility facade chết là API hiện hành. `CHANGELOG.md` ghi lại chính xác capability-first refactor đã giao.

## Phạm vi

- Xóa `docs/`, `lessons/`, `modules/` vì chính các README trong đó xác nhận không executable và không phải source of truth.
- Giữ nguyên `content/modules/**/*.json`, bao gồm sáu v1, Daily Standup v2 và năm mission v3.
- Xóa asset scaffold/public sprite không được reference.
- Xóa facade/adapter không importer và duplicate tests chỉ kiểm tra wrapper; giữ canonical schema/normalization/catalog tests.
- Tách phần media-recorder tests còn giá trị khỏi file test gắn với performance helper cũ.
- Tạo `CHANGELOG.md` với mục Unreleased, Added, Changed, Removed, Security, Verification.

## Acceptance criteria

### AC `AC-1`

Chỉ file được chứng minh không còn consumer mới bị xóa; executable content, owner docs, Harnix history và compatibility v1/v2 được bảo toàn.

### AC `AC-2`

Markdown legacy, asset scaffold và dead facade/adapter được loại bỏ; media recorder tests còn giá trị được giữ và không còn stale reference.

### AC `AC-3`

`CHANGELOG.md` mô tả chính xác capability-first refactor, compatibility/privacy, verification và cleanup hiện tại.

### AC `AC-4`

Reference audit, full tests, lint và production build đều PASS trên snapshot cuối.

## Preservation và rollback

Không xóa owner docs, prompt owner, Harnix history, package/build config, executable content, runtime media recorder hoặc storage/learning tests. Không thay đổi behavior/schema/storage. Mọi deletion hiển thị trong Git diff và có thể khôi phục từ repository history trước commit; task không commit hoặc push.