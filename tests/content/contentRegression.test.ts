import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guards for defects found in the lesson content review: padded distractors, unanchored fill items,
 * prompts that disagree with the output contract, and pinned pronunciation fixes.
 * Reads the raw JSON so it also sees fields that normalization hides.
 */

const ROOT = join(process.cwd(), 'content')

function jsonFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return jsonFiles(full)
    return entry.name.endsWith('.json') ? [full] : []
  })
}

type Json = Record<string, unknown>

const files = jsonFiles(ROOT).map((file) => ({
  name: relative(ROOT, file).replace(/\\/g, '/'),
  lesson: JSON.parse(readFileSync(file, 'utf8')) as Json
}))

/** Calls visit for every object in the tree with its JSON path. */
function walk(node: unknown, path: string, visit: (obj: Json, path: string) => void): void {
  if (Array.isArray(node)) {
    node.forEach((child, index) => walk(child, `${path}[${index}]`, visit))
  } else if (node && typeof node === 'object') {
    visit(node as Json, path)
    for (const [key, child] of Object.entries(node)) walk(child, `${path}.${key}`, visit)
  }
}

const PAD_SUFFIX = /\s(for the team( right now)?|at work|right now)$/i
const PAD_SENTENCE = /[.!?]\s+(for the team|at work|right now)\b/i
const VIETNAMESE_HINT = /\([^)]*[à-ỹ][^)]*\)/i

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

describe('content regression guards', () => {
  it('has no filler phrases padded onto answer options', () => {
    const found: string[] = []
    for (const { name, lesson } of files) {
      walk(lesson, name, (obj, path) => {
        if (!Array.isArray(obj.options)) return
        obj.options.forEach((option, index) => {
          if (typeof option === 'string' && (PAD_SUFFIX.test(option) || PAD_SENTENCE.test(option))) {
            found.push(`${path}.options[${index}]: ${option}`)
          }
        })
      })
    }
    expect(found).toEqual([])
  })

  it('anchors every vocabulary-review fill item with a Vietnamese hint', () => {
    const found: string[] = []
    for (const { name, lesson } of files) {
      walk(lesson, name, (obj, path) => {
        if (obj.type !== 'vocabulary-review' || !Array.isArray(obj.exercises)) return
        for (const exercise of obj.exercises as Json[]) {
          if (exercise.type === 'fill' && !VIETNAMESE_HINT.test(text(exercise.question))) {
            found.push(`${path}.${text(exercise.id)}: ${text(exercise.question)}`)
          }
        }
      })
    }
    expect(found).toEqual([])
  })

  it('states the same word limit in prompts as in the output contract', () => {
    const found: string[] = []
    for (const { name, lesson } of files) {
      const task = lesson.performanceTask as Json | undefined
      const contract = task?.outputContract as Json | undefined
      const maxWords = contract?.maxWords
      if (typeof maxWords !== 'number') continue
      for (const key of ['baselinePrompt', 'performancePrompt', 'retryPrompt', 'transferPrompt', 'reviewPrompt']) {
        const prompt = text(task?.[key])
        for (const match of prompt.matchAll(/(\d+)\s*(?:đến|to|-|–)\s*(\d+)\s*(?:từ|words)/gi)) {
          if (Number(match[2]) !== maxWords) found.push(`${name} ${key}: "${match[0]}" vs maxWords ${maxWords}`)
        }
      }
    }
    expect(found).toEqual([])
  })

  it('keeps transferPrompt free of title words that belong only to the retry context', () => {
    const found: string[] = []
    const significant = (value: string) => new Set(value.toLowerCase().match(/[a-z]{5,}/g) ?? [])
    for (const { name, lesson } of files) {
      const task = lesson.performanceTask as Json | undefined
      const contexts = task?.practiceContexts as Json | undefined
      const retry = contexts?.retry as Json | undefined
      if (!retry || !contexts?.transfer) continue
      const known = new Set([
        ...significant(JSON.stringify(contexts.transfer)),
        ...significant(JSON.stringify(contexts.baseline ?? '')),
        ...significant(text(task?.scenario))
      ])
      const retryOnly = [...significant(text(retry.title))].filter((word) => !known.has(word))
      const prompt = significant(text(task?.transferPrompt))
      const leaked = retryOnly.filter((word) => prompt.has(word))
      if (leaked.length > 0) found.push(`${name}: transferPrompt mentions retry-only words ${leaked.join(', ')}`)
    }
    expect(found).toEqual([])
  })

  describe('pinned pronunciation and answer fixes', () => {
    const raw = (name: string) => JSON.stringify(files.find((file) => file.name === name)?.lesson)

    it('puts primary stress on the right syllable', () => {
      expect(raw('missions/technical-explanation/listen-design-review-feedback-b2.json')).toContain('/əˈlaʊ lɪst/')
      expect(raw('missions/international-interview/interview-system-design-walkthrough-b2.json'))
        .not.toContain('Nhấn âm đầu của clarify và requirements')
      expect(raw('missions/international-interview/interview-behavioral-story-bank-b2.json'))
        .not.toContain('com-PE-tency')
    })

    it('does not teach Vietnamese speakers to add a vowel after final consonants', () => {
      expect(raw('reference/pronunciation/pronunciation-ending-sounds.json')).not.toContain('Do not add a separate vowel')
    })
  })
})
