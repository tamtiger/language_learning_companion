import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getBundledCatalog } from '../../content/catalog'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { LessonFlow } from './LessonFlow'

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
    await user.click(screen.getByRole('button', { name: /bắt đầu lượt chính/i }))
    await user.type(screen.getByRole('textbox'), 'A clearer issue update with impact and a request.')
    await user.click(screen.getByRole('button', { name: /đối chiếu rubric/i }))

    expect(screen.getByText(/model response — chỉ mở sau attempt/i)).toBeTruthy()
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) await user.click(button)
    await user.click(screen.getByRole('button', { name: /lưu self-feedback/i }))
    await user.type(screen.getByRole('textbox'), 'Retry with a concrete impact, owner and request.')
    await user.click(screen.getByRole('button', { name: /sang transfer/i }))
    await user.type(screen.getByRole('textbox'), 'Transfer update for delayed orders and reconciliation.')
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) await user.click(button)
    await user.click(screen.getByRole('button', { name: /hoàn thành transfer/i }))

    expect(screen.getByRole('heading', { name: /mission hoàn thành/i })).toBeTruthy()
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

  it('resumes and preserves completion for a legacy v1 lesson without fabricating evidence', async () => {
    const user = userEvent.setup()
    const lesson = getBundledCatalog().lessons.find((item) => item.sourceSchemaVersion === 'v1')
    if (!lesson) throw new Error('Legacy fixture missing')
    const lastSection = lesson.sections.at(-1)
    if (!lastSection) throw new Error('Legacy lesson has no sections')

    useAppStore.getState().setCurrentSection(lesson.lessonId, lastSection.id)
    const firstRender = render(<LessonFlow lesson={lesson} onBack={() => undefined} />)
    expect(screen.getByRole('button', { name: `${lesson.sections.length}. ${lastSection.title}` }).getAttribute('aria-current')).toBe('step')

    await user.click(screen.getByRole('button', { name: /hoàn thành bài/i }))
    expect(useAppStore.getState().lessonProgress[lesson.lessonId]?.recentAttempts).toEqual([])
    firstRender.unmount()

    render(<LessonFlow lesson={lesson} onBack={() => undefined} />)
    expect(screen.getByRole('heading', { name: /bài pronunciation đã hoàn thành/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /học lại từ đầu/i })).toBeTruthy()
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
