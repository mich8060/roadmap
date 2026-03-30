import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import type { Connect } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const EVENT_POSITIONS_PATH = path.resolve(__dirname, 'event-positions.json')

function eventPositionsApiPlugin() {
  /** Skip full-reload when this file change came from our own PUT (auto-save). */
  let lastPositionsFileWriteByApiAt = 0

  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const pathname = req.url?.split('?')[0] ?? ''
    if (pathname !== '/api/event-positions') {
      next()
      return
    }

    res.setHeader('Content-Type', 'application/json')

    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }

    if (req.method === 'GET') {
      try {
        const raw = fs.readFileSync(EVENT_POSITIONS_PATH, 'utf-8')
        res.end(raw)
      } catch {
        res.end(
          JSON.stringify({
            updatedAt: null,
            positions: {},
            events: [],
          } satisfies {
            updatedAt: null
            positions: Record<string, unknown>
            events: unknown[]
          }),
        )
      }
      return
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body) as unknown
          if (typeof parsed !== 'object' || parsed === null) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid body' }))
            return
          }
          const rec = parsed as Record<string, unknown>
          const hasEvents = Array.isArray(rec.events)
          const hasPositions =
            'positions' in rec &&
            typeof rec.positions === 'object' &&
            rec.positions !== null
          if (!hasEvents && !hasPositions) {
            res.statusCode = 400
            res.end(
              JSON.stringify({
                error: 'Invalid body: expected events array and/or positions object',
              }),
            )
            return
          }
          lastPositionsFileWriteByApiAt = Date.now()
          try {
            fs.writeFileSync(
              EVENT_POSITIONS_PATH,
              `${JSON.stringify(parsed, null, 2)}\n`,
              'utf-8',
            )
          } catch (err) {
            res.statusCode = 500
            res.end(
              JSON.stringify({
                error: 'Failed to write event-positions.json',
                detail: err instanceof Error ? err.message : String(err),
              }),
            )
            return
          }
          res.end(JSON.stringify({ ok: true }))
        } catch {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
        }
      })
      return
    }

    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method not allowed' }))
  }

  return {
    name: 'event-positions-api',
    configureServer(server: import('vite').ViteDevServer) {
      try {
        server.watcher.add(EVENT_POSITIONS_PATH)
      } catch {
        /* missing file is ok until first save */
      }
      server.watcher.on('change', (file) => {
        if (path.resolve(file) !== EVENT_POSITIONS_PATH) return
        if (Date.now() - lastPositionsFileWriteByApiAt < 400) return
        server.hot.send({ type: 'full-reload', path: EVENT_POSITIONS_PATH })
      })
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server: import('vite').PreviewServer) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    eventPositionsApiPlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
