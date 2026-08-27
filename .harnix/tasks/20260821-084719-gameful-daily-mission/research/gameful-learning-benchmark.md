# Research: gameful learning benchmark

Task ID: `20260821-084719-gameful-daily-mission`

Ngày truy cập: 2026-08-21.

## Câu hỏi quyết định

Mechanic nào từ các app học ngôn ngữ tạo động lực bắt đầu và tiếp tục tốt nhất cho Today, trong khi mọi progress vẫn phản ánh baseline, retry, transfer và review thật?

## Evidence từ repository

- `PRODUCT.md` đặt capability evidence và qualifying transfer làm source of truth; streak/completion chỉ có thể là metadata phụ.
- `buildTodayQueue` đã có thứ tự `review → resume → baseline → new`.
- `LessonProgress` đã lưu `recentAttempts`, `activePhase`, `transferCompleted` và review schedule; có thể suy ra tiến trình mission mà không thêm storage schema.
- Today hiện có recommendation chính và sáu job intent, nhưng recommendation chưa cho thấy hành trình đã đi tới đâu hoặc cảm giác hoàn tất một mission.

## Benchmark

| App | Nguồn chính thức | Pattern quan sát được | Điều đáng học | Giới hạn / rủi ro |
|---|---|---|---|---|
| Duolingo | https://blog.duolingo.com/time-spent-learning-well/ | Daily Quests đi từ dễ tới khó và ưu tiên hành vi tiến dọc learning path; Monthly Challenge chuyển từ XP sang quest để giảm XP grinding. | Quest phải gắn với hành vi học có giá trị, không phải điểm trừu tượng. | Bài viết là dữ liệu nội bộ của Duolingo; không chứng minh cùng effect cho persona Software Engineer Việt Nam. |
| ELSA Speak | https://elsaspeak.com/en/news-events/article | Today đưa ba task ngắn được đề xuất lên home, có goal-complete celebration, streak và reward. | Daily plan hữu hạn và completion feedback làm đích đến dễ hiểu. | Nguồn là product announcement/marketing; AI proficiency và reward economy không phù hợp local-only app này. |
| Speak | https://help.speak.com/en/articles/11430473-explore-your-new-home-screen | Home làm nổi bật next lesson bằng path; node đổi trạng thái bằng fill/checkmark và vẫn cho chọn practice khác. | Một next step nổi bật, progress trực quan và lựa chọn phụ giữ autonomy. | Course path dài không phù hợp job-first Today; animation không thể là tín hiệu duy nhất. |
| Busuu | https://help.busuu.com/hc/en-us/articles/16097312171153-What-s-a-Study-Plan-How-do-I-make-one và https://help.busuu.com/hc/en-gb/articles/16497935071633-What-s-a-streak | Study Plan hỏi lý do học, target, lịch và thời lượng; streak tăng theo ngày active và reset khi bỏ ngày. | Gắn session với lý do thật và timebox giúp mục tiêu có nghĩa. | Setup plan dài và streak reset có thể tạo áp lực; app này không cần account/schedule. |
| Babbel | https://support.babbel.com/hc/en-us/articles/17020978582162-Streak | Mọi learning activity có thể giữ streak; có hai streak freeze mỗi tuần để giảm mất mát khi nghỉ. | Nếu dùng continuity mechanic phải có recovery và không phạt lịch sống thực tế. | Streak cần date semantics, migration và có thể chuyển động lực sang giữ chuỗi. |
| Memrise | https://explore.memrise.com/help và https://explore.memrise.com/new-experience | My Activities hiển thị words/reviews/videos/conversations thay vì pressure từ streak/points; bản experience mới nói points không giúp người học nói. | Hiển thị hành vi học thật, guilt-free, là alternative mạnh hơn XP. | Các metric của Memrise khác evidence contract của dự án; không sao chép count đơn giản. |

Nguồn nghiên cứu bổ sung: meta-analysis 35 intervention với 2.500 người học báo cáo effect nhỏ lên intrinsic motivation và ảnh hưởng tối thiểu lên perceived competence; autonomy/relatedness có tín hiệu tích cực hơn: https://link.springer.com/article/10.1007/s11423-023-10337-7. Population và intervention đa dạng nên không dùng để dự đoán effect size cho app này.

## Fact

1. Duolingo công khai rằng quest được định hướng tới activity tiến dọc learning path và XP challenge có thể bị “game”.
2. Speak dùng visual path với trạng thái next/completed, nhưng vẫn giữ quyền chọn bài.
3. ELSA đưa daily tasks ngắn và celebration lên Today.
4. Busuu/Babbel/Speak đều dùng streak; Babbel và Busuu phải thêm cơ chế bảo vệ để giảm hậu quả khi bỏ ngày.
5. Memrise hiện mô tả progress theo learning activities và chủ động tránh áp lực streak/points.
6. Repo đã có đủ attempt/phase evidence để dựng progress mà không tạo currency hoặc storage field mới.
7. Meta-analysis không cho phép kết luận gamification tự động nâng competence; effect motivation trung bình nhỏ và không đồng nhất.

## Inference

- “Daily quest” phù hợp hơn XP vì có thể buộc reward đi cùng baseline/retry/transfer thật.
- Ba checkpoint là đủ để tạo cảm giác tiến triển nhưng không phơi toàn bộ phase/schema nội bộ.
- Giữ sáu job intent bên dưới recommendation bảo toàn autonomy, một yếu tố nghiên cứu cho thấy có liên hệ với intrinsic motivation.
- Reward tốt nhất trong sản phẩm này là một outcome thật: hoàn tất transfer sẽ lên lịch review; không cần gem, badge hoặc level giả.
- Celebration nên nhẹ, không phụ thuộc animation/sound, vì app được dùng tại nơi làm việc và accessibility cần trạng thái tĩnh rõ.

## Quyết định

Implement **Daily Mission: 3 chặng evidence-linked** trên recommendation chính của Today.

### Contract UX

- Tên: `Nhiệm vụ hôm nay`.
- Goal: title và outcome công việc của lesson được queue ưu tiên.
- Ba chặng cho baseline/resume/new:
  1. `Thử sức` hoàn tất khi có completed baseline attempt.
  2. `Luyện & sửa` hoàn tất khi có completed retry attempt.
  3. `Vận dụng mới` hoàn tất khi `transferCompleted`.
- Review đến hạn dùng một chặng `Ôn lại`; không giả lập lại ba chặng đã hoàn thành.
- Progress dùng semantic `progress`/accessible label và text `x/3 chặng`.
- CTA vẫn là action hiện hành và mở đúng lesson do queue quyết định.
- “Đích đến” mô tả reward thật: hoàn tất transfer để mở lịch ôn đúng lúc.
- Khi Today không còn actionable item, hiển thị completion celebration tĩnh và cho phép chọn job intent để luyện lại.
- Sáu job intent vẫn khả dụng, không khóa người dùng vào quest.

### Success target

- First viewport trả lời được goal, current progress, next action và outcome/reward.
- Không thêm action trước khi vào lesson.
- Queue priority và lesson ID tiếp tục content-driven.
- Không migration storage; progress chỉ suy ra từ `LessonProgress`.
- Keyboard, 390x844 và 1440x900 pass; animation không phải tín hiệu bắt buộc.

## Pattern không chọn

- **XP/gem/currency:** dễ tách khỏi output có ý nghĩa và thêm economy không phục vụ capability.
- **Streak ngày:** cần date/migration/recovery semantics, có nguy cơ guilt/loss aversion; chưa có evidence người dùng muốn.
- **Leaderboard/league:** xung đột local-only, cần social identity và có thể ưu tiên volume thay vì chất lượng.
- **Lives/energy:** chặn practice sau lỗi, ngược retry loop.
- **Badge/proficiency level tự động:** có thể bị hiểu nhầm thành đánh giá năng lực dù chỉ dựa trên self-rubric.
- **Course-map dài:** giảm autonomy của job-first entry và khiến người học phải scroll qua curriculum.

## Giới hạn

- Chưa quan sát trực tiếp app sau paywall hoặc bằng signed-in account; benchmark dựa vào help center/product pages chính thức.
- Nguồn vendor có self-reporting bias; không dùng claim marketing làm evidence hiệu quả.
- Chưa có usability test với learner thật, retention data hoặc motivation survey.
- Implementation chỉ kiểm chứng behavior, accessibility và synthetic usability; không chứng minh tăng hứng thú hay learning efficacy.
- Nếu learner study cho thấy pressure hoặc confusion, trigger follow-up là cho phép thu gọn/ẩn quest framing nhưng giữ evidence progress.


