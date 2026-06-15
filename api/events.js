import { allowMethods, json } from './_utils.js'

// GET /api/events
// Replace the static response with a Supabase query scoped to the authenticated workspace.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return

  json(res, 200, {
    data: [],
    nextCursor: null,
    note: 'Connect Supabase and select events by user/workspace before production use.',
  })
}
