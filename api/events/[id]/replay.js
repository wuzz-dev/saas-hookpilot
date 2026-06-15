import { allowMethods, getQueryValue, json, readJson } from '../../_utils.js'

// POST /api/events/:id/replay
// Load the stored payload, sign the replay request, and send it to the provided target URL.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return

  const eventId = getQueryValue(req, 'id') ?? req.url.split('/').at(-2)
  const body = await readJson(req)

  json(res, 202, {
    data: {
      replay_id: `rep_${Date.now()}`,
      event_id: eventId,
      target_url: body.target_url,
      status: 'queued',
      queued_at: new Date().toISOString(),
    },
    note: 'Production implementation should enforce plan replay limits and record attempts.',
  })
}
