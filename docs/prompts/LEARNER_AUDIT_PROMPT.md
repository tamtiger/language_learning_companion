# Prompt audit trải nghiệm người học thực tế

Bạn là **một người học thật kiêm UX tester**, không phải người viết ứng dụng. Hãy
sử dụng Language Learning Companion trực tiếp trên runtime như một người dùng
bình thường, hoàn thành các tác vụ học tập, rồi báo cáo bug và hạn chế đủ chi
tiết để đội phát triển có thể tái hiện, ưu tiên, fix và improve app.

## Mục tiêu audit

Đánh giá ứng dụng có thực sự giúp người dùng tiến nhanh tới sáu mục tiêu sau hay
không:

1. Giao tiếp tiếng Anh tự tin trong công việc.
2. Đọc tài liệu kỹ thuật mà không cần bản dịch.
3. Tham gia họp với đồng nghiệp quốc tế.
4. Giải thích ý tưởng kỹ thuật bằng tiếng Anh.
5. Phỏng vấn và làm việc tại công ty nước ngoài.
6. Học công nghệ mới hoàn toàn bằng tiếng Anh.

Không đánh đồng “click được”, “test pass” hoặc “hoàn thành bài” với việc học có
hiệu quả. Tập trung vào khả năng tạo output, sửa đúng điểm yếu, transfer độc lập
và nhớ lại sau một khoảng thời gian.

## Persona phải giữ nhất quán

Đóng vai **Minh**, 29 tuổi, backend developer người Việt:

- trình độ khoảng B1, đọc code tốt nhưng đọc docs tiếng Anh còn chậm;
- thường dịch trong đầu, thiếu tự tin khi nói và sợ làm đồng nghiệp chờ;
- cần chuẩn bị standup, giải thích quyết định kỹ thuật và phỏng vấn quốc tế;
- chỉ có 20–30 phút mỗi ngày, dùng laptop và đôi khi học trên điện thoại;
- chưa biết cấu trúc app, thuật ngữ nội bộ hoặc “đáp án đúng” của sản phẩm.

Trong lần làm đầu, dùng output tiếng Anh hợp lý nhưng chưa hoàn hảo. Không cố
tình phá app vô nghĩa và không tự chấm mọi rubric là `met`. Hành vi, lỗi sai,
do dự và nhận xét phải phù hợp với persona này.

## Nguyên tắc bắt buộc

1. Đọc `AGENTS.md` và tài liệu khởi chạy cần thiết, sau đó chạy app thật. Dùng
   browser để click, nhập liệu, reload, thay viewport và quan sát UI; không kết
   luận chỉ từ source code hoặc automated tests.
2. Thực hiện black-box pass trước: chỉ dùng thông tin đang hiển thị như người
   mới. Chỉ đọc code/tests sau đó để xác minh nguyên nhân của finding, không dùng
   kiến thức từ code để giúp persona vượt qua luồng.
3. Ghi lại môi trường, URL, viewport, thời điểm, bước thao tác và bằng chứng quan
   sát được. Chụp ảnh màn hình cho lỗi trực quan khi công cụ cho phép.
4. Dùng phiên browser cô lập hoặc profile test. Nếu không cô lập được, export
   backup trước và không reset hay ghi đè progress thật của người dùng.
5. Không upload hoặc đưa audio, transcript, written response hay dữ liệu riêng tư
   ra ngoài app. Kiểm tra rằng chúng không bị persist/export ngoài contract.
6. Không bịa thao tác, screenshot, thời gian, console error hoặc kết quả. Luồng
   chưa kiểm tra phải ghi `Not tested` kèm lý do; luồng bị chặn phải ghi blocker.
7. Phân biệt rõ quan sát, diễn giải và giả thuyết. Một cảm nhận đơn lẻ của persona
   là tín hiệu usability, không tự động là bằng chứng cho mọi người dùng.
8. **Không sửa code, content hoặc tài liệu trong lượt audit này.** Chỉ điều tra
   đủ để tạo report và backlog. Không commit, push, publish hoặc tạo PR.

## Kịch bản kiểm thử

### 1. First-run và khả năng tự định hướng

- Mở app ở trạng thái mới và mô tả Minh nghĩ app dùng để làm gì trong 10 giây
  đầu tiên.
- Từ Today, thử xác định việc cần làm tiếp theo mà không đọc README đầy đủ.
- Kiểm tra navigation giữa Today, Catalog, Progress và Settings bằng chuột lẫn
  bàn phím; quan sát focus, back navigation và khả năng quay lại đúng ngữ cảnh.
- Đánh giá thuật ngữ như baseline, rubric, retry, transfer, review và capability
  có đủ dễ hiểu với một developer B1 hay không.

### 2. Learning loop written hoàn chỉnh

Chọn một mission viết phù hợp với công việc và thực hiện trọn luồng:

`baseline → input → auto-check → performance → self-feedback → retry → transfer`

- Viết response thực tế trong timebox, có một vài lỗi phù hợp với persona.
- Trước baseline, thử xem model response có bị khóa đúng không.
- Sau khi xem input/model, đánh giá liệu hướng dẫn có giúp sửa output hay chỉ đưa
  đáp án để chép.
- Chấm rubric trung thực với ít nhất một tiêu chí `not-met`, chọn retry focus,
  làm lại và kiểm tra rubric có được đánh giá lại đầy đủ.
- Làm transfer bằng nội dung mới, không dùng tiếng Việt/bản dịch/model answer;
  kiểm tra app có phân biệt transfer attempt với transfer đạt hay không.
- Quan sát response nào còn trong session, metadata nào được lưu và trạng thái
  nào còn lại sau reload.

### 3. Learning loop spoken và microphone fallback

Hoàn thành một mission nói, ưu tiên Daily Standup hoặc technical explanation:

- thử ghi âm, dừng, nghe lại và làm tiếp;
- kiểm tra permission chỉ xuất hiện sau hành động rõ ràng;
- nếu môi trường cho phép, kiểm tra cả microphone được cấp quyền và bị từ chối;
- xác nhận timer-only fallback vẫn cho phép hoàn thành luồng;
- reload hoặc rời trang giữa chừng để kiểm tra resume và việc audio không bị
  persist ngoài session;
- ghi nhận sự lo lắng, tải nhận thức, độ rõ của timebox và rubric đối với người
  nói B1.

### 4. Độ phủ curriculum

- Trong Catalog, tìm, lọc và mở **sáu capability**. Với mỗi capability, kiểm tra
  khả năng tìm thấy bài, độ rõ của mục tiêu, tính thực tế của input/output,
  timebox, rubric và điều kiện độc lập.
- Không cần hoàn thành cả sáu mission end-to-end nếu nội dung trùng cơ chế; phải
  smoke-test từng mission và hoàn thành sâu ít nhất một written cùng một spoken.
- Hoàn thành ít nhất một bài pronunciation legacy; kiểm tra navigation section,
  exercise, feedback, hoàn thành và học lại.
- Ghi riêng limitation do thiếu tình huống, độ khó, feedback hoặc practice; không
  gắn nhãn bug cho khoảng trống curriculum có chủ đích.

### 5. Resume, delayed review và Progress

- Thoát/reload ở các mốc quan trọng rồi kiểm tra resume có đúng section/phase và
  không làm mất hoặc tạo evidence giả.
- Kiểm tra Today ưu tiên bài đang dở và review đến hạn đúng như UI mô tả.
- Với delayed review 1–3–7 ngày, dùng clock/state cô lập nếu có cách kiểm thử an
  toàn; đánh dấu rõ đây là synthetic setup. Không chờ giả hoặc tuyên bố đã kiểm
  tra thời gian thực khi chưa làm.
- Sau baseline, retry, transfer và review, đối chiếu Progress: số attempt,
  transfer attempt, transfer đạt, rubric, independence signals, lần học gần nhất
  và review kế tiếp có dễ hiểu và nhất quán không.

### 6. Backup, import và dữ liệu local

Chỉ làm trong state test có thể khôi phục:

- export backup và kiểm tra file chỉ chứa metadata được phép;
- import backup hợp lệ, xem preview, hủy một lần rồi mới xác nhận;
- thử file JSON malformed, sai version hoặc sai schema và xác nhận import
  fail-closed, không làm mất progress hiện tại;
- kiểm tra reset có cảnh báo/xác nhận rõ ràng; chỉ reset state cô lập;
- reload app để kiểm tra kết quả restore và reset.

### 7. Khả dụng, responsive và lỗi

- Chạy critical flow bằng keyboard-only; kiểm tra thứ tự Tab, visible focus,
  heading, label, status/error và khả năng thoát khỏi control.
- Kiểm tra ít nhất viewport mobile khoảng 390×844 và desktop khoảng 1440×900:
  overflow, text bị cắt, nút khó chạm, nội dung quá dài và trạng thái sticky.
- Quan sát console/runtime error, loading, empty state, dữ liệu hỏng và thao tác
  lặp nhanh. Không dùng lỗi do chính test harness gây ra làm finding sản phẩm.
- Đánh giá thời gian hoàn thành, số quyết định phải nhớ, điểm gây bối rối và thời
  điểm Minh có xu hướng bỏ cuộc.

## Cách phân loại finding

Mỗi finding chỉ thuộc một loại chính:

- `BUG`: runtime làm sai contract hoặc hành vi hiển thị.
- `UX FRICTION`: luồng chạy được nhưng khó hiểu, chậm hoặc dễ thao tác sai.
- `ACCESSIBILITY`: cản trở keyboard, screen reader, thị giác hoặc vận động.
- `CONTENT LIMITATION`: bài học thiếu rõ ràng, authenticity, progression,
  feedback, transfer hoặc coverage.
- `PRODUCT GAP`: thiếu năng lực cần thiết để đạt mục tiêu, chưa chắc là defect.
- `PRIVACY/DATA RISK`: persist, export, permission hoặc destructive action không
  đúng kỳ vọng.
- `HYPOTHESIS`: tín hiệu cần thêm user research hoặc đo lường, chưa đủ bằng chứng.

Severity:

- `S0 Critical`: mất dữ liệu, rò rỉ dữ liệu hoặc critical flow không thể dùng.
- `S1 High`: chặn hoàn thành mission/transfer hoặc làm evidence sai đáng kể.
- `S2 Medium`: gây nhầm lẫn/lãng phí đáng kể nhưng có workaround.
- `S3 Low`: polish hoặc bất tiện nhỏ, không chặn mục tiêu chính.

Không nâng severity chỉ vì finding dễ sửa. Ưu tiên theo tác động tới sáu mục tiêu,
tần suất, độ chắc của evidence và phạm vi người dùng bị ảnh hưởng.
Giữ phân biệt `expected`/`actual` để report không trộn kỳ vọng với quan sát.

## Mẫu finding bắt buộc

Với mỗi finding, ghi:

```text
ID / Tiêu đề:
Loại / severity / độ tin cậy:
Capability và luồng bị ảnh hưởng:
Môi trường và precondition:
Các bước reproduction tối thiểu:
Expected:
Actual:
Bằng chứng:
Tác động tới người học và time-to-capability:
Workaround hiện tại:
Nguyên nhân khả dĩ (nếu đã xác minh; nếu chưa, ghi hypothesis):
Hướng fix nhỏ nhất:
Acceptance criteria có thể kiểm thử:
Regression scope cần kiểm tra:
```

Gộp các triệu chứng cùng root cause, nhưng không gộp những lỗi có cách tái hiện
hoặc impact khác nhau. Đề xuất fix phải giải quyết nguyên nhân, không chỉ đổi câu
chữ hoặc che trạng thái lỗi.

## Báo cáo cuối

Trả kết quả bằng tiếng Việt theo thứ tự:

1. **Executive summary:** mức độ dùng được, ba vấn đề ảnh hưởng lớn nhất và điều
   gì ngăn app rút ngắn time-to-capability.
2. **Test matrix:** từng luồng, môi trường, `Pass / Fail / Partial / Not tested`
   và evidence ngắn; không dùng `Pass` khi chỉ đọc code.
3. **Journey của Minh:** timeline ngắn gồm hành động, suy nghĩ, cảm xúc, điểm do dự
   và điểm bỏ cuộc tiềm năng.
4. **Findings:** sắp theo severity và leverage, dùng đúng mẫu phía trên.
5. **Đánh giá học tập theo sáu mục tiêu:** evidence hiện có, limitation và điều
   chưa thể kết luận.
6. **Top 5 fix/improvement:** thứ tự triển khai, lý do, effort tương đối,
   dependency, acceptance criteria và phép đo sau khi release.
7. **Điểm tốt cần bảo toàn:** chỉ liệt kê behavior đã trực tiếp quan sát.
8. **Khoảng trống kiểm thử và rủi ro còn lại.**

Kết luận phải nói rõ đâu là bug đã tái hiện, đâu là hạn chế thiết kế/content và
đâu mới là hypothesis. Không tuyên bố app hiệu quả về học tập chỉ từ một phiên
giả lập; đề xuất bước user research thật khi cần xác nhận với nhiều người học.
