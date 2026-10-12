# Kế hoạch: Nghe hội thoại và đọc dài

## Checklist theo slice

- [x] S1: test nội dung `listeningReading.test.ts`, test tiến độ domain và Progress (đỏ) (ac-1 đến ac-4)
- [x] S2: domain `listeningReading.ts` và khối Progress (ac-4)
- [x] S3: sáu bài nghe (ac-1, ac-3)
- [x] S4: sáu bài đọc dài (ac-2, ac-3)
- [x] S5: tài liệu, lint, build, toàn bộ suite

## S1

Test: bảng mười hai `lessonId` với section và định dạng; thời lượng, số giọng, tốc độ từ/phút, gist/detail/notes; số từ, định dạng, scan trỏ đúng part; khai báo synthetic; tính độc nhất tiêu đề và format; test domain `summarizeListeningReading`; test Progress hiển thị khối.

## S2

`src/domain/progress/listeningReading.ts` (đếm bài hoàn thành, câu đã trả lời) và `ProgressPage`.

## S3 và S4

JSON trong `content/missions/<capability>/`; mỗi bài có language-support, auto-check, written task bốn `practiceContexts`, rubric anchors, `reviewPolicy`.

## S5

Cập nhật số mission trong README, `docs/CONTENT.md`, `docs/ARCHITECTURE.md`; `npm run lint`; `npm run check:bundle`; `harnix workflow --run-checks --brief`.

## Mỗi check chứng minh điều gì

- `check-listening-reading-content`: ac-1, ac-2, ac-3.
- `check-progress-listening`: ac-4.
- `check-suite`: không hồi quy.

## Rollback

Nội dung mới là file JSON thêm mới; domain và UI nằm trong file riêng cùng một khối ở ProgressPage.
