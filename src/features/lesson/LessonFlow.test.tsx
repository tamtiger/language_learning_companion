import { beforeEach, describe, expect, it } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getBundledCatalog } from '../../content/catalog'
import type { CanonicalLesson, Exercise } from '../../content/schema'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { LessonFlow } from './LessonFlow'

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
    await user.type(screen.getByRole('textbox'), 'Transfer update for delayed orders and reconciliation.')
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) await user.click(button)
    await user.click(screen.getByRole('button', { name: /hoàn thành transfer/i }))

    expect(screen.getByRole('heading', { name: /mission hoàn thành/i })).toBeTruthy()
    const attempts = useAppStore.getState().lessonProgress[lesson.lessonId]?.recentAttempts ?? []
    expect(attempts.every((attempt) => attempt.durationSeconds > 0)).toBe(true)
    expect(attempts.every((attempt) => (attempt.wordCount ?? 0) > 0)).toBe(true)
  }, 15_000)

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
      wordCount: 10,
      rubric: Object.fromEntries(task.rubric.map((item) => [item.id, 'met'])),
      independence: {
        usedVietnamese: false,
        usedTranslation: false,
        usedModelAnswer: false,
        hintCount: 0,
        preparationSeconds: task.independenceContract.preparationSeconds
      },
      completed: true
    }, lesson.reviewPolicy.intervalDays)

    render(<LessonFlow lesson={lesson} onBack={() => undefined} />)
    expect(screen.getByText(/capability task · review/i)).toBeTruthy()
    await user.type(screen.getByRole('textbox'), 'A fresh review response in a changed incident context.')
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) await user.click(button)
    await user.click(screen.getByRole('button', { name: /lưu review/i }))

    expect(screen.getByRole('heading', { name: /mission hoàn thành/i })).toBeTruthy()
    const progress = useAppStore.getState().lessonProgress[lesson.lessonId]
    expect(progress?.reviewStage).toBe(1)
    expect(progress?.nextReviewAt).not.toBeNull()
    expect(progress?.recentAttempts.at(-1)?.phase).toBe('review')
  })
})
