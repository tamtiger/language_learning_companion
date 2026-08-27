# PRD — Pilot nguồn đáng tin cậy cho Daily Standup

## Kết quả

Người học nhận biết Daily Standup là tình huống mô phỏng có căn cứ từ nguồn chính thức, hiểu bước học bằng ngôn ngữ thân thiện và có thể tự kiểm tra nguồn/quyền sử dụng, trong khi app vẫn offline-first và lesson cũ tiếp tục chạy.

## Phạm vi

Thêm source registry opt-in ở lesson v3, provenance reference cho source artifact, validation xuyên sections/practice contexts/reading ladder, canonical source resolution trong content layer, metadata cho toàn bộ artifact của `daily-standup-b1`, disclosure accessible và nhãn phase/mode hướng người học. Cập nhật owner docs, changelog và PATCH version. Không đổi progress/storage.

## Ngoài phạm vi

Không rollout toàn curriculum; không cải tổ pronunciation v1; không redesign navigation/design system; không thêm AI/cloud/runtime fetch/dependency; không persist learner output; không tuyên bố CEFR certification hoặc learning efficacy.

### AC `AC-1`

Content layer validate lesson-local registry và provenance của pilot, gồm unique/existing reference, HTTPS, access date, reuse/right và adaptation note; fail closed khi contract sai, nhưng v1/v2/v3 không provenance vẫn load như trước và không cần runtime network.

### AC `AC-2`

Mission pilot hiển thị origin, nguồn chính thức, version/location/access date, quyền/reference-only và adaptation note bằng native disclosure dùng được bằng keyboard; learner header không còn `schema v3` hoặc raw `spoken|written capability task · phase`, và source format có nhãn thân thiện.

### AC `AC-3`

Mọi source artifact section/baseline/retry/transfer/review của `daily-standup-b1` có provenance nhất quán, gọi three-part update là team convention chứ không phải Scrum requirement, chỉ nói CEFR-informed chứ không chứng nhận, và giữ variation cùng learning integrity.

### AC `AC-4`

Source resolution nằm trong normalization/content boundary, UI chỉ dùng canonical `resolvedSources`; privacy/storage/backup không đổi; lesson legacy, spoken/written v3 và read-once phase isolation được giữ; focused/full/static/browser checks có evidence mới.

## Rủi ro và rollback

Nguồn chỉ dùng `reference-only`, artifact vẫn synthetic và không sao chép descriptor/guide. Registry/provenance opt-in giúp rollback bằng cách bỏ metadata mà không rewrite lesson cũ. Progressive disclosure tránh tăng cognitive load. Không có runtime fetch; link ngoài chỉ mở do thao tác chủ động của người học.