import { advancePhase } from '../../../domain/learning/flow'
import { GuardedButton } from '../../../shared/components/GuardedButton'
import { SectionRenderer } from '../../lesson/SectionRenderer'
import { LearningLoopPractice, LearningLoopProgress } from '../spoken/LearningLoopPractice'
import { ReadingLadderPractice } from '../ladder/ReadingLadderPractice'
import type { TaskContext } from './taskContext'

export function InputPhase({ ctx }: { ctx: TaskContext }) {
  const { lesson, task, progress, setActivePhase, setActiveProcessEvidence, setInputProgress, setSession, inputPracticeReady, setInputPracticeReady, setFocusMainAttemptWhenReady, learningLoopSummary, setLearningLoopSummary, processEvidence, setProcessEvidence, preparationStartedAt, mainAttemptButtonRef, sectionCount, sectionIndex, goToSection, requiredAutoCheckExerciseIds, autoCheckComplete } = ctx
  return (
    <div className="space-y-8">
      <nav aria-label="Các phần của bài" className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-zinc-200">Phần {sectionIndex + 1}/{sectionCount}</p>
        <div className="flex gap-2">
          <button type="button" aria-disabled={sectionIndex === 0 ? true : undefined}
            onClick={() => { if (sectionIndex > 0) goToSection(sectionIndex - 1) }}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold aria-disabled:cursor-not-allowed aria-disabled:opacity-40">Phần trước</button>
          <button type="button" aria-disabled={sectionIndex >= sectionCount - 1 ? true : undefined}
            onClick={() => { if (sectionIndex < sectionCount - 1) goToSection(sectionIndex + 1) }}
            className="rounded-lg border border-purple-400 px-4 py-2 text-sm font-semibold text-purple-100 aria-disabled:cursor-not-allowed aria-disabled:opacity-40">Phần tiếp theo</button>
        </div>
      </nav>
      <div key={lesson.sections[sectionIndex].id} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
        <SectionRenderer lessonId={lesson.lessonId} section={lesson.sections[sectionIndex]} headingLevel={3} />
      </div>
      {task.mode === 'spoken' && task.learningLoop && !inputPracticeReady && (
        <LearningLoopPractice loop={task.learningLoop} initial={progress?.inputProgress}
          onProgress={(inputProgress) => setInputProgress(lesson.lessonId, inputProgress)}
          onComplete={(process, summary) => {
          setInputProgress(lesson.lessonId, null)
          setProcessEvidence(process)
          setActiveProcessEvidence(lesson.lessonId, process)
          setLearningLoopSummary(summary)
          setFocusMainAttemptWhenReady(true)
          setInputPracticeReady(true)
        }} />
      )}
      {task.mode === 'spoken' && task.learningLoop && inputPracticeReady && (
        <LearningLoopProgress
          stage="ready"
          pronunciationStatus={learningLoopSummary?.pronunciationStatus
            ?? (processEvidence?.optedOut ? 'unavailable' : 'resumed')}
        />
      )}
      {task.mode === 'written' && task.readingLadder && !inputPracticeReady && (
        <ReadingLadderPractice lessonId={lesson.lessonId} ladder={task.readingLadder}
          initial={progress?.inputProgress?.ladder}
          onProgress={(ladder) => setInputProgress(lesson.lessonId, { ladder })}
          onComplete={() => {
            setInputProgress(lesson.lessonId, null)
            setFocusMainAttemptWhenReady(true)
            setInputPracticeReady(true)
          }} />
      )}
      <GuardedButton ref={mainAttemptButtonRef} disabledReason={!inputPracticeReady ? 'Hoàn tất phần luyện nghe hoặc luyện đọc ở trên trước.' : !autoCheckComplete ? 'Hoàn tất auto-check trước khi bắt đầu lượt chính.' : undefined} onClick={() => {
        setSession((current) => advancePhase(current, 'COMPLETE_AUTO_CHECK'))
        setActivePhase(lesson.lessonId, 'performance')
        preparationStartedAt.current = Date.now()
      }} className="rounded-xl bg-purple-700 px-5 py-3 font-bold">Bắt đầu lượt chính</GuardedButton>
      {!autoCheckComplete && (
        <p role="status" className="text-sm text-amber-200">
          Hoàn tất auto-check trước khi bắt đầu lượt chính ({progress?.completedExerciseIds.filter((id) => requiredAutoCheckExerciseIds.includes(id)).length ?? 0}/{requiredAutoCheckExerciseIds.length}).
        </p>
      )}
    </div>
  )
}
