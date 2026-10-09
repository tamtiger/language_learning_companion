import assert from 'node:assert/strict'

const test = process.env.VITEST
  ? (await import('vitest')).test
  : (await import('node:test')).default
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { checkOfflineBuild } from '../../scripts/check-offline-build.mjs'

const MANIFEST = {
  name: 'English Companion',
  short_name: 'Companion',
  start_url: '/',
  display: 'standalone',
  icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }]
}

function dist(overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), 'offline-build-'))
  const files = {
    'index.html': '<link rel="manifest" href="/manifest.webmanifest"><div id="root"></div>',
    'assets/index-abc.js': 'console.log(1)',
    'assets/index-abc.css': 'body{}',
    'manifest.webmanifest': JSON.stringify(MANIFEST),
    'icon.svg': '<svg/>',
    'sw.js': 'const PRECACHE = ["/","/index.html","/assets/index-abc.js","/assets/index-abc.css","/manifest.webmanifest","/icon.svg"]',
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
  const root = dist(overrides)
  try {
    return checkOfflineBuild(root).join('\n')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('a complete offline build has no errors', () => {
  assert.equal(errorsFor({}), '')
})

test('the real build, when present, is complete', () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist')
  const errors = checkOfflineBuild(root)
  if (errors.some((error) => /Chạy npm run build trước/.test(error))) return
  assert.deepEqual(errors, [])
})

test('reports a missing build or service worker', () => {
  assert.match(errorsFor({ 'sw.js': null }), /Thiếu sw\.js/)
  assert.match(checkOfflineBuild('/definitely/not/here').join('\n'), /Chạy npm run build trước/)
})

test('reports an asset that is not precached', () => {
  const errors = errorsFor({ 'assets/late-chunk.js': 'x' })
  assert.match(errors, /assets\/late-chunk\.js không nằm trong precache/)
})

test('reports an invalid manifest', () => {
  assert.match(errorsFor({ 'manifest.webmanifest': '{not json' }), /manifest\.webmanifest không phải JSON/)
  assert.match(errorsFor({ 'manifest.webmanifest': JSON.stringify({ ...MANIFEST, icons: [] }) }), /icons/)
  assert.match(errorsFor({ 'manifest.webmanifest': JSON.stringify({ ...MANIFEST, start_url: undefined }) }), /start_url/)
  assert.match(errorsFor({ 'manifest.webmanifest': JSON.stringify({ ...MANIFEST, display: 'browser' }) }), /display/)
})

test('reports a manifest icon that was not built', () => {
  assert.match(errorsFor({ 'icon.svg': null }), /icon\.svg.*không có trong bản build/)
})

test('reports an index.html without the manifest link', () => {
  assert.match(errorsFor({ 'index.html': '<div id="root"></div>' }), /link tới manifest/)
})
