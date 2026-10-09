import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, it, vi } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import { createEmptyLessonProgress, type DurableCapabilityPhase, type InputProgress, type LessonProgress } from '@/domain/progress/progress'
import { LessonFlow } from '@/features/lesson/LessonFlow'
import { useAppStore } from '@/shared/hooks/useAppStore'

import { expectNoViolations } from '../../helpers/axe'

vi.mock('@/features/lesson-player/mediaRecorder', () => ({
  LocalMediaError: class LocalMediaError extends Error { kind = 'error' },
  startLocalAudioRecording: vi.fn()
}))

const WRITTEN = 'workplace-issue-update-b1'
const READING = 'technical-doc-action-b1'
const SPOKEN = 'technical-interview-decision-b2'

function lessonOf(lessonId: string) {
  const lesson = getBundledCatalog().lessons.find((item) => item.lessonId === lessonId)
  if (!lesson) throw new Error(`Fixture missing: ${lessonId}`)
  return lesson
}

function seed(lessonId: string, patch: Partial<LessonProgress> = {}) {
  useAppStore.setState({
    lessonProgress: { [lessonId]: { ...createEmptyLessonProgress(), ...patch } }
  })
}

function at(lessonId: string, activePhase: DurableCapabilityPhase, extra: Partial<LessonProgress> = {}) {
  seed(lessonId, { status: 'in-progress', activePhase, ...extra })
}

async function check(lessonId: string, label: string) {
  const { container } = render(<LessonFlow lesson={lessonOf(lessonId)} onBack={() => undefined} />)
  await expectNoViolations(container, label)
  return container
}

describe('axe: lesson flow phases', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it('written mission: baseline, input, performance, retry and transfer', async () => {
    await check(WRITTEN, 'written baseline')
    for (const [phase, label] of [['input', 'written input'], ['performance', 'written performance'], ['retry', 'written retry'], ['transfer', 'written transfer']] as const) {
      document.body.innerHTML = ''
      at(WRITTEN, phase)
      await check(WRITTEN, label)
    }
  })

  it('written mission: baseline saved, self-feedback, locked retry and a missed transfer', async () => {
    const user = userEvent.setup()
    at(WRITTEN, 'performance')
    const { container, unmount } = render(<LessonFlow lesson={lessonOf(WRITTEN)} onBack={() => undefined} />)
    await user.type(screen.getByRole('textbox'), 'A first update in English.')
    await user.click(screen.getByRole('button', { name: /đối chiếu rubric/i }))
    await expectNoViolations(container, 'written self-feedback')
    unmount()

    at(WRITTEN, 'retry')
    const retry = render(<LessonFlow lesson={lessonOf(WRITTEN)} onBack={() => undefined} />)
    await user.type(screen.getByRole('textbox'), 'A retry update in English.')
    await user.click(screen.getByRole('button', { name: /chốt bản nháp/i }))
    await expectNoViolations(retry.container, 'written retry locked')
    retry.unmount()

    at(WRITTEN, 'transfer')
    const transfer = render(<LessonFlow lesson={lessonOf(WRITTEN)} onBack={() => undefined} />)
    await user.type(screen.getByRole('textbox'), 'Too short.')
    await user.click(screen.getByRole('button', { name: /chốt bản nháp/i }))
    for (const button of screen.getAllByRole('button', { name: 'Đạt' })) await user.click(button)
    await user.click(screen.getByRole('button', { name: /hoàn thành transfer/i }))
    await expectNoViolations(transfer.container, 'written transfer missed')
  })

  it('written mission: completed with confirmation, and a due review', async () => {
    const user = userEvent.setup()
    seed(WRITTEN, { status: 'completed', transferCompleted: true, nextReviewAt: '2099-01-01T00:00:00.000Z' })
    const done = render(<LessonFlow lesson={lessonOf(WRITTEN)} onBack={() => undefined} />)
    await expectNoViolations(done.container, 'written completed')
    await user.click(screen.getByRole('button', { name: /luyện lại mission/i }))
    await expectNoViolations(done.container, 'written repeat confirmation')
    done.unmount()

    seed(WRITTEN, { status: 'completed', transferCompleted: true, nextReviewAt: '2000-01-01T00:00:00.000Z' })
    await check(WRITTEN, 'written review')
  })

  it('reading mission: read-once source and each reading-ladder stage', async () => {
    await check(READING, 'reading baseline with source')

    document.body.innerHTML = ''
    at(READING, 'input')
    await check(READING, 'reading ladder read')

    for (const [ladder, label] of [
      [{ stage: 'extract', answers: {} }, 'reading ladder extract'],
      [{ stage: 'apply', answers: {} }, 'reading ladder apply']
    ] as const) {
      document.body.innerHTML = ''
      at(READING, 'input', { inputProgress: { ladder } as InputProgress })
      await check(READING, label)
    }
  })

  it('spoken mission: perception, shadowing, performance and self-feedback', async () => {
    const user = userEvent.setup()
    at(SPOKEN, 'input')
    const perception = render(<LessonFlow lesson={lessonOf(SPOKEN)} onBack={() => undefined} />)
    await expectNoViolations(perception.container, 'spoken perception')
    await user.click(screen.getByRole('button', { name: /bỏ qua vì audio không phù hợp/i }))
    await expectNoViolations(perception.container, 'spoken after skipping perception')
    perception.unmount()

    const fixture = lessonOf(SPOKEN).performanceTask
    if (fixture?.mode !== 'spoken' || !fixture.learningLoop) throw new Error('Spoken loop fixture missing')
    at(SPOKEN, 'input', {
      inputProgress: {
        loop: {
          stage: 'guided-shadowing',
          pronunciationStatus: 'not-needed',
          requiredShadowingStepIds: [...fixture.learningLoop.shadowingSteps],
          completedShadowingSteps: [],
          perception: {
            pretestCorrect: 3, pretestTotal: 4, trainingCompleted: 6, posttestCorrect: 4, posttestTotal: 4,
            diagnosticMissedItemIds: [], availableVariantCount: 3, variabilityQualified: true, optedOut: false
          }
        },
        shadowingIndex: 1
      }
    })
    await check(SPOKEN, 'spoken shadowing')

    document.body.innerHTML = ''
    at(SPOKEN, 'performance')
    await check(SPOKEN, 'spoken performance')

    document.body.innerHTML = ''
    at(SPOKEN, 'retry')
    await check(SPOKEN, 'spoken retry')

    document.body.innerHTML = ''
    seed(SPOKEN)
    await check(SPOKEN, 'spoken baseline')
  })
})
