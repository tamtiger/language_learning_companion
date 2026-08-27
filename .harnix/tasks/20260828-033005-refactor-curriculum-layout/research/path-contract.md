# Research — Contract đường dẫn curriculum

## Known facts

- Runtime catalog và content tests glob đệ quy `content/**/*.json`; không có dependency live vào tên `modules`.
- Corpus hiện có 18 lesson: 12 v3 và 6 v1.
- V3 tự khai báo capability; `daily-standup-b1` có primary capability `international-meetings`.
- Validator research hiện nhúng relative file path vào location, nên rename thuần túy làm đổi 2.903 item locations cùng required/model/objective trace dù item ID và content digest giữ nguyên.
- Task research đã hoàn tất là artifact lịch sử bất biến.

## Options

### 1. Rewrite research/task lịch sử

Bị loại vì làm sai provenance của evidence đã hoàn tất và vi phạm nguyên tắc bảo toàn Harnix history.

### 2. Bỏ hoặc nới lỏng kiểm tra location

Bị loại vì làm yếu validator và có thể che JSON pointer/path drift thật.

### 3. Projection logical location task-specific

Được chọn. Validator đọc nội dung từ live `filePath`, nhưng với đúng task lịch sử sẽ project `locationPath` theo map tĩnh `lessonId → historical path`. Unknown task dùng live path.

## Invariants

- Projection chỉ kích hoạt với exact task ID `20260827-224143-complete-realistic-curriculum`.
- Có đúng một mapping cho mỗi lesson trong corpus và đủ 18 lesson.
- Historical path là POSIX repository-relative an toàn: bắt đầu bằng `content/`, kết thúc `.json`, không absolute, backslash hoặc `..`.
- `lessonId` và historical path đều unique.
- Thiếu/thừa/trùng mapping phải fail rõ ràng.
- Alias không được suy từ research record đang được xác minh.
- JSON pointer, item ID và digest vẫn được tính từ live content.
- Không sửa bất kỳ file nào trong completed task.

## Kết luận

Không cần external research. Repository evidence quyết định được taxonomy và compatibility contract. Projection task-specific là thay đổi nhỏ nhất giữ cả historical provenance lẫn độ nghiêm của validator.