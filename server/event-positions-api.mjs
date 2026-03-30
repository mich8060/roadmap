/**
 * Local API for reading/writing project-root event-positions.json.
 * Run via: npm run dev:api (or it starts with npm run dev).
 */
import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const EVENT_POSITIONS_PATH = path.join(ROOT, 'event-positions.json')
const PORT = Number(process.env.EVENT_POSITIONS_API_PORT || 3040)

const app = express()
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

app.listen(PORT, () => {
  console.log(`[event-positions] http://localhost:${PORT}/api/event-positions`)
})
