# Kế hoạch: Sửa lỗi chính xác nội dung

## Checklist theo slice

- [x] S1: viết trước các test mới trong `tests/content/contentQuality.test.ts`, xác nhận đỏ đúng lý do (ac-1 đến ac-5)
- [x] S2: sửa `stressPattern` và các cue liên quan (ac-1, ac-2)
- [x] S3: sửa câu hỏi, feedback và trigger cue không khớp audio (ac-2)
- [x] S4: sửa ngữ pháp, model response và khôi phục thuật ngữ bị diễn đạt lại (ac-3)
- [x] S5: kéo dài model response của mission spoken theo thời lượng (ac-4)
- [x] S6: viết lại định nghĩa pronunciation, làm rõ nhãn synthetic, chuyển prompt B2 sang tiếng Anh (ac-5)
- [x] S7: chạy lint, build, toàn bộ suite và đọc lại diff nội dung (ac-1 đến ac-5)

Đường dẫn tương đối với root repo. Mỗi slice viết test trước (RED) rồi sửa nội dung (GREEN); không đổi `id` nào.

## S1: test viết trước

Thêm tất cả vào `tests/content/contentQuality.test.ts` (đã có hằng số và hàm gom lesson; đây là file mà check `check-content-fixes` chạy) cho các quy tắc mới:

1. **Trọng âm (ac-1):** với mọi chunk có `stressPattern`, tách theo ` · ` và theo khoảng trắng; mỗi từ viết thường phải là tiền tố của một từ trong `text` của chunk và không nằm trong danh sách function word cố định (`a an the and but or because if of to by from for with in on at as is are was were be been it this that these those we i you they he she let me could can would will should may might shall do does did`). Kèm test tự kiểm bằng dữ liệu giả.
2. **Cue âm cuối (ac-2):** với mọi cue có `ipa`, mỗi `triggerItemIds` trỏ tới một item perception tồn tại, và audio của item chứa ít nhất một từ tiếng Anh (chữ thường, từ 4 chữ cái trở lên) được liệt kê trong `articulatoryCue` của cue. Kèm test tự kiểm.
3. **Các sửa đổi khóa theo id (ac-2, ac-3):** các câu hỏi, feedback và model response đã được sửa không còn chứa chuỗi sai cũ (ví dụ câu hỏi `stand-pre-3` không còn là "What is blocked?", feedback `dec-train-3` không còn nhắc "results" hay "costs", `technical-doc-action-b1` không còn "rollback the latest snapshot", model response `behavioral-interview-ownership-b2` không còn cụm "without suggesting").
4. **Thời lượng (ac-4):** thay sàn 75 wpm hiện có bằng quy tắc: số từ của `modelResponse` nằm trong `[targetSeconds * 110 / 60, timeLimitSeconds * 160 / 60]` với các mission spoken (giá trị `targetSeconds` và `timeLimitSeconds` lấy từ hợp đồng của lesson).
5. **Provenance (ac-5):** danh sách các chuỗi định nghĩa cũ bị cấm xuất hiện trong content pronunciation; mọi artifact `origin: synthetic` có `sourceIds` phải có `adaptationNote` không rỗng; `performancePrompt`, `reviewPrompt`, `transferPrompt` và mọi `brief` của lesson B2 không chứa ký tự tiếng Việt có dấu.

RED: chạy `npx vitest run tests/content` và xác nhận chỉ các test mới fail, mỗi test fail vì đúng lỗi nó bảo vệ.

## S2: trọng âm và cue (ac-1, ac-2)

Cập nhật `stressPattern`:

| Chunk | Câu mẫu | Mới |
| --- | --- | --- |
| `meet-chunk-ack` | I see the ___ concern, but I’m concerned about ___ because ___. | `CONCERN · CONCERNED` |
| `meet-chunk-alt` | Could we ___ and make ___ conditional on ___? | `CONDITIONAL` |
| `meet-chunk-recap` | Subject to agreement, ___ could ___ by ___; ___ remains pending confirmation. | `AGREEMENT · PENDING · CONFIRMATION` |
| `arch-chunk-3` | This improves ___, but it means ___. | `IMPROVES · MEANS` |
| `trade-chunk-mitigate` | We can mitigate ___ by ___. | `MITIGATE` |
| `dec-chunk-2` | I chose ___ because ___. | `CHOSE` |

Đồng thời kiểm tra `meet-cue-stress` (nhấn RISK, ALTERNATIVE, OWNER, DEADLINE là từ của slot nên giữ) và `dec-cue-choice`, và sửa feedback `dec-train-2` ("Stress CHOSE and BECAUSE") thành "Stress CHOSE, BATCHING and ROOT CAUSE; keep BECAUSE light."

## S3: câu hỏi, feedback, trigger (ac-2)

- `stand-pre-3`: câu hỏi thành "What is the blocker?".
- `meet-train-3`: câu hỏi thành "Sau chữ but, người nói lo ngại điều gì?".
- `meet-train-1`: feedback thành "Không có /s/ ở cuối test, nên đây là một test."
- `dec-train-3`: feedback thành "Nghe hai kết quả nối bằng and: lower latency và lower database load."
- `trade-pre-1`: bỏ khỏi `triggerItemIds` của `trade-cue-finals` và thay bằng một item perception có từ số nhiều trong audio; nếu không có item phù hợp thì đổi audio một item để chứa "requests" hoặc "costs", giữ nguyên `id`.
- `trade-train-2`: câu hỏi thành "What is the deciding constraint?".
- `arch-pre-1` và `arch-post-1`: câu hỏi dùng đúng số lần retry như audio ("both retries" và "two retries").

## S4: ngữ pháp và model response (ac-3)

- `technical-doc-action-b1`: "rollback the latest snapshot" thành "roll back to the latest snapshot"; "roll back the snapshot" thành "restore the snapshot".
- `workplace-clarification-request-b1`: "what completion time should pass" thành "what completion time counts as a pass".
- `architecture-walkthrough-b2`: "use the event ID idempotently" thành "use the event ID to deduplicate events"; viết lại câu garden-path "Report event deliveries that still fail after two retries move to the dead letter queue" thành "Deliveries of report events that still fail after two retries move to the dead-letter queue."
- `meeting-disagree-and-recap-b2`: "Minh could own the test by four" thành "Minh could complete the test by four".
- Model response: `behavioral-interview-ownership-b2` bỏ vế "without suggesting that I resolved the incident alone"; `learn-api-from-docs-b2` đặt bước thêm polling trước bước quan sát trạng thái failed; `technical-interview-decision-b2` đổi mitigation thành một biện pháp khác với phương án đã chọn nhưng vẫn dựa trên dữ kiện của bài; `workplace-issue-update-b1` giữ một quyết định duy nhất đúng prompt.
- `stand-pre-2`: giữ đáp án diễn đạt lại "Recreate the timeout" thay vì khôi phục "Reproduce the timeout". Lý do: cổng keyword-parity yêu cầu distractor nằm nguyên văn trong audio khi đáp án đúng nằm nguyên văn, mà không có distractor nào vừa hợp lý vừa sai cho câu hỏi về hành động hôm nay; audio vẫn nói "reproduce" nên người học vẫn nghe thuật ngữ, và câu trả lời diễn đạt lại kiểm tra hiểu nghĩa. Test khóa theo từ "reproduce" vì vậy bị bỏ.

## S5: thời lượng (ac-4)

Tính số từ tối thiểu theo `targetSeconds * 110 / 60`: `behavioral-interview-ownership-b2` (target 90) cần ít nhất 165 từ và hiện có 118; `technical-interview-decision-b2` cần 165 và có 139; `architecture-walkthrough-b2` cần 165 và có 138; `meeting-disagree-and-recap-b2` (target 60) cần 110 và có 107; `technical-tradeoff-explanation-b2` cần 110 và có 110; `daily-standup-b1` (target 30) cần 55 và có 50. Bổ sung câu cho các model response thiếu, chỉ dùng dữ kiện đã có trong source hoặc brief, giữ ranh giới fact, hypothesis và proposal.

## S6: provenance, nhãn và ngôn ngữ (ac-5)

- Tự viết lại các định nghĩa trong `pronunciation-sentence-stress` (hai định nghĩa), `pronunciation-sounds`, `pronunciation-linking-intonation` và `pronunciation-shadowing-routine`, giữ nghĩa và mức B1, không dùng lại cấu trúc câu gốc.
- `CONTENT.md`: làm rõ rằng artifact synthetic có `sourceIds` dùng `adaptationNote` làm phần ghi nguồn hiển thị, còn nhãn "Synthetic training artifact — non-production." chỉ bắt buộc với synthetic độc lập.
- Chuyển `performancePrompt` và brief baseline của bốn mission B2 sang tiếng Anh (giữ nguyên yêu cầu và độ dài); sửa câu trộn Việt-Anh ở `daily-standup-b1`; thay "bảo vệ được" ở `pronunciation-linking-intonation` bằng "chính xác nhất".

## S7: xác minh

Chạy `npm run lint`, `npm run build` rồi `harnix workflow --run-checks --brief`. Đọc lại diff của từng file nội dung để chắc không có lỗi mới, và đảm bảo `git diff` không đổi `id` nào.

## Mỗi check chứng minh điều gì

- `check-content-fixes`: ac-1 đến ac-5, bằng các test mới và test chất lượng nội dung hiện có.
- `check-suite`: không có hồi quy, gồm cổng đáp án của task trước.

## Rollback

Mọi thay đổi nằm trong git. Nếu một test khóa theo id quá chặt cho nội dung hợp lệ, sửa test kèm lý do thay vì bỏ qua.
