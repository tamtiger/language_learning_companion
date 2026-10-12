import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, posix } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = join(process.cwd(), 'src', 'features', 'practice')
const MAX_LINES = 300

/** A folder may only import from folders with a lower rank (or from itself). */
const RANK: Record<string, number> = { shared: 0, perception: 1, ladder: 1, spoken: 2, interaction: 3, task: 4 }

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const full = join(directory, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const base = ROOT.replace(/\\/g, '/')
const files = walk(ROOT).map((full) => ({ full, path: full.replace(/\\/g, '/').slice(base.length + 1) }))

describe('practice feature structure', () => {
  it('keeps every file inside a role folder', () => {
    const outside = files.filter(({ path }) => !path.includes('/'))
    expect(outside.map(({ path }) => path)).toEqual([])
    const roles = new Set(files.map(({ path }) => path.split('/')[0]))
    expect([...roles].sort()).toEqual(Object.keys(RANK).sort())
  })

  it(`keeps every file under ${MAX_LINES} lines`, () => {
    const tooLong = files
      .map(({ full, path }) => ({ path, lines: readFileSync(full, 'utf8').split('\n').length }))
      .filter(({ lines }) => lines >= MAX_LINES)
    expect(tooLong).toEqual([])
  })

  it('imports only from folders with a lower rank', () => {
    const violations: string[] = []
    for (const { full, path } of files) {
      const role = path.split('/')[0]
      const source = readFileSync(full, 'utf8')
      for (const match of source.matchAll(/from "(\.[^"]*)"|from '(\.[^']*)'/g)) {
        const specifier = match[1] ?? match[2]
        const target = posix.normalize(posix.join(posix.dirname(path), specifier))
        const targetRole = target.split('/')[0]
        if (target.startsWith('..') || !(targetRole in RANK) || targetRole === role) continue
        if (RANK[targetRole] >= RANK[role]) violations.push(`${path} imports ${target}`)
      }
    }
    expect(violations).toEqual([])
  })

  it('does not keep a second file with the same base name in another folder', () => {
    const names = files.map(({ path }) => posix.basename(path).replace(/\.[^.]+$/, ''))
    expect(names.filter((name, index) => names.indexOf(name) !== index)).toEqual([])
  })
})
