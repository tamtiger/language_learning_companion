import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const HISTORICAL_TASK_ID = '20260827-224143-complete-realistic-curriculum'

const HISTORICAL_LOCATION_ENTRIES = [
  ['architecture-walkthrough-b2', 'content/modules/capabilities/architecture-walkthrough-b2.json'],
  ['behavioral-interview-ownership-b2', 'content/modules/capabilities/behavioral-interview-ownership-b2.json'],
  ['daily-standup-b1', 'content/modules/workplace-communication/daily_standup.json'],
  ['learn-api-from-docs-b2', 'content/modules/capabilities/learn-api-from-docs-b2.json'],
  ['meeting-disagree-and-recap-b2', 'content/modules/capabilities/meeting-disagree-and-recap-b2.json'],
  ['pronunciation-ending-sounds', 'content/modules/pronunciation/lesson_02.json'],
  ['pronunciation-linking-intonation', 'content/modules/pronunciation/lesson_05.json'],
  ['pronunciation-sentence-stress', 'content/modules/pronunciation/lesson_04.json'],
  ['pronunciation-shadowing-routine', 'content/modules/pronunciation/lesson_06.json'],
  ['pronunciation-sounds', 'content/modules/pronunciation/lesson_01.json'],
  ['pronunciation-word-stress', 'content/modules/pronunciation/lesson_03.json'],
  ['technical-doc-action-b1', 'content/modules/capabilities/technical-doc-action-b1.json'],
  ['technical-interview-decision-b2', 'content/modules/capabilities/technical-interview-decision-b2.json'],
  ['technical-log-diagnosis-b1', 'content/modules/capabilities/technical-log-diagnosis-b1.json'],
  ['technical-tradeoff-explanation-b2', 'content/modules/capabilities/technical-tradeoff-explanation-b2.json'],
  ['technology-troubleshooting-from-docs-b2', 'content/modules/capabilities/technology-troubleshooting-from-docs-b2.json'],
  ['workplace-clarification-request-b1', 'content/modules/capabilities/workplace-clarification-request-b1.json'],
  ['workplace-issue-update-b1', 'content/modules/capabilities/workplace-issue-update-b1.json']
]

function isSafeHistoricalLocationPath(value) {
  if (typeof value !== 'string' || value.includes('\\') || value.includes('#') || path.posix.isAbsolute(value)) return false
  if (path.posix.normalize(value) !== value) return false
  const segments = value.split('/')
  return segments.length >= 2
    && segments[0] === 'content'
    && segments.every((segment) => /^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(segment))
    && value.endsWith('.json')
}

export function createHistoricalLocationMap(entries) {
  const locations = new Map()
  const lessonIdByPath = new Map()
  for (const entry of entries) {
    if (!Array.isArray(entry) || entry.length !== 2) throw new Error('historical location mapping entry must be [lessonId, path]')
    const [lessonId, historicalPath] = entry
    if (typeof lessonId !== 'string' || !/^[a-z0-9][a-z0-9-]*$/u.test(lessonId)) {
      throw new Error(`invalid historical lesson ID ${lessonId}`)
    }
    if (!isSafeHistoricalLocationPath(historicalPath)) {
      throw new Error(`unsafe historical location path ${historicalPath}`)
    }
    if (locations.has(lessonId)) throw new Error(`duplicate historical lesson ID ${lessonId}`)
    if (lessonIdByPath.has(historicalPath)) {
      throw new Error(`duplicate historical location path ${historicalPath}`)
    }
    locations.set(lessonId, historicalPath)
    lessonIdByPath.set(historicalPath, lessonId)
  }
  return locations
}

const HISTORICAL_LOCATIONS_BY_TASK = new Map([
  [HISTORICAL_TASK_ID, createHistoricalLocationMap(HISTORICAL_LOCATION_ENTRIES)]
])

export function projectCorpusLocations(corpus, taskId) {
  const historicalLocations = HISTORICAL_LOCATIONS_BY_TASK.get(taskId)
  if (!historicalLocations) return corpus

  const corpusLessonIds = new Set()
  for (const entry of corpus) {
    const lessonId = entry.lesson?.lessonId
    if (corpusLessonIds.has(lessonId)) throw new Error(`duplicate corpus lesson ID ${lessonId}`)
    corpusLessonIds.add(lessonId)
    if (!historicalLocations.has(lessonId)) {
      throw new Error(`missing historical location mapping for ${lessonId}`)
    }
  }
  for (const lessonId of historicalLocations.keys()) {
    if (!corpusLessonIds.has(lessonId)) throw new Error(`historical location mapping references missing lesson ${lessonId}`)
  }

  return corpus.map((entry) => ({
    ...entry,
    locationPath: historicalLocations.get(entry.lesson.lessonId)
  }))
}

function corpusLocationPath(entry) {
  return entry.locationPath ?? entry.filePath
}

const REQUIRED_ITEM_FIELDS = [
  'id', 'lessonId', 'generation', 'capability', 'phase', 'artifactOrClaim', 'location',
  'surfaceId', 'parentLocation', 'componentPointer', 'componentRole', 'componentLocations',
  'contentDigest', 'jobFunctionId', 'claimClass', 'realismStatus',
  'provenanceStatus', 'sourceIds', 'internalCoherence', 'answerability', 'severity',
  'evidenceIds', 'requiredActionIds', 'verificationIds', 'disposition', 'confidence'
]

export const CLAIM_CLASSES = [
  'factual-official',
  'research-cefr-rationale',
  'synthetic-workplace',
  'adapted-quoted',
  'product-owned-instruction'
]

const CLAIM_CLASS_SET = new Set(CLAIM_CLASSES)
const SELF_CHECK_ID = 'check-research-package-detailed'

const IPA_SOURCE_IDS = {
  developer: ['cambridge-developer'],
  database: ['cambridge-database'],
  fixed: ['cambridge-fixed'],
  deployed: ['cambridge-deploy', 'cambridge-ed'],
  tested: ['cambridge-time-tested', 'cambridge-ed'],
  architecture: ['cambridge-architecture'],
  repository: ['cambridge-repository'],
  engineer: ['cambridge-engineer'],
  content: ['cambridge-content'],
  function: ['cambridge-function'],
  intonation: ['cambridge-intonation'],
  linking: ['cambridge-linking-verb'],
  shadowing: ['cambridge-shadow', 'cambridge-ing', 'cambridge-basic-ing'],
  routine: ['cambridge-routine']
}

function walkJsonFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const target = path.join(directory, name)
    return statSync(target).isDirectory()
      ? walkJsonFiles(target)
      : name.endsWith('.json') ? [target] : []
  })
}

function pointerToken(value) {
  return String(value).replaceAll('~', '~0').replaceAll('/', '~1')
}

function pointerJoin(base, token) {
  return `${base}/${pointerToken(token)}`
}

export function valueAtPointer(root, pointer) {
  if (pointer === '' || pointer === '/') return root
  return pointer.split('/').slice(1).reduce((value, token) => {
    const key = token.replaceAll('~1', '/').replaceAll('~0', '~')
    if (value === null || value === undefined || !(key in value)) {
      throw new Error(`JSON pointer does not resolve: ${pointer}`)
    }
    return value[key]
  }, root)
}

function leafPointers(value, pointer) {
  if (value === null || typeof value !== 'object') return [pointer]
  if (Array.isArray(value)) {
    return value.flatMap((child, index) => leafPointers(child, pointerJoin(pointer, index)))
  }
  return Object.entries(value).flatMap(([key, child]) => leafPointers(child, pointerJoin(pointer, key)))
}

export function digest(value) {
  return `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`
}

function location(filePath, pointer) {
  return `${filePath}#${pointer}`
}

function classifyItem(generation, kind, surfaceValue, componentRole) {
  const origin = surfaceValue?.provenance?.origin
  if (origin === 'synthetic') {
    return { claimClass: 'synthetic-workplace', provenanceStatus: 'explicit-synthetic' }
  }
  if (origin === 'adapted') {
    return { claimClass: 'adapted-quoted', provenanceStatus: 'resolved' }
  }
  if (kind === 'cefr' || kind === 'review-policy') {
    return { claimClass: 'research-cefr-rationale', provenanceStatus: 'resolved' }
  }
  if (kind === 'source-registry') {
    return { claimClass: 'factual-official', provenanceStatus: 'resolved' }
  }
  if (generation === 'v1' && kind === 'vocabulary' && ['word', 'ipa'].includes(componentRole)) {
    return { claimClass: 'factual-official', provenanceStatus: 'resolved' }
  }
  if (generation === 'v1' && kind === 'legacy-reading') {
    return { claimClass: 'synthetic-workplace', provenanceStatus: 'legacy-disclosed' }
  }
  if (kind.includes('source') || kind === 'context-artifact') {
    return origin === 'original'
      ? { claimClass: 'synthetic-workplace', provenanceStatus: 'explicit-original' }
      : { claimClass: 'synthetic-workplace', provenanceStatus: 'explicit-synthetic' }
  }
  return { claimClass: 'product-owned-instruction', provenanceStatus: 'product-owned' }
}

function phaseForKind(kind, explicitPhase) {
  if (explicitPhase) return explicitPhase
  if (kind.startsWith('learning-')) return 'guided'
  if (kind.startsWith('reading-')) return 'guided'
  if (kind === 'review-policy') return 'delayed-review'
  return 'shared'
}

function componentRole(relativePointer) {
  if (!relativePointer) return 'value'
  const tokens = relativePointer.split('/')
  if (tokens[0] === 'options') return 'option'
  if (tokens[0] === 'correctAnswer') return 'correct-answer'
  if (tokens[0] === 'matchingPairs') return tokens.at(-1) === 'key' ? 'matching-key' : 'matching-value'
  return tokens.at(-1)
}

function sourceIdsForItem(generation, kind, surfaceValue, role) {
  if (generation === 'v1' && kind === 'vocabulary' && ['word', 'ipa'].includes(role)) {
    return IPA_SOURCE_IDS[surfaceValue.word] ?? []
  }
  if (kind === 'cefr') return ['coe-cefr-companion-2020']
  if (kind === 'review-policy') return ['cepeda-2008', 'cepeda-2006-synthesis']
  if (kind === 'source-registry') return surfaceValue.sourceId ? [surfaceValue.sourceId] : []
  return surfaceValue?.provenance?.sourceIds ?? []
}

function itemRecord({ lesson, generation, filePath, kind, stableId, parentPointer, componentPointer, surfaceValue, componentValue, phase }) {
  const capability = generation === 'v3' ? lesson.capabilities[0] : 'legacy-pronunciation'
  const relativePointer = componentPointer === parentPointer
    ? ''
    : componentPointer.slice(parentPointer.length + 1)
  const role = componentRole(relativePointer)
  const classification = classifyItem(generation, kind, surfaceValue, role)
  const sourceIds = sourceIdsForItem(generation, kind, surfaceValue, role)
  const answerabilityApplies = [
    'exercise', 'model-response', 'context-artifact', 'rubric', 'output-contract',
    'learning-perception', 'learning-interaction', 'reading-extraction', 'reading-application-prompt'
  ].includes(kind)
  const surfaceId = `${lesson.lessonId}::${kind}::${stableId}`
  const componentLocation = location(filePath, componentPointer)
  return {
    id: `${surfaceId}::component::${relativePointer || 'value'}`,
    lessonId: lesson.lessonId,
    generation,
    capability,
    phase: phaseForKind(kind, phase),
    artifactOrClaim: kind,
    surfaceId,
    parentLocation: location(filePath, parentPointer),
    componentPointer,
    componentRole: role,
    location: componentLocation,
    componentLocations: [componentLocation],
    contentDigest: digest(componentValue),
    jobFunctionId: capability,
    claimClass: classification.claimClass,
    realismStatus: 'not-checked',
    provenanceStatus: classification.provenanceStatus,
    sourceIds,
    internalCoherence: 'not-checked',
    answerability: answerabilityApplies ? 'not-checked' : 'not-applicable',
    severity: 'not-checked',
    evidenceIds: [],
    requiredActionIds: [],
    verificationIds: [],
    disposition: 'not-checked',
    confidence: 'not-checked'
  }
}

export function loadCorpus(root = ROOT) {
  return walkJsonFiles(path.join(root, 'content')).map((absolutePath) => {
    const filePath = path.relative(root, absolutePath).replaceAll('\\', '/')
    return {
      absolutePath,
      filePath,
      locationPath: filePath,
      lesson: JSON.parse(readFileSync(absolutePath, 'utf8'))
    }
  }).sort((a, b) => a.lesson.lessonId.localeCompare(b.lesson.lessonId))
}

export function enumerateItems(corpus) {
  const items = []
  const add = (entry, kind, stableId, pointer, value, phase, componentPointers = leafPointers(value, pointer)) => {
    const pointers = componentPointers.length ? componentPointers : [pointer]
    for (const childPointer of pointers) {
      items.push(itemRecord({
        lesson: entry.lesson,
        generation: entry.lesson.schemaVersion,
        filePath: corpusLocationPath(entry),
        kind,
        stableId,
        parentPointer: pointer,
        componentPointer: childPointer,
        surfaceValue: value,
        componentValue: valueAtPointer(entry.lesson, childPointer),
        phase
      }))
    }
  }

  for (const entry of corpus) {
    const lesson = entry.lesson
    if (lesson.schemaVersion === 'v3') {
      add(entry, 'title', 'title', '/title', lesson.title, 'shared')
      add(entry, 'summary', 'summary', '/summary', lesson.summary, 'shared')
      add(entry, 'cefr', 'level', '/cefrLevel', lesson.cefrLevel)
      add(entry, 'duration', 'minutes', '/durationMinutes', lesson.durationMinutes)
      lesson.sourceRegistry?.forEach((source, index) => {
        add(entry, 'source-registry', source.sourceId, `/sourceRegistry/${index}`, source, 'shared')
      })
      lesson.learningObjectives.forEach((objective, index) => {
        add(entry, 'objective', index + 1, `/learningObjectives/${index}`, objective)
      })
      lesson.sections.forEach((section, sectionIndex) => {
        const base = `/sections/${sectionIndex}`
        if (section.type === 'brief') add(entry, 'section-brief', section.id, base, section)
        if (section.type === 'source') add(entry, 'section-source', section.id, base, section)
        if (section.type === 'auto-check') section.exercises.forEach((exercise, exerciseIndex) => {
          add(entry, 'exercise', exercise.id, `${base}/exercises/${exerciseIndex}`, exercise)
        })
      })

      const task = lesson.performanceTask
      const taskPointer = '/performanceTask'
      const scalarTaskFields = [
        ['scenario', 'scenario', 'shared'],
        ['baselinePrompt', 'prompt-baseline', 'baseline'],
        ['performancePrompt', 'prompt-performance', 'performance'],
        ['modelResponse', 'model-response', 'performance'],
        ['retryPrompt', 'prompt-retry', 'retry'],
        ['transferPrompt', 'prompt-transfer', 'transfer'],
        ['reviewPrompt', 'prompt-review', 'review']
      ]
      scalarTaskFields.forEach(([field, kind, phase]) => {
        add(entry, kind, field, `${taskPointer}/${field}`, task[field], phase)
      })

      if (task.practiceContexts) {
        Object.entries(task.practiceContexts).forEach(([phase, context]) => {
          const base = `${taskPointer}/practiceContexts/${phase}`
          add(entry, 'context-brief', phase, `${base}/brief`, context.brief, phase)
          context.artifacts.forEach((artifact, artifactIndex) => {
            add(entry, 'context-artifact', `${phase}-${artifact.id}`, `${base}/artifacts/${artifactIndex}`, artifact, phase)
          })
        })
      }

      add(entry, 'output-contract', task.id, `${taskPointer}/outputContract`, task.outputContract)
      add(entry, 'independence-contract', task.id, `${taskPointer}/independenceContract`, task.independenceContract)
      task.feedbackPriorities.forEach((priority, index) => {
        add(entry, 'feedback-priority', index + 1, `${taskPointer}/feedbackPriorities/${index}`, priority)
      })
      task.rubric.forEach((rubric, index) => {
        add(entry, 'rubric', rubric.id, `${taskPointer}/rubric/${index}`, rubric)
      })

      if (task.learningLoop) {
        const loop = task.learningLoop
        const loopPointer = `${taskPointer}/learningLoop`
        for (const group of ['pretest', 'training', 'posttest']) {
          loop.perception[group].forEach((perception, index) => {
            add(entry, 'learning-perception', `${group}-${perception.id}`, `${loopPointer}/perception/${group}/${index}`, perception, 'guided')
          })
        }
        loop.pronunciationCues.forEach((cue, index) => add(entry, 'learning-cue', cue.id, `${loopPointer}/pronunciationCues/${index}`, cue, 'guided'))
        loop.chunks.forEach((chunk, index) => add(entry, 'learning-chunk', chunk.id, `${loopPointer}/chunks/${index}`, chunk, 'guided'))
        loop.shadowingSteps.forEach((step, index) => add(entry, 'learning-shadow-step', index + 1, `${loopPointer}/shadowingSteps/${index}`, step, 'guided'))
        loop.listenBackChecklist.forEach((check, index) => add(entry, 'learning-listen-back', index + 1, `${loopPointer}/listenBackChecklist/${index}`, check, 'guided'))
        loop.interactionTurns.forEach((turn, index) => add(entry, 'learning-interaction', turn.id, `${loopPointer}/interactionTurns/${index}`, turn, 'guided'))
      }

      if (task.readingLadder) {
        const ladder = task.readingLadder
        const ladderPointer = `${taskPointer}/readingLadder`
        add(entry, 'reading-source', ladder.trainingSource.id, `${ladderPointer}/trainingSource`, ladder.trainingSource, 'guided')
        ladder.extractionItems.forEach((exercise, index) => add(entry, 'reading-extraction', exercise.id, `${ladderPointer}/extractionItems/${index}`, exercise, 'guided'))
        add(entry, 'reading-application-prompt', 'application', `${ladderPointer}/applicationPrompt`, ladder.applicationPrompt, 'guided')
        ladder.applicationChecklist.forEach((check, index) => add(entry, 'reading-application-check', index + 1, `${ladderPointer}/applicationChecklist/${index}`, check, 'guided'))
      }

      add(entry, 'review-policy', 'intervals', '/reviewPolicy', lesson.reviewPolicy, 'delayed-review')
      continue
    }

    add(entry, 'title', 'title', '/title', lesson.title, 'legacy-knowledge')
    add(entry, 'cefr', 'level', '/cefrLevel', lesson.cefrLevel, 'legacy-knowledge')
    add(entry, 'duration', 'minutes', '/durationMinutes', lesson.durationMinutes, 'legacy-knowledge')
    lesson.learningObjectives.forEach((objective, index) => add(entry, 'objective', index + 1, `/learningObjectives/${index}`, objective, 'legacy-knowledge'))
    lesson.vocabulary.forEach((word, index) => add(entry, 'vocabulary', word.word, `/vocabulary/${index}`, word, 'legacy-knowledge'))
    lesson.expressions.forEach((expression, index) => add(entry, 'expression', expression.phrase, `/expressions/${index}`, expression, 'legacy-knowledge'))
    add(entry, 'legacy-reading', 'reading', '/reading', lesson.reading, 'legacy-knowledge')
    lesson.exercises.forEach((exercise, index) => add(entry, 'exercise', exercise.id, `/exercises/${index}`, exercise, 'legacy-knowledge'))
  }
  return items
}

export function splitModelSentences(text) {
  return text
    .trim()
    .split(/\s*•\s*|\r?\n+|(?<=[.!?])\s+(?=["'“‘(]*[\p{Lu}\d])/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

const SEMANTIC_STOP_WORDS = new Set([
  'about', 'after', 'again', 'also', 'and', 'before', 'because', 'been', 'being', 'between',
  'can', 'could', 'does', 'from', 'have', 'into', 'just', 'more', 'must', 'not', 'one', 'only', 'other', 'should',
  'that', 'the', 'their', 'then', 'there', 'these', 'this', 'those', 'through', 'under', 'uses', 'using',
  'what', 'when', 'where', 'which', 'while', 'with', 'would', 'your', 'cach', 'cho', 'cua',
  'duoc', 'giai', 'khong', 'mot', 'nhung', 'theo', 'trong', 'voi'
])

const SEMANTIC_CONCEPTS = {
  acknowledgement: ['acknowledgement', 'acknowledge', 'acknowledges', 'acknowledged', 'i understand', 'understand why', 'i see', 'ghi nhận'],
  action: ['action', 'priority', 'plan', 'will', 'run', 'enable', 'disable', 'hành động', 'ưu tiên'],
  answer: ['answer', 'response', 'output', 'deliverable', 'trả lời', 'đầu ra'],
  audience: ['audience', 'listener', 'customer', 'team', 'người nghe'],
  blocker: ['blocker', 'blocked', 'blocking', 'impediment', 'no blocker', 'trở ngại'],
  clarification: ['clarify', 'clarification', 'confirm', 'question', 'questions', 'unclear', 'ambiguous', 'làm rõ', 'xác nhận', 'chưa rõ', 'mơ hồ'],
  command: ['command', 'execute', 'run', 'enable', 'disable', 'lệnh', 'thực thi'],
  context: ['situation', 'context', 'background', 'scenario', 'during', 'when', 'before the', 'weeks before', 'bối cảnh'],
  consequence: ['consequence', 'impact', 'result', 'effect', 'affected', 'rose to', 'increase', 'kết quả', 'hậu quả'],
  decisionRequest: ['decision request', 'could you', 'please decide', 'approve', 'choose', 'name the', 'yêu cầu quyết định'],
  disagreement: ['disagree', 'disagreeing', 'disagreement', 'concerned', 'i am concerned', "i'm concerned", 'phản biện'],
  evidence: ['evidence', 'fact', 'metric', 'signal', 'data', 'measured', 'observed', 'reported', 'percent', 'rose to', 'because', 'shows', 'bằng chứng', 'dữ kiện'],
  experiment: ['experiment', 'isolated', 'synthetic failing', 'trial', 'controlled test', 'thử nghiệm'],
  executionPlan: ['implementation plan', 'plan', 'i would', 'first', 'then', 'finally', 'before enabling', 'kế hoạch triển khai'],
  failure: ['fail', 'failure', 'error', 'retry', 'dead-letter', 'degraded', 'lỗi'],
  flow: ['flow', 'lifecycle', 'sequence', 'stage', 'step', 'first', 'finally', 'luồng', 'trình tự', 'tổ chức'],
  hypothesis: ['hypothesis', 'likely', 'might', 'possible', 'appears', 'strongest lead', 'does not confirm', 'root cause', 'cautious', 'giả thuyết'],
  mitigation: ['mitigation', 'mitigate', 'reduce the risk', 'guardrail', 'giảm thiểu'],
  nextAction: ['next action', 'next step', 'asked', 'pair with', 'follow-up', 'follow up', 'once those', "i'll", 'share an estimate', 'hành động tiếp theo'],
  ownership: ['owner', 'ownership', 'responsibility', 'responsibilities', 'role', 'component', 'authenticates', 'routes', 'validates', 'records', 'publishes', 'reserves', 'authorizes', 'phụ trách', 'trách nhiệm'],
  attribution: ['i và we', 'i and we', 'i introduced', 'personally', 'personal action', 'team activity', 'cá nhân', 'cả nhóm'],
  performance: ['performance', 'latency', 'duration', 'time', 'timed', 'word', 'thời gian'],
  prerequisite: ['prerequisite', 'precondition', 'confirm', 'below', 'before changing', 'before enabling', 'điều kiện tiên quyết'],
  procedureAction: ['action', 'run cachectl', 'enable read-only mode', 'execute the command', 'thao tác'],
  proposal: ['proposal', 'propose', 'recommend', 'recommendation', 'option', 'alternative', 'đề xuất'],
  reflection: ['lesson', 'learned', 'learning', 'reflection', 'reflect', 'looking back', 'bài học', 'suy ngẫm'],
  recovery: ['recovery', 'recover', 'rollback', 'fallback', 'revert', 'escalation', 'notify on-call', 'khôi phục'],
  risk: ['risk', 'constraint', 'blocker', 'trade-off', 'tradeoff', 'cost', 'benefit', 'rủi ro', 'đánh đổi'],
  structure: ['structure', 'organize', 'concise', 'star', 'recap', 'summary', 'cấu trúc', 'ngắn gọn'],
  symptom: ['symptom', 'returned http', 'reported', 'failed', 'failure', 'error response', 'triệu chứng'],
  successSignal: ['success signal', 'success condition', 'verify', 'verified', 'healthy', 'complete', 'completion', 'tín hiệu thành công'],
  verification: ['verification', 'verify', 'validation', 'test', 'check', 'inspect', 'compare', 'xác minh', 'kiểm tra']
}

const AUDITED_MODEL_RESPONSE_DIGESTS = {
  'architecture-walkthrough-b2': 'sha256:dcc5d1c6e3460cef3ea2b74490ccc14acb5f67f188aa66b245b1636b35530c82',
  'behavioral-interview-ownership-b2': 'sha256:6b273d2e80c444c030efa8f1abc9057c3a18737319d5047a885d08187eb44bcf',
  'daily-standup-b1': 'sha256:1519bb7af9d6e3df37e2d7782ec016a395386fe00d9f97ce858be78e10839622',
  'learn-api-from-docs-b2': 'sha256:33684a760ff9d4e3bda197fae09ac558e3092a0586413c53227d46bf7bfd177f',
  'meeting-disagree-and-recap-b2': 'sha256:ef6ebf030d944c644a3f9c7bdd697a9735ffd9f54801df14fe1777292a9bfc3d',
  'technical-doc-action-b1': 'sha256:c8a57dcb473a877736d3faf722af4d010d13bd0b4951620c9bdb620cddae6653',
  'technical-interview-decision-b2': 'sha256:465e3eb69266b47b36b136e44a715aef0a88f54cff7127c55d0fbcd3653848ab',
  'technical-log-diagnosis-b1': 'sha256:853bc50772a37fbb068515ea3585165f4d65391b054ff94364e4a99f83afe258',
  'technical-tradeoff-explanation-b2': 'sha256:0d83ff3b85c14fd1a757644b17a4157c68075b28658f9ea4747b3081f5c882dc',
  'technology-troubleshooting-from-docs-b2': 'sha256:91c5ab55c764ec6585b801f87d0a814cc53ab2ab3e5455d3b4daef2186b60685',
  'workplace-clarification-request-b1': 'sha256:53a9e171bd66c28ab915f0fe61817a0472e04515f5b1488127dd83ab17633af4',
  'workplace-issue-update-b1': 'sha256:7d4884c8ce5ce12bfd86043e9b930fc1fdb5f09d78c23e4bf524aa035cda9d26'
}

const REQUIRED_MODEL_SENTENCE_MANIFEST = {
  'architecture-walkthrough-b2::required-element::1': [2],
  'architecture-walkthrough-b2::required-element::2': [4],
  'architecture-walkthrough-b2::required-element::3': [6],
  'architecture-walkthrough-b2::required-element::4': [8],
  'architecture-walkthrough-b2::rubric::flow': [2, 3, 4],
  'architecture-walkthrough-b2::rubric::responsibility': [2, 3, 4],
  'architecture-walkthrough-b2::rubric::tradeoff': [5, 6, 8],
  'behavioral-interview-ownership-b2::required-element::1': [1],
  'behavioral-interview-ownership-b2::required-element::2': [3],
  'behavioral-interview-ownership-b2::required-element::3': [4],
  'behavioral-interview-ownership-b2::required-element::4': [6],
  'behavioral-interview-ownership-b2::rubric::structure': [1, 2, 3],
  'behavioral-interview-ownership-b2::rubric::ownership': [2, 3],
  'behavioral-interview-ownership-b2::rubric::result': [4, 6],
  'daily-standup-b1::required-element::1': [1],
  'daily-standup-b1::required-element::2': [3],
  'daily-standup-b1::required-element::3': [4],
  'daily-standup-b1::required-element::4': [4],
  'daily-standup-b1::rubric::structure': [1, 2, 3, 4],
  'daily-standup-b1::rubric::specificity': [3],
  'daily-standup-b1::rubric::actionability': [4],
  'learn-api-from-docs-b2::required-element::1': [2],
  'learn-api-from-docs-b2::required-element::2': [3],
  'learn-api-from-docs-b2::required-element::3': [5],
  'learn-api-from-docs-b2::required-element::4': [4],
  'learn-api-from-docs-b2::rubric::model': [1, 2],
  'learn-api-from-docs-b2::rubric::safety': [2, 5],
  'learn-api-from-docs-b2::rubric::application': [4, 7],
  'meeting-disagree-and-recap-b2::required-element::1': [1],
  'meeting-disagree-and-recap-b2::required-element::2': [2],
  'meeting-disagree-and-recap-b2::required-element::3': [3],
  'meeting-disagree-and-recap-b2::required-element::4': [6],
  'meeting-disagree-and-recap-b2::rubric::tone': [1, 2],
  'meeting-disagree-and-recap-b2::rubric::case': [2, 3],
  'meeting-disagree-and-recap-b2::rubric::recap': [6],
  'technical-doc-action-b1::required-element::1': [1],
  'technical-doc-action-b1::required-element::2': [2],
  'technical-doc-action-b1::required-element::3': [3],
  'technical-doc-action-b1::required-element::4': [4],
  'technical-doc-action-b1::rubric::sequence': [1, 2, 3, 4],
  'technical-doc-action-b1::rubric::safety': [1, 3, 4],
  'technical-doc-action-b1::rubric::independence': [2],
  'technical-interview-decision-b2::required-element::1': [1],
  'technical-interview-decision-b2::required-element::2': [5],
  'technical-interview-decision-b2::required-element::3': [5],
  'technical-interview-decision-b2::required-element::4': [7],
  'technical-interview-decision-b2::required-element::5': [9],
  'technical-interview-decision-b2::rubric::structure': [1, 5, 7, 9],
  'technical-interview-decision-b2::rubric::rationale': [2, 5],
  'technical-interview-decision-b2::rubric::evidence': [7, 9],
  'technical-log-diagnosis-b1::required-element::1': [1],
  'technical-log-diagnosis-b1::required-element::2': [2],
  'technical-log-diagnosis-b1::required-element::3': [3],
  'technical-log-diagnosis-b1::required-element::4': [4],
  'technical-log-diagnosis-b1::rubric::symptom': [1],
  'technical-log-diagnosis-b1::rubric::evidence': [2, 3],
  'technical-log-diagnosis-b1::rubric::verification': [4, 5],
  'technical-tradeoff-explanation-b2::required-element::1': [1],
  'technical-tradeoff-explanation-b2::required-element::2': [1],
  'technical-tradeoff-explanation-b2::required-element::3': [2],
  'technical-tradeoff-explanation-b2::required-element::4': [5],
  'technical-tradeoff-explanation-b2::rubric::decision': [1],
  'technical-tradeoff-explanation-b2::rubric::tradeoff': [3, 4],
  'technical-tradeoff-explanation-b2::rubric::mitigation': [5],
  'technology-troubleshooting-from-docs-b2::required-element::1': [1],
  'technology-troubleshooting-from-docs-b2::required-element::2': [2],
  'technology-troubleshooting-from-docs-b2::required-element::3': [4],
  'technology-troubleshooting-from-docs-b2::required-element::4': [5],
  'technology-troubleshooting-from-docs-b2::required-element::5': [6],
  'technology-troubleshooting-from-docs-b2::rubric::rule': [1],
  'technology-troubleshooting-from-docs-b2::rubric::hypothesis': [2, 3],
  'technology-troubleshooting-from-docs-b2::rubric::experiment': [4, 5, 6],
  'workplace-clarification-request-b1::required-element::1': [1],
  'workplace-clarification-request-b1::required-element::2': [2],
  'workplace-clarification-request-b1::required-element::3': [4],
  'workplace-clarification-request-b1::rubric::understanding': [1],
  'workplace-clarification-request-b1::rubric::questions': [2],
  'workplace-clarification-request-b1::rubric::next-action': [4],
  'workplace-issue-update-b1::required-element::1': [1],
  'workplace-issue-update-b1::required-element::2': [1],
  'workplace-issue-update-b1::required-element::3': [2],
  'workplace-issue-update-b1::required-element::4': [2],
  'workplace-issue-update-b1::required-element::5': [4],
  'workplace-issue-update-b1::rubric::evidence-boundary': [1, 2],
  'workplace-issue-update-b1::rubric::impact': [1],
  'workplace-issue-update-b1::rubric::action': [2, 4]
}

function normalizedText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
}

function semanticTermExists(text, term) {
  const normalizedTerm = normalizedText(term).trim()
  if (!normalizedTerm) return false
  const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
  return new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, 'u').test(text)
}

function semanticTokens(value) {
  return new Set(normalizedText(value).match(/[\p{L}\p{N}][\p{L}\p{N}_-]{2,}/gu)?.filter((token) => !SEMANTIC_STOP_WORDS.has(token)) ?? [])
}

function semanticConcepts(value) {
  const text = normalizedText(value)
  return new Set(Object.entries(SEMANTIC_CONCEPTS)
    .filter(([, terms]) => terms.some((term) => semanticTermExists(text, term)))
    .map(([concept]) => concept))
}

function semanticSignals(left, right) {
  const leftTokens = semanticTokens(left)
  const rightTokens = semanticTokens(right)
  const tokenSignals = [...leftTokens].filter((token) => rightTokens.has(token)).map((token) => `token:${token}`)
  const leftConcepts = semanticConcepts(left)
  const rightConcepts = semanticConcepts(right)
  const conceptSignals = [...leftConcepts].filter((concept) => rightConcepts.has(concept)).map((concept) => `concept:${concept}`)
  return [...new Set([...tokenSignals, ...conceptSignals])]
}

function itemText(item, corpusByPath) {
  try {
    return JSON.stringify(resolveLocation(corpusByPath, item.location))
  } catch {
    return ''
  }
}

function semanticRank(query, candidates, corpusByPath) {
  const queryConcepts = semanticConcepts(query)
  return candidates.map((candidate, index) => {
    const text = candidate.text ?? itemText(candidate, corpusByPath)
    const signals = semanticSignals(query, text)
    const coveredConcepts = new Set([...queryConcepts].filter((concept) => semanticConcepts(text).has(concept)))
    const score = coveredConcepts.size * 10 + signals.filter((signal) => signal.startsWith('token:')).length
    return { candidate, index, signals, coveredConcepts, score }
  }).sort((left, right) => right.score - left.score || left.index - right.index)
}

function selectSemanticSubset(query, candidates, corpusByPath, { composite = false } = {}) {
  const ranked = semanticRank(query, candidates, corpusByPath)
  const positive = ranked.filter((entry) => entry.score > 0)
  if (positive.length === 0) return []

  const boundedLimit = composite ? candidates.length : 1
  if (!composite) return positive.slice(0, 1).map((entry) => entry.candidate)

  const coverableConcepts = new Set(positive.flatMap((entry) => [...entry.coveredConcepts]))
  const selected = []
  const remaining = [...positive]
  while (selected.length < boundedLimit && remaining.length > 0) {
    remaining.sort((left, right) => {
      const leftGain = [...left.coveredConcepts].filter((concept) => coverableConcepts.has(concept)).length
      const rightGain = [...right.coveredConcepts].filter((concept) => coverableConcepts.has(concept)).length
      return rightGain - leftGain || right.score - left.score || left.index - right.index
    })
    const best = remaining.shift()
    const gain = [...best.coveredConcepts].filter((concept) => coverableConcepts.has(concept)).length
    if (gain === 0 && selected.length > 0) break
    selected.push(best)
    for (const concept of best.coveredConcepts) coverableConcepts.delete(concept)
    if (coverableConcepts.size === 0) break
  }
  return selected.sort((left, right) => left.index - right.index).map((entry) => entry.candidate)
}

function itemMapForCorpus(corpus) {
  const items = enumerateItems(corpus)
  return {
    items,
    byId: new Map(items.map((item) => [item.id, item])),
    corpusByPath: new Map(corpus.map((entry) => [corpusLocationPath(entry), entry]))
  }
}

function artifactContentItems(items, lessonId, phase) {
  return items.filter((item) => item.lessonId === lessonId
    && item.componentRole === 'content'
    && (item.artifactOrClaim === 'context-artifact' || item.artifactOrClaim === 'section-source' || item.artifactOrClaim === 'reading-source')
    && (item.phase === phase || (phase === 'baseline' && item.phase === 'shared')))
}

export function enumerateRequiredTraces(corpus) {
  const { items, corpusByPath } = itemMapForCorpus(corpus)
  const traces = corpus.flatMap((entry) => {
    const { lesson } = entry
    const filePath = corpusLocationPath(entry)
    if (lesson.schemaVersion !== 'v3') return []
    const task = lesson.performanceTask
    const auditedResponseDigest = AUDITED_MODEL_RESPONSE_DIGESTS[lesson.lessonId]
    if (!auditedResponseDigest || digest(task.modelResponse) !== auditedResponseDigest) {
      throw new Error(`${lesson.lessonId} modelResponse đã đổi sau manifest audit; cần review và cập nhật digest`) 
    }
    const modelSentences = splitModelSentences(task.modelResponse).map((text, index) => ({
      id: `${lesson.lessonId}::model-sentence::${index + 1}`,
      text
    }))
    const buildTrace = ({ id, requiredKind, requirement, exactLocation }) => {
      const phaseSupport = ['baseline', 'retry', 'transfer', 'review'].map((phase) => {
        const selected = artifactContentItems(items, lesson.lessonId, phase)
        if (selected.length === 0) throw new Error(`${id} thiếu phase evidence packet cho ${phase}`)
        return {
          phase,
          supportBasis: 'phase-evidence-packet-contract',
          structuralContractLocation: exactLocation,
          supportingItemIds: selected.map((item) => item.id),
          exactLocations: selected.map((item) => item.location),
          itemSemanticSignals: selected.map((item) => ({
            itemId: item.id,
            semanticSignals: semanticSignals(requirement, itemText(item, corpusByPath))
          }))
        }
      })
      const auditedIndices = REQUIRED_MODEL_SENTENCE_MANIFEST[id]
      if (!Array.isArray(auditedIndices) || auditedIndices.length === 0 || new Set(auditedIndices).size !== auditedIndices.length) {
        throw new Error(`${id} thiếu audited model-sentence manifest`) 
      }
      if (!auditedIndices.every((index, position) => Number.isInteger(index)
        && index > 0 && index <= modelSentences.length
        && (position === 0 || auditedIndices[position - 1] < index))) {
        throw new Error(`${id} có audited model-sentence index không hợp lệ hoặc không tăng dần`)
      }
      const selectedSentences = auditedIndices.map((index) => modelSentences[index - 1])
      const modelSemanticSupport = selectedSentences.map((sentence) => ({
        modelSentenceId: sentence.id,
        sentenceDigest: digest(sentence.text),
        fulfillmentRole: 'demonstration',
        semanticSignals: semanticSignals(requirement, sentence.text),
        score: semanticRank(requirement, [sentence], corpusByPath)[0].score
      }))
      return {
        id,
        lessonId: lesson.lessonId,
        requiredKind,
        requirement,
        exactLocation,
        phaseSupport,
        supportingItemIds: [...new Set(phaseSupport.flatMap((support) => support.supportingItemIds))],
        modelMappingBasis: 'human-audited-demonstration-manifest',
        auditedModelResponseDigest: auditedResponseDigest,
        modelSentenceIds: selectedSentences.map((sentence) => sentence.id),
        modelSemanticSupport,
        verificationIds: ['check-content-focused', 'check-runtime-focused'],
        status: 'closed'
      }
    }
    return [
      ...task.outputContract.requiredElements.map((requirement, index) => buildTrace({
        id: `${lesson.lessonId}::required-element::${index + 1}`,
        requiredKind: 'output-element',
        requirement,
        exactLocation: location(filePath, `/performanceTask/outputContract/requiredElements/${index}`)
      })),
      ...task.rubric.map((rubric, index) => buildTrace({
        id: `${lesson.lessonId}::rubric::${rubric.id}`,
        requiredKind: 'rubric-criterion',
        requirement: `${rubric.label}: ${rubric.description}`,
        exactLocation: location(filePath, `/performanceTask/rubric/${index}`)
      }))
    ]
  })
  const traceIds = traces.map((trace) => trace.id)
  const manifestIds = Object.keys(REQUIRED_MODEL_SENTENCE_MANIFEST)
  const missing = traceIds.filter((id) => !manifestIds.includes(id))
  const extra = manifestIds.filter((id) => !traceIds.includes(id))
  if (missing.length || extra.length || new Set(traceIds).size !== traceIds.length) {
    throw new Error(`Audited required-model manifest drift: missing=${missing.join(',')} extra=${extra.join(',')}`)
  }
  return traces
}

function sentenceBasis(sentence) {
  if (sentence.includes('?')) return 'question'
  if (/\b(?:hypothesis|might|may|likely|appears)\b/i.test(sentence)) return 'hypothesis'
  if (/\b(?:proposal|propose|could we|could run)\b/i.test(sentence)) return 'proposal'
  if (/^(?:finally,?\s+)?i would\b|\bi recommend\b|\bshould\b|\bneed to revisit\b/i.test(sentence)) return 'recommendation'
  if (/\b(?:learned|looking back|that comparison matters|the benefit|the trade-off)\b/i.test(sentence)) return 'inference'
  return 'fact'
}

export function enumerateModelTraces(corpus) {
  const { items, corpusByPath } = itemMapForCorpus(corpus)
  return corpus.flatMap((entry) => {
    const { lesson } = entry
    const filePath = corpusLocationPath(entry)
    if (lesson.schemaVersion !== 'v3') return []
    const task = lesson.performanceTask
    const baselineItems = artifactContentItems(items, lesson.lessonId, 'baseline')
    return splitModelSentences(task.modelResponse).map((sentence, index) => {
      const basis = sentenceBasis(sentence)
      let selected = selectSemanticSubset(sentence, baselineItems, corpusByPath)
      let supportBasis = 'semantic-content-match'
      if (selected.length === 0) {
        if (basis === 'fact') throw new Error(`${lesson.lessonId} model fact sentence ${index + 1} thiếu semantic source support`)
        selected = baselineItems
        supportBasis = 'authored-transformation-over-phase-packet'
      }
      return {
        id: `${lesson.lessonId}::model-sentence::${index + 1}`,
        lessonId: lesson.lessonId,
        sentenceIndex: index + 1,
        text: sentence,
        textDigest: digest(sentence),
        exactLocation: `${location(filePath, '/performanceTask/modelResponse')}#sentence-${index + 1}`,
        basis,
        supportBasis,
        supportingItemIds: selected.map((item) => item.id),
        supportLocations: selected.map((item) => item.location),
        supportSignals: selected.map((item) => ({
          itemId: item.id,
          semanticSignals: semanticSignals(sentence, itemText(item, corpusByPath))
        })),
        sourceIds: [...new Set(selected.flatMap((item) => item.sourceIds))],
        explicitBoundary: basis === 'fact' ? 'evidence-packet' : `${basis}-marker`,
        verificationIds: ['check-content-focused'],
        status: 'closed'
      }
    })
  })
}

export function enumerateObjectiveTraces(corpus) {
  const { items, corpusByPath } = itemMapForCorpus(corpus)
  return corpus.flatMap((entry) => {
    const { lesson } = entry
    const filePath = corpusLocationPath(entry)
    return lesson.learningObjectives.map((objective, index) => {
      const allowedKinds = lesson.schemaVersion === 'v1'
        ? new Set(['exercise'])
        : new Set(['exercise', 'rubric', 'output-contract', 'prompt-performance', 'learning-perception', 'learning-interaction'])
      const candidates = items.filter((item) => item.lessonId === lesson.lessonId
        && allowedKinds.has(item.artifactOrClaim)
        && !['id', 'type'].includes(item.componentRole))
      const selected = selectSemanticSubset(objective, candidates, corpusByPath, { composite: true })
      if (selected.length === 0) throw new Error(`${lesson.lessonId} objective ${index + 1} thiếu semantic assessment support`)
      return {
        id: `${lesson.lessonId}::objective::${index + 1}`,
        lessonId: lesson.lessonId,
        objective,
        exactLocation: location(filePath, `/learningObjectives/${index}`),
        evidenceKind: lesson.schemaVersion === 'v1' ? 'knowledge-only' : 'performance-and-knowledge',
        assessmentItemIds: selected.map((item) => item.id),
        assessmentLocations: selected.map((item) => item.location),
        verificationIds: ['check-content-focused'],
        status: 'closed'
      }
    })
  })
}

function parseResearchRecords(researchDirectory) {
  const records = new Map()
  for (const fileName of readdirSync(researchDirectory).filter((name) => name.endsWith('.md'))) {
    const text = readFileSync(path.join(researchDirectory, fileName), 'utf8')
    text.split(/\r?\n/u).forEach((line, lineIndex) => {
      const match = /^([A-Z_]+_JSON)\|(\{.*\})$/u.exec(line)
      if (!match) return
      let value
      try { value = JSON.parse(match[2]) } catch (error) {
        throw new Error(`${fileName}:${lineIndex + 1}: invalid ${match[1]} JSON: ${error.message}`)
      }
      const list = records.get(match[1]) ?? []
      list.push({ ...value, _fileName: fileName, _line: lineIndex + 1 })
      records.set(match[1], list)
    })
  }
  return records
}

function withoutMeta(record) {
  const { _fileName, _line, ...value } = record
  return value
}

function exactSet(errors, label, expectedValues, actualValues) {
  const expected = new Set(expectedValues)
  const actual = new Set(actualValues)
  const missing = [...expected].filter((item) => !actual.has(item))
  const extra = [...actual].filter((item) => !expected.has(item))
  if (actualValues.length !== actual.size) errors.push(`${label}: duplicate IDs`)
  if (missing.length) errors.push(`${label}: missing ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '…' : ''}`)
  if (extra.length) errors.push(`${label}: unexpected ${extra.slice(0, 8).join(', ')}${extra.length > 8 ? '…' : ''}`)
}

function resolveLocation(corpusByPath, value) {
  const hashIndex = value.indexOf('#')
  const filePath = hashIndex === -1 ? value : value.slice(0, hashIndex)
  const pointer = hashIndex === -1 ? '' : value.slice(hashIndex + 1).split('#')[0]
  const entry = corpusByPath.get(filePath)
  if (!entry) throw new Error(`unknown corpus file ${filePath}`)
  return valueAtPointer(entry.lesson, pointer)
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function sameSet(left = [], right = []) {
  return left.length === right.length && new Set(left).size === left.length && left.every((item) => right.includes(item))
}

function recordLabel(record, fallback) {
  return record?._fileName ? `${record._fileName}:${record._line}` : fallback
}

function claimEdgeKey(claimId, link) {
  return `${claimId}\u0000${link.sourceId}\u0000${link.exactLocation}`
}

function validateEvidenceReference(errors, evidenceById, evidenceId, context, allowedCheckIds = null) {
  const evidence = evidenceById.get(evidenceId)
  if (!evidence) {
    errors.push(`${context} references missing task evidence ${evidenceId}`)
    return null
  }
  if (evidence.result !== 'pass' || (evidence.exitCode !== undefined && evidence.exitCode !== 0)) {
    errors.push(`${context} references non-passing task evidence ${evidenceId}`)
  }
  if (evidence.checkId === SELF_CHECK_ID) errors.push(`${context} recursively references ${SELF_CHECK_ID}`)
  if (allowedCheckIds && (!evidence.checkId || !allowedCheckIds.includes(evidence.checkId))) {
    errors.push(`${context} evidence ${evidenceId} does not match verificationIds`)
  }
  return evidence
}

function semanticSupportExists(query, supportItems, corpusByPath) {
  return supportItems.some((item) => semanticSignals(query, itemText(item, corpusByPath)).length > 0)
}

function assessmentCandidates(items, lesson) {
  const allowedKinds = lesson.schemaVersion === 'v1'
    ? new Set(['exercise'])
    : new Set(['exercise', 'rubric', 'output-contract', 'prompt-performance', 'learning-perception', 'learning-interaction'])
  return items.filter((item) => item.lessonId === lesson.lessonId
    && allowedKinds.has(item.artifactOrClaim)
    && !['id', 'type'].includes(item.componentRole))
}

function validate() {
  const researchDirectory = path.resolve(process.argv[2] ?? '')
  if (!existsSync(researchDirectory) || !statSync(researchDirectory).isDirectory()) {
    throw new Error('Usage: node scripts/check-curriculum-research.mjs <research-directory>')
  }
  const taskPath = path.resolve(researchDirectory, '..', 'task.json')
  const task = JSON.parse(readFileSync(taskPath, 'utf8'))
  const corpus = projectCorpusLocations(loadCorpus(), task.id)
  const corpusByPath = new Map(corpus.map((entry) => [corpusLocationPath(entry), entry]))
  const records = parseResearchRecords(researchDirectory)
  const errors = []
  const taskEvidence = task.evidence ?? []
  const evidenceById = new Map(taskEvidence.map((evidence) => [evidence.id, evidence]))
  if (evidenceById.size !== taskEvidence.length) errors.push('Task evidence contains duplicate IDs')
  const validationCheckIds = task.validationPlan.map((check) => check.id)

  const expectedItems = enumerateItems(corpus)
  const actualItemRecords = records.get('ITEM_JSON') ?? []
  const actualItems = actualItemRecords.map(withoutMeta)
  exactSet(errors, 'ITEM_JSON', expectedItems.map((item) => item.id), actualItems.map((item) => item.id))
  const expectedItemMap = new Map(expectedItems.map((item) => [item.id, item]))
  const structuralItemFields = [
    'lessonId', 'generation', 'capability', 'phase', 'artifactOrClaim', 'surfaceId',
    'parentLocation', 'componentPointer', 'componentRole', 'location', 'componentLocations',
    'contentDigest', 'jobFunctionId', 'claimClass', 'provenanceStatus', 'sourceIds'
  ]
  for (const rawItem of actualItemRecords) {
    const item = withoutMeta(rawItem)
    const label = `ITEM_JSON ${item.id ?? '(no id)'} (${recordLabel(rawItem, 'unknown')})`
    for (const field of REQUIRED_ITEM_FIELDS) if (!(field in item)) errors.push(`${label} missing ${field}`)
    const expected = expectedItemMap.get(item.id)
    if (!expected) continue
    for (const field of structuralItemFields) {
      if (!sameJson(item[field], expected[field])) errors.push(`${label} ${field} drift`)
    }
    if (!CLAIM_CLASS_SET.has(item.claimClass)) errors.push(`${label} has invalid claimClass ${item.claimClass}`)
    if (!Array.isArray(item.componentLocations) || item.componentLocations.length !== 1 || item.componentLocations[0] !== item.location) {
      errors.push(`${label} must represent exactly one component location`)
    }
    try { resolveLocation(corpusByPath, item.location) } catch (error) { errors.push(`${label}: ${error.message}`) }
    if (!['pass', 'not-applicable', 'documented-gap'].includes(item.realismStatus)) errors.push(`${label} realism not reviewed`)
    if (['missing', 'not-checked'].includes(item.provenanceStatus)) errors.push(`${label} provenance unresolved`)
    if (!['pass', 'not-applicable'].includes(item.internalCoherence)) errors.push(`${label} coherence not passed`)
    if (!['pass', 'not-applicable'].includes(item.answerability)) errors.push(`${label} answerability not passed`)
    if (!['none', 'low', 'medium'].includes(item.severity)) errors.push(`${label} retains invalid/unresolved severity ${item.severity}`)
    if (!item.disposition || item.disposition === 'not-checked') errors.push(`${label} lacks disposition`)
    if (!['low', 'medium', 'high'].includes(item.confidence)) errors.push(`${label} lacks reviewed confidence`)
    if (!Array.isArray(item.evidenceIds) || item.evidenceIds.length === 0) errors.push(`${label} lacks evidenceIds`)
    if (!Array.isArray(item.verificationIds) || item.verificationIds.length === 0) errors.push(`${label} lacks verificationIds`)
    for (const checkId of item.verificationIds ?? []) {
      if (!validationCheckIds.includes(checkId)) errors.push(`${label} references unknown check ${checkId}`)
      if (checkId === SELF_CHECK_ID) errors.push(`${label} recursively uses ${SELF_CHECK_ID}`)
    }
    for (const evidenceId of item.evidenceIds ?? []) {
      validateEvidenceReference(errors, evidenceById, evidenceId, label, item.verificationIds)
    }
  }

  const expectedRequired = enumerateRequiredTraces(corpus)
  const actualRequiredRecords = records.get('TRACE_REQUIRED_JSON') ?? []
  const actualRequired = actualRequiredRecords.map(withoutMeta)
  exactSet(errors, 'TRACE_REQUIRED_JSON', expectedRequired.map((item) => item.id), actualRequired.map((item) => item.id))
  const expectedModel = enumerateModelTraces(corpus)
  const expectedModelMap = new Map(expectedModel.map((item) => [item.id, item]))
  const expectedRequiredMap = new Map(expectedRequired.map((item) => [item.id, item]))
  for (const rawTrace of actualRequiredRecords) {
    const trace = withoutMeta(rawTrace)
    const label = `TRACE_REQUIRED_JSON ${trace.id ?? '(no id)'} (${recordLabel(rawTrace, 'unknown')})`
    const expected = expectedRequiredMap.get(trace.id)
    if (!expected) continue
    for (const field of ['lessonId', 'requiredKind', 'requirement', 'exactLocation', 'modelMappingBasis', 'auditedModelResponseDigest']) {
      if (!sameJson(trace[field], expected[field])) errors.push(`${label} ${field} drift`)
    }
    const phases = trace.phaseSupport?.map((support) => support.phase) ?? []
    exactSet(errors, `${label} phases`, ['baseline', 'retry', 'transfer', 'review'], phases)
    if (!sameJson(trace.phaseSupport, expected.phaseSupport)) errors.push(`${label} phaseSupport structural mapping drift`)
    const union = []
    for (const support of trace.phaseSupport ?? []) {
      const candidates = artifactContentItems(expectedItems, trace.lessonId, support.phase)
      const candidateIds = new Set(candidates.map((item) => item.id))
      if (!Array.isArray(support.supportingItemIds) || support.supportingItemIds.length === 0) errors.push(`${label} ${support.phase} lacks supportingItemIds`)
      if (support.supportBasis !== 'phase-evidence-packet-contract') errors.push(`${label} ${support.phase} has invalid structural support basis`)
      if (support.structuralContractLocation !== trace.exactLocation) errors.push(`${label} ${support.phase} structural contract mismatch`)
      if (!sameSet(support.supportingItemIds ?? [], candidates.map((item) => item.id))) errors.push(`${label} ${support.phase} must map the exact phase evidence packet`)
      const selected = (support.supportingItemIds ?? []).map((id) => expectedItemMap.get(id)).filter(Boolean)
      for (const id of support.supportingItemIds ?? []) {
        if (!candidateIds.has(id)) errors.push(`${label} ${support.phase} references non-phase support ${id}`)
        union.push(id)
      }
      if (!sameSet(support.exactLocations ?? [], selected.map((item) => item.location))) errors.push(`${label} ${support.phase} exactLocations mismatch`)
      const signalIds = support.itemSemanticSignals?.map((item) => item.itemId) ?? []
      if (!sameSet(signalIds, selected.map((item) => item.id))) errors.push(`${label} ${support.phase} itemSemanticSignals mismatch`)
    }
    if (!sameSet(trace.supportingItemIds ?? [], [...new Set(union)])) errors.push(`${label} supportingItemIds is not the phase union`)
    if (!Array.isArray(trace.modelSentenceIds) || trace.modelSentenceIds.length === 0) errors.push(`${label} lacks modelSentenceIds`)
    if (trace.requiredKind === 'output-element' && trace.modelSentenceIds?.length !== 1) errors.push(`${label} output element must map exactly one best model sentence`)
    if (trace.modelMappingBasis !== 'human-audited-demonstration-manifest') errors.push(`${label} lacks audited demonstration mapping basis`)
    if (trace.auditedModelResponseDigest !== AUDITED_MODEL_RESPONSE_DIGESTS[trace.lessonId]) errors.push(`${label} audited modelResponse digest mismatch`)
    if (!sameJson(trace.modelSentenceIds, expected.modelSentenceIds)) errors.push(`${label} modelSentenceIds semantic mapping drift`)
    if (!sameJson(trace.modelSemanticSupport, expected.modelSemanticSupport)) errors.push(`${label} modelSemanticSupport drift`)
    for (const modelId of trace.modelSentenceIds ?? []) {
      const model = expectedModelMap.get(modelId)
      if (!model || model.lessonId !== trace.lessonId) errors.push(`${label} references invalid model sentence ${modelId}`)
    }
    for (const support of trace.modelSemanticSupport ?? []) {
      const model = expectedModelMap.get(support.modelSentenceId)
      if (support.fulfillmentRole !== 'demonstration') errors.push(`${label} model support is not marked as demonstration`)
      if (!model || support.sentenceDigest !== model.textDigest) errors.push(`${label} model support sentence digest mismatch`)
      if (!Array.isArray(support.semanticSignals) || typeof support.score !== 'number') errors.push(`${label} lacks diagnostic semantic metadata`)
    }
    if (trace.status !== 'closed') errors.push(`${label} is not closed`)
    if ((trace.verificationIds ?? []).includes(SELF_CHECK_ID)) errors.push(`${label} recursively uses ${SELF_CHECK_ID}`)
  }

  const requiredTraceInvariants = new Map([
    ['behavioral-interview-ownership-b2::required-element::3', { mustInclude: ['behavioral-interview-ownership-b2::model-sentence::4'], mustExclude: ['behavioral-interview-ownership-b2::model-sentence::7'] }],
    ['behavioral-interview-ownership-b2::rubric::ownership', { mustInclude: ['behavioral-interview-ownership-b2::model-sentence::2', 'behavioral-interview-ownership-b2::model-sentence::3'], mustExclude: ['behavioral-interview-ownership-b2::model-sentence::1'] }],
    ['daily-standup-b1::required-element::3', { mustInclude: ['daily-standup-b1::model-sentence::4'], mustExclude: ['daily-standup-b1::model-sentence::1'] }],
    ['daily-standup-b1::required-element::4', { mustInclude: ['daily-standup-b1::model-sentence::4'], mustExclude: ['daily-standup-b1::model-sentence::1'] }],
    ['learn-api-from-docs-b2::rubric::safety', { mustInclude: ['learn-api-from-docs-b2::model-sentence::2', 'learn-api-from-docs-b2::model-sentence::5'], mustExclude: [] }],
    ['technical-doc-action-b1::required-element::2', { mustInclude: ['technical-doc-action-b1::model-sentence::2'], mustExclude: [] }],
    ['technical-doc-action-b1::required-element::3', { mustInclude: ['technical-doc-action-b1::model-sentence::3'], mustExclude: [] }],
    ['technical-doc-action-b1::required-element::4', { mustInclude: ['technical-doc-action-b1::model-sentence::4'], mustExclude: [] }],
    ['technical-log-diagnosis-b1::rubric::symptom', { mustInclude: ['technical-log-diagnosis-b1::model-sentence::1'], mustExclude: ['technical-log-diagnosis-b1::model-sentence::2', 'technical-log-diagnosis-b1::model-sentence::3'] }],
    ['workplace-clarification-request-b1::rubric::understanding', { mustInclude: ['workplace-clarification-request-b1::model-sentence::1'], mustExclude: ['workplace-clarification-request-b1::model-sentence::2'] }]
  ])
  const actualRequiredById = new Map(actualRequired.map((trace) => [trace.id, trace]))
  for (const [traceId, invariant] of requiredTraceInvariants) {
    const trace = actualRequiredById.get(traceId)
    if (!trace) continue
    for (const modelId of invariant.mustInclude) {
      if (!trace.modelSentenceIds?.includes(modelId)) errors.push(`TRACE_REQUIRED_JSON invariant ${traceId} must include ${modelId}`)
    }
    for (const modelId of invariant.mustExclude) {
      if (trace.modelSentenceIds?.includes(modelId)) errors.push(`TRACE_REQUIRED_JSON invariant ${traceId} must exclude ${modelId}`)
    }
  }

  const actualModelRecords = records.get('TRACE_MODEL_JSON') ?? []
  const actualModel = actualModelRecords.map(withoutMeta)
  exactSet(errors, 'TRACE_MODEL_JSON', expectedModel.map((item) => item.id), actualModel.map((item) => item.id))
  for (const rawTrace of actualModelRecords) {
    const trace = withoutMeta(rawTrace)
    const label = `TRACE_MODEL_JSON ${trace.id ?? '(no id)'} (${recordLabel(rawTrace, 'unknown')})`
    const expected = expectedModelMap.get(trace.id)
    if (!expected) continue
    for (const field of ['lessonId', 'sentenceIndex', 'text', 'textDigest', 'exactLocation', 'basis', 'supportBasis', 'explicitBoundary']) {
      if (!sameJson(trace[field], expected[field])) errors.push(`${label} ${field} drift`)
    }
    const candidates = artifactContentItems(expectedItems, trace.lessonId, 'baseline')
    const candidateIds = new Set(candidates.map((item) => item.id))
    if (trace.basis === 'fact' && (!Array.isArray(trace.supportingItemIds) || trace.supportingItemIds.length === 0)) errors.push(`${label} fact lacks support`)
    if (trace.supportBasis === 'semantic-content-match' && candidates.length > 1 && trace.supportingItemIds?.length >= candidates.length) errors.push(`${label} semantic support is not a subset`)
    if (trace.supportBasis === 'authored-transformation-over-phase-packet' && !sameSet(trace.supportingItemIds ?? [], candidates.map((item) => item.id))) {
      errors.push(`${label} authored transformation must map the exact baseline packet`)
    }
    const selected = (trace.supportingItemIds ?? []).map((id) => expectedItemMap.get(id)).filter(Boolean)
    for (const id of trace.supportingItemIds ?? []) if (!candidateIds.has(id)) errors.push(`${label} references non-baseline support ${id}`)
    if (!sameSet(trace.supportLocations ?? [], selected.map((item) => item.location))) errors.push(`${label} supportLocations mismatch`)
    if (!sameJson(trace.supportSignals, expected.supportSignals)) errors.push(`${label} supportSignals drift`)
    if (!sameSet(trace.sourceIds ?? [], [...new Set(selected.flatMap((item) => item.sourceIds))])) errors.push(`${label} sourceIds mismatch`)
    if (trace.basis === 'fact' && selected.length && !semanticSupportExists(trace.text, selected, corpusByPath)) errors.push(`${label} fact support lacks semantic overlap`)
    if (trace.status !== 'closed') errors.push(`${label} is not closed`)
    if ((trace.verificationIds ?? []).includes(SELF_CHECK_ID)) errors.push(`${label} recursively uses ${SELF_CHECK_ID}`)
  }

  const expectedObjectives = enumerateObjectiveTraces(corpus)
  const expectedObjectiveMap = new Map(expectedObjectives.map((item) => [item.id, item]))
  const actualObjectiveRecords = records.get('TRACE_OBJECTIVE_JSON') ?? []
  const actualObjectives = actualObjectiveRecords.map(withoutMeta)
  exactSet(errors, 'TRACE_OBJECTIVE_JSON', expectedObjectives.map((item) => item.id), actualObjectives.map((item) => item.id))
  for (const rawTrace of actualObjectiveRecords) {
    const trace = withoutMeta(rawTrace)
    const label = `TRACE_OBJECTIVE_JSON ${trace.id ?? '(no id)'} (${recordLabel(rawTrace, 'unknown')})`
    const expected = expectedObjectiveMap.get(trace.id)
    if (!expected) continue
    for (const field of ['lessonId', 'objective', 'exactLocation', 'evidenceKind']) {
      if (!sameJson(trace[field], expected[field])) errors.push(`${label} ${field} drift`)
    }
    const entry = corpus.find(({ lesson }) => lesson.lessonId === trace.lessonId)
    const candidates = entry ? assessmentCandidates(expectedItems, entry.lesson) : []
    const candidateIds = new Set(candidates.map((item) => item.id))
    if (!Array.isArray(trace.assessmentItemIds) || trace.assessmentItemIds.length === 0) errors.push(`${label} lacks assessmentItemIds`)
    if (candidates.length > 1 && trace.assessmentItemIds?.length >= candidates.length) errors.push(`${label} maps all assessment components`)
    const selected = (trace.assessmentItemIds ?? []).map((id) => expectedItemMap.get(id)).filter(Boolean)
    for (const id of trace.assessmentItemIds ?? []) if (!candidateIds.has(id)) errors.push(`${label} references invalid assessment ${id}`)
    if (!sameSet(trace.assessmentLocations ?? [], selected.map((item) => item.location))) errors.push(`${label} assessmentLocations mismatch`)
    if (selected.length && !semanticSupportExists(trace.objective, selected, corpusByPath)) errors.push(`${label} assessment lacks semantic overlap`)
    if (trace.lessonId.startsWith('pronunciation-') && trace.evidenceKind !== 'knowledge-only') errors.push(`${label} overclaims legacy evidence`)
    if (trace.status !== 'closed') errors.push(`${label} is not closed`)
    if ((trace.verificationIds ?? []).includes(SELF_CHECK_ID)) errors.push(`${label} recursively uses ${SELF_CHECK_ID}`)
  }

  const sources = (records.get('SOURCE_JSON') ?? []).map(withoutMeta)
  const sourceIds = sources.map((source) => source.id)
  if (new Set(sourceIds).size !== sourceIds.length) errors.push('SOURCE_JSON duplicate IDs')
  for (const source of sources) {
    for (const field of ['id', 'ownerPublisher', 'canonicalUrl', 'exactLocation', 'version', 'accessedAt', 'rightsUrl', 'reuseMode', 'sourceType', 'populationSetting', 'supportedClaims', 'limitations', 'fact', 'projectInference', 'adaptation', 'confidence', 'recommendation', 'repositoryDecision', 'status']) {
      if (!(field in source) || source[field] === '') errors.push(`SOURCE_JSON ${source.id ?? '(no id)'} missing ${field}`)
    }
    if (!/^https:\/\//u.test(source.canonicalUrl ?? '') || !/^https:\/\//u.test(source.rightsUrl ?? '')) errors.push(`SOURCE_JSON ${source.id} URL/rights must be https`)
    if (source.reuseMode !== 'reference-only') errors.push(`SOURCE_JSON ${source.id} unexpected reuse mode`)
    if (!Array.isArray(source.supportedClaims)) errors.push(`SOURCE_JSON ${source.id} supportedClaims must be an array`)
  }
  const sourceIdSet = new Set(sourceIds)
  const claims = (records.get('CLAIM_JSON') ?? []).map(withoutMeta)
  const claimIds = claims.map((claim) => claim.id)
  if (new Set(claimIds).size !== claimIds.length) errors.push('CLAIM_JSON duplicate IDs')
  const expectedIpaClaims = corpus.filter((entry) => entry.lesson.schemaVersion === 'v1').flatMap(({ lesson }) =>
    lesson.vocabulary.map((word) => `${lesson.lessonId}::ipa::${word.word}`))
  const expectedCefrClaims = corpus.map(({ lesson }) => `${lesson.lessonId}::cefr-rationale`)
  exactSet(errors, 'IPA CLAIM_JSON', expectedIpaClaims, claimIds.filter((id) => id.includes('::ipa::')))
  exactSet(errors, 'CEFR CLAIM_JSON', expectedCefrClaims, claimIds.filter((id) => id.endsWith('::cefr-rationale')))
  const claimById = new Map(claims.map((claim) => [claim.id, claim]))
  const coverage = (records.get('COVERAGE_JSON') ?? []).map(withoutMeta)
  const coverageByLesson = new Map(coverage.map((row) => [row.lessonId, row]))
  const usedSourceIds = new Set()
  for (const claim of claims) {
    for (const field of ['id', 'lessonId', 'claim', 'basis', 'location', 'contentDigest', 'sourceLinks', 'factFromSource', 'projectInference', 'limitation', 'verificationIds', 'disposition', 'confidence']) {
      if (!(field in claim) || claim[field] === '') errors.push(`CLAIM_JSON ${claim.id ?? '(no id)'} missing ${field}`)
    }
    if (!['fact', 'inference', 'hypothesis', 'recommendation'].includes(claim.basis)) errors.push(`CLAIM_JSON ${claim.id} invalid basis ${claim.basis}`)
    try {
      const value = resolveLocation(corpusByPath, claim.location)
      if (claim.contentDigest !== digest(value)) errors.push(`CLAIM_JSON ${claim.id} digest drift`)
    } catch (error) { errors.push(`CLAIM_JSON ${claim.id}: ${error.message}`) }
    if ((claim.verificationIds ?? []).includes(SELF_CHECK_ID)) errors.push(`CLAIM_JSON ${claim.id} recursively uses ${SELF_CHECK_ID}`)
    for (const link of claim.sourceLinks ?? []) {
      if (!sourceIdSet.has(link.sourceId)) errors.push(`CLAIM_JSON ${claim.id} references missing source ${link.sourceId}`)
      if (!link.exactLocation || !link.supportScope) errors.push(`CLAIM_JSON ${claim.id} has incomplete source link ${link.sourceId}`)
      usedSourceIds.add(link.sourceId)
    }
    if (claim.basis === 'fact' && !(claim.sourceLinks?.length > 0)) errors.push(`CLAIM_JSON ${claim.id} fact lacks source`)
    if (claim.id.endsWith('::cefr-rationale')) {
      const entry = corpus.find(({ lesson }) => lesson.lessonId === claim.lessonId)
      const row = coverageByLesson.get(claim.lessonId)
      const expectedLocation = entry ? location(corpusLocationPath(entry), '/cefrLevel') : null
      if (claim.location !== expectedLocation || claim.contentDigest !== digest(entry?.lesson.cefrLevel)) errors.push(`CLAIM_JSON ${claim.id} CEFR corpus trace drift`)
      if (claim.basis !== 'inference') errors.push(`CLAIM_JSON ${claim.id} CEFR basis must be inference`)
      if (claim.sourceLinks?.length !== 1 || claim.sourceLinks[0]?.sourceId !== 'coe-cefr-companion-2020') errors.push(`CLAIM_JSON ${claim.id} must use the CEFR source exactly once`)
      if (row && claim.sourceLinks?.[0]?.exactLocation !== row.cefrExactLocation) errors.push(`CLAIM_JSON ${claim.id} CEFR exactLocation mismatch`)
    }
  }

  const rfcSectionByClaim = new Map([
    ['learn-api-from-docs-b2::http-202', '15.3.3'],
    ['learn-api-from-docs-b2::http-503', '15.6.4'],
    ['learn-api-from-docs-b2::http-retry-after', '10.2.3']
  ])
  for (const [claimId, section] of rfcSectionByClaim) {
    const link = claimById.get(claimId)?.sourceLinks?.find((item) => item.sourceId === 'rfc-9110')
    const mentioned = link?.exactLocation?.match(/\b(?:10\.2\.3|15\.3\.3|15\.6\.4)\b/gu) ?? []
    if (!link || mentioned.length !== 1 || mentioned[0] !== section) errors.push(`CLAIM_JSON ${claimId} must trace only RFC 9110 section ${section}`)
  }

  const claimSourceRecords = (records.get('CLAIM_SOURCE_JSON') ?? []).map(withoutMeta)
  const expectedClaimEdges = claims.flatMap((claim) => (claim.sourceLinks ?? []).map((link) => claimEdgeKey(claim.id, link)))
  const actualClaimEdges = claimSourceRecords.map((row) => claimEdgeKey(row.claimId, row))
  exactSet(errors, 'CLAIM_SOURCE_JSON edges', expectedClaimEdges, actualClaimEdges)
  const claimSourceIds = claimSourceRecords.map((row) => row.id)
  if (new Set(claimSourceIds).size !== claimSourceIds.length) errors.push('CLAIM_SOURCE_JSON duplicate IDs')
  for (const row of claimSourceRecords) {
    const claim = claimById.get(row.claimId)
    if (!claim) continue
    if (row.basis !== claim.basis) errors.push(`CLAIM_SOURCE_JSON ${row.id} basis mismatch`)
    if (row.repositoryLocation !== claim.location) errors.push(`CLAIM_SOURCE_JSON ${row.id} repositoryLocation mismatch`)
    if (!row.supportScope) errors.push(`CLAIM_SOURCE_JSON ${row.id} lacks supportScope`)
    if ((row.verificationIds ?? []).includes(SELF_CHECK_ID)) errors.push(`CLAIM_SOURCE_JSON ${row.id} recursively uses ${SELF_CHECK_ID}`)
  }

  const reverseClaimsBySource = new Map(sourceIds.map((sourceId) => [sourceId, []]))
  for (const claim of claims) for (const link of claim.sourceLinks ?? []) reverseClaimsBySource.get(link.sourceId)?.push(claim.id)
  for (const source of sources) {
    const expectedSupported = [...new Set(reverseClaimsBySource.get(source.id) ?? [])]
    if (!sameSet(source.supportedClaims ?? [], expectedSupported)) errors.push(`SOURCE_JSON ${source.id} supportedClaims is not the exact reverse claim map`)
  }

  for (const { lesson } of corpus.filter((entry) => entry.lesson.schemaVersion === 'v3')) {
    for (const source of lesson.sourceRegistry ?? []) {
      const global = sources.find((candidate) => candidate.canonicalUrl === source.canonicalUrl)
      if (!global) errors.push(`${lesson.lessonId} sourceRegistry URL missing SOURCE_JSON: ${source.canonicalUrl}`)
      else usedSourceIds.add(global.id)
    }
  }
  for (const source of sources.filter((item) => item.status === 'verified')) {
    if (!usedSourceIds.has(source.id)) errors.push(`SOURCE_JSON ${source.id} is verified but unused`)
  }

  const expectedSourceSurfaceIds = [...new Set(expectedItems
    .filter((item) => ['section-source', 'context-artifact', 'reading-source', 'legacy-reading'].includes(item.artifactOrClaim))
    .map((item) => item.surfaceId))]
  const actualSourceSurfaceIds = [...new Set(actualItems
    .filter((item) => ['section-source', 'context-artifact', 'reading-source', 'legacy-reading'].includes(item.artifactOrClaim))
    .map((item) => item.surfaceId))]
  exactSet(errors, 'source surface IDs', expectedSourceSurfaceIds, actualSourceSurfaceIds)

  const capabilities = (records.get('CAPABILITY_JSON') ?? []).map(withoutMeta)
  const expectedCapabilities = [...new Set(corpus.filter((entry) => entry.lesson.schemaVersion === 'v3').map((entry) => entry.lesson.capabilities[0]))].sort()
  exactSet(errors, 'CAPABILITY_JSON', expectedCapabilities, capabilities.map((item) => item.id))
  const capabilityFields = ['jobToBeDone', 'situationAudience', 'inputArtifact', 'decisionRisk', 'observableOutput', 'languageFunctionsChunks', 'technicalReasoning', 'commonVietnameseLearnerFailure', 'initialScaffoldAndFade', 'nearTransfer', 'farTransfer', 'delayedReview', 'independenceEvidence', 'languageDifficulty', 'taskDifficulty', 'technicalDifficulty']
  for (const capability of capabilities) for (const field of capabilityFields) if (!capability[field]) errors.push(`CAPABILITY_JSON ${capability.id} missing ${field}`)

  exactSet(errors, 'COVERAGE_JSON', corpus.map((entry) => entry.lesson.lessonId), coverage.map((item) => item.lessonId))
  for (const row of coverage) {
    const entry = corpus.find((item) => item.lesson.lessonId === row.lessonId)
    if (!entry) continue
    if (row.cefrRelation !== 'rationale-only') errors.push(`COVERAGE_JSON ${row.lessonId} must be rationale-only`)
    if (row.cefrSourceId !== 'coe-cefr-companion-2020' || !row.cefrExactLocation) errors.push(`COVERAGE_JSON ${row.lessonId} lacks exact CEFR source trace`)
    if (entry.lesson.schemaVersion === 'v3') {
      if (row.capability !== entry.lesson.capabilities[0] || row.mode !== entry.lesson.performanceTask.mode || row.cefr !== entry.lesson.cefrLevel) errors.push(`COVERAGE_JSON ${row.lessonId} drifts from corpus`)
    } else if (row.capability !== 'legacy-pronunciation' || row.evidenceKind !== 'knowledge-only') {
      errors.push(`COVERAGE_JSON ${row.lessonId} overclaims legacy coverage`)
    }
  }

  const mode = (records.get('MODE_DECISION_JSON') ?? []).map(withoutMeta)
  if (mode.length !== 1 || mode[0].mode !== 'coverage-completion') errors.push('MODE_DECISION_JSON must select coverage-completion exactly once')
  const backlog = (records.get('BACKLOG_JSON') ?? []).map(withoutMeta)
  if (!backlog.length || backlog.some((item) => ['blocker', 'high'].includes(item.severity) && item.status !== 'closed')) errors.push('BACKLOG_JSON retains open blocker/high')
  const waves = (records.get('WAVE_JSON') ?? []).map(withoutMeta)
  if (waves.length < 6 || waves.some((item) => item.result !== 'completed')) errors.push('WAVE_JSON must contain at least six completed waves')
  const residuals = (records.get('RESIDUAL_JSON') ?? []).map(withoutMeta)
  if (residuals.length < 8 || residuals.some((item) => ['blocker', 'high'].includes(item.severity))) errors.push('RESIDUAL_JSON must contain >=8 non-high residuals')

  const verification = (records.get('VERIFICATION_JSON') ?? []).map(withoutMeta)
  const requiredChecks = task.validationPlan.filter((check) => check.required && check.id !== SELF_CHECK_ID).map((check) => check.id)
  if (verification.some((row) => row.kind !== 'required-check')) errors.push('VERIFICATION_JSON may contain required-check rows only')
  exactSet(errors, 'VERIFICATION_JSON required checks', requiredChecks, verification.map((item) => item.checkId))
  for (const row of verification) {
    if (row.status !== 'pass') errors.push(`VERIFICATION_JSON ${row.checkId} is not pass`)
    if (!['measured', 'inspection'].includes(row.evidenceType)) errors.push(`VERIFICATION_JSON ${row.checkId} lacks evidence type`)
    if (!row.evidenceId) errors.push(`VERIFICATION_JSON ${row.checkId} lacks evidenceId`)
    const evidence = row.evidenceId ? validateEvidenceReference(errors, evidenceById, row.evidenceId, `VERIFICATION_JSON ${row.checkId}`, [row.checkId]) : null
    if (row.exitCode !== 0 || evidence?.exitCode !== 0) errors.push(`VERIFICATION_JSON ${row.checkId} must resolve exitCode 0 evidence`)
    if (!/^[0-9a-f]{64}$/u.test(row.inputDigest ?? '') || row.inputDigest !== evidence?.inputDigest) errors.push(`VERIFICATION_JSON ${row.checkId} inputDigest mismatch`)
    if (row.measuredAt !== evidence?.recordedAt) errors.push(`VERIFICATION_JSON ${row.checkId} measuredAt mismatch`)
  }

  if (errors.length) {
    console.error(`Curriculum research validation failed (${errors.length}):`)
    errors.forEach((error) => console.error(`- ${error}`))
    process.exitCode = 1
    return
  }
  console.log(JSON.stringify({
    status: 'pass',
    lessons: corpus.length,
    items: actualItems.length,
    sourceSurfaces: actualSourceSurfaceIds.length,
    requiredTraces: actualRequired.length,
    modelTraces: actualModel.length,
    objectiveTraces: actualObjectives.length,
    claims: claims.length,
    sources: sources.length,
    capabilities: capabilities.length,
    coverageRows: coverage.length,
    residuals: residuals.length
  }))
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) validate()
