# PRD: Lộ trình phỏng vấn và làm việc ở công ty nước ngoài

## Vấn đề

Hai capability `international-interview` và `workplace-communication` chỉ có hai mission mỗi bên (B1/B2, A2 vừa thêm). Người học chưa luyện được phần lớn tình huống thật: giới thiệu bản thân, kể câu chuyện hành vi từ kho câu chuyện của mình, trình bày thiết kế hệ thống, vừa code vừa nói, hỏi lại người phỏng vấn, đàm phán offer; nhận và góp feedback, performance review, 1:1, viết code review comment, trò chuyện xã giao.

## Mục tiêu

Phủ mục tiêu 5: người học luyện được phỏng vấn bằng câu chuyện của chính mình và các tình huống làm việc ở công ty nước ngoài, mỗi mission qua mọi cổng chất lượng hiện có.

## Không thuộc phạm vi

- Chấm nói tự động bằng AI; bài nghe hội thoại và đọc dài (task 12); từ vựng chuyên ngành mở rộng (task 13); chia phiên (task 14).
- Giao diện mới: story bank và vòng học nói dùng bộ renderer hiện có.

## Mười một mission

| Capability | `lessonId` | Level | Chế độ |
| --- | --- | --- | --- |
| international-interview | `interview-tell-me-about-yourself-b1` | B1 | nói |
| international-interview | `interview-behavioral-story-bank-b2` | B2 | nói (storyBank) |
| international-interview | `interview-system-design-walkthrough-b2` | B2 | nói |
| international-interview | `interview-coding-think-aloud-b2` | B2 | nói |
| international-interview | `interview-ask-the-interviewer-b1` | B1 | nói |
| international-interview | `interview-negotiate-offer-b2` | B2 | nói |
| workplace-communication | `workplace-give-and-receive-feedback-b1` | B1 | nói |
| workplace-communication | `workplace-performance-review-b2` | B2 | nói |
| workplace-communication | `workplace-one-on-one-b1` | B1 | nói |
| workplace-communication | `workplace-code-review-comment-b1` | B1 | viết |
| workplace-communication | `workplace-small-talk-b1` | B1 | nói |

## Yêu cầu

| Mã | Yêu cầu |
| --- | --- |
| ac-1 | Sáu mission phỏng vấn như bảng, đúng capability, level và chế độ; mission behavioral khai báo `storyBank`. |
| ac-2 | Năm mission làm việc như bảng, đúng capability, level và chế độ. |
| ac-3 | Mọi mission mới qua schema và mọi cổng chất lượng; tiêu đề, kịch bản, `workflowTags` và nguồn baseline không trùng với mission khác. |

## Quyết định thiết kế

- Nguồn là synthetic có khai báo "Synthetic training artifact — non-production." như các mission hiện có.
- Tạo test `tests/content/interviewPathway.test.ts` khai báo bảng trên, kiểm sự tồn tại, chế độ, `storyBank`, độ phủ rubric và tính độc nhất kịch bản.
- Rủi ro: chưa có người bản ngữ rà soát; kho đáp án-dài-nhất toàn kho phải giữ ≤ 45%.
