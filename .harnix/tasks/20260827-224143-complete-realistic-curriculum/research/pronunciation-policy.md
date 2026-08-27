# Research — Policy pronunciation legacy v1

- Task ID: `20260827-224143-complete-realistic-curriculum`
- Ngày truy cập nguồn: 2026-08-27
- Material unknown: có nên migrate sáu lesson v1 để giữ objective production, hay sửa tại chỗ thành lesson awareness/reference với dialect và claim trung thực?

## Repository evidence

- V1 chỉ có vocabulary/reading/auto-check và normalize thành `completionMode: legacy-quiz`; không có perception/audio discrimination, recording, listen-back hoặc human rating.
- Migrate v1 sang v3 sẽ đưa lesson vào baseline mission catalog và phá invariant 12 mission/hai mission cho mỗi capability.
- Renderer legacy yêu cầu device TTS `en-US`; TTS không phải authority để xác nhận IPA hoặc pronunciation performance.
- Sáu spoken v3 hiện đã có learning loop perception → cue → shadowing → listen-back → interaction, nên standalone production flow mới sẽ trùng sản phẩm.

## Sources

### PRON-1 — Cambridge Dictionary, US pronunciation entries

- Canonical URL: https://dictionary.cambridge.org/us/pronunciation/english/variable
- Related exact entries: `/developer`, `/database`, `/development`, `/architecture`, `/repository`, `/engineer` dưới cùng path.
- Exact location: các heading `English pronunciation of variable`, `developer`, `database`, `development`, `architecture`, `repository`, `engineer`; trường `US` IPA và audio.
- Version/date: live Cambridge Advanced Learner's Dictionary & Thesaurus / Academic Content Dictionary; accessed 2026-08-27.
- License/rights: Cambridge University Press copyright; https://www.cambridge.org/legal/terms-of-use
- Reuse: reference-only; không copy audio, chỉ kiểm tra transcription/stress và dẫn link trong research.
- Fact: Cambridge công bố riêng UK/US forms; ví dụ `variable` US `/ˈver.i.ə.bəl/`, `developer` US `/dɪˈvel.ə.pɚ/`, `database` US `/ˈdeɪ.t̬ə.beɪs/`, `repository` US `/rɪˈpɑː.zɪ.tɔːr.i/`.
- Inference: policy phải nêu dialect thay vì gọi một transcription là pronunciation phổ quát.

### PRON-2 — Cambridge Grammar, pronunciation of regular `-ed`

- Canonical URL: https://dictionary.cambridge.org/grammar/british-grammar/past-simple-i-worked
- Exact location: `Past simple: pronunciation of -ed`.
- Version/date: English Grammar Today live page; accessed 2026-08-27.
- License/rights: Cambridge University Press copyright; https://www.cambridge.org/legal/terms-of-use
- Reuse: reference-only; rule được paraphrase.
- Fact: regular `-ed` có /d/ sau vowel/voiced consonant trừ /d/, /t/ sau voiceless consonant trừ /t/, và /ɪd/ sau /d/ hoặc /t/.
- Inference: lesson 02 có thể giữ `fixed/deployed/tested` nhưng objective phải là nhận diện/giải thích, không phải chứng minh production.

### PRON-3 — British Council TeachingEnglish, sentence stress

- Canonical URL: https://www.teachingenglish.org.uk/professional-development/teachers/knowing-subject/english-sentence-stress
- Exact location: `English is a stress-timed language`, `Speaking`, `Conclusion`.
- Version/date: live TeachingEnglish article; accessed 2026-08-27.
- License/rights: British Council terms; https://www.britishcouncil.org/terms
- Reuse: reference-only; không copy audio/activity text.
- Fact: content words thường được stress, nhưng rhythm/stress đổi theo meaning, audience và context; nguồn cảnh báo không kỳ vọng kết quả tức thì.
- Inference: lesson 04 phải mô tả content/function word chỉ là default trong neutral context và sửa `to` thành infinitival marker.

### PRON-4 — British Council TeachingEnglish, intonation

- Canonical URL: https://www.teachingenglish.org.uk/professional-development/teachers/knowing-subject/using-intonation
- Exact location: `Intonation and grammar`, `Intonation and attitude`, `Conclusion`.
- Version/date: live TeachingEnglish article; accessed 2026-08-27.
- License/rights: British Council terms; https://www.britishcouncil.org/terms
- Reuse: reference-only.
- Fact: yes/no rising and statement falling được trình bày như starting-points/rules-of-thumb; attitude và discourse có thể đổi contour, và mục tiêu không cần native-speaker-level pronunciation.
- Inference: lesson 05 phải dùng “pattern thường gặp trong neutral context”, không chấm một contour là luôn đúng.

### PRON-5 — Hamada (2019), shadowing review

- Canonical URL/DOI: https://doi.org/10.1177/0033688218771380
- Exact location: `What is Shadowing?`, `Connecting Research and Teaching for Speaking`, `Challenges`, `Conclusion`.
- Version/date: RELC Journal 50(3), first online 2018; accessed 2026-08-27.
- License/rights: SAGE copyright/permissions; https://us.sagepub.com/en-us/nam/copyright-and-permissions
- Reuse: reference-only; không copy proprietary passage.
- Fact: shadowing là immediate vocalization of auditory input; evidence cho listening nhiều hơn speaking, optimal amount chưa được xác định, transfer cần pre/post speech và human raters.
- Inference: lesson 06 không được hứa 10/30 phút sẽ tạo fluency, “vocal muscles”, bỏ dịch trong đầu hay mastery; quiz chỉ có thể kiểm tra hiểu quy trình.

## So sánh phương án

1. Migrate sang v3: có performance evidence nhưng phá catalog/capability contract, trùng sáu spoken loops và mở rộng storage/progress scope.
2. Giữ objective production với v1: không thể verify, trái PRODUCT/CONTENT.
3. Sửa tại chỗ thành awareness/reference: giữ compatibility, fact-check được, không suy diễn performance và phù hợp content-first.

## Kết luận

Chọn phương án 3. Dùng General American làm dialect tham chiếu cho IPA vì UI legacy yêu cầu `en-US`, nhưng ghi rõ device TTS có thể khác và dictionary mới là reference. Lesson 01–05 sửa objective/title/body/exercise thành knowledge hoặc awareness; lesson 06 sửa thành overview 15 phút, bỏ efficacy/native-speaker claim và ghi `candidate-to-retire/replace` trong audit vì shadowing đã có ở v3. Không migrate hoặc retire trong task này.

## Giới hạn và trigger

- Không có human pronunciation assessor; không tuyên bố learner production cải thiện.
- TeachingEnglish là professional guidance, không phải controlled study; chỉ dùng cho rule-of-thumb, không cho causal claim.
- Nếu product owner sau này yêu cầu standalone pronunciation performance, mở migration riêng cho capability/catalog/progress thay vì nới task này.
