import assert from 'node:assert/strict'

const test = process.env.VITEST
  ? (await import('vitest')).test
  : (await import('node:test')).default
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { checkDocsLayout } from '../../scripts/check-docs-layout.mjs'

const ADDING_LESSONS = [
  '# Thêm bài học',
  '1. Chọn capability và level.',
  '2. Tạo file đúng đường dẫn content/missions/<capability>/<lessonId>.json.',
  '3. Ghi provenance và sourceRegistry cho mọi nguồn.',
  '4. Chạy npx vitest run tests/content rồi npm test.'
].join('\n')

const OFFLINE_TOPICS = [
  'Service worker lưu sẵn app để mở lại khi offline.',
  'Lần mở đầu tiên cần có mạng.',
  'App xin lưu trữ bền vững (navigator.storage.persist) và nhắc xuất backup định kỳ.',
  'TTS dùng giọng của máy (Web Speech), một số giọng có thể cần mạng.'
].join(' ')

function fixture(overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), 'docs-layout-'))
  const files = {
    'README.md': '# App\n\n[Kiến trúc](./docs/ARCHITECTURE.md) · [Phát hành](./docs/RELEASE.md) · [Thêm bài](./docs/ADDING_LESSONS.md)\n\nCó 2 mission. ' + OFFLINE_TOPICS,
    'CHANGELOG.md': '# Changelog\n\n## [Unreleased]\n\n## [1.0.0] - 2026-01-01\n',
    'AGENTS.md': '# Agents\n',
    'docs/ARCHITECTURE.md': '# Kiến trúc\n\nXem [nội dung](./CONTENT.md).\n',
    'docs/CONTENT.md': '# Nội dung\n\nHai mission. Xem [thêm bài](./ADDING_LESSONS.md).\n',
    'docs/PRODUCT.md': '# Sản phẩm\n\n' + OFFLINE_TOPICS + '\n',
    'docs/START_HERE.md': '# Bắt đầu\n',
    'docs/CONVENTIONS.md': '# Quy ước\n',
    'docs/EVALUATION_PROTOCOL.md': '# Đánh giá\n',
    'docs/RELEASE.md': '# Release\n\nChạy `scripts/check-changelog-rule.mjs`.\n',
    'docs/ADDING_LESSONS.md': ADDING_LESSONS + '\n',
    'docs/prompts/LEARNER_AUDIT_PROMPT.md': '# Audit\n',
    'content/missions/a/one.json': '{}',
    'content/missions/b/two.json': '{}',
    'package.json': JSON.stringify({ scripts: { 'check:changelog': 'node scripts/check-changelog-rule.mjs' } }),
    ...overrides
  }
  for (const [name, content] of Object.entries(files)) {
    if (content === null) continue
    mkdirSync(join(root, dirname(name)), { recursive: true })
    writeFileSync(join(root, name), content)
  }
  return root
}

function errorsFor(overrides) {
  const root = fixture(overrides)
  try {
    return checkDocsLayout(root).join('\n')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('repo hiện tại có bố cục và nội dung tài liệu hợp lệ', () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
  assert.deepEqual(checkDocsLayout(root), [])
})

test('fixture hợp lệ không có lỗi', () => {
  assert.equal(errorsFor({}), '')
})

test('báo tài liệu thừa ở root và tài liệu bắt buộc bị thiếu', () => {
  const errors = errorsFor({ 'ARCHITECTURE.md': '# cũ\n', 'docs/RELEASE.md': null })
  assert.match(errors, /ARCHITECTURE\.md phải nằm trong docs/)
  assert.match(errors, /Thiếu docs\/RELEASE\.md/)
})

test('báo link nội bộ gãy nhưng bỏ qua URL ngoài và neo', () => {
  const errors = errorsFor({
    'docs/ARCHITECTURE.md': '[gãy](./MISSING.md) [ngoài](https://example.com/x.md) [neo](#muc) [có neo](./CONTENT.md#a)\n'
  })
  assert.match(errors, /Link gãy trong docs\/ARCHITECTURE\.md: \.\/MISSING\.md/)
  assert.doesNotMatch(errors, /example\.com|#muc|CONTENT\.md#a/)
})

test('báo prompt đã xóa còn tồn tại hoặc còn được nhắc, nhưng CHANGELOG lịch sử thì được phép', () => {
  const errors = errorsFor({
    'IMPROVEMENT_PROMPT.md': '# cũ\n',
    'docs/CONTENT.md': 'Xem CURRICULUM_RESEARCH_PROMPT.md\n',
    'CHANGELOG.md': '## [Unreleased]\n\nThêm IMPROVEMENT_PROMPT.md\n'
  })
  assert.match(errors, /IMPROVEMENT_PROMPT\.md phải bị xóa/)
  assert.match(errors, /docs\/CONTENT\.md còn nhắc CURRICULUM_RESEARCH_PROMPT/)
  assert.doesNotMatch(errors, /CHANGELOG\.md còn nhắc/)
})

test('yêu cầu script check:changelog và tên script có đuôi .mjs', () => {
  const missingScript = errorsFor({ 'package.json': JSON.stringify({ scripts: {} }) })
  assert.match(missingScript, /thiếu script check:changelog/)
  const noExtension = errorsFor({ 'docs/RELEASE.md': 'Chạy scripts/check-changelog-rule\n' })
  assert.match(noExtension, /check-changelog-rule không có đuôi \.mjs/)
})

test('yêu cầu [Unreleased] ở đầu CHANGELOG và không nhắc streak', () => {
  assert.match(errorsFor({ 'CHANGELOG.md': '## [1.0.0] - 2026-01-01\n' }), /\[Unreleased\] ở đầu/)
  assert.match(errorsFor({ 'docs/PRODUCT.md': 'Có streak hằng ngày.\n' }), /nhắc streak/)
})

test('số mission nêu trong tài liệu phải khớp số file mission thật', () => {
  const errors = errorsFor({ 'README.md': 'Có 12 mission. ' + OFFLINE_TOPICS + '\n[ok](./docs/RELEASE.md)\n', 'docs/ARCHITECTURE.md': 'Gồm six mission flows.\n' })
  assert.match(errors, /README\.md nêu 12 mission nhưng repo có 2/)
  assert.match(errors, /docs\/ARCHITECTURE\.md còn số mission cũ/)
})

test('README và PRODUCT phải nêu đúng phạm vi offline, bền dữ liệu và TTS', () => {
  const errors = errorsFor({
    'README.md': '# App\n\n[Phát hành](./docs/RELEASE.md)\n\nChạy offline.',
    'docs/PRODUCT.md': '# Sản phẩm\n\nCó TTS.\n'
  })
  for (const file of ['README.md', 'docs/PRODUCT.md']) {
    assert.match(errors, new RegExp(file.replace('.', '\\.') + ' thiếu chủ đề offline: service worker'))
    assert.match(errors, new RegExp(file.replace('.', '\\.') + ' thiếu chủ đề offline: lần mở đầu cần mạng'))
    assert.match(errors, new RegExp(file.replace('.', '\\.') + ' thiếu chủ đề offline: lưu trữ bền vững'))
    assert.match(errors, new RegExp(file.replace('.', '\\.') + ' thiếu chủ đề offline: backup định kỳ'))
    assert.match(errors, new RegExp(file.replace('.', '\\.') + ' thiếu chủ đề offline: giọng TTS của máy'))
  }
})

test('hướng dẫn thêm bài phải tồn tại, đủ các bước và được README và CONTENT liên kết', () => {
  const missing = errorsFor({ 'docs/ADDING_LESSONS.md': null })
  assert.match(missing, /Thiếu docs\/ADDING_LESSONS\.md/)

  const thin = errorsFor({ 'docs/ADDING_LESSONS.md': '# Thêm bài học\n\nLàm đi.\n' })
  assert.match(thin, /ADDING_LESSONS\.md thiếu bước: đường dẫn file/)
  assert.match(thin, /ADDING_LESSONS\.md thiếu bước: provenance/)
  assert.match(thin, /ADDING_LESSONS\.md thiếu bước: lệnh kiểm/)

  const unlinked = errorsFor({
    'README.md': '# App\n\n[Phát hành](./docs/RELEASE.md)\n\nCó 2 mission. ' + OFFLINE_TOPICS,
    'docs/CONTENT.md': '# Nội dung\n\nHai mission.\n'
  })
  assert.match(unlinked, /README\.md không liên kết tới docs\/ADDING_LESSONS\.md/)
  assert.match(unlinked, /docs\/CONTENT\.md không liên kết tới ADDING_LESSONS\.md/)
})