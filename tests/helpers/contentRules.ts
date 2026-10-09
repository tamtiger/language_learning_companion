import type { CanonicalLesson, CanonicalPerformanceTaskV3, LearningLoopV1, ModelAudioSource } from '@/content/schema'

/** Lowercase words that carry facts: at least six letters, or containing a digit. */
export function distinctiveTokens(text: string): Set<string> {
  const tokens = text.toLowerCase().match(/[a-z0-9][a-z0-9'’-]*/g) ?? []
  return new Set(tokens.filter((token) => token.replace(/[^a-z]/g, '').length >= 6 || /\d/.test(token)))
}

function contextText(task: CanonicalPerformanceTaskV3, phases: Array<'baseline' | 'retry' | 'transfer' | 'review'>): string {
  return phases.flatMap((phase) => {
    const context = task.practiceContexts?.[phase]
    return context ? [context.title, context.brief, ...context.artifacts.map((artifact) => `${artifact.title} ${artifact.content}`)] : []
  }).join(' ')
}

/** Learner-visible text of a learning loop (no ids, keys or structural fields). */
export function learningLoopText(loop: LearningLoopV1): string {
  const audioText = (audio: ModelAudioSource) => (audio.kind === 'speech-synthesis' ? audio.text : audio.transcript)
  const items = [...loop.perception.pretest, ...loop.perception.training, ...loop.perception.posttest]
  return [
    ...items.flatMap((item) => [audioText(item.audio), item.question, ...item.options, item.feedback ?? '']),
    ...loop.pronunciationCues.flatMap((cue) => [cue.articulatoryCue, cue.meaningRisk]),
    ...loop.chunks.flatMap((chunk) => [chunk.function, chunk.text, chunk.meaning, ...chunk.slots, audioText(chunk.modelAudio)]),
    ...loop.listenBackChecklist,
    ...loop.interactionTurns.flatMap((turn) => [turn.prompt, turn.expectedFunction, turn.audio ? audioText(turn.audio) : ''])
  ].join(' ')
}

/**
 * Facts that only appear in the transfer or review evidence packets must not leak into the spoken
 * learning loop, which the learner sees before those phases. Returns the leaked tokens.
 */
export function findFuturePhaseLeaks(lesson: CanonicalLesson): string[] {
  const task = lesson.performanceTask
  if (task?.mode !== 'spoken' || !task.learningLoop) return []
  const future = distinctiveTokens(`${contextText(task, ['transfer', 'review'])} ${task.transferPrompt} ${task.reviewPrompt}`)
  const known = distinctiveTokens([
    JSON.stringify(lesson.sections),
    contextText(task, ['baseline', 'retry']),
    task.scenario, task.baselinePrompt, task.performancePrompt, task.retryPrompt, task.modelResponse,
    JSON.stringify(task.rubric), JSON.stringify(task.outputContract), JSON.stringify(lesson.learningObjectives), lesson.title, lesson.summary
  ].join(' '))
  const loop = distinctiveTokens(learningLoopText(task.learningLoop))
  return [...future].filter((token) => !known.has(token) && loop.has(token)).sort()
}
