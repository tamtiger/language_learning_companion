# Progress System

> Version: 1.0
>
> Progress System chịu trách nhiệm quản lý **trạng thái học tập hiện tại** của người dùng.
>
> Hệ thống này **không** chịu trách nhiệm phân tích thống kê hay báo cáo học tập. Những dữ liệu đó thuộc Statistics System.

---

# 1. Purpose

Progress System trả lời ba câu hỏi.

- Người học đang ở đâu?
- Tiếp theo cần làm gì?
- Curriculum đã hoàn thành đến đâu?

Progress System là nguồn dữ liệu duy nhất về trạng thái học tập.

---

# 2. Responsibilities

Progress System chịu trách nhiệm:

- Lesson Progress
- Vocabulary Progress
- Review Progress
- Curriculum Progress
- Current Streak
- Current XP
- Progress Snapshot

Không chịu trách nhiệm:

- Study Analytics
- Heatmap
- Weekly Report
- Monthly Report
- Dashboard Charts

---

# 3. Architecture

```
                Progress System

                       │

        ┌──────────────┼──────────────┐

        ▼              ▼              ▼

 Lesson Progress   Vocabulary Progress   Review Progress

                       │

                       ▼

             Progress Calculator

                       │

                       ▼

              Progress Snapshot

                       │

                       ▼

             Progress Repository
```

Progress System chỉ quản lý **state hiện tại**.

---

# 4. Design Principles

## Single Source of Truth

Mỗi loại Progress chỉ tồn tại một nơi.

Ví dụ.

```
Lesson

↓

Lesson Progress
```

Không lưu Progress ở nhiều bảng.

---

## Immutable Curriculum

Curriculum không thay đổi.

Progress chỉ lưu trạng thái của người học.

```
Curriculum

(Read Only)

↓

Progress

(Read / Write)
```

---

## Derived Data

Ưu tiên tính toán.

Ví dụ.

```
Completed Lessons

/

Total Lessons

=

Lesson Progress %
```

Không lưu nếu có thể tính lại.

---

## Event Driven

Progress chỉ thay đổi khi có Event.

Ví dụ.

```
Lesson Completed

↓

Update Progress
```

---

# 5. Lesson Progress

Theo dõi trạng thái từng Lesson.

Lifecycle.

```
Locked

↓

Available

↓

Started

↓

Completed
```

Thông tin.

```
LessonId

Status

StartedAt

CompletedAt

Duration
```

Lesson Progress không chứa:

- Markdown
- Vocabulary
- Quiz

---

# 6. Vocabulary Progress

Vocabulary Progress phản ánh khả năng ghi nhớ.

```
Vocabulary

↓

Review Item

↓

Vocabulary Progress
```

Thông tin.

```
VocabularyId

LearningState

CurrentInterval

NextReview

Accuracy

ReviewCount
```

Không chứa.

- Meaning
- Example
- IPA

---

# 7. Review Progress

Review Progress phản ánh trạng thái của Review Engine.

Ví dụ.

```
Current Queue

Current Session

Remaining Reviews

Today's Target

Today's Completed
```

Review Queue thuộc Review Engine.

Review Progress chỉ đọc kết quả.

---

# 8. Curriculum Progress

Curriculum Progress được tính từ.

```
Lesson Progress

+

Vocabulary Progress
```

Ví dụ.

```
Lesson

36 / 180

Vocabulary

420 / 1200
```

Không lưu phần trăm.

---

# 9. Progress Calculator

Progress Calculator chịu trách nhiệm.

- Lesson %
- Module %
- Curriculum %
- Vocabulary %
- Completion Rate

Không ghi dữ liệu.

Chỉ tính toán.

---

# 10. Progress Snapshot

Snapshot là View Model của toàn bộ Progress.

Ví dụ.

```
Current Lesson

Next Lesson

Today's Review

Lesson Progress

Vocabulary Progress

Current Streak

Current XP
```

Dashboard chỉ đọc Snapshot.

Không tự tính toán.

---

# 11. Progress Events

Ví dụ.

```
Lesson Started

↓

Update Lesson Progress

↓

Refresh Snapshot
```

---

```
Lesson Completed

↓

Update Lesson Progress

↓

Refresh Snapshot
```

---

```
Review Completed

↓

Update Vocabulary Progress

↓

Refresh Snapshot
```

---

# 12. Repository

Progress System chỉ làm việc với Interface.

```
ProgressRepository
```

Ví dụ.

```
saveLessonProgress()

saveVocabularyProgress()

loadProgress()

loadSnapshot()
```

Không truy cập SQLite trực tiếp.

---

# 13. Dependency

```
Lesson

↓

Progress System

↓

Repository

↓

SQLite
```

Không có chiều ngược lại.

---

# 14. Current State vs History

Progress chỉ lưu trạng thái hiện tại.

Ví dụ.

```
Lesson 12

Completed
```

Không lưu toàn bộ lịch sử thay đổi.

Nếu cần lịch sử.

↓

Statistics System.

---

# 15. Streak

Streak thuộc Progress.

Ví dụ.

```
Current

18

Longest

42
```

Điều kiện.

Một ngày được tính là học nếu:

- hoàn thành Lesson

hoặc

- hoàn thành Review Session

---

# 16. XP

XP cũng thuộc Progress.

```
Current XP

Current Level
```

Lịch sử XP.

↓

Statistics System.

---

# 17. Statistics Boundary

Statistics là subsystem riêng.

```
Statistics System

↓

Study Time

↓

Daily Report

↓

Weekly Report

↓

Heatmap

↓

Learning Trend
```

Progress không biết Statistics.

Statistics chỉ đọc Progress Event.

---

# 18. Extension Points

Có thể bổ sung.

```
Daily Goal

Monthly Goal

Challenge Progress

Certificate Progress
```

Không cần sửa kiến trúc hiện tại.

---

# 19. Design Decisions

## Progress và Statistics tách biệt

Progress phản ánh trạng thái hiện tại.

Statistics phản ánh lịch sử.

Hai khái niệm này không nên trộn lẫn.

---

## Snapshot

UI chỉ đọc Snapshot.

Không tự tính toán.

Giúp giảm logic trong Presentation Layer.

---

## Derived Data

Không lưu dữ liệu có thể tính lại.

Giảm rủi ro sai lệch.

---

## Event Driven

Progress chỉ thay đổi khi có Domain Event.

Giúp giảm coupling giữa các Feature.

---

# 20. Sequence Diagram

```
Lesson Completed

↓

Progress System

↓

Progress Calculator

↓

Snapshot

↓

Dashboard
```

---

```
Review Completed

↓

Vocabulary Progress

↓

Snapshot

↓

Today Screen
```

---

# 21. Non Responsibilities

Progress System không:

- phân tích thống kê
- sinh biểu đồ
- tạo Heatmap
- tạo Weekly Report
- tính Study Trend
- tạo Achievement

Các hệ thống này chỉ đọc Progress.

---

# 22. Kết luận

Progress System là **nguồn dữ liệu duy nhất về trạng thái học tập hiện tại**.

Hệ thống chỉ lưu những gì cần thiết để trả lời:

- Người học đang ở đâu?
- Tiếp theo cần làm gì?
- Đã hoàn thành bao nhiêu?

Mọi dữ liệu mang tính lịch sử, phân tích hoặc báo cáo đều được chuyển sang **Statistics System**, giúp Progress luôn đơn giản, ổn định và dễ bảo trì.