# Listener/expert evaluation protocol

## Mục đích và giới hạn

Protocol này kiểm tra liệu người nghe có khôi phục đúng intent và critical facts từ
spoken transfer/review hay không. Đây là observer evidence cho feasibility, không
phải chứng nhận mastery, pronunciation accuracy hay causal efficacy của app.

## Consent và dữ liệu

- Có consent riêng của learner và listener trước khi ghi/phát audio.
- App vẫn local-only và không thu participant data. Audio, transcript và listener
  notes không được nhập vào progress/backup; người vận hành nghiên cứu sở hữu việc
  lưu trữ, retention và xóa dữ liệu ngoài app.
- Không thu tên, công ty, accent label hoặc demographic nếu chưa có mục đích và
  consent rõ ràng.

## Thiết kế blinded

Mỗi sample dùng mã ngẫu nhiên. Hai listener không biết learner, mission phase
(`baseline`, `transfer`, `D7`) hoặc sample còn lại của cùng người. Thứ tự sample
được đảo độc lập. Script/prompt/model không đưa cho listener trước khi rating.

## Observer form

Mỗi listener ghi độc lập:

1. `intent_recovered`: yes/no — hành động hoặc quyết định chính có đúng không.
2. `critical_facts_recovered`: số facts đúng trên danh sách định trước của scenario.
3. `comprehensibility`: 1–5, từ “rất khó, phải đoán” tới “dễ hiểu ngay”.
4. `interaction_success`: yes/no — câu trả lời xử lý đúng clarification,
   interruption hoặc repair prompt.
5. `template_leak`: yes/no — output lặp model nhưng không khớp facts mới.

Không có trường “native accent”, “IPA score” hoặc “mastery”.

## Calibration và agreement

Hai listener chấm 5 sample practice, thảo luận definition nhưng không sửa rating
production. Báo cáo raw agreement cho yes/no và weighted agreement cho thang
comprehensibility. Nếu agreement intent dưới 80%, dừng diễn giải outcome, sửa
scenario key/rubric rồi calibrate lại; không lấy trung bình để che disagreement.

## Preregister và primary outcome

Trước khi recruit, preregister version content, hypotheses, primary outcome,
secondary outcomes, analysis unit và stopping rule. Primary outcome cho spoken là
listener recovery của intent + critical facts ở unseen transfer; cho reading là
action/constraint/evidence accuracy ở unseen source và delayed retrieval. Duration,
self-confidence và completion chỉ là process/secondary evidence.

## Sampling và power rationale

Chọn sample theo power analysis cho primary outcome và within-person contrast đã
định trước, không dùng con số thuận tiện như bằng chứng efficacy. Ghi rõ target
persona, CEFR band, thiết bị, browser và mức quen thuộc domain. Pilot nhỏ chỉ dùng
để phát hiện usability/failure mode; study lớn hơn cần rationale cho attrition và
uncertainty interval trước khi thu dữ liệu.

## Exclusion, subgroup và fairness

- Freeze exclusion rules trước session: consent thiếu, corrupted/missing technical
  sample, protocol deviation và incomplete paired phase được báo riêng.
- Missing data không được tự động chuyển thành learning failure hoặc âm thầm xóa.
- Subgroup analysis theo CEFR/device/browser/domain familiarity chỉ exploratory
  nếu study không đủ power; không suy diễn accent, quốc tịch hoặc năng lực từ voice.
- Fairness audit so sánh technical failure, completion và listener disagreement
  giữa subgroup; không dùng native-accent target.

## Stopping rule và báo cáo

Dừng hoặc pause nếu có privacy leak, consent breach, app-origin data upload, hoặc
listener agreement dưới threshold đã preregister. Báo effect estimate, uncertainty,
missing/exclusion counts và adverse usability evidence. Repository hiện chưa có dữ
liệu participant; không điền result placeholder và không gọi functional QA là efficacy.

## Missing data và diễn giải

- Microphone/audio failure là missing technical sample, không tính fail học tập.
- Opt-out, bỏ dở và trợ giúp ngoài contract được báo cáo riêng.
- Chỉ so phase khi cùng learner có sample hợp lệ và listener vẫn blinded.
- Báo cáo completion, median duration và evidence observed trước; mọi claim về
  efficacy cần study được phê duyệt, sample phù hợp và uncertainty rõ ràng.

## Handoff checklist

- Freeze scenario fact key và rating definitions trước session.
- Kiểm tra không có response/audio trong localStorage hoặc backup.
- Export participant data chỉ bằng quy trình nghiên cứu có consent, không qua app.
- Ghi version content, browser/audio fallback và mọi deviation.
