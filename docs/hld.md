# High-Level Design - Rent Management Portal

## 1. Overview

The Rent Management Portal is a two-sided web application serving two distinct user personas over a single shared data model:

- **Property Manager** - oversees properties, units, leases, tenants, and rent collection
- **Tenant** - views their own lease, property details, payment history, and can pay rent

The application is built as a pnpm + Turborepo monorepo. The Next.js app is a thin shell that consumes three shared workspace packages. There is no authentication - the manager view and tenant view are separated by route namespace (`/manager` vs `/tenant`).

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│                                                                  │
│   ┌───────────────────┐       ┌───────────────────────────────┐ │
│   │   Manager View    │       │        Tenant View            │ │
│   │   /manager/*      │       │        /tenant                │ │
│   └────────┬──────────┘       └──────────────┬────────────────┘ │
│            │                                  │                  │
│   ┌────────▼──────────────────────────────────▼────────────────┐ │
│   │     @repo/ui  (components, Providers, Toaster)             │ │
│   │     TanStack Query (QueryClientProvider + query cache)     │ │
│   └────────────────────────────┬───────────────────────────────┘ │
│                                │                                  │
│   ┌────────────────────────────▼───────────────────────────────┐ │
│   │     @repo/data  (hooks · apiClient · types)                │ │
│   │     snake_case ↔ camelCase boundary (mappers.ts)           │ │
│   └────────────────────────────┬───────────────────────────────┘ │
└────────────────────────────────┼─────────────────────────────────┘
                                 │ HTTP (fetch)
┌────────────────────────────────▼─────────────────────────────────┐
│                    Next.js API Route Handlers  (apps/web)         │
│              /api/manager/dashboard                               │
│              /api/properties/[id]                                 │
│              /api/tenants/[id]                                    │
│              /api/tenants/[id]/payment-methods                    │
│              /api/leases/[id]/payments                            │
│              /api/leases/[id]/pay                                 │
│              /api/leases/[id]/remind                              │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
┌────────────────────────────────▼─────────────────────────────────┐
│                    In-Memory Data Store  (apps/web/platform/db)   │
│         properties | units | tenants | leases                    │
│         payments | paymentMethods                                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack

| Layer             | Technology                               | Reason                                                                                                                                  |
| ----------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Framework         | Next.js 14 (App Router)                  | Server components for thin pages, file-based routing, co-located API routes                                                             |
| Language          | TypeScript                               | End-to-end type safety across wire format, mappers, and UI                                                                              |
| Styling           | Tailwind CSS v3 + design token preset    | Utility-first with a single semantic color/spacing token source (`@repo/tokens`)                                                        |
| Data fetching     | TanStack Query v5                        | Declarative async state, automatic caching, `staleTime` deduplication, and first-class optimistic mutation support                      |
| Component library | shadcn/ui                                | Accessible primitives (`@base-ui/react`) + `class-variance-authority` for variant composition; variants mapped to project token classes |
| Toast             | Sonner                                   | shadcn's recommended toast solution - `<Toaster />` in `Providers`, imperative `toast()` / `toast.error()` at call sites                |
| Charts            | Recharts                                 | Composable, React-native charting for revenue and payment status                                                                        |
| Icons             | Lucide React                             | Consistent icon set, also used for the shadcn-style `Spinner` (`Loader2 + animate-spin`)                                                |
| Mock backend      | Next.js route handlers + in-memory store | No real DB needed; artificial delay and forced-failure flags for testability                                                            |
| Build             | Turborepo + pnpm workspaces              | Monorepo task orchestration; packages ship TypeScript source via `transpilePackages`                                                    |

---

## 4. Monorepo Package Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         apps/web  (Next.js)                         │
│                                                                      │
│  ┌─────────────┐   ┌──────────────────┐   ┌──────────────────────┐  │
│  │ App Router  │   │  View Components  │   │  Platform (API/DB)   │  │
│  │  (pages)    │   │  ("use client")   │   │  db/ · types/ · utils│  │
│  └──────┬──────┘   └────────┬─────────┘   └──────────────────────┘  │
└─────────┼───────────────────┼──────────────────────────────────────-─┘
          │ imports           │ imports
          ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Workspace Packages                             │
│                                                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────┐  │
│  │ @repo/tokens   │  │  @repo/data    │  │     @repo/ui         │  │
│  │                │  │                │  │                      │  │
│  │ colors.ts      │  │ types/         │  │ Button (shadcn)      │  │
│  │ strings.ts     │  │ wireTypes.ts   │  │ DataTable            │  │
│  │ fonts.ts       │◄─┤ apiClient/     │  │ Pill                 │  │
│  │ spaces.ts      │  │   client.ts    │◄─┤ StatCard             │  │
│  │ tailwindPreset │  │   mappers.ts   │  │ Card / RowMenu       │  │
│  └────────────────┘  │ hooks/         │  │ Toast (Sonner)       │  │
│                      └────────────────┘  │ Nav / Providers      │  │
│                                          └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

Packages ship TypeScript source directly. `apps/web/next.config.mjs` declares `transpilePackages: ["@repo/tokens", "@repo/ui", "@repo/data"]` - no build step or `dist/` folder required.

---

## 5. Two-Sided Experience

### Manager Side (`/manager`)

The manager has full visibility into the portfolio and can take actions on payments.

```
Manager Dashboard (/manager)
│
├── AttentionHero panel (conditional - shown only when overdue/outstanding amounts exist)
│   ├── Total at-risk amount, overdue vs outstanding breakdown
│   ├── "Send All Reminders" bulk action
│   └── AtRiskLeasesSection - scrollable at-risk lease rows
│
├── Portfolio stats (with month-over-month trend deltas)
│   ├── Properties / occupancy / monthly rent / collection rate
│   └── Trend badges: new leases this month, rent added, collection rate delta vs prior period
│
├── Monthly Revenue chart (expected vs collected - last 12 months)
└── Payment Status donut (paid / outstanding / overdue counts + amounts)

Manager Payments (/manager/payments)
├── Summary cards: total collected, total outstanding, overdue count
├── Filter system: status | property | period month | amount range (multi-row)
├── Search: tenant name, property, unit label
├── Sortable columns: property/unit, amount, period, paid on, status
└── Row click → Tenant Profile; PaymentRowMenu for per-row actions

Property List → Property Detail (/manager/properties/[id])
├── PillTab status filters (All / Overdue / Outstanding / Paid / Vacant)
├── Search + sort on property/unit columns
├── Add Property modal
└── Units table → Unit Detail (/manager/properties/[id]/units/[unitId])
    ├── Tenant info card
    ├── Lease details card
    ├── Add Lease modal (select existing tenant or create new inline)
    └── Payment history table
        ├── Mark as Paid (optimistic update + Sonner toast)
        └── Send Reminder (24h disable window + last-sent sublabel)

Tenant List (/manager/tenants)
├── Search, filter, sort
├── Add Tenant modal
└── Row click → Tenant Profile

Tenant Profile (/manager/tenants/[id])
├── Tenant info + KYC status
├── ScoreRing - on-time payment score (donut ring, 0–100)
├── Current lease card
└── Payment history (read-only)
```

### Tenant Side (`/tenant`)

The tenant has a read-only view of their own context plus the ability to pay outstanding rent. Currently scoped to Alice Johnson (tenant-1).

```
Tenant Dashboard (/tenant)
│
├── Property Details card  (property name, address, unit)
├── Property Manager card  (manager name, email, contact)
├── Lease Details card     (monthly rent, lease period, terms, document)
└── Payment History table
    └── "Pay Rent" button on outstanding/overdue rows
        └── PayRentModal
            ├── Select saved payment method
            ├── Add new payment method
            └── Pay (optimistic update + Sonner toast)
```

---

## 6. Data Flow

### Read Flow (e.g. loading a unit detail)

```
1. Component renders
   → usePropertyDetail(propertyId) from @repo/data - TanStack useQuery

2. On first call: status = "pending"
   → component renders <LoadingState />

3. TanStack Query calls api.getPropertyDetail(id)
   → fetches /api/properties/[id]
   → response passes through mappers.ts (snake_case → camelCase)
   → result stored in query cache under key ["property", "detail", id]

4. On success: isLoading = false, data = PropertyDetailData
   → component renders content
   → subsequent calls within staleTime (5 min) return cached data instantly

5. On failure: isError = true, error = Error
   → component renders <ErrorState onRetry={refetch} />
```

### Write Flow - Mark as Paid (optimistic update)

```
1. Manager clicks "Mark as Paid"
   → setProcessingPeriodMonth(periodMonth)
   → markPaid.mutate({ periodMonth })

2. useMutation onMutate:
   → cancel in-flight queries for ["payments", leaseId]
   → snapshot previous data
   → apply optimistic update in cache: payment.status = "paid"

3. Calls POST /api/leases/[id]/pay

4a. On success:
    → onSettled: invalidate ["payments", leaseId] → refetch
    → onSuccess callback: toast("Payment marked as paid successfully.")
    → setProcessingPeriodMonth(null)

4b. On error:
    → onError: restore previous data snapshot (rollback)
    → onError callback: toast.error(error.message)
    → setProcessingPeriodMonth(null)
```

### Tenant Pay Rent Flow

```
1. Tenant clicks "Pay Rent" on an outstanding/overdue row
   → setPayingPeriodMonth(periodMonth) → PayRentModal opens

2. Modal loads payment methods: usePaymentMethods(tenantId)
   → GET /api/tenants/[id]/payment-methods (cached under ["paymentMethods", tenantId])

3. Tenant selects a method (or adds a new one via useAddPaymentMethod)
   → POST /api/tenants/[id]/payment-methods
   → new method appended to ["paymentMethods", tenantId] cache

4. Tenant clicks "Pay Now"
   → usePayRent.mutate({ periodMonth, paymentMethodId })
   → onMutate: optimistically update payment status in ["tenant", "dashboard", tenantId] cache
   → POST /api/leases/[id]/pay

5a. On success:
    → onSettled: invalidate ["tenant", "dashboard", tenantId]
    → toast("Rent paid successfully.") → modal closes

5b. On error:
    → onError: restore cache snapshot (rollback)
    → toast.error("Payment failed: <message>")
```

### Reminder Flow

```
1. Manager clicks "Send Reminder"
   → sendingReminderPeriodMonth = periodMonth
   → sendReminder.mutate({ periodMonth })

2. POST /api/leases/[id]/remind
   → API sets payment.last_reminded_on = new Date().toISOString()
   → Returns updated payment

3. On success:
   → patches ["payments", leaseId] cache with updated payment
   → Button disabled for 24 hours; sublabel shows "Last sent: date time"
   → toast("Reminder sent to <tenantName>.")
```

---

## 7. Query Key Strategy

TanStack Query uses structured array keys for cache targeting and invalidation:

| Key                                  | Description                                                |
| ------------------------------------ | ---------------------------------------------------------- |
| `["manager", "dashboard"]`           | Manager dashboard (stats, charts, property list)           |
| `["property", "detail", propertyId]` | Property detail + units                                    |
| `["tenant", "profile", tenantId]`    | Tenant profile (manager view - KYC, standing, payments)    |
| `["tenant", "dashboard", tenantId]`  | Tenant dashboard (lease, property, payments - tenant view) |
| `["payments", leaseId]`              | Payment list for a lease (manager unit detail view)        |
| `["paymentMethods", tenantId]`       | Saved payment methods for a tenant                         |

**staleTime defaults:** reads use `staleTime: 5 * 60 * 1000` (5 min) so revisiting a page within the window returns cached data instantly. Payment methods use 10 min. Payments have no staleTime (always fresh).

---

## 8. API Design

### New Routes Since Initial Design

| Method | Path                     | Description                                        |
| ------ | ------------------------ | -------------------------------------------------- |
| GET    | `/api/manager/payments`  | Cross-portfolio payment list with tenant/property context |
| GET    | `/api/tenants`           | Full tenant list with lease/unit/property context  |
| POST   | `/api/tenants`           | Create a new tenant                                |
| POST   | `/api/leases`            | Create a new lease                                 |

### Request / Response Convention

All requests go through `withDelay()` which adds an 800ms artificial delay. Any request can be forced to fail by appending `?fail=true` to the URL, triggering `ErrorState` components throughout the UI.

### Derived Fields

Several fields returned by the API are derived at query time rather than stored:

| Field                            | Derived How                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `PropertySummary.status`         | Worst payment status across all units (`overdue > outstanding > upcoming > vacant > paid`) |
| `PropertySummary.total_rent`     | Sum of `monthly_rent` across active leases                                           |
| `TenantStanding`                 | `on_time_payments / total_payments × 100` → score → label (Excellent/Good/Fair/Poor) |
| `DashboardStats.collection_rate` | `collected_this_month / total_monthly_rent × 100`                                    |
| `MonthlyRevenue`                 | Aggregated from payments, last 12 months (always 12 slots, zeros for empty months)   |
| `StatsTrend`                     | New leases this month, rent added this month, prior period's collection rate          |
| `PaymentBreakdown.overdue_amount`| Sum of `amount_due` across all overdue payments                                      |
| `AtRiskLease`                    | Denormalized row: tenant, property, unit, amount due, days overdue - sorted overdue-first |

---

## 9. Design System Architecture

Design tokens live in `packages/tokens` and are the single source of truth for all visual decisions:

```
packages/tokens/src/
├── colors.ts          Semantic palette: brand, neutral, success, warning, danger, chart
├── fonts.ts           Font family definitions
├── spaces.ts          Spacing scale
├── strings.ts         All UI copy - manager.*, tenant.*, paymentTable.*
└── tailwindPreset.js  Extends Tailwind with design tokens (consumed by apps/web)
```

**Key principle:** no component hardcodes colors, copy, or spacing values. All come from `@repo/tokens`. shadcn Button variants are also mapped to token classes (`bg-brand-600`, `bg-danger-500`) rather than CSS variables, keeping the shadcn component architecture while staying within Tailwind v3 token conventions.

---

## 10. Routing Structure

```
/                                       → redirects to /manager
/manager                                → ManagerDashboard
/manager/payments                       → PaymentsPage (cross-portfolio payment list)
/manager/properties                     → PropertiesList
/manager/properties/[id]                → PropertyDetail
/manager/properties/[id]/units/[unitId] → UnitDetail
/manager/tenants                        → TenantsList
/manager/tenants/[id]                   → TenantProfile (manager's view)
/tenant                                 → TenantDashboard (tenant-1 / Alice Johnson)
```

All pages are thin Next.js server components that simply render their corresponding client view component, keeping routing and UI logic separate.

---

## 11. What Was Built vs. Brief Requirements

| Requirement                                | Status | Notes                                                                  |
| ------------------------------------------ | ------ | ---------------------------------------------------------------------- |
| Manager: list properties and units         | ✅     | Dashboard → Property → Unit drill-down; PillTab filter, search, sort   |
| Manager: see rent status across leases     | ✅     | Status pills, payment history table, cross-portfolio payments page      |
| Manager: send payment reminder             | ✅     | Per-row reminder + bulk "Send All Reminders" from AttentionHero        |
| Manager: view payment history              | ✅     | Per-unit payment table + `/manager/payments` full list with filter/search/sort |
| Manager: tenant detail with standing score | ✅     | On-time payment %, ScoreRing donut, KYC status                         |
| Manager: create properties / leases / tenants | ✅  | AddPropertyModal, AddLeaseModal (with inline new-tenant), AddTenantModal |
| Tenant: see lease and terms                | ✅     | Lease Details card                                                     |
| Tenant: see payment history                | ✅     | Payment history table                                                  |
| Tenant: pay current month's rent           | ✅     | Payment method picker + mocked pay flow, optimistic update             |
| Optimistic updates                         | ✅     | Mark as Paid and Pay Rent with rollback on failure                     |
| Loading / error / empty states             | ✅     | All views covered                                                      |
| Mock delay + forced failure                | ✅     | `?fail=true` on any API route                                          |
| Two-sided navigation                       | ✅     | `/manager` and `/tenant` routes                                        |
| TanStack Query                             | ✅     | All data fetching via `useQuery` / `useMutation` hooks in `@repo/data` |
| Monorepo packages                          | ✅     | `packages/tokens`, `packages/ui`, `packages/data`                      |
| shadcn/ui                                  | ✅     | Button (cva + @base-ui/react), Sonner toast                            |

---

## 12. Second Pass — Design Feedback Addressed

The initial submission was reviewed and flagged on six points. This section documents what was missing and how it was resolved in the second pass.

### 1. Mobile Experience (largest gap)

**Flagged:** The portal had no mobile layout. The sidebar was always visible, all data tables were desktop-only, and `h-screen` broke scroll on phones by ignoring the nav bar's padding.

**Addressed:**
- `Nav.tsx` rewritten with three modes: desktop sidebar (`hidden md:flex w-[250px]`), mobile bottom tab bar (`md:hidden fixed bottom-0 h-16`), and a hamburger-triggered slide-in drawer
- A `navLinks()` helper extracted so the same link definitions render in all three modes without duplication
- All data tables (`PaymentsTable`, `PropertiesTable`, `TenantsList`) now have a `sm:hidden` card-per-row section alongside the `hidden sm:block` desktop table
- `h-screen` → `h-[calc(100vh-4rem)] md:h-screen` across five files (`PaymentsPage`, `PaymentsListLoadingScreen`, `PropertiesList`, `TenantsList`, `TenantsListLoadingScreen`) to account for the 4rem bottom nav clearance declared on `<main>` in the manager layout
- Dashboard stat grid uses `grid-cols-2 lg:grid-cols-4`, charts use `grid-cols-1 md:grid-cols-[1.5fr_1fr]`, summary cards use `grid-cols-1 sm:grid-cols-3`

### 2. Skeleton Loaders (spinners replaced everywhere)

**Flagged:** All loading states used a generic `Loader2` spinner. It gives no layout preview and causes a jarring content jump when data arrives.

**Addressed:**
- Every view has a co-located `*LoadingScreen.tsx` skeleton that mirrors the real content's grid, card structure, and typography hierarchy
- Skeletons use the same responsive breakpoints as the live content (e.g. `grid-cols-1 md:grid-cols-2` in `ManagerDashboardSkeleton`, `sm:hidden` card skeletons + `hidden sm:block` table skeleton in `PaymentsListSkeleton`)
- `PayRentModal` methods loader changed from a spinner to two skeleton payment method rows matching the real method button shape

### 3. Stat Cards Lacked Actionable Numbers

**Flagged:** The collection rate card showed "73%" with no dollar figures — a percentage alone does not convey severity.

**Addressed:**
- `collectionRateSubtitle` in `strings.ts` changed from `(amount) => string` to `(collected, total) => string`; card subtitle now reads "$18K of $22K collected"
- `StatCardProps` extended with `sparkline?: number[]`; all four stat cards on the manager dashboard now render a pure SVG sparkline from 12 months of `MonthlyRevenue` data

### 4. Mobile Table Scroll Broken

**Flagged:** PaymentsList and TenantsList showed only two rows on mobile and did not scroll.

**Root cause:** `overflow-hidden` on the outer card wrapper (added to fix desktop header rounding) was clipping the mobile card list, which had no `flex-1 overflow-y-auto` of its own.

**Addressed:** Added `flex flex-col` to the outer wrapper and `flex-1 overflow-y-auto` to both the `sm:hidden` card div and the `hidden sm:block` table div — the same scroll-container pattern already working on the desktop path.

### 5. PaymentsTable Header Not Rounded

**Flagged:** The table header row corners were flush on large screens despite the outer card having `rounded-xl`.

**Root cause:** `overflow-hidden` was dropped from the outer wrapper when the mobile/desktop split was added. Without it, `rounded-xl` on a non-`overflow-hidden` container does not clip its children.

**Addressed:** Restored `overflow-hidden` on the outer wrapper combined with `flex flex-col`, correctly clipping both the header row and the card list.

### 6. Modal Keyboard Trap Was Fragile

**Flagged:** `PayRentModal` handled Escape via a raw `useEffect` + `addEventListener`. This does not trap Tab/Shift+Tab focus within the modal, which is a WCAG requirement for modal dialogs.

**Addressed:** Replaced with `focus-trap-react`. The trap activates on mount, traps Tab/Shift+Tab within the card, deactivates on Escape unless `modalState === "processing"`, and uses `allowOutsideClick: true` so the backdrop click still reaches its handler. `onDeactivate: onClose` handles cleanup for every deactivation path (Escape, programmatic).

---

## 13. Known Trade-offs & What Would Be Done With More Time

| Area                   | Current State                                        | With More Time                                                                            |
| ---------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Authentication         | None - views are separated by route only             | JWT-based auth with role-based routing                                                    |
| Real-time / sync       | Not implemented                                      | WebSocket or SSE for multi-tab sync                                                       |
| Test coverage          | Platform unit tests (21), hook tests, API route tests, E2E | Expand to cover new hooks (useAllPayments, useCreateLease) and create-flow mutations |
| Pagination             | All data loaded at once                              | Cursor-based pagination with TanStack Query's `useInfiniteQuery`                          |
| Edit flows             | Create done; edit (lease terms, KYC) not implemented | Controlled forms using established mutation hook pattern                                  |
| Optimistic rollback UX | Silent (no "undo" affordance)                        | Show inline error banner on the affected row with retry                                   |
