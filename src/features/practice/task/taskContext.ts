import type { useTaskActions } from './useTaskActions'
import type { TaskState } from './useTaskState'

/** Everything a phase view needs: the task state and the actions that change it. */
export type TaskContext = TaskState & ReturnType<typeof useTaskActions>
