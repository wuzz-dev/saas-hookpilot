import { allowMethods, json, readJson } from './_utils.js'
import { randomUUID } from 'node:crypto'

// POST /api/api-keys
// Generate a raw key once, hash it server-side, and return only the secret on creation.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return

  const body = await readJson(req)
  const suffix = Math.random().toString(16).slice(2, 10)
  const rawKey = `hp_live_${suffix}_${randomUUID()}`

  json(res, 201, {
    data: {
      id: `key_${Date.now()}`,
      label: body.label ?? 'Untitled key',
      prefix: rawKey.slice(0, 12),
      secret: rawKey,
    },
    note: 'Hash secret with SHA-256 or Argon2id before storing. Never return it again.',
  })
}
