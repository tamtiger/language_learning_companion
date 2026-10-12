import { useState } from 'react'
import type { CanonicalPerformanceTaskV3 } from '../../../content/schema'

/** Shown open on the first attempt so it is read before the learner starts, then collapsed to save space. */
export function OutputContractPanel({ task, firstView }: { task: CanonicalPerformanceTaskV3; firstView: boolean }) {
  const [open, setOpen] = useState(firstView)
  return (
    <details
      aria-label="Hợp đồng đầu ra"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5"
    >
      <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-emerald-300">
        Hợp đồng đầu ra · {firstView ? 'đọc trước khi làm' : 'mở để xem lại'}
      </summary>
      <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-emerald-100">
        {task.mode === 'written' ? (
          <span className="rounded-full bg-emerald-500/10 px-3 py-1">{task.outputContract.minWords}–{task.outputContract.maxWords} từ</span>
        ) : (
          <span className="rounded-full bg-emerald-500/10 px-3 py-1">Tối thiểu {task.outputContract.minSeconds} giây</span>
        )}
        <span className="rounded-full bg-emerald-500/10 px-3 py-1">Tối đa {task.outputContract.timeLimitSeconds} giây</span>
      </div>
      <p className="mt-4 text-sm font-bold text-zinc-200">Thành phần bắt buộc</p>
      <ul className="mt-2 grid gap-1 text-sm text-zinc-300 sm:grid-cols-2">
        {task.outputContract.requiredElements.map((element) => <li key={element}>• {element}</li>)}
      </ul>
      <p className="mt-3 text-xs text-zinc-400">App dùng các mốc này để xét qualifying ở lượt transfer; nội dung câu trả lời vẫn chỉ ở phiên hiện tại.</p>
    </details>
  )
}
