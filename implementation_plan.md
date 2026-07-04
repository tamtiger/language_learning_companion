# Khởi tạo Flutter App (Lean MVP)

Dự án sẽ được triển khai theo hướng Lean MVP, tập trung vào tính năng cốt lõi nhất: đọc nội dung bài học (Markdown) và theo dõi tiến độ (SQLite) bằng Flutter.

> [!IMPORTANT]
> **Yêu cầu phê duyệt từ bạn (User Review Required):**
> 1. **Vị trí thư mục:** Tôi đề xuất tạo Flutter app trong thư mục con `d:\MyProject\learn_english_course\app` để tách biệt mã nguồn với các tài liệu Curriculum (nằm ở thư mục gốc). Bạn có đồng ý không?
> 2. **Flutter SDK:** Máy tính của bạn đã cài đặt sẵn Flutter SDK chưa? Nếu chưa, bạn cần cài đặt Flutter trước khi chúng ta chạy các lệnh khởi tạo dự án.

## Kiến trúc Tinh gọn (Lean Architecture)

Thay vì dùng toàn bộ Clean Architecture (Domain, Application, Infrastructure, Presentation), chúng ta sẽ gom lại thành 3 lớp đơn giản:
1. **Data Layer (Repository):** Đọc Markdown từ file Assets và gọi SQLite để lưu/đọc tiến trình học.
2. **State Management (Riverpod):** Provider quản lý logic và gọi Repository.
3. **Presentation (UI):** Các màn hình Flutter đơn giản (Dashboard, Lesson List, Lesson Detail).

## Các thay đổi dự kiến (Proposed Changes)

### 1. Khởi tạo dự án
Sử dụng lệnh `flutter create app --empty` để tạo dự án.

### 2. Cài đặt các thư viện (Dependencies)
Thêm các thư viện thiết yếu vào `pubspec.yaml`:
- `flutter_riverpod`: Quản lý state.
- `go_router`: Quản lý điều hướng (routing).
- `sqflite` & `path`: Database cục bộ (SQLite).
- `flutter_markdown`: Hiển thị nội dung Markdown.

### 3. Cấu trúc thư mục mã nguồn
Tạo các thư mục cốt lõi trong `app/lib/`:
- `[NEW] lib/core/`: Chứa hằng số, routing (`router.dart`), database helper (`database_helper.dart`).
- `[NEW] lib/models/`: Chứa các data class đơn giản (ví dụ: `Lesson.dart`, `Progress.dart`).
- `[NEW] lib/repositories/`: Chứa logic tương tác dữ liệu (`lesson_repository.dart`, `progress_repository.dart`).
- `[NEW] lib/providers/`: Chứa Riverpod providers (`lesson_provider.dart`, `progress_provider.dart`).
- `[NEW] lib/ui/`: Chứa các màn hình giao diện (Screens & Widgets).

### 4. Tích hợp dữ liệu Curriculum
- Cấu hình file `pubspec.yaml` để nhận diện các thư mục `../lessons` và `../modules` dưới dạng **assets**, từ đó app có thể đọc trực tiếp các file Markdown.

## Kế hoạch kiểm thử (Verification Plan)
- Chạy lệnh `flutter pub get` để đảm bảo cài đặt thư viện thành công.
- Biên dịch thử ứng dụng (`flutter build` hoặc chạy thử nghiệm) để kiểm tra không có lỗi cú pháp.
- Mở màn hình đọc Lesson để xác minh file Markdown được parse và hiển thị chính xác.
