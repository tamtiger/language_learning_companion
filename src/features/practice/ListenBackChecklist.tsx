import { CheckCircle2, Headphones } from 'lucide-react'

function isListenBackChecklistComplete(items: string[], checked: boolean[]): boolean {
  return items.length > 0 && items.every((_, index) => checked[index] === true)
}

export function ListenBackChecklist({ items, checked, playbackCompleted, onChange }: {
  items: string[]
  checked: boolean[]
  playbackCompleted: boolean
  onChange: (checked: boolean[]) => void
}) {
  const complete = playbackCompleted && isListenBackChecklistComplete(items, checked)
  return (
    <fieldset className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
      <legend className="flex items-center gap-2 px-1 text-sm font-bold text-cyan-100">
        <Headphones aria-hidden="true" className="h-4 w-4" />Listener check
      </legend>
      <p className="mb-3 text-xs text-zinc-400">Phát lại bản ghi, rồi xác nhận từng tín hiệu người nghe cần nhận được.</p>
      <div className="grid gap-2">
        {items.map((item, index) => (
          <label key={`${index}:${item}`} className={`flex items-start gap-3 text-sm ${playbackCompleted ? 'cursor-pointer text-zinc-200' : 'cursor-not-allowed text-zinc-500'}`}>
            <input type="checkbox" disabled={!playbackCompleted} checked={checked[index] ?? false}
              onChange={(event) => {
                const next = [...checked]
                next[index] = event.target.checked
                onChange(next)
              }} className="mt-0.5 h-4 w-4 accent-cyan-400" />
            {item}
          </label>
        ))}
      </div>
      <p role="status" className={`mt-3 flex items-center gap-2 text-xs ${complete ? 'text-green-300' : 'text-zinc-500'}`}>
        <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
        {complete ? 'Listen-back đã đủ evidence.' : playbackCompleted ? 'Xác nhận đủ checklist để tiếp tục.' : 'Checklist mở sau khi audio bắt đầu phát.'}
      </p>
    </fieldset>
  )
}
