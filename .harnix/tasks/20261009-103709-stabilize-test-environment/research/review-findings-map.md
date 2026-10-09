# Bản đồ phát hiện sang task (review tổng thể 20261009)

Nguồn: review chỉ đọc 4 hướng (nội dung và sư phạm, độ chính xác ngôn ngữ, code và test, UX và offline). Kết quả test gốc: lint và build exit 0; test 73/267 fail trên Node 25 do localStorage, 267/267 pass với --no-experimental-webstorage.

| Task | Phát hiện |
| --- | --- |
| 1 stabilize-test-environment | Node 25 che localStorage jsdom, không ghim engines |
| 2 harden-assessment-integrity | Đáp án ở options[0] 91/96, không xáo trộn, ordering/matching sắp sẵn, fill khắt khe, đáp án dài nhất 74%, distractor vô lý |
| 3 fix-content-accuracy-errors | Trọng âm sai, stand-pre-3 sai nghĩa, meet-train-3 mơ hồ, ngữ pháp, model response lệch, thời lượng spoken, định nghĩa giống nguồn ngoài, nhãn synthetic |
| 4 fix-learning-state-logic | Transfer chưa đạt vẫn completed, review bỏ qua độc lập, lịch ôn 24h, Luyện lại che bài ôn và reset stage, chấm lại bằng content mới, quarantine im lặng, quota, nhiều tab |
| 5 clean-repo-hygiene-and-docs | check-changelog-rule gãy, check-release hard-code, tài liệu lệch, dead code, enum lặp, store subscribe cả store, CapabilityTask 735 dòng, bundle 574 kB |
| 6 improve-accessibility-and-learning-ux | Focus mất, thiếu lang=en, heading phase, rubric thiếu tên, nút disabled không lý do, mất draft, đồng hồ ẩn, ErrorBoundary, enum thô, axe mỏng |
| 7 add-offline-pwa-and-audio-reliability | Không có service worker/manifest, Safari xóa storage, voice TTS online và im lặng |
| 8 extend-curriculum-schema | Cần schema cho A2, từ vựng, nghe dài, đọc dài, story bank; contentRevision; rubric ngôn ngữ; review dài; hard-code số bài |
| 9 đến 13 | Đợt mở rộng nội dung: A2, phỏng vấn và làm việc, nghe và đọc dài, từ vựng và ô trống, chia phiên |

Quyết định đã thống nhất với chủ dự án: đầu tư mở rộng bài học; làm đợt 1 (nền đo lường và logic) trước đợt 2.
Câu hỏi mở: hành vi Luyện lại thắng bài ôn được xem là ngoài ý muốn (task 4 sẽ sửa theo đề xuất).
