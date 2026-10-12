import { TRANSFER_REASON_LABELS } from './taskConstants'
import type { TaskContext } from './taskContext'

export function CompletedView({ ctx }: { ctx: TaskContext }) {
  const { lesson, confirmingRepeat, setConfirmingRepeat, completionAssessment, completionKind, taskTitleRef, beginRepeat } = ctx
  return (
    <section aria-labelledby="mission-complete-title" className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center">
      <h2 ref={taskTitleRef} tabIndex={-1} id="mission-complete-title" className="text-2xl font-black">Mission hoàn thành</h2>
      <p className="mt-2 text-zinc-300">
        {completionKind === 'transfer'
          ? `Transfer evidence đã được lưu. Review tiếp theo được đưa vào Today theo lịch ${lesson.reviewPolicy.intervalDays.join('–')} ngày.`
          : completionKind === 'review'
            ? 'Review đã được lưu. Lịch ôn tiếp theo đã được cập nhật theo review policy của bài học.'
            : 'Mission này đã hoàn tất. Bạn có thể luyện lại để bắt đầu một vòng mới mà vẫn giữ lịch sử luyện tập.'}
      </p>
      {completionKind === 'review' && completionAssessment && (
        <p role="status" aria-label="Kết quả review" className={`mt-4 rounded-xl p-4 text-sm ${completionAssessment.qualifies ? 'bg-green-500/10 text-green-200' : 'bg-amber-500/10 text-amber-200'}`}>
          {completionAssessment.qualifies
            ? 'Review đạt hợp đồng độc lập và output contract; lịch ôn chuyển sang chặng tiếp theo.'
            : `Review đã lưu nhưng chưa đạt: ${completionAssessment.reasons.map((reason) => TRANSFER_REASON_LABELS[reason]).join(', ')}. Bài sẽ được ôn lại vào ngày kế tiếp.`}
        </p>
      )}
      {completionKind === 'transfer' && completionAssessment?.qualifies && (
        <p role="status" aria-label="Kết quả transfer" className="mt-4 rounded-xl bg-green-500/10 p-4 text-sm text-green-200">
          Transfer đạt hợp đồng độc lập và output contract.
        </p>
      )}
      {confirmingRepeat ? (
        <div role="alertdialog" aria-labelledby="repeat-mission-title" className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-left">
          <h3 id="repeat-mission-title" className="font-bold text-amber-100">Xác nhận luyện lại mission</h3>
          <p className="mt-2 text-sm text-amber-100">Luyện lại sẽ xóa tiến độ vòng hiện tại (các phần và bài tập đã đúng). Lịch sử luyện tập và lịch ôn vẫn được giữ.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" autoFocus onClick={() => { setConfirmingRepeat(false); beginRepeat() }} className="rounded-lg bg-amber-400 px-4 py-2 font-bold text-zinc-950">Xác nhận luyện lại</button>
            <button type="button" onClick={() => setConfirmingRepeat(false)} className="rounded-lg border border-zinc-700 px-4 py-2">Hủy</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirmingRepeat(true)} className="mt-5 rounded-xl border border-green-300 px-5 py-3 font-bold text-green-100">
          Luyện lại mission
        </button>
      )}
    </section>
  )
}
