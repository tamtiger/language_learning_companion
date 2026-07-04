# Routing

> Version: 1.0
>
> Routing chịu trách nhiệm quản lý điều hướng giữa các màn hình của ứng dụng.
>
> Mục tiêu là xây dựng hệ thống điều hướng đơn giản, nhất quán và độc lập với Business Logic.

---

# 1. Mục tiêu

Routing chịu trách nhiệm:

- Điều hướng giữa các màn hình.
- Quản lý Route.
- Hỗ trợ Deep Link (tương lai).
- Hỗ trợ Navigation Guard.
- Tách Navigation khỏi UI.

Routing không chịu trách nhiệm:

- Business Logic
- State Management
- Database
- Repository
- Application Service

---

# 2. Design Principles

## Navigation độc lập

Navigation là một hệ thống riêng.

Không nằm trong Widget.

Không nằm trong Notifier.

---

## Route có định danh

Mỗi màn hình có một Route duy nhất.

Ví dụ.

```
/

today

lesson

review

progress

settings
```

Không sử dụng String ngẫu nhiên trong nhiều nơi.

---

## Navigation một chiều

```
User

↓

Widget

↓

Navigation

↓

Screen
```

Screen không tự điều hướng Screen khác.

---

## UI không biết Router

Widget chỉ phát Event.

Navigation quyết định chuyển màn hình.

---

# 3. Architecture

```
Widget

↓

Navigation Service

↓

Router

↓

Screen
```

Application Layer không biết Router.

Repository càng không biết Router.

---

# 4. Folder Structure

```
presentation/

    routing/

        app_router.dart

        app_routes.dart

        route_guard.dart

        navigation_service.dart
```

Toàn bộ Routing nằm trong một Feature riêng.

---

# 5. Route Definition

Ví dụ.

```
/

Today

Lesson

Review

Progress

Journal

Settings
```

Một Route tương ứng một Screen.

---

# 6. Route Parameters

Ví dụ.

```
lesson/:lessonId
```

```
review/:sessionId
```

Không truyền Object.

Chỉ truyền ID.

---

# 7. Navigation Flow

```
Tap Lesson

↓

Navigation Service

↓

Router

↓

Lesson Screen

↓

Load Lesson
```

Không truyền Lesson Entity.

---

# 8. Navigation Service

Navigation Service là lớp duy nhất được phép gọi Router.

Ví dụ.

```
goToLesson()

goToReview()

goToProgress()

goBack()
```

Widget không gọi Router trực tiếp.

---

# 9. Route Guard

Route Guard kiểm tra quyền truy cập.

Ví dụ.

```
Lesson Locked

↓

Redirect

↓

Roadmap
```

Hoặc.

```
Review Session Empty

↓

Today Screen
```

---

# 10. Deep Link

Tương lai hỗ trợ.

Ví dụ.

```
app://lesson/15
```

↓

```
Lesson 15
```

Routing phải hỗ trợ từ đầu.

---

# 11. Initial Route

Ứng dụng luôn bắt đầu tại.

```
Today
```

Không phụ thuộc lần trước người dùng mở màn hình nào.

Trong tương lai có thể thay đổi nếu cần.

---

# 12. Back Navigation

Quy tắc.

```
Back

↓

Route Stack

↓

Previous Screen
```

Không tự viết logic riêng cho từng màn hình.

---

# 13. Navigation Stack

Ví dụ.

```
Today

↓

Lesson

↓

Quiz

↓

Result
```

Back sẽ quay theo Stack.

---

# 14. Modal Navigation

Dialog.

Bottom Sheet.

Popup.

Không được xem là Route.

Đây là UI Overlay.

---

# 15. Error Route

Nếu Route không tồn tại.

↓

```
Not Found Screen
```

Không Crash.

---

# 16. Dependency

```
Widget

↓

Navigation Service

↓

Router

↓

Screen
```

Không có chiều ngược.

---

# 17. Testing

Navigation có thể Mock.

Ví dụ.

```
Fake Navigation Service
```

Không cần chạy Flutter Navigator.

---

# 18. Design Decisions

## Navigation Service

UI không phụ thuộc Router.

---

## Route bằng ID

Không truyền Entity.

Giảm Coupling.

---

## Guard độc lập

Không viết điều kiện trong Screen.

---

## Một Screen - Một Route

Dễ bảo trì.

---

# 19. Route Matrix

| Route | Screen |
|--------|--------|
| / | Today |
| /lesson/:id | Lesson |
| /review | Review |
| /progress | Progress |
| /journal | Journal |
| /settings | Settings |

---

# 20. Sequence Diagram

```
User Tap

↓

Navigation Service

↓

Router

↓

Lesson Screen

↓

Notifier

↓

Application Service
```

---

# 21. Non Responsibilities

Routing không:

- tải dữ liệu
- tính Progress
- tạo Review
- gọi Repository
- gọi Database

---

# 22. Future Extensions

Có thể bổ sung.

```
Deep Link

Universal Link

Web URL

Nested Navigation

Multiple Navigation Stack
```

Không thay đổi kiến trúc hiện tại.

---

# 23. Kết luận

Routing chỉ chịu trách nhiệm điều hướng.

Mọi nghiệp vụ vẫn thuộc Application Layer.

Việc tách Routing thành một hệ thống riêng giúp:

- UI đơn giản hơn.
- Không phụ thuộc thư viện Router.
- Dễ thay thế (GoRouter, AutoRoute, Navigator 2.0...).
- Dễ kiểm thử và mở rộng.