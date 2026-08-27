import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getBundledCatalog } from '../../content/catalog'
import { useAppStore } from '../../shared/hooks/use_app_store'
import {
  createEmptyLessonProgress,
  type AttemptProcessEvidence,
  type DurableCapabilityPhase
} from '../../domain/progress/progress'
import { CapabilityTask } from './CapabilityTask'
import { ListenBackChecklist } from './ListenBackChecklist'

const recorderMocks = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(async () => 'blob:test-audio'),
  dispose: vi.fn()
}))

vi.mock('../lesson-player/media_recorder', () => ({
  LocalMediaError: class LocalMediaError extends Error { kind = 'error' },
  startLocalAudioRecording: recorderMocks.start
}))

vi.mock('./PerceptionPractice', () => ({
  PerceptionPractice: ({ onComplete }: { onComplete: (result: object) => void }) => (
    <button type="button" onClick={() => onComplete({
      pretestCorrect: 1,
      pretestTotal: 1,
      trainingCompleted: 1,
      posttestCorrect: 1,
      posttestTotal: 1,
      diagnosticMissedItemIds: [],
      optedOut: false,
      availableVariantCount: 1,
      variabilityQualified: false
    })}>Hoàn tất perception test</button>
  )
}))

vi.mock('./GuidedShadowing', () => ({
  GuidedShadowing: ({ steps, onComplete }: { steps: string[]; onComplete: (stepIds: string[]) => void }) => (
    <button type="button" onClick={() => onComplete([...steps])}>Hoàn tất shadowing test</button>
  )
}))

function mission() {
  const lesson = getBundledCatalog().lessons.find(
    (item) => item.lessonId === 'workplace-issue-update-b1'
  )
  if (!lesson?.performanceTask) throw new Error('Mission fixture missing')
  return { lesson, task: lesson.performanceTask }
}

function spokenMission() {
  const lesson = getBundledCatalog().lessons.find(
    (item) => item.lessonId === 'technical-interview-decision-b2'
  )
  if (!lesson?.performanceTask || lesson.performanceTask.mode !== 'spoken') {
    throw new Error('Spoken mission fixture missing')
  }
  return { lesson, task: { ...lesson.performanceTask, learningLoop: undefined } }
}

function spokenMissionWithLoop() {
  const lesson = getBundledCatalog().lessons.find(
    (item) => item.lessonId === 'technical-interview-decision-b2'
  )
  if (!lesson?.performanceTask || lesson.performanceTask.mode !== 'spoken' || !lesson.performanceTask.learningLoop) {
    throw new Error('Spoken learning-loop fixture missing')
  }
  return { lesson, task: lesson.performanceTask }
}

function pilotSpokenMissionWithLoop() {
  const lesson = getBundledCatalog().lessons.find(
    (item) => item.lessonId === 'meeting-disagree-and-recap-b2'
  )
  if (!lesson?.performanceTask || lesson.performanceTask.mode !== 'spoken' || !lesson.performanceTask.learningLoop) {
    throw new Error('Pilot spoken learning-loop fixture missing')
  }
  return { lesson, task: lesson.performanceTask }
}

function autoCheckExerciseIds(lesson: ReturnType<typeof mission>['lesson']): string[] {
  return lesson.sections.flatMap((section) => section.type === 'auto-check'
    ? section.exercises.map((exercise) => exercise.id)
    : [])
}

function completeAutoChecks(lesson: ReturnType<typeof mission>['lesson']) {
  act(() => {
    autoCheckExerciseIds(lesson).forEach((exerciseId) => {
      useAppStore.getState().markExerciseCorrect(lesson.lessonId, exerciseId)
    })
  })
}

const completedSpokenProcess: AttemptProcessEvidence = {
  perceptionPretestCorrect: 3,
  perceptionPretestTotal: 4,
  perceptionPosttestCorrect: 4,
  perceptionPosttestTotal: 4,
  perceptionTrainingCompleted: 6,
  availableVariantCount: 3,
  variabilityQualified: true,
  shadowingStepIds: ['listen', 'chunk-shadow', 'full-shadow', 'delayed-imitation', 'variation'],
  listenedBack: false,
  listenBackChecklistCompleted: false,
  cueToSpeechStartMs: null,
  interactionTurnIds: [],
  optedOut: false
}

function missionWithPracticeContexts() {
  const { lesson, task } = mission()
  const practiceContexts = {
    baseline: {
      title: 'Checkout incident brief',
      brief: 'Audience: platform handover team.',
      artifacts: [{ id: 'cold-alert', type: 'source' as const, title: 'Cold alert', format: 'code-snippet' as const, content: 'COLD_SIGNAL checkout_503=31%' }]
    },
    transfer: {
      title: 'Upload incident brief',
      brief: 'Audience: storage on-call.',
      artifacts: [{ id: 'transfer-alert', type: 'source' as const, title: 'Transfer alert', format: 'code-snippet' as const, content: 'TRANSFER_SIGNAL upload_failures=18%' }]
    },
    review: {
      title: 'Email queue brief',
      brief: 'Audience: messaging team.',
      artifacts: [{ id: 'review-alert', type: 'source' as const, title: 'Review alert', format: 'code-snippet' as const, content: 'REVIEW_SIGNAL queue_depth=4800' }]
    }
  }
  return {
    lesson,
    task: Object.assign({}, task, { practiceContexts }) as typeof task
  }
}

describe('CapabilityTask session evidence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    recorderMocks.start.mockResolvedValue({ stop: recorderMocks.stop, dispose: recorderMocks.dispose })
    useAppStore.getState().resetProgress()
  })

  it('shows the three-stage P0 journey only for a tagged pilot mission', () => {
    const pilot = getBundledCatalog().lessons.find(
      (item) => item.lessonId === 'meeting-disagree-and-recap-b2'
    )
    if (!pilot?.performanceTask) throw new Error('P0 pilot fixture missing')

    render(<CapabilityTask lesson={pilot} task={pilot.performanceTask} />)

    const journey = screen.getByRole('navigation', { name: /tiến trình pilot/i })
    expect(journey.textContent).toMatch(/Understand.*Retrieve.*Repair/i)
    expect(screen.getByText('Understand').getAttribute('aria-current')).toBe('step')
  })

  it('keeps listener checks locked until playback and requires every item', () => {
    const items = ['Intent is clear.', 'Critical facts are audible.']
    const view = render(
      <ListenBackChecklist items={items} checked={[false, false]} playbackCompleted={false} onChange={() => undefined} />
    )

    expect(screen.getAllByRole('checkbox').every((checkbox) => (checkbox as HTMLInputElement).disabled)).toBe(true)
    expect(screen.getByText(/checklist mở sau/i)).toBeTruthy()

    view.rerender(
      <ListenBackChecklist items={items} checked={[true, true]} playbackCompleted onChange={() => undefined} />
    )
    expect(screen.getByText(/listen-back đã đủ evidence/i)).toBeTruthy()
  })

  it('binds listen-back evidence to the current recording after redo', async () => {
    const user = userEvent.setup()
    const { lesson, task } = pilotSpokenMissionWithLoop()
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: {
          ...createEmptyLessonProgress(),
          status: 'in-progress',
          activePhase: 'transfer',
          activeProcessEvidence: completedSpokenProcess
        }
      }
    })
    render(<CapabilityTask lesson={lesson} task={task} />)

    const recordAndFinish = async () => {
      await user.click(screen.getByRole('button', { name: /bắt đầu ghi âm/i }))
      await screen.findByText(/đang ghi âm cục bộ/i)
      await waitFor(() => {
        expect((screen.getByRole('button', { name: /tôi đã nói xong/i }) as HTMLButtonElement).disabled).toBe(false)
      }, { timeout: 1_500 })
      await user.click(screen.getByRole('button', { name: /tôi đã nói xong/i }))
    }

    await recordAndFinish()
    fireEvent.ended(screen.getByLabelText(/bản ghi cục bộ/i))
    const listenerCheck = () => screen.getByRole('group', { name: /listener check/i })
    for (const checkbox of within(listenerCheck()).getAllByRole('checkbox')) await user.click(checkbox)
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) await user.click(button)
    expect((screen.getByRole('button', { name: /hoàn thành transfer/i }) as HTMLButtonElement).disabled).toBe(false)

    await user.click(screen.getByRole('button', { name: /làm lại/i }))
    await recordAndFinish()

    const currentChecklist = within(listenerCheck()).getAllByRole('checkbox') as HTMLInputElement[]
    expect(currentChecklist.every((checkbox) => checkbox.disabled && !checkbox.checked)).toBe(true)
    expect((screen.getByRole('button', { name: /hoàn thành transfer/i }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('shows the learner written output during self-feedback without persisting it', async () => {
    const user = userEvent.setup()
    const { lesson, task } = mission()
    render(<CapabilityTask lesson={lesson} task={task} />)

    await user.type(screen.getByRole('textbox'), 'Baseline output.')
    await user.click(screen.getByRole('button', { name: /lưu baseline/i }))
    completeAutoChecks(lesson)
    await user.click(screen.getByRole('button', { name: /bắt đầu lượt chính/i }))
    await user.type(screen.getByRole('textbox'), 'My unique measured incident update.')
    await user.click(screen.getByRole('button', { name: /đối chiếu rubric/i }))

    expect(screen.getByText('My unique measured incident update.')).toBeTruthy()
    expect(JSON.stringify(useAppStore.getState().lessonProgress)).not.toContain('My unique measured')
  })

  it('keeps the main attempt locked until every lesson auto-check is complete', async () => {
    const user = userEvent.setup()
    const { lesson, task } = mission()
    render(<CapabilityTask lesson={lesson} task={task} />)

    expect(document.activeElement).not.toBe(screen.getByRole('heading', { name: task.title }))
    await user.type(screen.getByRole('textbox'), 'Baseline output.')
    await user.click(screen.getByRole('button', { name: /lưu baseline/i }))
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: task.title }))
    const startMain = screen.getByRole('button', { name: /bắt đầu lượt chính/i }) as HTMLButtonElement
    expect(startMain.disabled).toBe(true)

    completeAutoChecks(lesson)
    expect(startMain.disabled).toBe(false)
    await user.click(startMain)
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: task.title }))
  })

  it('restores spoken input readiness from persisted process evidence', () => {
    const { lesson, task } = spokenMissionWithLoop()
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: {
          ...createEmptyLessonProgress(),
          status: 'in-progress',
          activePhase: 'input',
          activeProcessEvidence: completedSpokenProcess,
          completedExerciseIds: autoCheckExerciseIds(lesson)
        }
      }
    })

    render(<CapabilityTask lesson={lesson} task={task} />)

    expect((screen.getByRole('button', { name: /bắt đầu lượt chính/i }) as HTMLButtonElement).disabled).toBe(false)
    expect(screen.getByText('Lượt nói chính').getAttribute('aria-current')).toBe('step')
    expect(screen.getByText(/đã khôi phục tiến trình/i)).toBeTruthy()
    expect(screen.queryByText(/đã luyện bổ sung/i)).toBeNull()
  })

  it('restores an opted-out pronunciation status without claiming extra practice', () => {
    const { lesson, task } = spokenMissionWithLoop()
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: {
          ...createEmptyLessonProgress(),
          status: 'in-progress',
          activePhase: 'input',
          activeProcessEvidence: { ...completedSpokenProcess, optedOut: true },
          completedExerciseIds: autoCheckExerciseIds(lesson)
        }
      }
    })

    render(<CapabilityTask lesson={lesson} task={task} />)

    expect(screen.getByText(/đã bỏ qua cùng bài nghe/i)).toBeTruthy()
    expect(screen.queryByText(/đã luyện bổ sung/i)).toBeNull()
  })

  it('moves focus to the main-attempt CTA when the spoken learning loop completes', async () => {
    const user = userEvent.setup()
    const { lesson, task } = spokenMissionWithLoop()
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: {
          ...createEmptyLessonProgress(),
          status: 'in-progress',
          activePhase: 'input',
          completedExerciseIds: autoCheckExerciseIds(lesson)
        }
      }
    })
    render(<CapabilityTask lesson={lesson} task={task} />)

    await user.click(screen.getByRole('button', { name: /hoàn tất perception test/i }))
    await user.click(screen.getByRole('button', { name: /hoàn tất shadowing test/i }))

    const startMain = screen.getByRole('button', { name: /bắt đầu lượt chính/i }) as HTMLButtonElement
    expect(startMain.disabled).toBe(false)
    expect(document.activeElement).toBe(startMain)
  })

  it('moves focus to the main-attempt CTA when the reading ladder completes', async () => {
    const user = userEvent.setup()
    const lesson = getBundledCatalog().lessons.find((item) => item.lessonId === 'technical-doc-action-b1')
    if (!lesson?.performanceTask || lesson.performanceTask.mode !== 'written' || !lesson.performanceTask.readingLadder) {
      throw new Error('Reading ladder fixture missing')
    }
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: {
          ...createEmptyLessonProgress(),
          status: 'in-progress',
          activePhase: 'input',
          completedExerciseIds: autoCheckExerciseIds(lesson)
        }
      }
    })
    render(<CapabilityTask lesson={lesson} task={lesson.performanceTask} />)

    await user.click(screen.getByRole('button', { name: /bắt đầu trích xuất/i }))
    for (const item of lesson.performanceTask.readingLadder.extractionItems) {
      await user.click(screen.getByLabelText(item.correctAnswer))
    }
    await user.click(screen.getByRole('button', { name: /sang explain/i }))
    await user.type(screen.getByRole('textbox'), 'A safe sequence with a measurable signal and rollback owner.')
    for (const checkbox of screen.getAllByRole('checkbox')) await user.click(checkbox)
    await user.click(screen.getByRole('button', { name: /hoàn thành reading ladder/i }))

    const startMain = screen.getByRole('button', { name: /bắt đầu lượt chính/i }) as HTMLButtonElement
    expect(startMain.disabled).toBe(false)
    expect(document.activeElement).toBe(startMain)
  })

  it('shows cold-attempt artifacts before input while keeping instruction and model locked', () => {
    const { lesson, task } = missionWithPracticeContexts()
    render(<CapabilityTask lesson={lesson} task={task} />)

    expect(screen.getByText(/COLD_SIGNAL checkout_503=31%/i)).toBeTruthy()
    expect(screen.queryByText(/Incident notes/i)).toBeNull()
    expect(screen.queryByText(task.modelResponse)).toBeNull()
    expect(screen.queryByText(/TRANSFER_SIGNAL/i)).toBeNull()
  })

  it('hides a read-once technical source before enabling baseline output', async () => {
    const user = userEvent.setup()
    const lesson = getBundledCatalog().lessons.find((item) => item.lessonId === 'technical-doc-action-b1')
    if (!lesson?.performanceTask) throw new Error('Technical reading fixture missing')

    render(<CapabilityTask lesson={lesson} task={lesson.performanceTask} />)

    expect(screen.getByText(/cachectl migrate --target v2/i)).toBeTruthy()
    expect(screen.getByText(/read once and write the actions from memory/i)).toBeTruthy()
    expect(screen.queryByText(lesson.performanceTask.modelResponse)).toBeNull()
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).disabled).toBe(true)
    await user.click(screen.getByRole('button', { name: /đã đọc một lần.*ẩn tài liệu/i }))
    expect(screen.queryByText(/cachectl migrate --target v2/i)).toBeNull()
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).disabled).toBe(false)
    await user.type(screen.getByRole('textbox'), 'Prerequisite, command, success signal and rollback from memory.')
    await user.click(screen.getByRole('button', { name: /lưu baseline/i }))
    expect(screen.getByText(/reading ladder.*bước 1\/3/i)).toBeTruthy()
    expect((screen.getByRole('button', { name: /bắt đầu lượt chính/i }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('resets spoken capture when baseline changes to the performance phase', async () => {
    const user = userEvent.setup()
    const { lesson, task } = spokenMission()
    render(<CapabilityTask lesson={lesson} task={task} />)

    expect(screen.getByText(/Nhiệm vụ nói · Lượt đầu/i)).toBeTruthy()
    expect(screen.queryByText(/spoken capability task/i)).toBeNull()

    await user.click(screen.getByRole('button', { name: /bắt đầu timer-only/i }))
    await waitFor(() => {
      expect((screen.getByRole('button', { name: /tôi đã nói xong/i }) as HTMLButtonElement).disabled).toBe(false)
    }, { timeout: 1_500 })
    await user.click(screen.getByRole('button', { name: /tôi đã nói xong/i }))
    await user.click(screen.getByRole('button', { name: /lưu baseline/i }))
    completeAutoChecks(lesson)
    await user.click(screen.getByRole('button', { name: /bắt đầu lượt chính/i }))

    expect(screen.getByRole('button', { name: /bắt đầu timer-only/i })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /làm lại/i })).toBeNull()
    expect(screen.getByText('0s')).toBeTruthy()
  })

  it('shows only the unseen transfer artifacts when resuming transfer', () => {
    const { lesson, task } = missionWithPracticeContexts()
    useAppStore.getState().setActivePhase(lesson.lessonId, 'transfer')
    render(<CapabilityTask lesson={lesson} task={task} />)

    expect(screen.getByText(/TRANSFER_SIGNAL upload_failures=18%/i)).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Transfer alert', level: 4 })).toBeTruthy()
    expect(screen.queryByText(/COLD_SIGNAL/i)).toBeNull()
    expect(screen.queryByText(task.modelResponse)).toBeNull()
    expect(screen.getByText(/Bộ dữ kiện công việc · chỉ dùng cho lượt này/i)).toBeTruthy()
  })

  it('resumes the durable performance phase instead of inferring retry from attempts', () => {
    const { lesson, task } = mission()
    useAppStore.getState().setActivePhase(lesson.lessonId, 'performance')
    render(<CapabilityTask lesson={lesson} task={task} />)

    expect(screen.getByText(/Nhiệm vụ viết · Lượt chính/i)).toBeTruthy()
    expect(screen.queryByText(/(?:spoken|written) capability task/i)).toBeNull()
    expect(screen.getByRole('button', { name: /đối chiếu rubric/i })).toBeTruthy()
  })

  it.each([
    ['input', /Nhiệm vụ viết · Học có hướng dẫn/i],
    ['retry', /Nhiệm vụ viết · Làm lại có trọng tâm/i],
    ['transfer', /Nhiệm vụ viết · Tình huống mới/i]
  ] as const)('resumes the durable %s checkpoint', (activePhase, label) => {
    const { lesson, task } = mission()
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: { ...createEmptyLessonProgress(), status: 'in-progress', activePhase: activePhase as DurableCapabilityPhase }
      }
    })
    render(<CapabilityTask lesson={lesson} task={task} />)
    expect(screen.getByText(label)).toBeTruthy()
  })

  it('gives a due review precedence over a stored phase', () => {
    const { lesson, task } = mission()
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: {
          ...createEmptyLessonProgress(),
          status: 'completed',
          activePhase: 'transfer',
          nextReviewAt: '2020-01-01T00:00:00.000Z'
        }
      }
    })
    render(<CapabilityTask lesson={lesson} task={task} />)
    expect(screen.getByText(/Nhiệm vụ viết · Ôn lại theo lịch/i)).toBeTruthy()
  })

  it('resumes an active repeat cycle before an overdue review', () => {
    const { lesson, task } = mission()
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: {
          ...createEmptyLessonProgress(),
          status: 'in-progress',
          activePhase: 'input',
          nextReviewAt: '2020-01-01T00:00:00.000Z'
        }
      }
    })

    render(<CapabilityTask lesson={lesson} task={task} />)

    expect(screen.getByText(/Nhiệm vụ viết · Học có hướng dẫn/i)).toBeTruthy()
    expect(screen.queryByText(/Nhiệm vụ viết · Ôn lại theo lịch/i)).toBeNull()
  })

  it('uses transfer-specific copy after completing a transfer attempt', async () => {
    const user = userEvent.setup()
    const { lesson, task } = mission()
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: {
          ...createEmptyLessonProgress(),
          status: 'in-progress',
          activePhase: 'transfer'
        }
      }
    })
    render(<CapabilityTask lesson={lesson} task={task} />)

    await user.type(screen.getByRole('textbox'), 'A concise transfer attempt with new evidence.')
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) {
      await user.click(button)
    }
    await user.click(screen.getByRole('button', { name: /hoàn thành transfer/i }))

    expect(screen.getByText(/transfer evidence đã được lưu/i)).toBeTruthy()
    expect(screen.queryByText(/review đã được lưu/i)).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: /mission hoàn thành/i }))
  })

  it('uses review-specific copy after completing a due review', async () => {
    const user = userEvent.setup()
    const { lesson, task } = mission()
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: {
          ...createEmptyLessonProgress(),
          status: 'completed',
          nextReviewAt: '2020-01-01T00:00:00.000Z'
        }
      }
    })
    render(<CapabilityTask lesson={lesson} task={task} />)

    await user.type(screen.getByRole('textbox'), 'A fresh review response using the new incident evidence.')
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) {
      await user.click(button)
    }
    await user.click(screen.getByRole('button', { name: /lưu review/i }))

    expect(screen.getByText(/review đã được lưu/i)).toBeTruthy()
    expect(screen.queryByText(/transfer evidence đã được lưu/i)).toBeNull()
  })

  it('starts a new baseline from the completed screen without deleting history', async () => {
    const user = userEvent.setup()
    const { lesson, task } = mission()
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: {
          ...createEmptyLessonProgress(),
          status: 'completed',
          attemptCount: 4,
          transferCompleted: true,
          nextReviewAt: '2099-01-01T00:00:00.000Z'
        }
      }
    })
    render(<CapabilityTask lesson={lesson} task={task} />)

    expect(screen.getByRole('heading', { name: /mission hoàn thành/i })).toBeTruthy()
    expect(screen.getByText(/mission này đã hoàn tất/i)).toBeTruthy()
    expect(screen.queryByText(/transfer evidence đã được lưu/i)).toBeNull()
    expect(screen.queryByText(/review đã được lưu/i)).toBeNull()
    await user.click(screen.getByRole('button', { name: /luyện lại mission/i }))

    expect(screen.getByText(/Nhiệm vụ viết · Lượt đầu/i)).toBeTruthy()
    expect(useAppStore.getState().lessonProgress[lesson.lessonId]).toMatchObject({
      status: 'in-progress',
      attemptCount: 4,
      transferCompleted: false,
      nextReviewAt: '2099-01-01T00:00:00.000Z'
    })
  })
})
