import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import type { LearningLoopV1 } from '@/content/schema'
import { createEmptyLessonProgress, type InputProgress } from '@/domain/progress/progress'
import { CapabilityTask } from '@/features/practice/CapabilityTask'
import { LearningLoopPractice } from '@/features/practice/LearningLoopPractice'
import { PerceptionPractice } from '@/features/practice/PerceptionPractice'
import { ReadingLadderPractice } from '@/features/practice/ReadingLadderPractice'
import { useAppStore } from '@/shared/hooks/useAppStore'

const audio = { kind: 'speech-synthesis' as const, text: 'tests', locale: 'en-US', voiceHints: ['English'] }

function perception(): LearningLoopV1['perception'] {
  const item = (id: string) => ({
    id, audio, question: 'What did you hear?', options: ['test', 'tests'], correctAnswer: 'tests', feedback: 'Listen for /s/.'
  })
  return {
    pretest: Array.from({ length: 4 }, (_, index) => item(`pre-${index}`)),
    training: Array.from({ length: 6 }, (_, index) => item(`train-${index}`)),
    posttest: Array.from({ length: 4 }, (_, index) => item(`post-${index}`))
  }
}

async function answerAndNext(user: ReturnType<typeof userEvent.setup>, answer: string, nextName: RegExp) {
  await user.click(screen.getByRole('button', { name: answer }))
  await user.click(screen.getByRole('button', { name: nextName }))
}

describe('PerceptionPractice progress', () => {
  it('reports progress after every advance, never mid-question', async () => {
    const user = userEvent.setup()
    const onProgress = vi.fn()
    render(<PerceptionPractice perception={perception()} onProgress={onProgress} onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'tests' }))
    expect(onProgress).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: /câu tiếp/i }))

    expect(onProgress).toHaveBeenLastCalledWith({
      phase: 'pretest', index: 1, pretestCorrect: 1, posttestCorrect: 0, missedItemIds: []
    })
    await answerAndNext(user, 'test', /câu tiếp/i)
    expect(onProgress).toHaveBeenLastCalledWith({
      phase: 'pretest', index: 2, pretestCorrect: 1, posttestCorrect: 0, missedItemIds: ['pre-1']
    })
  })

  it('resumes from saved progress with the same position and score', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<PerceptionPractice
      perception={perception()}
      initial={{ phase: 'posttest', index: 3, pretestCorrect: 3, posttestCorrect: 2, missedItemIds: ['pre-0'] }}
      onComplete={onComplete}
    />)

    expect(screen.getByText(/nghe lại để kiểm tra/i)).toBeTruthy()
    expect(screen.getByText(/4\/4/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'tests' }))
    await user.click(screen.getByRole('button', { name: /hoàn thành perception/i }))

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      pretestCorrect: 3, posttestCorrect: 3, diagnosticMissedItemIds: ['pre-0']
    }))
  })

  it('ignores saved progress that no longer fits the content', () => {
    render(<PerceptionPractice
      perception={perception()}
      initial={{ phase: 'training', index: 99, pretestCorrect: 0, posttestCorrect: 0, missedItemIds: [] }}
      onComplete={vi.fn()}
    />)

    expect(screen.getByText(/1\/4/)).toBeTruthy()
  })
})

const ladder = {
  version: 'v1',
  trainingSource: { id: 's', type: 'source', title: 'Runbook', content: 'Run it.' },
  extractionItems: [
    { id: 'x1', question: 'Which command?', options: ['cachectl migrate', 'cachectl drop'], correctAnswer: 'cachectl migrate', feedback: 'First.' },
    { id: 'x2', question: 'Which flag?', options: ['--target v2', '--target v1'], correctAnswer: '--target v2', feedback: 'Goal.' },
    { id: 'x3', question: 'Which check?', options: ['OK', 'FAIL'], correctAnswer: 'OK', feedback: 'Success.' }
  ],
  applicationPrompt: 'Explain.',
  applicationChecklist: ['One', 'Two']
} as unknown as Parameters<typeof ReadingLadderPractice>[0]['ladder']

describe('ReadingLadderPractice progress', () => {
  it('reports the stage and chosen options but never the draft text', async () => {
    const user = userEvent.setup()
    const onProgress = vi.fn()
    render(<ReadingLadderPractice lessonId="l" ladder={ladder} onProgress={onProgress} onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /đã đọc một lần/i }))
    await user.click(screen.getByLabelText('cachectl migrate'))

    expect(onProgress).toHaveBeenLastCalledWith({ stage: 'extract', answers: { x1: 'cachectl migrate' } })
    expect(JSON.stringify(onProgress.mock.calls)).not.toMatch(/draft/i)
  })

  it('resumes at the saved stage with the saved answers', () => {
    render(<ReadingLadderPractice
      lessonId="l"
      ladder={ladder}
      initial={{ stage: 'extract', answers: { x1: 'cachectl migrate', x2: '--target v2' } }}
      onComplete={vi.fn()}
    />)

    expect((screen.getByLabelText('cachectl migrate') as HTMLInputElement).checked).toBe(true)
    expect((screen.getByLabelText('--target v2') as HTMLInputElement).checked).toBe(true)
    expect(screen.queryByText(/đọc source một lần/i)).toBeNull()
  })
})

describe('LearningLoopPractice progress', () => {
  function loop(): LearningLoopV1 {
    const spoken = getBundledCatalog().lessons.find((item) => item.lessonId === 'technical-interview-decision-b2')
    const task = spoken?.performanceTask
    if (task?.mode !== 'spoken' || !task.learningLoop) throw new Error('Spoken loop fixture missing')
    return task.learningLoop
  }

  it('resumes at shadowing with the saved step and does not replay perception', () => {
    const fixture = loop()
    const saved: InputProgress = {
      loop: {
        stage: 'guided-shadowing',
        pronunciationStatus: 'not-needed',
        requiredShadowingStepIds: [...fixture.shadowingSteps],
        completedShadowingSteps: [],
        perception: {
          pretestCorrect: 3, pretestTotal: 4, trainingCompleted: 6, posttestCorrect: 4, posttestTotal: 4,
          diagnosticMissedItemIds: [], availableVariantCount: 3, variabilityQualified: true, optedOut: false
        }
      },
      shadowingIndex: 2
    }
    render(<LearningLoopPractice loop={fixture} initial={saved} onComplete={vi.fn()} />)

    expect(screen.queryByText(/nghe trước khi nói/i)).toBeNull()
    expect(screen.getByText(new RegExp(`bước 3/${fixture.shadowingSteps.length}`, 'i'))).toBeTruthy()
  })

  it('drops saved state when the shadowing sequence changed', () => {
    const fixture = loop()
    const saved: InputProgress = {
      loop: {
        stage: 'guided-shadowing',
        pronunciationStatus: 'not-needed',
        requiredShadowingStepIds: ['listen'],
        completedShadowingSteps: [],
        perception: null
      }
    }
    render(<LearningLoopPractice loop={fixture} initial={saved} onComplete={vi.fn()} />)

    expect(screen.getByText(/nghe trước khi nói/i)).toBeTruthy()
  })

  it('reports loop progress when perception is skipped', async () => {
    const user = userEvent.setup()
    const onProgress = vi.fn()
    render(<LearningLoopPractice loop={loop()} onProgress={onProgress} onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /bỏ qua vì audio không phù hợp/i }))

    const last = onProgress.mock.calls.at(-1)?.[0] as InputProgress
    expect(last.loop?.stage).not.toBe('perception')
    expect(last.perception).toBeUndefined()
  })
})

describe('CapabilityTask input progress wiring', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it('saves reading ladder progress to the store and restores it after a remount', async () => {
    const user = userEvent.setup()
    const lesson = getBundledCatalog().lessons.find((item) => item.lessonId === 'technical-doc-action-b1')
    const task = lesson?.performanceTask
    if (!lesson || !task) throw new Error('Reading fixture missing')
    useAppStore.setState({
      lessonProgress: { [lesson.lessonId]: { ...createEmptyLessonProgress(), status: 'in-progress', activePhase: 'input' } }
    })

    const first = render(<CapabilityTask lesson={lesson} task={task} />)
    await user.click(screen.getByRole('button', { name: /đã đọc một lần/i }))
    expect(useAppStore.getState().lessonProgress[lesson.lessonId].inputProgress?.ladder?.stage).toBe('extract')
    first.unmount()

    render(<CapabilityTask lesson={lesson} task={task} />)
    expect(screen.getByText(/reading ladder.*bước 2\/3/i)).toBeTruthy()
  })
})
