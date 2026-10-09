import assert from 'node:assert/strict'

const test = process.env.VITEST
  ? (await import('vitest')).test
  : (await import('node:test')).default
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { MAX_CHUNK_BYTES, checkBundleSize } from '../../scripts/check-bundle-size.mjs'

function distWith(chunks) {
  const root = mkdtempSync(join(tmpdir(), 'bundle-size-'))
  if (chunks !== null) {
    mkdirSync(join(root, 'assets'), { recursive: true })
    for (const [name, bytes] of Object.entries(chunks)) writeFileSync(join(root, 'assets', name), Buffer.alloc(bytes))
  }
  return root
}

function check(chunks) {
  const root = distWith(chunks)
  try {
    return checkBundleSize(root)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('chấp nhận khi mọi chunk JS nhỏ hơn ngưỡng 500 kB', () => {
  assert.deepEqual(check({ 'index-a.js': 200_000, 'vendor-b.js': MAX_CHUNK_BYTES - 1, 'index-c.css': 900_000 }), [])
})

test('báo chunk JS vượt ngưỡng và bỏ qua file không phải JS', () => {
  const errors = check({ 'index-a.js': MAX_CHUNK_BYTES + 1, 'style.css': 2_000_000 }).join('\n')
  assert.match(errors, /index-a\.js/)
  assert.doesNotMatch(errors, /style\.css/)
})

test('báo lỗi rõ khi chưa build', () => {
  assert.match(check(null).join('\n'), /Chạy npm run build trước/)
})

test('báo lỗi khi build không có chunk JS nào', () => {
  assert.match(check({ 'style.css': 10 }).join('\n'), /Không có chunk JS/)
})
