import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PronunciationCueCard } from './PronunciationCueCard'

const cues = [
  { id: 'final-s', ipa: '/s/', articulatoryCue: 'Release final s.', meaningRisk: 'Changes count.', triggerItemIds: ['pre-1'] },
  { id: 'stress', articulatoryCue: 'Stress the decision.', meaningRisk: 'Hides intent.', triggerItemIds: ['post-2'] }
]

describe('PronunciationCueCard', () => {
  it('shows only cues triggered by diagnostic items and labels them as self-check support', () => {
    render(<PronunciationCueCard cues={cues} missedItemIds={['post-2']} onComplete={vi.fn()} />)

    expect(screen.getByText('Stress the decision.')).toBeTruthy()
    expect(screen.queryByText('Release final s.')).toBeNull()
    expect(screen.getByText(/hỗ trợ tự kiểm.*không phải.*chấm/i)).toBeTruthy()
  })
})
