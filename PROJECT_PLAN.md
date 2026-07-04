# LANGUAGE LEARNING COMPANION

> **Project Plan v5.0**

Một ứng dụng đồng hành giúp học ngoại ngữ theo curriculum cá nhân, tập trung vào **học đúng lộ trình, ôn tập đúng thời điểm và duy trì việc học lâu dài**.

---

# 1. Vision

Language Learning Companion không cố gắng trở thành:

- Duolingo
- Anki
- Memrise
- ChatGPT

Ứng dụng chỉ có một mục tiêu:

> **Giúp người học hoàn thành curriculum ngoại ngữ của mình nhanh hơn, nhớ lâu hơn và duy trì việc học mỗi ngày.**

Mỗi khi mở ứng dụng, người học chỉ cần trả lời ba câu hỏi:

- Hôm nay học gì?
- Hôm nay cần ôn gì?
- Mình đang tiến bộ đến đâu?

---

# 2. Product Goals

Ứng dụng giúp người học:

- Hoàn thành toàn bộ curriculum.
- Học đúng thứ cần học.
- Ôn đúng thứ cần ôn.
- Ghi nhớ từ vựng lâu dài.
- Theo dõi tiến độ học tập.
- Duy trì thói quen học hằng ngày.
- Không mất thời gian quyết định hôm nay nên học gì.

---

# 3. Design Principles

## Curriculum First

Curriculum là trung tâm của toàn bộ ứng dụng.

```
Roadmap

↓

Module

↓

Lesson

↓

Vocabulary

↓

Review

↓

Assessment

↓

Progress
```

---

## Review First

Ứng dụng không xem Flashcard là trung tâm.

Flashcard chỉ là một hình thức luyện tập.

Đơn vị học chính là **Review Session**.

Một Review Session có thể bao gồm:

- Flashcard
- Multiple Choice
- Matching
- Fill Blank

Review Engine sẽ quyết định:

- Hôm nay cần ôn từ nào.
- Bao nhiêu từ nên ôn.
- Dạng bài luyện phù hợp.

Người học chỉ cần bắt đầu Review Session.

---

## Vocabulary First

Vocabulary là dữ liệu quan trọng nhất.

Một từ chỉ tồn tại một lần trong curriculum.

Vocabulary được sử dụng để tạo:

- Review Session
- Flashcard
- Vocabulary Quiz
- Search

---

## Offline First

Curriculum hoạt động hoàn toàn offline.

Internet chỉ dùng khi mở các tài nguyên bên ngoài.

---

## Keep It Simple

Mọi tính năng mới đều phải giúp người học:

- học nhanh hơn
- nhớ lâu hơn
- duy trì việc học

Nếu không đáp ứng ít nhất một trong ba mục tiêu trên thì sẽ không được phát triển.

---

# 4. Target Users

Ứng dụng dành cho người học ngoại ngữ theo curriculum.

Ví dụ:

- English
- Japanese
- Korean
- Chinese

Không thiết kế cho các lĩnh vực khác.

---

# 5. Learning Flow

Một ngày học tiêu chuẩn.

```
Today

↓

Continue Lesson

↓

Learning Journal

↓

Review Session

↓

Lesson Quiz

↓

Done
```

Thời lượng mục tiêu:

**20–30 phút**

---

# 6. Core Features

## Today

Trang đầu tiên của ứng dụng.

Ví dụ:

```
🔥 18 Day Streak

Today's Lesson

Module 01

Lesson 05

Today's Review

24 words

Review Backlog

128 words

Today's Target

30 words

Lesson Quiz

1

Estimated

25 min

Continue Learning
```

Người học chỉ cần bấm:

**Continue Learning**

Nếu không có bài học mới:

```
Today's Review

30 words

Lesson Quiz

0

Continue Review
```

Dashboard luôn ưu tiên:

1. Lesson chưa học
2. Review cần thực hiện
3. Lesson Quiz chưa hoàn thành

---

## Learning Roadmap

Hiển thị toàn bộ curriculum.

```
Phase

↓

Module

↓

Lesson
```

Ví dụ:

```
✓ Lesson 01

✓ Lesson 02

▶ Lesson 03

□ Lesson 04

□ Lesson 05
```

Hiển thị tiến độ theo:

- Curriculum
- Phase
- Module

---

## Lesson Reader

Lesson chỉ chứa nội dung học.

Không chứa:

- Progress
- Flashcard
- Review
- Vocabulary

Lesson gồm:

- Markdown
- Estimated Time
- Previous Lesson
- Next Lesson
- External Resources

Sau khi hoàn thành:

```
Lesson

↓

Learning Journal

↓

Review Session

↓

Lesson Quiz
```

---

## Vocabulary Bank

Kho từ vựng của toàn bộ curriculum.

Thông tin mỗi từ:

- Word
- IPA
- Meaning
- Example
- Part of Speech
- Tags
- Introduced In
- Referenced By

Ví dụ:

```
developer

IPA

Meaning

Example

Introduced In

Lesson 03

Referenced By

Lesson 08

Lesson 15
```

---

## Review Session

Review Session là trung tâm của việc ôn tập.

Review Engine sẽ tạo Review Session tự động.

Một Session có thể gồm:

```
Flashcard

↓

Multiple Choice

↓

Matching

↓

Fill Blank
```

Review Session luôn có giới hạn số lượng từ.

Ví dụ:

- 20 từ
- 30 từ
- 40 từ

Nếu còn nhiều từ cần ôn, Review Engine sẽ chia thành nhiều Session nhỏ để tránh quá tải.

---

## Lesson Quiz

Khác với Review Session.

Review Session kiểm tra khả năng ghi nhớ từ vựng.

Lesson Quiz kiểm tra mức độ hiểu bài.

Lesson Quiz được viết thủ công.

Có thể gồm:

- Pronunciation
- Grammar
- Reading
- Listening
- Speaking
- Lesson Concepts

---

## Learning Journal

Sau mỗi Lesson.

Người học ghi lại:

- Hôm nay học được gì?
- Điều gì còn khó?
- Ngày mai cần luyện gì?

Learning Journal chỉ đóng vai trò nhật ký học tập.

Phiên bản MVP không tự động phân tích nội dung Journal.

---

## Improvement Log

Danh sách những kỹ năng người học muốn cải thiện.

Ví dụ:

- TH Sound
- Ending Sounds
- Word Stress
- Listening
- Grammar

Người học chủ động:

- Thêm mới
- Cập nhật
- Đánh dấu hoàn thành

Ứng dụng không tự động phát hiện lỗi trong phiên bản MVP.

---

## Learning Progress

Theo dõi:

- Lessons Completed
- Modules Completed
- Vocabulary Learned
- Vocabulary Mastered
- Review Accuracy
- Quiz Accuracy
- Study Time
- Current Streak
- Longest Streak
- XP
- Level

---

## Search

Tìm kiếm:

- Lesson
- Vocabulary

---

## Bookmark

Đánh dấu:

- Lesson
- Vocabulary

---

## Settings

Bao gồm:

- Theme
- Reminder
- Daily Goal
- Backup
- Export Progress

---

# 7. Gamification

Gamification chỉ nhằm duy trì động lực.

Không biến việc học thành trò chơi.

## Daily Streak

```
🔥 18 Days
```

## XP

Chỉ cộng XP khi hoàn thành hoạt động.

| Hoạt động | XP |
|-----------|---:|
| Complete Lesson | +100 |
| Complete Review Session | +30 |
| Complete Lesson Quiz | +30 |
| Complete Learning Journal | +10 |

Không cộng XP nếu chỉ mở Lesson rồi thoát.

---

## Level

```
Level 1

↓

Level 2

↓

Level 3
```

---

## Achievement

Ví dụ:

- First Lesson
- Complete Module 01
- 7-Day Streak
- 30-Day Streak
- 100 Reviews
- 500 Vocabulary Mastered

---

# 8. Learning Experience Principles

Ứng dụng luôn ưu tiên:

1. Người học không phải quyết định hôm nay nên học gì.
2. Một phiên học không quá dài.
3. Review quan trọng hơn học bài mới.
4. Mỗi phiên học đều tạo cảm giác hoàn thành.
5. Không hiển thị quá nhiều thông tin gây áp lực.

---

# 9. Curriculum Structure

```
languages/

english/

metadata.json

roadmap.json

vocabulary/

modules/

module_01/

lesson_01/

lesson.md

lesson.json

quiz.json

lesson_02/

...
```

---

# 10. Vocabulary Structure

```
languages/

english/

vocabulary/

developer.json

deployment.json

architecture.json

authentication.json
```

Một từ chỉ tồn tại một lần.

Lesson chỉ tham chiếu.

Ví dụ:

```json
{
  "vocabulary": [
    "developer",
    "deployment",
    "architecture"
  ]
}
```

---

# 11. Data Storage

Curriculum và dữ liệu người học được tách biệt hoàn toàn.

## Curriculum (Read Only)

- Markdown
- JSON
- Vocabulary
- Quiz

## SQLite (Read / Write)

- Lesson Progress
- Vocabulary Progress
- Review History
- Learning Journal
- Improvement Log
- Achievements
- Settings

Điều này giúp:

- cập nhật curriculum dễ dàng
- không cần migrate database khi thay đổi nội dung
- backup dữ liệu người học đơn giản

---

# 12. Technology Stack

- Flutter
- Riverpod
- go_router
- SQLite
- flutter_markdown

---

# 13. MVP Scope

Version 1.0

- Today
- Learning Roadmap
- Lesson Reader
- Vocabulary Bank
- Review Engine
- Review Queue
- Review Session
- Lesson Quiz
- Learning Journal
- Improvement Log
- Learning Progress
- Search
- Bookmark
- Reminder
- Streak
- XP
- Achievement

---

# 14. Out of Scope

Không triển khai trong MVP:

- AI Chat
- Speech-to-Text
- Pronunciation Scoring
- Cloud Sync
- Login
- Social
- Leaderboard
- Marketplace
- Video Player
- Dictionary
- Translator

Khuyến nghị sử dụng kết hợp:

- ChatGPT
- YouGlish
- Cambridge Dictionary
- BBC Learning English
- YouTube

Ứng dụng chỉ hỗ trợ mở liên kết ngoài.

---

# 15. Success Metrics

Ứng dụng được xem là thành công khi:

- Người học bắt đầu học trong dưới 10 giây.
- Mỗi phiên học chỉ kéo dài khoảng 20–30 phút.
- Review luôn được hoàn thành đúng kế hoạch.
- Người học duy trì streak trên 30 ngày.
- Hoàn thành curriculum theo đúng lộ trình.
- Không phải suy nghĩ hôm nay nên học gì.

---

# 16. Release Roadmap

## Version 1.0

- Curriculum
- Lesson Reader
- Today
- Review Engine
- Review Session
- Lesson Quiz
- Vocabulary
- Progress
- Journal
- Gamification

## Version 1.1

- Backup / Restore
- Export Progress
- Hỗ trợ nhiều ngôn ngữ

## Version 1.2

- Thống kê học tập nâng cao
- Dashboard tùy biến
- Tùy chỉnh Review Schedule

---

# 17. Final Principle

Mỗi tính năng mới phải trả lời được ba câu hỏi:

1. Có giúp người học hoàn thành curriculum nhanh hơn không?
2. Có giúp người học ghi nhớ lâu hơn không?
3. Có giúp người học duy trì việc học mỗi ngày không?

Nếu cả ba câu trả lời đều là **Không**, tính năng đó sẽ không được phát triển.