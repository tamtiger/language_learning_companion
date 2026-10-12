import { advancePhase } from '../../../domain/learning/flow'
import { GuardedButton } from '../../../shared/components/GuardedButton'
import { RubricEditor } from './RubricEditor'
import { LearnerOutput } from './LearnerOutput'
import type { TaskContext } from './taskContext'

export function FeedbackPhase({ ctx }: { ctx: TaskContext }) {
  const { task, setSession, learnerOutput, rubric, setRubric, setRetryFocusId, allRated, notMetCriterionIds, selectedRetryFocusId, canSubmitFeedback, saveAttempt, resetResponse } = ctx
  if (!learnerOutput) return null
  return (
    <div className="space-y-6">
      <LearnerOutput snapshot={learnerOutput} />
      <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-purple-400">Model response — chỉ mở sau attempt</p>
        <p lang="en" className="mt-3 leading-7 text-zinc-300">{task.modelResponse}</p>
      </div>
      <RubricEditor task={task} answers={rubric} setAnswers={setRubric} />
      {allRated && notMetCriterionIds.length > 0 ? (
        <fieldset className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <legend className="px-1 text-sm font-bold text-amber-200">Chọn ưu tiên retry</legend>
          <p className="mb-3 text-sm text-zinc-300">Chọn một tiêu chí chưa đạt để tập trung sửa ở lượt kế tiếp.</p>
          <div className="grid gap-2">
            {task.rubric.filter((item) => notMetCriterionIds.includes(item.id)).map((item) => (
              <label key={item.id} className="flex cursor-pointer items-center gap-3 text-sm">
                <input type="radio" name="retry-focus" checked={selectedRetryFocusId === item.id}
                  onChange={() => setRetryFocusId(item.id)} className="h-4 w-4 accent-amber-400" />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : allRated ? (
        <p className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-200">Tất cả tiêu chí đã đạt. Retry để giữ chất lượng khi diễn đạt lại.</p>
      ) : null}
      <GuardedButton disabledReason={!allRated ? 'Chấm đủ các tiêu chí rubric trước.' : !canSubmitFeedback ? 'Chọn một tiêu chí ưu tiên retry.' : undefined} onClick={() => {
        saveAttempt('performance', learnerOutput, rubric, selectedRetryFocusId)
        setRubric({})
        resetResponse(false)
        setSession((current) => advancePhase(current, 'SUBMIT_RUBRIC'))
      }} className="rounded-xl bg-purple-700 px-5 py-3 font-bold disabled:opacity-40">Lưu self-feedback</GuardedButton>
    </div>
  )
}
