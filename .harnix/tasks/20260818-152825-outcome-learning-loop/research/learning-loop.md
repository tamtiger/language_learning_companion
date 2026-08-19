# Research — Chọn first learning-loop increment

- Task ID: 20260818-152825-outcome-learning-loop
- Ngày nghiên cứu: 2026-08-18
- Material unknown: First increment nên là spoken Daily Standup performance loop có record/playback, self-rubric và task repetition, hay tiếp tục mở rộng pronunciation/recognition content để đạt time-to-capability nhanh hơn?

## Repository evidence

- Repository chỉ có sáu lesson pronunciation B1.
- Lesson schema v1 chỉ biểu diễn objectives, vocabulary, expressions, reading và recognition exercises.
- Completion dựa trên quiz; không có spoken output, retry, transfer hoặc delayed evidence.
- Lesson 06 Markdown khuyên recording/self-compare nhưng JSON player không biểu diễn workflow này.
- Sáu mục tiêu người dùng đều yêu cầu performance trong workplace, technical reading, meeting, explanation, interview hoặc English-first learning.

## Nguồn và facts

### CEFR Companion Volume 2020

Nguồn: Council of Europe, CEFR Companion Volume, truy cập 2026-08-18.
https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions

Fact: CEFR Companion Volume mở rộng descriptor cho interaction, online interaction và mediation, đồng thời đặt người học trong action-oriented approach như một social agent.

Giới hạn: CEFR là framework mô tả năng lực, không chứng minh riêng một UI hoặc exercise format tạo learning gain.

### Task-Based Language Teaching

Nguồn: Bryfonski & McKay, TBLT implementation and evaluation: A meta-analysis, Language Teaching Research, DOI 10.1177/1362168817744389, truy cập 2026-08-18.
https://doi.org/10.1177/1362168817744389

Fact: Meta-analysis tổng hợp 52 study báo cáo overall positive strong effect cho TBLT trên nhiều learning outcome; needs analysis và implementation cycle là moderator được xem xét. TBLT nhấn mạnh interaction trong authentic task thay cho grammar-translation hoặc presentation-practice-production thuần túy.

Giới hạn: Study tổng hợp nhiều population/context; effect size không thể chuyển thẳng thành dự báo định lượng cho Vietnamese Software Engineer hoặc một lesson đơn lẻ.

### Workplace communication của kỹ sư

Nguồn: Kassim & Ali, English communicative events and skills needed at the workplace, English for Specific Purposes, DOI 10.1016/j.esp.2009.10.002, truy cập 2026-08-18.
https://doi.org/10.1016/j.esp.2009.10.002

Fact: Needs analysis với 65 engineer tại 10 multinational chemical company nhấn mạnh oral communication; các event quan trọng gồm teleconference, networking để xin tư vấn, và trình bày ý tưởng/chiến lược thay thế. Tác giả khuyến nghị dùng workplace scenario làm nền cho activity.

Nguồn bổ sung: Kaewpet, Communication needs of Thai civil engineering students, DOI 10.1016/j.esp.2009.05.002, truy cập 2026-08-18.
https://doi.org/10.1016/j.esp.2009.05.002

Fact: Needs analysis với 25 stakeholder chọn talking about daily tasks and duties, reading textbooks/manuals và writing progress reports là communicative event cần đưa vào course.

Giới hạn: Hai study không tập trung riêng Software Engineer và không chứng minh Daily Standup là task tối ưu duy nhất. Daily Standup là project inference từ daily tasks, progress reporting và meeting goals.

### Task repetition và spacing

Nguồn: Kakitani và cộng sự, Massed Task Repetition Is a Double-Edged Sword for Fluency Development, Studies in Second Language Acquisition, DOI 10.1017/S0272263121000358, truy cập 2026-08-18.
https://doi.org/10.1017/S0272263121000358

Fact: Task repetition có vai trò trong fluency practice, nhưng immediate massed repetition tạo pattern lợi ích/trade-off khác nhau giữa breakdown, speed và repair fluency; study không tìm thấy significant schedule effect ở delayed posttest một tuần.

Giới hạn: Không được suy luận hai attempt liên tiếp tự động tạo retention. First slice cần được xem là formative practice infrastructure; delayed revisit/transfer phải được đo ở follow-up.

### Self-assessment

Nguồn: Winke, Zhang & Pierce, A closer look at a marginalized test method: Self-assessment as a measure of speaking proficiency, Studies in Second Language Acquisition, DOI 10.1017/S0272263122000079, truy cập 2026-08-18.
https://doi.org/10.1017/S0272263122000079

Fact: Study với 807 L2-Spanish learner tìm thấy quan hệ đáng kể giữa một computer-adaptive speaking self-assessment và OPIc; tác giả xem self-assessment phù hợp cho low-stakes measurement và learner agency.

Giới hạn: Instrument, target language và population khác dự án; self-rubric đơn giản không phải proficiency certification và không thay thế external/human assessment.

### MediaRecorder

Nguồn: MDN Web Docs, MediaRecorder và getUserMedia, truy cập 2026-08-18.
https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

Fact: MediaRecorder cung cấp browser recording từ MediaStream. getUserMedia yêu cầu secure context và user permission; navigator.mediaDevices có thể không tồn tại trong unsupported/insecure context.

Giới hạn: Browser/device/permission vẫn khác nhau; feature detection và fallback là contract bắt buộc.

## Inferences của Harnix

- Daily Standup là vertical slice tốt vì chạm trực tiếp speaking, meeting, progress reporting và technical explanation, đồng thời đủ nhỏ để tạo reusable performanceTask contract.
- Record/playback local là cơ chế privacy-preserving, dependency-free để người học quan sát output của mình; đây là engineering/product inference, không phải kết luận rằng recording tự nó tạo proficiency gain.
- Self-rubric nên dùng formative low-stakes để hướng noticing và retry, không dùng làm chứng chỉ hoặc điểm CEFR khách quan.
- Attempt thứ hai nên đổi scenario bằng transferPrompt thay vì chỉ lặp nguyên văn. Tuy nhiên delayed transfer ngoài session vẫn cần một increment sau hoặc pilot riêng.
- Mở rộng thêm recognition/pronunciation trước khi có output loop sẽ tiếp tục tối ưu proxy metric, nên có expected impact thấp hơn đối với sáu outcome.

## Decision

Chọn spoken Daily Standup performance loop làm first increment. Giữ plan hiện tại: schema v2 song song v1; attempt trước model; local record/playback với timer fallback; self-rubric; retry bằng transfer scenario; persist metadata, không media.

Không thêm AI scoring trong increment đầu vì chưa cần để chứng minh vòng lặp, tạo thêm privacy/cost/validation risk và không giải quyết contract output cơ bản.

## Impact lên PRD và plan

- PRD contract được xác nhận, không cần đổi acceptance criteria.
- S3 phải bảo đảm Daily Standup là workplace task chứ không chỉ pronunciation drill.
- S5 phải feature-detect MediaRecorder/getUserMedia và cung cấp fallback.
- AC-5 chỉ chứng minh completion của formative loop, không được diễn giải là delayed retention.
- Follow-up trigger: sau khi vertical slice chạy được, pilot delayed transfer 2–7 ngày hoặc tạo due-review mechanism trước khi tuyên bố retention gain.

## Remaining uncertainty

- Chưa có dữ liệu trực tiếp từ Vietnamese Software Engineer dùng sản phẩm này.
- Chưa biết self-rubric item nào có inter-rater alignment tốt trong bối cảnh Daily Standup.
- Chưa biết tỷ lệ browser/permission failure ở target users.
- Những unknown này không chặn first increment vì design có fallback, low-stakes interpretation và acceptance test; chúng trở thành đo lường/pilot sau vertical slice.

## Stopping condition result

Đã đạt. Nguồn bổ sung khó có khả năng đổi lựa chọn giữa authentic spoken task và tiếp tục recognition-only. Bằng chứng đủ để chọn first increment, đồng thời giới hạn rõ những claim chưa được chứng minh.
