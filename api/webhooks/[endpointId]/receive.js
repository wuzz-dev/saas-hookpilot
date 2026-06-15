import { allowMethods, getQueryValue, json, readJson } from '../../_utils.js'

// POST /api/webhooks/:endpointId/receive
// Verify source signatures, store raw payloads, evaluate routes, and enqueue delivery jobs.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return

  const endpointId = getQueryValue(req, 'endpointId') ?? req.url.split('/').at(-2)
  const payload = await readJson(req)

  json(res, 202, {
    data: {
      id: `evt_${Date.now()}`,
      endpoint_id: endpointId,
      status: 'accepted',
      received_at: new Date().toISOString(),
      payload_preview: payload,
    },
    note: 'Production implementation should verify signing secrets before writing to events.',
  })
}
