import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { getBundledCatalog } from '../../content/catalog'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { LessonFlow } from './LessonFlow'

const catalog = getBundledCatalog()

describe('bundled mission UI matrix', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it.each(catalog.baselineMissions.map((lesson) => [lesson.lessonId, lesson] as const))(
    'renders baseline controls for capability mission %s',
    (_lessonId, lesson) => {
      render(<LessonFlow lesson={lesson} onBack={() => undefined} />)

      expect(screen.getByRole('heading', { name: lesson.title })).toBeTruthy()
      expect((screen.getByRole('button', { name: /lưu baseline/i }) as HTMLButtonElement).disabled).toBe(true)
      expect(screen.queryByText(/model response — chỉ mở sau attempt/i)).toBeNull()

      if (lesson.performanceTask?.mode === 'spoken') {
        expect(screen.getByRole('button', { name: /dùng timer-only/i })).toBeTruthy()
      } else {
        expect(screen.getByRole('textbox', { name: /bản nháp tiếng anh/i })).toBeTruthy()
      }
    }
  )

  it.each(catalog.lessons
    .filter((lesson) => lesson.sourceSchemaVersion === 'v1')
    .map((lesson) => [lesson.lessonId, lesson] as const))(
    'renders canonical navigation for pronunciation lesson %s',
    (_lessonId, lesson) => {
      render(<LessonFlow lesson={lesson} onBack={() => undefined} />)

      expect(screen.getByRole('heading', { name: lesson.title })).toBeTruthy()
      expect(screen.getByRole('navigation', { name: /các phần của bài học/i })).toBeTruthy()
      expect(screen.getAllByRole('button', { name: /^\d+\./u })).toHaveLength(lesson.sections.length)
    }
  )
})
