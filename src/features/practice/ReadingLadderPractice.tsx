import { useEffect, useRef, useState } from 'react'
import type { CanonicalReadingLadderV1 } from '../../content/schema'
import type { LadderProgress } from '../../domain/progress/progress'
import { GuardedButton } from '../../shared/components/GuardedButton'
import { useUnsavedWork } from '../../shared/hooks/useUnsavedWork'
import { languageOf } from '../../shared/lang'
import { orderOptions, useShuffleSalt } from '../lesson/optionOrder'
import { SectionRenderer } from '../lesson/SectionRenderer'

type Stage = 'read' | 'extract' | 'apply'

function usableLadder(ladder: CanonicalReadingLadderV1, saved?: LadderProgress): LadderProgress | undefined {
  if (!saved) return undefined
  const known = new Set(ladder.extractionItems.map((item) => item.id))
  return Object.keys(saved.answers).every((id) => known.has(id)) ? saved : undefined
}

export function ReadingLadderPractice({ lessonId, ladder, initial, onProgress, onComplete }: {
  lessonId: string
  ladder: CanonicalReadingLadderV1
  /** Stage and chosen options saved earlier; ignored when they no longer fit the content. */
  initial?: LadderProgress
  onProgress?: (progress: LadderProgress) => void
  onComplete: () => void
}) {
  const resume = usableLadder(ladder, initial)
  const [stage, setStage] = useState<Stage>(resume?.stage ?? 'read')
  const [answers, setAnswers] = useState<Record<string, string>>(resume?.answers ?? {})
  const [application, setApplication] = useState('')
  const [checks, setChecks] = useState<boolean[]>(() => ladder.applicationChecklist.map(() => false))
  const stageHeading = useRef<HTMLHeadingElement>(null)
  useUnsavedWork(application.trim().length > 0, 'bản giải thích đang viết')
  const salt = useShuffleSalt()
  const previousStage = useRef(stage)
  const extractionComplete = ladder.extractionItems.every((item) => answers[item.id] === item.correctAnswer)
  const applicationComplete = application.trim().length > 0 && checks.every(Boolean)

  useEffect(() => {
    if (previousStage.current !== stage) stageHeading.current?.focus()
    previousStage.current = stage
  }, [stage])
  const reportRef = useRef(onProgress)
  reportRef.current = onProgress
  const mounted = useRef(false)
  useEffect(() => {
    // Skip the initial render so merely opening the ladder does not rewrite storage.
    if (!mounted.current) { mounted.current = true; return }
    reportRef.current?.({ stage, answers })
  }, [stage, answers])

  if (stage === 'read') {
    return (
      <section className="space-y-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5" aria-label="Reading ladder · đọc một lần">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Reading ladder · bước 1/3</p>
          <h3 ref={stageHeading} tabIndex={-1} className="mt-2 text-xl font-black">Đọc source một lần</h3>
          <p className="mt-2 text-sm text-zinc-300">Tìm constraint, action, evidence và recovery. Source sẽ ẩn khi bạn tiếp tục.</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <SectionRenderer lessonId={lessonId} section={ladder.trainingSource} headingLevel={4} />
        </div>
        <button type="button" onClick={() => setStage('extract')} className="rounded-xl bg-cyan-500 px-5 py-3 font-bold text-zinc-950">
          Đã đọc một lần — bắt đầu trích xuất
        </button>
      </section>
    )
  }

  if (stage === 'extract') {
    return (
      <section className="space-y-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5" aria-label="Reading ladder · trích xuất">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Reading ladder · bước 2/3</p>
          <h3 ref={stageHeading} tabIndex={-1} className="mt-2 text-xl font-black">Trích action và constraint từ trí nhớ</h3>
        </div>
        {ladder.extractionItems.map((item) => (
          <fieldset key={item.id} className="space-y-3 rounded-xl border border-zinc-800 p-4">
            <legend lang={languageOf(item.question)} className="px-1 font-semibold">{item.question}</legend>
            {orderOptions(item.options, `${item.id}:${salt}`).map((option) => (
              <label key={option} lang={languageOf(option)} className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="radio"
                  name={item.id}
                  checked={answers[item.id] === option}
                  onChange={() => setAnswers((current) => ({ ...current, [item.id]: option }))}
                  className="h-4 w-4 accent-cyan-400"
                />
                {option}
              </label>
            ))}
            <p role="status" className={`text-sm ${answers[item.id] === item.correctAnswer ? 'text-green-300' : 'text-amber-200'}`}>
              {answers[item.id] && `${answers[item.id] === item.correctAnswer ? 'Đúng. ' : 'Chưa đúng. '}${item.feedback}`}
            </p>
          </fieldset>
        ))}
        <GuardedButton disabledReason={extractionComplete ? undefined : 'Trả lời đúng cả các câu trích xuất trước khi sang bước tiếp.'} onClick={() => setStage('apply')}
          className="rounded-xl bg-cyan-500 px-5 py-3 font-bold text-zinc-950">
          Sang explain/apply
        </GuardedButton>
      </section>
    )
  }

  return (
    <section className="space-y-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5" aria-label="Reading ladder · explain and apply">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Reading ladder · bước 3/3</p>
        <h3 ref={stageHeading} tabIndex={-1} className="mt-2 text-xl font-black">Explain và apply bằng English</h3>
        <p className="mt-2 text-zinc-300">{ladder.applicationPrompt}</p>
      </div>
      <label className="block font-semibold">Bản giải thích tạm thời
        <textarea value={application} onChange={(event) => setApplication(event.target.value)} rows={5}
          className="mt-2 block w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 font-normal leading-7" />
      </label>
      <p className="text-xs text-zinc-400">Draft này chỉ ở component session và không được persist.</p>
      <fieldset className="space-y-3">
        <legend className="font-semibold">Self-check trước khi tiếp tục</legend>
        {ladder.applicationChecklist.map((item, index) => (
          <label key={item} className="flex cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" checked={checks[index]} onChange={(event) => {
              setChecks((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.checked : value))
            }} className="h-4 w-4 accent-cyan-400" />
            {item}
          </label>
        ))}
      </fieldset>
      <GuardedButton disabledReason={applicationComplete ? undefined : 'Viết bản giải thích và tick đủ self-check trước khi hoàn thành.'} onClick={onComplete}
        className="rounded-xl bg-cyan-500 px-5 py-3 font-bold text-zinc-950">
        Hoàn thành reading ladder
      </GuardedButton>
    </section>
  )
}
