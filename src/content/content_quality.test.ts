import { describe, expect, it } from 'vitest'
import { getBundledCatalog } from './catalog'
import type { CanonicalLesson, CanonicalSourceSection } from './schema'

const SYNTHETIC_DISCLOSURE = 'Synthetic training artifact — non-production.'
const rawFiles = import.meta.glob('../../content/**/*.json', { eager: true }) as Record<string, unknown>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function unwrapModule(value: unknown): unknown {
  return isRecord(value) && 'default' in value ? value.default : value
}

function lessonById(lessonId: string): CanonicalLesson {
  const lesson = getBundledCatalog().lessons.find((candidate) => candidate.lessonId === lessonId)
  if (!lesson) throw new Error(`Missing lesson fixture: ${lessonId}`)
  return lesson
}

function collectV3Sources(lesson: CanonicalLesson): CanonicalSourceSection[] {
  const task = lesson.performanceTask
  const sectionSources = lesson.sections.filter(
    (section): section is CanonicalSourceSection => section.type === 'source'
  )
  if (!task) return sectionSources

  const contextSources = task.practiceContexts
    ? [
        ...task.practiceContexts.baseline.artifacts,
        ...(task.practiceContexts.retry?.artifacts ?? []),
        ...task.practiceContexts.transfer.artifacts,
        ...task.practiceContexts.review.artifacts
      ]
    : []
  const ladderSources = task.mode === 'written' && task.readingLadder
    ? [task.readingLadder.trainingSource]
    : []

  return [...sectionSources, ...contextSources, ...ladderSources]
}

function collectRawProvenanceIds(value: unknown, found: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectRawProvenanceIds(item, found))
    return found
  }
  if (!isRecord(value)) return found

  if (value.type === 'source' && isRecord(value.provenance) && Array.isArray(value.provenance.sourceIds)) {
    for (const sourceId of value.provenance.sourceIds) {
      if (typeof sourceId === 'string') found.push(sourceId)
    }
  }
  Object.values(value).forEach((child) => collectRawProvenanceIds(child, found))
  return found
}

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length
}

describe('curriculum content quality gate', () => {
  it('organizes missions by primary capability and pronunciation as reference content', () => {
    expect(Object.keys(rawFiles)).toHaveLength(18)

    for (const [path, moduleValue] of Object.entries(rawFiles)) {
      const raw = unwrapModule(moduleValue)
      if (!isRecord(raw) || typeof raw.lessonId !== 'string') {
        throw new Error(`Invalid raw lesson fixture: ${path}`)
      }

      if (raw.schemaVersion === 'v3') {
        const primaryCapability = Array.isArray(raw.capabilities) ? raw.capabilities[0] : null
        if (typeof primaryCapability !== 'string') {
          throw new Error(`Missing primary capability: ${raw.lessonId}`)
        }
        expect(path, raw.lessonId)
          .toBe(`../../content/missions/${primaryCapability}/${raw.lessonId}.json`)
        continue
      }

      if (raw.schemaVersion === 'v1') {
        expect(path, raw.lessonId)
          .toBe(`../../content/reference/pronunciation/${raw.lessonId}.json`)
        continue
      }

      throw new Error(`Unsupported source schema in curriculum layout: ${raw.lessonId}`)
    }

    expect(Object.keys(rawFiles).every((path) => !path.includes('/content/modules/'))).toBe(true)
  })

  it('keeps the complete 18-lesson inventory and traverses every source surface', () => {
    const lessons = getBundledCatalog().lessons
    const v3 = lessons.filter((lesson) => lesson.sourceSchemaVersion === 'v3')
    const v1 = lessons.filter((lesson) => lesson.sourceSchemaVersion === 'v1')
    const v3Sources = v3.flatMap(collectV3Sources)
    const legacySources = v1.flatMap((lesson) => lesson.sections.filter((section) => section.type === 'source'))

    expect(lessons).toHaveLength(18)
    expect(v3).toHaveLength(12)
    expect(v1).toHaveLength(6)
    expect(v3Sources).toHaveLength(75)
    expect(legacySources).toHaveLength(6)
  })

  it('classifies every v3 source as resolved provenance or explicit synthetic training data', () => {
    const lessons = getBundledCatalog().lessons.filter((lesson) => lesson.sourceSchemaVersion === 'v3')

    for (const lesson of lessons) {
      for (const source of collectV3Sources(lesson)) {
        const label = `${lesson.lessonId}:${source.id}`
        if (source.provenance) {
          expect(source.resolvedSources?.map((item) => item.sourceId), label)
            .toEqual(source.provenance.sourceIds)
          expect(source.resolvedSources?.every((item) => item.reuseMode === 'reference-only'), label)
            .toBe(true)
          expect(source.provenance.adaptationNote, label).toMatch(/fictional|synthetic|mô phỏng/i)
        } else {
          expect(source.content, label).toContain(SYNTHETIC_DISCLOSURE)
        }
      }
    }
  })

  it('keeps source registries referenced, non-placeholder and internally resolved', () => {
    for (const [path, moduleValue] of Object.entries(rawFiles)) {
      const raw = unwrapModule(moduleValue)
      if (!isRecord(raw) || raw.schemaVersion !== 'v3') continue
      const registry = Array.isArray(raw.sourceRegistry) ? raw.sourceRegistry : []
      const registeredIds = registry.flatMap((entry) =>
        isRecord(entry) && typeof entry.sourceId === 'string' ? [entry.sourceId] : []
      )
      const referencedIds = collectRawProvenanceIds(raw)

      expect(new Set(registeredIds).size, path).toBe(registeredIds.length)
      expect(new Set(referencedIds), path).toEqual(new Set(registeredIds))
      expect(JSON.stringify(registry), path)
        .not.toMatch(/example\.(com|org|net)|\.invalid|localhost|TBD|TODO|unknown/i)
    }
  })

  it('binds HTTP semantics to the RFCs without certifying the fictional API', () => {
    const apiSources = collectV3Sources(lessonById('learn-api-from-docs-b2'))
    const referencedUrls = new Set(apiSources.flatMap((source) =>
      source.resolvedSources?.map((item) => item.canonicalUrl) ?? []
    ))
    const annotatedSources = apiSources.filter((source) => source.provenance)

    expect(referencedUrls).toContain('https://www.rfc-editor.org/rfc/rfc9110.html')
    expect(referencedUrls).toContain('https://www.rfc-editor.org/rfc/rfc6585.html')
    expect(annotatedSources.length).toBeGreaterThanOrEqual(2)
    expect(annotatedSources.every((source) =>
      /endpoint|header|metric|product|Pulse|Jobs|fictional|synthetic/i.test(source.provenance?.adaptationNote ?? '')
    )).toBe(true)

    const suppliedEvidence = apiSources.map((source) => source.content).join('\n')
    expect(suppliedEvidence).toMatch(/202[^.\n]*(?:accepted|not complete)|accepted[^.\n]*not complete/is)
    expect(suppliedEvidence).toMatch(/429/is)
    expect(suppliedEvidence).toMatch(/rate limit|limit is exceeded/is)
    expect(suppliedEvidence).toMatch(/503[^.\n]*(?:temporary|unavailable)/is)
    expect(suppliedEvidence).toMatch(/Retry-After[^.\n]*(?:seconds|HTTP-date)/is)
  })

  it('keeps future phase facts out of every spoken learning loop', () => {
    const forbiddenByLesson: Record<string, RegExp> = {
      'architecture-walkthrough-b2': /signed upload|antivirus|download locked|manual review/i,
      'behavioral-interview-ownership-b2': /certificate|rotation job|six days remaining/i,
      'daily-standup-b1': /two million|snapshot approval|vendor logs|SRE Mina|store review/i,
      'meeting-disagree-and-recap-b2': /customer demo|permissions flow|Elena/i,
      'technical-interview-decision-b2': /fourteen percent|automated canary|eight minutes/i,
      'technical-tradeoff-explanation-b2': /nine hundred dollars|reserved capacity|two-person team/i
    }

    for (const [lessonId, forbidden] of Object.entries(forbiddenByLesson)) {
      const task = lessonById(lessonId).performanceTask
      if (task?.mode !== 'spoken' || !task.learningLoop) throw new Error(`Missing spoken loop: ${lessonId}`)
      expect(JSON.stringify(task.learningLoop), lessonId).not.toMatch(forbidden)
    }
  })

  it('aligns every executable output contract with the learner-facing timebox', () => {
    const expected: Record<string, Record<string, number>> = {
      'architecture-walkthrough-b2': { targetSeconds: 90, timeLimitSeconds: 120 },
      'behavioral-interview-ownership-b2': { targetSeconds: 90, timeLimitSeconds: 120 },
      'daily-standup-b1': { targetSeconds: 30, timeLimitSeconds: 60 },
      'learn-api-from-docs-b2': { minWords: 120, maxWords: 180, timeLimitSeconds: 300 },
      'meeting-disagree-and-recap-b2': { targetSeconds: 60, timeLimitSeconds: 90 },
      'technical-doc-action-b1': { minWords: 45, maxWords: 100, timeLimitSeconds: 240 },
      'technical-interview-decision-b2': { targetSeconds: 90, timeLimitSeconds: 120 },
      'technical-log-diagnosis-b1': { minWords: 70, maxWords: 130, timeLimitSeconds: 300 },
      'technical-tradeoff-explanation-b2': { targetSeconds: 60, timeLimitSeconds: 90 },
      'technology-troubleshooting-from-docs-b2': { minWords: 100, maxWords: 180, timeLimitSeconds: 360 },
      'workplace-clarification-request-b1': { minWords: 45, maxWords: 100, timeLimitSeconds: 240 },
      'workplace-issue-update-b1': { minWords: 70, maxWords: 110, timeLimitSeconds: 300 }
    }

    for (const [lessonId, contract] of Object.entries(expected)) {
      expect(lessonById(lessonId).performanceTask?.outputContract, lessonId).toMatchObject(contract)
    }
  })

  it('keeps every spoken model response plausible inside its executable duration contract', () => {
    const spokenLessons = getBundledCatalog().lessons.filter(
      (lesson) => lesson.performanceTask?.mode === 'spoken'
    )

    for (const lesson of spokenLessons) {
      const task = lesson.performanceTask
      if (task?.mode !== 'spoken') throw new Error(`Missing spoken task: ${lesson.lessonId}`)
      const words = countWords(task.modelResponse)
      const minimumWords = Math.ceil(task.outputContract.targetSeconds * 1.25)
      const maximumWords = Math.floor(task.outputContract.timeLimitSeconds * 1.25)

      expect(words, `${lesson.lessonId}: editorial floor of 75 wpm`).toBeGreaterThanOrEqual(minimumWords)
      expect(words, `${lesson.lessonId}: executable upper bound at 75 wpm`).toBeLessThanOrEqual(maximumWords)
    }
  })

  it('keeps model responses and application prompts inside the supplied evidence', () => {
    const api = lessonById('learn-api-from-docs-b2').performanceTask
    const clarification = lessonById('workplace-clarification-request-b1').performanceTask
    const log = lessonById('technical-log-diagnosis-b1').performanceTask
    const meeting = lessonById('meeting-disagree-and-recap-b2').performanceTask
    const interview = lessonById('technical-interview-decision-b2').performanceTask
    const technicalDoc = lessonById('technical-doc-action-b1').performanceTask

    expect(api?.practiceContexts?.transfer.artifacts[0]?.content).toMatch(/429.*Retry-After/is)
    expect(api?.practiceContexts?.transfer.artifacts[0]?.content).not.toMatch(/Retry-In/i)
    expect(clarification?.modelResponse).not.toMatch(/five seconds|5 seconds|Mai|today/i)
    expect(log?.modelResponse).toMatch(/unnamed pool|pool type/i)
    expect(log?.modelResponse).toMatch(/hypothesis/i)
    expect(log?.modelResponse).not.toMatch(/database pool|latest deploy/i)
    expect(meeting?.modelResponse).toMatch(/proposal|propose/i)
    expect(interview?.modelResponse).not.toMatch(/major campaign|gradual rollout|with SRE/i)

    if (technicalDoc?.mode !== 'written' || log?.mode !== 'written') {
      throw new Error('Written reading-ladder fixtures missing')
    }
    expect(technicalDoc.readingLadder?.applicationPrompt).not.toMatch(/database migration/i)
    expect(log.readingLadder?.applicationPrompt).not.toMatch(/unfamiliar timeout/i)
  })

  it('keeps legacy pronunciation lessons knowledge-only, dialect-aware and visibly synthetic', () => {
    const legacy = getBundledCatalog().lessons.filter((lesson) => lesson.sourceSchemaVersion === 'v1')
    const knowledgeVerb = /^(Nhận biết|Phân loại|Dùng|Giải thích|Đối chiếu|Xác định|Chọn|Phân biệt)/

    for (const lesson of legacy) {
      expect(lesson.completionMode, lesson.lessonId).toBe('legacy-quiz')
      expect(lesson.learningObjectives.every((objective) => knowledgeVerb.test(objective)), lesson.lessonId)
        .toBe(true)
      const reading = lesson.sections.find((section) => section.type === 'source')
      expect(reading?.title, lesson.lessonId)
        .toMatch(/Tình huống mô phỏng|Hướng dẫn do sản phẩm biên soạn/i)
      expect(reading?.content, lesson.lessonId)
        .not.toMatch(/master English|native speaker|vocal muscles|guarantee|đảm bảo thành thạo/i)
    }

    const shadowing = lessonById('pronunciation-shadowing-routine')
    const shadowingReading = shadowing.sections.find((section) => section.type === 'source')
    expect(shadowing.durationMinutes).toBe(15)
    expect(shadowingReading?.content).toMatch(/15-minute knowledge lesson/i)
    expect(shadowingReading?.content).toMatch(/process evidence/i)
    expect(shadowingReading?.content).toMatch(/(?:does not prove|neither[^.]*proves)[^.]*mastery/i)

    const shadowingSupport = shadowing.sections.find((section) => section.type === 'language-support')
    const shadowingQuiz = shadowing.sections.find((section) => section.type === 'auto-check')
    expect(JSON.stringify(shadowingSupport)).toMatch(/quiz answers only|knowledge evidence/i)
    expect(JSON.stringify(shadowingSupport)).not.toMatch(/app can record completed steps/i)
    expect(JSON.stringify(shadowingQuiz)).toMatch(/quiz.*knowledge|knowledge.*quiz|hiểu.*quy trình/i)
    expect(JSON.stringify(shadowingQuiz)).not.toMatch(/đã đi qua các bước practice/i)
  })

  it('keeps the dictionary-verified General American reference transcriptions', () => {
    const expectedByLesson: Record<string, Record<string, string>> = {
      'pronunciation-sounds': {
        developer: '/dɪˈvel.ə.pɚ/',
        database: '/ˈdeɪ.t̬ə.beɪs/'
      },
      'pronunciation-ending-sounds': {
        fixed: '/fɪkst/',
        deployed: '/dɪˈplɔɪd/',
        tested: '/ˈtes.tɪd/'
      },
      'pronunciation-word-stress': {
        architecture: '/ˈɑːr.kə.tek.tʃɚ/',
        repository: '/rɪˈpɑː.zɪ.tɔːr.i/',
        engineer: '/ˌen.dʒɪˈnɪr/'
      },
      'pronunciation-sentence-stress': {
        content: '/ˈkɑːn.tent/',
        function: '/ˈfʌŋk.ʃən/'
      },
      'pronunciation-linking-intonation': {
        intonation: '/ˌɪn.təˈneɪ.ʃən/',
        linking: '/ˈlɪŋ.kɪŋ/'
      },
      'pronunciation-shadowing-routine': {
        shadowing: '/ˈʃæd.oʊ.ɪŋ/',
        routine: '/ruːˈtiːn/'
      }
    }

    for (const [lessonId, expected] of Object.entries(expectedByLesson)) {
      const support = lessonById(lessonId).sections.find((section) => section.type === 'language-support')
      if (!support || support.type !== 'language-support') throw new Error(`Missing language support: ${lessonId}`)
      const actual = Object.fromEntries(support.vocabulary.map((item) => [item.word, item.ipa]))
      expect(actual, lessonId).toMatchObject(expected)
    }
  })

  it('repairs the known timeline and terminology contradictions', () => {
    const behavioral = lessonById('behavioral-interview-ownership-b2').performanceTask
    const sentenceStress = lessonById('pronunciation-sentence-stress')
    const sentenceStressText = JSON.stringify(sentenceStress)

    expect(behavioral?.practiceContexts?.transfer.artifacts[0]?.content)
      .toMatch(/due to expire in nine days.*six days remaining/is)
    expect(behavioral?.practiceContexts?.transfer.artifacts[0]?.content)
      .not.toMatch(/expired in nine days/i)
    expect(sentenceStressText).toMatch(/infinitival marker/i)
    expect(sentenceStressText).toMatch(/contrastive/i)
    expect(sentenceStressText).not.toMatch(/giới từ chỉ hướng/i)
  })

  it('keeps unconfirmed meeting assignments inside an explicit proposal boundary', () => {
    const meeting = lessonById('meeting-disagree-and-recap-b2').performanceTask
    if (meeting?.mode !== 'spoken' || !meeting.learningLoop) throw new Error('Meeting loop missing')
    const pretest = meeting.learningLoop.perception.pretest.find((item) => item.id === 'meet-pre-4')
    const recap = meeting.learningLoop.chunks.find((item) => item.id === 'meet-chunk-recap')
    if (!pretest || !recap) throw new Error('Meeting proposal fixtures missing')
    if (pretest.audio.kind !== 'speech-synthesis' || recap.modelAudio?.kind !== 'speech-synthesis') {
      throw new Error('Meeting proposal audio must use speech synthesis')
    }

    expect(pretest.audio.text).toMatch(/proposal|propose|pending confirmation|confirm/i)
    expect(`${pretest.question} ${pretest.correctAnswer}`).toMatch(/proposal|đề xuất|confirm|xác nhận/i)
    expect(recap.modelAudio?.text).toMatch(/proposal|propose|pending confirmation|confirm/i)
    expect(recap.slots).toHaveLength((recap.text.match(/___/g) ?? []).length)
    expect(`${pretest.audio.text} ${recap.modelAudio?.text ?? ''}`)
      .not.toMatch(/(?:Minh owns|Lan owns rollback)(?![^.]*proposal|[^.]*confirm)/i)
  })
})
