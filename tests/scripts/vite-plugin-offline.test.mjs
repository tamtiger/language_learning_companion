import assert from 'node:assert/strict'

const test = process.env.VITEST
  ? (await import('vitest')).test
  : (await import('node:test')).default
import vm from 'node:vm'

import { buildServiceWorker, offlinePlugin, precacheVersion } from '../../scripts/vite-plugin-offline.mjs'

const PRECACHE = ['/', '/index.html', '/assets/index-abc.js', '/assets/index-abc.css', '/manifest.webmanifest']

/** Runs the generated worker against fake service-worker globals and returns its handlers. */
function loadWorker({ cached = {}, existingCaches = [], network = async () => ({ ok: true, status: 200, clone() { return this }, tag: 'network' }) } = {}) {
  const handlers = {}
  const stores = new Map(existingCaches.map((name) => [name, new Map()]))
  const calls = { addAll: [], put: [], fetch: [], deleted: [], skipWaiting: 0, claim: 0 }
  const cacheFor = (name) => {
    if (!stores.has(name)) stores.set(name, new Map())
    const store = stores.get(name)
    for (const [url, value] of Object.entries(cached)) if (!store.has(url)) store.set(url, value)
    return {
      addAll: async (urls) => { calls.addAll.push(urls) },
      put: async (request, response) => { calls.put.push(typeof request === 'string' ? request : request.url); store.set(typeof request === 'string' ? request : request.url, response) },
      match: async (request) => store.get(typeof request === 'string' ? request : request.url)
    }
  }
  const self = {
    location: { origin: 'https://app.test' },
    addEventListener: (type, handler) => { handlers[type] = handler },
    skipWaiting: () => { calls.skipWaiting += 1; return Promise.resolve() },
    clients: { claim: () => { calls.claim += 1; return Promise.resolve() } }
  }
  const caches = {
    open: async (name) => cacheFor(name),
    keys: async () => [...stores.keys()],
    delete: async (name) => { calls.deleted.push(name); stores.delete(name); return true },
    match: async (request) => {
      for (const store of stores.values()) {
        const hit = store.get(typeof request === 'string' ? request : request.url)
        if (hit) return hit
      }
      return undefined
    }
  }
  const fetchFn = async (request) => { calls.fetch.push(request.url ?? request); return network(request) }
  return { handlers, calls, stores, sandbox: { self, caches, fetch: fetchFn, URL, Promise } }
}

function run(code, world) {
  vm.runInNewContext(code, world.sandbox)
  return world
}

function waitUntil(handler, event) {
  const waits = []
  handler({ ...event, waitUntil: (promise) => waits.push(promise) })
  return Promise.all(waits)
}

function fetchEvent(url, { method = 'GET', mode = 'cors' } = {}) {
  let response
  const event = { request: { url, method, mode }, respondWith: (value) => { response = Promise.resolve(value) } }
  return { event, get response() { return response } }
}

const source = buildServiceWorker({ version: 'v1', precache: PRECACHE })

test('install precaches the whole shell and activates immediately', async () => {
  const world = run(source, loadWorker())
  await waitUntil(world.handlers.install, {})

  assert.deepEqual(world.calls.addAll.map((urls) => [...urls]), [PRECACHE])
  assert.equal(world.calls.skipWaiting, 1)
})

test('activate removes caches of older versions and keeps the current one', async () => {
  const world = run(source, loadWorker({ existingCaches: ['companion-v0', 'companion-v1', 'unrelated'] }))
  await waitUntil(world.handlers.activate, {})

  assert.deepEqual(world.calls.deleted, ['companion-v0'])
  assert.equal(world.calls.claim, 1)
})

test('offline navigation falls back to the cached app shell', async () => {
  const shell = { tag: 'shell' }
  const world = run(source, loadWorker({ cached: { '/index.html': shell }, network: async () => { throw new TypeError('offline') } }))
  world.stores.set('companion-v1', new Map([['/index.html', shell]]))
  const request = fetchEvent('https://app.test/some/route', { mode: 'navigate' })

  world.handlers.fetch(request.event)

  assert.equal(await request.response, shell)
})

test('serves a cached asset without touching the network', async () => {
  const asset = { tag: 'asset' }
  const world = run(source, loadWorker())
  world.stores.set('companion-v1', new Map([['https://app.test/assets/index-abc.js', asset]]))
  const request = fetchEvent('https://app.test/assets/index-abc.js')

  world.handlers.fetch(request.event)

  assert.equal(await request.response, asset)
  assert.equal(world.calls.fetch.length, 0)
})

test('fetches an uncached same-origin asset and stores it', async () => {
  const world = run(source, loadWorker())
  await waitUntil(world.handlers.install, {})
  const request = fetchEvent('https://app.test/assets/late-chunk.js')

  world.handlers.fetch(request.event)
  const response = await request.response

  assert.equal(response.tag, 'network')
  assert.equal(world.calls.fetch.length, 1)
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.deepEqual(world.calls.put, ['https://app.test/assets/late-chunk.js'])
})

test('ignores non-GET requests and other origins', () => {
  const world = run(source, loadWorker())
  const post = fetchEvent('https://app.test/api', { method: 'POST' })
  const foreign = fetchEvent('https://cdn.example.com/lib.js')

  world.handlers.fetch(post.event)
  world.handlers.fetch(foreign.event)

  assert.equal(post.response, undefined)
  assert.equal(foreign.response, undefined)
})

test('the cache version follows the precache list', () => {
  assert.equal(precacheVersion(PRECACHE), precacheVersion([...PRECACHE]))
  assert.notEqual(precacheVersion(PRECACHE), precacheVersion([...PRECACHE, '/assets/new.js']))
  assert.equal(precacheVersion(PRECACHE), precacheVersion([...PRECACHE].reverse()))
})

test('the plugin emits sw.js from the bundle files plus static extras', () => {
  const plugin = offlinePlugin({ extra: ['/manifest.webmanifest', '/icon.svg'] })
  const emitted = []
  plugin.generateBundle.call({ emitFile: (file) => emitted.push(file) }, {}, {
    'assets/index-abc.js': { type: 'chunk', fileName: 'assets/index-abc.js' },
    'assets/index-abc.css': { type: 'asset', fileName: 'assets/index-abc.css' },
    'index.html': { type: 'asset', fileName: 'index.html' }
  })

  assert.equal(emitted.length, 1)
  assert.equal(emitted[0].fileName, 'sw.js')
  const code = String(emitted[0].source)
  for (const url of ['/assets/index-abc.js', '/assets/index-abc.css', '/index.html', '/', '/manifest.webmanifest', '/icon.svg']) {
    assert.ok(code.includes(JSON.stringify(url)), `sw.js should precache ${url}`)
  }
  assert.ok(!code.includes('"/sw.js"'), 'the worker must not precache itself')
})
