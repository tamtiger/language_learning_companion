import { useMemo, useState } from 'react'
import { ArrowRight, AudioLines, CheckCircle2, Clock3, MessageSquareQuote } from 'lucide-react'
import type { CapabilityId } from '../../content/schema'
import { useAppStore } from '../../shared/hooks/useAppStore'

const CAPABILITY_LABELS: Record<CapabilityId, string> = {
  'workplace-communication': 'Giao tiếp công việc',
  'technical-reading': 'Đọc tài liệu kỹ thuật',
  'international-meetings': 'Họp quốc tế',
  'technical-explanation': 'Giải thích kỹ thuật',
  'international-interview': 'Phỏng vấn quốc tế',
  'technology-learning': 'Học công nghệ bằng tiếng Anh'
}

export interface CatalogPageProps { onStartLesson: (lessonId: string) => void }

export function CatalogPage({ onStartLesson }: CatalogPageProps) {
  const lessons = useAppStore((state) => state.lessons)
  const lessonProgress = useAppStore((state) => state.lessonProgress)
  const [capability, setCapability] = useState<CapabilityId | 'all'>('all')
  const [level, setLevel] = useState<'all' | 'B1' | 'B2' | 'C1'>('all')
  const filtered = useMemo(() => lessons.filter((lesson) =>
    (capability === 'all' || lesson.capabilities.includes(capability))
    && (level === 'all' || lesson.cefrLevel === level)
  ), [capability, lessons, level])
  const hasActiveFilters = capability !== 'all' || level !== 'all'
  const clearFilters = () => {
    setCapability('all')
    setLevel('all')
  }

  return (
    <section aria-labelledby="catalog-title" className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">Học theo tình huống thực tế</p>
        <h1 id="catalog-title" className="mt-2 text-3xl font-black">Thư viện bài học</h1>
        <p className="mt-2 max-w-3xl text-zinc-400">Chọn kỹ năng bạn cần dùng trong công việc. Trình độ CEFR là bộ lọc phụ.</p>
      </div>
      <div className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Capability
          <select value={capability} onChange={(event) => setCapability(event.target.value as CapabilityId | 'all')} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
            <option value="all">Tất cả capability</option>
            {Object.entries(CAPABILITY_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">CEFR
          <select value={level} onChange={(event) => setLevel(event.target.value as typeof level)} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
            <option value="all">Tất cả level</option><option>B1</option><option>B2</option><option>C1</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/40 p-6 text-center md:col-span-2">
            <p role="status" className="font-bold text-zinc-100">
              {hasActiveFilters ? 'Không có bài học phù hợp với bộ lọc này.' : 'Chưa có bài học trong thư viện.'}
            </p>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="mt-4 rounded-lg border border-cyan-400 px-4 py-2 font-bold text-cyan-100">
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}
        {filtered.map((lesson) => {
          const completed = lessonProgress[lesson.lessonId]?.status === 'completed'
          const hasSpeakingLoop = lesson.performanceTask?.mode === 'spoken'
            && Boolean(lesson.performanceTask.learningLoop)
          const label = lesson.capabilities[0] ? CAPABILITY_LABELS[lesson.capabilities[0]] : 'Pronunciation legacy'
          return (
            <button key={lesson.lessonId} type="button" onClick={() => onStartLesson(lesson.lessonId)} className="group rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 text-left hover:border-purple-500/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400">
              <span className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">{label}</span>
                <span className="flex items-center gap-2">
                  {completed && <CheckCircle2 aria-label="Đã hoàn thành" className="h-5 w-5 text-green-400" />}
                </span>
              </span>
              <span className="mt-3 block text-lg font-bold text-zinc-100">{lesson.title}</span>
              <span className="mt-2 block text-sm leading-relaxed text-zinc-400">{lesson.summary}</span>
              {hasSpeakingLoop && (
                <span className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-xs font-semibold text-cyan-100">
                    <MessageSquareQuote aria-hidden="true" className="h-3.5 w-3.5" />Sentence chunks
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-100">
                    <AudioLines aria-hidden="true" className="h-3.5 w-3.5" />Luyện phát âm
                  </span>
                </span>
              )}
              <span className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1"><Clock3 aria-hidden="true" className="h-4 w-4" />{lesson.durationMinutes} phút · {lesson.cefrLevel}</span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export { CAPABILITY_LABELS }
