# PRD — Refactor cấu trúc curriculum theo capability

## Outcome

Tách rõ hai loại nội dung authoring: 12 mission v3 theo capability tại `content/missions` và 6 bài phát âm v1 dạng tài liệu tham chiếu tại `content/reference/pronunciation`, trong khi catalog, runtime và corpus học tập vẫn giữ nguyên.

## Phạm vi

- Chuyển 18 JSON bằng rename thuần túy, đặt tên file theo `lessonId`.
- Bổ sung regression test khóa taxonomy đường dẫn.
- Giữ validator research lịch sử hoạt động bằng projection task-specific an toàn.
- Cập nhật owner docs và patch release `1.1.4`.
- Xác minh focused/full tests, lint, build, research archive và tính bất biến lịch sử.

## Ngoài phạm vi

- Không sửa lesson payload, schema, lessonId, capability, mode hoặc UI behavior.
- Không mở rộng curriculum hay thêm chức năng pronunciation assessment.
- Không sửa artifact Harnix đã hoàn tất.
- Không thêm dependency, network hoặc persistence.
- Không commit, push, publish hoặc tạo pull request.

## Quyết định contract

- Layout authoring là `content/missions/<primary-capability>/<lesson-id>.json` cho v3 và `content/reference/pronunciation/<lesson-id>.json` cho v1.
- `capabilities[0]` quyết định thư mục mission; riêng `daily-standup-b1` thuộc `international-meetings`.
- Semantics runtime tiếp tục đến từ field/schema trong JSON; thư mục chỉ tổ chức authoring.
- Catalog tiếp tục glob `content/**/*.json`; không thêm dependency vào tên thư mục.
- Compatibility research chỉ áp dụng cho exact task `20260827-224143-complete-realistic-curriculum`, bằng map tĩnh 18 `lessonId → historical path`. Task khác dùng live path.
- Validator giữ live `filePath` để đọc nội dung, dùng `locationPath` riêng cho logical research locations; mapping thiếu/trùng phải fail.
- Version mục tiêu là patch `1.1.4` vì thay đổi cấu trúc source production không đổi public behavior.

### AC `AC-1`

Mười hai mission v3 nằm tại `content/missions/<primary-capability>/<lesson-id>.json`, sáu pronunciation v1 nằm tại `content/reference/pronunciation/<lesson-id>.json`, không còn `content/modules` và cả 18 file là rename 100% không đổi payload.

### AC `AC-2`

Catalog và runtime vẫn nạp đúng 18 lesson gồm 12 v3, 6 v1, 6 spoken, 6 written và 6 quiz; toàn bộ lessonId, capability và completion behavior được giữ nguyên.

### AC `AC-3`

Validator research chi tiết vẫn xác minh task lịch sử trên corpus đã chuyển đường dẫn bằng projection giới hạn theo task ID và lessonId, vẫn kiểm digest/JSON pointer, đồng thời mọi artifact lịch sử giữ nguyên byte.

### AC `AC-4`

`CONTENT.md`, `ARCHITECTURE.md` và `README.md` mô tả taxonomy authoring mới; patch version `1.1.4` được đồng bộ trong package manifests, `CHANGELOG.md` và release validator.

### AC `AC-5`

Focused/full tests, validator unit/integration, lint, build, release và preservation checks đều pass; không có thay đổi ngoài phạm vi.

## Rủi ro và rollback

- Sai mapping capability có thể làm taxonomy lệch: regression test tính expected path từ `capabilities[0]`.
- Alias research quá rộng có thể che drift: projection khóa exact task ID, map tĩnh và fail với mapping thiếu/trùng.
- Rename có thể vô tình đổi payload: Git rename detection 100% và corpus tests là gate bắt buộc.
- Rollback theo slice: revert test, validator compatibility, docs/version và 18 rename độc lập; lịch sử Harnix không bị đụng tới.