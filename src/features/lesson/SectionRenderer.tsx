import { useEffect, useRef, useState } from 'react'
import { Volume2 } from 'lucide-react'
import type {
  CanonicalLessonSection,
  CanonicalSourceSection,
  Exercise,
  SourceProvenance
} from '../../content/schema'
import { useAppStore } from '../../shared/hooks/use_app_store'

const SOURCE_FORMAT_LABELS: Record<CanonicalSourceSection['format'], string> = {
  prose: 'Văn bản',
  dialogue: 'Hội thoại',
  'meeting-notes': 'Ghi chú cuộc họp',
  'technical-doc': 'Tài liệu kỹ thuật',
  'code-snippet': 'Đoạn mã hoặc log'
}

const SOURCE_ORIGIN_LABELS: Record<SourceProvenance['origin'], string> = {
  original: 'Nội dung nguyên bản',
  adapted: 'Nội dung đã điều chỉnh',
  synthetic: 'Tình huống mô phỏng'
}

const REUSE_MODE_LABELS: Record<NonNullable<CanonicalSourceSection['resolvedSources']>[number]['reuseMode'], string> = {
  'reference-only': 'Chỉ dùng làm tài liệu tham khảo',
  quoted: 'Có trích dẫn từ nguồn',
  adapted: 'Có nội dung điều chỉnh từ nguồn',
  redistributed: 'Được phép phân phối lại theo điều khoản nguồn'
}

function displayDate(value: string): string {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function SourceTrustDisclosure({ section, headingTag }: {
  section: CanonicalSourceSection
  headingTag: 'h3' | 'h4' | 'h5'
}) {
  if (!section.provenance || !section.resolvedSources?.length) return null
  const SourceHeading = headingTag
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-200">
          {SOURCE_ORIGIN_LABELS[section.provenance.origin]}
        </p>
        {section.provenance.adaptationNote && (
          <p className="mt-2 text-sm leading-6 text-zinc-300">{section.provenance.adaptationNote}</p>
        )}
      </div>
      <details className="rounded-xl border border-zinc-700 bg-zinc-950/50 open:border-purple-500/50">
        <summary className="min-h-11 cursor-pointer px-4 py-3 font-bold text-purple-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400">
          Nguồn và quyền sử dụng
        </summary>
        <div className="space-y-4 border-t border-zinc-800 p-4">
          {section.resolvedSources.map((source) => (
            <article key={source.sourceId} className="min-w-0 rounded-lg border border-zinc-800 p-4">
              <SourceHeading className="break-words font-bold text-zinc-100">{source.title}</SourceHeading>
              <dl className="mt-3 grid gap-2 text-sm text-zinc-300 sm:grid-cols-[max-content_minmax(0,1fr)]">
                <dt className="font-semibold text-zinc-400">Đơn vị phát hành</dt>
                <dd className="break-words">{source.publisher}</dd>
                <dt className="font-semibold text-zinc-400">Phiên bản</dt>
                <dd className="break-words">{source.versionOrPublishedAt}</dd>
                <dt className="font-semibold text-zinc-400">Vị trí tham chiếu</dt>
                <dd className="break-words">{source.exactLocation}</dd>
                <dt className="font-semibold text-zinc-400">Ngày truy cập</dt>
                <dd>{displayDate(source.accessedAt)}</dd>
                <dt className="font-semibold text-zinc-400">Cách sử dụng</dt>
                <dd>{REUSE_MODE_LABELS[source.reuseMode]}</dd>
              </dl>
              {source.requiredAttribution && (
                <p className="mt-3 break-words text-xs leading-5 text-zinc-400">
                  Ghi nguồn: {source.requiredAttribution}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
                <a href={source.canonicalUrl} target="_blank" rel="noreferrer"
                  className="break-words text-cyan-300 underline decoration-cyan-500/50 underline-offset-4">
                  Mở nguồn tham khảo — cần Internet
                </a>
                <a href={source.licenseIdOrRightsUrl} target="_blank" rel="noreferrer"
                  className="break-words text-zinc-300 underline decoration-zinc-600 underline-offset-4">
                  Xem quyền và điều khoản sử dụng — cần Internet
                </a>
              </div>
            </article>
          ))}
        </div>
      </details>
    </div>
  )
}

function isExerciseCorrect(exercise: Exercise, answers: string[], matches: Record<string, string>): boolean {
  if (exercise.type === 'fill') {
    return answers.length === 1 && exercise.correctAnswer.includes(answers[0].trim())
  }
  if (exercise.type === 'matching') {
    return (exercise.matchingPairs ?? []).every((pair) =>
      exercise.correctAnswer.includes(`${pair.key} - ${matches[pair.key] ?? ''}`)
    )
  }
  if (exercise.type === 'ordering') {
    return answers.length === exercise.correctAnswer.length
      && answers.every((answer, index) => answer === exercise.correctAnswer[index])
  }
  return answers.length === exercise.correctAnswer.length
    && answers.every((answer) => exercise.correctAnswer.includes(answer))
}

function hasCompleteAnswer(exercise: Exercise, answers: string[], matches: Record<string, string>): boolean {
  if (exercise.type === 'matching') {
    return (exercise.matchingPairs ?? []).every((pair) => Boolean(matches[pair.key]))
  }
  if (exercise.type === 'ordering') return answers.length === (exercise.options?.length ?? 0)
  if (exercise.type === 'fill') return Boolean(answers[0]?.trim())
  return answers.length > 0
}

function AutoCheck({ lessonId, exercises, onExerciseCorrect }: {
  lessonId: string
  exercises: Exercise[]
  onExerciseCorrect?: (exerciseId: string) => void
}) {
  const markExerciseCorrect = useAppStore((state) => state.markExerciseCorrect)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, Record<string, string>>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  return <div className="space-y-5">{exercises.map((exercise) => {
    const selected = answers[exercise.id] ?? []
    const matches = matchingAnswers[exercise.id] ?? {}
    const correct = isExerciseCorrect(exercise, selected, matches)
    const complete = hasCompleteAnswer(exercise, selected, matches)
    const updateAnswers = (next: string[]) => {
      setAnswers((current) => ({ ...current, [exercise.id]: next }))
      setChecked((current) => ({ ...current, [exercise.id]: false }))
    }
    const checkAnswer = () => {
      setChecked((current) => ({ ...current, [exercise.id]: true }))
      if (correct) {
        markExerciseCorrect(lessonId, exercise.id)
        onExerciseCorrect?.(exercise.id)
      }
    }

    return <fieldset key={exercise.id} className="rounded-xl border border-zinc-700 p-4">
      <legend className="px-2 font-semibold">{exercise.question}</legend>

      {exercise.type === 'choice' && <div className="mt-3 space-y-2">{(exercise.options ?? []).map((option) => {
        const multi = exercise.correctAnswer.length > 1
        return <label key={option} className="flex cursor-pointer gap-3 rounded-lg border border-zinc-800 p-3 hover:bg-zinc-800/60">
          <input
            type={multi ? 'checkbox' : 'radio'}
            name={exercise.id}
            checked={selected.includes(option)}
            onChange={() => updateAnswers(multi
              ? selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]
              : [option])}
          />
          <span>{option}</span>
        </label>
      })}</div>}

      {exercise.type === 'fill' && <div className="mt-3">
        <label className="block text-sm font-semibold" htmlFor={`${exercise.id}-answer`}>Câu trả lời</label>
        <input
          id={`${exercise.id}-answer`}
          type="text"
          list={exercise.options?.length ? `${exercise.id}-suggestions` : undefined}
          value={selected[0] ?? ''}
          onChange={(event) => updateAnswers([event.target.value])}
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
        />
        {exercise.options?.length ? <datalist id={`${exercise.id}-suggestions`}>
          {exercise.options.map((option) => <option key={option} value={option} />)}
        </datalist> : null}
      </div>}

      {exercise.type === 'matching' && <div className="mt-3 space-y-3">{(exercise.matchingPairs ?? []).map((pair) => (
        <label key={pair.key} className="grid gap-2 rounded-lg border border-zinc-800 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
          <span className="font-semibold">{pair.key}</span>
          <select
            aria-label={pair.key}
            value={matches[pair.key] ?? ''}
            onChange={(event) => {
              setMatchingAnswers((current) => ({
                ...current,
                [exercise.id]: { ...matches, [pair.key]: event.target.value }
              }))
              setChecked((current) => ({ ...current, [exercise.id]: false }))
            }}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
          >
            <option value="">-- Chọn --</option>
            {[...new Set((exercise.matchingPairs ?? []).map((candidate) => candidate.value))]
              .map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      ))}</div>}

      {exercise.type === 'ordering' && <div className="mt-3 space-y-3">
        <div className="flex flex-wrap gap-2">{(exercise.options ?? []).filter((option) => !selected.includes(option)).map((option) => (
          <button
            key={option}
            type="button"
            aria-label={`Thêm ${option}`}
            onClick={() => updateAnswers([...selected, option])}
            className="rounded-lg border border-zinc-700 px-3 py-2 hover:bg-zinc-800/60"
          >{option}</button>
        ))}</div>
        <ol aria-label="Thứ tự đã chọn" className="list-decimal space-y-1 pl-6">
          {selected.map((option) => <li key={option}>{option}</li>)}
        </ol>
        {selected.length > 0 && <button
          type="button"
          onClick={() => updateAnswers([])}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm"
        >Làm lại thứ tự</button>}
      </div>}

      <button type="button" disabled={!complete} onClick={checkAnswer} className="mt-3 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-950 disabled:opacity-40">Kiểm tra</button>
      {checked[exercise.id] && <p role="status" className={`mt-3 text-sm ${correct ? 'text-green-400' : 'text-amber-300'}`}>{correct ? 'Đúng.' : 'Chưa đúng. Hãy thử lại trước khi tiếp tục.'} {exercise.explanation}</p>}
    </fieldset>
  })}</div>
}

export function SectionRenderer({ lessonId, section, onExerciseCorrect, headingLevel = 2 }: {
  lessonId: string
  section: CanonicalLessonSection
  onExerciseCorrect?: (exerciseId: string) => void
  headingLevel?: 2 | 3 | 4
}) {
  const activeUtterance = useRef<SpeechSynthesisUtterance | null>(null)
  const Heading = headingLevel === 2 ? 'h2' : headingLevel === 3 ? 'h3' : 'h4'
  const ItemHeading = headingLevel === 2 ? 'h3' : headingLevel === 3 ? 'h4' : 'h5'
  const headingClass = headingLevel === 2 ? 'text-2xl' : headingLevel === 3 ? 'text-xl' : 'text-lg'

  useEffect(() => () => {
    if (activeUtterance.current && 'speechSynthesis' in window) {
      activeUtterance.current = null
      window.speechSynthesis.cancel()
    }
  }, [section])

  const speakWord = (word: string) => {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return
    if (activeUtterance.current) window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    activeUtterance.current = utterance
    const release = () => {
      if (activeUtterance.current === utterance) activeUtterance.current = null
    }
    utterance.onend = release
    utterance.onerror = release
    window.speechSynthesis.speak(utterance)
  }

  if (section.type === 'brief') return <section><Heading className={`${headingClass} font-bold`}>{section.title}</Heading><p className="mt-4 whitespace-pre-line leading-relaxed text-zinc-300">{section.body}</p></section>
  if (section.type === 'source') return <section>
    <p className="text-xs font-bold uppercase tracking-wider text-purple-400">
      {SOURCE_FORMAT_LABELS[section.format]}
    </p>
    <Heading className={`mt-2 ${headingClass} font-bold`}>{section.title}</Heading>
    <div className="mt-4 whitespace-pre-line rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 leading-7 text-zinc-300">
      {section.content}
    </div>
    <SourceTrustDisclosure section={section} headingTag={ItemHeading} />
  </section>
  if (section.type === 'auto-check') return <section><Heading className={`${headingClass} font-bold`}>{section.title}</Heading><div className="mt-4"><AutoCheck lessonId={lessonId} exercises={section.exercises} onExerciseCorrect={onExerciseCorrect} /></div></section>
  return <section>
    <Heading className={`${headingClass} font-bold`}>{section.title}</Heading>
    {section.vocabulary.length > 0 && (
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {section.vocabulary.map((item) => (
          <article key={item.word} className="min-w-0 rounded-xl border border-zinc-800 p-4">
            <div className="flex items-start justify-between gap-3">
              <ItemHeading className="min-w-0 break-words font-bold">
                {item.word}{' '}
                <span className="font-normal text-purple-300">{item.ipa}</span>
              </ItemHeading>
              <button
                type="button"
                aria-label={`Phát âm ${item.word}`}
                onClick={() => speakWord(item.word)}
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400"
              >
                <Volume2 aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Định nghĩa</dt>
                <dd className="mt-1 leading-6 text-zinc-300">{item.definition}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Trong công việc kỹ thuật</dt>
                <dd className="mt-1 leading-6 text-zinc-300">{item.technicalMeaning}</dd>
              </div>
            </dl>

            {item.collocations.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Cụm từ thường dùng</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {item.collocations.map((collocation, index) => (
                    <li key={`${collocation}-${index}`} className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200">
                      {collocation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-3 text-sm leading-6">
              <span className="font-semibold text-zinc-400">Ví dụ: </span>{item.example}
            </p>
            <aside className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm leading-6 text-amber-100">
              <span className="font-semibold">Lưu ý: </span>{item.commonMistake}
            </aside>
          </article>
        ))}
      </div>
    )}

    {section.expressions.length > 0 && (
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {section.expressions.map((item) => (
          <article key={item.phrase} className="min-w-0 rounded-xl border border-zinc-800 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <ItemHeading className="min-w-0 break-words font-bold">{item.phrase}</ItemHeading>
              <span className="rounded-full bg-purple-500/15 px-2.5 py-1 text-xs font-semibold text-purple-200">
                Sắc thái: {item.tone}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{item.meaning}</p>
            <p className="mt-2 text-sm leading-6">
              <span className="font-semibold text-zinc-400">Ví dụ: </span>{item.example}
            </p>
            {item.alternatives.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Cách nói khác</p>
                <ul className="mt-2 space-y-1.5 text-sm text-zinc-300">
                  {item.alternatives.map((alternative, index) => (
                    <li key={`${alternative}-${index}`} className="flex gap-2">
                      <span aria-hidden="true" className="text-purple-300">•</span>
                      <span className="min-w-0 break-words">{alternative}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </div>
    )}
  </section>
}
