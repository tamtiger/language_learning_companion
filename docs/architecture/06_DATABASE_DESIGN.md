# Database Design

> Version: 1.0
>
> Database là nơi lưu **trạng thái học tập của người dùng (User State)**.
>
> Database **không** lưu nội dung bài học, từ vựng hay quiz. Những dữ liệu đó thuộc Curriculum System.

---

# 1. Mục tiêu

Database được thiết kế nhằm:

- Lưu trạng thái học tập.
- Lưu tiến trình ôn tập.
- Lưu cài đặt.
- Lưu dữ liệu cần khôi phục sau khi đóng ứng dụng.
- Đảm bảo hiệu năng và dễ mở rộng.

Database không chịu trách nhiệm:

- Business Logic
- UI
- Markdown
- Curriculum
- Review Algorithm

---

# 2. Design Principles

## User State Only

Database chỉ lưu dữ liệu của người dùng.

Ví dụ:

```
Lesson Progress

Vocabulary Progress

Review Items

Settings

Journal
```

Không lưu:

```
Lesson Content

Vocabulary

Quiz

Markdown
```

---

## Curriculum is Read Only

Curriculum nằm ngoài Database.

```
Markdown

JSON

↓

Curriculum Loader

↓

Application
```

SQLite không chứa Curriculum.

---

## Derived Data Should Not Be Stored

Không lưu dữ liệu có thể tính toán lại.

Ví dụ.

Không lưu:

```
Lesson %

Vocabulary %

Dashboard

Today's Progress
```

Những dữ liệu này được tính bởi:

```
Progress Calculator
```

---

## Normalized State

Mỗi loại dữ liệu chỉ lưu một lần.

Ví dụ.

```
Vocabulary Progress

↓

review_item
```

Không duplicate.

---

# 3. Data Classification

Toàn bộ dữ liệu được chia thành ba nhóm.

```
Static Data

↓

Curriculum

↓

Markdown / JSON
```

---

```
State Data

↓

SQLite
```

---

```
Derived Data

↓

Calculator

↓

Snapshot
```

---

Ví dụ.

| Loại | Ví dụ |
|-------|-------|
| Static | Lesson, Vocabulary, Quiz |
| State | Progress, Review, Journal |
| Derived | Dashboard, Progress %, Today's Review |

---

# 4. Database Architecture

```
Application

↓

Repository

↓

Data Source

↓

SQLite
```

Database không được truy cập trực tiếp từ UI.

---

# 5. Database Modules

SQLite được chia thành các module.

```
lesson_progress

review_items

journal

settings

achievement

improvement

app_metadata
```

Mỗi module quản lý một loại dữ liệu.

---

# 6. Tables Overview

```
lesson_progress

review_item

journal

improvement_item

achievement_progress

settings

app_metadata
```

Không có bảng:

```
lesson

vocabulary

quiz
```

---

# 7. lesson_progress

Theo dõi Lesson.

```
lesson_id

status

started_at

completed_at

duration
```

Một Lesson chỉ có một record.

---

# 8. review_item

Đây là bảng quan trọng nhất.

```
vocabulary_id

state

current_interval

next_review

last_review

accuracy

review_count

ease_factor
```

Không chứa:

```
Meaning

Example

IPA
```

---

# 9. journal

```
id

lesson_id

created_at

content
```

Chỉ lưu Reflection.

---

# 10. improvement_item

```
id

category

note

created_at

resolved
```

Ví dụ.

```
TH Sound

Word Stress

Listening
```

---

# 11. achievement_progress

```
achievement_id

unlocked

unlocked_at
```

Không lưu Logic.

Logic thuộc Achievement Engine.

---

# 12. settings

```
theme

language

daily_goal

review_algorithm

session_size

notifications
```

Settings luôn có một record.

---

# 13. app_metadata

Lưu metadata của App.

Ví dụ.

```
database_version

curriculum_version

created_at

updated_at
```

Không lưu Progress.

---

# 14. Relationships

```
lesson_progress

↓

lesson_id

↓

Curriculum
```

---

```
review_item

↓

vocabulary_id

↓

Vocabulary
```

SQLite chỉ lưu ID.

---

# 15. Foreign Keys

Ưu tiên Logical Reference.

Không bắt buộc Foreign Key.

Ví dụ.

```
lesson_id

↓

Lesson
```

Lesson nằm ngoài Database.

Do đó không thể tạo FK thực.

---

# 16. Transactions

Các thao tác quan trọng phải Transaction.

Ví dụ.

```
Complete Lesson

↓

Update Lesson Progress

↓

Create Review Items

↓

Update Snapshot
```

Nếu lỗi.

Rollback.

---

# 17. Migration

Database có Version.

Ví dụ.

```
v1

↓

v2

↓

v3
```

Migration luôn:

```
Forward Only
```

Không downgrade.

---

# 18. Backup Strategy

Backup chỉ bao gồm:

```
SQLite
```

Không backup:

```
Curriculum
```

Curriculum luôn có thể cài lại.

---

# 19. Performance Strategy

Index cho.

```
lesson_id

vocabulary_id

next_review

created_at
```

Review Scheduler luôn query theo:

```
next_review
```

Do đó phải index.

---

# 20. Repository Mapping

```
LessonRepository

↓

lesson_progress
```

---

```
ReviewRepository

↓

review_item
```

---

```
JournalRepository

↓

journal
```

---

```
SettingsRepository

↓

settings
```

---

# 21. Data Lifecycle

Lesson.

```
Lesson Completed

↓

lesson_progress

↓

Progress Calculator
```

---

Review.

```
Review Session

↓

review_item

↓

Review Scheduler
```

---

Journal.

```
Lesson

↓

Journal

↓

History
```

---

# 22. Cache Strategy

SQLite là Source of Truth.

Memory Cache chỉ dùng để:

```
Current Lesson

Current Snapshot

Today's Review
```

Cache có thể xóa bất kỳ lúc nào.

---

# 23. Error Recovery

Nếu Database lỗi.

```
Rollback

↓

Retry

↓

Restore Backup
```

Không được làm hỏng dữ liệu Progress.

---

# 24. Future Extension

Có thể bổ sung.

```
Cloud Sync

Multi Device

Export

Import

Encryption
```

Không thay đổi Schema hiện tại.

---

# 25. Design Decisions

## Không lưu Curriculum

Giúp Database nhỏ.

Dễ backup.

---

## Không lưu Derived Data

Giảm duplicate.

Giảm lỗi đồng bộ.

---

## Chỉ lưu User State

Tách biệt hoàn toàn giữa:

```
Learning Content

và

Learning Progress
```

---

## Repository là tầng duy nhất truy cập Database

UI không được truy cập SQLite.

Business Logic cũng không truy cập SQLite.

---

# 26. Database Boundaries

Database chỉ quản lý:

- User State
- User Preferences
- Local Metadata

Không quản lý:

- Curriculum
- Lesson Content
- Markdown
- Business Rules
- Review Algorithm

---

# 27. Kết luận

Database được thiết kế theo triết lý **State Storage**, không phải **Content Storage**.

Mọi nội dung học được quản lý bởi Curriculum System.

SQLite chỉ lưu những gì người dùng tạo ra trong quá trình học.

Kiến trúc này mang lại các lợi ích:

- Database nhỏ và dễ quản lý.
- Backup/Restore đơn giản.
- Không phụ thuộc Curriculum.
- Dễ mở rộng Cloud Sync trong tương lai.
- Giảm rủi ro sai lệch dữ liệu nhờ không lưu Derived Data.