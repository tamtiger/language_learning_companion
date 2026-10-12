import { describe, expect, it } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import { buildEvidenceContract, contractRevision } from '@/domain/progress/evidenceContract'

const lesson = (id: string) => {
  const found = getBundledCatalog().lessons.find((item) => item.lessonId === id)
  if (!found) throw new Error('Missing lesson ' + id)
  return found
}

describe('spoken evidence contract', () => {
  it('names the shortest allowed spoken output minSeconds', () => {
    const contract = buildEvidenceContract(lesson('daily-standup-b1'))
    expect(contract.minSeconds).toBe(30)
    expect(contract).not.toHaveProperty('targetSeconds')
  })

  it('keeps the revision digest of contracts saved before the rename', () => {
    // Digests recorded before targetSeconds became minSeconds; attempts stored with them must still match.
    expect(contractRevision(buildEvidenceContract(lesson('daily-standup-b1')))).toBe('c1-2984171b')
    expect(contractRevision(buildEvidenceContract(lesson('meeting-join-and-repeat-a2')))).toBe('c1-30350570')
    expect(contractRevision(buildEvidenceContract(lesson('workplace-issue-update-b1')))).toBe('c1-a382a29d')
  })
})
