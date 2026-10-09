# Product — English Capability Engine for Software Engineers

## Product outcome

Ứng dụng giúp Software Engineer Việt Nam rút ngắn **time-to-capability**: từ lần baseline đầu tiên đến khi thực hiện độc lập một nhiệm vụ công việc bằng tiếng Anh và transfer được sang tình huống mới.

Sáu outcome tối cao:

1. Giao tiếp tiếng Anh tự tin trong công việc.
2. Đọc tài liệu kỹ thuật mà không cần bản dịch.
3. Tham gia họp với đồng nghiệp quốc tế.
4. Giải thích ý tưởng kỹ thuật bằng tiếng Anh.
5. Phỏng vấn và làm việc tại công ty nước ngoài.
6. Học công nghệ mới hoàn toàn bằng tiếng Anh.

Ứng dụng là **capability-first**, không phải thư viện bài đọc hoặc quiz. Mỗi mission chạy learning loop: baseline → input → auto-check → performance → self-feedback → retry → transfer → delayed review.

## Người dùng và công việc cần làm

Người dùng chính là lập trình viên Việt Nam tự học, có ít thời gian và cần dùng tiếng Anh ngay trong standup, issue update, đọc docs, giải thích trade-off, phỏng vấn và học API/framework mới.

Một phiên học tốt phải:

- bắt đầu bằng nhiệm vụ nghề nghiệp rõ ràng;
- thấy trước hợp đồng đầu ra gồm timebox, độ dài mục tiêu và các thành phần bắt buộc;
- tạo spoken hoặc written output trong timebox;
- cho người học tự đối chiếu rubric có cấu trúc;
- khi rubric còn gap, chọn đúng một `retry focus` rồi chấm lại toàn bộ rubric sau retry;
- yêu cầu retry và transfer, không hoàn thành chỉ vì trả lời quiz;
- quay lại đúng practice đến hạn;
- cho thấy evidence theo capability thay vì một điểm trình độ mơ hồ.

## North-star và evidence

North-star: thời gian đến transfer attempt đầu tiên đạt toàn bộ rubric trong điều kiện độc lập đã khai báo.

Một `qualifying transfer` phải là transfer đã hoàn tất, có rubric không rỗng với mọi
criterion `met`, đồng thời không dùng tiếng Việt, bản dịch, model answer, không
vượt `maxHints`, time limit và min/max output do task khai báo.
Transfer chưa đạt vẫn hoàn tất mission và đi vào delayed review, nhưng Progress phân
biệt rõ transfer attempt với qualifying transfer thay vì suy diễn mastery.

Evidence hiển thị:

- baseline, transfer và review attempts;
- rubric criterion `met/not-met/not-rated`;
- rubric criterion được chọn làm retry focus và rubric chấm lại sau retry;
- independence signals: dùng tiếng Việt/bản dịch/model answer, số hint, preparation time;
- duration đo thật, word count cho written output và lý do transfer chưa qualifying;
- lần thực hành gần nhất và lần review kế tiếp.
- với hai spoken pilot: perception pre/post counts, số bước training/shadowing,
  listen-back, cue-to-speech latency, interaction turns và cờ audio variability.

Completion count chỉ là metadata phụ. App không suy diễn proficiency score khi không có human/validated assessment.

## Offline-first và privacy

- Toàn bộ learning flow chạy local-only trong browser.
- Không account, cloud sync, server analytics, AI scoring hoặc paid API.
- Audio, written response, transcript và free-text note chỉ sống trong session; không persist và không xuất backup.
- Progress backup chỉ chứa allowlisted metadata, được validate trước khi import.
- Media permission chỉ được hỏi sau thao tác rõ ràng của người dùng và luôn có timer-only fallback.
- Model audio ưu tiên nguồn đóng gói có provenance; pilot hiện dùng speech
  synthesis tại thiết bị, được gắn nhãn rõ và không gửi text ra dịch vụ của app.

## Scope hiện hành

- Mười hai mission executable, hai mission cho mỗi outcome.
- Mission `workplace-issue-update-b1` là pilot realism đầu tiên: baseline,
  transfer và review có evidence packet riêng để người học tổng hợp fact,
  uncertainty, impact, owner và request thay vì phải tự bịa dữ kiện.
- Sáu pronunciation lesson schema v1 tiếp tục chạy qua content normalization như
  bài knowledge/reference; Daily Standup đã được migrate sang spoken v3.
- Pronunciation completion yêu cầu mọi auto-check đúng; restart xóa toàn bộ exercise
  progress. Kết quả này không đánh giá spoken production, accent accuracy hoặc efficacy.
- Cả 6 spoken missions chạy chuỗi perception → cue theo lỗi diagnostic →
  functional chunks → guided shadowing/delayed imitation/variation → listen-back
  → scripted clarification/interruption/repair → retry/transfer/review.
- Bốn mission đọc docs/log thuộc `technical-reading` và `technology-learning`
  chạy `ReadingLadderV1`: read once rồi ẩn source → trích action/constraint/evidence
  → explain/apply → unseen transfer → delayed retrieval bằng source mới.
- Model audio cho chọn 0.85×/1×/1.15× và hiển thị requested locale. Đây là
  synthetic device voice exposure, không phải human accent sample hoặc bằng chứng
  người học đã nghe hiểu accent quốc tế.
- Pronunciation trong capability loop chỉ dạy tối đa hai cue làm thay đổi khả
  năng nghe hiểu hoặc ý nghĩa; IPA hỗ trợ cue, không phải syllabus bắt buộc độc lập.
- Schema v3 là authoring contract mới; JSON dưới `content/**/*.json` là executable source of truth.
- Mọi source artifact được phân loại: source-backed v3 resolve provenance thật,
  còn scenario độc lập ghi rõ synthetic/non-production. Standard không bảo chứng
  endpoint, metric, command hoặc incident hư cấu.
- Markdown curriculum legacy đã được loại bỏ; curriculum executable chỉ nằm trong `content/**/*.json`.

Các pilot chỉ xác nhận content contract và learning flow có thể chạy với evidence
theo từng phase. Chưa có learner study hoặc listener calibration nên không được
suy diễn rằng app đã cải thiện phát âm, phản xạ hay hiệu quả học tập.

## Rollout gate P0 → P1 → P2

- **P0:** hai spoken pilot, synthetic content, local TTS và process
  metadata; gate là usability/flow/privacy, không phải efficacy.
- **P1:** 6 spoken missions có context/interaction đa dạng; cue chỉ
  dựa trên lỗi pre/post diagnostic trong phiên. Listener protocol ghi
  `evidence observed`, chưa có listener result hoặc efficacy claim.
- **P2 (hiện tại):** 4 technical reading missions có read-once/extract/apply và
  delayed unseen source; TTS có tốc độ điều chỉnh cùng requested locale trung thực.
  Study protocol đã decision-complete nhưng chưa có participant data; chỉ human
  calibration mới có thể hỗ trợ claim về intelligibility hoặc transfer.

Rollback theo content flag: bỏ `learningLoop` khỏi spoken task sẽ trả mission về
capability flow chuẩn mà không làm mất progress V5.

## Non-goals

- Gamification là mục tiêu chính.
- Dạy toàn bộ general English hoặc sản xuất hàng chục lesson trong một increment.
- Upload dữ liệu học tập, thu âm hoặc response ra dịch vụ bên thứ ba.
- Tự động tuyên bố người học đạt B1/B2/C1 từ self-rubric.

## Source of truth

- `PRODUCT.md`: outcome, privacy, product behavior và success evidence.
- `CONTENT.md`: schema v3, content invariants và authoring rules.
- `ARCHITECTURE.md`: runtime boundaries, storage và verification.
- `START_HERE.md`: hành trình người học.
- `README.md` (root): developer quickstart.

Khi tài liệu mâu thuẫn, owner file theo lĩnh vực ở trên thắng; prompts phải dẫn chiếu owner docs thay vì sao chép contract.
