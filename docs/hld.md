# High-Level Design — Rent Management Portal

## 1. Overview

The Rent Management Portal is a two-sided web application serving two distinct user personas over a single shared data model:

- **Property Manager** — oversees properties, units, leases, tenants, and rent collection
- **Tenant** — views their own lease, property details, payment history, and can pay rent

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
│   │           TanStack Query (QueryClientProvider)             │ │
│   │   useQuery hooks · useMutation hooks · query cache         │ │
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
│              /api/tenants/[id]/payment-methods                    │
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
| Data fetching | TanStack Query v5 | Declarative async state, automatic caching, `staleTime`-based deduplication, and first-class optimistic mutation support |
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
│  │  App Router  │   │    Views     │   │    Hooks     │     │
│  │  (pages)     │   │  (features)  │   │  (TanStack)  │     │
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
            └── Pay (optimistic update + toast)
```

---

## 6. Data Flow

### Read Flow (e.g. loading a unit detail)

```
1. Component renders
   → usePropertyDetail(propertyId) — TanStack useQuery

2. On first call: status = "pending"
   → component renders <LoadingState />

3. TanStack Query calls api.getPropertyDetail(id)
   → fetches /api/properties/[id]
   → response passes through mappers (snake_case → camelCase)
   → result stored in query cache under key ["property", "detail", id]

4. On success: isLoading = false, data = PropertyDetailData
   → component renders content
   → subsequent calls within staleTime (5 min) return cached data instantly

5. On failure: isError = true, error = Error
   → component renders <ErrorState onRetry={refetch} />
```

### Write Flow — Mark as Paid (optimistic update)

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
    → onSuccess callback: showToast("Payment marked as paid successfully.")
    → setProcessingPeriodMonth(null)

4b. On error:
    → onError: restore previous data snapshot (rollback)
    → onError callback: showToast(error.message, "error")
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
    → showToast("Rent paid successfully.") → modal closes

5b. On error:
    → onError: restore cache snapshot (rollback)
    → showToast("Payment failed: <message>", "error")
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
   → onSuccess: patch ["payments", leaseId] cache with updated payment
   → Button disabled for 24 hours; sublabel shows "Last sent: date time"
   → showToast("Reminder sent to <tenantName>.")
```

---

## 7. Query Key Strategy

TanStack Query uses structured array keys for cache targeting and invalidation:

| Key | Description |
|---|---|
| `["manager", "dashboard"]` | Manager dashboard (stats, charts, property list) |
| `["property", "detail", propertyId]` | Property detail + units |
| `["tenant", "profile", tenantId]` | Tenant profile (manager view — KYC, standing, payments) |
| `["tenant", "dashboard", tenantId]` | Tenant dashboard (lease, property, payments — tenant view) |
| `["payments", leaseId]` | Payment list for a lease (manager unit detail view) |
| `["paymentMethods", tenantId]` | Saved payment methods for a tenant |

**staleTime defaults:** reads use `staleTime: 5 * 60 * 1000` (5 min) so revisiting a page within the window returns cached data instantly. Payment methods use 10 min. Payments have no staleTime (always fresh).

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
| Tenant: see payment history | ✅ | Payment history table |
| Tenant: pay current month's rent | ✅ | Payment method picker + mocked pay flow, optimistic update |
| Optimistic updates | ✅ | Mark as Paid and Pay Rent with rollback on failure |
| Loading / error / empty states | ✅ | All views covered |
| Mock delay + forced failure | ✅ | `?fail=true` on any API route |
| Two-sided navigation | ✅ | `/manager` and `/tenant` routes |
| TanStack Query | ✅ | All data fetching via `useQuery` / `useMutation` hooks |

---

## 12. Known Trade-offs & What Would Be Done With More Time

| Area | Current State | With More Time |
|---|---|---|
| Authentication | None — views are separated by route only | JWT-based auth with role-based routing |
| Monorepo packages | Design tokens and components are inside the app | Extract into `packages/ui`, `packages/tokens` as the brief requires |
| Real-time / sync | Not implemented | WebSocket or SSE for multi-tab sync |
| Test coverage | None | Unit tests for hooks/mappers, integration tests via MSW, E2E for critical flows |
| Pagination | All data loaded at once | Cursor-based pagination with TanStack Query's `useInfiniteQuery` |
| Create / Edit flows | Not implemented | Forms to create properties, units, leases |
| Optimistic rollback UX | Silent (no "undo" affordance) | Show inline error banner on the affected row with retry |
