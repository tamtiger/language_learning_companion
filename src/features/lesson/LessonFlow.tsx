import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { CanonicalLesson } from '../../content/schema'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { CapabilityTask } from '../practice/CapabilityTask'
import { SectionRenderer } from './SectionRenderer'

export function LessonFlow({ lesson, onBack }: { lesson: CanonicalLesson; onBack: () => void }) {
  const storedProgress = useAppStore((state) => state.lessonProgress[lesson.lessonId])
  const storedSection = storedProgress?.currentSectionId
  const setCurrentSection = useAppStore((state) => state.setCurrentSection)
  const markComplete = useAppStore((state) => state.markLessonComplete)
  const restartLesson = useAppStore((state) => state.restartLesson)
  const initialIndex = Math.max(0, lesson.sections.findIndex((section) => section.id === storedSection))
  const [sectionIndex, setSectionIndex] = useState(initialIndex)
  const section = lesson.sections[sectionIndex]
  const requiredExerciseIds = lesson.sections.flatMap((item) => item.type === 'auto-check'
    ? item.exercises.map((exercise) => exercise.id)
    : [])
  const completedExerciseIds = storedProgress?.completedExerciseIds ?? []
  const allExercisesCorrect = requiredExerciseIds.length > 0
    && requiredExerciseIds.every((id) => completedExerciseIds.includes(id))
  const legacyComplete = storedProgress?.status === 'completed'

  const move = (index: number) => {
    const bounded = Math.max(0, Math.min(index, lesson.sections.length - 1))
    setSectionIndex(bounded); setCurrentSection(lesson.lessonId, lesson.sections[bounded].id)
  }
  const finishLegacy = () => {
    if (!allExercisesCorrect) return
    markComplete(lesson.lessonId, true)
    setCurrentSection(lesson.lessonId, null)
  }
  const restartLegacy = () => {
    restartLesson(lesson.lessonId)
    setSectionIndex(0)
    setCurrentSection(lesson.lessonId, lesson.sections[0]?.id ?? null)
  }

  return <article className="space-y-6"><button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-zinc-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Quay lại</button><header className="border-b border-zinc-800 pb-5"><div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider text-purple-400"><span>{lesson.cefrLevel}</span><span>· {lesson.durationMinutes} phút</span></div><h1 className="mt-3 text-3xl font-black">{lesson.title}</h1><p className="mt-2 text-zinc-400">{lesson.summary}</p></header>{lesson.performanceTask ? <CapabilityTask lesson={lesson} task={lesson.performanceTask} /> : legacyComplete ? <section role="status" className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-green-400" /><h2 className="mt-3 text-2xl font-black">Bài pronunciation đã hoàn thành</h2><p className="mt-2 text-zinc-400">Tất cả bài kiểm tra phát âm đã được trả lời đúng trong phiên học này.</p><button type="button" onClick={restartLegacy} className="mt-5 rounded-xl border border-green-400/40 px-4 py-2 font-bold text-green-200">Học lại từ đầu</button></section> : <div className="space-y-5"><nav aria-label="Các phần của bài học" className="no-scrollbar flex gap-2 overflow-x-auto">{lesson.sections.map((item, index) => <button key={item.id} type="button" aria-current={index === sectionIndex ? 'step' : undefined} onClick={() => move(index)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${index === sectionIndex ? 'bg-purple-700 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{index + 1}. {item.title}</button>)}</nav><div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-7"><SectionRenderer lessonId={lesson.lessonId} section={section} /></div><p className="text-sm text-zinc-400">Đã đúng {completedExerciseIds.filter((id) => requiredExerciseIds.includes(id)).length}/{requiredExerciseIds.length} bài kiểm tra.</p><div className="flex justify-between"><button type="button" disabled={sectionIndex === 0} onClick={() => move(sectionIndex - 1)} className="rounded-xl border border-zinc-700 px-4 py-2 font-bold disabled:opacity-30">Phần trước</button>{sectionIndex < lesson.sections.length - 1 ? <button type="button" onClick={() => move(sectionIndex + 1)} className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-4 py-2 font-bold">Phần tiếp <ArrowRight aria-hidden="true" className="h-4 w-4" /></button> : <button type="button" disabled={!allExercisesCorrect} onClick={finishLegacy} className="rounded-xl bg-green-500 px-4 py-2 font-bold text-zinc-950 disabled:opacity-40">Hoàn thành bài</button>}</div></div>}</article>
}
