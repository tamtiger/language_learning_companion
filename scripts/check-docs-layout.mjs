import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT_MARKDOWN = ['README.md', 'CHANGELOG.md', 'AGENTS.md']
const REQUIRED_DOCS = [
  'docs/ARCHITECTURE.md',
  'docs/CONTENT.md',
  'docs/PRODUCT.md',
  'docs/START_HERE.md',
  'docs/CONVENTIONS.md',
  'docs/EVALUATION_PROTOCOL.md',
  'docs/RELEASE.md',
  'docs/prompts/LEARNER_AUDIT_PROMPT.md'
]
const REMOVED_PROMPTS = [
  'IMPROVEMENT_PROMPT',
  'UX_RESEARCH_REFACTOR_PROMPT',
  'LEARNING_FEATURE_RESEARCH_PROMPT',
  'CURRICULUM_RESEARCH_PROMPT'
]
/** Topics the README and product doc must state so the offline promise matches what the app does. */
const OFFLINE_TOPICS = [
  ['service worker', /service worker/i],
  ['lần mở đầu cần mạng', /lần mở đầu[^.]*mạng|mạng[^.]*lần mở đầu/i],
  ['lưu trữ bền vững', /lưu trữ bền vững|storage\.persist/i],
  ['backup định kỳ', /backup định kỳ/i],
  ['giọng TTS của máy', /(TTS|Web Speech)[^.]*(giọng|voice)[^.]*(máy|thiết bị)/i]
]
const OFFLINE_DOCS = ['README.md', 'docs/PRODUCT.md']

const LINK_PATTERN = /\[[^\]]*\]\(([^)\s]+)\)/g

function listMarkdown(dir, root) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return listMarkdown(path, root)
    return name.endsWith('.md') ? [relative(root, path).replaceAll('\\', '/')] : []
  })
}

/** Markdown files that describe the project as it is now (CHANGELOG is history and is excluded). */
function livingDocs(root) {
  const rootDocs = ['README.md', 'AGENTS.md'].filter((name) => existsSync(join(root, name)))
  return [...rootDocs, ...listMarkdown(join(root, 'docs'), root)]
}

function countMissionFiles(root) {
  const dir = join(root, 'content', 'missions')
  if (!existsSync(dir)) return null
  let count = 0
  const walk = (current) => {
    for (const name of readdirSync(current)) {
      const path = join(current, name)
      if (statSync(path).isDirectory()) walk(path)
      else if (name.endsWith('.json')) count += 1
    }
  }
  walk(dir)
  return count
}

/** Trả về danh sách lỗi; mảng rỗng nghĩa là bố cục và nội dung tài liệu hợp lệ. */
export function checkDocsLayout(root) {
  const errors = []

  const rootMarkdown = readdirSync(root).filter((name) => name.endsWith('.md'))
  for (const name of rootMarkdown) {
    if (!ROOT_MARKDOWN.includes(name)) errors.push(`Tài liệu ${name} phải nằm trong docs/`)
  }
  for (const doc of REQUIRED_DOCS) {
    if (!existsSync(join(root, doc))) errors.push(`Thiếu ${doc}`)
  }

  const docs = livingDocs(root)
  for (const file of docs) {
    const text = readFileSync(join(root, file), 'utf8')
    for (const match of text.matchAll(LINK_PATTERN)) {
      const target = match[1].split('#')[0]
      if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue
      if (!existsSync(resolve(root, dirname(file), target))) {
        errors.push(`Link gãy trong ${file}: ${match[1]}`)
      }
    }
    for (const prompt of REMOVED_PROMPTS) {
      if (text.includes(prompt)) errors.push(`${file} còn nhắc ${prompt}, prompt đã bị xóa`)
    }
    if (text.includes('check-changelog-rule') && /check-changelog-rule(?!\.mjs)/.test(text)) {
      errors.push(`${file} nhắc check-changelog-rule không có đuôi .mjs`)
    }
  }
  for (const prompt of REMOVED_PROMPTS) {
    if (existsSync(join(root, `${prompt}.md`))) errors.push(`${prompt}.md phải bị xóa`)
  }

  for (const file of OFFLINE_DOCS) {
    if (!existsSync(join(root, file))) continue
    const text = readFileSync(join(root, file), 'utf8')
    for (const [label, pattern] of OFFLINE_TOPICS) {
      if (!pattern.test(text)) errors.push(file + ' thiếu chủ đề offline: ' + label)
    }
  }

  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const changelogScript = manifest.scripts?.['check:changelog']
  if (!changelogScript?.includes('scripts/check-changelog-rule.mjs')) {
    errors.push('package.json thiếu script check:changelog trỏ tới scripts/check-changelog-rule.mjs')
  }

  const changelogPath = join(root, 'CHANGELOG.md')
  if (existsSync(changelogPath)) {
    const headings = readFileSync(changelogPath, 'utf8').split(/\r?\n/u).filter((line) => line.startsWith('## ['))
    if (headings[0] !== '## [Unreleased]') errors.push('CHANGELOG.md phải có ## [Unreleased] ở đầu lịch sử')
  }

  const product = join(root, 'docs/PRODUCT.md')
  if (existsSync(product) && /streak/i.test(readFileSync(product, 'utf8'))) {
    errors.push('docs/PRODUCT.md nhắc streak nhưng app không có streak')
  }

  const missions = countMissionFiles(root)
  if (missions !== null) {
    for (const file of docs.filter((name) => ['README.md', 'docs/CONTENT.md', 'docs/ARCHITECTURE.md'].includes(name))) {
      const text = readFileSync(join(root, file), 'utf8')
      if (/six mission|6 mission(?! v3)/i.test(text)) errors.push(`${file} còn số mission cũ`)
      const claims = [...text.matchAll(/\b(\d+|mười hai)\s+mission/giu)].map((m) => (m[1].toLowerCase() === 'mười hai' ? 12 : Number(m[1])))
      for (const claim of claims) {
        if (claim !== missions) errors.push(`${file} nêu ${claim} mission nhưng repo có ${missions}`)
      }
    }
  }

  return errors
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = checkDocsLayout(resolve(fileURLToPath(new URL('..', import.meta.url))))
  if (errors.length > 0) {
    console.error(errors.join('\n'))
    process.exit(1)
  }
  console.log('Bố cục tài liệu hợp lệ.')
}
