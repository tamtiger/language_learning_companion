import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CheckCircle2, Download, ShieldAlert, Trash2, Upload } from 'lucide-react'
import { createCapabilityBackup, parseCapabilityBackup, useAppStore } from '../../shared/hooks/useAppStore'
import type { ProgressEnvelope } from '../../infrastructure/storage/progressStorage'

export function Settings() {
  const [pending, setPending] = useState<{ envelope: ProgressEnvelope; fileName: string } | null>(null)
  const [isReading, setIsReading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const readGeneration = useRef(0)
  const messageRef = useRef<HTMLDivElement>(null)
  const confirmImportRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (message) messageRef.current?.focus()
  }, [message])
  useLayoutEffect(() => {
    if (pending) confirmImportRef.current?.focus()
  }, [pending])

  const exportBackup = () => {
    const backup = createCapabilityBackup(useAppStore.getState())
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `language_companion_backup_${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    // Revoking immediately can cancel the download in some browsers.
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
  }

  const readImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const generation = readGeneration.current + 1
    readGeneration.current = generation
    setPending(null)
    setIsReading(true)
    setMessage(`Đang đọc ${file.name}…`)
    const reader = new FileReader()
    reader.onload = () => {
      if (generation !== readGeneration.current) return
      setIsReading(false)
      const result = parseCapabilityBackup(reader.result)
      if (!result.success) {
        setPending(null)
        setMessage(`Backup không hợp lệ hoặc không thuộc version được hỗ trợ; dữ liệu hiện tại được giữ nguyên. ${result.error}`)
        return
      }
      const { storageVersion, lessonProgress, settings } = result.data
      setPending({
        envelope: { storageVersion, lessonProgress, settings },
        fileName: file.name
      })
      setMessage(null)
    }
    reader.onerror = () => {
      if (generation !== readGeneration.current) return
      setIsReading(false)
      setPending(null)
      setMessage(`Không thể đọc ${file.name}; dữ liệu hiện tại được giữ nguyên.`)
    }
    reader.readAsText(file)
  }

  const confirmImport = () => {
    if (!pending || isReading) return
    useAppStore.getState().restoreEnvelope(pending.envelope)
    setPending(null)
    setMessage(`Đã import backup v5 từ ${pending.fileName} sau khi validate và xác nhận.`)
  }

  return (
    <section aria-labelledby="settings-title" className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 id="settings-title" className="text-3xl font-black">Cài đặt và dữ liệu local</h1>
        <p className="mt-2 text-zinc-400">Backup chỉ chứa progress metadata; không có audio, transcript hoặc nội dung trả lời.</p>
      </div>
      {message && <div ref={messageRef} tabIndex={-1} role="status" className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-sm">{message}</div>}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold"><Download className="h-5 w-5 text-purple-400" />Backup version 5</h2>
        <p className="mt-2 text-sm text-zinc-400">Nhận backup v5 và tự migrate backup v3/v4; backup v1/v2 hoặc version tương lai bị từ chối.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={exportBackup} className="rounded-xl bg-purple-700 px-4 py-3 font-bold">Tải backup metadata</button>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 font-bold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-purple-400">
            <Upload className="h-4 w-4" />Chọn file import
            <input type="file" accept="application/json,.json" className="sr-only" onChange={readImport} />
          </label>
        </div>
        {pending && (
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-sm">Đã validate backup v5 từ {pending.fileName}. Xác nhận mới thay thế progress hiện tại.</p>
            <div className="mt-3 flex gap-2">
              <button ref={confirmImportRef} type="button" disabled={isReading} onClick={confirmImport} className="rounded-lg bg-amber-400 px-4 py-2 font-bold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50">Xác nhận import</button>
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
            <button type="button" onClick={() => { useAppStore.getState().resetProgress(); setConfirmReset(false); setMessage('Đã reset progress local.') }} className="rounded-lg bg-red-700 px-4 py-2 font-bold text-white">Xác nhận xóa</button>
            <button type="button" onClick={() => setConfirmReset(false)} className="rounded-lg border border-zinc-700 px-4 py-2">Hủy</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 font-bold text-red-300"><Trash2 className="h-4 w-4" />Xóa progress</button>
        )}
      </div>
      <p className="flex items-center gap-2 text-xs text-zinc-400"><CheckCircle2 className="h-4 w-4 text-green-400" />Import invalid luôn fail-closed và giữ state hiện tại.</p>
    </section>
  )
}
