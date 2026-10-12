# PRD: Refactor cấu trúc feature practice và dọn đặt tên

## Vấn đề

- `src/features/practice` gom mười ba file phẳng; `CapabilityTask.tsx` dài hơn 800 dòng gồm trạng thái, hiệu ứng, thao tác lưu và toàn bộ giao diện của mọi giai đoạn.
- Trường `targetSeconds` của hợp đồng đầu ra nói thực chất là thời lượng tối thiểu (`attempt.durationSeconds < targetSeconds` thì "too-short") nhưng tên gọi gây hiểu nhầm.
- Khóa lưu trữ vẫn là `language-learning-companion-storage-v3` trong khi phiên bản dữ liệu là 6.
- Một số nit đã ghi nhận: lớp `text-current/80` không có tác dụng, hai thanh chỉ tiến trình dùng landmark `nav`, tiêu đề tab (`English Learning Companion`) khác tên header (`English Companion`), `tsconfig` không ghi `strict`.

## Mục tiêu

`src/features/practice` có cấu trúc rõ ràng, tên gọi đúng nghĩa và không còn file nhập nhằng; đổi tên trường và khóa lưu trữ mà không mất dữ liệu người học.

## Không thuộc phạm vi

- Đổi hành vi học tập hay giao diện nhìn thấy ngoài các nit nêu trên.
- Đổi cấu trúc các feature khác.

## Cấu trúc đích

```
src/features/practice/
  shared/       ModelAudioPlayer, modelAudio, useVoiceCount, learningLoopDiagnostics
  perception/   PerceptionPractice
  ladder/       ReadingLadderPractice
  spoken/       SpokenResponse, GuidedShadowing, ListenBackChecklist, PronunciationCueCard, LearningLoopPractice
  interaction/  InteractionPractice
  task/         CapabilityTask và các phần của nó (hook trạng thái, thao tác, panel, giai đoạn)
```

Thứ tự phụ thuộc một chiều: shared < perception, ladder < spoken < interaction < task (mỗi thư mục chỉ import từ thư mục có bậc thấp hơn).

## Yêu cầu

| Mã | Yêu cầu |
| --- | --- |
| ac-1 | Cấu trúc như trên; mỗi file dưới 300 dòng; test cấu trúc kiểm số dòng, thứ tự phụ thuộc và thư mục hợp lệ. |
| ac-2 | `targetSeconds` đổi thành `minSeconds` (schema, nội dung, hợp đồng bằng chứng, UI); khóa lưu đổi thành `language-learning-companion-storage-v6` có di chuyển từ khóa cũ (chỉ xóa khóa cũ sau khi ghi khóa mới thành công); `contractRevision` giữ nguyên giá trị cũ để các lượt đã lưu không bị coi là "bài đã đổi". |
| ac-3 | Sửa `text-current/80`, đổi hai thanh tiến trình từ `nav` sang `div role="group"`, tiêu đề tab khớp tên header, `tsconfig` ghi `strict: true`; mỗi mục có test. |

## Quyết định thiết kế

- `contractRevision` băm khóa `targetSeconds` cho giá trị `minSeconds` (giữ ngữ nghĩa cũ), kèm test với giá trị băm đã ghi trước khi đổi tên.
- Di chuyển khóa lưu nằm trong một wrapper của storage (`withLegacyKey`), không đổi định dạng dữ liệu bên trong.
- `CapabilityTask` tách thành: hook trạng thái (`useTaskState`), hook thao tác (`useTaskActions`), tính toán suy ra (`deriveTask`) và các view theo giai đoạn.
- Rủi ro: refactor lớn trên file nhiều test; giảm bằng cách chạy bộ test practice sau mỗi bước.
