import { STORY_COMPETENCIES } from '../../content/schema'

export type StoryCompetency = (typeof STORY_COMPETENCIES)[number]

/** Metadata about a story the learner can tell; the story text itself is never stored. */
export interface StoryEntry {
  id: string
  /** A short name the learner chooses, 1 to 60 characters. */
  label: string
  competencyIds: StoryCompetency[]
  createdAt: string
  lastPracticedAt: string | null
}

export interface StoryInput {
  label: string
  competencyIds: readonly string[]
}

export const MAX_STORIES = 30
export const MAX_LABEL_LENGTH = 60
export const MAX_COMPETENCIES_PER_STORY = 4

export type StoryResult = { ok: true; stories: StoryEntry[] } | { ok: false; reason: string }

function validate(input: Partial<StoryInput>): { ok: true; label?: string; competencyIds?: StoryCompetency[] } | { ok: false; reason: string } {
  let label: string | undefined
  if (input.label !== undefined) {
    label = input.label.trim()
    if (label.length === 0) return { ok: false, reason: 'Nhãn câu chuyện không được để trống.' }
    if (label.length > MAX_LABEL_LENGTH) return { ok: false, reason: `Nhãn tối đa ${MAX_LABEL_LENGTH} ký tự.` }
  }
  let competencyIds: StoryCompetency[] | undefined
  if (input.competencyIds !== undefined) {
    const known = new Set<string>(STORY_COMPETENCIES)
    if (input.competencyIds.some((id) => !known.has(id))) return { ok: false, reason: 'Có năng lực không hợp lệ.' }
    competencyIds = [...new Set(input.competencyIds)] as StoryCompetency[]
    if (competencyIds.length === 0) return { ok: false, reason: 'Chọn ít nhất một năng lực.' }
    if (competencyIds.length > MAX_COMPETENCIES_PER_STORY) {
      return { ok: false, reason: `Mỗi câu chuyện tối đa ${MAX_COMPETENCIES_PER_STORY} năng lực.` }
    }
  }
  return { ok: true, label, competencyIds }
}

export function addStoryEntry(stories: readonly StoryEntry[], input: StoryInput, now: Date, id: string): StoryResult {
  if (stories.length >= MAX_STORIES) return { ok: false, reason: `Story bank đầy (tối đa ${MAX_STORIES} câu chuyện).` }
  if (stories.some((story) => story.id === id)) return { ok: false, reason: 'Id câu chuyện đã tồn tại.' }
  const checked = validate(input)
  if (!checked.ok) return checked
  if (!checked.label || !checked.competencyIds) return { ok: false, reason: 'Thiếu nhãn hoặc năng lực.' }
  return {
    ok: true,
    stories: [...stories, { id, label: checked.label, competencyIds: checked.competencyIds, createdAt: now.toISOString(), lastPracticedAt: null }]
  }
}

export function updateStoryEntry(stories: readonly StoryEntry[], id: string, patch: Partial<StoryInput>): StoryResult {
  if (!stories.some((story) => story.id === id)) return { ok: false, reason: 'Không tìm thấy câu chuyện.' }
  const checked = validate(patch)
  if (!checked.ok) return checked
  return {
    ok: true,
    stories: stories.map((story) => story.id === id
      ? { ...story, ...(checked.label ? { label: checked.label } : {}), ...(checked.competencyIds ? { competencyIds: checked.competencyIds } : {}) }
      : story)
  }
}

export function removeStoryEntry(stories: readonly StoryEntry[], id: string): StoryEntry[] {
  return stories.filter((story) => story.id !== id)
}

export function markStoryPracticedEntry(stories: readonly StoryEntry[], id: string, at: Date): StoryEntry[] {
  return stories.map((story) => story.id === id ? { ...story, lastPracticedAt: at.toISOString() } : story)
}
