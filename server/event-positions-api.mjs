/**
 * JSON API for roadmap state (+ optional static dist/ for one-process deploy, e.g. Railway).
 *
 * Local dev: npm run dev:api  (port 3040, JSON at project root)
 * Railway: set PORT (injected), optional SERVE_STATIC=true, optional EVENT_POSITIONS_PATH for a volume.
 */
import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const EVENT_POSITIONS_PATH =
  process.env.EVENT_POSITIONS_PATH ||
  path.join(ROOT, 'event-positions.json')
const PORT = Number(
  process.env.PORT || process.env.EVENT_POSITIONS_API_PORT || 3040,
)
const HOST = process.env.HOST || '0.0.0.0'
const SERVE_STATIC =
  process.env.SERVE_STATIC === '1' || process.env.SERVE_STATIC === 'true'

const app = express()

/**
 * CORS: Vercel (or any other origin) calling Railway directly.
 * - Omit `CORS_ORIGIN` or set `*` → Allow-Origin: * (simplest).
 * - Set `CORS_ORIGIN=https://your-app.vercel.app` (comma-separate multiple).
 */
app.use((req, res, next) => {
  const origin = req.headers.origin
  const configured = process.env.CORS_ORIGIN?.trim()
  if (!configured || configured === '*') {
    res.setHeader('Access-Control-Allow-Origin', '*')
  } else {
    const allowed = configured.split(',').map((s) => s.trim()).filter(Boolean)
    if (origin && allowed.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }
  next()
})

app.use(express.json({ limit: '10mb' }))

function emptyPayload() {
  return JSON.stringify({
    updatedAt: null,
    positions: {},
    events: [],
  })
}

app.get('/api/event-positions', (_req, res) => {
  res.setHeader('Content-Type', 'application/json')
  try {
    res.end(fs.readFileSync(EVENT_POSITIONS_PATH, 'utf-8'))
  } catch {
    res.end(emptyPayload())
  }
})

function handlePutPost(req, res) {
  res.setHeader('Content-Type', 'application/json')
  const parsed = req.body
  if (typeof parsed !== 'object' || parsed === null) {
    res.status(400).end(JSON.stringify({ error: 'Invalid body' }))
    return
  }
  const hasEvents = Array.isArray(parsed.events)
  const hasPositions =
    'positions' in parsed &&
    typeof parsed.positions === 'object' &&
    parsed.positions !== null
  if (!hasEvents && !hasPositions) {
    res.status(400).end(
      JSON.stringify({
        error: 'Invalid body: expected events array and/or positions object',
      }),
    )
    return
  }
  try {
    fs.writeFileSync(
      EVENT_POSITIONS_PATH,
      `${JSON.stringify(parsed, null, 2)}\n`,
      'utf-8',
    )
    res.end(JSON.stringify({ ok: true }))
  } catch (err) {
    res.status(500).end(
      JSON.stringify({
        error: 'Failed to write event-positions.json',
        detail: err instanceof Error ? err.message : String(err),
      }),
    )
  }
}

app.put('/api/event-positions', handlePutPost)
app.post('/api/event-positions', handlePutPost)

const DIST = path.join(ROOT, 'dist')
if (SERVE_STATIC && fs.existsSync(path.join(DIST, 'index.html'))) {
  app.use(express.static(DIST))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(DIST, 'index.html'))
  })
  console.log(`[event-positions] also serving static from ${DIST}`)
}

app.listen(PORT, HOST, () => {
  console.log(
    `[event-positions] listening http://${HOST}:${PORT}/api/event-positions`,
  )
})
