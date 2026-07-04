# Application Layer

> Version: 1.0
>
> Application Layer là nơi điều phối toàn bộ nghiệp vụ của ứng dụng.
>
> Đây là tầng duy nhất được phép kết hợp nhiều Repository để thực hiện một Use Case hoàn chỉnh.

---

# 1. Mục tiêu

Application Layer chịu trách nhiệm:

- Điều phối Business Flow.
- Thực thi Use Case.
- Gọi Repository.
- Điều phối Transaction.
- Phát Domain Event.
- Trả kết quả cho Presentation Layer.

Không chịu trách nhiệm:

- UI
- Database
- SQL
- Widget
- Storage

---

# 2. Architecture

```
Presentation

↓

Application Layer

↓

Repository

↓

Data Source

↓

Storage
```

Application Layer là trung tâm của Business Flow.

---

# 3. Design Principles

## Use Case First

Mỗi hành động của người dùng tương ứng với một Use Case.

Ví dụ.

```
Complete Lesson

Start Lesson

Start Review

Finish Review

Submit Quiz

Update Settings
```

Không có Use Case chung chung.

---

## One Use Case - One Responsibility

Ví dụ.

```
CompleteLessonUseCase
```

chỉ chịu trách nhiệm hoàn thành Lesson.

Không xử lý Review.

Không xử lý Achievement.

---

## Stateless

Use Case không lưu State.

Mỗi lần chạy.

```
Input

↓

Execute

↓

Output
```

---

## Repository Only

Application Layer chỉ biết Repository.

Không biết SQLite.

Không biết JSON.

---

# 4. Folder Structure

```
application/

    lesson/

        complete_lesson_usecase.dart

        load_lesson_usecase.dart

    review/

        start_review_usecase.dart

        submit_review_usecase.dart

    progress/

        load_progress_usecase.dart

    dashboard/

        load_dashboard_usecase.dart

    settings/

        update_settings_usecase.dart
```

Tổ chức theo Feature.

---

# 5. Use Case Lifecycle

```
Receive Request

↓

Validate Input

↓

Load Entity

↓

Execute Business Logic

↓

Save Result

↓

Publish Event

↓

Return Output
```

---

# 6. Input / Output

Use Case nhận Input rõ ràng.

Ví dụ.

```
CompleteLessonInput

↓

lessonId

studyDuration
```

Kết quả.

```
CompleteLessonResult
```

Không trả Map.

Không trả JSON.

---

# 7. Business Flow

Ví dụ.

Complete Lesson.

```
Load Lesson Progress

↓

Mark Completed

↓

Save Progress

↓

Create Review Items

↓

Update XP

↓

Publish Event

↓

Return Result
```

Business Flow luôn nằm tại đây.

---

# 8. Repository Coordination

Một Use Case có thể gọi nhiều Repository.

Ví dụ.

```
LessonRepository

↓

ReviewRepository

↓

ProgressRepository
```

Repository không gọi nhau.

---

# 9. Transaction Boundary

Transaction được bắt đầu tại Application Layer.

Ví dụ.

```
Begin Transaction

↓

Update Progress

↓

Create Review

↓

Commit
```

Nếu lỗi.

Rollback.

---

# 10. Validation

Application Layer chỉ kiểm tra Business Rule.

Ví dụ.

```
Lesson đã hoàn thành?

↓

Không cho Complete lần nữa.
```

Không kiểm tra UI.

---

# 11. Domain Events

Sau mỗi Use Case thành công.

Có thể phát Event.

Ví dụ.

```
LessonCompleted

ReviewCompleted

QuizFinished

SettingsUpdated
```

Application Layer không biết ai sẽ xử lý Event.

---

# 12. Event Consumers

Ví dụ.

```
LessonCompleted

↓

Statistics

↓

Achievement

↓

Notification

↓

Future Sync
```

Use Case không gọi trực tiếp.

---

# 13. Error Handling

Repository.

↓

Infrastructure Error

↓

Application Layer

↓

Application Error

↓

Presentation
```

UI không biết SQLite Exception.

---

# 14. Dependency

```
Notifier

↓

Application Layer

↓

Repository
```

Không có chiều ngược.

---

# 15. Output

Use Case luôn trả.

```
Result
```

Ví dụ.

```
Success

Failure

Validation Error
```

Không throw Exception cho UI.

---

# 16. Testing

Mỗi Use Case có Unit Test riêng.

Ví dụ.

```
Given

↓

Execute

↓

Verify Repository

↓

Verify Result
```

Không cần Flutter Test.

---

# 17. Naming Convention

```
LoadLessonUseCase

CompleteLessonUseCase

StartReviewUseCase

SubmitQuizUseCase

LoadDashboardUseCase
```

Tên luôn bắt đầu bằng động từ.

---

# 18. Feature Matrix

| Feature | Use Cases |
|----------|-----------|
| Lesson | Load Lesson, Complete Lesson |
| Review | Start Review, Submit Review |
| Progress | Load Progress |
| Dashboard | Load Dashboard |
| Journal | Save Journal |
| Settings | Update Settings |

---

# 19. Sequence Diagram

```
User Tap

↓

Notifier

↓

CompleteLessonUseCase

↓

Repositories

↓

Save

↓

Publish Event

↓

Return Result

↓

Notifier

↓

Update State

↓

UI
```

---

# 20. Non Responsibilities

Application Layer không:

- render UI
- viết SQL
- đọc Markdown
- parse JSON
- quản lý Widget
- lưu State

---

# 21. Design Decisions

## Use Case là đơn vị nghiệp vụ

Không đặt Business Logic trong Notifier.

---

## Repository chỉ truy xuất dữ liệu

Repository không điều phối nghiệp vụ.

---

## Event Driven

Use Case chỉ phát Event.

Không gọi trực tiếp Statistics hay Achievement.

---

## Stateless

Không lưu dữ liệu giữa các lần thực thi.

---

# 22. Kết luận

Application Layer là trung tâm của toàn bộ nghiệp vụ.

Nó nhận yêu cầu từ Presentation Layer, thực thi Business Flow, phối hợp Repository, phát Domain Event và trả kết quả cho UI.

Nhờ đó:

- UI luôn đơn giản.
- Repository chỉ tập trung truy xuất dữ liệu.
- Business Logic tập trung tại một nơi.
- Hệ thống dễ kiểm thử, dễ mở rộng và dễ bảo trì.