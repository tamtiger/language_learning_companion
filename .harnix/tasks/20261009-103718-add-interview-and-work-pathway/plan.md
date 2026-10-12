# Kế hoạch: Lộ trình phỏng vấn và làm việc

## Checklist theo slice

- [x] S1: test `interviewPathway.test.ts` (đỏ), bảng mission và kiểm tính độc nhất (ac-1, ac-2, ac-3)
- [x] S2: sáu mission phỏng vấn (ac-1, ac-3)
- [x] S3: năm mission làm việc (ac-2, ac-3)
- [x] S4: tài liệu (số mission), lint, build, toàn bộ suite (ac-1 đến ac-3)

## S1

Test trước: bảng `lessonId`, capability, level, chế độ; mission behavioral có `storyBank`; tiêu đề, `performanceTask.scenario` và `workflowTags` đầu tiên không trùng; baseline artifact không trùng nội dung với mission khác. Ban đầu đỏ vì chưa có file.

## S2 và S3

Mỗi mission là JSON trong `content/missions/<capability>/`. Đủ section source, language-support, auto-check, performanceTask với bốn `practiceContexts`, rubric có anchors, `reviewPolicy`. Mission nói có `learningLoop` v1 đầy đủ. Chạy `npx vitest run tests/content` sau mỗi nhóm.

## S4

Cập nhật số mission trong `README.md`, `docs/CONTENT.md`, `docs/ARCHITECTURE.md` (check:docs), rồi `npm run lint`, `npm run check:bundle`, `harnix workflow --run-checks --brief`.

## Mỗi check chứng minh điều gì

- `check-interview-content`: ac-1, ac-2, ac-3.
- `check-suite`: không hồi quy.

## Rollback

Các mission là file JSON thêm mới; xóa chúng đưa catalog về trạng thái cũ.
