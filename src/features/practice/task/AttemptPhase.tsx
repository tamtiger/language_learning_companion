import { advancePhase } from '../../../domain/learning/flow'
import { GuardedButton } from '../../../shared/components/GuardedButton'
import { languageOf } from '../../../shared/lang'
import { SpokenResponse } from '../spoken/SpokenResponse'
import { ListenBackChecklist } from '../spoken/ListenBackChecklist'
import { TRANSFER_REASON_LABELS } from './taskConstants'
import { formatClock, countWords } from './taskSession'
import { RubricEditor } from './RubricEditor'
import { IndependenceEditor } from './IndependenceEditor'
import { LearnerOutput } from './LearnerOutput'
import { PracticeContextPanel } from './PracticeContextPanel'
import type { TaskContext } from './taskContext'

export function AttemptPhase({ ctx }: { ctx: TaskContext }) {
  const { lesson, task, progress, setSession, response, setResponse, spokenSnapshot, setSpokenSnapshot, learnerOutput, setLearnerOutput, rubric, setRubric, retryFocusId, independence, setIndependence, completionAssessment, setCompletionAssessment, completionKind, setCompletionKind, setReadOnceClosedPhase, listenedBack, setListenedBack, listenBackChecks, setListenBackChecks, lockedDraft, elapsedSeconds, preparationStartedAt, phase, writtenResponseRef, focusWrittenResponseWhenReady, requiresPilotListenerCheck, retryFocus, practiceContext, requiresReadOnce, readOnceReady, needsDraftLock, showRubricEditor, responseBlockedReason, submitBlockedReason, timeLimitSeconds, lockDraft, startOutput, handleSpokenStarted, handleSpokenReady, createSnapshot, saveAttempt, resetResponse } = ctx
  const prompt = phase === 'baseline' ? task.baselinePrompt
    : phase === 'performance' ? task.performancePrompt
      : phase === 'retry' ? task.retryPrompt
        : phase === 'review' ? task.reviewPrompt : task.transferPrompt
  return (
    <div className="space-y-5">
      {practiceContext && (!requiresReadOnce || !readOnceReady) && (
        <PracticeContextPanel lessonId={lesson.lessonId} context={practiceContext} />
      )}
      {requiresReadOnce && !readOnceReady && (
        <button type="button" onClick={() => {
          focusWrittenResponseWhenReady.current = true
          // Time spent reading the source is not preparation time.
          preparationStartedAt.current = Date.now()
          setReadOnceClosedPhase(phase)
        }}
          className="rounded-xl border border-cyan-400 px-5 py-3 font-bold text-cyan-200">
          Đã đọc một lần — ẩn tài liệu
        </button>
      )}
      {requiresReadOnce && readOnceReady && (
        <p role="status" className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
          Source đã ẩn. Hãy trích xuất và diễn đạt từ trí nhớ; reload chỉ dùng khi bạn cần bắt đầu lại phase.
        </p>
      )}
      {phase === 'transfer' && completionKind === 'transfer' && completionAssessment && !completionAssessment.qualifies && (
        <p role="status" aria-label="Kết quả transfer" className="rounded-xl bg-amber-500/10 p-4 text-sm text-amber-200">
          Transfer chưa đạt: {completionAssessment.reasons.map((reason) => TRANSFER_REASON_LABELS[reason]).join(', ')}. Mission chưa hoàn thành và chưa lên lịch ôn; hãy làm lại tình huống này.
        </p>
      )}
      <p lang={languageOf(prompt)} className="whitespace-pre-line text-lg leading-8 text-zinc-200">{prompt}</p>
      {phase === 'retry' && learnerOutput && (
        <div className="grid gap-4 lg:grid-cols-2">
          <LearnerOutput snapshot={learnerOutput} />
          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-400">Model để đối chiếu</p>
            <p lang="en" className="mt-3 leading-7 text-zinc-300">{task.modelResponse}</p>
          </div>
        </div>
      )}
      {phase === 'retry' && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Ưu tiên retry</p>
          <p className="mt-2 font-semibold">{retryFocus?.label ?? 'Giữ toàn bộ tiêu chí đã đạt khi diễn đạt lại'}</p>
          {retryFocus && <p lang={languageOf(retryFocus.description)} className="mt-1 text-sm text-zinc-300">{retryFocus.description}</p>}
        </div>
      )}
      {task.mode === 'spoken' ? (
        <div className="space-y-3">
          <SpokenResponse key={`${lesson.lessonId}:${phase}:${progress?.attemptCount ?? 0}`} onStarted={handleSpokenStarted} onReady={handleSpokenReady} onListenedBack={() => setListenedBack(true)} />
          {task.learningLoop && requiresPilotListenerCheck && spokenSnapshot?.audioUrl && (
            <ListenBackChecklist items={task.learningLoop.listenBackChecklist} checked={listenBackChecks}
              playbackCompleted={listenedBack} onChange={setListenBackChecks} />
          )}
          {task.learningLoop && spokenSnapshot?.audioUrl && !listenedBack && (
            <p className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-200">Hãy nghe lại bản ghi ít nhất một lần trước khi tiếp tục.</p>
          )}
        </div>
      ) : (
        <div>
          <label className="block font-semibold">Bản nháp tiếng Anh
            <textarea ref={writtenResponseRef} lang="en" value={response} onChange={(event) => {
              if (event.target.value.trim()) startOutput()
              setResponse(event.target.value)
            }} disabled={!readOnceReady} readOnly={lockedDraft !== null} rows={7} className="mt-2 block w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 font-normal leading-7 disabled:cursor-not-allowed disabled:opacity-40" />
          </label>
          <p className="mt-2 text-xs text-zinc-400">{countWords(response)} từ · Bản nháp chỉ ở session hiện tại và không được persist.</p>
          <p role="timer" aria-label="Thời gian viết" className="mt-1 font-mono text-sm text-zinc-300">
            Thời gian: {formatClock(elapsedSeconds)} / {formatClock(timeLimitSeconds)}{lockedDraft ? ' · đã chốt' : ''}
          </p>
          <p role="status" className="text-sm text-amber-200">
            {elapsedSeconds >= timeLimitSeconds && !lockedDraft ? 'Đã tới giới hạn thời gian của lượt này.' : ''}
          </p>
        </div>
      )}
      <IndependenceEditor value={independence} onChange={setIndependence} />
      {showRubricEditor && <RubricEditor task={task} answers={rubric} setAnswers={setRubric} />}
      <div className="flex flex-wrap gap-3">
        {needsDraftLock && !lockedDraft && (
          <GuardedButton disabledReason={responseBlockedReason} onClick={lockDraft} className="rounded-xl border border-purple-400 px-5 py-3 font-bold text-purple-100">Chốt bản nháp</GuardedButton>
        )}
        {phase === 'baseline' && <GuardedButton disabledReason={responseBlockedReason} onClick={() => {
          const snapshot = createSnapshot(); if (!snapshot) return
          saveAttempt('baseline', snapshot, {})
          resetResponse()
          setSession((current) => advancePhase(current, 'SUBMIT_BASELINE'))
        }} className="rounded-xl bg-purple-700 px-5 py-3 font-bold disabled:opacity-40">Lưu baseline</GuardedButton>}
        {phase === 'performance' && <GuardedButton disabledReason={responseBlockedReason} onClick={() => {
          const snapshot = createSnapshot(); if (!snapshot) return
          setLearnerOutput(snapshot)
          setSpokenSnapshot(null)
          setSession((current) => advancePhase(
            current,
            task.mode === 'spoken' && task.learningLoop ? 'OPEN_INTERACTION' : 'SUBMIT_PERFORMANCE'
          ))
        }} className="rounded-xl bg-purple-700 px-5 py-3 font-bold disabled:opacity-40">Đối chiếu rubric</GuardedButton>}
        {phase === 'retry' && <GuardedButton disabledReason={submitBlockedReason} onClick={() => {
          const snapshot = createSnapshot(); if (!snapshot) return
          saveAttempt('retry', snapshot, rubric, retryFocusId)
          setRubric({})
          resetResponse()
          setSession((current) => advancePhase(current, 'START_TRANSFER'))
        }} className="rounded-xl bg-purple-700 px-5 py-3 font-bold disabled:opacity-40">Sang transfer</GuardedButton>}
        {phase === 'transfer' && <GuardedButton disabledReason={submitBlockedReason} onClick={() => {
          const snapshot = createSnapshot(); if (!snapshot) return
          const assessment = saveAttempt('transfer', snapshot)
          setCompletionAssessment(assessment)
          setCompletionKind('transfer')
          resetResponse()
          if (!assessment?.qualifies) {
            setRubric({})
            return
          }
          setSession((current) => advancePhase(current, 'SUBMIT_TRANSFER'))
        }} className="rounded-xl bg-green-500 px-5 py-3 font-bold text-zinc-950 disabled:opacity-40">Hoàn thành transfer</GuardedButton>}
        {phase === 'review' && <GuardedButton disabledReason={submitBlockedReason} onClick={() => {
          const snapshot = createSnapshot(); if (!snapshot) return
          setCompletionAssessment(saveAttempt('review', snapshot))
          setCompletionKind('review')
          resetResponse()
          setSession((current) => advancePhase(current, 'SUBMIT_REVIEW'))
        }} className="rounded-xl bg-green-500 px-5 py-3 font-bold text-zinc-950 disabled:opacity-40">Lưu review</GuardedButton>}
      </div>
    </div>
  )
}
