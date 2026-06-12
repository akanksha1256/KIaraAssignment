# High-Level Design — Rent Management Portal

## 1. Overview

The Rent Management Portal is a two-sided web application serving two distinct user personas over a single shared data model:

- **Property Manager** — oversees properties, units, leases, tenants, and rent collection
- **Tenant** — views their own lease, property details, and payment history

The application is built as a Next.js monorepo with an in-memory mock backend. There is no authentication — the manager view and tenant view are separated by route namespace (`/manager` vs `/tenant`).

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
│   │               Redux Store (redux-observable)               │ │
│   │   manager | property | tenant | unit | lease | payment     │ │
│   │   tenantDashboard                                          │ │
│   └────────────────────────────┬───────────────────────────────┘ │
│                                │                                  │
│   ┌────────────────────────────▼───────────────────────────────┐ │
│   │              API Client + Mapper Layer                     │ │
│   │   snake_case ←→ camelCase boundary                        │ │
│   └────────────────────────────┬───────────────────────────────┘ │
└────────────────────────────────┼─────────────────────────────────┘
                                 │ HTTP (fetch)
┌────────────────────────────────▼─────────────────────────────────┐
│                    Next.js API Route Handlers                     │
│              /api/manager/dashboard                               │
│              /api/properties/[id]                                 │
│              /api/tenants/[id]                                    │
│              /api/leases/[id]/payments                            │
│              /api/leases/[id]/pay                                 │
│              /api/leases/[id]/remind                              │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
┌────────────────────────────────▼─────────────────────────────────┐
│                    In-Memory Data Store (db)                      │
│         properties | units | tenants | leases                    │
│         payments | paymentMethods                                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components for thin pages, file-based routing, co-located API routes |
| Language | TypeScript | End-to-end type safety across wire format, mappers, and UI |
| Styling | Tailwind CSS + design tokens | Utility-first with a single semantic color/spacing token source |
| State | Redux Toolkit + Redux-Observable | Predictable global state; epics for async side-effects with cancellation/composition |
| Async pattern | RxJS epics (`mergeMap`, `catchError`) | Handles concurrent fetches cleanly; naturally supports optimistic rollback |
| Charts | Recharts | Composable, React-native charting for revenue and payment status |
| Icons | Lucide React | Consistent icon set |
| Mock backend | Next.js route handlers + in-memory store | No real DB needed; artificial delay and forced-failure flags for testability |
| Build | Turborepo + pnpm workspaces | Monorepo task orchestration with caching |

---

## 4. High-Level Module Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│                        Application                          │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐     │
│  │  App Router  │   │    Views     │   │  State Mgmt  │     │
│  │  (pages)     │   │  (features)  │   │  (Redux)     │     │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘     │
│         │                  │                   │            │
│  ┌──────▼───────────────────▼───────────────────▼─────────┐ │
│  │               Common Components                        │ │
│  │   Card  DataTable  Pill  RowMenu  Toast  StatCard …    │ │
│  └──────────────────────────┬─────────────────────────────┘ │
│                             │                               │
│  ┌──────────────────────────▼─────────────────────────────┐ │
│  │                  Design System                         │ │
│  │      colors · fonts · spaces · strings · tailwind      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│                                                             │
│  ┌──────────────────┐       ┌───────────────────────────┐   │
│  │   API Client     │       │      Platform Layer       │   │
│  │  client.ts       │       │  db/ · types/ · utils.ts  │   │
│  │  mappers.ts      │       │  (in-memory mock)         │   │
│  └──────────────────┘       └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Two-Sided Experience

### Manager Side (`/manager`)

The manager has full visibility into the portfolio and can take actions on payments.

```
Manager Dashboard (/manager)
│
├── Portfolio overview
│   ├── Stats: properties, occupancy, monthly rent, collection rate
│   ├── Monthly Revenue chart (expected vs collected — last 6 months)
│   └── Payment Status donut (paid / outstanding / overdue counts)
│
├── Property List → Property Detail (/manager/properties/[id])
│   ├── Property stats: total units, occupied, vacant, rent
│   └── Units table → Unit Detail (/manager/properties/[id]/units/[unitId])
│       ├── Tenant info card
│       ├── Lease details card
│       └── Payment history table
│           ├── Mark as Paid (optimistic update + toast)
│           └── Send Reminder (24h disable window + last-sent sublabel)
│
└── Tenant Profile (/manager/tenants/[id])
    ├── Tenant info + KYC status
    ├── Payment standing score (on-time %)
    ├── Current lease card
    └── Payment history (read-only)
```

### Tenant Side (`/tenant`)

The tenant has a read-only view of their own context. Currently scoped to Alice Johnson (tenant-1) — switchable by changing the `tenantId` prop on `TenantDashboard`.

```
Tenant Dashboard (/tenant)
│
├── Property Details card  (property name, address, unit)
├── Property Manager card  (manager name, email, contact)
├── Lease Details card     (monthly rent, lease period, terms, document)
└── Payment History table  (read-only, no actions)
```

---

## 6. Data Flow

### Read Flow (e.g. loading a unit detail)

```
1. Component mounts
   → dispatch(fetchPropertyById(propertyId))

2. Redux slice sets status = "pending"
   → component renders <LoadingState />

3. Epic picks up the action
   → calls api.getPropertyById(id)
   → api layer fetches /api/properties/[id]
   → response passes through mappers (snake_case → camelCase)

4. On success: dispatch(fetchPropertyByIdSuccess({ id, data }))
   → slice sets status = "completed", stores data
   → component renders content

5. On failure: dispatch(fetchPropertyByIdFailure({ id, error }))
   → slice sets status = "failed", stores error message
   → component renders <ErrorState onRetry={…} />
```

### Write Flow — Mark as Paid (optimistic update)

```
1. Manager clicks "Mark as Paid" on a payment row
   → processingPeriodMonth = periodMonth (per-row loading state)
   → dispatch(managerMarkPaid({ leaseId, periodMonth }))

2. Slice applies optimistic update immediately
   → payment.status = "paid", payment.paid_date = now, payment.method = "Directly to Manager"
   → previousPayments snapshot saved for rollback

3. Epic calls POST /api/leases/[id]/pay

4a. On success: dispatch(managerMarkPaidSuccess(updatedPayment))
    → slice replaces optimistic data with server response
    → useEffect detects success → showToast("Payment marked as paid successfully.")
    → processingPeriodMonth = null

4b. On failure: dispatch(managerMarkPaidFailure(error))
    → slice restores previousPayments snapshot (rollback)
    → useEffect detects failure → showToast(error, "error")
    → processingPeriodMonth = null
```

### Reminder Flow

```
1. Manager clicks "Send Reminder"
   → sendingReminderPeriodMonth = periodMonth
   → dispatch(managerSendReminder({ leaseId, periodMonth }))

2. Epic calls POST /api/leases/[id]/remind
   → API sets payment.last_reminded_on = new Date().toISOString()
   → Returns updated payment

3. On success:
   → Slice updates payment in paymentsByLeaseId with new last_reminded_on
   → Button becomes disabled; sublabel shows "Last sent: <date time>"
   → Disabled for 24 hours (checked via dayjs.utc().diff(remindedAt, "hour") < 24)
   → Toast: "Reminder sent to <tenantName> for overdue rent."
```

---

## 7. State Namespace Design

The Redux store is split into two namespaces to keep manager and tenant concerns fully decoupled:

### `managerDashboard/`
Handles everything the manager sees and acts on:
- `manager` — dashboard stats, revenue, payment breakdown
- `property` — property list + per-property detail (cached by ID)
- `unit` — unit detail (cached by property+unit ID)
- `tenant` — tenant profiles (cached by ID) — includes KYC, standing score
- `lease` — lease records (cached by ID)
- `payment` — payments per lease, payment methods, mutation states (markPaid, reminder, payRent, addMethod)

### `tenantDashboard/`
Handles what the tenant sees — a deliberately minimal shape:
- Contains only: `tenantName`, `lease`, `unit`, `property`, `payments`
- No KYC, no standing score, no payment methods — not needed in this view
- Separate API method and mapper from the manager's tenant fetch, even though both call the same endpoint

This separation means: changes to the manager's view of a tenant (e.g. adding more fields) cannot accidentally break the tenant's dashboard, and vice versa.

---

## 8. API Design

### Request / Response Convention

All requests go through `withDelay()` which adds an 800ms artificial delay. Any request can be forced to fail by appending `?fail=true` to the URL, triggering `ErrorState` components throughout the UI.

### Derived Fields

Several fields returned by the API are derived at query time rather than stored:

| Field | Derived How |
|---|---|
| `PropertySummary.status` | Worst payment status across all units (`overdue > outstanding > vacant > paid`) |
| `PropertySummary.total_rent` | Sum of `monthly_rent` across active leases |
| `TenantStanding` | `on_time_payments / total_payments × 100` → score → label (Excellent/Good/Fair/Poor) |
| `DashboardStats.collection_rate` | `collected_this_month / total_monthly_rent × 100` |
| `MonthlyRevenue` | Aggregated from payments, last 6 distinct `period_month` values in DB |

---

## 9. Design System Architecture

The design system is the single source of truth for all visual decisions:

```
designSystems/
├── colors.ts          Semantic palette: brand, neutral, success, warning, danger, chart
├── fonts.ts           Font family definitions
├── spaces.ts          Spacing scale
├── strings.ts         All UI copy — manager.*, tenant.*, paymentTable.*
└── tailwindPreset.js  Extends Tailwind with design tokens
```

**Key principle:** no component hardcodes colors, copy, or spacing values. All come from the design system. This means a color change or copy update propagates everywhere from a single file.

---

## 10. Routing Structure

```
/                                   → redirects to /manager
/manager                            → ManagerDashboard
/manager/properties/[id]            → PropertyDetail
/manager/properties/[id]/units/[unitId] → UnitDetail
/manager/tenants/[id]               → TenantProfile (manager's view)
/tenant                             → TenantDashboard (tenant-1 / Alice Johnson)
```

All pages are thin Next.js server components that simply render their corresponding client view component, keeping routing and UI logic separate.

---

## 11. What Was Built vs. Brief Requirements

| Requirement | Status | Notes |
|---|---|---|
| Manager: list properties and units | ✅ | Dashboard → Property → Unit drill-down |
| Manager: see rent status across leases | ✅ | Status pills, payment history table |
| Manager: send payment reminder | ✅ | Mocked API, 24h disable, toast feedback |
| Manager: view payment history | ✅ | Per-unit payment table |
| Manager: tenant detail with standing score | ✅ | On-time payment %, donut chart |
| Tenant: see lease and terms | ✅ | Lease Details card |
| Tenant: see payment history | ✅ | Read-only payment table |
| Tenant: pay current month's rent | 🔲 | Not yet implemented (payment method + pay flow) |
| Optimistic updates | ✅ | Mark as Paid with rollback on failure |
| Loading / error / empty states | ✅ | All views covered |
| Mock delay + forced failure | ✅ | `?fail=true` on any API route |
| Two-sided navigation | ✅ | `/manager` and `/tenant` routes |

---

## 12. Known Trade-offs & What Would Be Done With More Time

| Area | Current State | With More Time |
|---|---|---|
| Authentication | None — views are separated by route only | JWT-based auth with role-based routing |
| Tenant pay-rent flow | Not implemented | Add payment method form + mocked pay action with optimistic update |
| Monorepo packages | Design tokens and components are inside the app | Extract into `packages/ui`, `packages/tokens`, `packages/state` as the brief requires |
| Real-time / sync | Not implemented | WebSocket or SSE for multi-tab sync; persisted mutation queue for offline tolerance |
| Test coverage | None | Unit tests for reducers/mappers, integration tests for epics, E2E for critical flows |
| Pagination | All data loaded at once | Cursor-based pagination on payment history and unit lists |
| Create / Edit flows | Not implemented | Forms to create properties, units, leases |
