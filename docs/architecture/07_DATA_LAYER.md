# Data Access Layer

> Version: 1.0
>
> Data Access Layer là tầng duy nhất làm việc trực tiếp với các nguồn dữ liệu (Data Source).
>
> Tầng này chịu trách nhiệm đọc, ghi và chuyển đổi dữ liệu giữa Storage và Repository.

---

# 1. Mục tiêu

Data Access Layer chịu trách nhiệm:

- Đọc dữ liệu từ SQLite.
- Đọc Curriculum từ JSON/Markdown.
- Ghi dữ liệu vào SQLite.
- Chuyển đổi Raw Data thành Data Model.
- Che giấu chi tiết của Storage.

Không chịu trách nhiệm:

- Business Logic
- Progress
- Review
- UI
- Validation nghiệp vụ

---

# 2. Architecture

```
                Repository

                     │

        ┌────────────┴────────────┐

        ▼                         ▼

 Local Data Source        Curriculum Data Source

        │                         │

        ▼                         ▼

    SQLite              JSON / Markdown
```

Repository không biết SQLite hay JSON.

Repository chỉ biết Data Source.

---

# 3. Design Principles

## Single Responsibility

Data Source chỉ đọc và ghi dữ liệu.

Không chứa business logic.

Ví dụ.

❌ Sai

```
loadLesson()

↓

calculateProgress()
```

✅ Đúng

```
loadLesson()
```

---

## Storage Agnostic

Repository không biết dữ liệu đến từ đâu.

Ví dụ.

```
SQLite

JSON

Memory

Cloud
```

Đều được truy cập qua Data Source.

---

## Replaceable

Có thể thay SQLite bằng Hive.

Hoặc.

JSON bằng REST API.

Repository không thay đổi.

---

# 4. Data Sources

Hệ thống có hai nhóm Data Source.

```
Local

↓

SQLite
```

---

```
Curriculum

↓

Markdown

JSON
```

Tương lai.

```
Cloud
```

---

# 5. Local Data Source

Quản lý toàn bộ dữ liệu người dùng.

Ví dụ.

```
Lesson Progress

Review Item

Settings

Journal
```

Không biết Curriculum.

---

# 6. Curriculum Data Source

Chỉ đọc.

```
Metadata

Roadmap

Lesson

Vocabulary

Quiz
```

Không ghi.

---

# 7. Data Models

Data Source làm việc với Data Model.

Ví dụ.

```
LessonProgressModel

ReviewItemModel

VocabularyModel
```

Đây không phải Domain Entity.

---

# 8. Mapping

```
SQLite Row

↓

LessonProgressModel

↓

Repository

↓

LessonProgress Entity
```

Hoặc.

```
lesson.json

↓

LessonModel

↓

Repository

↓

Lesson Entity
```

Data Source không tạo Domain Entity.

---

# 9. Folder Structure

```
data/

    datasource/

        local/

            lesson_progress_local_datasource.dart

            review_local_datasource.dart

            settings_local_datasource.dart

        curriculum/

            lesson_datasource.dart

            vocabulary_datasource.dart

            roadmap_datasource.dart

    models/

        lesson_progress_model.dart

        review_item_model.dart

        lesson_model.dart

        vocabulary_model.dart
```

---

# 10. Responsibilities

Local Data Source.

- CRUD SQLite
- Transaction
- Query

Curriculum Data Source.

- Load JSON
- Parse Markdown
- Cache Metadata

---

# 11. Dependency

```
Repository

↓

Data Source

↓

Storage
```

Không có chiều ngược.

---

# 12. Error Handling

Data Source chỉ phát hiện lỗi kỹ thuật.

Ví dụ.

```
Database Locked

File Missing

Invalid JSON

Disk Full
```

Không xử lý lỗi nghiệp vụ.

---

# 13. Cache

Cache thuộc Data Source.

Ví dụ.

```
Metadata

Roadmap

Vocabulary Index
```

Repository không cache.

---

# 14. Transaction

Transaction thuộc Local Data Source.

Ví dụ.

```
Update Lesson

↓

Insert Review Items

↓

Commit
```

Repository chỉ gọi.

---

# 15. Repository Boundary

Repository không viết SQL.

Repository không đọc JSON.

Repository không biết Storage.

---

# 16. Future Extensions

Có thể thêm.

```
Cloud Data Source

REST API

Firebase

Supabase

Google Drive Sync
```

Không sửa Repository.

---

# 17. Design Decisions

## Một Data Source cho một loại Storage

Ví dụ.

```
SQLite

↓

Local Data Source
```

```
JSON

↓

Curriculum Data Source
```

Không trộn.

---

## Data Model tách Domain

Model chỉ phục vụ việc lưu trữ.

Không chứa business logic.

---

## Repository không biết Storage

Giúp dễ test.

Dễ thay Storage.

---

# 18. Sequence

```
Repository

↓

Local Data Source

↓

SQLite

↓

Model

↓

Repository

↓

Entity
```

---

# 19. Non Responsibilities

Data Access Layer không:

- tính Progress
- sinh Review
- validate nghiệp vụ
- mở khóa Achievement
- render UI

---

# 20. Kết luận

Data Access Layer là lớp trung gian giữa Repository và các nguồn dữ liệu.

Nó giúp:

- cô lập chi tiết lưu trữ,
- giảm coupling,
- dễ thay thế công nghệ,
- hỗ trợ nhiều nguồn dữ liệu trong tương lai mà không ảnh hưởng đến Domain hay Repository.