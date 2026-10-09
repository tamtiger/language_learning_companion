import { createHash } from 'node:crypto'

/** Short stable digest of the precache list, so the cache name changes whenever the shell does. */
export function precacheVersion(precache) {
  return createHash('sha256').update([...precache].sort().join('\n')).digest('hex').slice(0, 10)
}

/**
 * Source of a small offline service worker: precaches the app shell, serves navigations
 * network-first with the cached shell as fallback, and serves same-origin assets cache-first.
 */
export function buildServiceWorker({ version, precache }) {
  return `// Generated at build time. Do not edit.
const CACHE = ${JSON.stringify(`companion-${version}`)}
const PRECACHE = ${JSON.stringify(precache)}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('companion-') && key !== CACHE)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html')))
    return
  }

  event.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).then((response) => {
      if (response && response.ok) {
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(request, copy))
      }
      return response
    }))
  )
})
`
}

/**
 * Vite plugin that emits sw.js listing every file of the bundle plus the given static files.
 * @param {{ extra?: string[] }} [options]
 */
export function offlinePlugin({ extra = [] } = {}) {
  return {
    name: 'offline-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = Object.values(bundle).map((item) => `/${item.fileName}`).filter((url) => url !== '/sw.js')
      const precache = [...new Set(['/', '/index.html', ...files, ...extra])]
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: buildServiceWorker({ version: precacheVersion(precache), precache })
      })
    }
  }
}
