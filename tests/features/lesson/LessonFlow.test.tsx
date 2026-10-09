import { beforeEach, describe, expect, it } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getBundledCatalog } from '@/content/catalog'
import type { CanonicalLesson, Exercise } from '@/content/schema'
import { buildEvidenceContract } from '@/domain/progress/evidenceContract'
import { createEmptyLessonProgress } from '@/domain/progress/progress'
import { useAppStore } from '@/shared/hooks/useAppStore'
import { LessonFlow } from '@/features/lesson/LessonFlow'

/** A written response of exactly `count` English-looking words (satisfies minWords/maxWords). */
function words(count: number, seed = 'detail') {
  return Array.from({ length: count }, (_, index) => `${seed}${index}`).join(' ')
}

function completeRequiredAutoChecks(lesson: CanonicalLesson) {
  act(() => {
    lesson.sections.forEach((section) => {
      if (section.type !== 'auto-check') return
      section.exercises.forEach((exercise) => {
        useAppStore.getState().markExerciseCorrect(lesson.lessonId, exercise.id)
      })
    })
  })
}

async function answerExercise(
  user: ReturnType<typeof userEvent.setup>,
  fieldset: HTMLElement,
  exercise: Exercise
) {
  const scope = within(fieldset)
  if (exercise.type === 'choice') {
    for (const answer of exercise.correctAnswer) await user.click(scope.getByLabelText(answer))
    return
  }
  if (exercise.type === 'fill') {
    await user.type(scope.getByRole('textbox'), exercise.correctAnswer[0])
    return
  }
  if (exercise.type === 'matching') {
    for (const pair of exercise.matchingPairs ?? []) {
      await user.selectOptions(scope.getByRole('combobox', { name: pair.key }), pair.value)
    }
    return
  }
  for (const answer of exercise.correctAnswer) {
    await user.click(scope.getByRole('button', { name: `Thêm ${answer}` }))
  }
}

describe('generic capability lesson flow', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it('keeps the model locked until baseline and completes a written transfer', async () => {
    const user = userEvent.setup()
    const lesson = getBundledCatalog().lessons.find(
      (item) => item.lessonId === 'workplace-issue-update-b1'
    )
    if (!lesson) throw new Error('Mission fixture missing')

    render(<LessonFlow lesson={lesson} onBack={() => undefined} />)
    expect(screen.queryByText(/model response — chỉ mở sau attempt/i)).toBeNull()
    expect(screen.queryByText(/schema\s+v[123]/i)).toBeNull()

    await user.type(screen.getByRole('textbox'), 'Initial issue update in English.')
    await user.click(screen.getByRole('button', { name: /lưu baseline/i }))
    completeRequiredAutoChecks(lesson)
    await user.click(screen.getByRole('button', { name: /bắt đầu lượt chính/i }))
    await user.type(screen.getByRole('textbox'), 'A clearer issue update with impact and a request.')
    await user.click(screen.getByRole('button', { name: /đối chiếu rubric/i }))

    expect(screen.getByText(/model response — chỉ mở sau attempt/i)).toBeTruthy()
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) await user.click(button)
    await user.click(screen.getByRole('button', { name: /lưu self-feedback/i }))
    await user.type(screen.getByRole('textbox'), 'Retry with a concrete impact, owner and request.')
    expect((screen.getByRole('button', { name: /sang transfer/i }) as HTMLButtonElement).disabled).toBe(true)
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) await user.click(button)
    await user.click(screen.getByRole('button', { name: /sang transfer/i }))
    await user.click(screen.getByRole('textbox'))
    await user.paste(words(80, 'transfer'))
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) await user.click(button)
    await user.click(screen.getByRole('button', { name: /hoàn thành transfer/i }))

    expect(screen.getByRole('heading', { name: /mission hoàn thành/i })).toBeTruthy()
    const attempts = useAppStore.getState().lessonProgress[lesson.lessonId]?.recentAttempts ?? []
    expect(attempts.every((attempt) => attempt.durationSeconds > 0)).toBe(true)
    expect(attempts.every((attempt) => (attempt.wordCount ?? 0) > 0)).toBe(true)
  }, 15_000)

  it('keeps a transfer that misses the output contract open for another try', async () => {
    const user = userEvent.setup()
    const lesson = getBundledCatalog().lessons.find(
      (item) => item.lessonId === 'workplace-issue-update-b1'
    )
    if (!lesson) throw new Error('Mission fixture missing')
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: { ...createEmptyLessonProgress(), status: 'in-progress', activePhase: 'transfer' }
      }
    })

    render(<LessonFlow lesson={lesson} onBack={() => undefined} />)
    await user.type(screen.getByRole('textbox'), 'Too short for the transfer contract.')
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) await user.click(button)
    await user.click(screen.getByRole('button', { name: /hoàn thành transfer/i }))

    expect(screen.queryByRole('heading', { name: /mission hoàn thành/i })).toBeNull()
    expect(screen.getByRole('status', { name: /kết quả transfer/i }).textContent).toMatch(/chưa đạt.*ngắn hơn yêu cầu/i)
    const missed = useAppStore.getState().lessonProgress[lesson.lessonId]
    expect(missed).toMatchObject({ status: 'in-progress', activePhase: 'transfer', transferCompleted: false, nextReviewAt: null })
    expect(missed.recentAttempts[0].assessment?.qualifies).toBe(false)

    expect(screen.getByText(/Nhiệm vụ viết · Tình huống mới/i)).toBeTruthy()
    await user.click(screen.getByRole('textbox'))
    await user.paste(words(80, 'retry'))
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) await user.click(button)
    await user.click(screen.getByRole('button', { name: /hoàn thành transfer/i }))

    expect(screen.getByRole('heading', { name: /mission hoàn thành/i })).toBeTruthy()
    const passed = useAppStore.getState().lessonProgress[lesson.lessonId]
    expect(passed).toMatchObject({ status: 'completed', transferCompleted: true })
    expect(passed.nextReviewAt).not.toBeNull()
    expect(passed.recentAttempts).toHaveLength(2)
  })

  it('reports a review that missed the contract and keeps the review stage', async () => {
    const user = userEvent.setup()
    const lesson = getBundledCatalog().lessons.find(
      (item) => item.lessonId === 'workplace-issue-update-b1'
    )
    if (!lesson) throw new Error('Mission fixture missing')
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: {
          ...createEmptyLessonProgress(),
          status: 'completed',
          transferCompleted: true,
          reviewStage: 1,
          nextReviewAt: '2026-01-01T00:00:00.000Z'
        }
      }
    })

    render(<LessonFlow lesson={lesson} onBack={() => undefined} />)
    await user.type(screen.getByRole('textbox'), 'Too short to count as a review.')
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) await user.click(button)
    await user.click(screen.getByRole('button', { name: /lưu review/i }))

    expect(screen.getByRole('status', { name: /kết quả review/i }).textContent).toMatch(/chưa đạt.*ngắn hơn yêu cầu/i)
    expect(useAppStore.getState().lessonProgress[lesson.lessonId].reviewStage).toBe(1)
  })

  it('turns a not-met rubric item into a persisted retry focus', async () => {
    const user = userEvent.setup()
    const lesson = getBundledCatalog().lessons.find(
      (item) => item.lessonId === 'workplace-issue-update-b1'
    )
    const task = lesson?.performanceTask
    if (!lesson || !task) throw new Error('Mission fixture missing')

    render(<LessonFlow lesson={lesson} onBack={() => undefined} />)
    await user.type(screen.getByRole('textbox'), 'Initial issue update.')
    await user.click(screen.getByRole('button', { name: /lưu baseline/i }))
    completeRequiredAutoChecks(lesson)
    await user.click(screen.getByRole('button', { name: /bắt đầu lượt chính/i }))
    await user.type(screen.getByRole('textbox'), 'Main issue update.')
    await user.click(screen.getByRole('button', { name: /đối chiếu rubric/i }))

    const notMetButtons = screen.getAllByRole('button', { name: 'Chưa đạt' })
    await user.click(notMetButtons[0])
    for (const button of screen.getAllByRole('button', { name: 'Đạt' }).slice(1)) {
      await user.click(button)
    }
    expect((screen.getByRole('button', { name: /lưu self-feedback/i }) as HTMLButtonElement).disabled).toBe(true)

    await user.click(screen.getByRole('radio', { name: task.rubric[0].label }))
    await user.click(screen.getByRole('button', { name: /lưu self-feedback/i }))
    expect(screen.getByText(/ưu tiên retry/i)).toBeTruthy()
    expect(screen.getByText(task.rubric[0].description)).toBeTruthy()

    await user.type(screen.getByRole('textbox'), 'Retry focused on the missing criterion.')
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) await user.click(button)
    await user.click(screen.getByRole('button', { name: /sang transfer/i }))

    const retryAttempt = useAppStore.getState().lessonProgress[lesson.lessonId]
      ?.recentAttempts.find((attempt) => attempt.phase === 'retry')
    expect(retryAttempt?.focusCriterionId).toBe(task.rubric[0].id)
    expect(retryAttempt?.rubric[task.rubric[0].id]).toBe('met')
  })

  it('resumes after a persisted baseline and records learner-reported independence', async () => {
    const user = userEvent.setup()
    const lesson = getBundledCatalog().lessons.find(
      (item) => item.lessonId === 'workplace-issue-update-b1'
    )
    if (!lesson) throw new Error('Mission fixture missing')

    const firstRender = render(<LessonFlow lesson={lesson} onBack={() => undefined} />)
    await user.type(screen.getByRole('textbox'), 'A baseline response completed with translation help.')
    await user.click(screen.getByRole('checkbox', { name: /dùng công cụ dịch/i }))
    await user.click(screen.getByRole('button', { name: /lưu baseline/i }))

    expect(useAppStore.getState().lessonProgress[lesson.lessonId]?.recentAttempts[0]?.independence.usedTranslation).toBe(true)
    firstRender.unmount()

    render(<LessonFlow lesson={lesson} onBack={() => undefined} />)
    expect(screen.getByRole('button', { name: /bắt đầu lượt chính/i })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /lưu baseline/i })).toBeNull()
  })

  it('requires every pronunciation auto-check to be correct and restart clears completion', async () => {
    const user = userEvent.setup()
    const lesson = getBundledCatalog().lessons.find((item) => item.sourceSchemaVersion === 'v1')
    if (!lesson) throw new Error('Legacy fixture missing')
    const lastSection = lesson.sections.at(-1)
    if (!lastSection || lastSection.type !== 'auto-check') throw new Error('Pronunciation auto-check missing')

    useAppStore.getState().setCurrentSection(lesson.lessonId, lastSection.id)
    const firstRender = render(<LessonFlow lesson={lesson} onBack={() => undefined} />)
    expect(screen.getByRole('button', { name: `${lesson.sections.length}. ${lastSection.title}` }).getAttribute('aria-current')).toBe('step')

    const finish = screen.getByRole('button', { name: /hoàn thành bài/i }) as HTMLButtonElement
    expect(finish.disabled).toBe(true)
    for (const exercise of lastSection.exercises) {
      const fieldset = screen.getByText(exercise.question).closest('fieldset')
      if (!fieldset) throw new Error('Exercise fieldset missing')
      await answerExercise(user, fieldset, exercise)
      await user.click(within(fieldset).getByRole('button', { name: /kiểm tra/i }))
    }
    expect(finish.disabled).toBe(false)
    await user.click(finish)
    expect(useAppStore.getState().lessonProgress[lesson.lessonId]?.recentAttempts).toEqual([])
    firstRender.unmount()

    render(<LessonFlow lesson={lesson} onBack={() => undefined} />)
    expect(screen.getByRole('heading', { name: /bài pronunciation đã hoàn thành/i })).toBeTruthy()
    expect(screen.getByText(/câu hỏi kiến thức/i)).toBeTruthy()
    expect(screen.getByText(/không phải đánh giá pronunciation performance/i)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /học lại từ đầu/i }))
    expect(useAppStore.getState().lessonProgress[lesson.lessonId]?.completedExerciseIds).toEqual([])
  })

  it('opens a due delayed review and reschedules it after rubric submission', async () => {
    const user = userEvent.setup()
    const lesson = getBundledCatalog().lessons.find(
      (item) => item.lessonId === 'workplace-issue-update-b1'
    )
    const task = lesson?.performanceTask
    if (!lesson || !task) throw new Error('Mission fixture missing')

    useAppStore.getState().recordCapabilityAttempt({
      attemptId: 'completed-transfer',
      lessonId: lesson.lessonId,
      taskId: task.id,
      capabilityId: 'workplace-communication',
      phase: 'transfer',
      attemptedAt: '2026-01-01T00:00:00.000Z',
      durationSeconds: 60,
      wordCount: 80,
      rubric: Object.fromEntries(task.rubric.map((item) => [item.id, 'met'])),
      independence: {
        usedVietnamese: false,
        usedTranslation: false,
        usedModelAnswer: false,
        hintCount: 0,
        preparationSeconds: task.independenceContract.preparationSeconds
      },
      completed: true
    }, { reviewIntervals: lesson.reviewPolicy.intervalDays, contract: buildEvidenceContract(lesson) })

    render(<LessonFlow lesson={lesson} onBack={() => undefined} />)
    expect(screen.getByText(/Nhiệm vụ viết · Ôn lại theo lịch/i)).toBeTruthy()
    await user.click(screen.getByRole('textbox'))
    await user.paste(words(80, 'review'))
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) await user.click(button)
    await user.click(screen.getByRole('button', { name: /lưu review/i }))

    expect(screen.getByRole('heading', { name: /mission hoàn thành/i })).toBeTruthy()
    const progress = useAppStore.getState().lessonProgress[lesson.lessonId]
    expect(progress?.reviewStage).toBe(1)
    expect(progress?.nextReviewAt).not.toBeNull()
    expect(progress?.recentAttempts.at(-1)?.phase).toBe('review')
  })
})
