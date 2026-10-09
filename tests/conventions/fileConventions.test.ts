import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, posix, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

interface RepoFile {
  /** POSIX path relative to the repository root. */
  path: string
  content: string
}

const TEST_FILE = /\.test\.(?:ts|tsx|mjs)$/
const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/
const CAMEL_CASE = /^[a-z][A-Za-z0-9]*$/
const KEBAB_CASE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/
/** Entry points whose name is fixed by the toolchain. */
const ENTRY_POINTS = new Set(['src/app/main.tsx'])

function baseName(path: string): string {
  return posix.basename(path).split('.')[0]
}

export function hasJsx(content: string, fileName: string): boolean {
  const source = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  let found = false
  const visit = (node: ts.Node): void => {
    if (found) return
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
      found = true
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return found
}

/** Returns one message per rule violation; an empty list means the layout follows docs/CONVENTIONS.md. */
export function findConventionViolations(files: RepoFile[], sourceDirs: ReadonlySet<string>): string[] {
  const violations: string[] = []
  const add = (rule: string, path: string, detail: string) => violations.push(`${rule}: ${path} - ${detail}`)

  for (const file of files) {
    const { path } = file
    const extension = posix.extname(path)
    const isTest = TEST_FILE.test(path)

    if (isTest && !path.startsWith('tests/')) add('test-location', path, 'tests must live under tests/')

    if (extension === '.tsx' && !hasJsx(file.content, path)) {
      add('jsx-extension', path, '.tsx is only for files that contain JSX')
    }

    if (path.startsWith('src/') && !isTest) {
      const name = baseName(path)
      if (extension === '.tsx' && !ENTRY_POINTS.has(path) && !PASCAL_CASE.test(name)) {
        add('component-name', path, 'React components use PascalCase.tsx')
      }
      if (extension === '.ts' && !path.endsWith('.d.ts') && !CAMEL_CASE.test(name)) {
        add('module-name', path, 'modules and hooks use camelCase.ts (hooks start with use)')
      }
    }

    if (path.startsWith('tests/')) {
      const directory = posix.dirname(path)
      const [, top] = directory.split('/')
      const topLevel = top ?? ''
      const allowedOutsideSrc = topLevel === 'conventions' || topLevel === 'scripts' || topLevel === 'helpers'
      if (directory !== 'tests' && !allowedOutsideSrc && !sourceDirs.has(directory.replace(/^tests\//, 'src/'))) {
        add('test-mirror', path, 'test directories must mirror an existing src directory')
      }
      if (isTest) {
        const name = posix.basename(path).replace(TEST_FILE, '')
        if (topLevel === 'scripts') {
          if (extension !== '.mjs' || !KEBAB_CASE.test(name)) add('script-test-name', path, 'script tests use kebab-case.test.mjs')
        } else if (!PASCAL_CASE.test(name) && !CAMEL_CASE.test(name)) {
          add('test-name', path, 'tests are named after what they test in PascalCase or camelCase')
        }
      }
    }

    if (path.startsWith('scripts/') && !isTest) {
      const scriptName = posix.basename(path)
      if (!/^[a-z][a-z0-9-]*\.mjs$/.test(scriptName)) add('script-name', path, 'scripts use kebab-case.mjs')
    }
  }
  return violations
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

function walk(directory: string, files: RepoFile[], dirs: Set<string>): void {
  if (!existsSync(directory)) return
  for (const entry of readdirSync(directory)) {
    if (entry === 'node_modules') continue
    const absolute = join(directory, entry)
    const path = relative(ROOT, absolute).split('\\').join('/')
    if (statSync(absolute).isDirectory()) {
      dirs.add(path)
      walk(absolute, files, dirs)
    } else {
      files.push({ path, content: /\.(?:tsx?|mjs)$/.test(entry) ? readFileSync(absolute, 'utf8') : '' })
    }
  }
}

const jsx = 'export const View = () => <div />\n'
const plain = 'export const value = 1\n'
const dirs = new Set(['src/features', 'src/features/lesson', 'src/content'])
const rules = (files: RepoFile[]) => findConventionViolations(files, dirs).map((entry) => entry.split(':')[0])

describe('convention rules catch violations', () => {
  it('accepts a conforming layout', () => {
    expect(findConventionViolations([
      { path: 'src/features/lesson/SectionRenderer.tsx', content: jsx },
      { path: 'src/features/lesson/optionOrder.ts', content: plain },
      { path: 'src/shared/hooks/useAppStore.ts', content: plain },
      { path: 'src/app/main.tsx', content: jsx },
      { path: 'tests/features/lesson/SectionRenderer.test.tsx', content: jsx },
      { path: 'tests/features/lesson/optionOrder.test.ts', content: plain },
      { path: 'tests/scripts/check-release.test.mjs', content: plain },
      { path: 'tests/conventions/fileConventions.test.ts', content: plain },
      { path: 'tests/setup.ts', content: plain },
      { path: 'scripts/check-release.mjs', content: plain }
    ], dirs)).toEqual([])
  })

  it('rejects snake_case and kebab-case modules and non-Pascal components', () => {
    expect(rules([{ path: 'src/features/lesson/option_order.ts', content: plain }])).toEqual(['module-name'])
    expect(rules([{ path: 'src/features/lesson/option-order.ts', content: plain }])).toEqual(['module-name'])
    expect(rules([{ path: 'src/features/lesson/sectionRenderer.tsx', content: jsx }])).toEqual(['component-name'])
  })

  it('rejects .tsx without JSX but accepts generics and comparisons in .ts', () => {
    expect(rules([{ path: 'src/content/helper.tsx', content: 'export const list: Array<string> = []\nexport const less = 1 < 2\n' }]))
      .toEqual(expect.arrayContaining(['jsx-extension']))
    expect(rules([{ path: 'src/content/helper.ts', content: 'export const list: Array<string> = []\n' }])).toEqual([])
  })

  it('rejects tests outside tests/ and test directories that do not mirror src/', () => {
    expect(rules([{ path: 'src/content/schema.test.ts', content: plain }])).toEqual(['test-location'])
    expect(rules([{ path: 'tests/unknown/schema.test.ts', content: plain }])).toEqual(['test-mirror'])
    expect(rules([{ path: 'tests/features/lesson/schema.test.ts', content: plain }])).toEqual([])
  })

  it('rejects badly named tests and script files', () => {
    expect(rules([{ path: 'tests/content/content_quality.test.ts', content: plain }])).toEqual(['test-name'])
    expect(rules([{ path: 'tests/scripts/checkRelease.test.mjs', content: plain }])).toEqual(['script-test-name'])
    expect(rules([{ path: 'scripts/check-changelog-rule', content: plain }])).toEqual(['script-name'])
    expect(rules([{ path: 'scripts/checkRelease.mjs', content: plain }])).toEqual(['script-name'])
  })
})

describe('repository follows the file conventions', () => {
  const files: RepoFile[] = []
  const sourceDirectories = new Set<string>()
  for (const root of ['src', 'tests', 'scripts']) walk(join(ROOT, root), files, sourceDirectories)

  it('scans the three source trees', () => {
    expect(files.some((file) => file.path.startsWith('src/'))).toBe(true)
    expect(files.some((file) => file.path.startsWith('scripts/'))).toBe(true)
  })

  it('has no naming, extension or test-location violations', () => {
    expect(findConventionViolations(files, sourceDirectories)).toEqual([])
  })
})
