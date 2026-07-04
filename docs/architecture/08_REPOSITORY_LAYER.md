# Repository Layer

> Version: 1.0
>
> Repository Layer là cầu nối giữa **Domain** và **Data Access Layer**.
>
> Repository chịu trách nhiệm cung cấp Domain Entity cho Business Logic mà không để Domain biết dữ liệu được lưu ở đâu.

---

# 1. Mục tiêu

Repository Layer chịu trách nhiệm:

- Cung cấp Domain Entity.
- Ẩn hoàn toàn Data Source.
- Mapping giữa Domain Entity và Data Model.
- Điều phối nhiều Data Source nếu cần.

Repository không chịu trách nhiệm:

- SQL
- JSON
- Business Logic
- UI
- Review Algorithm

---

# 2. Architecture

```
                Domain

                   │

                   ▼

            Repository Interface

                   │

                   ▼

        Repository Implementation

         ┌─────────┴──────────┐

         ▼                    ▼

 Local Data Source    Curriculum Data Source

         │                    │

         ▼                    ▼

     SQLite          JSON / Markdown
```

Domain chỉ biết Repository Interface.

---

# 3. Design Principles

## Dependency Inversion

Domain phụ thuộc Interface.

Không phụ thuộc Implementation.

Ví dụ.

```
ReviewRepository
```

thay vì

```
SQLiteReviewRepository
```

---

## Domain First

Repository luôn trả về.

```
Entity
```

Không trả về.

```
Model

Map

JSON
```

---

## Repository là Boundary

Repository là ranh giới giữa.

```
Business

↓

Infrastructure
```

Không có Entity nào đi xuống Data Source.

---

# 4. Repository Responsibilities

Repository chịu trách nhiệm.

- Load Entity
- Save Entity
- Mapping
- Transaction Coordination

Không chịu trách nhiệm.

- SQL
- Parse JSON
- Cache
- File IO

---

# 5. Repository Structure

```
repositories/

lesson_repository.dart

review_repository.dart

progress_repository.dart

journal_repository.dart

settings_repository.dart
```

Mỗi Aggregate có một Repository.

---

# 6. Repository Interface

Ví dụ.

```
abstract class ReviewRepository
```

Có thể định nghĩa.

```
getReviewItem()

saveReviewItem()

getDueReviews()

deleteReviewItem()
```

Không có SQL.

---

# 7. Repository Implementation

Ví dụ.

```
ReviewRepositoryImpl
```

Implementation sử dụng.

```
ReviewLocalDataSource

VocabularyDataSource
```

Repository có thể phối hợp nhiều Data Source.

---

# 8. Entity Mapping

```
ReviewItemModel

↓

Mapper

↓

ReviewItem Entity
```

Chiều ngược.

```
Entity

↓

Mapper

↓

Model
```

Repository chịu trách nhiệm Mapping.

---

# 9. Multiple Data Sources

Ví dụ.

```
Lesson

↓

Metadata

↓

Curriculum Data Source
```

đồng thời.

```
Lesson Progress

↓

Local Data Source
```

Repository kết hợp.

```
Lesson

+

Lesson Progress

↓

Lesson Detail
```

Domain không biết điều này.

---

# 10. Repository Flow

```
Use Case

↓

Repository

↓

Data Source

↓

Storage

↓

Model

↓

Repository

↓

Entity

↓

Use Case
```

---

# 11. Transaction Coordination

Một nghiệp vụ.

```
Complete Lesson
```

Có thể cần.

```
Update Progress

+

Insert Review Items

+

Update Snapshot
```

Repository điều phối Transaction.

Data Source chỉ thực hiện.

---

# 12. Error Translation

Ví dụ.

```
SQLite Error

↓

Repository

↓

Domain Exception
```

Domain không biết.

```
SQLiteException
```

---

# 13. Repository Ownership

Mỗi Repository sở hữu một Aggregate.

Ví dụ.

```
LessonRepository

↓

Lesson Aggregate
```

```
ReviewRepository

↓

Review Aggregate
```

Không Repository nào sửa Aggregate của Repository khác.

---

# 14. Repository Dependencies

Repository chỉ phụ thuộc.

```
Data Source

Mapper

Entity
```

Không phụ thuộc.

- UI
- Provider
- Widget

---

# 15. Mapper

Mapper là thành phần riêng.

```
ReviewItemMapper

LessonMapper

ProgressMapper
```

Repository không tự parse JSON.

---

# 16. Caching

Repository không cache.

Cache thuộc.

```
Data Source
```

Điều này giúp Repository luôn thuần về nghiệp vụ.

---

# 17. Future Extensions

Có thể thêm.

```
Cloud Repository

Sync Repository

Offline Repository
```

Không ảnh hưởng Domain.

---

# 18. Testing

Repository rất dễ Mock.

Ví dụ.

```
FakeReviewRepository

MemoryRepository

MockRepository
```

Không cần SQLite.

---

# 19. Sequence Diagram

```
Use Case

↓

Review Repository

↓

Review Data Source

↓

SQLite

↓

Review Model

↓

Mapper

↓

Review Entity

↓

Use Case
```

---

# 20. Design Decisions

## Repository luôn trả Entity

Không trả Model.

Giúp Domain độc lập với Storage.

---

## Mapper độc lập

Mapping không nằm trong Entity.

Không nằm trong Data Source.

---

## Repository điều phối

Repository có thể gọi nhiều Data Source.

Data Source không gọi nhau.

---

## Một Aggregate — Một Repository

Giảm Coupling.

Dễ kiểm thử.

---

# 21. Repository Matrix

| Repository | Aggregate | Data Sources |
|------------|-----------|--------------|
| LessonRepository | Lesson | Curriculum |
| ReviewRepository | Review | Local + Curriculum |
| ProgressRepository | Progress | Local |
| JournalRepository | Journal | Local |
| SettingsRepository | Settings | Local |

---

# 22. Non Responsibilities

Repository không:

- viết SQL
- đọc Markdown
- tính Progress
- sinh Review
- render UI
- quản lý State

---

# 23. Kết luận

Repository Layer là **Boundary Layer** giữa Domain và Infrastructure.

Mọi Business Logic chỉ làm việc với Repository Interface và Domain Entity.

Nhờ đó:

- Domain không phụ thuộc SQLite.
- Data Source có thể thay thế dễ dàng.
- Repository có thể kết hợp nhiều nguồn dữ liệu.
- Hệ thống dễ kiểm thử, dễ mở rộng và phù hợp với Clean Architecture.