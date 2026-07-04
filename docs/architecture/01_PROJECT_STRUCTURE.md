# Project Structure

> Phiên bản: 1.0
>
> Tài liệu này mô tả cấu trúc source code của Language Learning Companion và các nguyên tắc tổ chức mã nguồn.

---

# 1. Mục tiêu

Project Structure được thiết kế để:

- Dễ tìm code.
- Dễ mở rộng.
- Dễ bảo trì.
- Tách biệt rõ business logic và UI.
- Hỗ trợ phát triển theo Feature.
- Hỗ trợ nhiều curriculum và nhiều ngôn ngữ.

---

# 2. Design Principles

Project sử dụng mô hình:

> **Feature First + Domain Centric**

Không tổ chức theo MVC hay thư mục `screens`, `widgets`, `controllers` toàn cục.

Mỗi feature sở hữu toàn bộ code của chính nó.

Ví dụ:

```
lesson/

review/

progress/

settings/
```

Điều này giúp:

- feature độc lập
- dễ refactor
- dễ test
- giảm coupling

---

# 3. Root Structure

```
lib/

app/
core/
shared/
features/
data/
main.dart

assets/

languages/

english/

docs/
```

---

# 4. lib/

```
lib/

app/

core/

shared/

features/

data/

main.dart
```

Mỗi thư mục có trách nhiệm riêng.

---

# 5. app/

Chứa cấu hình toàn bộ ứng dụng.

```
app/

app.dart

router.dart

theme.dart

providers.dart
```

Không chứa business logic.

Chỉ cấu hình:

- App
- Theme
- Routing
- Global Providers

---

# 6. core/

Các thành phần nền tảng dùng cho toàn bộ project.

```
core/

constants/

errors/

extensions/

utils/

services/

logger/

exceptions/
```

Ví dụ

```
Logger

DateTime Utils

Validators

Result

Failure

Exceptions
```

Core không được phụ thuộc Feature.

---

# 7. shared/

Các thành phần UI dùng chung.

```
shared/

widgets/

components/

dialogs/

cards/

buttons/

inputs/

loading/

empty/

icons/

theme/
```

Ví dụ

```
PrimaryButton

LoadingWidget

LessonCard

ProgressBar

AppDialog
```

Không chứa business logic.

---

# 8. data/

Quản lý dữ liệu.

```
data/

database/

repositories/

datasources/

models/

mappers/
```

Ví dụ

```
SQLite

Local JSON

Markdown Loader

Repository
```

Data Layer chỉ chịu trách nhiệm đọc ghi.

Không xử lý nghiệp vụ.

---

# 9. features/

Đây là thư mục quan trọng nhất.

```
features/

today/

lesson/

review/

quiz/

progress/

journal/

vocabulary/

settings/

roadmap/

search/

bookmark/
```

Mỗi Feature hoạt động độc lập.

---

# 10. Feature Structure

Ví dụ

```
lesson/

presentation/

application/

domain/

data/
```

---

## presentation/

```
screens/

widgets/

providers/
```

Chứa

- Screen
- Widget
- UI State

---

## application/

```
controllers/

usecases/
```

Điều phối workflow.

Ví dụ

```
Open Lesson

Complete Lesson

Next Lesson
```

Không chứa Widget.

---

## domain/

```
entities/

services/

repositories/
```

Bao gồm:

- Entity
- Business Rules
- Repository Interface

Không phụ thuộc Flutter.

---

## data/

```
repository_impl/

datasources/

models/

```

Cài đặt Repository.

Đọc:

- SQLite
- JSON
- Markdown

---

# 11. Shared Domain

Một số đối tượng được nhiều Feature sử dụng.

```
core/domain/

lesson/

vocabulary/

progress/

review/
```

Hoặc

```
shared/domain/
```

Ví dụ

```
Vocabulary

Lesson

Module

Curriculum

ReviewItem
```

Không chứa UI.

---

# 12. Assets

```
assets/

images/

icons/

fonts/

audio/
```

Không lưu curriculum.

---

# 13. Curriculum

Curriculum tách hoàn toàn khỏi source code.

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
```

Không import trực tiếp vào code.

Curriculum được load khi runtime.

---

# 14. Dependency Direction

```
Presentation

↓

Application

↓

Domain

↓

Repository Interface

↓

Repository Implementation

↓

SQLite / JSON
```

Không được đi ngược.

Ví dụ:

Sai

```
Widget

↓

SQLite
```

Đúng

```
Widget

↓

Controller

↓

Repository

↓

SQLite
```

---

# 15. Feature Communication

Feature không gọi trực tiếp nhau.

Ví dụ.

Sai

```
Lesson

↓

Progress Screen
```

Đúng

```
Lesson

↓

Progress Repository

↓

Progress Feature
```

Hoặc

```
Lesson

↓

Event

↓

Today Refresh
```

---

# 16. State Management

Mỗi Feature quản lý state riêng.

Ví dụ

```
LessonProvider

ReviewProvider

TodayProvider

ProgressProvider
```

Không có Global AppState khổng lồ.

Global Provider chỉ dành cho:

- Theme
- Settings
- Router

---

# 17. Repository Pattern

Repository là ranh giới giữa Domain và Data.

Ví dụ

```
LessonRepository

↓

SQLite

↓

Markdown
```

UI không biết dữ liệu đến từ đâu.

Có thể thay đổi implementation mà không ảnh hưởng Feature.

---

# 18. Naming Convention

Feature

```
lesson

review

today
```

Provider

```
LessonProvider

TodayProvider
```

Repository

```
LessonRepository
```

Implementation

```
LessonRepositoryImpl
```

Entity

```
Lesson

Vocabulary

ReviewItem
```

Model

```
LessonModel

VocabularyModel
```

Screen

```
LessonScreen
```

Widget

```
LessonCard
```

---

# 19. Module Responsibilities

| Module | Trách nhiệm |
|---------|-------------|
| app | Khởi tạo ứng dụng |
| core | Hạ tầng dùng chung |
| shared | UI dùng chung |
| data | Đọc / ghi dữ liệu |
| features | Business Feature |
| assets | Hình ảnh, font... |
| languages | Curriculum |

---

# 20. Không nên làm

Không tạo các thư mục như:

```
controllers/

screens/

widgets/

services/

repositories/
```

ở cấp cao nhất.

Điều này khiến code của nhiều feature bị trộn lẫn.

---

# 21. Quy tắc phát triển

Khi thêm một Feature mới:

Bước 1

```
features/

new_feature/
```

Bước 2

```
presentation/

application/

domain/

data/
```

Bước 3

Đăng ký Route.

Bước 4

Đăng ký Provider.

Không sửa Feature khác nếu không cần thiết.

---

# 22. Ví dụ

Ví dụ thêm tính năng Flashcard.

```
features/

review/

presentation/

flashcard_screen.dart

widgets/

flashcard.dart

application/

review_controller.dart

domain/

review_service.dart

review_repository.dart

data/

review_repository_impl.dart
```

Toàn bộ code nằm trong Review.

Lesson không biết Flashcard tồn tại.

---

# 23. Khả năng mở rộng

Kiến trúc hiện tại cho phép thêm:

- Ngôn ngữ mới
- Curriculum mới
- Review Type mới
- Quiz Type mới
- Achievement mới

mà không ảnh hưởng cấu trúc hiện có.

---

# 24. Nguyên tắc cuối cùng

Project Structure phải đảm bảo:

- Mỗi Feature độc lập.
- Business Logic không nằm trong UI.
- Dữ liệu tách khỏi giao diện.
- Curriculum tách khỏi source code.
- Mọi thay đổi đều có phạm vi ảnh hưởng nhỏ nhất có thể (Low Coupling, High Cohesion).

Cấu trúc thư mục không chỉ nhằm sắp xếp file, mà còn phản ánh kiến trúc của hệ thống. Một developer mới có thể nhìn vào cấu trúc project và hiểu ngay trách nhiệm của từng thành phần.