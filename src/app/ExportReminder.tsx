import { useEffect, useState } from 'react'
import { DatabaseBackup } from 'lucide-react'
import { LAST_EXPORT_EVENT, getLastExportedAt, isExportOverdue } from '../infrastructure/storage/storageHealth'
import { useAppStore } from '../shared/hooks/useAppStore'
import { useNow } from '../shared/hooks/useNow'

const DAY_MS = 86_400_000

/** Gentle reminder to export a backup when there is progress and none was taken for a week. */
export function ExportReminder({ onOpenSettings }: { onOpenSettings: () => void }) {
  const hasProgress = useAppStore((state) => Object.values(state.lessonProgress).some((progress) =>
    progress.attemptCount > 0 || progress.completedExerciseIds.length > 0 || progress.status !== 'not-started'
  ))
  const [lastExportedAt, setLastExportedAt] = useState(() => getLastExportedAt())
  const [dismissed, setDismissed] = useState(false)
  const now = useNow()

  useEffect(() => {
    const refresh = () => setLastExportedAt(getLastExportedAt())
    window.addEventListener(LAST_EXPORT_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(LAST_EXPORT_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  if (dismissed || !isExportOverdue(lastExportedAt, hasProgress, now)) return null
  const days = lastExportedAt ? Math.floor((now.getTime() - Date.parse(lastExportedAt)) / DAY_MS) : null

  return (
    <div
      data-testid="export-reminder"
      role="status"
      className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-4 text-sm text-cyan-100"
    >
      <DatabaseBackup aria-hidden="true" className="h-5 w-5 shrink-0 text-cyan-300" />
      <p className="min-w-0 flex-1">
        {days === null
          ? 'Bạn chưa từng xuất backup. Tiến độ chỉ nằm trong trình duyệt này; hãy tải một bản backup để không mất khi trình duyệt dọn dữ liệu.'
          : `Đã ${days} ngày bạn chưa xuất backup. Hãy tải một bản mới để không mất tiến độ gần đây.`}
      </p>
      <button type="button" onClick={onOpenSettings} className="rounded-lg border border-cyan-300/50 px-3 py-2 font-bold hover:bg-cyan-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
        Mở Cài đặt
      </button>
      <button type="button" onClick={() => setDismissed(true)} className="rounded-lg px-3 py-2 font-semibold text-cyan-200 hover:bg-cyan-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
        Để sau
      </button>
    </div>
  )
}
