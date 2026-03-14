# NoSheeet CRM — Frontend Design Document

## Overview

NoSheeet is a personal CRM for founders. It aggregates conversations from Gmail, WhatsApp, and Google Calendar, uses AI to generate lead summaries and reminders, and presents a pipeline-style deal tracker. The frontend is a React SPA that talks to a Rails/Node backend hosted on Railway.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 (SWC plugin) |
| Styling | Tailwind CSS 3 + `tailwindcss-animate` |
| Components | shadcn/ui (Radix primitives) |
| Routing | React Router DOM 6 |
| State | Zustand 5 (persisted to localStorage) |
| Data Fetching | TanStack React Query 5 |
| Icons | Lucide React |
| Fonts | Space Grotesk (display), system-ui (body) |
| Charts | Recharts (installed, not yet used) |

---

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── AppLayout.tsx     # Sidebar + TopBar shell for authenticated pages
│   ├── AppSidebar.tsx    # Left nav with main/settings sections + theme toggle
│   ├── AuthGuard.tsx     # Route guards: RequireAuth, RedirectIfAuth, RequireAuthOnly
│   ├── ChannelBadge.tsx  # Colored pill for gmail/whatsapp/calendar channels
│   ├── NavLink.tsx       # forwardRef wrapper around React Router NavLink
│   ├── PageStates.tsx    # PageLoader, PageError, InlineLoader, SkeletonCard
│   └── TopBar.tsx        # Search bar, notification popover, user dropdown
├── hooks/
│   ├── use-api.ts        # React Query hooks for all endpoints (useDeals, useContacts, etc.)
│   ├── use-mobile.tsx    # Viewport width hook
│   ├── use-theme.ts      # System dark/light mode listener
│   └── use-toast.ts      # Toast hook (re-export)
├── lib/
│   ├── api.ts            # Re-exports from services/api (legacy compat)
│   ├── auth-api.ts       # Real auth API client (sendOtp, verifyOtp, magicLink, getSession)
│   ├── mock-api.ts       # Mock API with in-memory mutable state (reminders, merge requests)
│   ├── mock-auth-api.ts  # Mock auth/onboarding APIs (OTP, permissions, integrations, scan)
│   ├── mock-data.ts      # TypeScript interfaces + seed data for all entities
│   └── utils.ts          # cn() helper (clsx + tailwind-merge)
├── pages/
│   ├── Login.tsx          # Phone OTP + Email magic link tabs
│   ├── ProfileSetup.tsx   # Step 1: name input + onboarding stepper
│   ├── PermissionsPage.tsx# Step 2: mic/calendar/location toggles
│   ├── ConnectChannels.tsx# Step 3: channel connection cards + WhatsApp QR dialog
│   ├── AiScanning.tsx     # Step 4: progress bar + polling for scan completion
│   ├── Dashboard.tsx      # Weekly snapshot cards + reminders + pipeline kanban
│   ├── Contacts.tsx       # Searchable/filterable table with deal stage + reminder columns
│   ├── ContactDetail.tsx  # Contact header + AI summary + deals + chat timeline
│   ├── Deals.tsx          # Kanban-style pipeline columns
│   ├── DealDetail.tsx     # Deal progress bar + conversation timeline + AI insights + reminders
│   ├── Reminders.tsx      # Grouped by urgency (overdue/today/upcoming) with snooze/done actions
│   ├── MergeRequests.tsx  # Duplicate contact comparison cards with merge/keep actions
│   ├── Integrations.tsx   # Connected services list with connect/disconnect
│   ├── SettingsPage.tsx   # Profile form + notification/privacy toggles
│   └── NotFound.tsx       # 404 page
├── services/
│   └── api.ts            # Centralized fetch client with auth header injection + 401 handling
├── stores/
│   └── auth-store.ts     # Zustand store: user, session, onboarding, permissions, channels
├── index.css             # Tailwind + CSS variables (design tokens)
├── App.tsx               # Route definitions + QueryClient + providers
└── main.tsx              # React DOM entry point
```

---

## Design System

### Color Tokens (HSL via CSS variables)

All colors are defined as HSL values in `index.css` and mapped in `tailwind.config.ts`. Components use semantic tokens exclusively — never raw color values.

```
Primary:      38 92% 50%   (warm amber/orange)
Background:   0 0% 98%     (light) / 224 20% 6% (dark)
Foreground:   220 20% 10%  (light) / 210 20% 92% (dark)
Success:      142 71% 45%  (green)
Warning:      38 92% 50%   (same as primary — amber)
Destructive:  0 72% 51%    (red)
Cold:         217 91% 60%  (blue — for cold/stale deals)
```

**Channel colors:**
- Gmail: `--channel-gmail` (red)
- WhatsApp: `--channel-whatsapp` (green)
- Calendar: `--channel-calendar` (blue)

### Typography

- **Display font**: Space Grotesk (headings, deal values, nav brand)
- **Body font**: system-ui stack
- Tailwind class: `font-display` for Space Grotesk

### Dark Mode

- Class-based (`dark` on `<html>`)
- Auto-detected via `prefers-color-scheme` media query (`use-theme.ts`)
- Manual toggle in sidebar (`AppSidebar.tsx`)
- All tokens have dark variants in `index.css`

### Component Variants

shadcn/ui components are used as-is with standard variants. Custom styling is applied via:
- CSS variable overrides in `index.css`
- Tailwind utility classes using semantic tokens
- Custom CSS classes for channel badges (`.channel-badge-gmail`, etc.)

---

## Authentication & Onboarding Flow

### Flow Sequence

```
/login → /profile-setup → /permissions → /connect-channels → /ai-scanning → /dashboard
```

### Route Guards (`AuthGuard.tsx`)

| Guard | Behavior |
|---|---|
| `RequireAuth` | Redirects to `/login` if no user, or `/profile-setup` if onboarding incomplete |
| `RequireAuthOnly` | Redirects to `/login` if no user (allows incomplete onboarding) |
| `RedirectIfAuth` | Redirects to `/dashboard` if already authenticated + onboarded |

### Auth State (`auth-store.ts`)

Zustand store persisted to `localStorage` under key `nosheeet-auth`:

```typescript
interface AuthState {
  user: AuthUser | null;           // { id, phone?, email?, name?, avatar? }
  sessionToken: string | null;     // JWT from backend
  onboardingComplete: boolean;
  onboardingStep: number;          // 0-5
  permissions: Permissions;        // { microphone, calendar, location }
  connectedChannels: Record<ChannelKey, ChannelStatus>;
  logout: () => void;              // Resets everything
}
```

### Login Methods

1. **Phone OTP**: `POST /auth/send-otp` → `POST /auth/verify-otp` → returns `{ token, user }`
2. **Email Magic Link**: `POST /auth/magic-link` → user clicks link → session established

### Onboarding Steps

1. **Profile Setup**: Name input, saves to store
2. **Permissions**: Mic/Calendar/Location toggles, calls `POST /permissions/update`
3. **Connect Channels**: Gmail, Outlook, WhatsApp (QR flow), Calendar, Notion, Sheets
4. **AI Scanning**: Auto-starts scan, polls `GET /ai/scan-status` every 1.5s until complete

---

## API Architecture

### Centralized Client (`services/api.ts`)

```typescript
const API = import.meta.env.VITE_API_URL;

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // 1. Reads token from localStorage (nosheeet-auth Zustand store)
  // 2. Skips tokens starting with "mock-"
  // 3. Injects Authorization: Bearer <token> header
  // 4. On 401: clears auth state, redirects to /login
  // 5. Returns parsed JSON
}
```

### Environment

```
VITE_API_URL=https://your-backend.up.railway.app
```

### Endpoints

| Method | Path | Used By |
|---|---|---|
| GET | `/contacts` | Contacts page, Contacts table |
| GET | `/contacts/:id` | ContactDetail, DealDetail |
| GET | `/contacts/:id/timeline` | ContactDetail, DealDetail |
| GET | `/deals` | Dashboard, Deals, Contacts |
| GET | `/deals/:id` | DealDetail |
| GET | `/reminders` | Dashboard, Reminders, Contacts, DealDetail |
| POST | `/reminders/:id/snooze` | Reminders, DealDetail |
| POST | `/reminders/:id/done` | Reminders, DealDetail |
| GET | `/merge_requests` | MergeRequests |
| POST | `/merge_requests/:id/confirm` | MergeRequests |
| POST | `/merge_requests/:id/decline` | MergeRequests |
| POST | `/auth/send-otp` | Login |
| POST | `/auth/verify-otp` | Login |
| POST | `/auth/magic-link` | Login |
| GET | `/auth/session` | Auth validation |
| POST | `/permissions/update` | PermissionsPage |
| POST | `/integrations/:provider/connect` | ConnectChannels |
| GET | `/integrations/whatsapp/qr` | ConnectChannels |
| POST | `/ai/start-scan` | AiScanning |
| GET | `/ai/scan-status` | AiScanning |

### React Query Configuration (`use-api.ts`)

- **Polling**: Every 20 seconds (`refetchInterval: 20_000`)
- **Retry**: 3 attempts with 5-second delay
- **Error handling**: Toast notification via global `onError` handler
- **Query keys**: Namespaced arrays (`["contacts"]`, `["contacts", id]`, `["contacts", id, "timeline"]`)

### Mutations

- `useSnoozeReminder`: POST + invalidates reminders query
- `useMarkReminderDone`: POST + invalidates reminders query
- `useConfirmMerge`: POST + invalidates mergeRequests query
- `useDeclineMerge`: POST + invalidates mergeRequests query

---

## Data Models (`mock-data.ts`)

### Contact
```typescript
{
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar_url?: string;
  last_contacted: string;    // ISO date
  channel: "gmail" | "whatsapp" | "calendar";
  lead_score: number;        // 0-100
}
```

### Deal
```typescript
{
  id: string;
  title: string;
  contact_id: string;
  contact_name: string;
  value: number;             // USD
  stage: "discovery" | "demo" | "proposal" | "won" | "lost" | "cold";
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_activity?: string;
}
```

### Reminder
```typescript
{
  id: string;
  contact_id: string;
  contact_name: string;
  text: string;
  due_at: string;
  is_done: boolean;
  auto_generated: boolean;   // true = AI-created
}
```

### LeadSummary
```typescript
{
  id: string;
  contact_id: string;
  summary: string;
  pain_points: string[];
  recommended_action: string;
  generated_at: string;
}
```

### MergeRequest
```typescript
{
  id: string;
  source_contact: MergeContactInfo;
  target_contact: MergeContactInfo;
  confidence: number;        // 0-100 match percentage
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}
```

### Deal Stages (ordered)
```
discovery → demo → proposal → won | lost | cold
```

---

## Page-by-Page Breakdown

### Dashboard (`/`, `/dashboard`)
- **Weekly snapshot**: 3 metric cards (deals created, deals closed, going cold)
- **Today's Actions**: Pending reminders sorted by urgency, linked to contact pages
- **Pipeline Overview**: Horizontal scrollable kanban with all 6 stages, deal cards showing value + last activity

### Contacts (`/contacts`)
- **Search**: By name, company, or email
- **Stage filter**: Pill buttons for each deal stage
- **Table columns**: Name (avatar), Company, Channel badge, Deal Stage badge, Last Activity, Next Reminder
- **Row click**: Navigates to deal (if exists) or contact detail

### Contact Detail (`/contacts/:id`)
- Uses **mock data directly** (not API — needs migration)
- Shows: Contact header, AI lead summary card, deal cards, pending reminders, chat timeline (bubble UI)

### Deals (`/deals`)
- Kanban columns per stage
- Each card: title, contact name, last message preview, value, last activity timestamp
- Active pipeline total in header

### Deal Detail (`/deals/:id`)
- **Progress bar**: Visual stage indicator (discovery → won)
- **Left column**: Conversation timeline (messages + meetings + AI summaries) with vertical line connector
- **Right column**: Contact/deal info card, AI insights (summary + pain points + recommended action), reminders with snooze/done buttons

### Reminders (`/reminders`)
- Grouped sections: Overdue (red), Due Today (amber), Upcoming (gray)
- Each card: contact link, reminder text, AI-generated badge, Done button, Snooze buttons (1d/3d/1w)
- Completed section at bottom (strikethrough, dimmed)

### Merge Requests (`/merge-requests`)
- Side-by-side contact comparison cards
- Highlights differing fields (name, email, phone) with warning underline
- Confidence badge (green ≥90%, amber ≥75%, gray <75%)
- Actions: Merge Contacts / Keep Separate
- Resolved section shows merged/kept status

### Integrations (`/integrations`)
- Lists Gmail, WhatsApp, Calendar with status indicators
- Connect/Disconnect buttons, Refresh sync button
- Uses local state with mock data (not API)

### Settings (`/settings`)
- Profile form (name, email, company, timezone)
- Notification toggles (AI reminders, email digest, merge alerts, deal stage changes)
- Privacy toggles (AI analysis, auto-capture)
- Delete account button

---

## Layout Architecture

### AppLayout
```
┌──────────────────────────────────────────┐
│ AppSidebar │ TopBar                      │
│            │─────────────────────────────│
│  Dashboard │                             │
│  Contacts  │   <main> (page content)     │
│  Deals     │                             │
│  Reminders │                             │
│  Merges    │                             │
│  ─────────│                             │
│  Integr.   │                             │
│  Settings  │                             │
│            │                             │
│ [🌙 Theme]│                             │
└──────────────────────────────────────────┘
```

- Sidebar is collapsible (`SidebarProvider` from shadcn)
- TopBar has: sidebar trigger, search input (desktop) / icon (mobile), notification bell with count, user dropdown
- Main content area: `p-4 md:p-6`, scrollable

### Responsive Behavior

- Sidebar collapses to icons on small screens
- Contacts table hides columns progressively: Company (sm), Deal Stage + Reminder (md), Last Activity (lg)
- Search bar hidden on mobile, replaced with toggle icon
- Pipeline kanban scrolls horizontally on mobile
- Cards use `sm:grid-cols-2 lg:grid-cols-3` responsive grids

---

## Mock Data System

Two mock layers exist for development without a backend:

1. **`mock-api.ts`**: Full CRUD mock with mutable in-memory state for reminders and merge requests. Returns typed data matching API contracts.

2. **`mock-auth-api.ts`**: Auth flow mocks (OTP always succeeds, scan progress simulated with timers). Used by onboarding pages.

### Pages still using mocks directly (need migration):
- `ContactDetail.tsx` — imports from `mock-data.ts` directly instead of API hooks
- `Integrations.tsx` — uses `mockIntegrations` local state
- `TopBar.tsx` — uses `mockReminders` for notification count
- `PermissionsPage.tsx` — uses `mockPermissionsApi`
- `ConnectChannels.tsx` — uses `mockIntegrationsApi`
- `AiScanning.tsx` — uses `mockScanApi`

---

## CORS Requirements

The backend must allow these origins:
```
https://<project-id>.lovableproject.com     (dev preview)
https://id-preview--<project-id>.lovable.app (preview URL)
<your-published-domain>                      (production)
```

---

## Known Issues & TODOs

1. **CORS**: Backend needs to whitelist Lovable preview origins
2. **ContactDetail**: Still reads from mock data, needs migration to `useContact` + `useContactTimeline` hooks
3. **TopBar notifications**: Reads from `mockReminders` instead of API
4. **Integrations page**: Uses local state, not connected to API
5. **Sign out button**: UI exists in TopBar dropdown but has no `onClick` handler
6. **Search**: TopBar search input is non-functional (UI only)
7. **Settings**: Save button has no handler
8. **PageError ref warning**: React warns about function component ref in Dashboard error state
