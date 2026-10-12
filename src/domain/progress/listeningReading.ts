import type { CanonicalLesson } from '../../content/schema'
import type { ProgressByLesson } from './progress'

export interface ListeningReadingItem {
  lessonId: string
  title: string
  status: 'not-started' | 'in-progress' | 'completed'
  /** Questions in the listening or long reading section (gist, detail, skim and scan). */
  questions: number
  /** Questions of that section the learner has already answered correctly. */
  answered: number
}

export interface ListeningReadingGroup {
  total: number
  completed: number
  items: ListeningReadingItem[]
}

export interface ListeningReadingSummary {
  listening: ListeningReadingGroup
  reading: ListeningReadingGroup
}

function questionIds(lesson: CanonicalLesson, kind: 'listening-source' | 'long-reading'): string[] | null {
  const ids: string[] = []
  let found = false
  for (const section of lesson.sections) {
    if (section.type === 'listening-source' && kind === 'listening-source') {
      found = true
      ids.push(...[...section.gist, ...section.detail].map((exercise) => exercise.id))
    }
    if (section.type === 'long-reading' && kind === 'long-reading') {
      found = true
      ids.push(...section.skim.map((exercise) => exercise.id), ...section.scan.map((item) => item.exercise.id))
    }
  }
  return found ? ids : null
}

function summarizeGroup(
  lessons: readonly CanonicalLesson[],
  progressByLesson: ProgressByLesson,
  kind: 'listening-source' | 'long-reading'
): ListeningReadingGroup {
  const items = lessons.flatMap((lesson): ListeningReadingItem[] => {
    const ids = questionIds(lesson, kind)
    if (!ids) return []
    const progress = progressByLesson[lesson.lessonId]
    const done = new Set(progress?.completedExerciseIds ?? [])
    return [{
      lessonId: lesson.lessonId,
      title: lesson.title,
      status: progress?.status ?? 'not-started',
      questions: ids.length,
      answered: ids.filter((id) => done.has(id)).length
    }]
  })
  return { total: items.length, completed: items.filter((item) => item.status === 'completed').length, items }
}

/** Progress on lessons that train listening to conversations or reading long documents. */
export function summarizeListeningReading(
  lessons: readonly CanonicalLesson[],
  progressByLesson: ProgressByLesson
): ListeningReadingSummary {
  return {
    listening: summarizeGroup(lessons, progressByLesson, 'listening-source'),
    reading: summarizeGroup(lessons, progressByLesson, 'long-reading')
  }
}
