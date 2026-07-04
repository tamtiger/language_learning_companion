# Domain Model

> Phiên bản: 1.0
>
> Tài liệu này mô tả mô hình nghiệp vụ (Domain Model) của Language Learning Companion.
>
> Đây là tài liệu quan trọng nhất của toàn bộ kiến trúc vì nó định nghĩa các đối tượng nghiệp vụ, mối quan hệ giữa chúng và vòng đời của chúng.
>
> Domain Model hoàn toàn độc lập với Flutter, SQLite hay UI.

---

# 1. Mục tiêu

Domain Model nhằm:

- Định nghĩa các đối tượng nghiệp vụ.
- Xác định trách nhiệm của từng đối tượng.
- Thiết lập mối quan hệ giữa các đối tượng.
- Đảm bảo toàn bộ business logic độc lập với framework.

Domain Model không quan tâm:

- UI
- SQLite
- Riverpod
- Flutter
- Widget

---

# 2. Domain Overview

```
Curriculum
    │
    ▼
Module
    │
    ▼
Lesson
    │
    ▼
Vocabulary
    │
    ▼
ReviewItem
    │
    ▼
ReviewSession
    │
    ▼
Progress
```

Ngoài luồng học còn có:

```
Journal

Improvement Log

Achievement

Settings
```

---

# 3. Domain Principles

## 3.1 Business First

Mọi quy tắc học tập đều nằm trong Domain.

Ví dụ:

- Hoàn thành Lesson.
- Sinh Review.
- Cập nhật Progress.
- Mở khóa Achievement.

Không được đặt trong UI.

---

## 3.2 Entity có vòng đời riêng

Ví dụ:

Vocabulary

```
New

↓

Learning

↓

Reviewing

↓

Mastered
```

Lesson

```
Locked

↓

Available

↓

In Progress

↓

Completed
```

Progress

```
Started

↓

Updated

↓

Completed
```

---

## 3.3 Single Source of Truth

Mỗi dữ liệu chỉ có một nơi quản lý.

Ví dụ:

Vocabulary

↓

Vocabulary Entity

Progress

↓

Progress Entity

Không duplicate.

---

# 4. Core Domain Entities

Toàn bộ Domain được chia thành 9 Entity chính.

```
Curriculum

Module

Lesson

Vocabulary

ReviewSession

Progress

Journal

ImprovementItem

Achievement
```

---

# 5. Curriculum

Đại diện cho một chương trình học.

Ví dụ:

```
General English

Business English

Travel English
```

Curriculum bao gồm:

- Metadata
- Roadmap
- Modules
- Vocabulary

Curriculum không lưu tiến độ.

---

## Responsibilities

- Quản lý Module.
- Cung cấp Roadmap.
- Định nghĩa cấu trúc chương trình học.

---

# 6. Module

Module là nhóm Lesson.

Ví dụ:

```
Pronunciation

Grammar

Listening

Conversation
```

Một Module có:

- nhiều Lesson

Không có Progress.

---

## Responsibilities

- Gom nhóm Lesson.
- Xác định thứ tự Lesson.

---

# 7. Lesson

Lesson là đơn vị học nhỏ nhất.

Một Lesson gồm:

- Nội dung
- Vocabulary tham chiếu
- Quiz
- Resource

Lesson không lưu:

- Progress
- XP
- Review

---

## Responsibilities

- Cung cấp kiến thức.
- Khai báo Vocabulary.
- Khai báo Quiz.

---

# 8. Vocabulary

Entity quan trọng nhất.

Một Vocabulary chỉ tồn tại một lần.

Ví dụ

```
Word

IPA

Meaning

Example

Tags

Introduced In

Referenced By
```

Vocabulary không lưu:

- Review Count
- Mastered
- Progress

Đó là trách nhiệm của Progress.

---

## Responsibilities

- Đại diện cho từ vựng.
- Là nguồn dữ liệu cho Review.
- Là nguồn dữ liệu cho Quiz.

---

# 9. Review Item

Review Item đại diện cho trạng thái học của một từ.

Ví dụ:

```
Vocabulary

↓

ReviewItem
```

Review Item bao gồm:

- Review Level
- Next Review
- Last Review
- Accuracy
- Review Count

Một Vocabulary luôn có tối đa một Review Item cho mỗi Curriculum.

---

## Responsibilities

- Theo dõi tiến độ ôn tập.
- Sinh lịch ôn.
- Cập nhật trạng thái.

---

# 10. Review Session

Review Session là một phiên ôn tập.

Ví dụ:

```
20 words

↓

Flashcard

↓

Multiple Choice

↓

Matching

↓

Fill Blank
```

Session không lưu:

- Vocabulary

Chỉ tham chiếu Review Item.

---

## Responsibilities

- Nhóm Review Item.
- Điều phối hoạt động ôn tập.
- Tổng hợp kết quả.

---

# 11. Lesson Progress

Theo dõi tiến độ Lesson.

Ví dụ:

```
Started

Completed

Duration

Completed At
```

Không liên quan Vocabulary.

---

# 12. Vocabulary Progress

Theo dõi tiến độ từng Vocabulary.

Ví dụ:

```
Status

Accuracy

Review Count

Mastered
```

Không lưu thông tin của Lesson.

---

# 13. Curriculum Progress

Được tính toán từ:

```
Lesson Progress

+

Vocabulary Progress
```

Không lưu riêng nếu có thể tính toán lại.

---

# 14. Learning Journal

Nhật ký học.

Một Journal gắn với một Lesson.

Bao gồm:

- Date
- Lesson
- Reflection

Không tham gia tính Progress.

---

# 15. Improvement Item

Một mục cần cải thiện.

Ví dụ:

```
TH Sound

Word Stress

Listening

Grammar
```

Được quản lý hoàn toàn bởi người học.

Không tự sinh.

---

# 16. Achievement

Một thành tựu.

Ví dụ:

```
First Lesson

7-Day Streak

100 Reviews
```

Achievement chỉ đọc Progress.

Không sửa Progress.

---

# 17. Entity Relationship

```
Curriculum

│

├── Modules

│      │

│      └── Lessons

│              │

│              ├── Vocabulary References

│              └── Quiz

│

└── Vocabulary
         │
         ▼
    Review Item
         │
         ▼
    Review Session
```

---

# 18. Progress Relationship

```
Lesson

↓

Lesson Progress

Vocabulary

↓

Review Item

↓

Vocabulary Progress

↓

Curriculum Progress
```

Progress không làm thay đổi Curriculum.

---

# 19. Aggregate Boundaries

Curriculum là Aggregate Root.

```
Curriculum

↓

Module

↓

Lesson
```

Vocabulary là Aggregate riêng.

```
Vocabulary

↓

Review Item
```

Review Session chỉ tham chiếu.

Không sở hữu Vocabulary.

---

# 20. Business Rules

## Lesson

- Chỉ được Complete một lần.
- Có thể mở lại nhiều lần.
- Không được sửa nội dung khi runtime.

---

## Vocabulary

- Chỉ tồn tại một lần.
- Có thể được nhiều Lesson tham chiếu.
- Không lưu Progress.

---

## Review

- Chỉ Review Item mới có lịch ôn.
- Session được tạo từ Review Item.
- Session không tự quyết định từ cần ôn.

---

## Progress

- Chỉ lưu dữ liệu người học.
- Không thay đổi Curriculum.

---

# 21. Domain Services

Một số nghiệp vụ không thuộc Entity.

Ví dụ:

```
Review Scheduler

Progress Calculator

Achievement Calculator

Curriculum Loader
```

Đây là Domain Service.

Không phải Entity.

---

# 22. Repository Interfaces

Mỗi Aggregate Root có Repository.

Ví dụ:

```
CurriculumRepository

LessonRepository

VocabularyRepository

ReviewRepository

ProgressRepository

JournalRepository
```

Repository chỉ là Interface.

Không chứa SQLite.

---

# 23. Domain Events

Các sự kiện quan trọng.

```
LessonCompleted

↓

Generate Review

↓

Update Progress

↓

Unlock Achievement

↓

Refresh Today
```

Ví dụ:

```
ReviewCompleted

↓

Update Vocabulary Progress

↓

Update Queue

↓

Refresh Dashboard
```

Domain Event giúp giảm coupling giữa các Feature.

---

# 24. Không thuộc Domain

Các thành phần sau không phải Domain:

- Widget
- Screen
- Provider
- SQLite
- JSON
- Markdown
- HTTP
- Theme

Đó là Infrastructure hoặc Presentation.

---

# 25. Nguyên tắc cuối cùng

Domain là trái tim của toàn bộ ứng dụng.

Mọi quyết định nghiệp vụ phải được mô hình hóa trong Domain trước khi triển khai vào UI hoặc Database.

Một UI có thể thay đổi, một Database có thể thay đổi, nhưng Domain Model phải luôn ổn định.

Nếu một thay đổi làm phá vỡ Domain Model, cần xem xét lại thiết kế thay vì vá ở tầng Presentation hoặc Data.