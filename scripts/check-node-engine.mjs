import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DOCS_WITH_NODE_REQUIREMENT = ['README.md', 'docs/START_HERE.md']

function majorOf(version) {
  const match = /(\d+)/.exec(version)
  return match ? Number(match[1]) : null
}

/** Trả về danh sách lỗi; mảng rỗng nghĩa là khai báo phiên bản Node nhất quán. */
export function checkNodeEngine(root) {
  const errors = []
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const range = manifest.engines?.node
  if (!range) errors.push('package.json thiếu engines.node')

  const nvmrcPath = join(root, '.nvmrc')
  if (!existsSync(nvmrcPath)) {
    errors.push('Thiếu .nvmrc')
  } else if (range) {
    const pinned = majorOf(readFileSync(nvmrcPath, 'utf8'))
    const minimum = majorOf(range)
    if (pinned === null) errors.push('.nvmrc không chứa số phiên bản Node')
    else if (minimum !== null && pinned < minimum) {
      errors.push(`.nvmrc (${pinned}) thấp hơn engines.node (${range})`)
    }
  }

  if (range) {
    const minimum = /(\d+(?:\.\d+)*)/.exec(range)?.[1]?.replace(/(\.0)+$/, '')
    for (const doc of DOCS_WITH_NODE_REQUIREMENT) {
      const path = join(root, doc)
      const text = existsSync(path) ? readFileSync(path, 'utf8') : ''
      if (!text.includes(`Node ${minimum}`) && !text.includes(`Node.js ${minimum}`)) {
        errors.push(`${doc} không nêu yêu cầu Node ${minimum}`)
      }
    }
  }
  return errors
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = checkNodeEngine(fileURLToPath(new URL('..', import.meta.url)))
  if (errors.length > 0) {
    console.error(errors.join('\n'))
    process.exit(1)
  }
  console.log(JSON.stringify({ status: 'pass' }))
}
