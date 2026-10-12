import type { CanonicalPerformanceTaskV3 } from '../../../content/schema'
import type { CapabilityPhase } from '../../../domain/learning/flow'
import type { IndependenceEvidence, TransferReason } from '../../../domain/progress/progress'

export const DEFAULT_INDEPENDENCE: IndependenceEvidence = {
  usedVietnamese: false,
  usedTranslation: false,
  usedModelAnswer: false,
  hintCount: 0,
  preparationSeconds: 0
}


export const TRANSFER_REASON_LABELS: Record<TransferReason, string> = {
  incomplete: 'lượt transfer chưa hoàn chỉnh',
  'lesson-mismatch': 'evidence không thuộc đúng lesson',
  'task-mismatch': 'evidence không thuộc đúng task',
  'capability-mismatch': 'evidence không thuộc đúng capability',
  'rubric-mismatch': 'rubric evidence không khớp task',
  'rubric-not-rated': 'rubric chưa được đánh giá đủ',
  'rubric-gap': 'còn tiêu chí chưa đạt',
  'used-vietnamese': 'đã dùng tiếng Việt',
  'used-translation': 'đã dùng công cụ dịch',
  'used-model-answer': 'đã dùng model answer',
  'too-many-hints': 'vượt số gợi ý',
  'preparation-overtime': 'vượt thời gian chuẩn bị',
  'too-short': 'output ngắn hơn yêu cầu',
  'too-long': 'output dài hơn yêu cầu',
  overtime: 'vượt thời gian',
  'listen-back-missing': 'chưa nghe lại và hoàn tất listener checklist',
  'interaction-incomplete': 'chưa hoàn thành đủ lượt clarification/repair'
}

export const MODE_LABELS: Record<CanonicalPerformanceTaskV3['mode'], string> = {
  spoken: 'Nhiệm vụ nói',
  written: 'Nhiệm vụ viết'
}

export const PHASE_LABELS: Record<CapabilityPhase, string> = {
  baseline: 'Lượt đầu (baseline)',
  input: 'Học có hướng dẫn',
  'auto-check': 'Kiểm tra hiểu bài',
  performance: 'Lượt chính',
  interaction: 'Tương tác',
  'self-feedback': 'Tự đánh giá',
  retry: 'Làm lại có trọng tâm (retry)',
  transfer: 'Tình huống mới (transfer)',
  review: 'Ôn lại theo lịch (review)',
  completed: 'Đã hoàn thành'
}

export const PHASE_DESCRIPTIONS: Record<CapabilityPhase, string> = {
  baseline: 'Tự làm trước khi xem hướng dẫn hoặc bài mẫu.',
  input: 'Đọc hoặc nghe đầu vào, rồi hoàn thành phần luyện tập.',
  'auto-check': 'Kiểm tra các dữ kiện cần hiểu trước lượt chính.',
  performance: 'Tạo một câu trả lời mới cho nhiệm vụ.',
  interaction: 'Xử lý câu hỏi hoặc hiểu nhầm từ lượt nói.',
  'self-feedback': 'Đối chiếu bài làm và chấm từng tiêu chí.',
  retry: 'Diễn đạt lại, tập trung vào tiêu chí cần sửa.',
  transfer: 'Áp dụng cùng kỹ năng với dữ kiện chưa gặp.',
  review: 'Nhớ và áp dụng lại kỹ năng với dữ kiện mới.',
  completed: 'Nhiệm vụ đã được ghi nhận.'
}
