import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  Clock3,
  Code2,
  Copy,
  CreditCard,
  Database,
  Gauge,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Moon,
  Play,
  Plus,
  RefreshCcw,
  Route,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Sun,
  TableProperties,
  Trash2,
  UserRound,
  Webhook,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  planCatalog,
  seedApiKeys,
  seedEndpoints,
  seedEvents,
  seedReplays,
  seedRoutes,
} from './seed'
import type {
  ApiKey,
  Endpoint,
  EventStatus,
  PlanName,
  ReplayRecord,
  RouteRule,
  UserProfile,
  WebhookEvent,
} from './types'
import './App.css'

type Theme = 'dark' | 'light'
type AppView = 'marketing' | 'dashboard' | 'inbox' | 'replay' | 'routes' | 'keys' | 'pricing'

const appNav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inbox', label: 'Inbox', icon: TableProperties },
  { id: 'replay', label: 'Replay', icon: RefreshCcw },
  { id: 'routes', label: 'Rules', icon: Route },
  { id: 'keys', label: 'API keys', icon: KeyRound },
  { id: 'pricing', label: 'Plans', icon: CreditCard },
] satisfies Array<{ id: AppView; label: string; icon: typeof LayoutDashboard }>

const statusLabels: Record<EventStatus, string> = {
  delivered: 'Delivered',
  failed: 'Failed',
  pending: 'Pending',
  throttled: 'Throttled',
}

function useLocalState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)

    if (!stored) {
      return fallback
    }

    try {
      return JSON.parse(stored) as T
    } catch {
      return fallback
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function createId(prefix: string) {
  const random = Math.random().toString(16).slice(2, 8)
  return `${prefix}_${random}`
}

function getPlan(planName: PlanName) {
  return planCatalog.find((plan) => plan.name === planName) ?? planCatalog[0]
}

function getStatusTone(status: EventStatus) {
  if (status === 'delivered') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'throttled') return 'warning'
  return 'info'
}

function App() {
  const [theme, setTheme] = useLocalState<Theme>('hookpilot:theme', 'dark')
  const [view, setView] = useState<AppView>('marketing')
  const [profile, setProfile] = useLocalState<UserProfile | null>('hookpilot:profile', null)
  const [endpoints] = useLocalState<Endpoint[]>('hookpilot:endpoints', seedEndpoints)
  const [events, setEvents] = useLocalState<WebhookEvent[]>('hookpilot:events', seedEvents)
  const [routes, setRoutes] = useLocalState<RouteRule[]>('hookpilot:routes', seedRoutes)
  const [apiKeys, setApiKeys] = useLocalState<ApiKey[]>('hookpilot:apiKeys', seedApiKeys)
  const [replays, setReplays] = useLocalState<ReplayRecord[]>('hookpilot:replays', seedReplays)
  const [selectedEventId, setSelectedEventId] = useState(seedEvents[0]?.id ?? '')
  const [toast, setToast] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (toast) {
      const timer = window.setTimeout(() => setToast(''), 2400)
      return () => window.clearTimeout(timer)
    }
  }, [toast])

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events[0]
  const currentPlan = getPlan(profile?.plan ?? 'Free')
  const usageTotal = endpoints.reduce((sum, endpoint) => sum + endpoint.eventsToday, 0)
  const usagePercent = Math.min(100, Math.round((usageTotal / currentPlan.eventLimit) * 100))

  const handleLogin = (email: string, plan: PlanName = 'Free') => {
    setProfile({
      id: 'user_demo_founder',
      email,
      plan,
      createdAt: new Date().toISOString(),
    })
    setView('dashboard')
    setToast('Demo workspace opened')
  }

  const handlePlanChange = (plan: PlanName) => {
    if (!profile) {
      handleLogin('founder@hookpilot.dev', plan)
      return
    }

    setProfile({ ...profile, plan })
    setToast(`${plan} plan enabled for this demo`)
  }

  const handleLogout = () => {
    setProfile(null)
    setView('marketing')
    setToast('Signed out of demo workspace')
  }

  const copyText = async (text: string, label: string) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
    setToast(`${label} copied`)
  }

  return (
    <div className="site-shell">
      {view === 'marketing' ? (
        <MarketingPage
          theme={theme}
          profile={profile}
          onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onOpenApp={() => setView(profile ? 'dashboard' : 'dashboard')}
          onLogin={handleLogin}
          onPlanChange={handlePlanChange}
        />
      ) : (
        <AppWorkspace
          apiKeys={apiKeys}
          copyText={copyText}
          currentPlan={currentPlan}
          endpoints={endpoints}
          events={events}
          onAddKey={setApiKeys}
          onAddReplay={setReplays}
          onAddRoute={setRoutes}
          onEventUpdate={setEvents}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onPlanChange={handlePlanChange}
          onSelectEvent={setSelectedEventId}
          onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          profile={profile}
          replays={replays}
          routes={routes}
          selectedEvent={selectedEvent}
          setToast={setToast}
          theme={theme}
          usagePercent={usagePercent}
          usageTotal={usageTotal}
          view={view}
          onViewChange={setView}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

type MarketingProps = {
  theme: Theme
  profile: UserProfile | null
  onThemeToggle: () => void
  onOpenApp: () => void
  onLogin: (email: string, plan?: PlanName) => void
  onPlanChange: (plan: PlanName) => void
}

function MarketingPage({
  theme,
  profile,
  onThemeToggle,
  onOpenApp,
  onLogin,
  onPlanChange,
}: MarketingProps) {
  const [email, setEmail] = useState('founder@hookpilot.dev')

  const submitAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onLogin(email)
  }

  return (
    <main className="marketing">
      <nav className="marketing-nav">
        <button className="brand-button" type="button" onClick={onOpenApp}>
          <Webhook aria-hidden="true" />
          <span>HookPilot</span>
        </button>
        <div className="marketing-links" aria-label="Marketing navigation">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-actions">
          <IconButton
            label={theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
            onClick={onThemeToggle}
          >
            {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </IconButton>
          <button className="button ghost" type="button" onClick={onOpenApp}>
            {profile ? 'Open app' : 'Sign in'}
          </button>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-copy reveal">
          <div className="eyebrow">
            <Sparkles aria-hidden="true" />
            Webhook operations for indie SaaS
          </div>
          <h1>HookPilot</h1>
          <p className="hero-subtitle">
            A calm cockpit for inspecting webhook payloads, replaying failures, routing noisy
            events, and catching spikes before they burn through your API budget.
          </p>
          <div className="hero-actions">
            <form className="auth-strip" onSubmit={submitAuth}>
              <input
                aria-label="Email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="founder@company.com"
                type="email"
                value={email}
              />
              <button className="button primary" type="submit">
                <Zap aria-hidden="true" />
                Launch demo
              </button>
            </form>
            <button className="button quiet" type="button" onClick={() => onPlanChange('Pro')}>
              <BadgeCheck aria-hidden="true" />
              Try Pro workspace
            </button>
          </div>
          <div className="trust-row" aria-label="Product proof points">
            <span>Searchable JSON inbox</span>
            <span>Replay simulator</span>
            <span>Rate-limit guardrails</span>
          </div>
        </div>
        <HeroPreview />
      </section>

      <section className="proof-band" aria-label="Problem proof">
        <div>
          <span className="metric-large">400%</span>
          <p>API spike scenario modeled with burst detection, throttled event status, and replay logs.</p>
        </div>
        <div>
          <span className="metric-large">$19</span>
          <p>Pro placeholder plan for small teams that need production visibility without enterprise cost.</p>
        </div>
        <div>
          <span className="metric-large">1M</span>
          <p>Team event allowance represented in-app with clear Stripe and Supabase setup paths.</p>
        </div>
      </section>

      <section className="marketing-section" id="features">
        <SectionKicker icon={<Server aria-hidden="true" />} label="Core workflows" />
        <h2>Every webhook incident surface in one dense, readable console.</h2>
        <div className="feature-grid">
          {[
            {
              icon: <TableProperties aria-hidden="true" />,
              title: 'Inbox with context',
              text: 'Filter by source, status, retry count, and inspect full JSON payloads beside the event row.',
            },
            {
              icon: <RefreshCcw aria-hidden="true" />,
              title: 'Replay simulator',
              text: 'Send the selected payload to staging or production URLs and keep an audit trail of attempts.',
            },
            {
              icon: <Route aria-hidden="true" />,
              title: 'Routing rules',
              text: 'Model conditions such as event.type == invoice.paid or amount > 10000 with destination fanout.',
            },
            {
              icon: <KeyRound aria-hidden="true" />,
              title: 'API key manager',
              text: 'Create masked demo keys, revoke them, and preview per-plan usage limits.',
            },
            {
              icon: <Gauge aria-hidden="true" />,
              title: 'Anomaly cockpit',
              text: 'Watch endpoint health, failure trends, p95 latency, and throttled bursts from the dashboard.',
            },
            {
              icon: <ShieldCheck aria-hidden="true" />,
              title: 'Production placeholders',
              text: 'Supabase schema, Stripe webhook notes, and serverless endpoint stubs are documented.',
            },
          ].map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <PricingSection
        currentPlan={profile?.plan ?? 'Free'}
        onPlanChange={onPlanChange}
        showKicker
      />

      <section className="marketing-section faq-section" id="faq">
        <SectionKicker icon={<Code2 aria-hidden="true" />} label="FAQ" />
        <h2>Built as a local-first MVP with real product motion.</h2>
        <div className="faq-grid">
          {[
            {
              question: 'Does the demo actually replay events?',
              answer:
                'It records simulated replay attempts against the selected payload, target URL, and status. The API stub shows where a signed production request would run.',
            },
            {
              question: 'Where do Stripe and Supabase fit?',
              answer:
                'The app uses localStorage for the demo. README and .env.example document Supabase tables, Auth, Stripe checkout, and webhook secrets.',
            },
            {
              question: 'Can I test plan gating?',
              answer:
                'Yes. The pricing screen changes the demo plan and immediately updates route, replay, API key, retention, and usage-limit gates.',
            },
          ].map((item) => (
            <article className="faq-item" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div>
          <SectionKicker icon={<Webhook aria-hidden="true" />} label="Demo ready" />
          <h2>Open the cockpit and inspect the seeded incident stream.</h2>
        </div>
        <button className="button primary" type="button" onClick={onOpenApp}>
          <ArrowRight aria-hidden="true" />
          Enter HookPilot
        </button>
      </section>
    </main>
  )
}

function HeroPreview() {
  return (
    <figure className="hero-preview reveal delay-1" aria-label="HookPilot product preview">
      <div className="preview-toolbar">
        <span />
        <span />
        <span />
        <strong>Live webhook stream</strong>
      </div>
      <img
        className="preview-asset"
        src="/hookpilot-console.png"
        alt="HookPilot dashboard showing event volume, anomaly alerts, and webhook inbox rows"
      />
      <div className="preview-grid">
        <div className="preview-stat">
          <span>Events today</span>
          <strong>2,947</strong>
          <small>+18% from baseline</small>
        </div>
        <div className="preview-stat warning">
          <span>Failure rate</span>
          <strong>2.8%</strong>
          <small>Billing worker timeout</small>
        </div>
        <div className="preview-chart" aria-hidden="true">
          {[38, 52, 44, 72, 58, 88, 64, 76, 92, 70].map((height, index) => (
            <i key={`${height}-${index}`} style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="preview-events">
          {[
            ['invoice.paid', 'Delivered', 'success'],
            ['checkout.session.completed', 'Failed', 'danger'],
            ['issues.labeled', 'Throttled', 'warning'],
          ].map(([name, status, tone]) => (
            <div className="preview-row" key={name}>
              <span>{name}</span>
              <b className={`dot-text ${tone}`}>{status}</b>
            </div>
          ))}
        </div>
      </div>
    </figure>
  )
}

type AppWorkspaceProps = {
  apiKeys: ApiKey[]
  copyText: (text: string, label: string) => Promise<void>
  currentPlan: ReturnType<typeof getPlan>
  endpoints: Endpoint[]
  events: WebhookEvent[]
  onAddKey: (keys: ApiKey[]) => void
  onAddReplay: (replays: ReplayRecord[]) => void
  onAddRoute: (routes: RouteRule[]) => void
  onEventUpdate: (events: WebhookEvent[]) => void
  onLogin: (email: string, plan?: PlanName) => void
  onLogout: () => void
  onPlanChange: (plan: PlanName) => void
  onSelectEvent: (eventId: string) => void
  onThemeToggle: () => void
  profile: UserProfile | null
  replays: ReplayRecord[]
  routes: RouteRule[]
  selectedEvent: WebhookEvent
  setToast: (message: string) => void
  theme: Theme
  usagePercent: number
  usageTotal: number
  view: AppView
  onViewChange: (view: AppView) => void
}

function AppWorkspace(props: AppWorkspaceProps) {
  const {
    apiKeys,
    copyText,
    currentPlan,
    endpoints,
    events,
    onAddKey,
    onAddReplay,
    onAddRoute,
    onEventUpdate,
    onLogin,
    onLogout,
    onPlanChange,
    onSelectEvent,
    onThemeToggle,
    profile,
    replays,
    routes,
    selectedEvent,
    setToast,
    theme,
    usagePercent,
    usageTotal,
    view,
    onViewChange,
  } = props

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <button className="brand-button app-brand" type="button" onClick={() => onViewChange('dashboard')}>
          <Webhook aria-hidden="true" />
          <span>HookPilot</span>
        </button>
        <nav className="app-nav" aria-label="Application navigation">
          {appNav.map((item) => {
            const Icon = item.icon
            return (
              <button
                className={view === item.id ? 'active' : ''}
                key={item.id}
                onClick={() => onViewChange(item.id)}
                type="button"
              >
                <Icon aria-hidden="true" />
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="usage-panel">
          <div className="usage-heading">
            <span>{currentPlan.name} usage</span>
            <strong>{usagePercent}%</strong>
          </div>
          <div className="meter">
            <span style={{ width: `${usagePercent}%` }} />
          </div>
          <p>
            {formatNumber(usageTotal)} of {formatNumber(currentPlan.eventLimit)} events this month
          </p>
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-topbar">
          <div>
            <span className="workspace-kicker">Acme Cloud demo</span>
            <h1>{view === 'pricing' ? 'Plans and limits' : appNav.find((item) => item.id === view)?.label}</h1>
          </div>
          <div className="topbar-actions">
            <IconButton
              label={theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
              onClick={onThemeToggle}
            >
              {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </IconButton>
            {profile ? (
              <>
                <div className="profile-chip">
                  <UserRound aria-hidden="true" />
                  <span>{profile.email}</span>
                  <b>{profile.plan}</b>
                </div>
                <IconButton label="Sign out" onClick={onLogout}>
                  <LogOut aria-hidden="true" />
                </IconButton>
              </>
            ) : null}
          </div>
        </header>

        {!profile ? (
          <AuthPanel onLogin={onLogin} />
        ) : (
          <>
            {view === 'dashboard' && (
              <DashboardView
                currentPlan={currentPlan}
                endpoints={endpoints}
                events={events}
                routes={routes}
                usageTotal={usageTotal}
              />
            )}
            {view === 'inbox' && (
              <InboxView
                copyText={copyText}
                endpoints={endpoints}
                events={events}
                onEventUpdate={onEventUpdate}
                onSelectEvent={onSelectEvent}
                selectedEvent={selectedEvent}
                setToast={setToast}
              />
            )}
            {view === 'replay' && (
              <ReplayView
                currentPlan={currentPlan}
                events={events}
                onAddReplay={onAddReplay}
                replays={replays}
                selectedEvent={selectedEvent}
                setToast={setToast}
              />
            )}
            {view === 'routes' && (
              <RoutesView
                currentPlan={currentPlan}
                endpoints={endpoints}
                onAddRoute={onAddRoute}
                routes={routes}
                setToast={setToast}
              />
            )}
            {view === 'keys' && (
              <KeysView
                apiKeys={apiKeys}
                copyText={copyText}
                currentPlan={currentPlan}
                onAddKey={onAddKey}
                setToast={setToast}
              />
            )}
            {view === 'pricing' && (
              <PricingSection currentPlan={profile.plan} onPlanChange={onPlanChange} />
            )}
          </>
        )}
      </main>
    </div>
  )
}

function AuthPanel({ onLogin }: { onLogin: (email: string, plan?: PlanName) => void }) {
  const [email, setEmail] = useState('founder@hookpilot.dev')

  const submitAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onLogin(email)
  }

  return (
    <section className="auth-panel reveal">
      <div>
        <SectionKicker icon={<ShieldCheck aria-hidden="true" />} label="Demo auth" />
        <h2>Open a local magic-link workspace.</h2>
        <p>
          The profile is stored in localStorage and mirrors the Supabase Auth flow documented in
          the project README.
        </p>
      </div>
      <form className="auth-card" onSubmit={submitAuth}>
        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
        <button className="button primary" type="submit">
          <Zap aria-hidden="true" />
          Continue
        </button>
      </form>
    </section>
  )
}

type DashboardProps = {
  currentPlan: ReturnType<typeof getPlan>
  endpoints: Endpoint[]
  events: WebhookEvent[]
  routes: RouteRule[]
  usageTotal: number
}

function DashboardView({ currentPlan, endpoints, events, routes, usageTotal }: DashboardProps) {
  const failed = events.filter((event) => event.status === 'failed').length
  const throttled = events.filter((event) => event.status === 'throttled').length
  const healthyEndpoints = endpoints.filter((endpoint) => endpoint.status === 'healthy').length
  const dailyVolume = [320, 418, 390, 512, 641, 590, 734, 881, 768, 1040, 1188, 947]
  const maxVolume = Math.max(...dailyVolume)

  return (
    <div className="view-stack reveal">
      <section className="metrics-grid">
        <MetricCard
          icon={<Activity aria-hidden="true" />}
          label="Event volume"
          tone="info"
          value={formatNumber(usageTotal)}
          detail={`${formatNumber(currentPlan.eventLimit)} monthly limit`}
        />
        <MetricCard
          icon={<AlertTriangle aria-hidden="true" />}
          label="Failures"
          tone={failed ? 'danger' : 'success'}
          value={`${failed}`}
          detail="1 active billing timeout"
        />
        <MetricCard
          icon={<Gauge aria-hidden="true" />}
          label="Endpoint health"
          tone="success"
          value={`${healthyEndpoints}/${endpoints.length}`}
          detail="2 healthy, 1 degraded, 1 paused"
        />
        <MetricCard
          icon={<Route aria-hidden="true" />}
          label="Routing rules"
          tone="warning"
          value={`${routes.filter((route) => route.enabled).length}`}
          detail={`${throttled} throttled burst in inbox`}
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel chart-panel">
          <SectionHeader
            icon={<BarChart3 aria-hidden="true" />}
            title="Event trend"
            subtitle="Hourly ingest with a visible retry spike"
          />
          <div className="bar-chart" aria-label="Hourly event volume">
            {dailyVolume.map((value, index) => (
              <div className="bar-column" key={`${value}-${index}`}>
                <span style={{ height: `${Math.round((value / maxVolume) * 100)}%` }} />
                <small>{index + 1}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="panel alert-panel">
          <SectionHeader
            icon={<BellIcon />}
            title="Anomaly alerts"
            subtitle="Signals from seeded production traffic"
          />
          <div className="alert-list">
            <div className="alert-item danger">
              <AlertTriangle aria-hidden="true" />
              <div>
                <strong>Billing worker timeout</strong>
                <span>checkout.session.completed failed 3 times in the last 10 minutes.</span>
              </div>
            </div>
            <div className="alert-item warning">
              <Zap aria-hidden="true" />
              <div>
                <strong>Potential webhook loop</strong>
                <span>GitHub issues.labeled burst reached 240 events/minute.</span>
              </div>
            </div>
            <div className="alert-item success">
              <Check aria-hidden="true" />
              <div>
                <strong>Stripe recovery replayed</strong>
                <span>Staging replay returned 200 OK in 218ms.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionHeader
          icon={<Server aria-hidden="true" />}
          title="Endpoint health"
          subtitle="Production receive URLs and p95 latency"
        />
        <div className="endpoint-grid">
          {endpoints.map((endpoint) => (
            <article className="endpoint-card" key={endpoint.id}>
              <div>
                <span className={`source-badge ${endpoint.sourceSlug}`}>{endpoint.sourceSlug}</span>
                <h3>{endpoint.name}</h3>
                <p>{endpoint.targetUrl}</p>
              </div>
              <div className="endpoint-metrics">
                <span>{endpoint.successRate}% success</span>
                <span>{endpoint.p95Ms}ms p95</span>
                <StatusBadge tone={endpoint.status === 'healthy' ? 'success' : endpoint.status === 'paused' ? 'muted' : 'warning'}>
                  {endpoint.status}
                </StatusBadge>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function BellIcon() {
  return <AlertTriangle aria-hidden="true" />
}

type InboxProps = {
  copyText: (text: string, label: string) => Promise<void>
  endpoints: Endpoint[]
  events: WebhookEvent[]
  onEventUpdate: (events: WebhookEvent[]) => void
  onSelectEvent: (eventId: string) => void
  selectedEvent: WebhookEvent
  setToast: (message: string) => void
}

function InboxView({
  copyText,
  endpoints,
  events,
  onEventUpdate,
  onSelectEvent,
  selectedEvent,
  setToast,
}: InboxProps) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState('all')

  const sources = useMemo(() => Array.from(new Set(events.map((event) => event.source))), [events])
  const endpointById = useMemo(
    () => new Map(endpoints.map((endpoint) => [endpoint.id, endpoint])),
    [endpoints],
  )

  const filteredEvents = events.filter((event) => {
    const payload = JSON.stringify(event.payloadJson).toLowerCase()
    const haystack = `${event.id} ${event.source} ${event.eventType} ${payload}`.toLowerCase()
    const matchesQuery = haystack.includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    const matchesSource = sourceFilter === 'all' || event.source === sourceFilter
    return matchesQuery && matchesStatus && matchesSource
  })

  const markForReplay = () => {
    onEventUpdate(
      events.map((event) =>
        event.id === selectedEvent.id
          ? {
              ...event,
              status: 'pending',
              attempts: event.attempts + 1,
              lastError: 'Queued manually from inbox detail',
            }
          : event,
      ),
    )
    setToast('Event queued for replay review')
  }

  return (
    <div className="view-stack reveal">
      <section className="panel filter-panel">
        <div className="search-box">
          <Search aria-hidden="true" />
          <input
            aria-label="Search webhook events"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search event id, source, type, or payload"
            type="search"
            value={query}
          />
        </div>
        <div className="segmented" aria-label="Status filter">
          {(['all', 'delivered', 'failed', 'pending', 'throttled'] as const).map((status) => (
            <button
              className={statusFilter === status ? 'active' : ''}
              key={status}
              onClick={() => setStatusFilter(status)}
              type="button"
            >
              {status === 'all' ? 'All' : statusLabels[status]}
            </button>
          ))}
        </div>
        <select
          aria-label="Source filter"
          onChange={(event) => setSourceFilter(event.target.value)}
          value={sourceFilter}
        >
          <option value="all">All sources</option>
          {sources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </section>

      <section className="inbox-grid">
        <div className="panel table-panel">
          <SectionHeader
            icon={<TableProperties aria-hidden="true" />}
            title="Webhook inbox"
            subtitle={`${filteredEvents.length} matching events`}
          />
          <div className="event-table" role="table" aria-label="Webhook events">
            <div className="event-row heading" role="row">
              <span>Event</span>
              <span>Source</span>
              <span>Status</span>
              <span>Attempts</span>
              <span>Received</span>
            </div>
            {filteredEvents.map((event) => (
              <button
                className={selectedEvent.id === event.id ? 'event-row selected' : 'event-row'}
                key={event.id}
                onClick={() => onSelectEvent(event.id)}
                role="row"
                type="button"
              >
                <span>
                  <b>{event.eventType}</b>
                  <small>{event.id}</small>
                </span>
                <span>{event.source}</span>
                <StatusBadge tone={getStatusTone(event.status)}>{statusLabels[event.status]}</StatusBadge>
                <span>{event.attempts}</span>
                <span>{formatDateTime(event.receivedAt)}</span>
              </button>
            ))}
          </div>
        </div>

        <aside className="panel detail-panel">
          <SectionHeader
            icon={<Code2 aria-hidden="true" />}
            title={selectedEvent.eventType}
            subtitle={endpointById.get(selectedEvent.endpointId)?.name ?? selectedEvent.source}
          />
          <div className="detail-actions">
            <StatusBadge tone={getStatusTone(selectedEvent.status)}>
              {statusLabels[selectedEvent.status]}
            </StatusBadge>
            <button
              className="icon-text-button"
              onClick={() => copyText(JSON.stringify(selectedEvent.payloadJson, null, 2), 'Payload')}
              type="button"
            >
              <Copy aria-hidden="true" />
              Copy JSON
            </button>
            <button className="icon-text-button" onClick={markForReplay} type="button">
              <RefreshCcw aria-hidden="true" />
              Queue
            </button>
          </div>
          {selectedEvent.lastError && (
            <div className="inline-alert danger">
              <AlertTriangle aria-hidden="true" />
              <span>{selectedEvent.lastError}</span>
            </div>
          )}
          <CodeBlock value={selectedEvent.payloadJson} />
        </aside>
      </section>
    </div>
  )
}

type ReplayProps = {
  currentPlan: ReturnType<typeof getPlan>
  events: WebhookEvent[]
  onAddReplay: (replays: ReplayRecord[]) => void
  replays: ReplayRecord[]
  selectedEvent: WebhookEvent
  setToast: (message: string) => void
}

function ReplayView({ currentPlan, events, onAddReplay, replays, selectedEvent, setToast }: ReplayProps) {
  const [eventId, setEventId] = useState(selectedEvent.id)
  const [targetUrl, setTargetUrl] = useState('https://staging.acme.dev/webhooks/stripe')
  const eventForReplay = events.find((event) => event.id === eventId) ?? selectedEvent
  const replayUsagePercent = Math.min(100, Math.round((replays.length / currentPlan.replayLimit) * 100))

  const submitReplay = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (replays.length >= currentPlan.replayLimit) {
      setToast(`${currentPlan.name} replay limit reached`)
      return
    }

    const failed = targetUrl.includes('fail') || targetUrl.includes('timeout')
    const record: ReplayRecord = {
      id: createId('rep'),
      eventId: eventForReplay.id,
      targetUrl,
      status: failed ? 'failed' : 'success',
      createdAt: new Date().toISOString(),
      message: failed ? '502 simulated downstream failure' : '200 OK simulated in 184ms',
    }
    onAddReplay([record, ...replays])
    setToast(failed ? 'Replay failed in simulator' : 'Replay completed')
  }

  return (
    <div className="view-stack reveal">
      <FeatureGate
        detail={`${formatNumber(replays.length)} of ${formatNumber(currentPlan.replayLimit)} replay slots used`}
        percent={replayUsagePercent}
        title={`${currentPlan.name} replay allowance`}
      />
      <section className="replay-grid">
        <form className="panel form-panel" onSubmit={submitReplay}>
          <SectionHeader
            icon={<Play aria-hidden="true" />}
            title="Replay simulator"
            subtitle="Send one stored payload to a target endpoint"
          />
          <label htmlFor="replay-event">Payload</label>
          <select id="replay-event" onChange={(event) => setEventId(event.target.value)} value={eventId}>
            {events.map((item) => (
              <option key={item.id} value={item.id}>
                {item.eventType} · {item.id}
              </option>
            ))}
          </select>
          <label htmlFor="target-url">Target URL</label>
          <input
            id="target-url"
            onChange={(event) => setTargetUrl(event.target.value)}
            type="url"
            value={targetUrl}
          />
          <button className="button primary" type="submit">
            <Play aria-hidden="true" />
            Run replay
          </button>
        </form>

        <div className="panel">
          <SectionHeader
            icon={<Code2 aria-hidden="true" />}
            title="Selected payload"
            subtitle={`${eventForReplay.source} · ${eventForReplay.eventType}`}
          />
          <CodeBlock value={eventForReplay.payloadJson} />
        </div>
      </section>

      <section className="panel">
        <SectionHeader
          icon={<Clock3 aria-hidden="true" />}
          title="Replay history"
          subtitle="Local audit trail for this demo workspace"
        />
        <div className="history-list">
          {replays.map((replay) => {
            const sourceEvent = events.find((item) => item.id === replay.eventId)
            return (
              <article className="history-item" key={replay.id}>
                <div>
                  <strong>{sourceEvent?.eventType ?? replay.eventId}</strong>
                  <span>{replay.targetUrl}</span>
                </div>
                <StatusBadge tone={replay.status === 'success' ? 'success' : replay.status === 'queued' ? 'info' : 'danger'}>
                  {replay.status}
                </StatusBadge>
                <span>{replay.message}</span>
                <time>{formatDateTime(replay.createdAt)}</time>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

type RoutesProps = {
  currentPlan: ReturnType<typeof getPlan>
  endpoints: Endpoint[]
  onAddRoute: (routes: RouteRule[]) => void
  routes: RouteRule[]
  setToast: (message: string) => void
}

function RoutesView({ currentPlan, endpoints, onAddRoute, routes, setToast }: RoutesProps) {
  const [name, setName] = useState('Large invoice guard')
  const [condition, setCondition] = useState('event.type == invoice.paid && amount > 10000')
  const [destinationUrl, setDestinationUrl] = useState('https://api.acme.dev/revenue/high-value')
  const [endpointId, setEndpointId] = useState(endpoints[0]?.id ?? '')
  const activeRoutes = routes.filter((route) => route.enabled).length
  const routeUsagePercent = Math.min(100, Math.round((routes.length / currentPlan.routeLimit) * 100))

  const submitRule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (routes.length >= currentPlan.routeLimit) {
      setToast(`${currentPlan.name} route limit reached`)
      return
    }

    const route: RouteRule = {
      id: createId('route'),
      endpointId,
      name,
      condition,
      destinationUrl,
      enabled: true,
    }
    onAddRoute([route, ...routes])
    setToast('Routing rule created')
  }

  const toggleRoute = (routeId: string) => {
    onAddRoute(
      routes.map((route) =>
        route.id === routeId ? { ...route, enabled: !route.enabled } : route,
      ),
    )
  }

  return (
    <div className="view-stack reveal">
      <FeatureGate
        detail={`${routes.length} of ${currentPlan.routeLimit} rules configured · ${activeRoutes} active`}
        percent={routeUsagePercent}
        title={`${currentPlan.name} routing capacity`}
      />
      <section className="rules-grid">
        <form className="panel form-panel" onSubmit={submitRule}>
          <SectionHeader
            icon={<Route aria-hidden="true" />}
            title="Rule builder"
            subtitle="Condition syntax preview for serverless routing"
          />
          <label htmlFor="rule-name">Name</label>
          <input id="rule-name" onChange={(event) => setName(event.target.value)} value={name} />
          <label htmlFor="rule-endpoint">Endpoint</label>
          <select id="rule-endpoint" onChange={(event) => setEndpointId(event.target.value)} value={endpointId}>
            {endpoints.map((endpoint) => (
              <option key={endpoint.id} value={endpoint.id}>
                {endpoint.name}
              </option>
            ))}
          </select>
          <label htmlFor="rule-condition">Condition</label>
          <input
            id="rule-condition"
            onChange={(event) => setCondition(event.target.value)}
            value={condition}
          />
          <label htmlFor="rule-destination">Destination URL</label>
          <input
            id="rule-destination"
            onChange={(event) => setDestinationUrl(event.target.value)}
            type="url"
            value={destinationUrl}
          />
          <button className="button primary" type="submit">
            <Plus aria-hidden="true" />
            Add rule
          </button>
        </form>

        <div className="panel rule-examples">
          <SectionHeader
            icon={<Code2 aria-hidden="true" />}
            title="Condition examples"
            subtitle="Seeded expressions used by HookPilot"
          />
          {[
            'event.type == invoice.paid',
            'amount > 10000',
            'label.name == incident',
            'attempts >= 3 && status == failed',
          ].map((item) => (
            <code key={item}>{item}</code>
          ))}
        </div>
      </section>

      <section className="panel">
        <SectionHeader
          icon={<Database aria-hidden="true" />}
          title="Active routes"
          subtitle="Toggle fanout without deleting rule history"
        />
        <div className="route-list">
          {routes.map((route) => (
            <article className="route-item" key={route.id}>
              <div>
                <strong>{route.name}</strong>
                <span>{route.condition}</span>
                <small>{route.destinationUrl}</small>
              </div>
              <button
                className={route.enabled ? 'toggle active' : 'toggle'}
                onClick={() => toggleRoute(route.id)}
                type="button"
              >
                <span />
                {route.enabled ? 'Enabled' : 'Paused'}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

type KeysProps = {
  apiKeys: ApiKey[]
  copyText: (text: string, label: string) => Promise<void>
  currentPlan: ReturnType<typeof getPlan>
  onAddKey: (keys: ApiKey[]) => void
  setToast: (message: string) => void
}

function KeysView({ apiKeys, copyText, currentPlan, onAddKey, setToast }: KeysProps) {
  const [label, setLabel] = useState('Webhook ingest worker')
  const activeKeys = apiKeys.filter((key) => !key.revokedAt)
  const keyUsagePercent = Math.min(100, Math.round((activeKeys.length / currentPlan.keyLimit) * 100))

  const createKey = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (activeKeys.length >= currentPlan.keyLimit) {
      setToast(`${currentPlan.name} active key limit reached`)
      return
    }

    const suffix = Math.random().toString(16).slice(2, 6)
    const key: ApiKey = {
      id: createId('key'),
      label,
      prefix: `hp_live_${suffix}`,
      hashedKey: `sha256:${Math.random().toString(16).slice(2, 18)}`,
      createdAt: new Date().toISOString(),
      usageLimit: currentPlan.eventLimit,
    }
    onAddKey([key, ...apiKeys])
    setToast('API key created')
  }

  const revokeKey = (keyId: string) => {
    onAddKey(
      apiKeys.map((key) =>
        key.id === keyId ? { ...key, revokedAt: new Date().toISOString() } : key,
      ),
    )
    setToast('API key revoked')
  }

  return (
    <div className="view-stack reveal">
      <FeatureGate
        detail={`${activeKeys.length} of ${currentPlan.keyLimit} active keys · ${formatNumber(currentPlan.eventLimit)} events per key`}
        percent={keyUsagePercent}
        title={`${currentPlan.name} API key allowance`}
      />
      <section className="keys-grid">
        <form className="panel form-panel" onSubmit={createKey}>
          <SectionHeader
            icon={<KeyRound aria-hidden="true" />}
            title="Create API key"
            subtitle="Generated locally with masked display"
          />
          <label htmlFor="key-label">Label</label>
          <input id="key-label" onChange={(event) => setLabel(event.target.value)} value={label} />
          <button className="button primary" type="submit">
            <Plus aria-hidden="true" />
            Create key
          </button>
        </form>

        <div className="panel">
          <SectionHeader
            icon={<ShieldCheck aria-hidden="true" />}
            title="Production notes"
            subtitle="Recommended storage and signing model"
          />
          <ul className="check-list">
            <li>
              <Check aria-hidden="true" />
              Hash keys before storing in Supabase.
            </li>
            <li>
              <Check aria-hidden="true" />
              Verify webhook signatures before routing.
            </li>
            <li>
              <Check aria-hidden="true" />
              Scope keys per workspace and endpoint.
            </li>
          </ul>
        </div>
      </section>

      <section className="panel">
        <SectionHeader
          icon={<Database aria-hidden="true" />}
          title="Keys"
          subtitle="Masked prefixes and usage limits"
        />
        <div className="key-list">
          {apiKeys.map((key) => (
            <article className="key-item" key={key.id}>
              <div>
                <strong>{key.label}</strong>
                <span>{key.prefix}••••••••••••</span>
                <small>{key.hashedKey}</small>
              </div>
              <span>{formatNumber(key.usageLimit)} events/mo</span>
              <StatusBadge tone={key.revokedAt ? 'muted' : 'success'}>
                {key.revokedAt ? 'revoked' : 'active'}
              </StatusBadge>
              <div className="row-actions">
                <IconButton label="Copy key prefix" onClick={() => copyText(key.prefix, 'Key prefix')}>
                  <Copy aria-hidden="true" />
                </IconButton>
                {!key.revokedAt && (
                  <IconButton label="Revoke key" onClick={() => revokeKey(key.id)}>
                    <Trash2 aria-hidden="true" />
                  </IconButton>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

type PricingProps = {
  currentPlan: PlanName
  onPlanChange: (plan: PlanName) => void
  showKicker?: boolean
}

function PricingSection({ currentPlan, onPlanChange, showKicker = false }: PricingProps) {
  return (
    <section className={showKicker ? 'marketing-section pricing-section' : 'pricing-section'}>
      {showKicker && <SectionKicker icon={<CreditCard aria-hidden="true" />} label="Pricing" />}
      <h2>Simple limits that map to real webhook volume.</h2>
      <div className="pricing-grid" id="pricing">
        {planCatalog.map((plan) => (
          <article className={currentPlan === plan.name ? 'price-card active' : 'price-card'} key={plan.name}>
            <div>
              <div className="price-heading">
                <h3>{plan.name}</h3>
                {currentPlan === plan.name && <StatusBadge tone="success">Current</StatusBadge>}
              </div>
              <p>{plan.summary}</p>
            </div>
            <div className="price">
              <strong>{plan.price}</strong>
              <span>/month</span>
            </div>
            <ul>
              <li>{formatNumber(plan.eventLimit)} events/month</li>
              <li>{formatNumber(plan.replayLimit)} replays/month</li>
              <li>{plan.routeLimit} routing rules</li>
              <li>{plan.keyLimit} active API keys</li>
              <li>{plan.retentionDays} day retention</li>
            </ul>
            <button
              className={currentPlan === plan.name ? 'button ghost' : 'button primary'}
              onClick={() => onPlanChange(plan.name)}
              type="button"
            >
              <CreditCard aria-hidden="true" />
              {currentPlan === plan.name ? 'Selected' : `Choose ${plan.name}`}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

function MetricCard({
  detail,
  icon,
  label,
  tone,
  value,
}: {
  detail: string
  icon: ReactNode
  label: string
  tone: 'success' | 'danger' | 'warning' | 'info'
  value: string
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  )
}

function SectionHeader({
  icon,
  subtitle,
  title,
}: {
  icon: ReactNode
  subtitle: string
  title: string
}) {
  return (
    <div className="section-header">
      <div className="section-icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}

function SectionKicker({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="section-kicker">
      {icon}
      {label}
    </div>
  )
}

function FeatureGate({
  detail,
  percent,
  title,
}: {
  detail: string
  percent: number
  title: string
}) {
  return (
    <section className="gate-panel">
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <div className="meter compact">
        <span style={{ width: `${percent}%` }} />
      </div>
    </section>
  )
}

function StatusBadge({
  children,
  tone,
}: {
  children: ReactNode
  tone: 'success' | 'danger' | 'warning' | 'info' | 'muted'
}) {
  return <span className={`status-badge ${tone}`}>{children}</span>
}

function CodeBlock({ value }: { value: unknown }) {
  return (
    <pre className="code-block">
      <code>{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</code>
    </pre>
  )
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button aria-label={label} className="icon-button" onClick={onClick} title={label} type="button">
      {children}
    </button>
  )
}

export default App
