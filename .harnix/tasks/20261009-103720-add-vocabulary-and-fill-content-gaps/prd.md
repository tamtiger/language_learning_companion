# PRD: Từ vựng chuyên ngành và lấp ô trống ma trận nội dung

## Vấn đề

- 12 mission gốc có `language-support` chỉ với cụm diễn đạt (`vocabulary: []`), nên không có từ vựng chuyên ngành riêng.
- Không mission nào có section `vocabulary-review` dù schema đã hỗ trợ từ task 9.
- Ma trận capability × level × chế độ còn ô trống: `technical-explanation` chỉ có A2 và B2 (không có B1, không có bài viết), `technology-learning` chỉ có bốn bài B1/B2.
- Auto-check của 12 mission gốc gần như toàn `choice` (0 đến 33% là fill, ordering).

## Mục tiêu

Mỗi capability đạt độ phủ B1 đến B2 (ít nhất sáu mission) với từ vựng chuyên ngành được ôn lại và bài tập đa dạng hơn.

## Không thuộc phạm vi

- Đổi schema (không thêm loại bài tập mới; "error-correction" là bài `fill` có câu hỏi bắt đầu bằng "Sửa lỗi:").
- Từ vựng cho bài pronunciation legacy.

## Mission mới (năm bài)

| Capability | `lessonId` | Level | Chế độ |
| --- | --- | --- | --- |
| technical-explanation | `explain-a-bug-to-a-colleague-b1` | B1 | nói |
| technical-explanation | `write-a-short-design-note-b1` | B1 | viết |
| technical-explanation | `write-an-architecture-decision-record-b2` | B2 | viết |
| technology-learning | `explain-what-you-learned-b1` | B1 | nói |
| technology-learning | `learn-from-error-messages-b1` | B1 | viết |

## Yêu cầu

| Mã | Yêu cầu |
| --- | --- |
| ac-1 | Mỗi mission có 8 đến 15 mục từ vựng (từ cộng collocation trong `language-support`) và một section `vocabulary-review` ôn các từ đó (đủ ba bài, có ghép từ-nghĩa và điền từ). |
| ac-2 | Lấp ô trống: workplace nói B1 và B2, technical-reading B2, technical-explanation B1 và có bài viết, interview B1, technology-learning B1 (thêm hai bài). |
| ac-3 | Mỗi capability có ít nhất sáu mission B1 hoặc B2 và có cả B1 lẫn B2. |
| ac-4 | Mỗi mission có ít nhất 30% bài auto-check không phải `choice` (fill, ordering, ghép, sửa lỗi) và có ít nhất sáu bài sửa lỗi trong toàn kho. |

## Quyết định thiết kế

- Từ vựng mới cho 12 mission gốc viết tay (năm từ mỗi bài, mỗi từ hai collocation = 15 mục) theo đúng tình huống của bài.
- `vocabulary-review` sinh bằng script một lần từ chính `vocabulary` của bài (ghép từ-nghĩa và điền vào câu ví dụ), rồi kiểm bằng test; test cũng bảo đảm mọi `wordRefs` có trong bài.
- Test ma trận `tests/content/coverageMatrix.test.ts` suy ra mọi số liệu từ catalog, không viết cứng danh sách bài cũ.
- README nêu số mission và phạm vi level đúng với catalog; nếu nội dung lùi thì README phải thu hẹp lời hứa.
- Rủi ro: chưa có người bản ngữ rà soát; các câu điền từ sinh từ ví dụ có thể bỏ trống một dạng biến cách (ví dụ sends).
