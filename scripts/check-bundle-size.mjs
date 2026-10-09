import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Ngưỡng cảnh báo chunk của Vite/Rolldown: 500 kB (không nâng ngưỡng để che cảnh báo). */
export const MAX_CHUNK_BYTES = 500 * 1000

/** Trả về danh sách lỗi; mảng rỗng nghĩa là mọi chunk JS trong dist/assets dưới ngưỡng. */
export function checkBundleSize(distDir) {
  const assets = join(distDir, 'assets')
  if (!existsSync(assets)) return [`Không tìm thấy ${assets}. Chạy npm run build trước.`]

  const chunks = readdirSync(assets).filter((name) => name.endsWith('.js'))
  if (chunks.length === 0) return ['Không có chunk JS trong dist/assets.']

  return chunks.flatMap((name) => {
    const bytes = statSync(join(assets, name)).size
    return bytes >= MAX_CHUNK_BYTES
      ? [`Chunk ${name} nặng ${(bytes / 1000).toFixed(1)} kB, vượt ngưỡng ${MAX_CHUNK_BYTES / 1000} kB`]
      : []
  })
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
  const errors = checkBundleSize(process.argv[2] ? resolve(process.argv[2]) : join(root, 'dist'))
  if (errors.length > 0) {
    console.error(errors.join('\n'))
    process.exit(1)
  }
  console.log('Mọi chunk JS dưới 500 kB.')
}
