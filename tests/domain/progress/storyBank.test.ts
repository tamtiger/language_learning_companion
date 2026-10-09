import { describe, expect, it } from 'vitest'
import { STORY_COMPETENCIES } from '@/content/schema'
import {
  MAX_STORIES,
  addStoryEntry,
  markStoryPracticedEntry,
  removeStoryEntry,
  updateStoryEntry,
  type StoryEntry
} from '@/domain/progress/storyBank'

const now = new Date('2026-08-18T09:00:00.000Z')
const input = { label: 'Fixed the checkout outage', competencyIds: ['ownership', 'delivery'] as const }

describe('story bank', () => {
  it('lists the competencies a story can be filed under', () => {
    expect([...STORY_COMPETENCIES]).toEqual(expect.arrayContaining(['ownership', 'conflict', 'failure', 'leadership', 'ambiguity']))
  })

  it('adds a trimmed entry with times and no practice yet', () => {
    const result = addStoryEntry([], { label: '  Fixed the outage  ', competencyIds: ['ownership'] }, now, 's1')

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.stories).toEqual([{ id: 's1', label: 'Fixed the outage', competencyIds: ['ownership'], createdAt: now.toISOString(), lastPracticedAt: null }])
  })

  it('refuses a blank or over-long label, no competency, too many competencies and unknown ones', () => {
    const attempts = [
      { label: '   ', competencyIds: ['ownership'] },
      { label: 'x'.repeat(61), competencyIds: ['ownership'] },
      { label: 'ok', competencyIds: [] },
      { label: 'ok', competencyIds: ['ownership', 'conflict', 'failure', 'leadership', 'ambiguity'] },
      { label: 'ok', competencyIds: ['charisma'] }
    ]
    for (const attempt of attempts) {
      const result = addStoryEntry([], attempt as never, now, 's1')
      expect(result.ok, JSON.stringify(attempt)).toBe(false)
    }
  })

  it('de-duplicates competencies and refuses a duplicate id', () => {
    const first = addStoryEntry([], { label: 'A', competencyIds: ['ownership', 'ownership'] }, now, 's1')
    if (!first.ok) throw new Error('add failed')
    expect(first.stories[0].competencyIds).toEqual(['ownership'])
    expect(addStoryEntry(first.stories, input, now, 's1').ok).toBe(false)
  })

  it('stops at the limit', () => {
    let stories: StoryEntry[] = []
    for (let index = 0; index < MAX_STORIES; index += 1) {
      const result = addStoryEntry(stories, input, now, `s${index}`)
      if (!result.ok) throw new Error('add failed early')
      stories = result.stories
    }
    const overflow = addStoryEntry(stories, input, now, 'extra')
    expect(overflow.ok).toBe(false)
    expect(overflow.ok ? '' : overflow.reason).toMatch(/30/)
  })

  it('updates, marks practiced and removes without touching other entries', () => {
    const a = addStoryEntry([], input, now, 'a')
    if (!a.ok) throw new Error('add failed')
    const b = addStoryEntry(a.stories, { label: 'Resolved a conflict', competencyIds: ['conflict'] }, now, 'b')
    if (!b.ok) throw new Error('add failed')

    const updated = updateStoryEntry(b.stories, 'a', { label: 'Fixed the outage v2' })
    expect(updated.ok && updated.stories[0].label).toBe('Fixed the outage v2')
    expect(updated.ok && updated.stories[1]).toEqual(b.stories[1])

    const later = new Date('2026-08-20T09:00:00.000Z')
    const practiced = markStoryPracticedEntry(b.stories, 'b', later)
    expect(practiced[1].lastPracticedAt).toBe(later.toISOString())
    expect(practiced[0]).toEqual(b.stories[0])

    expect(removeStoryEntry(b.stories, 'a').map((story) => story.id)).toEqual(['b'])
    expect(updateStoryEntry(b.stories, 'missing', { label: 'x' }).ok).toBe(false)
    expect(markStoryPracticedEntry(b.stories, 'missing', later)).toEqual(b.stories)
  })
})
