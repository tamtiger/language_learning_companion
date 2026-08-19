import { LessonParseError, normalizeLesson, parseLesson } from './normalization'
import type { CanonicalLesson } from './schema'

export interface CatalogError {
  path: string
  kind: 'validation' | 'duplicate-id'
  message: string
}

export interface Catalog {
  lessons: CanonicalLesson[]
  baselineMissions: CanonicalLesson[]
  errors: CatalogError[]
}

export function buildCatalog(entries: ReadonlyArray<readonly [string, unknown]>): Catalog {
  const lessons: CanonicalLesson[] = []
  const errors: CatalogError[] = []
  const lessonIds = new Set<string>()

  entries.forEach(([path, rawModule]) => {
    const raw = typeof rawModule === 'object' && rawModule !== null && 'default' in rawModule
      ? (rawModule as { default: unknown }).default
      : rawModule
    try {
      const lesson = normalizeLesson(parseLesson(raw))
      if (lessonIds.has(lesson.lessonId)) {
        errors.push({ path, kind: 'duplicate-id', message: `Duplicate lesson id: ${lesson.lessonId}` })
        return
      }
      lessonIds.add(lesson.lessonId)
      lessons.push(lesson)
    } catch (error) {
      errors.push({
        path,
        kind: 'validation',
        message: error instanceof LessonParseError || error instanceof Error ? error.message : String(error)
      })
    }
  })

  lessons.sort((left, right) => left.lessonId.localeCompare(right.lessonId))
  return {
    lessons,
    baselineMissions: lessons.filter(
      (lesson) => lesson.performanceTask !== undefined && lesson.capabilities.length === 1
    ),
    errors
  }
}

const bundledFiles = import.meta.glob('../../content/**/*.json', { eager: true })
const bundledCatalog = buildCatalog(Object.entries(bundledFiles))

export function getBundledCatalog(): Catalog {
  return bundledCatalog
}
