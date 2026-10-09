import { useState } from 'react'
import type {
  CanonicalListeningSourceSection,
  CanonicalLongReadingSection,
  VocabularyReviewSection
} from '../../content/schema'
import { useAppStore } from '../../shared/hooks/useAppStore'
import { languageOf } from '../../shared/lang'
import { ModelAudioPlayer } from '../practice/ModelAudioPlayer'
import { AutoCheck } from './AutoCheck'
import { SourceTrustDisclosure } from './SourceTrustDisclosure'

type HeadingTag = 'h2' | 'h3' | 'h4'
type ItemHeadingTag = 'h3' | 'h4' | 'h5'

interface ExtendedSectionProps<T> {
  lessonId: string
  section: T
  Heading: HeadingTag
  ItemHeading: ItemHeadingTag
  headingClass: string
  onExerciseCorrect?: (exerciseId: string) => void
}

const LONG_READING_FORMAT_LABELS: Record<CanonicalLongReadingSection['format'], string> = {
  rfc: 'RFC',
  'api-reference': 'API reference',
  changelog: 'Changelog',
  log: 'Log hoặc stack trace',
  issue: 'GitHub issue',
  tutorial: 'Tutorial',
  prose: 'Văn bản'
}

export function VocabularyReviewBlock({ lessonId, section, Heading, headingClass, onExerciseCorrect }: ExtendedSectionProps<VocabularyReviewSection>) {
  return (
    <section>
      <Heading className={`${headingClass} font-bold`}>{section.title}</Heading>
      <p className="mt-2 text-sm text-zinc-400">Ôn lại: {section.wordRefs.join(', ')}.</p>
      <div className="mt-4">
        <AutoCheck lessonId={lessonId} exercises={section.exercises} onExerciseCorrect={onExerciseCorrect} />
      </div>
    </section>
  )
}

export function LongReadingBlock({ lessonId, section, Heading, ItemHeading, headingClass, onExerciseCorrect }: ExtendedSectionProps<CanonicalLongReadingSection>) {
  const anchor = (partId: string) => `${section.id}-${partId}`
  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-wider text-purple-400">{LONG_READING_FORMAT_LABELS[section.format]} · đọc dài</p>
      <Heading className={`mt-2 ${headingClass} font-bold`}>{section.title}</Heading>
      <p className="mt-2 text-sm text-zinc-400">Đọc lướt mục lục và các tiêu đề để nắm ý chính trước, rồi quét tìm chi tiết khi trả lời.</p>

      <nav aria-label="Mục lục" className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
        <ol className="list-decimal space-y-1 pl-5">
          {section.parts.map((part) => (
            <li key={part.id}>
              <a href={`#${anchor(part.id)}`} className="text-cyan-300 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">{part.heading}</a>
            </li>
          ))}
        </ol>
      </nav>

      <div lang={languageOf(section.parts.map((part) => part.content).join(' '))} className="mt-4 space-y-4">
        {section.parts.map((part) => (
          <article key={part.id} id={anchor(part.id)} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
            <ItemHeading className="font-bold text-zinc-100">{part.heading}</ItemHeading>
            <p className="mt-3 whitespace-pre-line leading-7 text-zinc-300">{part.content}</p>
          </article>
        ))}
      </div>
      <SourceTrustDisclosure section={section} headingTag={ItemHeading} />

      <div className="mt-6 space-y-6">
        <div>
          <ItemHeading className="font-bold">Đọc lướt: ý chính</ItemHeading>
          <div className="mt-3"><AutoCheck lessonId={lessonId} exercises={section.skim} onExerciseCorrect={onExerciseCorrect} /></div>
        </div>
        <div>
          <ItemHeading className="font-bold">Quét tìm: định vị chi tiết</ItemHeading>
          <p className="mt-1 text-sm text-zinc-400">Mỗi câu hỏi nằm ở một phần của tài liệu; hãy dùng mục lục để tìm đúng chỗ.</p>
          <div className="mt-3"><AutoCheck lessonId={lessonId} exercises={section.scan.map((item) => item.exercise)} onExerciseCorrect={onExerciseCorrect} /></div>
        </div>
      </div>
    </section>
  )
}

export function ListeningSourceBlock({ lessonId, section, Heading, ItemHeading, headingClass, onExerciseCorrect }: ExtendedSectionProps<CanonicalListeningSourceSection>) {
  const completed = useAppStore((state) => state.lessonProgress[lessonId]?.completedExerciseIds)
  const questions = [...section.gist, ...section.detail]
  const allAnswered = questions.every((exercise) => completed?.includes(exercise.id))
  const [revealed, setRevealed] = useState(false)
  const [turnIndex, setTurnIndex] = useState(0)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const speakerById = new Map(section.speakers.map((speaker) => [speaker.id, speaker]))
  const turn = section.turns[turnIndex]
  const speaker = speakerById.get(turn.speakerId)
  const showTranscript = revealed || allAnswered
  const minutes = Math.floor(section.durationSeconds / 60)
  const seconds = String(section.durationSeconds % 60).padStart(2, '0')

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-wider text-purple-400">Nghe hội thoại · khoảng {minutes}:{seconds}</p>
      <Heading className={`mt-2 ${headingClass} font-bold`}>{section.title}</Heading>
      <p className="mt-2 text-sm text-zinc-400">
        Nghe từng lượt trước, trả lời câu hỏi, rồi mới mở transcript. {section.speakers.map((item) => item.label).join(' · ')}.
      </p>

      <div className="mt-4 space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
        <div role="group" aria-label="Chọn lượt nói" className="flex flex-wrap gap-2">
          {section.turns.map((item, index) => (
            <button
              key={index}
              type="button"
              aria-pressed={index === turnIndex}
              onClick={() => setTurnIndex(index)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold ${index === turnIndex ? 'border-purple-400 bg-purple-500/20' : 'border-zinc-700'}`}
            >
              Lượt {index + 1} · {speakerById.get(item.speakerId)?.label ?? item.speakerId}
            </button>
          ))}
        </div>
        {speaker && (
          <ModelAudioPlayer
            key={turnIndex}
            source={{ kind: 'speech-synthesis', text: turn.text, locale: speaker.locale, voiceHints: speaker.voiceHints }}
          />
        )}
      </div>

      {section.listeningNotes && (
        <fieldset className="mt-4 rounded-xl border border-zinc-800 p-4">
          <legend className="px-1 font-semibold">Ghi chú khi nghe</legend>
          <p className="text-sm text-zinc-300">{section.listeningNotes.prompt}</p>
          <p className="text-xs text-zinc-400">Ghi chú chỉ ở phiên này và không được lưu.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {section.listeningNotes.fields.map((field) => (
              <label key={field} className="block text-sm font-semibold">{field}
                <input
                  type="text"
                  lang="en"
                  value={notes[field] ?? ''}
                  onChange={(event) => setNotes((current) => ({ ...current, [field]: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-normal"
                />
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 space-y-6">
        <div>
          <ItemHeading className="font-bold">Nghe lấy ý chính (gist)</ItemHeading>
          <div className="mt-3"><AutoCheck lessonId={lessonId} exercises={section.gist} onExerciseCorrect={onExerciseCorrect} /></div>
        </div>
        <div>
          <ItemHeading className="font-bold">Nghe lấy chi tiết (detail)</ItemHeading>
          <div className="mt-3"><AutoCheck lessonId={lessonId} exercises={section.detail} onExerciseCorrect={onExerciseCorrect} /></div>
        </div>
      </div>

      <div className="mt-6">
        {showTranscript ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
            <ItemHeading className="font-bold">Transcript</ItemHeading>
            <ol className="mt-3 space-y-2">
              {section.turns.map((item, index) => (
                <li key={index} lang="en" className="leading-7 text-zinc-300">
                  <span className="font-semibold text-zinc-100">{speakerById.get(item.speakerId)?.label ?? item.speakerId}: </span>{item.text}
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <button type="button" onClick={() => setRevealed(true)} className="rounded-xl border border-cyan-400 px-5 py-3 font-bold text-cyan-200">
            Hiện transcript (sau khi đã nghe)
          </button>
        )}
      </div>
      <SourceTrustDisclosure section={section} headingTag={ItemHeading} />
    </section>
  )
}
