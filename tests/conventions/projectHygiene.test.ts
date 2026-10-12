import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (path: string) => readFileSync(join(root, path), 'utf8')

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const full = join(directory, name)
    return statSync(full).isDirectory() ? sourceFiles(full) : [full]
  })
}

const sources = sourceFiles(join(root, 'src')).filter((path) => /\.(tsx|ts)$/.test(path))

describe('project hygiene', () => {
  it('does not use Tailwind classes that have no effect', () => {
    // text-current cannot take an opacity modifier, so text-current/80 renders nothing.
    const offenders = sources.filter((path) => /text-current\/\d+/.test(readFileSync(path, 'utf8')))
    expect(offenders).toEqual([])
  })

  it('uses the navigation landmark only for real navigation', () => {
    const progressNav = sources.filter((path) => /<nav[^>]*aria-label="Tiến trình/.test(readFileSync(path, 'utf8')))
    expect(progressNav).toEqual([])
  })

  it('titles the browser tab with the name shown in the header', () => {
    const title = /<title>([^<]+)<\/title>/.exec(read('index.html'))?.[1]
    const header = /<span className="block font-bold">([^<]+)<\/span>/.exec(read('src/app/App.tsx'))?.[1]
    expect(title).toBeDefined()
    expect(title).toBe(header)
  })

  it('states strict mode explicitly in the TypeScript configs', () => {
    for (const file of ['tsconfig.app.json', 'tsconfig.node.json']) {
      expect(read(file), file).toMatch(/"strict":\s*true/)
    }
  })
})
