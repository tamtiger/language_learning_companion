# Current feature audit

## Phạm vi và phương pháp

Audit ngày 2026-08-20 kết hợp hai lớp bằng chứng:

1. Black-box trên app thật tại desktop 1920×911 và mobile 390×844: Catalog, một lesson pronunciation, Daily Standup, một meeting mission, một technical-reading mission, Today và Progress.
2. Đối chiếu repository: content schema/normalization, 18 content JSON, `SectionRenderer`, `SpokenResponse`, `CapabilityTask`, progress domain và local storage.

Các quan sát UI được ghi là **Observed**; hành vi suy ra từ code được ghi là **Repository**; nhận định học tập là **Inference**. Audit giả lập kiểm tra tính dùng được và tính trung thực của phép đo, không chứng minh learning efficacy.

## Inventory hiện có

| Khu vực | Hiện trạng | Bằng chứng |
|---|---|---|
| pronunciation | 6 lesson schema v1; mỗi lesson có 2 từ, 1 expression, 3 quiz choice/matching/fill; có IPA ở từ và nút TTS từng từ | Observed + Repository |
| spoken workplace | Daily Standup schema v2 có input/model trước performance, recording hoặc timer-only, model sau attempt và self-rubric | Observed + Repository |
| capability missions | 11 task schema v3 cho meeting, technical explanation, interview, troubleshooting, technical-reading và workplace communication | Observed + Repository |
| learning loop | v3 có cold baseline, input/check, main performance, model-after-attempt, self-rubric, focused retry, transfer và delayed review | Observed + Repository |
| Today | ưu tiên review đến hạn rồi mới resume; tại thời điểm audit không có review đến hạn nên delayed flow chưa được kiểm chứng black-box | Observed + Repository |
| Progress | attempts và transfer attempts theo capability; không tạo mastery score mơ hồ | Observed + Repository |
| privacy | metadata tiến độ lưu local; learner text/audio không được persist | Repository |

Catalog hiện có tổng cộng 6 pronunciation lesson v1, Daily Standup v2 và 11 capability mission v3. Chỉ `workplace-issue-update-b1` khai báo đầy đủ `practiceContexts` cho baseline/transfer/review; 10 mission v3 còn lại dùng prompt biến thể nhưng không có context bank tách biệt.

## Flow audit

### 1. pronunciation

Flow “Trọng âm từ” hiển thị `architecture`, `repository`, IPA và phát âm từng từ bằng `SpeechSynthesisUtterance`. Knowledge check có 11 input nhưng không có model sentence audio, audio discrimination, microphone task, record/listen-back hay feedback về sản phẩm nói. Hoàn thành lesson chỉ chứng minh trả lời quiz, không chứng minh người học nghe ra hoặc phát âm dễ hiểu.

**Gap:** IPA hiện là ký hiệu tham khảo, không phải kỹ năng được gắn với nghe–nhận biết–sản xuất. TTS từng từ không đủ để học connected speech, sentence stress hoặc intelligibility trong câu công việc. Một full IPA course cũng chưa được evidence của app chứng minh là prerequisite cần thiết.

### 2. spoken Daily Standup

Input phase hiển thị language support và một đoạn standup mẫu đầy đủ trước main performance. Learner có thể record hoặc dùng timer-only; sau attempt mới thấy model response và self-rubric bốn mục. Không có targeted feedback, listen-back bắt buộc, listener check hay kiểm tra rằng câu nói thực sự chứa ý đã khai báo.

**Gap:** model-before-performance làm yếu retrieval trong main attempt; timer-only + self-rating chỉ là evidence tham gia, không phải evidence comprehensibility hay spontaneous retrieval.

### 3. meeting / technical explanation

Mission “Disagree and recap…” có cold spoken baseline đúng contract: chưa lộ model/source. Sau baseline, app đưa meeting note và một câu comprehension check; main performance là một monologue. Model chỉ xuất hiện sau attempt, self-rubric ba tiêu chí, learner chọn một focus để retry rồi làm unseen transfer.

Transfer đổi bối cảnh từ “skip load test” sang “skip security review”, nhưng vẫn cùng cấu trúc prompt. Không có interlocutor turn, follow-up question, clarification request, interruption, negotiation hoặc repair branch. Vì vậy flow luyện một lượt trình bày có cấu trúc hơn là tham gia meeting tương tác.

**Defect observed:** sau khi hoàn tất retry và chuyển sang transfer, child `SpokenResponse` vẫn hiển thị trạng thái timer cũ (“Đã hoàn tất… 2s”). Parent đã xóa `spokenSnapshot`, nên nút hoàn thành transfer vẫn bị khóa; không có bypass integrity, nhưng learner phải bấm “Làm lại” dù UI không giải thích. Repository cho thấy component không được remount/key theo phase.

### 4. technical-reading

Mission “Turn technical documentation into actions” yêu cầu ở baseline: “Read once and write actions from memory”, nhưng source document bị ẩn cho tới input phase. Learner không thể làm đúng chỉ dẫn. Sau baseline, input dùng runbook migration cache tương đối thực tế và có check về safety condition/action.

**Defect observed:** thứ tự source/baseline không nhất quán với instruction. **Inference:** sau khi sửa thứ tự, technical-reading action output là nền tốt hơn pronunciation và interaction, nên không phải bottleneck P0 lớn nhất.

### 5. retry, transfer và delayed review

- Focused retry buộc learner chọn tiêu chí chưa đạt và làm lại; đây là cơ chế tốt, nhưng kết quả vẫn phụ thuộc self-rubric.
- Transfer dùng surface variation và independence contract; qualification dựa trên self-rubric + độ dài/thời lượng + không dùng hỗ trợ. Đây là bằng chứng hành vi trung thực hơn điểm “mastery”, nhưng chưa đo listener outcome.
- Review policy tồn tại trong schema/progress, gồm lịch kiểu 1–3–7 ngày tùy content. Today ưu tiên review đến hạn. Không có item đến hạn trong phiên audit nên delayed review chỉ được xác nhận qua repository, chưa qua black-box.
- App chưa thu thập unseen transfer success rate và delayed retention theo cohort; vì vậy không được tuyên bố hiệu quả học tập.

### 6. desktop/mobile và vận hành

Catalog và lesson pronunciation không có horizontal overflow ở desktop 1920×911 hoặc mobile 390×844. Viewport mobile dùng được ở các màn đã kiểm tra; chưa phải full responsive regression suite. Console không có lỗi app-origin; chỉ có warning từ extension MetaMask ngoài phạm vi app.

## Gap map theo sáu mục tiêu

| Mục tiêu | Coverage hiện tại | Gap quyết định | Ưu tiên |
|---|---|---|---|
| Giao tiếp tự tin trong công việc | Standup và workplace missions có scaffold/retry | thiếu audio-first input, retrieval theo cue và feedback listener-oriented | P0 |
| Đọc tài liệu kỹ thuật không dịch | technical-reading mission có action output | baseline không có source; coverage chỉ vài scenario, chưa có progression/extensive reading | P1/P2 |
| Tham gia họp quốc tế | meeting missions có disagree/recap và transfer | single-turn monologue, không có follow-up/repair/turn-taking | P0 |
| Giải thích ý tưởng kỹ thuật | architecture/tradeoff missions có rubric | chưa luyện audience question, compression, analogy và repair theo lượt | P0/P1 |
| Phỏng vấn/làm việc công ty nước ngoài | behavioral/technical interview có missions | ít tình huống, self-rubric, không có adaptive follow-up | P1 |
| Học công nghệ mới bằng tiếng Anh | API/technology missions và technical reading | chưa có reading ladder, retrieval notes → explain → apply, nguồn đa dạng | P1/P2 |

## Bottleneck kết luận

**Fact:** app đã có khung output/retry/transfer, nhưng pronunciation chủ yếu là quiz + TTS từng từ và mission nói chủ yếu là monologue tự chấm.

**Inference:** bottleneck lớn nhất không phải thiếu thêm topic, cũng không phải thiếu full IPA course. Đó là thiếu cầu nối từ **nghe và nhận biết mẫu âm/chunk trong câu thật → truy xuất câu theo cue → phản hồi qua lượt → retry → unseen transfer → delayed retrieval**. P0 nên bổ sung cầu nối này vào các mission công việc hiện có, thay vì tạo một syllabus IPA độc lập hoặc thêm gamification.

## Hạn chế audit

- Một persona giả lập và một phiên QA không thay learner study.
- Không có delayed item đến hạn trong runtime; code path được xác nhận nhưng UX chưa quan sát.
- TTS phụ thuộc voice hệ điều hành/browser; audit không đánh giá độ tự nhiên của mọi môi trường.
- Mobile audit chỉ bao phủ Catalog và một pronunciation lesson.