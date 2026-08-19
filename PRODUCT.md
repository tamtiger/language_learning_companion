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

Completion count và streak chỉ là metadata phụ. App không suy diễn proficiency score khi không có human/validated assessment.

## Offline-first và privacy

- Toàn bộ learning flow chạy local-only trong browser.
- Không account, cloud sync, server analytics, AI scoring hoặc paid API.
- Audio, written response, transcript và free-text note chỉ sống trong session; không persist và không xuất backup.
- Progress backup chỉ chứa allowlisted metadata, được validate trước khi import.
- Media permission chỉ được hỏi sau thao tác rõ ràng của người dùng và luôn có timer-only fallback.

## Scope hiện hành

- Mười hai mission executable, hai mission cho mỗi outcome.
- Mission `workplace-issue-update-b1` là pilot realism đầu tiên: baseline,
  transfer và review có evidence packet riêng để người học tổng hợp fact,
  uncertainty, impact, owner và request thay vì phải tự bịa dữ kiện.
- Sáu pronunciation lesson schema v1 và Daily Standup schema v2 tiếp tục chạy qua content normalization.
- Pronunciation completion yêu cầu mọi auto-check đúng; restart xóa toàn bộ exercise progress.
- Schema v3 là authoring contract mới; JSON dưới `content/**/*.json` là executable source of truth.
- Markdown curriculum legacy đã được loại bỏ; curriculum executable chỉ nằm trong `content/**/*.json`.

Pilot chỉ xác nhận content contract và learning flow có thể chạy với evidence theo
từng phase. Chưa có learner study nên không được suy diễn rằng pilot đã cải thiện
hiệu quả học tập; chỉ rollout sang mission khác sau khi có usability evidence và
attempt evidence từ người học mục tiêu.

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
- `README.md`: developer quickstart.

Khi tài liệu mâu thuẫn, owner file theo lĩnh vực ở trên thắng; prompts phải dẫn chiếu owner docs thay vì sao chép contract.
