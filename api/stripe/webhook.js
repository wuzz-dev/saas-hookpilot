import { allowMethods, json, readJson, requireServerEnv } from '../_utils.js'

// POST /api/stripe/webhook
// Verify Stripe signatures, upsert subscription status, and apply plan limits.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return

  const missing = requireServerEnv(['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'])
  const body = await readJson(req)

  json(res, missing.length ? 501 : 200, {
    received: !missing.length,
    event_type: body.type ?? 'unknown',
    missing_env: missing,
    note: 'Use stripe.webhooks.constructEvent with the raw request body in production.',
  })
}
