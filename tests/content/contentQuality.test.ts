import { describe, expect, it } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import type { CanonicalLesson, CanonicalSourceSection } from '@/content/schema'

const SYNTHETIC_DISCLOSURE = 'Synthetic training artifact — non-production.'
const rawFiles = import.meta.glob('/content/**/*.json', { eager: true }) as Record<string, unknown>

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
          .toBe(`/content/missions/${primaryCapability}/${raw.lessonId}.json`)
        continue
      }

      if (raw.schemaVersion === 'v1') {
        expect(path, raw.lessonId)
          .toBe(`/content/reference/pronunciation/${raw.lessonId}.json`)
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

  it('gives every capability mission reusable language support and deliberate comprehension checks', () => {
    const missions = getBundledCatalog().lessons.filter((lesson) => lesson.sourceSchemaVersion === 'v3')

    for (const lesson of missions) {
      const support = lesson.sections.filter((section) => section.type === 'language-support')
      const exercises = lesson.sections.flatMap((section) =>
        section.type === 'auto-check' ? section.exercises : []
      )
      const task = lesson.performanceTask

      expect(support, lesson.lessonId).toHaveLength(1)
      expect(support[0]?.expressions.length, lesson.lessonId).toBeGreaterThanOrEqual(3)
      expect(exercises.length, lesson.lessonId).toBeGreaterThanOrEqual(3)
      expect(exercises.every((exercise) => Boolean(exercise.explanation?.trim())), lesson.lessonId)
        .toBe(true)
      expect(task?.performancePrompt, lesson.lessonId).toMatch(/English|tiếng Anh/i)
    }
  })

  it('keeps practical mission decisions aligned from evidence through assessment', () => {
    const technicalDoc = lessonById('technical-doc-action-b1')
    const technicalDocTask = technicalDoc.performanceTask
    const technicalDocText = JSON.stringify(technicalDoc)
    expect(technicalDocText).toMatch(/read-only[^.]*before[^.]*migrat|before[^.]*migrat[^.]*read-only/is)
    expect(technicalDocTask?.modelResponse).toMatch(/roll ?back[^.]*verify[^.]*healthy[^.]*disable read-only/is)

    const logTask = lessonById('technical-log-diagnosis-b1').performanceTask
    if (logTask?.mode !== 'written') throw new Error('Log diagnosis written task missing')
    expect(logTask?.transferPrompt).not.toMatch(/memory (?:increased|rose|grew)/i)
    expect(logTask.readingLadder?.applicationPrompt).toMatch(/backlog|throughput|processing rate/i)

    const standupTask = lessonById('daily-standup-b1').performanceTask
    expect(standupTask?.outputContract.requiredElements.join(' ')).toMatch(/expected result/i)
    expect(standupTask?.modelResponse).toMatch(/so (?:we|the team|I) can/i)
    expect(JSON.stringify(standupTask?.rubric)).toMatch(/expected result/i)

    const decision = lessonById('technical-interview-decision-b2')
    const decisionTask = decision.performanceTask
    const decisionSource = decision.sections.find((section) => section.type === 'source')
    expect(decisionSource?.content).toMatch(/batch[^.]*delay|partial[- ]failure/is)
    expect(decisionTask?.performancePrompt).toMatch(/cost[^.]*mitigat|mitigat[^.]*cost/i)
    expect(decisionTask?.outputContract.requiredElements.join(' ')).toMatch(/mitigat/i)
    expect(JSON.stringify(decisionTask?.rubric)).toMatch(/mitigat|map[^.]*partial[- ]failure/i)
    expect(decisionTask?.modelResponse).toMatch(/mitigat[^.]*partial[- ]failure/i)

    const architecture = lessonById('architecture-walkthrough-b2')
    const architectureTask = architecture.performanceTask
    if (architectureTask?.mode !== 'spoken') throw new Error('Architecture spoken task missing')
    const architectureSource = architecture.sections.find((section) => section.type === 'source')
    expect(architectureSource?.content).toMatch(/outbox/i)
    expect(architectureSource?.content).toMatch(/at-least-once/i)
    expect(architectureSource?.content).toMatch(/idempotent/i)
    expect(architectureTask.performancePrompt).toMatch(/outbox/i)
    expect(architectureTask.performancePrompt)
      .toMatch(/at[- ]least[- ]once.*idempoten|idempoten.*at[- ]least[- ]once/i)
    const architectureLoop = JSON.stringify(architectureTask.learningLoop)
    expect(architectureLoop).not.toMatch(/processing fails[^.]*dead[- ]letter/i)
    expect(architectureLoop).not.toMatch(/failed (?:events?|report jobs?|jobs?)[^.]*dead[- ]letter/i)
    expect(architectureLoop).not.toMatch(/worker keeps failing/i)
    expect(architectureLoop).toMatch(/delivery[^.]*dead[- ]letter/i)

    const meetingTask = lessonById('meeting-disagree-and-recap-b2').performanceTask
    expect(meetingTask?.outputContract.requiredElements.join(' '))
      .toMatch(/owner.*deadline.*confirm|confirm.*owner.*deadline/i)
    expect(meetingTask?.modelResponse).toMatch(/propos|pending confirmation|subject to agreement/i)
    expect(meetingTask?.modelResponse)
      .toMatch(/Lan (?:is|remains)[^.]*release owner[^.]*will lead[^.]*4:15/i)
    expect(meetingTask?.modelResponse).not.toMatch(/Lan could lead/i)

    const troubleshooting = lessonById('technology-troubleshooting-from-docs-b2')
    const troubleshootingSource = troubleshooting.sections.find((section) => section.type === 'source')
    expect(troubleshootingSource?.content).toMatch(/returns an error or throws/i)
    expect(troubleshootingSource?.content).toMatch(/total (?:number of )?attempts|includes the initial attempt/i)

    const apiTask = lessonById('learn-api-from-docs-b2').performanceTask
    expect(apiTask?.performancePrompt).toMatch(/429.*503|503.*429/i)
    expect(apiTask?.performancePrompt).toMatch(/open question|unknown/i)
    expect(apiTask?.performancePrompt).toMatch(/four-step/i)
    expect(apiTask?.modelResponse).toMatch(/not define|confirm.*before production|open question/i)
    expect(apiTask?.modelResponse).toMatch(/First,[\s\S]*Second,[\s\S]*Third,[\s\S]*Fourth,/i)
    if (apiTask?.mode !== 'written') throw new Error('API written task missing')
    expect(apiTask.readingLadder?.trainingSource.content)
      .toMatch(/polling[^.]*not (?:define|specif)|polling[^.]*open question/i)
    expect(apiTask.readingLadder?.applicationChecklist.join(' ')).not.toMatch(/included bounded polling/i)
    expect(apiTask.readingLadder?.applicationChecklist.join(' '))
      .toMatch(/polling[^.]*open question|confirm[^.]*polling/i)

    const tradeoffTask = lessonById('technical-tradeoff-explanation-b2').performanceTask
    expect(tradeoffTask?.modelResponse).toMatch(/up to nine hundred milliseconds/i)
    expect(tradeoffTask?.practiceContexts?.baseline.artifacts[0]?.content)
      .toMatch(/up to 900 ms/i)
    expect(tradeoffTask?.practiceContexts?.baseline.artifacts[0]?.content)
      .not.toMatch(/\+900 ms/i)
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

  it('keeps shared contracts attainable from every phase evidence packet', () => {
    const sharedContractText = (lessonId: string) => {
      const task = lessonById(lessonId).performanceTask
      if (!task) throw new Error(`Missing performance task: ${lessonId}`)
      return `${task.outputContract.requiredElements.join(' ')} ${JSON.stringify(task.rubric)}`
    }

    const decision = lessonById('technical-interview-decision-b2').performanceTask
    if (decision?.mode !== 'spoken' || !decision.practiceContexts) {
      throw new Error('Technical decision phase contexts missing')
    }
    expect(sharedContractText('technical-interview-decision-b2'))
      .not.toMatch(/batch|partial[- ]failure|item-level/i)
    for (const [phase, context] of Object.entries(decision.practiceContexts)) {
      if (!context) continue
      const evidence = context.artifacts
        .map((artifact: CanonicalSourceSection) => artifact.content)
        .join(' ')
      expect(evidence, `technical decision ${phase}: cost`).toMatch(/\bCost:/i)
      expect(evidence, `technical decision ${phase}: mitigation`).toMatch(/\bMitigation:/i)
    }

    expect(sharedContractText('architecture-walkthrough-b2'))
      .not.toMatch(/outbox|idempot|partial status|message-delivery/i)
    expect(sharedContractText('architecture-walkthrough-b2'))
      .toMatch(/current evidence packet|current packet/i)

    expect(sharedContractText('learn-api-from-docs-b2'))
      .not.toMatch(/429[^.]*503|503[^.]*429|four[- ]step|polling|retention|same-key/i)
    expect(sharedContractText('learn-api-from-docs-b2'))
      .toMatch(/current evidence packet|current packet/i)

    expect(sharedContractText('meeting-disagree-and-recap-b2'))
      .not.toMatch(/go\/no-go threshold/i)
    expect(sharedContractText('meeting-disagree-and-recap-b2'))
      .toMatch(/current evidence packet|current packet/i)
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
      const minimumWords = Math.ceil(task.outputContract.targetSeconds * 110 / 60)
      const maximumWords = Math.floor(task.outputContract.timeLimitSeconds * 160 / 60)

      expect(words, `${lesson.lessonId}: learner pace floor of 110 wpm`).toBeGreaterThanOrEqual(minimumWords)
      expect(words, `${lesson.lessonId}: fluent pace ceiling of 160 wpm`).toBeLessThanOrEqual(maximumWords)
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
    expect(sentenceStressText).toMatch(/BUG[^.]*TIMEOUT/i)
    expect(sentenceStressText).not.toMatch(/fixed THE bug/)

    const endingSounds = lessonById('pronunciation-ending-sounds')
    const endingSoundsText = JSON.stringify(endingSounds)
    expect(endingSoundsText).toMatch(/\/ɪd\/[^.]*\/t\/[^.]*\/d\/|\/t\/[^.]*\/d\/[^.]*\/ɪd\//i)
    expect(endingSoundsText).toMatch(/voiceless|vô thanh/i)
    expect(endingSoundsText).toMatch(/voiced|hữu thanh/i)

    const wordStress = lessonById('pronunciation-word-stress')
    const wordStressChecks = wordStress.sections.flatMap((section) =>
      section.type === 'auto-check' ? section.exercises : []
    )
    expect(wordStressChecks.some((exercise) =>
      /secondary stress|trọng âm phụ|ˌ/i.test(`${exercise.question} ${exercise.explanation ?? ''}`)
    )).toBe(true)
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

/** Pronouns and demonstratives are excluded on purpose: contrastive stress on I or this is legitimate (ownership stories). */
const FUNCTION_WORDS = new Set((
  'a an the and but or because if of to by from for with in on at as is are was were be been '
  + 'could can would will should may might shall do does did'
).split(' '))

interface StressChunk { id: string, text: string, stressPattern?: string }

export function findStressViolations(chunks: StressChunk[]): string[] {
  const violations: string[] = []
  for (const chunk of chunks) {
    if (!chunk.stressPattern) continue
    const sentenceWords = chunk.text.toLowerCase().replace(/’/g, "'").replace(/___/g, ' ').match(/[a-z']+/g) ?? []
    for (const token of chunk.stressPattern.toLowerCase().split(/[\s·]+/).filter(Boolean)) {
      if (FUNCTION_WORDS.has(token)) violations.push(`${chunk.id}: ${token.toUpperCase()} is a function word`)
      else if (!sentenceWords.some((word) => word.startsWith(token))) {
        violations.push(`${chunk.id}: ${token.toUpperCase()} is not a word of the sentence frame`)
      }
    }
  }
  return violations
}

interface CueTriggerInput { id: string, ipa?: string, articulatoryCue: string, triggerItemIds: string[] }

export function findCueTriggerViolations(cues: CueTriggerInput[], audioById: Map<string, string>): string[] {
  const violations: string[] = []
  for (const cue of cues) {
    if (!cue.ipa) continue
    const cueWords = new Set(cue.articulatoryCue.match(/[A-Za-z]{4,}/g)?.map((word) => word.toLowerCase()) ?? [])
    for (const itemId of cue.triggerItemIds) {
      const audio = audioById.get(itemId)
      if (audio === undefined) violations.push(`${cue.id}: trigger ${itemId} does not exist`)
      else if (!(audio.toLowerCase().match(/[a-z]+/g) ?? []).some((word) => cueWords.has(word))) {
        violations.push(`${cue.id}: trigger ${itemId} has none of the cue words in its audio`)
      }
    }
  }
  return violations
}

describe('stress and cue rules catch flaws', () => {
  it('accepts content words of the sentence frame', () => {
    expect(findStressViolations([
      { id: 'ok-1', text: 'I see the ___ concern, but I’m concerned about ___.', stressPattern: 'CONCERN · CONCERNED' },
      { id: 'ok-2', text: 'Let me put that more clearly: ___.', stressPattern: 'MORE CLEARLY' },
      { id: 'ok-3', text: 'The benefit is ___; the cost is ___.', stressPattern: 'BENEFIT · COST' }
    ])).toEqual([])
  })

  it('rejects function words and words missing from the frame', () => {
    expect(findStressViolations([{ id: 'bad-1', text: 'I chose ___ because ___.', stressPattern: 'CHOSE · BECAUSE' }]))
      .toEqual(['bad-1: BECAUSE is a function word'])
    expect(findStressViolations([{ id: 'bad-2', text: 'We can mitigate ___ by ___.', stressPattern: 'MITIGATE · ACTION' }]))
      .toEqual(['bad-2: ACTION is not a word of the sentence frame'])
  })

  it('rejects an ending-sound cue triggered by audio without any of its words', () => {
    const cues = [{ id: 'cue', ipa: '/s/', articulatoryCue: 'Keep the ending of requests and costs.', triggerItemIds: ['a', 'b', 'c'] }]
    const audio = new Map([['a', 'The costs rose.'], ['b', 'The request stays fast.']])
    expect(findCueTriggerViolations(cues, audio)).toEqual([
      'cue: trigger b has none of the cue words in its audio',
      'cue: trigger c does not exist'
    ])
  })
})

function loopOf(lessonId: string) {
  const task = lessonById(lessonId).performanceTask
  if (task?.mode !== 'spoken' || !task.learningLoop) throw new Error(`Missing spoken loop: ${lessonId}`)
  return task.learningLoop
}

function perceptionItem(lessonId: string, itemId: string) {
  const { pretest, training, posttest } = loopOf(lessonId).perception
  const item = [...pretest, ...training, ...posttest].find((candidate) => candidate.id === itemId)
  if (!item) throw new Error(`Missing perception item ${lessonId}/${itemId}`)
  return item
}

const SPOKEN_LESSONS = [
  'architecture-walkthrough-b2', 'behavioral-interview-ownership-b2', 'daily-standup-b1',
  'meeting-disagree-and-recap-b2', 'technical-interview-decision-b2', 'technical-tradeoff-explanation-b2'
]

describe('content accuracy', () => {
  it('stresses only content words that appear in each chunk frame', () => {
    const chunks = SPOKEN_LESSONS.flatMap((lessonId) => loopOf(lessonId).chunks)
    expect(chunks.length).toBeGreaterThan(10)
    expect(findStressViolations(chunks)).toEqual([])
  })

  it('triggers ending-sound cues only with audio that contains a cue word', () => {
    for (const lessonId of SPOKEN_LESSONS) {
      const loop = loopOf(lessonId)
      const audio = new Map<string, string>()
      for (const item of [...loop.perception.pretest, ...loop.perception.training, ...loop.perception.posttest]) {
        audio.set(item.id, item.audio.kind === 'speech-synthesis' ? item.audio.text : item.audio.transcript)
      }
      expect(findCueTriggerViolations(loop.pronunciationCues as CueTriggerInput[], audio), lessonId).toEqual([])
    }
  })

  it('keeps questions and feedback consistent with the audio they describe', () => {
    expect(perceptionItem('daily-standup-b1', 'stand-pre-3').question).toMatch(/blocker/i)
    expect(perceptionItem('daily-standup-b1', 'stand-pre-3').question).not.toMatch(/what is blocked/i)
    expect(perceptionItem('meeting-disagree-and-recap-b2', 'meet-train-3').question).toMatch(/sau chữ but/i)
    expect(perceptionItem('meeting-disagree-and-recap-b2', 'meet-train-1').feedback).not.toMatch(/failed/i)
    expect(perceptionItem('technical-interview-decision-b2', 'dec-train-2').feedback).not.toMatch(/stress chose and because/i)
    expect(perceptionItem('technical-interview-decision-b2', 'dec-train-3').feedback).not.toMatch(/results|costs/i)
    expect(perceptionItem('technical-tradeoff-explanation-b2', 'trade-train-2').question).not.toMatch(/từ nào/i)
    expect(perceptionItem('architecture-walkthrough-b2', 'arch-post-1').question).toMatch(/two retries/i)
  })

  it('has no known grammar or usage errors in any learner-facing text', () => {
    const everything = JSON.stringify(getBundledCatalog().lessons)
    const forbidden = [
      /rollback the latest snapshot/i, /roll back the snapshot/i, /completion time should pass/i,
      /event ID idempotently/i, /could own the test/i, /Report event deliveries that still fail/i,
      /without suggesting that I resolved/i, /automate the canary gate/i
    ]
    for (const pattern of forbidden) expect(everything, String(pattern)).not.toMatch(pattern)
  })

  it('keeps model responses consistent with their prompts and sequences', () => {
    const api = lessonById('learn-api-from-docs-b2').performanceTask
    const update = lessonById('workplace-issue-update-b1').performanceTask
    if (!api || !update) throw new Error('Model response fixtures missing')
    const polling = api.modelResponse.search(/status polling/i)
    expect(polling).toBeGreaterThan(-1)
    expect(api.modelResponse.search(/failed processing/i), 'failed processing needs polling first').toBeGreaterThan(polling)
    expect((update.modelResponse.match(/\?/g) ?? []).length, 'one decision requested').toBe(1)
    expect(update.modelResponse).not.toMatch(/I propose/i)
  })

  it('does not copy dictionary or tutorial definitions into pronunciation lessons', () => {
    const copied = [
      'An activity or purpose natural to or intended for a person or thing',
      'A structured set of data held in a computer',
      'The rise and fall of the voice in speaking',
      'A sequence of actions regularly followed',
      'A block of organized, reusable code that is used to perform a single, related action'
    ]
    const pronunciation = JSON.stringify(getBundledCatalog().lessons.filter((lesson) => lesson.lessonId.startsWith('pronunciation-')))
    for (const text of copied) expect(pronunciation.toLowerCase(), text).not.toContain(text.toLowerCase())
  })

  it('discloses adapted synthetic artifacts through their adaptation note', () => {
    for (const lesson of getBundledCatalog().lessons) {
      for (const source of collectV3Sources(lesson)) {
        const provenance = source.provenance
        if (provenance?.origin === 'synthetic' && (provenance.sourceIds?.length ?? 0) > 0) {
          expect(provenance.adaptationNote?.length ?? 0, `${lesson.lessonId}/${source.id}`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('writes every B2 prompt and brief in English', () => {
    const vietnamese = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i
    for (const lesson of getBundledCatalog().lessons) {
      const task = lesson.performanceTask
      if (lesson.cefrLevel !== 'B2' || !task) continue
      const fields: Record<string, string> = {
        performancePrompt: task.performancePrompt,
        reviewPrompt: task.reviewPrompt,
        transferPrompt: task.transferPrompt
      }
      for (const [phase, context] of Object.entries(task.practiceContexts ?? {})) fields[`${phase} brief`] = context.brief
      for (const [name, text] of Object.entries(fields)) {
        expect(text ?? '', `${lesson.lessonId}: ${name}`).not.toMatch(vietnamese)
      }
    }
  })
})