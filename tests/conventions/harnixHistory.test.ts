import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

describe('Harnix history decision', () => {
  it('records that historical task research stays in the repository', () => {
    const conventions = readFileSync(join(root, 'docs', 'CONVENTIONS.md'), 'utf8')
    expect(conventions).toContain('Lịch sử Harnix')
    expect(conventions).toContain('giữ nguyên')
  })

  it('keeps the research the curriculum check reads at its fixed path', () => {
    const task = join(root, '.harnix', 'tasks', '20260827-224143-complete-realistic-curriculum')
    expect(existsSync(task)).toBe(true)
  })
})
