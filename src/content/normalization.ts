import {
  RawLessonSchema,
  LessonV1Schema,
  LessonV2Schema,
  LessonV3Schema,
  type CanonicalLesson,
  type AuthoritativeSource,
  type CanonicalLessonSection,
  type CanonicalPerformanceTaskV3,
  type CanonicalPracticeContexts,
  type CanonicalSourceSection,
  type LessonV1,
  type LessonV2,
  type RawLesson,
  type SourceSection,
  type PerformanceTaskV3
} from './schema'

export class LessonParseError extends Error {
  readonly issues: string[]

  constructor(issues: string[]) {
    super(`Lesson validation failed:\n${issues.join('\n')}`)
    this.name = 'LessonParseError'
    this.issues = issues
  }
}

export function parseLesson(input: unknown): RawLesson {
  let candidate = input
  if (typeof input === 'string') {
    try {
      candidate = JSON.parse(input)
    } catch (error) {
      throw new LessonParseError([error instanceof Error ? error.message : String(error)])
    }
  }

  if (
    typeof candidate !== 'object'
    || candidate === null
    || !('schemaVersion' in candidate)
    || !['v1', 'v2', 'v3'].includes(String(candidate.schemaVersion))
  ) {
    throw new LessonParseError(['schemaVersion: Expected v1, v2 or v3'])
  }

  const version = String(candidate.schemaVersion)
  const schema = version === 'v1' ? LessonV1Schema : version === 'v2' ? LessonV2Schema : LessonV3Schema
  const result = schema.safeParse(candidate)
  if (!result.success) {
    throw new LessonParseError(
      result.error.errors.map((issue) => `${issue.path.join('.') || 'lesson'}: ${issue.message}`)
    )
  }
  return RawLessonSchema.parse(result.data)
}

function legacySections(lesson: LessonV1 | LessonV2): CanonicalLessonSection[] {
  return [
    {
      id: 'objectives',
      type: 'brief',
      title: 'Learning objectives',
      body: lesson.learningObjectives.join('\n')
    },
    {
      id: 'language-support',
      type: 'language-support',
      title: 'Language support',
      vocabulary: lesson.vocabulary,
      expressions: lesson.expressions
    },
    {
      id: 'source',
      type: 'source',
      title: lesson.reading.title,
      format: 'prose',
      content: lesson.reading.content
    },
    {
      id: 'auto-check',
      type: 'auto-check',
      title: 'Knowledge check',
      exercises: lesson.exercises
    }
  ]
}

function normalizeV2Task(lesson: LessonV2): NonNullable<CanonicalLesson['performanceTask']> {
  const task = lesson.performanceTask
  return {
    id: task.id,
    mode: 'spoken',
    title: task.title,
    scenario: task.scenario,
    baselinePrompt: task.prompt,
    performancePrompt: task.prompt,
    modelResponse: task.modelResponse,
    retryPrompt: task.retryPrompt,
    transferPrompt: task.transferPrompt,
    reviewPrompt: task.transferPrompt,
    outputContract: {
      timeLimitSeconds: task.preparationSeconds + task.performanceSeconds,
      targetSeconds: task.performanceSeconds,
      requiredElements: task.requirements
    },
    independenceContract: {
      noVietnamese: true,
      noTranslation: true,
      noModelAnswer: true,
      maxHints: 0,
      preparationSeconds: task.preparationSeconds
    },
    feedbackPriorities: task.feedbackPriorities,
    rubric: task.rubric.slice(0, 5).map((item) => ({
      id: item.id,
      label: item.criterion,
      description: item.successDescription
    }))
  }
}

function resolveSource(
  source: SourceSection,
  sourceById: ReadonlyMap<string, AuthoritativeSource>
): CanonicalSourceSection {
  if (!source.provenance) {
    return {
      id: source.id,
      type: 'source',
      title: source.title,
      format: source.format,
      content: source.content
    }
  }
  const resolvedSources = source.provenance.sourceIds.map((sourceId) => {
    const resolved = sourceById.get(sourceId)
    if (!resolved) throw new LessonParseError([`Unknown sourceRegistry reference: ${sourceId}`])
    return resolved
  })
  if (!resolvedSources[0]) {
    throw new LessonParseError([`Source provenance ${source.id} must resolve at least one source`])
  }
  return {
    ...source,
    provenance: source.provenance,
    resolvedSources: [resolvedSources[0], ...resolvedSources.slice(1)]
  }
}

function resolveV3TaskSources(
  task: PerformanceTaskV3,
  sourceById: ReadonlyMap<string, AuthoritativeSource>
): CanonicalPerformanceTaskV3 {
  const practiceContexts: CanonicalPracticeContexts | undefined = task.practiceContexts
    ? {
        baseline: {
          ...task.practiceContexts.baseline,
          artifacts: task.practiceContexts.baseline.artifacts.map((source) => resolveSource(source, sourceById))
        },
        ...(task.practiceContexts.retry ? {
          retry: {
            ...task.practiceContexts.retry,
            artifacts: task.practiceContexts.retry.artifacts.map((source) => resolveSource(source, sourceById))
          }
        } : {}),
        transfer: {
          ...task.practiceContexts.transfer,
          artifacts: task.practiceContexts.transfer.artifacts.map((source) => resolveSource(source, sourceById))
        },
        review: {
          ...task.practiceContexts.review,
          artifacts: task.practiceContexts.review.artifacts.map((source) => resolveSource(source, sourceById))
        }
      }
    : undefined

  if (task.mode === 'written') {
    return {
      ...task,
      practiceContexts,
      readingLadder: task.readingLadder
        ? {
          ...task.readingLadder,
          trainingSource: resolveSource(task.readingLadder.trainingSource, sourceById)
        }
        : undefined
    }
  }
  return { ...task, practiceContexts }
}

export function normalizeLesson(lesson: RawLesson): CanonicalLesson {
  if (lesson.schemaVersion === 'v3') {
    const sourceById = new Map((lesson.sourceRegistry ?? []).map((source) => [source.sourceId, source]))
    return {
      sourceSchemaVersion: 'v3',
      lessonId: lesson.lessonId,
      title: lesson.title,
      summary: lesson.summary,
      cefrLevel: lesson.cefrLevel,
      durationMinutes: lesson.durationMinutes,
      learningObjectives: lesson.learningObjectives,
      capabilities: lesson.capabilities,
      workflowTags: lesson.workflowTags,
      sections: lesson.sections.map((section) => section.type === 'source'
        ? resolveSource(section, sourceById)
        : section),
      performanceTask: resolveV3TaskSources(lesson.performanceTask, sourceById),
      reviewPolicy: lesson.reviewPolicy,
      completionMode: 'capability-loop'
    }
  }

  const common: Omit<CanonicalLesson, 'capabilities' | 'performanceTask' | 'completionMode'> = {
    sourceSchemaVersion: lesson.schemaVersion,
    lessonId: lesson.lessonId,
    title: lesson.title,
    summary: lesson.learningObjectives[0],
    cefrLevel: lesson.cefrLevel,
    durationMinutes: lesson.durationMinutes,
    learningObjectives: lesson.learningObjectives,
    workflowTags: lesson.schemaVersion === 'v2' ? ['standup'] : ['pronunciation'],
    sections: legacySections(lesson),
    reviewPolicy: { intervalDays: [1, 3, 7] }
  }

  if (lesson.schemaVersion === 'v2') {
    return {
      ...common,
      capabilities: ['international-meetings'],
      performanceTask: normalizeV2Task(lesson),
      completionMode: 'performance'
    }
  }

  return {
    ...common,
    capabilities: [],
    completionMode: 'legacy-quiz'
  }
}
