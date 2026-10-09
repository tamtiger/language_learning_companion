import type { CanonicalLesson } from '../../content/schema'
import type { EvidenceContract } from './progress'

/** Builds the evidence contract a lesson's performance task is assessed against. */
export function buildEvidenceContract(lesson: CanonicalLesson): EvidenceContract {
  const task = lesson.performanceTask
  const capabilityId = lesson.capabilities[0] ?? null
  if (!task) {
    return {
      expectedLessonId: lesson.lessonId,
      expectedTaskId: '',
      expectedCapabilityId: capabilityId,
      forbidVietnamese: true,
      forbidTranslation: true,
      forbidModelAnswer: true,
      maxHints: 0,
      maxPreparationSeconds: Number.MAX_SAFE_INTEGER,
      requiredRubricIds: [],
      timeLimitSeconds: Number.MAX_SAFE_INTEGER
    }
  }
  const shared = {
    expectedLessonId: lesson.lessonId,
    expectedTaskId: task.id,
    expectedCapabilityId: capabilityId,
    forbidVietnamese: task.independenceContract.noVietnamese,
    forbidTranslation: task.independenceContract.noTranslation,
    forbidModelAnswer: task.independenceContract.noModelAnswer,
    maxHints: task.independenceContract.maxHints,
    maxPreparationSeconds: task.independenceContract.preparationSeconds,
    requiredRubricIds: task.rubric.map((item) => item.id),
    timeLimitSeconds: task.outputContract.timeLimitSeconds
  }
  if (task.mode === 'spoken') {
    const isPilot = lesson.workflowTags.includes('p0-pilot')
    return {
      ...shared,
      targetSeconds: task.outputContract.targetSeconds,
      requireListenBack: isPilot,
      requiredInteractionTurnIds: isPilot
        ? task.learningLoop?.interactionTurns.map((turn) => turn.id)
        : undefined
    }
  }
  return {
    ...shared,
    minWords: task.outputContract.minWords,
    maxWords: task.outputContract.maxWords
  }
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(',')}}`
  }
  return JSON.stringify(value)
}

/** Short, stable digest (FNV-1a) of a contract; identifies which rules an attempt was assessed against. */
export function contractRevision(contract: EvidenceContract): string {
  const text = stableStringify({
    ...contract,
    requiredRubricIds: [...contract.requiredRubricIds].sort()
  })
  let hash = 0x811c9dc5
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return `c1-${(hash >>> 0).toString(16).padStart(8, '0')}`
}
