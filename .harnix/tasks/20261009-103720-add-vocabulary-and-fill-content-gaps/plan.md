# Kế hoạch: Từ vựng và ô trống ma trận

## Checklist theo slice

- [x] S1: test ma trận, từ vựng, review và đa dạng bài tập (đỏ) (ac-1 đến ac-4)
- [x] S2: từ vựng cho 12 mission gốc và thêm bài tập fill, ordering, sửa lỗi (ac-1, ac-4)
- [x] S3: năm mission mới lấp ô trống (ac-2, ac-3)
- [x] S4: section `vocabulary-review` cho mọi mission (ac-1)
- [x] S5: tài liệu, lint, build, toàn bộ suite

## S1

`tests/content/coverageMatrix.test.ts`: số mục từ vựng 8 đến 15 mỗi bài; `vocabulary-review` hợp lệ; ma trận capability × level × chế độ; tối thiểu sáu mission B1/B2 mỗi capability; tỷ lệ bài tập đa dạng; số bài sửa lỗi.

## S2 đến S4

Viết nội dung bằng script biên soạn trong scratchpad, ghi JSON vào `content/missions/`. Sau mỗi slice chạy `npx vitest run tests/content`.

## S5

Cập nhật số mission trong README, `docs/CONTENT.md`, `docs/ARCHITECTURE.md`; `npm run lint`; `npm run check:bundle`; `harnix workflow --run-checks --brief`.

## Mỗi check chứng minh điều gì

- `check-vocab-coverage`: ac-1 đến ac-4.
- `check-suite`: không hồi quy.

## Rollback

Các mission mới là file JSON thêm mới; từ vựng, review và bài tập thêm vào mission cũ là các phần tử JSON thêm vào, có thể xóa độc lập.
