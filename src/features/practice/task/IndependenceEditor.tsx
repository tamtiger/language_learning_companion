import type { IndependenceEvidence } from '../../../domain/progress/progress'

export function IndependenceEditor({ value, onChange }: {
  value: IndependenceEvidence
  onChange: (value: IndependenceEvidence) => void
}) {
  const options: Array<{ key: 'usedVietnamese' | 'usedTranslation' | 'usedModelAnswer'; label: string }> = [
    { key: 'usedVietnamese', label: 'Tôi đã dùng tiếng Việt để chuẩn bị' },
    { key: 'usedTranslation', label: 'Tôi đã dùng công cụ dịch' },
    { key: 'usedModelAnswer', label: 'Tôi đã xem hoặc dùng model answer' }
  ]
  return (
    <fieldset className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <legend className="px-1 text-sm font-bold">Mức độ độc lập của lượt này</legend>
      <p className="mb-3 text-xs text-zinc-400">
        Tự khai báo trung thực; app chỉ lưu các cờ này, không lưu nội dung câu trả lời.
      </p>
      <div className="grid gap-2">
        {options.map((option) => (
          <label key={option.key} className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={value[option.key]}
              onChange={(event) => onChange({ ...value, [option.key]: event.target.checked })}
              className="h-4 w-4 accent-purple-500"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
