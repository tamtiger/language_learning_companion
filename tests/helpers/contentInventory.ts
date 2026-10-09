import * as fs from 'node:fs'
import * as path from 'node:path'
import { buildCatalog, type Catalog } from '@/content/catalog'
import type { CanonicalLesson, CanonicalSourceSection, CapabilityId } from '@/content/schema'

const CONTENT_DIRECTORY = path.resolve(__dirname, '../../content')

export interface RawContentFile {
  /** Path relative to content/, with forward slashes. */
  path: string
  raw: Record<string, unknown>
}

export interface ContentInventory {
  files: RawContentFile[]
  catalog: Catalog
  byVersion: Record<'v1' | 'v2' | 'v3', CanonicalLesson[]>
  /** Sources of capability missions reachable through the catalog (sections, practice contexts, reading ladders). */
  sourceCount: number
  /** Nodes with type "source" counted straight from the JSON files. */
  rawSourceCount: number
  /** Number of capability missions per capability. */
  capabilityCounts: Map<CapabilityId, number>
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function listJson(directory: string): string[] {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory).flatMap((entry) => {
    const filePath = path.join(directory, entry)
    return fs.statSync(filePath).isDirectory() ? listJson(filePath) : entry.endsWith('.json') ? [filePath] : []
  })
}

/** Every source surface of a lesson: its sections, practice-context artifacts and reading-ladder source. */
export function collectSources(lesson: CanonicalLesson): CanonicalSourceSection[] {
  const task = lesson.performanceTask
  const sectionSources = lesson.sections.filter(
    (section): section is CanonicalSourceSection => section.type === 'source'
  )
  if (!task) return sectionSources

  const contextSources = task.practiceContexts
    ? [
        ...task.practiceContexts.baseline.artifacts,
        ...(task.practiceContexts.retry?.artifacts ?? []),
        ...task.practiceContexts.transfer.artifacts,
        ...task.practiceContexts.review.artifacts
      ]
    : []
  const ladderSources = task.mode === 'written' && task.readingLadder ? [task.readingLadder.trainingSource] : []
  return [...sectionSources, ...contextSources, ...ladderSources]
}

export function countRawSources(value: unknown): number {
  if (Array.isArray(value)) return value.reduce<number>((total, item) => total + countRawSources(item), 0)
  if (!isRecord(value)) return 0
  const own = value.type === 'source' ? 1 : 0
  return own + Object.values(value).reduce<number>((total, child) => total + countRawSources(child), 0)
}

/** Reads content/** from disk so tests derive counts from the content instead of hard-coding them. */
export function readContentInventory(extra: ReadonlyArray<readonly [string, Record<string, unknown>]> = []): ContentInventory {
  const files: RawContentFile[] = [
    ...listJson(CONTENT_DIRECTORY).map((filePath) => ({
      path: path.relative(CONTENT_DIRECTORY, filePath).split(path.sep).join('/'),
      raw: JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>
    })),
    ...extra.map(([filePath, raw]) => ({ path: filePath, raw }))
  ]
  const catalog = buildCatalog(files.map((file) => [file.path, file.raw]))
  const byVersion: ContentInventory['byVersion'] = { v1: [], v2: [], v3: [] }
  for (const lesson of catalog.lessons) byVersion[lesson.sourceSchemaVersion].push(lesson)

  const capabilityCounts = new Map<CapabilityId, number>()
  for (const lesson of catalog.baselineMissions) {
    const capability = lesson.capabilities[0]
    capabilityCounts.set(capability, (capabilityCounts.get(capability) ?? 0) + 1)
  }
  return {
    files,
    catalog,
    byVersion,
    sourceCount: byVersion.v3.flatMap(collectSources).length,
    rawSourceCount: files.reduce((total, file) => total + countRawSources(file.raw), 0),
    capabilityCounts
  }
}
