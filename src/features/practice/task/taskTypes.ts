import type { SpokenAttemptSnapshot } from '../spoken/SpokenResponse'

export interface WrittenAttemptSnapshot {
  kind: 'written'
  text: string
  durationSeconds: number
  wordCount: number
  audioUrl: null
}

export type SessionAttemptSnapshot = WrittenAttemptSnapshot | SpokenAttemptSnapshot
export type CompletionKind = 'transfer' | 'review' | 'existing'
