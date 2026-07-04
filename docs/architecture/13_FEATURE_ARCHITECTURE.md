# Feature Architecture

> Version: 1.0
>
> Feature Architecture định nghĩa cách tổ chức mã nguồn của từng Feature trong ứng dụng.
>
> Mục tiêu là giúp tất cả Feature có cùng cấu trúc, dễ mở rộng, dễ bảo trì và tuân thủ kiến trúc của dự án.

---

# 1. Mục tiêu

Feature Architecture giúp:

- Mỗi Feature độc lập.
- Dễ phát triển song song.
- Dễ kiểm thử.
- Giảm Coupling.
- Tăng khả năng tái sử dụng.

---

# 2. Triết lý

Một Feature là một đơn vị nghiệp vụ hoàn chỉnh.

Ví dụ.

```
Lesson

Review

Progress

Today

Journal

Settings
```

Không phải:

```
Screens

Repositories

Widgets

Models
```

Dự án được tổ chức theo Feature, không theo loại file.

---

# 3. Kiến trúc

```
Feature

│

├── Domain

├── Application

├── Data

└── Presentation
```

Mỗi Feature là một module nhỏ.

---

# 4. Cấu trúc thư mục

Ví dụ.

```
features/

    lesson/

        application/

        domain/

        data/

        presentation/

    review/

    today/

    progress/

    settings/
```

Toàn bộ code của Feature nằm cùng một nơi.

---

# 5. Domain

Domain chứa:

```
Entities

Value Objects

Repository Interfaces

Domain Services

Domain Events
```

Domain không phụ thuộc Flutter.

Không phụ thuộc SQLite.

---

# 6. Application

Application chứa:

```
Use Cases

Application Services

DTO

Commands

Queries
```

Application điều phối Business Flow.

---

# 7. Data

Data chứa.

```
Repository Implementation

Data Sources

Models

Mapper
```

Data chịu trách nhiệm đọc ghi dữ liệu.

Không chứa Business Logic.

---

# 8. Presentation

Presentation chứa.

```
Screen

Widgets

State

Notifier
```

Presentation chỉ hiển thị UI.

---

# 9. Shared Code

Code dùng chung không thuộc Feature.

Ví dụ.

```
shared/

core/
```

Bao gồm.

```
Theme

Components

Utilities

Extensions

Constants
```

Không đặt vào Feature.

---

# 10. Dependency Rule

Dependency chỉ được đi xuống.

```
Presentation

↓

Application

↓

Domain

↓

Data
```

Không có chiều ngược.

Ví dụ.

```
Repository

↓

Notifier
```

là sai.

---

# 11. Feature Independence

Feature không gọi trực tiếp Feature khác.

Ví dụ.

Sai.

```
Lesson

↓

Review Repository
```

Đúng.

```
Lesson

↓

Application Service

↓

Repository
```

Nếu cần tương tác.

↓

Domain Event.

---

# 12. Public API

Mỗi Feature chỉ expose.

```
Application

Repository Interface

Entities
```

Các implementation bên trong không được sử dụng trực tiếp từ Feature khác.

---

# 13. Internal Structure

Ví dụ.

```
lesson/

    application/

        complete_lesson.dart

        load_lesson.dart

    domain/

        entities/

        repositories/

        events/

    data/

        datasource/

        models/

        repository/

        mapper/

    presentation/

        screen/

        widgets/

        notifier/

        state/
```

---

# 14. Shared Components

Không đặt Shared Widget trong Feature.

Ví dụ.

Sai.

```
lesson/

    widgets/

        primary_button.dart
```

Đúng.

```
shared/widgets/

    primary_button.dart
```

---

# 15. Khi nào tạo Feature mới?

Một Feature mới khi:

- Có nghiệp vụ riêng.
- Có UI riêng.
- Có State riêng.
- Có Use Case riêng.

Không tạo Feature chỉ vì có một màn hình.

---

# 16. Feature Communication

Các Feature giao tiếp bằng:

```
Application Layer

hoặc

Domain Events
```

Không gọi trực tiếp Repository của nhau.

---

# 17. Ownership

Mỗi Feature sở hữu hoàn toàn dữ liệu của mình.

Ví dụ.

```
Lesson

↓

Lesson Repository

↓

Lesson State
```

Review không sửa Lesson State.

---

# 18. Testing

Mỗi Feature có thể test độc lập.

Ví dụ.

```
Lesson Tests

Review Tests

Settings Tests
```

Không phụ thuộc Feature khác.

---

# 19. Ví dụ Feature hoàn chỉnh

```
lesson/

├── application/
│
│   ├── complete_lesson.dart
│   ├── load_lesson.dart
│   └── lesson_service.dart
│
├── domain/
│
│   ├── entities/
│   ├── repositories/
│   ├── events/
│   └── value_objects/
│
├── data/
│
│   ├── datasource/
│   ├── mapper/
│   ├── models/
│   └── repository/
│
└── presentation/
    │
    ├── screen/
    ├── widgets/
    ├── notifier/
    └── state/
```

---

# 20. Naming Convention

Tên Feature luôn là danh từ.

Ví dụ.

```
lesson

review

progress

journal

settings
```

Không dùng.

```
lessons_module

lesson_feature

lesson_management
```

---

# 21. Design Decisions

## Feature First

Không tổ chức theo Layer ở cấp Project.

Tổ chức theo Feature.

---

## High Cohesion

Code liên quan nằm cùng nhau.

---

## Low Coupling

Feature không biết implementation của Feature khác.

---

## Public API rõ ràng

Chỉ expose những gì cần thiết.

---

# 22. Anti-pattern

Không tổ chức như sau.

```
lib/

screens/

providers/

repositories/

models/

services/
```

Khi dự án lớn, cấu trúc này rất khó bảo trì.

---

# 23. Future Extensions

Có thể thêm.

```
Speaking

Listening

Grammar

Dictionary

Sync
```

Mỗi Feature chỉ cần tạo thêm một thư mục mới.

Không ảnh hưởng Feature cũ.

---

# 24. Kết luận

Feature Architecture là quy tắc tổ chức mã nguồn của toàn bộ dự án.

Mỗi Feature là một module độc lập gồm:

- Domain
- Application
- Data
- Presentation

Kiến trúc này giúp:

- dễ phát triển,
- dễ kiểm thử,
- dễ mở rộng,
- giảm phụ thuộc giữa các module,
- và giữ cho dự án nhất quán khi quy mô ngày càng lớn.