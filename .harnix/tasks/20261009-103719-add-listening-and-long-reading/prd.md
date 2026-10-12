# PRD: Luyện nghe hội thoại và đọc tài liệu dài

## Vấn đề

Schema đã có section `listening-source` và `long-reading` (task 9) cùng renderer tối thiểu, nhưng catalog chưa có bài nào dùng chúng. Người học chưa luyện nghe nhiều giọng trong họp thật và chưa đọc tài liệu dài (RFC, API reference, changelog, log, issue, tutorial). Progress cũng không cho thấy tiến độ nghe và đọc dài.

## Mục tiêu

Mục tiêu 2, 3 và 6: có bài nghe hội thoại nhiều giọng và bài đọc tài liệu đủ dài, kèm tiến độ hiển thị trong Progress.

## Không thuộc phạm vi

- Ghi âm hay thu thập giọng người thật; giọng đọc vẫn là TTS của máy.
- Chép nguyên văn nguồn không có giấy phép.
- Thay đổi schema hay renderer của hai section (đã có từ task 9).

## Mười hai bài

Nghe (viết biên bản sau khi nghe, written task): `listen-standup-blockers-b1`, `listen-sprint-planning-estimates-b1`, `listen-retro-what-went-wrong-b2`, `listen-incident-call-b2`, `listen-design-review-feedback-b2`, `listen-tech-talk-summary-b2`.
Đọc dài (written task): `read-rfc-requirement-words-b2`, `read-api-reference-pagination-b2`, `read-changelog-breaking-change-b1`, `read-stack-trace-timeout-b2`, `read-github-issue-thread-b1`, `read-tutorial-setup-ci-b1`.

## Yêu cầu

| Mã | Yêu cầu |
| --- | --- |
| ac-1 | Sáu bài nghe: mỗi bài một `listening-source` 60 đến 180 giây, ít nhất ba giọng khác locale, transcript phù hợp thời lượng (110 đến 180 từ/phút), có gist, detail và `listeningNotes`. |
| ac-2 | Sáu bài đọc dài: mỗi bài một `long-reading` từ 400 đến 1500 từ, đúng định dạng yêu cầu (rfc, api-reference, changelog, log, issue, tutorial), có skim và scan, mỗi scan trỏ tới một phần có thật; kịch bản không trùng nhau. |
| ac-3 | Mọi nguồn khai báo là tài liệu tổng hợp do dự án viết ("Synthetic training artifact — non-production.") nên không chép nguồn có bản quyền; test kiểm khai báo này. |
| ac-4 | Progress hiển thị số bài nghe và bài đọc dài đã hoàn thành cùng số câu hỏi đã trả lời. |

## Quyết định thiết kế

- **Nguồn là synthetic có khai báo**, không có `sourceRegistry`: tôi không truy cập được tài liệu ngoài để xác minh vị trí trích và giấy phép nên không khai báo provenance mà tôi không kiểm chứng. Nguồn do dự án tự viết theo cấu trúc phổ biến của từng định dạng; tiêu đề section nghe có chữ "synthetic training dialogue", phần đầu của bài đọc mở bằng khai báo.
- Task viết đầu ra sau khi nghe hoặc đọc (biên bản, tóm tắt): tránh thêm vòng học nói cho 12 bài.
- `src/domain/progress/listeningReading.ts`: tính tiến độ từ catalog và `lessonProgress`; `ProgressPage` hiển thị khối "Nghe và đọc dài".
- Rủi ro: chưa có người bản ngữ rà soát; giọng TTS phụ thuộc máy; transcript dài nên không kiểm duyệt từng câu về độ tự nhiên.
