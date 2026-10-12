import { useEffect, useRef, useState } from 'react'
import type { CanonicalLesson, CanonicalPerformanceTaskV3 } from '../../../content/schema'
import type { CapabilitySession } from '../../../domain/learning/flow'
import type { AttemptProcessEvidence, IndependenceEvidence, LessonEntry, RubricState, TransferAssessment } from '../../../domain/progress/progress'
import { useAppStore } from '../../../shared/hooks/useAppStore'
import { useUnsavedWork } from '../../../shared/hooks/useUnsavedWork'
import type { SpokenAttemptSnapshot } from '../spoken/SpokenResponse'
import type { LearningLoopSummary } from '../spoken/LearningLoopPractice'
import { DEFAULT_INDEPENDENCE } from './taskConstants'
import type { WrittenAttemptSnapshot, SessionAttemptSnapshot, CompletionKind } from './taskTypes'
import { initialSession } from './taskSession'

export function useTaskState({ lesson, task, entry }: {
  lesson: CanonicalLesson
  task: CanonicalPerformanceTaskV3
  entry?: LessonEntry
}) {
  const capabilityId = lesson.capabilities[0]
  if (!capabilityId) throw new Error(`Capability task lesson ${lesson.lessonId} must declare a capability`)
  const progress = useAppStore((state) => state.lessonProgress[lesson.lessonId])
  const recordAttempt = useAppStore((state) => state.recordCapabilityAttempt)
  const setActivePhase = useAppStore((state) => state.setActivePhase)
  const setCurrentSection = useAppStore((state) => state.setCurrentSection)
  const setActiveProcessEvidence = useAppStore((state) => state.setActiveProcessEvidence)
  const setInputProgress = useAppStore((state) => state.setInputProgress)
  const startLessonRepeat = useAppStore((state) => state.startLessonRepeat)
  const [session, setSession] = useState<CapabilitySession>(() => initialSession(progress, entry))
  const [confirmingRepeat, setConfirmingRepeat] = useState(false)
  const [response, setResponse] = useState('')
  const [spokenSnapshot, setSpokenSnapshot] = useState<SpokenAttemptSnapshot | null>(null)
  const [learnerOutput, setLearnerOutput] = useState<SessionAttemptSnapshot | null>(null)
  const [rubric, setRubric] = useState<Record<string, RubricState>>({})
  const [retryFocusId, setRetryFocusId] = useState<string | null>(() => progress?.recentAttempts.at(-1)?.focusCriterionId ?? null)
  const [independence, setIndependence] = useState<IndependenceEvidence>(DEFAULT_INDEPENDENCE)
  const [completionAssessment, setCompletionAssessment] = useState<TransferAssessment | null>(null)
  const [completionKind, setCompletionKind] = useState<CompletionKind>('existing')
  const [inputPracticeReady, setInputPracticeReady] = useState(() => {
    if (task.mode === 'spoken' && task.learningLoop) return Boolean(progress?.activeProcessEvidence)
    if (task.mode === 'written' && task.readingLadder) return false
    return true
  })
  const [focusMainAttemptWhenReady, setFocusMainAttemptWhenReady] = useState(false)
  const [learningLoopSummary, setLearningLoopSummary] = useState<LearningLoopSummary | null>(null)
  const [readOnceClosedPhase, setReadOnceClosedPhase] = useState<CapabilitySession['phase'] | null>(null)
  const [processEvidence, setProcessEvidence] = useState<AttemptProcessEvidence | null>(
    () => progress?.activeProcessEvidence ?? null
  )
  const [listenedBack, setListenedBack] = useState(false)
  const [listenBackChecks, setListenBackChecks] = useState<boolean[]>([])
  const [cueToSpeechStartMs, setCueToSpeechStartMs] = useState<number | null>(null)
  const [lockedDraft, setLockedDraft] = useState<WrittenAttemptSnapshot | null>(null)
  const [clockRunning, setClockRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  useUnsavedWork(response.trim().length > 0, 'bản nháp đang viết')
  const preparationStartedAt = useRef(Date.now())
  const outputStartedAt = useRef<number | null>(null)
  const learnerAudio = useRef<SpokenAttemptSnapshot | null>(null)
  const draftAudio = useRef<SpokenAttemptSnapshot | null>(null)
  const phase = session.phase
  const taskTitleRef = useRef<HTMLHeadingElement | null>(null)
  const mainAttemptButtonRef = useRef<HTMLButtonElement | null>(null)
  const writtenResponseRef = useRef<HTMLTextAreaElement | null>(null)
  const focusWrittenResponseWhenReady = useRef(false)
  const previousPhase = useRef(phase)
  const isPilot = lesson.workflowTags.includes('p0-pilot')
  const learningLoop = task.mode === 'spoken' ? task.learningLoop : undefined
  const listenBackChecklistComplete = learningLoop
    ? learningLoop.listenBackChecklist.length > 0
      && learningLoop.listenBackChecklist.every((_, index) => listenBackChecks[index] === true)
    : true
  const requiresPilotListenerCheck = isPilot && phase !== 'baseline'
  const firstAttempt = (progress?.attemptCount ?? 0) === 0
  const sectionCount = lesson.sections.length
  const savedSectionIndex = lesson.sections.findIndex((section) => section.id === progress?.currentSectionId)
  const sectionIndex = Math.max(0, savedSectionIndex)
  const goToSection = (index: number) => setCurrentSection(lesson.lessonId, lesson.sections[index].id)
  const requiredAutoCheckExerciseIds = lesson.sections.flatMap((section) => section.type === 'auto-check'
    ? section.exercises.map((exercise) => exercise.id)
    : [])
  const autoCheckComplete = requiredAutoCheckExerciseIds.every((exerciseId) =>
    progress?.completedExerciseIds.includes(exerciseId)
  )

  useEffect(() => {
    if (!clockRunning) return
    const tick = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - (outputStartedAt.current ?? Date.now())) / 1_000)))
    tick()
    const timer = window.setInterval(tick, 1_000)
    return () => window.clearInterval(timer)
  }, [clockRunning])
  useEffect(() => {
    const phaseChanged = previousPhase.current !== phase
    previousPhase.current = phase
    if (phaseChanged) taskTitleRef.current?.focus()
  }, [phase])
  useEffect(() => {
    if (!inputPracticeReady || !focusMainAttemptWhenReady) return
    mainAttemptButtonRef.current?.focus()
    setFocusMainAttemptWhenReady(false)
  }, [focusMainAttemptWhenReady, inputPracticeReady])
  useEffect(() => {
    learnerAudio.current = learnerOutput?.kind === 'spoken' ? learnerOutput : null
    draftAudio.current = spokenSnapshot
  }, [learnerOutput, spokenSnapshot])
  useEffect(() => () => {
    learnerAudio.current?.release?.()
    if (draftAudio.current !== learnerAudio.current) draftAudio.current?.release?.()
  }, [])

  const allRated = task.rubric.every((item) => rubric[item.id] === 'met' || rubric[item.id] === 'not-met')
  const notMetCriterionIds = task.rubric.filter((item) => rubric[item.id] === 'not-met').map((item) => item.id)
  const selectedRetryFocusId = notMetCriterionIds.includes(retryFocusId ?? '') ? retryFocusId : null
  const canSubmitFeedback = allRated && (notMetCriterionIds.length === 0 || selectedRetryFocusId !== null)
  const retryFocus = task.rubric.find((item) => item.id === retryFocusId)
  const practiceContext = phase === 'baseline' ? task.practiceContexts?.baseline
    : phase === 'retry' ? task.practiceContexts?.retry
      : phase === 'transfer' ? task.practiceContexts?.transfer
        : phase === 'review' ? task.practiceContexts?.review : undefined
  const requiresReadOnce = task.mode === 'written' && !!task.readingLadder
    && !!practiceContext && (phase === 'baseline' || phase === 'retry' || phase === 'transfer' || phase === 'review')
  const readOnceReady = !requiresReadOnce || readOnceClosedPhase === phase
  useEffect(() => {
    if (!readOnceReady || !focusWrittenResponseWhenReady.current) return
    focusWrittenResponseWhenReady.current = false
    writtenResponseRef.current?.focus()
  }, [readOnceReady])
  const responseReady = task.mode === 'spoken'
    ? spokenSnapshot !== null && (
        !learningLoop
        || !spokenSnapshot.audioUrl
        || (listenedBack && (!requiresPilotListenerCheck || listenBackChecklistComplete))
      )
    : readOnceReady && response.trim().length > 0

  const draftReason = task.mode === 'spoken'
    ? 'Ghi âm hoặc bấm timer, rồi chọn "Tôi đã nói xong" trước.'
    : requiresReadOnce && !readOnceReady
      ? 'Ẩn tài liệu read-once trước khi viết.'
      : 'Viết bản nháp tiếng Anh trước.'
  // Written retry, transfer and review lock the draft first so rating time never counts as writing time.
  const needsDraftLock = task.mode === 'written' && (phase === 'retry' || phase === 'transfer' || phase === 'review')
  const showRubricEditor = (phase === 'retry' || phase === 'transfer' || phase === 'review')
    && (!needsDraftLock || lockedDraft !== null)
  const responseBlockedReason = responseReady ? undefined : draftReason
  const lockBlockedReason = needsDraftLock && !lockedDraft ? 'Bấm "Chốt bản nháp" trước khi chấm rubric.' : undefined
  const ratingBlockedReason = allRated ? undefined : 'Chấm đủ các tiêu chí rubric trước.'
  const submitBlockedReason = responseBlockedReason ?? lockBlockedReason ?? ratingBlockedReason
  const timeLimitSeconds = task.outputContract.timeLimitSeconds
  return {
    lesson, task, entry, capabilityId, progress, recordAttempt, setActivePhase, setCurrentSection, setActiveProcessEvidence, setInputProgress, startLessonRepeat, session, setSession, confirmingRepeat, setConfirmingRepeat, response, setResponse, spokenSnapshot, setSpokenSnapshot, learnerOutput, setLearnerOutput, rubric, setRubric, retryFocusId, setRetryFocusId, independence, setIndependence, completionAssessment, setCompletionAssessment, completionKind, setCompletionKind, inputPracticeReady, setInputPracticeReady, focusMainAttemptWhenReady, setFocusMainAttemptWhenReady, learningLoopSummary, setLearningLoopSummary, readOnceClosedPhase, setReadOnceClosedPhase, processEvidence, setProcessEvidence, listenedBack, setListenedBack, listenBackChecks, setListenBackChecks, cueToSpeechStartMs, setCueToSpeechStartMs, lockedDraft, setLockedDraft, clockRunning, setClockRunning, elapsedSeconds, setElapsedSeconds, preparationStartedAt, outputStartedAt, learnerAudio, draftAudio, phase, taskTitleRef, mainAttemptButtonRef, writtenResponseRef, focusWrittenResponseWhenReady, previousPhase, isPilot, learningLoop, listenBackChecklistComplete, requiresPilotListenerCheck, firstAttempt, sectionCount, savedSectionIndex, sectionIndex, goToSection, requiredAutoCheckExerciseIds, autoCheckComplete, allRated, notMetCriterionIds, selectedRetryFocusId, canSubmitFeedback, retryFocus, practiceContext, requiresReadOnce, readOnceReady, responseReady, draftReason, needsDraftLock, showRubricEditor, responseBlockedReason, lockBlockedReason, ratingBlockedReason, submitBlockedReason, timeLimitSeconds
  }
}

export type TaskState = ReturnType<typeof useTaskState>
