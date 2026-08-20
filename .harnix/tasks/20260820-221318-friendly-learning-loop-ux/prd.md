# PRD — Làm rõ Sentence Chunks và Luyện phát âm

### AC `AC-1`
Catalog cho biết đúng lesson có Sentence chunks và Luyện phát âm bằng ngôn ngữ hướng người học, không dùng P0 pilot làm tín hiệu chính và không gắn nhãn sai lesson không có learning loop.

### AC `AC-2`
Input learning loop luôn hiển thị stepper semantic gồm Nghe nhận diện, Luyện phát âm, Sentence chunks và Lượt nói chính; current/completed/skipped pronunciation được thể hiện minh bạch.

### AC `AC-3`
Guided Shadowing hiển thị chunk hiện tại/tổng chunk, bước hiện tại và có điều hướng quay lại/tiếp tục accessible mà không đổi process evidence.

### AC `AC-4`
UI dùng được bằng keyboard/screen reader, không overflow hoặc chồng lấn ở desktop/mobile, giữ diagnostic-only pronunciation và không ảnh hưởng lesson không có learning loop.

### AC `AC-5`
Focused tests, full tests, lint, build và browser QA desktop/mobile pass trên trạng thái nguồn cuối cùng.

## Compatibility và non-goals
Không đổi content schema, progress storage, sequencing sư phạm, audio backend hoặc tạo khóa IPA độc lập. Giữ nguyên các thay đổi content chưa commit từ task trước.