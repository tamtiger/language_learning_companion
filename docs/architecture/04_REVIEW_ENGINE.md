# Review Engine

> Version: 1.0
>
> Review Engine chịu trách nhiệm xác định **khi nào** cần ôn, **ôn cái gì**, **ôn bao nhiêu** và **cập nhật trạng thái ghi nhớ** sau mỗi phiên học.
>
> Đây là thành phần quan trọng nhất của Language Learning Companion.

---

# 1. Purpose

Review Engine giải quyết bốn bài toán.

1. Xác định từ cần ôn.
2. Sinh Review Session.
3. Đánh giá kết quả ôn tập.
4. Lập lịch cho lần ôn tiếp theo.

Review Engine không quan tâm:

- Flutter
- UI
- Animation
- SQLite
- Riverpod

---

# 2. Architecture

```
                    Review Engine

                           │

        ┌──────────────────┼──────────────────┐

        ▼                  ▼                  ▼

 Review Scheduler   Session Generator   Progress Updater

                           │

                           ▼

                 Review Algorithm
```

Review Engine đóng vai trò Orchestrator.

Thuật toán ôn tập được tách riêng thành Review Algorithm.

---

# 3. Design Principles

## 3.1 Engine độc lập với thuật toán

Review Engine không biết đang sử dụng:

- Fixed Interval
- SM-2
- FSRS

Nó chỉ gọi:

```
ReviewAlgorithm
```

Điều này giúp thay đổi thuật toán mà không ảnh hưởng toàn bộ hệ thống.

---

## 3.2 Queue trước, Session sau

Không sinh Session trực tiếp.

Luồng chuẩn.

```
Review Scheduler

↓

Review Queue

↓

Session Generator

↓

Review Session
```

Điều này giúp:

- dễ giới hạn số lượng từ
- dễ chia nhiều Session
- dễ thay đổi UI

---

## 3.3 Session là đơn vị học

Flashcard không phải trung tâm.

Session mới là đơn vị học.

Ví dụ.

```
Session

↓

Flashcard

↓

Multiple Choice

↓

Matching

↓

Fill Blank
```

Sau này có thể thêm.

- Listening
- Speaking
- Shadowing

mà không sửa Engine.

---

# 4. Components

Review Engine gồm bốn thành phần.

```
ReviewScheduler

SessionGenerator

ProgressUpdater

ReviewAlgorithm
```

---

# 5. Review Scheduler

## Responsibility

Sinh Review Queue.

Input

```
Review Items

Current Time
```

Output

```
Review Queue
```

Scheduler không biết UI.

Không biết Flashcard.

Không biết Quiz.

---

# 6. Review Queue

Review Queue chỉ là danh sách ID.

Ví dụ.

```
review_item_01

review_item_02

review_item_03
```

Không chứa Vocabulary.

Không chứa Progress.

Queue luôn được sắp xếp theo:

```
Due Time

↓

Priority

↓

Created Time
```

---

# 7. Session Generator

Session Generator chuyển Queue thành Session.

Ví dụ.

```
Queue

120 words

↓

30

↓

30

↓

30

↓

30
```

Generator quyết định.

- Session Size
- Session Type
- Activity Mix

Không quyết định lịch ôn.

---

# 8. Review Algorithm

Review Algorithm là Strategy.

```
abstract class ReviewAlgorithm
```

Interface.

```
calculateNextReview()

calculateInterval()

calculateState()
```

Không lưu dữ liệu.

Không biết Repository.

---

Các implementation.

```
FixedIntervalAlgorithm

SM2Algorithm

FSRSAlgorithm
```

MVP chỉ triển khai.

```
FixedIntervalAlgorithm
```

---

# 9. Progress Updater

Sau khi Session hoàn thành.

ProgressUpdater sẽ.

```
Update Review Count

↓

Update Accuracy

↓

Update Interval

↓

Update Next Review

↓

Update Status
```

Không tạo Session.

Không tạo Queue.

---

# 10. Review Lifecycle

```
New

↓

Learning

↓

Reviewing

↓

Mastered
```

Review Engine chỉ thay đổi State.

Vocabulary không thay đổi.

---

# 11. Workflow

```
Lesson Completed

↓

Create Review Items

↓

Scheduler

↓

Queue

↓

Generator

↓

Review Session

↓

User Rating

↓

Algorithm

↓

Progress Updater

↓

Persist

↓

Refresh Dashboard
```

---

# 12. Strategy Pattern

Review Engine sử dụng Strategy Pattern.

```
                    Review Algorithm

                           ▲

        ┌──────────────────┼──────────────────┐

        │                  │                  │

 FixedInterval         SM2             FSRS
```

Ưu điểm.

- dễ thay thuật toán
- dễ test
- không ảnh hưởng UI

---

# 13. Repository Dependencies

Review Engine chỉ làm việc với Interface.

```
ReviewRepository

VocabularyRepository

SettingsRepository
```

Không truy cập SQLite.

---

# 14. Configuration

Engine không hard-code.

Ví dụ.

```
Daily Target

Max Session Size

Min Session Size

Review Algorithm

Maximum Backlog
```

Toàn bộ được cấu hình.

---

# 15. Backlog Management

Nếu người học nghỉ nhiều ngày.

Ví dụ.

```
Due

320 words
```

Scheduler không tạo Session 320 từ.

Mà.

```
Today's Target

30 words
```

Phần còn lại vẫn nằm trong Queue.

Điều này giúp tránh quá tải.

---

# 16. Failure Recovery

Nếu Session bị đóng giữa chừng.

Engine lưu.

```
Current Position

Answers

Remaining Items
```

Người học tiếp tục từ vị trí trước.

Không phải làm lại.

---

# 17. Extension Points

Có thể mở rộng.

Review Algorithm.

```
FSRS

SM2

AI Adaptive
```

Review Activity.

```
Listening

Speaking

Typing

Sentence Builder
```

Session Generator.

```
Adaptive Session

Random Session

Challenge Session
```

Không cần sửa Review Engine.

---

# 18. Non Responsibilities

Review Engine không.

- Render UI
- Hiển thị Flashcard
- Chấm Lesson Quiz
- Quản lý Lesson
- Quản lý Achievement
- Đồng bộ dữ liệu

---

# 19. Sequence Diagram

```
Lesson Completed

↓

Create Review Items

↓

Review Scheduler

↓

Review Queue

↓

Session Generator

↓

Review Session

↓

User Rating

↓

Review Algorithm

↓

Progress Updater

↓

Repository

↓

Today Dashboard
```

---

# 20. Design Decisions

## Strategy Pattern

Thuật toán tách khỏi Engine.

Giúp thay đổi thuật toán dễ dàng.

---

## Queue độc lập

Queue không phải Session.

Một Queue có thể sinh nhiều Session.

---

## Session nhỏ

Một Session chỉ nên kéo dài:

- 5–10 phút
- 20–40 từ

---

## Review Item độc lập

Vocabulary không lưu tiến độ.

Review Item mới là nơi lưu trạng thái ghi nhớ.

Điều này giúp Curriculum luôn là dữ liệu tĩnh.

---

# 21. Kết luận

Review Engine là thành phần điều phối toàn bộ quá trình ôn tập.

Nó không chịu trách nhiệm ghi nhớ thuật toán cụ thể hay hiển thị giao diện, mà tập trung vào việc điều phối các thành phần chuyên biệt:

- Scheduler quyết định **ôn cái gì**.
- Session Generator quyết định **ôn như thế nào**.
- Review Algorithm quyết định **ôn lại khi nào**.
- Progress Updater quyết định **cập nhật trạng thái ra sao**.

Kiến trúc này đảm bảo hệ thống có thể thay đổi thuật toán ôn tập hoặc bổ sung hình thức luyện tập mới mà không làm ảnh hưởng đến các thành phần còn lại.