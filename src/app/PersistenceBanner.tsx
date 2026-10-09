import { TriangleAlert } from 'lucide-react'
import type { PersistenceStatus } from '../shared/hooks/useAppStore'

const MESSAGES: Record<Exclude<PersistenceStatus, 'ok'>, { alert: boolean; text: string }> = {
  quarantined: {
    alert: true,
    text: 'Dữ liệu đã lưu không đọc được hoặc thuộc phiên bản không hỗ trợ, nên ứng dụng không ghi đè lên nó. Vào Cài đặt để nhập backup hoặc xóa progress rồi bắt đầu lại.'
  },
  'memory-only': {
    alert: false,
    text: 'Trình duyệt không cho lưu dữ liệu local, nên tiến độ chỉ được giữ đến khi bạn đóng tab. Hãy tải backup trong Cài đặt trước khi đóng.'
  },
  'write-failed': {
    alert: false,
    text: 'Không ghi được dữ liệu (bộ nhớ đầy hoặc bị chặn). Tiến độ gần đây có thể chưa được lưu; hãy tải backup trong Cài đặt.'
  }
}

export function PersistenceBanner({ status, onOpenSettings }: {
  status: PersistenceStatus
  onOpenSettings: () => void
}) {
  if (status === 'ok') return null
  const { alert, text } = MESSAGES[status]
  return (
    <div
      data-testid="persistence-banner"
      role={alert ? 'alert' : 'status'}
      className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100"
    >
      <TriangleAlert aria-hidden="true" className="h-5 w-5 shrink-0 text-amber-300" />
      <p className="min-w-0 flex-1">{text}</p>
      <button type="button" onClick={onOpenSettings} className="rounded-lg border border-amber-300/50 px-3 py-2 font-bold hover:bg-amber-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
        Mở Cài đặt
      </button>
    </div>
  )
}
