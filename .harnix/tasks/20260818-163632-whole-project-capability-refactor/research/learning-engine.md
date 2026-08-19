# Research — Một generic learning loop có bao phủ sáu capability?

## Câu hỏi và stopping condition

Câu hỏi vật liệu: một task loop cấu hình hoàn toàn bằng content có đủ bao phủ sáu outcome hay cần sáu feature flow riêng?

Research dừng khi có đủ bằng chứng để quyết định: (1) abstraction theo communication mode, (2) vị trí của authentic task/feedback/repetition, (3) phần nào phải capability-specific, và (4) constraint kỹ thuật/a11y của player.

Ngày truy cập nguồn: 2026-08-18.

## Evidence trong repository

- Daily Standup v2 chứng minh spoken performance có thể nằm sau input/auto-check trong player hiện tại.
- Sáu pronunciation lesson v1 chứng minh schema/player đang tốt cho recognition nhưng không đo được output/transfer.
- Curriculum Markdown đã mô tả mission cho nhiều workflow, nhưng không executable và giả định feedback capabilities runtime chưa có.
- Monolithic player/store cho thấy thêm sáu flow độc lập sẽ nhân bản navigation, media, persistence và accessibility handling.

## Evidence bên ngoài

1. CEFR Companion Volume mở rộng descriptors cho reception, production, interaction và mediation; action-oriented approach xem người học là social agents làm task thực, không chỉ tích lũy language items. Nguồn: Council of Europe, CEFR Companion Volume và key concepts.
   - https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions
   - https://www.coe.int/en/web/common-european-framework-reference-languages/key-concepts
   - https://www.coe.int/en/web/common-european-framework-reference-languages/mediation-in-the-classroom
2. Needs analysis với engineers trong multinational companies nhấn mạnh oral communication và các situation như teleconference, networking/advice, trình bày idea/alternative; tác giả khuyến nghị workplace scenarios. Nguồn: Hafizoah Kassim & Fatimah Ali, *English communicative events and skills needed at the workplace*.
   - https://www.sciencedirect.com/science/article/abs/pii/S0889490609000635
3. Meta-analysis về corrective feedback trên 33 primary studies cho thấy hiệu ứng tổng thể mức trung bình và được duy trì theo thời gian. Điều này ủng hộ loop có feedback/retry, nhưng không chứng minh app được phép tự sinh AI score. Nguồn: Shaofeng Li, 2010.
   - https://onlinelibrary.wiley.com/doi/10.1111/j.1467-9922.2010.00561.x
4. Meta-analysis extensive reading gồm 34 studies/3.942 người học báo cáo improvement về reading proficiency. Điều này ủng hộ source reading thực và đủ dài; tuy nhiên đọc trong product phải nối sang action/output để đo capability nghề nghiệp. Nguồn: Takayuki Nakanishi, 2015.
   - https://onlinelibrary.wiley.com/doi/abs/10.1002/tesq.157
5. Nghiên cứu distributed practice về L2 speech fluency phân biệt same-task repetition với procedural/task-type repetition và mô tả vai trò của repetition trong proceduralization/automatization. Điều này phù hợp với retry cùng task rồi transfer cùng procedure, khác content. Nguồn: Joe Kakitani & Judit Kormos, Cambridge University Press, 2024.
   - https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/effects-of-distributed-practice-on-second-language-fluency-development/4F6787916C198376CAD222934D3B37E4
6. W3C yêu cầu keyboard focus order giữ meaning/operability, focus visible và status messages được assistive technology nhận biết mà không chiếm focus. Những behavior này phải nằm trong shared shell/orchestrator, không lặp theo capability.
   - https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html
   - https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
   - https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html

## Facts, inference và giới hạn

Facts từ nguồn: language activity có nhiều mode có thể kết hợp; workplace engineers cần authentic communication events; corrective feedback, reading và task repetition có evidence tích cực; accessibility behavior là cross-cutting UI contract.

Inference kiến trúc: sáu capability không tương ứng sáu renderer. Chúng là sáu tổ hợp của source/context + một trong hai output modes + rubric/independence/transfer riêng. Vì vậy một loop chuẩn với section registry và `spoken|written` performance renderer là abstraction nhỏ nhất đủ dùng.

Inference sản phẩm: retry nên giữ task/context để giảm tải, transfer nên đổi content nhưng giữ procedure. Delayed review nên là data-driven schedule. `[1,3,7]` là heuristic product v1, không được trình bày như interval tối ưu được các nghiên cứu trên xác nhận.

Giới hạn: research không chứng minh rubric tự đánh giá tương đương human/AI rating, không cung cấp ngưỡng universal cho fluency/proficiency và không xác định lịch spacing tối ưu cho từng learner. Vì thế app lưu observed evidence và explicit rubric state, không suy diễn proficiency score.

## Kết luận và tác động

Chọn generic learning loop + two performance renderers. Capability-specific knowledge chỉ nằm trong JSON contract. Reading và learning-technology không cần engine riêng: chúng dùng source sections + written action/summary/application output. Meetings/explanation/interview dùng spoken renderer với prompt/rubric khác nhau.

Tác động lên plan:

- Schema v3 cần section union, generalized performance task và content-owned review policy.
- Domain layer cần phase machine, completion/transfer rules và deterministic scheduler.
- UI phải tách orchestration khỏi spoken/written/media renderers.
- Sáu mission là acceptance fixtures chứng minh coverage, không phải sáu code paths.
- Progress chỉ lưu metadata/rubric/independence; không AI score, audio hoặc response text.
