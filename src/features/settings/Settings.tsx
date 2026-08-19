import { useState } from 'react'
import { CheckCircle2, Download, ShieldAlert, Trash2, Upload } from 'lucide-react'
import { createCapabilityBackup, parseCapabilityBackup, useAppStore } from '../../shared/hooks/use_app_store'
import type { ProgressEnvelope } from '../../infrastructure/storage/progress_storage'

export function Settings() {
  const store = useAppStore()
  const [pending, setPending] = useState<ProgressEnvelope | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const exportBackup = () => {
    const backup = createCapabilityBackup(store)
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `language_companion_backup_${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const readImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = parseCapabilityBackup(reader.result)
      if (!result.success) {
        setPending(null)
        setMessage(`Backup không hợp lệ hoặc không phải v3; dữ liệu hiện tại được giữ nguyên. ${result.error}`)
        return
      }
      const { storageVersion, lessonProgress, settings } = result.data
      setPending({ storageVersion, lessonProgress, settings })
      setMessage(null)
    }
    reader.readAsText(file)
  }

  const confirmImport = () => {
    if (!pending) return
    store.restoreEnvelope(pending)
    setPending(null)
    setMessage('Đã import backup v3 sau khi validate và xác nhận.')
  }

  return (
    <section aria-labelledby="settings-title" className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 id="settings-title" className="text-3xl font-black">Cài đặt và dữ liệu local</h1>
        <p className="mt-2 text-zinc-400">Backup chỉ chứa progress metadata; không có audio, transcript hoặc nội dung trả lời.</p>
      </div>
      {message && <div role="status" className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-sm">{message}</div>}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold"><Download className="h-5 w-5 text-purple-400" />Backup version 3</h2>
        <p className="mt-2 text-sm text-zinc-400">Ứng dụng chưa phát hành nên chỉ nhận đúng schema hiện tại; backup v1/v2 bị từ chối.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={exportBackup} className="rounded-xl bg-purple-500 px-4 py-3 font-bold">Tải backup metadata</button>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 font-bold">
            <Upload className="h-4 w-4" />Chọn file import
            <input type="file" accept="application/json,.json" className="sr-only" onChange={readImport} />
          </label>
        </div>
        {pending && (
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-sm">Đã validate backup v3. Xác nhận mới thay thế progress hiện tại.</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={confirmImport} className="rounded-lg bg-amber-400 px-4 py-2 font-bold text-zinc-950">Xác nhận import</button>
              <button type="button" onClick={() => setPending(null)} className="rounded-lg border border-zinc-700 px-4 py-2">Hủy</button>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-red-300"><ShieldAlert className="h-5 w-5" />Danger zone</h2>
        <p className="mt-2 text-sm text-zinc-400">Reset xóa progress local và không thể hoàn tác nếu chưa export backup.</p>
        {confirmReset ? (
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => { store.resetProgress(); setConfirmReset(false); setMessage('Đã reset progress local.') }} className="rounded-lg bg-red-600 px-4 py-2 font-bold">Xác nhận xóa</button>
            <button type="button" onClick={() => setConfirmReset(false)} className="rounded-lg border border-zinc-700 px-4 py-2">Hủy</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 font-bold text-red-300"><Trash2 className="h-4 w-4" />Xóa progress</button>
        )}
      </div>
      <p className="flex items-center gap-2 text-xs text-zinc-500"><CheckCircle2 className="h-4 w-4 text-green-400" />Import invalid luôn fail-closed và giữ state hiện tại.</p>
    </section>
  )
}
