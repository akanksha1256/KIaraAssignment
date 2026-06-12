# Low-Level Design — Rent Management Portal

## 1. Project Structure

```
KIaraAssignment/
├── apps/
│   └── web/                          # Next.js 14 application
│       └── src/
│           ├── app/                  # App Router pages + API route handlers
│           ├── client/               # All client-side code
│           │   ├── apiClient/        # HTTP client + response mappers
│           │   ├── commonComponents/ # Shared UI primitives
│           │   ├── designSystems/    # Tokens, strings, colors, fonts
│           │   ├── helpers/          # Shared types and utilities
│           │   ├── stateManagement/  # Redux store, slices, epics, selectors
│           │   └── views/            # Feature views (manager, tenant, payments…)
│           └── platform/             # Mock backend layer
│               ├── db/               # In-memory seed data
│               ├── types/            # Shared wire-format types (snake_case)
│               └── utils.ts          # Delay + forced-failure helper
├── docs/                             # Architecture and design docs
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 2. Data Model

All platform types live in `src/platform/types/index.ts` using snake_case to match the API wire format. Client-side types are camelCase and live inside each slice's `type.ts`.

### Entity Relationships

```
Property (1) ──► (N) Unit (1) ──► (0..1) Lease (1) ──► (N) Payment
                                    │
                                    └──► (1) Tenant ──► (N) PaymentMethod
```

### Platform Types (wire format)

| Entity | Key Fields |
|---|---|
| `Property` | `id`, `name`, `address`, `manager_name`, `manager_email`, `manager_contact` |
| `Unit` | `id`, `property_id`, `label` |
| `Tenant` | `id`, `name`, `contact`, `email`, `kyc_status`, `kyc_verified_on`, `kyc_document` |
| `Lease` | `id`, `unit_id`, `tenant_id`, `start_date`, `end_date`, `monthly_rent`, `terms`, `lease_document` |
| `Payment` | `id`, `lease_id`, `period_month`, `amount_due`, `amount_paid`, `status`, `paid_date`, `method`, `last_reminded_on` |
| `PaymentMethod` | `id`, `tenant_id`, `label` |

### Payment Status Rules

| Status | Condition |
|---|---|
| `paid` | `amount_paid >= amount_due` |
| `outstanding` | Payment exists but not yet paid (current or future period) |
| `overdue` | Not paid and period is in the past |

### Property Status (derived)

Derived on the API from its units' payment statuses: `overdue > outstanding > vacant > paid`.

---

## 3. API Routes

All routes live under `src/app/api/` as Next.js route handlers backed by the in-memory `db` object.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/manager/dashboard` | Stats, payment breakdown, monthly revenue, property summaries |
| `GET` | `/api/properties/[id]` | Property detail with all units, leases, and tenant summaries |
| `GET` | `/api/tenants/[id]` | Full tenant profile: tenant + lease + unit + property + payments + standing |
| `GET` | `/api/leases/[id]/payments` | Payment list for a lease |
| `POST` | `/api/leases/[id]/pay` | Mark a payment as paid (manager action) |
| `POST` | `/api/leases/[id]/remind` | Set `last_reminded_on` on a payment; returns updated payment |

### Mock Delay & Forced Failure

Every route calls `withDelay(req)` from `platform/utils.ts`:

```ts
// Adds DELAY_MS (800ms) to every request.
// Appending ?fail=true to any URL throws, triggering error states.
export async function withDelay(req: NextRequest) {
  const fail = req.nextUrl.searchParams.get("fail") === "true";
  await new Promise((r) => setTimeout(r, DELAY_MS));
  if (fail) throw new Error("Forced failure (fail=true)");
}
```

---

## 4. State Management

### Store Shape

The Redux store is configured in `src/client/stateManagement/mainFile.ts`:

```
store
├── manager          → managerDashboard/manager/managerSlice
├── property         → managerDashboard/property/propertySlice
├── tenant           → managerDashboard/tenant/tenantSlice
├── lease            → managerDashboard/lease/leaseSlice
├── payment          → managerDashboard/payment/paymentSlice
├── unit             → managerDashboard/unit/unitSlice
└── tenantDashboard  → tenantDashboard/tenantDashboardSlice
```

### Slice Conventions

All slices follow a consistent `reducers` pattern — actions are defined in `reducers: {}` and auto-generate typed action creators (e.g. `fetchTenantProfile`, `fetchTenantProfileSuccess`, `fetchTenantProfileFailure`). `extraReducers` is only used for cross-slice reactions (e.g. `unitSlice` reacting to `property/fetchPropertyById`).

### Fetch State Types

Two patterns are used depending on the use case:

```ts
// Status-based: used for entity fetches (property, tenant, unit)
type FetchStateWithError = {
  status: "not-started" | "pending" | "completed" | "failed";
  error: string | null;
};

// Loading-flag-based: used for actions (pay rent, mark paid, send reminder)
type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// Keyed map: per-entity caching
type FetchStateMap<T> = Record<string, FetchState<T>>;
```

### Async Flow (Redux-Observable Epics)

Each slice has a corresponding `epics/index.ts`. Epics use `mergeMap` + `catchError` to call the API and dispatch success/failure actions:

```
dispatch(fetchTenantProfile("tenant-1"))
  → epic calls api.getTenantProfile("tenant-1")
  → on success: dispatch(fetchTenantProfileSuccess({ id, profile }))
  → on failure: dispatch(fetchTenantProfileFailure({ id, error }))
```

### Per-ID Caching

Entity data is cached by ID in the Redux state to avoid redundant fetches:

```ts
// Example: tenantDataById["tenant-1"] holds { fetchState, data }
state.tenant.tenantDataById[id] = { fetchState: { status: "pending" }, data: null };
```

### Optimistic Updates

Mark-as-paid and pay-rent actions update state immediately before the API responds. On failure, the original state is restored from a `previousPayments` snapshot stored at dispatch time.

### 24-Hour Reminder Lock

After a reminder is sent, the `last_reminded_on` timestamp is stored on the payment. The `PaymentHistoryTable` checks `dayjs.utc().diff(remindedAt, "hour") < 24` and disables the button with a "Last sent: date time" sublabel.

---

## 5. API Client & Mapper Layer

Located in `src/client/apiClient/`:

- **`client.ts`** — typed async methods (`api.getTenantProfile(id)`, `api.markPaymentPaid(...)`, etc.) that call the API and pass the response through a mapper
- **`mappers.ts`** — pure functions that convert snake_case platform types to camelCase client types (e.g. `mapProperty`, `mapTenant`, `mapPayment`)

This layer ensures the rest of the client code only ever deals with camelCase types and never sees raw wire format.

---

## 6. Views & Component Architecture

### Manager Side

```
/manager                        → ManagerDashboard
  ├── Stats (4 cards)
  ├── MonthlyRevenueSection      (bar chart: expected vs collected)
  ├── PaymentStatusSection       (donut chart: paid / outstanding / overdue)
  └── Properties table

/manager/properties/[id]        → PropertyDetail
  ├── Stats (units, occupancy, rent)
  └── Units table → View link

/manager/properties/[id]/units/[unitId]  → UnitDetail
  ├── TenantCard
  ├── ManagerLeaseCard
  └── PaymentHistoryTable (with Mark as Paid + Send Reminder actions)

/manager/tenants/[id]           → TenantProfile
  ├── TenantInfoCard (info + payment standing donut)
  ├── TenantCurrentLeaseCard
  └── PaymentHistoryTable (read-only)
```

### Tenant Side

```
/tenant                         → TenantDashboard (hardcoded to tenant-1 / Alice Johnson)
  ├── PropertyInfoCard          (property name, address, unit)
  ├── ManagerInfoCard           (manager name, email, contact)
  ├── LeaseDetailsCard          (rent, period, terms, document)
  └── PaymentHistoryTable       (read-only)
```

### Shared UI Primitives (`commonComponents/`)

| Component | Purpose |
|---|---|
| `Card` / `CardHeader` / `CardContent` | Standard card shell |
| `DataTable` | Table with typed columns + rows, `table-auto` layout |
| `Pill` | Status badge driven by `statusConfig` |
| `RowMenu` | Portal-based dropdown with per-item loading + sublabel |
| `StatCard` | Metric tile with icon, value, subtitle, accent color |
| `Toast` / `ToastProvider` / `useToast` | Fixed top-right toast notifications (success/error, 4s auto-dismiss) |
| `MainHeader` | Back-navigation header |
| `Spinner` | Loading indicator |
| `CommonTooltip` | Recharts tooltip for currency charts |

### State Loading Pattern

Every feature view follows the same three-guard pattern before rendering content:

```tsx
if (status === "pending") return <LoadingState message="…" />;
if (error)               return <ErrorState message={error} onRetry={…} />;
if (!data)               return <EmptyState title="…" description="…" />;
// render content
```

---

## 7. Design System

Located in `src/client/designSystems/`:

| File | Contents |
|---|---|
| `colors.ts` | Semantic color palette — brand, neutral, success, warning, danger, chart |
| `fonts.ts` | Font family definitions |
| `spaces.ts` | Spacing scale |
| `strings.ts` | All user-facing copy in one typed object (`strings.manager.*`, `strings.tenant.*`, `strings.paymentTable.*`) — no inline strings in components |
| `tailwindPreset.js` | Tailwind preset extending the design tokens |

### Date Formatting

All dates are stored as ISO UTC strings (`"2024-01-15T00:00:00.000Z"`). Two shared helpers format them for display:

```ts
formatDate("2024-01-15T00:00:00.000Z")  // → "15 Jan 2024"
formatPeriodMonth("2024-06")             // → "Jun 2024"
```

---

## 8. Tenant Dashboard — Separate State Namespace

The tenant dashboard intentionally uses a **completely separate Redux slice** (`tenantDashboard`) rather than reusing the manager's `tenant` slice. This keeps the two experiences decoupled:

| Concern | Manager (`tenant` slice) | Tenant (`tenantDashboard` slice) |
|---|---|---|
| Shape | `TenantProfile` (includes KYC, standing, score) | `TenantDashboardData` (name, lease, property, payments only) |
| API method | `api.getTenantProfile(id)` | `api.getTenantDashboard(id)` |
| Mapper | `mapTenantProfile` | `mapTenantDashboard` |
| Epic | `tenantEpics` | `tenantDashboardEpics` |

---

## 9. Key Design Decisions

### `reducers` vs `extraReducers`
All async actions belong to the slice that owns the data. They are defined in `reducers: {}` which auto-generates action creators. `extraReducers` is reserved exclusively for cross-slice reactions (e.g. a property fetch also populating unit state).

### Per-Row Loading for Table Actions
Mark-as-paid and send-reminder track `processingPeriodMonth: string | null` (rather than a boolean) so each table row independently knows whether it is in-flight.

### Toast Dispatch Detection
A `useRef` is set synchronously at dispatch time and checked in `useEffect` to determine if the current component was the one that triggered the action — preventing foreign dispatches from showing toasts in unrelated views.

### Portal-Based RowMenu
The dropdown is rendered via a React portal to escape stacking contexts. An outside-click handler checks both `buttonRef` and `dropdownRef` before closing, preventing the portal from unmounting before the click event fires on a menu item.

### Snake_case / camelCase Boundary
The API wire format is snake_case (matching the DB). The mapper layer (`mappers.ts`) is the single conversion boundary. Everything inside the client is camelCase. No component or slice touches snake_case fields directly.
