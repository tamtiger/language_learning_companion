import assert from 'node:assert/strict'

const test = process.env.VITEST
  ? (await import('vitest')).test
  : (await import('node:test')).default
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { checkRelease } from '../../scripts/check-release.mjs'

function fixture(overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), 'check-release-'))
  const files = {
    'package.json': JSON.stringify({ version: '2.0.1' }),
    'package-lock.json': JSON.stringify({ version: '2.0.1', packages: { '': { version: '2.0.1' } } }),
    'CHANGELOG.md': '## [Unreleased]\n\n## [2.0.1] - 2026-09-09\n\n- x\n',
    ...overrides
  }
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(join(root, dirname(name)), { recursive: true })
    writeFileSync(join(root, name), content)
  }
  return root
}

function resultFor(overrides) {
  const root = fixture(overrides)
  try {
    return checkRelease(root)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('repo hiện tại khớp version, lock và heading CHANGELOG', () => {
  const result = checkRelease(join(dirname(fileURLToPath(import.meta.url)), '..', '..'))
  assert.deepEqual(result.errors, [])
  assert.match(result.version, /^\d+\.\d+\.\d+/)
})

test('đọc version và ngày từ package.json và CHANGELOG, không hard-code', () => {
  const result = resultFor({})
  assert.deepEqual(result.errors, [])
  assert.equal(result.version, '2.0.1')
  assert.equal(result.heading, '## [2.0.1] - 2026-09-09')
})

test('báo lệch version giữa package.json và package-lock.json', () => {
  const lock = JSON.stringify({ version: '2.0.0', packages: { '': { version: '2.0.1' } } })
  assert.match(resultFor({ 'package-lock.json': lock }).errors.join('\n'), /Version mismatch/)
})

test('báo thiếu heading cho version hiện tại', () => {
  const result = resultFor({ 'CHANGELOG.md': '## [Unreleased]\n\n## [2.0.0] - 2026-09-01\n' })
  assert.match(result.errors.join('\n'), /Missing changelog heading for 2\.0\.1/)
})
