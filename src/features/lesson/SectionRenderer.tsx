import { languageOf } from '../../shared/lang'
import { useEffect, useRef } from 'react'
import { Volume2 } from 'lucide-react'
import type { CanonicalLessonSection, CanonicalSourceSection } from '../../content/schema'
import { AutoCheck } from './AutoCheck'
import { ListeningSourceBlock, LongReadingBlock, VocabularyReviewBlock } from './ExtendedSections'
import { SourceTrustDisclosure } from './SourceTrustDisclosure'

const SOURCE_FORMAT_LABELS: Record<CanonicalSourceSection['format'], string> = {
  prose: 'Văn bản',
  dialogue: 'Hội thoại',
  'meeting-notes': 'Ghi chú cuộc họp',
  'technical-doc': 'Tài liệu kỹ thuật',
  'code-snippet': 'Đoạn mã hoặc log'
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
    <div lang={languageOf(section.content)} className="mt-4 whitespace-pre-line rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 leading-7 text-zinc-300">
      {section.content}
    </div>
    <SourceTrustDisclosure section={section} headingTag={ItemHeading} />
  </section>
  if (section.type === 'vocabulary-review') return <VocabularyReviewBlock lessonId={lessonId} section={section} Heading={Heading} ItemHeading={ItemHeading} headingClass={headingClass} onExerciseCorrect={onExerciseCorrect} />
  if (section.type === 'long-reading') return <LongReadingBlock lessonId={lessonId} section={section} Heading={Heading} ItemHeading={ItemHeading} headingClass={headingClass} onExerciseCorrect={onExerciseCorrect} />
  if (section.type === 'listening-source') return <ListeningSourceBlock lessonId={lessonId} section={section} Heading={Heading} ItemHeading={ItemHeading} headingClass={headingClass} onExerciseCorrect={onExerciseCorrect} />
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
              <span className="font-semibold text-zinc-400">Ví dụ: </span><span lang={languageOf(item.example)}>{item.example}</span>
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
              <span className="font-semibold text-zinc-400">Ví dụ: </span><span lang={languageOf(item.example)}>{item.example}</span>
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
