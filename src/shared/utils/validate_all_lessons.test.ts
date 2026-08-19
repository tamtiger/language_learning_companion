import { describe, expect, it } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { buildCatalog } from '../../content/catalog'

function getJsonFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory).flatMap((entry) => {
    const filePath = path.join(directory, entry)
    return fs.statSync(filePath).isDirectory()
      ? getJsonFiles(filePath)
      : entry.endsWith('.json') ? [filePath] : []
  })
}

describe('Content Database Validator', () => {
  const contentDirectory = path.resolve(__dirname, '../../../content')
  const files = getJsonFiles(contentDirectory)
  const catalog = buildCatalog(files.map((filePath) => [
    path.relative(contentDirectory, filePath),
    JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown
  ]))

  it('finds and validates every executable lesson JSON', () => {
    expect(files.length).toBeGreaterThan(0)
    expect(catalog.errors).toEqual([])
    expect(catalog.lessons).toHaveLength(files.length)
  })

  it('keeps lesson, section and exercise ids unique', () => {
    const lessonIds = catalog.lessons.map((lesson) => lesson.lessonId)
    expect(new Set(lessonIds).size).toBe(lessonIds.length)

    catalog.lessons.forEach((lesson) => {
      const sectionIds = lesson.sections.map((section) => section.id)
      const exerciseIds = lesson.sections.flatMap((section) =>
        section.type === 'auto-check' ? section.exercises.map((exercise) => exercise.id) : []
      )
      expect(new Set(sectionIds).size).toBe(sectionIds.length)
      expect(new Set(exerciseIds).size).toBe(exerciseIds.length)
    })
  })

  it('keeps six capability missions complete and legacy lessons compatible', () => {
    expect(catalog.baselineMissions).toHaveLength(6)
    catalog.baselineMissions.forEach((lesson) => {
      expect(lesson.performanceTask?.rubric.length).toBeGreaterThanOrEqual(3)
      expect(lesson.performanceTask?.baselinePrompt).toBeTruthy()
      expect(lesson.performanceTask?.retryPrompt).toBeTruthy()
      expect(lesson.performanceTask?.transferPrompt).toBeTruthy()
      expect(lesson.performanceTask?.reviewPrompt).toBeTruthy()
      expect(lesson.reviewPolicy.intervalDays).toEqual([1, 3, 7])
    })
    expect(catalog.lessons.filter((lesson) => lesson.sourceSchemaVersion === 'v1')).toHaveLength(6)
    expect(catalog.lessons.filter((lesson) => lesson.sourceSchemaVersion === 'v2')).toHaveLength(1)
  })
})
