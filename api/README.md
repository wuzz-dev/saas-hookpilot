# HookPilot API Stubs

These files are Vercel-style serverless placeholders. The local Vite app runs without them, but they document the production integration points.

## Endpoints

- `POST /api/webhooks/:endpointId/receive` accepts a provider payload, verifies signatures, stores an event, evaluates routing rules, and queues fanout.
- `GET /api/events` returns workspace-scoped event rows with cursor pagination.
- `POST /api/events/:id/replay` loads a stored payload and queues a signed replay to a target URL.
- `POST /api/routes` validates and stores routing rules.
- `POST /api/api-keys` creates a raw key once, stores only a hash, and returns the secret to the caller.
- `POST /api/stripe/webhook` verifies Stripe events and updates subscription plan state.

## Production Wiring

Use Supabase Auth JWTs to identify `user_id`, enable row-level security on every table, and hash API keys before insert. Stripe webhooks must use the raw request body for signature verification.
