import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { offlinePlugin } from './scripts/vite-plugin-offline.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), offlinePlugin({ extra: ['/manifest.webmanifest', '/icon.svg', '/favicon.svg'] })],
  build: {
    rolldownOptions: {
      output: {
        // Keep third-party code and bundled lesson content out of the entry chunk so each
        // chunk stays under the 500 kB budget (content is split per capability so it can keep growing) enforced by scripts/check-bundle-size.mjs.
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /node_modules/ },
            { name: 'content-workplace', test: /[\\/]content[\\/]missions[\\/]workplace-communication[\\/].*\.json$/ },
            { name: 'content-reading', test: /[\\/]content[\\/]missions[\\/]technical-reading[\\/].*\.json$/ },
            { name: 'content-meetings', test: /[\\/]content[\\/]missions[\\/]international-meetings[\\/].*\.json$/ },
            { name: 'content-explanation', test: /[\\/]content[\\/]missions[\\/]technical-explanation[\\/].*\.json$/ },
            { name: 'content-interview', test: /[\\/]content[\\/]missions[\\/]international-interview[\\/].*\.json$/ },
            { name: 'content-learning', test: /[\\/]content[\\/]missions[\\/]technology-learning[\\/].*\.json$/ },
            { name: 'content-reference', test: /[\\/]content[\\/].*\.json$/ }
          ]
        }
      }
    }
  }
})
