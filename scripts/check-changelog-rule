import { readFileSync } from 'node:fs'

const instructions = readFileSync(new URL('../AGENTS.md', import.meta.url), 'utf8')
const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8')
const packageManifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const packageLock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'))
const requiredStatements = [
  'Sau mỗi lần implement có thay đổi production',
  'đầu lịch sử changelog',
  '`MAJOR`',
  '`MINOR`',
  '`PATCH`',
  '`package.json`',
  '`package-lock.json`',
  '`docs-only` hoặc `prompt-only`',
  'Không tăng version và không thêm release',
  'task trộn',
  'không sửa, xóa, gộp, đổi tên hoặc sắp xếp lại bất kỳ mục cũ nào',
  'completion gate'
]

const missing = requiredStatements.filter((statement) => !instructions.includes(statement))
if (missing.length > 0) {
  throw new Error(`Thiếu quy tắc changelog/version: ${missing.join(', ')}`)
}

const rootLockVersion = packageLock.packages?.['']?.version
if (packageManifest.version !== packageLock.version || packageManifest.version !== rootLockVersion) {
  throw new Error('Version giữa package.json và package-lock.json chưa đồng bộ.')
}

const latestRelease = changelog.match(/^## \[(\d+\.\d+\.\d+)\] - \d{4}-\d{2}-\d{2}$/m)?.[1]
if (latestRelease !== packageManifest.version) {
  throw new Error('Release mới nhất trong CHANGELOG.md không khớp package version.')
}

console.log('Quy tắc changelog/version đầy đủ.')
