export type PlanName = 'Free' | 'Pro' | 'Team'

export type EventStatus = 'delivered' | 'failed' | 'pending' | 'throttled'

export type EndpointStatus = 'healthy' | 'degraded' | 'paused'

export type ReplayStatus = 'success' | 'failed' | 'queued'

export type UserProfile = {
  id: string
  email: string
  plan: PlanName
  createdAt: string
}

export type Endpoint = {
  id: string
  name: string
  sourceSlug: string
  targetUrl: string
  signingSecret: string
  status: EndpointStatus
  successRate: number
  p95Ms: number
  eventsToday: number
}

export type WebhookEvent = {
  id: string
  endpointId: string
  source: string
  eventType: string
  payloadJson: Record<string, unknown>
  status: EventStatus
  receivedAt: string
  attempts: number
  lastError?: string
}

export type RouteRule = {
  id: string
  endpointId: string
  name: string
  condition: string
  destinationUrl: string
  enabled: boolean
}

export type ApiKey = {
  id: string
  label: string
  prefix: string
  hashedKey: string
  createdAt: string
  revokedAt?: string
  usageLimit: number
}

export type ReplayRecord = {
  id: string
  eventId: string
  targetUrl: string
  status: ReplayStatus
  createdAt: string
  message: string
}

export type PlanConfig = {
  name: PlanName
  price: string
  eventLimit: number
  replayLimit: number
  routeLimit: number
  keyLimit: number
  retentionDays: number
  summary: string
}
