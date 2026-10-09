import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Keep third-party code and bundled lesson content out of the entry chunk so each
        // chunk stays under the 500 kB budget enforced by scripts/check-bundle-size.mjs.
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /node_modules/ },
            { name: 'content', test: /[\\/]content[\\/].*\.json$/ }
          ]
        }
      }
    }
  }
})
