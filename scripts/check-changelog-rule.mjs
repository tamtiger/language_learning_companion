import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Các câu quy tắc bắt buộc phải xuất hiện trong docs/RELEASE.md. */
export const REQUIRED_STATEMENTS = [
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

const RELEASE_HEADING = /^## \[(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\] - \d{4}-\d{2}-\d{2}$/m

/** Trả về danh sách lỗi; mảng rỗng nghĩa là quy tắc, version và CHANGELOG nhất quán. */
export function checkChangelogRule(root) {
  const errors = []
  const read = (file) => readFileSync(join(root, file), 'utf8')

  const rules = read('docs/RELEASE.md')
  const missing = REQUIRED_STATEMENTS.filter((statement) => !rules.includes(statement))
  if (missing.length > 0) errors.push(`Thiếu quy tắc changelog/version trong docs/RELEASE.md: ${missing.join(', ')}`)

  const manifest = JSON.parse(read('package.json'))
  const lock = JSON.parse(read('package-lock.json'))
  if (manifest.version !== lock.version || manifest.version !== lock.packages?.['']?.version) {
    errors.push('Version giữa package.json và package-lock.json chưa đồng bộ.')
  }

  const latest = read('CHANGELOG.md').match(RELEASE_HEADING)?.[1]
  if (latest !== manifest.version) {
    errors.push(`Release mới nhất trong CHANGELOG.md (${latest ?? 'không có'}) không khớp package version ${manifest.version}.`)
  }
  return errors
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = checkChangelogRule(resolve(fileURLToPath(new URL('..', import.meta.url))))
  if (errors.length > 0) {
    console.error(errors.join('\n'))
    process.exit(1)
  }
  console.log('Quy tắc changelog/version đầy đủ.')
}
