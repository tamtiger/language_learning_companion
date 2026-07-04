# Architecture Overview

---

## 1. Vision

Ứng dụng được xây dựng để trở thành một nền tảng học ngoại ngữ **Offline-first**, đơn giản, dễ mở rộng và dễ bảo trì.

Mục tiêu không phải tạo ra ứng dụng có nhiều tính năng nhất, mà là ứng dụng giúp người học tiến bộ nhanh nhất với kiến trúc đủ đơn giản để có thể phát triển trong nhiều năm.

---

## 2. Goals

- Học ngoại ngữ hiệu quả.
- Offline-first.
- Feature-first Architecture.
- Business Logic tập trung.
- Dễ kiểm thử.
- Dễ mở rộng.
- Dễ cho AI Coding Agent hiểu.

---

## 3. Non Goals

Không phải mục tiêu của dự án.

- AI Teacher
- Voice Recognition
- Multiplayer
- Social Network
- Marketplace
- Cloud-first
- LMS Platform

Nếu sau này cần sẽ phát triển thành Feature riêng.

---

# 4. Architecture Philosophy

Toàn bộ dự án tuân theo các nguyên tắc sau.

## 1. Feature First

Toàn bộ source code được tổ chức theo Feature.

Không tổ chức theo:

- Screens
- Widgets
- Services
- Repository

Ví dụ.

```
features/

    lesson/

    review/

    progress/

    settings/
```

---

## 2. Business Logic tập trung

Business Logic chỉ tồn tại trong:

```
Application Layer
```

Không đặt trong:

- UI
- Widget
- Notifier
- Repository

---

## 3. UI chỉ hiển thị

UI chỉ:

- render
- nhận input
- gửi event

UI không:

- tính toán
- ghi dữ liệu
- truy cập Repository

---

## 4. Repository là Boundary

Repository là ranh giới giữa Domain và Data.

Repository:

- không biết UI
- không biết Flutter

---

## 5. Curriculum bất biến

Lesson

Vocabulary

Quiz

Roadmap

luôn là dữ liệu chỉ đọc.

Không bao giờ ghi vào SQLite.

---

## 6. Chỉ lưu User State

SQLite chỉ lưu.

- Progress
- Review
- Settings
- Journal
- Achievement

Không lưu Lesson.

---

## 7. Derived Data không lưu

Ví dụ.

```
Progress %

Dashboard

Today's Progress
```

luôn được tính toán.

---

## 8. Event Driven

Các hệ thống giao tiếp bằng Event.

Ví dụ.

```
LessonCompleted

↓

Progress

↓

Statistics

↓

Achievement
```

Không gọi trực tiếp lẫn nhau.

---

## 9. Offline First

Ứng dụng luôn hoạt động không cần Internet.

Internet chỉ là Feature mở rộng.

---

## 10. Simplicity First

Ưu tiên.

- đơn giản
- dễ hiểu
- dễ sửa

hơn là tối ưu quá sớm.

---

# 5. High Level Architecture

```
Presentation

↓

Application

↓

Repository

↓

Data Access Layer

↓

Storage
```

Business Flow chỉ đi xuống.

---

# 6. Core Systems

Ứng dụng gồm các hệ thống chính.

```
Curriculum System

Review Engine

Progress System

Statistics System

Journal System

Achievement System

Settings System

Import / Export
```

Mỗi hệ thống độc lập.

---

# 7. Data Classification

Toàn bộ dữ liệu được chia thành ba loại.

## Learning Content

```
Markdown

JSON

(Read Only)
```

Ví dụ.

- Lesson
- Vocabulary
- Quiz

---

## Learning State

```
SQLite
```

Ví dụ.

- Progress
- Review
- Settings

---

## Calculated Data

```
Calculator

↓

Snapshot
```

Ví dụ.

- Dashboard
- Progress %
- Today

Không lưu.

---

# 8. Dependency Rule

```
Presentation

↓

Application

↓

Repository Interface

↓

Repository Implementation

↓

Data Source

↓

Storage
```

Không được đi ngược.

---

# 9. Feature Architecture

```
lesson/

review/

today/

progress/

settings/
```

Bên trong.

```
application/

domain/

data/

presentation/
```

---

# 10. Learning Flow

```
Today

↓

Lesson

↓

Quiz

↓

Complete Lesson

↓

Review Queue

↓

Review Session

↓

Progress

↓

Dashboard
```

---

# 11. Data Flow

```
Markdown

↓

Curriculum

↓

Application

↓

Repository

↓

UI
```

---

```
SQLite

↓

Repository

↓

Application

↓

UI
```

---

# 12. Development Rules

Luôn tuân thủ các quy tắc sau.

## UI

Không được:

- gọi Repository
- truy cập Database

---

## Notifier

Không chứa Business Logic.

---

## Application Layer

Là nơi duy nhất điều phối Use Case.

---

## Repository

Không biết Flutter.

---

## Data Source

Không biết Business.

---

## Entity

Không biết Storage.

---

## Widget

Không biết Database.

---

# 13. Folder Structure

```
lib/

core/

shared/

features/

    lesson/

    review/

    today/

    progress/

    settings/
```

---

# 14. Design Decisions

Các quyết định kiến trúc quan trọng.

- Offline-first.
- Feature-first.
- One Source Of Truth.
- Immutable Curriculum.
- Stateless UI.
- Event Driven.
- Repository Pattern.
- Clean Dependency.
- Derived Data.
- High Cohesion.
- Low Coupling.

---

# 15. Extension Strategy

Có thể mở rộng.

- Cloud Sync
- Multi Device
- AI Coach
- Speaking
- Listening
- Dictionary
- Multi Language

Không cần thay đổi kiến trúc.

---

# 16. Technical Documents

Toàn bộ tài liệu chi tiết.

```
01_PROJECT_STRUCTURE

02_DOMAIN_MODEL

03_CURRICULUM_SYSTEM

04_REVIEW_ENGINE

05_PROGRESS_SYSTEM

06_DATABASE_DESIGN

07_DATA_LAYER.md

08_REPOSITORY_LAYER

09_STATE_MANAGEMENT

10_APPLICATION_LAYER

11_UI_ARCHITECTURE

12_ROUTING

13_FEATURE_ARCHITECTURE
```

---

# 17. Kết luận

Kiến trúc của dự án được xây dựng dựa trên bốn nguyên tắc cốt lõi:

- **Feature-first** để mã nguồn được tổ chức theo nghiệp vụ.
- **Offline-first** để ứng dụng luôn hoạt động mà không phụ thuộc Internet.
- **Business Logic tập trung** trong Application Layer để dễ kiểm thử và bảo trì.
- **Tách biệt rõ Content, State và Derived Data** nhằm giảm trùng lặp và giữ cho dữ liệu nhất quán.

Mục tiêu cuối cùng không phải là áp dụng càng nhiều pattern càng tốt, mà là tạo ra một kiến trúc **đơn giản, rõ ràng, dễ mở rộng và đủ ổn định để phát triển lâu dài**.