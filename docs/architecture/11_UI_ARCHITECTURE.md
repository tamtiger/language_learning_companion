# UI Architecture

> Version: 1.0
>
> UI Architecture định nghĩa cách tổ chức toàn bộ tầng Presentation của ứng dụng.
>
> Mục tiêu là tạo ra một giao diện đơn giản, dễ mở rộng, dễ bảo trì và hoàn toàn tách biệt với Business Logic.

---

# 1. Mục tiêu

UI Architecture chịu trách nhiệm:

- Hiển thị dữ liệu.
- Nhận tương tác từ người dùng.
- Chuyển Event đến State Management.
- Render State.

UI không chịu trách nhiệm:

- Business Logic
- Database
- Review Algorithm
- Progress Calculation
- Navigation Logic
- Repository

---

# 2. Architecture

```
                 UI

                  │

                  ▼

              Widget Tree

                  │

                  ▼

             ViewModel(State)

                  │

                  ▼

        Application Service
```

Widget không gọi Repository.

---

# 3. Design Principles

## UI is Stateless

UI chỉ render.

Ví dụ.

```
State

↓

Widget
```

Không tính toán.

---

## Business Logic Free

Sai.

```
Button

↓

Update Progress

↓

Repository
```

Đúng.

```
Button

↓

Notifier

↓

Application Service
```

---

## Feature First

```
presentation/

    lesson/

    review/

    today/

    settings/
```

Không chia theo.

```
widgets/

screens/

pages/
```

---

## Composition

Ưu tiên ghép Widget nhỏ.

Không tạo Widget khổng lồ.

---

# 4. Folder Structure

```
presentation/

    lesson/

        screen/

        widgets/

        notifier/

        state/

    review/

    progress/

    today/

    settings/

shared/

    widgets/

    dialogs/

    theme/
```

Shared chỉ chứa thành phần dùng chung.

---

# 5. Screen

Screen chỉ chịu trách nhiệm.

- Scaffold
- Layout
- Kết nối Notifier

Screen không xử lý Business Logic.

---

Ví dụ.

```
LessonScreen

↓

LessonContent

↓

VocabularySection

↓

QuizButton
```

---

# 6. Widget

Widget chia thành ba nhóm.

## Feature Widget

```
LessonCard

ReviewQueue

VocabularyTile
```

---

## Shared Widget

```
PrimaryButton

ProgressBar

LoadingView

ErrorView
```

---

## Layout Widget

```
PageSection

ContentCard

Spacing
```

---

# 7. State Rendering

Widget render theo State.

```
Loading

↓

LoadingView
```

---

```
Loaded

↓

LessonView
```

---

```
Error

↓

ErrorView
```

Không dùng.

```
if else

if else

if else
```

Khắp nơi.

---

# 8. UI Event Flow

```
Tap

↓

Notifier

↓

Application Service

↓

State

↓

Widget
```

Một chiều.

---

# 9. Screen Communication

Sai.

```
Lesson Screen

↓

Review Screen
```

Đúng.

```
Lesson

↓

State

↓

UI Refresh
```

Screen không biết nhau.

---

# 10. Shared Components

Các thành phần dùng chung.

```
Button

Dialog

Snackbar

Loading

Empty State

Progress Indicator
```

Không chứa Business Logic.

---

# 11. Theme

Theme là hệ thống riêng.

Bao gồm.

```
Typography

Spacing

Radius

Elevation

Color

Animation
```

Không hard-code.

---

# 12. Responsive Design

UI phải hỗ trợ.

```
Phone

Tablet

Desktop
```

Layout dựa trên Constraint.

Không dựa vào Device.

---

# 13. Accessibility

Ưu tiên.

- Font Scale
- Screen Reader
- High Contrast
- Touch Target
- Keyboard Navigation

---

# 14. Empty State

Mọi màn hình đều có.

```
Loading

Empty

Error

Success
```

Không để màn hình trắng.

---

# 15. Animation

Animation chỉ phục vụ UX.

Không chứa Logic.

Ví dụ.

```
Fade

Slide

Scale

Hero
```

Không thay đổi dữ liệu.

---

# 16. Error UI

Error được hiển thị thống nhất.

```
Icon

↓

Message

↓

Retry Button
```

Không mỗi màn hình một kiểu.

---

# 17. Loading UI

Loading thống nhất.

```
Skeleton

↓

Progress

↓

Spinner
```

Tùy từng trường hợp.

---

# 18. UI Performance

Nguyên tắc.

- Widget nhỏ.
- const khi có thể.
- Rebuild tối thiểu.
- Lazy List.
- Image Cache.

---

# 19. Design Decisions

## UI không biết Repository

Giảm Coupling.

---

## Widget nhỏ

Dễ test.

Dễ tái sử dụng.

---

## Feature First

Mỗi Feature độc lập.

---

## Shared Component

Không duplicate UI.

---

# 20. Sequence Diagram

```
User

↓

Widget

↓

Notifier

↓

Application Service

↓

State

↓

Widget Refresh
```

---

# 21. Non Responsibilities

UI không:

- ghi Database
- tính Progress
- tạo Review
- đọc JSON
- parse Markdown
- quản lý Curriculum

---

# 22. UI Layers

```
Screen

↓

Section

↓

Component

↓

Primitive Widget
```

Ví dụ.

```
Lesson Screen

↓

Vocabulary Section

↓

Vocabulary Card

↓

Text
```

---

# 23. UI Ownership

| Layer | Responsibility |
|---------|----------------|
| Screen | Layout |
| Section | Chia bố cục |
| Component | Hiển thị dữ liệu |
| Primitive | Widget cơ bản |

---

# 24. Kết luận

UI chỉ là lớp hiển thị.

Mọi nghiệp vụ đều nằm ngoài Presentation Layer.

Một UI tốt phải:

- đơn giản,
- dễ đọc,
- dễ kiểm thử,
- dễ thay đổi,
- không phụ thuộc Business Logic.

Nhờ đó ứng dụng có thể thay đổi giao diện mà không ảnh hưởng đến Domain hay Data Layer.