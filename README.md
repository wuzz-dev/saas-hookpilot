# HookPilot

HookPilot is a calm webhook operations cockpit for indie SaaS teams to inspect, replay, filter, route, and rate-limit webhook events without buying an enterprise event gateway on day one.

## MVP Scope

- Marketing page with hero, proof band, feature grid, pricing, FAQ, CTA, and dark mode.
- Demo auth with local magic-link style profile state.
- Dashboard with event volume, failures, anomaly alerts, endpoint health, and usage limits.
- Webhook inbox with JSON payload search, status/source filters, detail view, copy action, and retry queue action.
- Replay simulator with target URL form, selected payload preview, and replay history.
- Routing rules builder with conditions such as `event.type == invoice.paid` and `amount > 10000`.
- API key manager with masked keys, create/revoke actions, usage limits, and production notes.
- Plan gating for Free, Pro, and Team limits.
- Serverless/API stubs for webhook receive, events, replay, routes, API keys, and Stripe webhook.

## Local Development

```bash
npm install
npm run dev
npm run build
```

The app stores demo data in `localStorage`. Clear the browser storage for the local site to reset seeded data.

## Environment

Copy `.env.example` to `.env` and fill values when connecting production services.

```bash
cp .env.example .env
```

Client variables use the `VITE_` prefix. Serverless variables should remain server-only.

## Supabase Production Shape

Recommended tables:

```sql
create table users (
  id uuid primary key,
  email text not null unique,
  plan text not null default 'Free',
  created_at timestamptz not null default now()
);

create table endpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  name text not null,
  source_slug text not null,
  target_url text not null,
  signing_secret text not null,
  status text not null default 'healthy'
);

create table events (
  id uuid primary key default gen_random_uuid(),
  endpoint_id uuid not null references endpoints(id),
  source text not null,
  event_type text not null,
  payload_json jsonb not null,
  status text not null,
  received_at timestamptz not null default now(),
  attempts integer not null default 0,
  last_error text
);

create table routes (
  id uuid primary key default gen_random_uuid(),
  endpoint_id uuid not null references endpoints(id),
  name text not null,
  condition text not null,
  destination_url text not null,
  enabled boolean not null default true
);

create table api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  label text not null,
  prefix text not null,
  hashed_key text not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null,
  status text not null
);
```

Enable row-level security and scope every query by authenticated `user_id`.

## Stripe Placeholder

Pricing represented in the demo:

- Free: 1,000 events/month.
- Pro: 100,000 events/month at `$19/month`.
- Team: 1,000,000 events/month at `$49/month`.

Production checkout should create Stripe Checkout sessions for `VITE_STRIPE_PRICE_PRO` and `VITE_STRIPE_PRICE_TEAM`. `api/stripe/webhook.js` is the placeholder for subscription updates.

## API Stubs

See `api/README.md`.

## Deployment

The GitHub Actions workflow builds the app on pushes to `main` and can deploy to Vercel from `workflow_dispatch` when these secrets are present:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Static output is generated in `dist`.

## Analytics Snippet

Add a privacy-friendly analytics provider after replacing the domain:

```html
<script defer data-domain="hookpilot.example.com" src="https://plausible.io/js/script.js"></script>
```

For Umami, use the hosted script URL and website ID from your Umami project instead.

## Launch Checklist

- Publish the production URL and verify Open Graph previews with LinkedIn, X/Twitter, and Slack.
- Post a technical launch note on Indie Hackers with screenshots of replay, routing, and anomaly alerts.
- Submit to Product Hunt with the positioning: "webhook replay and routing for indie SaaS teams."
- Share a practical webhook failure checklist in relevant Reddit communities before linking the product.
- Announce on X/Twitter with a short demo clip showing a failed Stripe event being replayed.
- Add a docs page with SDK snippets for Next.js, Express, Laravel, and Rails.
- Install Plausible or Umami and track `demo_started`, `event_replayed`, `route_created`, and `plan_upgraded` events.
