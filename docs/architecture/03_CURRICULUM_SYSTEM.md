# Curriculum System

> Phiên bản: 1.0
>
> Tài liệu này mô tả kiến trúc của Curriculum System.
>
> Curriculum là trái tim của toàn bộ ứng dụng. Mọi nội dung học đều được mô hình hóa dưới dạng dữ liệu (Data) thay vì code.

---

# 1. Mục tiêu

Curriculum System chịu trách nhiệm:

- Quản lý toàn bộ nội dung học.
- Quản lý cấu trúc chương trình học.
- Cung cấp dữ liệu cho Lesson, Review và Quiz.
- Cho phép mở rộng curriculum mà không cần sửa source code.

Curriculum System **không** quản lý:

- Progress
- Review Schedule
- User Data
- Settings

---

# 2. Design Principles

## Data Driven

Curriculum hoàn toàn là dữ liệu.

```
Markdown

+

JSON

+

Vocabulary
```

Không có business logic.

---

## Read Only

Curriculum là dữ liệu chỉ đọc.

Ứng dụng không chỉnh sửa curriculum trong runtime.

Mọi thay đổi curriculum đều được thực hiện bằng cách cập nhật file.

---

## Independent

Curriculum không phụ thuộc:

- Flutter
- SQLite
- Riverpod

Curriculum có thể được sử dụng bởi:

- Mobile
- Desktop
- Web

---

# 3. Curriculum Overview

```
Curriculum

│

├── Metadata

├── Roadmap

├── Modules

├── Lessons

├── Vocabulary

└── Quiz
```

---

# 4. Folder Structure

```
languages/

english/

metadata.json

roadmap.json

vocabulary/

modules/

module_01/

module.json

lesson_01/

lesson.md

lesson.json

quiz.json

lesson_02/

...
```

Mỗi curriculum đều tuân theo cấu trúc giống nhau.

---

# 5. Metadata

Metadata mô tả curriculum.

Ví dụ:

```json
{
  "id": "english_general",
  "language": "english",
  "title": "General English",
  "version": "1.0.0",
  "author": "...",
  "description": "...",
  "estimatedLessons": 180
}
```

Metadata không chứa Lesson.

---

# 6. Roadmap

Roadmap mô tả cấu trúc chương trình.

Ví dụ:

```
Roadmap

↓

Phase

↓

Module

↓

Lesson
```

Roadmap chỉ chứa ID.

Không chứa nội dung.

---

Ví dụ:

```json
{
  "phases": [
    {
      "id": "phase_1",
      "modules": [
        "module_01",
        "module_02"
      ]
    }
  ]
}
```

---

# 7. Module

Module là nhóm Lesson.

Ví dụ:

```
Pronunciation

Grammar

Conversation
```

Module chỉ chứa:

- Metadata
- Lesson IDs

Không chứa Lesson Content.

Ví dụ:

```json
{
  "id": "module_01",
  "title": "Pronunciation Basics",
  "lessons": [
    "lesson_01",
    "lesson_02"
  ]
}
```

---

# 8. Lesson

Một Lesson gồm ba phần.

```
lesson.md

lesson.json

quiz.json
```

---

## lesson.md

Chứa nội dung học.

Ví dụ:

```
Markdown

Heading

Image

Table

Exercise
```

---

## lesson.json

Chứa metadata.

Ví dụ:

```json
{
  "id": "lesson_01",
  "title": "...",
  "estimatedMinutes": 25,
  "difficulty": "beginner",
  "vocabulary": [
    "developer",
    "application"
  ],
  "resources": [
    "..."
  ]
}
```

---

## quiz.json

Chứa Lesson Quiz.

Không sinh tự động.

Ví dụ:

```json
{
  "questions": [
    ...
  ]
}
```

---

# 9. Vocabulary

Vocabulary được lưu tập trung.

```
vocabulary/

developer.json

application.json

deployment.json
```

Một từ chỉ tồn tại một lần.

---

Ví dụ:

```json
{
  "id": "developer",
  "word": "developer",
  "ipa": "...",
  "meaning": "...",
  "example": "...",
  "introducedIn": "lesson_01",
  "references": [
    "lesson_05",
    "lesson_09"
  ]
}
```

Lesson chỉ tham chiếu.

Không copy dữ liệu.

---

# 10. Resource

Lesson có thể tham chiếu tài nguyên ngoài.

Ví dụ:

```
YouTube

BBC

YouGlish

Cambridge
```

App chỉ mở liên kết.

Không tải nội dung.

---

# 11. Curriculum Loader

Curriculum Loader chịu trách nhiệm:

```
Load Metadata

↓

Load Roadmap

↓

Load Modules

↓

Load Vocabulary

↓

Load Lesson
```

Loader không cache Progress.

---

# 12. Cache Strategy

Curriculum rất ít thay đổi.

Do đó có thể cache.

Ví dụ:

```
Metadata

Roadmap

Vocabulary Index
```

Lesson chỉ load khi cần.

---

# 13. Loading Flow

```
App Start

↓

Metadata

↓

Roadmap

↓

Vocabulary Index

↓

Ready
```

Khi mở Lesson.

```
Lesson

↓

lesson.json

↓

lesson.md

↓

quiz.json
```

Lazy Loading.

---

# 14. Curriculum Version

Mỗi curriculum có version.

Ví dụ:

```
1.0.0

1.1.0

2.0.0
```

Version dùng để:

- Migration
- Compatibility
- Debug

Không dùng để tính Progress.

---

# 15. Curriculum Package

Một curriculum là một package độc lập.

Ví dụ:

```
english_general

english_business

english_travel
```

Mỗi package đều có:

```
metadata

roadmap

modules

vocabulary
```

---

# 16. Curriculum Registry

Ứng dụng có thể có nhiều curriculum.

```
English

Japanese

Chinese
```

Registry chịu trách nhiệm:

- Liệt kê curriculum.
- Chọn curriculum.
- Load curriculum.

Không quản lý Progress.

---

# 17. Validation Rules

Curriculum phải hợp lệ.

Ví dụ:

Lesson tham chiếu Vocabulary.

↓

Vocabulary phải tồn tại.

---

Module tham chiếu Lesson.

↓

Lesson phải tồn tại.

---

Roadmap tham chiếu Module.

↓

Module phải tồn tại.

---

Không được có:

- Duplicate ID
- Missing File
- Circular Reference

---

# 18. Curriculum Validator

Validator chạy khi import curriculum.

Kiểm tra:

- JSON Schema
- Duplicate IDs
- Broken References
- Missing Assets
- Invalid Structure

Curriculum lỗi sẽ không được load.

---

# 19. Curriculum Repository

Curriculum chỉ có một Repository.

```
CurriculumRepository
```

Repository cung cấp:

- Curriculum
- Lesson
- Module
- Vocabulary
- Quiz

Repository không biết SQLite.

---

# 20. Domain Relationship

```
Curriculum

↓

Module

↓

Lesson

↓

Vocabulary Reference

↓

Vocabulary
```

Review và Progress không thuộc Curriculum.

---

# 21. Future Extension

Curriculum System hỗ trợ:

- Nhiều ngôn ngữ.
- Nhiều curriculum.
- Phiên bản curriculum.
- Import curriculum.
- Download curriculum (tương lai).

Không cần thay đổi business logic.

---

# 22. Design Decisions

## Curriculum chỉ đọc

Giúp:

- Đơn giản.
- Dễ kiểm thử.
- Không làm hỏng dữ liệu.

---

## Vocabulary tập trung

Một từ chỉ tồn tại một lần.

Giảm duplication.

---

## Markdown + JSON

Markdown dành cho nội dung.

JSON dành cho cấu hình.

Tách biệt trách nhiệm.

---

## Lazy Loading

Chỉ load Lesson khi cần.

Giảm RAM.

---

## Curriculum độc lập với User Data

Curriculum có thể cập nhật.

Progress vẫn được giữ nguyên.

---

# 23. Kiến trúc tổng thể

```
Curriculum

│

├── Metadata

├── Roadmap

├── Modules

│      │

│      └── Lessons

│               │

│               ├── lesson.md

│               ├── lesson.json

│               └── quiz.json

│

└── Vocabulary
```

---

# 24. Nguyên tắc cuối cùng

Curriculum là **nguồn dữ liệu duy nhất** của toàn bộ nội dung học.

Mọi Lesson, Vocabulary và Quiz đều phải được định nghĩa trong Curriculum thay vì viết cứng trong source code.

Điều này giúp:

- mở rộng dễ dàng,
- hỗ trợ nhiều ngôn ngữ,
- version hóa nội dung,
- tách biệt hoàn toàn giữa ứng dụng và dữ liệu học tập.

Curriculum có thể phát triển độc lập với ứng dụng, trong khi ứng dụng chỉ đóng vai trò là **Learning Engine** giúp người học hoàn thành curriculum.