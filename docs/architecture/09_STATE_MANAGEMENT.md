# State Management

> Version: 1.0
>
> State Management chịu trách nhiệm quản lý **trạng thái của giao diện (Presentation State)**.
>
> State Management không chứa Business Logic và không truy cập trực tiếp Database.

---

# 1. Mục tiêu

State Management chịu trách nhiệm:

- Quản lý UI State.
- Điều phối tương tác giữa UI và Application Layer.
- Theo dõi Loading/Error/Success.
- Đồng bộ trạng thái giữa các màn hình.

Không chịu trách nhiệm:

- Business Logic
- SQL
- Review Algorithm
- Progress Calculation
- Curriculum

---

# 2. Architecture

```
                    UI

                     │

                     ▼

             ViewModel (Notifier)

                     │

                     ▼

          Application Service

                     │

                     ▼

               Repository

                     │

                     ▼

                Domain Layer
```

State chỉ làm việc với Application Service.

Không gọi Repository.

---

# 3. Design Principles

## UI State Only

State chỉ phản ánh giao diện.

Ví dụ.

```
Loading

Loaded

Error

Refreshing

Empty
```

Không chứa.

- Business Rule
- SQL
- JSON

---

## One Screen One State

Mỗi màn hình có một State riêng.

Ví dụ.

```
TodayState

LessonState

ReviewState

ProgressState

SettingsState
```

Không chia sẻ State lung tung.

---

## Immutable State

State luôn immutable.

Ví dụ.

```
copyWith(...)
```

Mỗi thay đổi tạo State mới.

Không sửa trực tiếp.

---

## Event Driven

UI phát Event.

```
User Tap

↓

Notifier

↓

Application Service

↓

New State
```

---

# 4. Folder Structure

```
presentation/

    today/

        state/

            today_state.dart

        notifier/

            today_notifier.dart

        screen/

            today_screen.dart

    lesson/

    review/

    progress/
```

State đi cùng Feature.

Không gom toàn bộ vào một folder.

---

# 5. State Object

Một State gồm.

```
Data

Loading

Error

Status
```

Ví dụ.

```
TodayState

↓

TodaySnapshot

↓

isLoading

↓

error
```

Không chứa Repository.

---

# 6. Notifier

Notifier chịu trách nhiệm.

- gọi Application Service
- cập nhật State
- xử lý Event UI

Không chứa.

- Business Logic
- SQL

---

# 7. State Lifecycle

Ví dụ.

```
Initial

↓

Loading

↓

Loaded

↓

Refreshing

↓

Loaded
```

Hoặc.

```
Loading

↓

Error
```

---

# 8. Screen Communication

Screen không gọi Screen.

```
Today

↓

Application Service

↓

Repository

↓

State

↓

Progress Screen
```

State là nguồn dữ liệu chung.

---

# 9. Application Service Boundary

Notifier chỉ biết.

```
CompleteLesson()

StartReview()

LoadDashboard()

UpdateSettings()
```

Không biết Repository.

---

# 10. Dependency Flow

```
Widget

↓

Notifier

↓

Application Service

↓

Repository

↓

Data Source
```

Không có chiều ngược.

---

# 11. State Scope

## Global State

Ví dụ.

```
Theme

Language

Current Curriculum
```

---

## Feature State

Ví dụ.

```
Lesson

Review

Progress

Today
```

---

## Local Widget State

Ví dụ.

```
Expanded

Tab Index

Scroll Position
```

Không đưa lên Riverpod.

---

# 12. Async State

Mọi thao tác bất đồng bộ.

```
Idle

↓

Loading

↓

Success

↓

Failure
```

UI luôn render theo State.

---

# 13. Refresh Flow

Ví dụ.

```
Pull To Refresh

↓

Notifier

↓

Application Service

↓

Reload Snapshot

↓

Update State
```

---

# 14. Error Handling

State chỉ chứa.

```
Error Message

Retry Action
```

Không xử lý Exception.

Exception được chuyển đổi ở Application Layer.

---

# 15. Navigation

Navigation không nằm trong State.

Ví dụ.

Sai.

```
state.navigate(...)
```

Đúng.

```
UI

↓

Navigator
```

State không biết Route.

---

# 16. Repository Access

Sai.

```
Notifier

↓

Repository
```

Đúng.

```
Notifier

↓

Application Service

↓

Repository
```

---

# 17. Testing

Notifier có thể test độc lập.

Ví dụ.

```
Mock Application Service

↓

Notifier

↓

Assert State
```

Không cần Widget Test.

---

# 18. Design Decisions

## Feature First

State nằm cùng Feature.

Không gom theo loại file.

---

## Immutable

State luôn immutable.

Giảm bug.

---

## UI không biết Repository

Widget chỉ quan sát State.

Không truy cập Data.

---

## Application Layer là Boundary

Notifier không có Business Logic.

Business Logic thuộc Application Layer.

---

# 19. Riverpod Structure

Ví dụ.

```
TodayNotifier

↓

TodayState

↓

TodayScreen
```

Review.

```
ReviewNotifier

↓

ReviewState

↓

ReviewScreen
```

Không có Global Mega Provider.

---

# 20. State Matrix

| Layer | Responsibility |
|---------|----------------|
| Widget | Render UI |
| Notifier | Điều phối UI |
| Application Service | Business Flow |
| Repository | Data Access |
| Data Source | Storage |

---

# 21. Non Responsibilities

State Management không:

- tính XP
- sinh Review
- lưu Database
- đọc Markdown
- parse JSON
- validate nghiệp vụ

---

# 22. Sequence Diagram

```
User Tap

↓

Notifier

↓

Application Service

↓

Repository

↓

Result

↓

State

↓

Widget
```

---

# 23. Kết luận

State Management chỉ là **Presentation Layer**.

Nó không phải nơi chứa Business Logic, cũng không phải nơi truy cập dữ liệu.

Mọi quyết định nghiệp vụ đều thuộc Application Layer.

State Management chỉ có một nhiệm vụ:

> **Biến dữ liệu từ Domain thành trạng thái mà UI có thể hiển thị.**