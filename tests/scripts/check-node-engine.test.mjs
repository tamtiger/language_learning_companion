import assert from 'node:assert/strict'

const test = process.env.VITEST
  ? (await import('vitest')).test
  : (await import('node:test')).default
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { checkNodeEngine } from '../../scripts/check-node-engine.mjs'

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'node-engine-'))
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(join(root, name, '..'), { recursive: true })
    writeFileSync(join(root, name), content)
  }
  return root
}

const validFiles = {
  'package.json': JSON.stringify({ engines: { node: '>=22.12.0' } }),
  '.nvmrc': '22\n',
  'README.md': 'Yêu cầu Node 22.12 trở lên.',
  'START_HERE.md': 'Cần Node 22.12 trở lên.'
}

test('repo hiện tại khai báo phiên bản Node nhất quán', () => {
  assert.deepEqual(checkNodeEngine(join(dirname(fileURLToPath(import.meta.url)), '..', '..')), [])
})

test('báo lỗi khi thiếu engines.node', () => {
  const root = fixture({ ...validFiles, 'package.json': JSON.stringify({}) })
  try {
    assert.match(checkNodeEngine(root).join('\n'), /engines\.node/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('báo lỗi khi thiếu .nvmrc', () => {
  const { ['.nvmrc']: _omit, ...files } = validFiles
  const root = fixture(files)
  try {
    assert.match(checkNodeEngine(root).join('\n'), /\.nvmrc/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('báo lỗi khi .nvmrc thấp hơn engines.node', () => {
  const root = fixture({ ...validFiles, '.nvmrc': '20\n' })
  try {
    assert.match(checkNodeEngine(root).join('\n'), /thấp hơn/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('báo lỗi khi README hoặc START_HERE không nhắc phiên bản Node', () => {
  const root = fixture({ ...validFiles, 'README.md': 'Không nói gì.' })
  try {
    assert.match(checkNodeEngine(root).join('\n'), /README\.md/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
