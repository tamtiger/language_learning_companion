import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DISPLAY_MODES = ['standalone', 'fullscreen', 'minimal-ui']

/** Trả về danh sách lỗi; mảng rỗng nghĩa là bản build dùng được khi offline và cài được. */
export function checkOfflineBuild(distDir) {
  const assetsDir = join(distDir, 'assets')
  if (!existsSync(assetsDir)) return [`Không tìm thấy ${assetsDir}. Chạy npm run build trước.`]

  const errors = []
  const swPath = join(distDir, 'sw.js')
  if (!existsSync(swPath)) {
    errors.push('Thiếu sw.js trong bản build')
  } else {
    const worker = readFileSync(swPath, 'utf8')
    for (const name of readdirSync(assetsDir)) {
      if (!worker.includes(JSON.stringify(`/assets/${name}`))) errors.push(`assets/${name} không nằm trong precache của sw.js`)
    }
  }

  const manifestPath = join(distDir, 'manifest.webmanifest')
  if (!existsSync(manifestPath)) {
    errors.push('Thiếu manifest.webmanifest trong bản build')
  } else {
    let manifest = null
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    } catch {
      errors.push('manifest.webmanifest không phải JSON hợp lệ')
    }
    if (manifest) {
      if (!manifest.name) errors.push('manifest.webmanifest thiếu name')
      if (!manifest.start_url) errors.push('manifest.webmanifest thiếu start_url')
      if (!DISPLAY_MODES.includes(manifest.display)) errors.push(`manifest.webmanifest: display phải là ${DISPLAY_MODES.join(', ')}`)
      if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
        errors.push('manifest.webmanifest thiếu icons')
      } else {
        for (const icon of manifest.icons) {
          if (!existsSync(join(distDir, String(icon.src).replace(/^\//, '')))) {
            errors.push(`${icon.src} (icon trong manifest) không có trong bản build`)
          }
        }
      }
    }
  }

  const indexPath = join(distDir, 'index.html')
  if (!existsSync(indexPath) || !/rel="manifest"/.test(readFileSync(indexPath, 'utf8'))) {
    errors.push('index.html thiếu link tới manifest')
  }
  return errors
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
  const errors = checkOfflineBuild(process.argv[2] ? resolve(process.argv[2]) : join(root, 'dist'))
  if (errors.length > 0) {
    console.error(errors.join('\n'))
    process.exit(1)
  }
  console.log('Bản build dùng được khi offline.')
}
