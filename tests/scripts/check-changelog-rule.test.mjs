import assert from 'node:assert/strict'

const test = process.env.VITEST
  ? (await import('vitest')).test
  : (await import('node:test')).default
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { REQUIRED_STATEMENTS, checkChangelogRule } from '../../scripts/check-changelog-rule.mjs'

function fixture(overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), 'changelog-rule-'))
  const files = {
    'docs/RELEASE.md': `# Release\n\n${REQUIRED_STATEMENTS.join('\n')}\n`,
    'package.json': JSON.stringify({ version: '1.2.3' }),
    'package-lock.json': JSON.stringify({ version: '1.2.3', packages: { '': { version: '1.2.3' } } }),
    'CHANGELOG.md': '# Changelog\n\n## [Unreleased]\n\n## [1.2.3] - 2026-05-01\n\n### Fixed\n',
    ...overrides
  }
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(join(root, dirname(name)), { recursive: true })
    writeFileSync(join(root, name), content)
  }
  return root
}

function errorsFor(overrides) {
  const root = fixture(overrides)
  try {
    return checkChangelogRule(root).join('\n')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('repo hiện tại tuân thủ quy tắc changelog và version', () => {
  assert.deepEqual(checkChangelogRule(join(dirname(fileURLToPath(import.meta.url)), '..', '..')), [])
})

test('fixture hợp lệ không có lỗi', () => {
  assert.equal(errorsFor({}), '')
})

test('báo thiếu quy tắc trong docs/RELEASE.md', () => {
  const [first, ...rest] = REQUIRED_STATEMENTS
  assert.match(errorsFor({ 'docs/RELEASE.md': rest.join('\n') }), new RegExp(first.slice(0, 12)))
  assert.match(errorsFor({ 'docs/RELEASE.md': '' }), /Thiếu quy tắc/)
})

test('báo lệch version giữa package.json và package-lock.json', () => {
  const lock = JSON.stringify({ version: '1.2.4', packages: { '': { version: '1.2.3' } } })
  assert.match(errorsFor({ 'package-lock.json': lock }), /package-lock\.json chưa đồng bộ/)
})

test('báo release đầu tiên của CHANGELOG khác version hiện tại', () => {
  const errors = errorsFor({ 'CHANGELOG.md': '## [Unreleased]\n\n## [1.2.2] - 2026-04-01\n' })
  assert.match(errors, /Release mới nhất trong CHANGELOG\.md \(1\.2\.2\) không khớp package version 1\.2\.3/)
})

test('chấp nhận version pre-release và bỏ qua mục [Unreleased]', () => {
  const errors = errorsFor({
    'package.json': JSON.stringify({ version: '1.3.0-dev.1' }),
    'package-lock.json': JSON.stringify({ version: '1.3.0-dev.1', packages: { '': { version: '1.3.0-dev.1' } } }),
    'CHANGELOG.md': '## [Unreleased]\n\nChưa có.\n\n## [1.3.0-dev.1] - 2026-06-01\n'
  })
  assert.equal(errors, '')
})
