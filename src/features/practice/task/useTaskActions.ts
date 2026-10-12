import { buildEvidenceContract } from '../../../domain/progress/evidenceContract'
import type { AttemptEvidence } from '../../../domain/progress/progress'
import type { SpokenAttemptSnapshot } from '../spoken/SpokenResponse'
import { DEFAULT_INDEPENDENCE } from './taskConstants'
import type { SessionAttemptSnapshot } from './taskTypes'
import { countWords, attemptId } from './taskSession'
import type { TaskState } from './useTaskState'

export function useTaskActions(state: TaskState) {
  const { lesson, task, capabilityId, recordAttempt, startLessonRepeat, setSession, response, setResponse, spokenSnapshot, setSpokenSnapshot, learnerOutput, setLearnerOutput, rubric, setRubric, setRetryFocusId, independence, setIndependence, setCompletionAssessment, setCompletionKind, setInputPracticeReady, setFocusMainAttemptWhenReady, setLearningLoopSummary, setReadOnceClosedPhase, processEvidence, setProcessEvidence, listenedBack, setListenedBack, setListenBackChecks, cueToSpeechStartMs, setCueToSpeechStartMs, lockedDraft, setLockedDraft, setClockRunning, setElapsedSeconds, preparationStartedAt, outputStartedAt, listenBackChecklistComplete, requiresPilotListenerCheck } = state
  const lockDraft = () => {
    if (!response.trim()) return
    setClockRunning(false)
    setLockedDraft({
      kind: 'written', text: response,
      durationSeconds: Math.max(1, Math.ceil((Date.now() - (outputStartedAt.current ?? Date.now())) / 1_000)),
      wordCount: countWords(response), audioUrl: null
    })
  }

  const startOutput = () => {
    if (outputStartedAt.current === null) {
      outputStartedAt.current = Date.now()
      if (task.mode === 'written') setClockRunning(true)
      setCueToSpeechStartMs(Math.max(0, Date.now() - preparationStartedAt.current))
    }
  }
  const resetListenBackEvidence = () => {
    setListenedBack(false)
    setListenBackChecks([])
  }
  const handleSpokenStarted = () => {
    resetListenBackEvidence()
    startOutput()
  }
  const handleSpokenReady = (snapshot: SpokenAttemptSnapshot | null) => {
    setSpokenSnapshot(snapshot)
    if (snapshot === null) resetListenBackEvidence()
  }
  const createSnapshot = (): SessionAttemptSnapshot | null => {
    if (task.mode === 'spoken') return spokenSnapshot
    if (!response.trim()) return null
    if (lockedDraft) return lockedDraft
    return {
      kind: 'written', text: response,
      durationSeconds: Math.max(1, Math.ceil((Date.now() - (outputStartedAt.current ?? Date.now())) / 1_000)),
      wordCount: countWords(response), audioUrl: null
    }
  }
  const measuredPreparationSeconds = () => Math.max(
    0, Math.floor(((outputStartedAt.current ?? Date.now()) - preparationStartedAt.current) / 1_000)
  )
  const saveAttempt = (
    attemptPhase: AttemptEvidence['phase'],
    snapshot: SessionAttemptSnapshot,
    ratings = rubric,
    focusCriterionId?: string | null
  ) => {
    const attempt: AttemptEvidence = {
    attemptId: attemptId(), lessonId: lesson.lessonId, taskId: task.id,
    capabilityId, phase: attemptPhase,
    attemptedAt: new Date().toISOString(), durationSeconds: snapshot.durationSeconds,
    wordCount: snapshot.wordCount,
    rubric: Object.fromEntries(task.rubric.map((item) => [item.id, ratings[item.id] ?? 'not-rated'])),
    ...(focusCriterionId ? { focusCriterionId } : {}),
    independence: { ...independence, preparationSeconds: measuredPreparationSeconds() },
      process: processEvidence ? {
        ...processEvidence,
        listenedBack,
        listenBackChecklistCompleted: Boolean(snapshot.audioUrl) && requiresPilotListenerCheck && listenBackChecklistComplete,
        cueToSpeechStartMs
      } : null,
      completed: true
    }
    return recordAttempt(attempt, {
      reviewIntervals: lesson.reviewPolicy.intervalDays,
      contract: buildEvidenceContract(lesson)
    })
  }
  const resetResponse = (releaseLearnerOutput = true) => {
    if (releaseLearnerOutput) {
      if (learnerOutput?.kind === 'spoken') learnerOutput.release?.()
      setLearnerOutput(null)
    }
    spokenSnapshot?.release?.()
    setSpokenSnapshot(null)
    setResponse('')
    setIndependence(DEFAULT_INDEPENDENCE)
    setListenedBack(false)
    setListenBackChecks([])
    setCueToSpeechStartMs(null)
    preparationStartedAt.current = Date.now()
    outputStartedAt.current = null
    setLockedDraft(null)
    setClockRunning(false)
    setElapsedSeconds(0)
  }
  const beginRepeat = () => {
    resetResponse()
    startLessonRepeat(lesson.lessonId)
    setRubric({})
    setRetryFocusId(null)
    setCompletionAssessment(null)
    setCompletionKind('existing')
    setInputPracticeReady(!(
      (task.mode === 'spoken' && task.learningLoop)
      || (task.mode === 'written' && task.readingLadder)
    ))
    setFocusMainAttemptWhenReady(false)
    setLearningLoopSummary(null)
    setReadOnceClosedPhase(null)
    setProcessEvidence(null)
    setListenedBack(false)
    setListenBackChecks([])
    setSession({
      phase: 'baseline',
      baselineAttempted: false,
      rubricRated: false,
      transferCompleted: false
    })
  }
  return {
    lockDraft, startOutput, resetListenBackEvidence, handleSpokenStarted, handleSpokenReady, createSnapshot, measuredPreparationSeconds, saveAttempt, resetResponse, beginRepeat
  }
}
