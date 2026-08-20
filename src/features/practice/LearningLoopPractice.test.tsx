import { describe, expect, it } from 'vitest'
import { recordPerceptionMiss } from './learning_loop_diagnostics'

describe('diagnostic-only pronunciation cue selection', () => {
  it('keeps pre/post misses but does not promote a training mistake to a diagnostic target', () => {
    let misses: string[] = []
    misses = recordPerceptionMiss(misses, 'pretest', 'pre-final-s')
    misses = recordPerceptionMiss(misses, 'training', 'train-final-s')
    misses = recordPerceptionMiss(misses, 'posttest', 'post-stress')

    expect(misses).toEqual(['pre-final-s', 'post-stress'])
  })
})
