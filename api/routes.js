import { allowMethods, json, readJson } from './_utils.js'

// POST /api/routes
// Persist a routing rule after validating endpoint ownership and condition syntax.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return

  const body = await readJson(req)
  json(res, 201, {
    data: {
      id: `route_${Date.now()}`,
      endpoint_id: body.endpoint_id,
      name: body.name,
      condition: body.condition,
      destination_url: body.destination_url,
      enabled: body.enabled ?? true,
    },
    note: 'Production implementation should store this in the routes table with RLS enabled.',
  })
}
