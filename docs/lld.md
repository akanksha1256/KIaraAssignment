# Low-Level Design — Rent Management Portal

## 1. Project Structure

```
KIaraAssignment/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/                         Next.js App Router — pages + API routes
│       │   │   ├── api/
│       │   │   │   ├── manager/dashboard/   GET  manager summary
│       │   │   │   ├── properties/[id]/     GET  property + units
│       │   │   │   ├── tenants/[id]/        GET  tenant dashboard or profile
│       │   │   │   │   └── payment-methods/ GET + POST  saved methods
│       │   │   │   ├── leases/[id]/
│       │   │   │   │   ├── payments/        GET  payment list
│       │   │   │   │   ├── pay/             POST mark paid / pay rent
│       │   │   │   │   └── remind/          POST send reminder
│       │   │   │   └── units/[id]/          GET  unit info
│       │   │   ├── manager/                 Manager pages (thin server components)
│       │   │   ├── tenant/                  Tenant page
│       │   │   └── layout.tsx               Root layout + Providers
│       │   │
│       │   ├── client/
│       │   │   ├── apiClient/
│       │   │   │   ├── client.ts            Typed async methods (fetch wrappers)
│       │   │   │   └── mappers.ts           snake_case → camelCase conversion
│       │   │   ├── commonComponents/
│       │   │   │   ├── Card.tsx
│       │   │   │   ├── DataTable.tsx
│       │   │   │   ├── MainHeader.tsx
│       │   │   │   ├── Pill.tsx
│       │   │   │   ├── Providers.tsx        QueryClientProvider + ToastProvider
│       │   │   │   ├── RowMenu.tsx
│       │   │   │   ├── StatCard.tsx
│       │   │   │   └── Toast.tsx
│       │   │   ├── designSystems/
│       │   │   │   ├── colors.ts
│       │   │   │   ├── fonts.ts
│       │   │   │   ├── spaces.ts
│       │   │   │   ├── strings.ts           All UI copy
│       │   │   │   └── tailwindPreset.js
│       │   │   ├── helpers/
│       │   │   │   └── utils.ts             formatDate, formatPeriodMonth, statusConfig, etc.
│       │   │   ├── hooks/                   TanStack Query hooks
│       │   │   │   ├── useManagerDashboard.ts
│       │   │   │   ├── usePropertyDetail.ts
│       │   │   │   ├── useTenantProfile.ts
│       │   │   │   ├── useTenantDashboard.ts
│       │   │   │   ├── usePayments.ts
│       │   │   │   ├── usePaymentMethods.ts
│       │   │   │   ├── useMarkPaid.ts
│       │   │   │   ├── usePayRent.ts
│       │   │   │   ├── useSendReminder.ts
│       │   │   │   └── useAddPaymentMethod.ts
│       │   │   ├── types/
│       │   │   │   └── index.ts             All camelCase domain types (single source of truth)
│       │   │   └── views/                   Feature view components ("use client")
│       │   │       ├── manager/
│       │   │       ├── properties/
│       │   │       ├── tenant/
│       │   │       └── tenant-dashboard/
│       │   │
│       │   └── platform/
│       │       ├── db/
│       │       │   └── index.ts             In-memory data store
│       │       ├── types/
│       │       │   └── index.ts             snake_case wire-format types
│       │       └── utils.ts                 withDelay, errorResponse, generateId, etc.
│       │
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── tsconfig.json
│
├── packages/                                (reserved for future shared packages)
├── turbo.json
└── CLAUDE.md
```

---

## 2. Type System

### Two-Layer Type Model

```
Platform Layer                     Client Layer
src/platform/types/index.ts   →   src/client/types/index.ts
(snake_case — wire format)         (camelCase — UI domain)
        ↑                                  ↑
  Only API routes                 Used by hooks,
  touch this layer                views, and components
        │                                  │
        └─────── mappers.ts ───────────────┘
                 (the only conversion point)
```

### Key Domain Types (camelCase)

```ts
// Core entities
Property        { id, name, address, type, yearBuilt }
Unit            { id, propertyId, label, bedrooms, bathrooms, sqft }
Tenant          { id, userId, leaseId, unitId, kycStatus }
Lease           { id, unitId, tenantId, monthlyRent, startDate, endDate, terms, documentUrl }

// Composite / view-level
PropertySummary    { id, name, address, unitCount, leasedCount, totalRent, status }
UnitDetailItem     { id, label, paymentStatus, tenant?, lease? }
PropertyDetailData { property: Property, units: UnitDetailItem[] }
TenantProfile      { tenant, lease, unit, property, payments, standing }
TenantDashboardData { tenantName, lease, unit, property, manager }

// Payment
Payment        { id, leaseId, periodMonth, amountDue, amountPaid, status, paidDate?, method?, lastRemindedOn? }
PaymentMethod  { id, tenantId, label }
PaymentStatus  "paid" | "outstanding" | "overdue"

// Dashboard aggregates
DashboardStats     { totalProperties, occupiedUnits, totalUnits, monthlyRent, collectionRate }
PaymentBreakdown   { paid, outstanding, overdue }
MonthlyRevenue     { month: string, expected: number, collected: number }
ManagerDashboardData { stats, paymentBreakdown, monthlyRevenue, properties }
```

### Wire-Format Types (snake_case — platform only)

All API response types in `src/platform/types/index.ts` use `snake_case` to match database and JSON conventions. These are **never imported** outside of `apiClient/client.ts` and `apiClient/mappers.ts`.

---

## 3. API Routes

| Method | Path | Description | Returns |
|---|---|---|---|
| GET | `/api/manager/dashboard` | Portfolio-level overview | `ManagerDashboardData` |
| GET | `/api/properties/[id]` | Property header + all units | `PropertyDetailData` |
| GET | `/api/tenants/[id]` | Tenant dashboard (tenant view) | `{ dashboard: TenantDashboardData, payments: Payment[] }` |
| GET | `/api/tenants/[id]/profile` | Tenant profile (manager view) | `TenantProfile` |
| GET | `/api/tenants/[id]/payment-methods` | Saved payment methods | `PaymentMethod[]` |
| POST | `/api/tenants/[id]/payment-methods` | Add a new payment method | `PaymentMethod` |
| GET | `/api/leases/[id]/payments` | Payment history for a lease | `Payment[]` |
| POST | `/api/leases/[id]/pay` | Mark payment as paid | `Payment` |
| POST | `/api/leases/[id]/remind` | Send payment reminder | `Payment` (with updated `lastRemindedOn`) |
| GET | `/api/units/[id]` | Unit detail | `Unit` |

### Shared Route Conventions

```ts
// Every handler follows this pattern
export async function GET(req: NextRequest, { params }) {
  try {
    await withDelay(req); // 800ms delay; ?fail=true throws
    const data = db.getData(params.id);
    if (!data) return errorResponse("Not found", 404);
    return NextResponse.json(mapData(data));
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
```

---

## 4. TanStack Query Hooks

All async data operations are in `src/client/hooks/`. There is no global state store — query results live in TanStack Query's `QueryClient` cache.

### Query Hook Pattern

```ts
// usePropertyDetail.ts
export const propertyDetailKey = (id: string) =>
  ["property", "detail", id] as const;

export function usePropertyDetail(propertyId: string) {
  return useQuery({
    queryKey: propertyDetailKey(propertyId),
    queryFn: () => api.getPropertyDetail(propertyId),
    staleTime: 5 * 60 * 1000,
    enabled: !!propertyId,
  });
}
```

### Mutation Hook Pattern — Optimistic Update

```ts
// useMarkPaid.ts
export function useMarkPaid(leaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ periodMonth }) =>
      api.payRent(leaseId, { periodMonth, paymentMethodId: "" }),

    onMutate: async ({ periodMonth }) => {
      // 1. Cancel any in-flight refetch so it doesn't clobber our optimistic update
      await queryClient.cancelQueries({ queryKey: paymentsKey(leaseId) });
      // 2. Snapshot the current cache value for rollback
      const previous = queryClient.getQueryData<Payment[]>(paymentsKey(leaseId));
      // 3. Apply optimistic update
      queryClient.setQueryData<Payment[]>(paymentsKey(leaseId), (old = []) =>
        old.map((p) =>
          p.periodMonth === periodMonth
            ? { ...p, status: "paid", amountPaid: p.amountDue, paidDate: new Date().toISOString() }
            : p,
        ),
      );
      return { previous }; // context passed to onError
    },

    onError: (_err, _vars, context) => {
      // Rollback to snapshot
      if (context?.previous !== undefined) {
        queryClient.setQueryData(paymentsKey(leaseId), context.previous);
      }
    },

    onSettled: () => {
      // Always invalidate after settle to stay in sync with server
      queryClient.invalidateQueries({ queryKey: paymentsKey(leaseId) });
    },
  });
}
```

### All Hooks Summary

| Hook | Type | Query Key | Description |
|---|---|---|---|
| `useManagerDashboard` | query | `["manager", "dashboard"]` | Stats, charts, property list |
| `usePropertyDetail(id)` | query | `["property", "detail", id]` | Property + all units |
| `useTenantProfile(id)` | query | `["tenant", "profile", id]` | Profile + standing (manager view) |
| `useTenantDashboard(id)` | query | `["tenant", "dashboard", id]` | Lease, property, payments (tenant view) |
| `usePayments(leaseId)` | query | `["payments", leaseId]` | Payment history list |
| `usePaymentMethods(tenantId)` | query | `["paymentMethods", tenantId]` | Saved payment methods |
| `useMarkPaid(leaseId)` | mutation | invalidates `["payments", leaseId]` | Optimistic mark-paid |
| `usePayRent(tenantId, leaseId)` | mutation | optimistic on `["tenant", "dashboard", tenantId]` | Tenant pay rent |
| `useSendReminder(leaseId)` | mutation | patches `["payments", leaseId]` cache | Send email reminder |
| `useAddPaymentMethod(tenantId)` | mutation | appends to `["paymentMethods", tenantId]` | Add payment method |

---

## 5. View Components

### Three-Guard Loading Pattern

Every data-fetching view component follows this exact structure before rendering content:

```tsx
const { data, isLoading, isError, error, refetch } = useSomeQuery(id);

if (isLoading) return <LoadingState message={s.loading} />;
if (isError)   return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
if (!data)     return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

// render content using `data`
```

### Pages vs Views

```tsx
// app/manager/properties/[id]/page.tsx — thin server component
export default function Page({ params }: { params: { id: string } }) {
  return <PropertyDetail propertyId={params.id} />;
}

// client/views/properties/PropertyDetail.tsx — "use client" view
export const PropertyDetail = ({ propertyId }: Props) => {
  const { data, isLoading, isError, error, refetch } = usePropertyDetail(propertyId);
  // ... guards + render
};
```

### View Map

| View Component | Route | Hook(s) Used |
|---|---|---|
| `ManagerDashboard` | `/manager` | `useManagerDashboard` |
| `PropertyDetail` | `/manager/properties/[id]` | `usePropertyDetail` |
| `UnitDetail` | `/manager/properties/[id]/units/[unitId]` | `usePropertyDetail`, `usePayments`, `useMarkPaid`, `useSendReminder` |
| `TenantProfile` | `/manager/tenants/[id]` | `useTenantProfile` |
| `TenantDashboard` | `/tenant` | `useTenantDashboard` |
| `PayRentModal` | modal inside `/tenant` | `usePaymentMethods`, `usePayRent`, `useAddPaymentMethod` |

---

## 6. API Client Layer

### client.ts — Typed Async Methods

```ts
// All methods return camelCase types from @/client/types
export const api = {
  getManagerDashboard: async (): Promise<ManagerDashboardData> => {
    const res = await fetch("/api/manager/dashboard");
    if (!res.ok) throw new Error((await res.json()).error);
    return mapManagerDashboard(await res.json());
  },

  getPropertyDetail: async (id: string): Promise<PropertyDetailData> => { ... },
  getTenantDashboard: async (id: string): Promise<{ dashboard: TenantDashboardData; payments: Payment[] }> => { ... },
  getPayments: async (leaseId: string): Promise<Payment[]> => { ... },
  getPaymentMethods: async (tenantId: string): Promise<PaymentMethod[]> => { ... },
  payRent: async (leaseId: string, body: PayRentBody): Promise<Payment> => { ... },
  sendReminder: async (leaseId: string, periodMonth: string): Promise<Payment> => { ... },
  addPaymentMethod: async (tenantId: string, label: string): Promise<PaymentMethod> => { ... },
};
```

### mappers.ts — Conversion Boundary

The only file that imports from `@/platform/types`. Every mapper follows the shape:

```ts
export function mapPayment(raw: RawPayment): Payment {
  return {
    id:             raw.id,
    leaseId:        raw.lease_id,
    periodMonth:    raw.period_month,
    amountDue:      raw.amount_due,
    amountPaid:     raw.amount_paid ?? 0,
    status:         raw.status,
    paidDate:       raw.paid_date ?? null,
    method:         raw.method ?? null,
    lastRemindedOn: raw.last_reminded_on ?? null,
  };
}
```

---

## 7. Per-Row Loading State

For payment table rows that have in-flight actions, per-row loading state is tracked with local component `useState` — no global store involved:

```tsx
const [processingPeriodMonth, setProcessingPeriodMonth] = useState<string | null>(null);

const handleMarkPaid = (periodMonth: string) => {
  setProcessingPeriodMonth(periodMonth);
  markPaid.mutate({ periodMonth }, {
    onSuccess: () => showToast("Payment marked as paid successfully."),
    onError: (err) => showToast(err.message, "error"),
    onSettled: () => setProcessingPeriodMonth(null),
  });
};

// In render:
const isProcessing = processingPeriodMonth === row.periodMonth;
```

This isolates loading state per row without lifting it to a shared store. Multiple rows can be independently in-flight.

---

## 8. Pay Rent Feature

### PayRentModal Flow

```
TenantDashboard
  └── PaymentHistoryTable
        └── "Pay Rent" button (shown for outstanding / overdue rows)
              → setPayingPeriodMonth(periodMonth) → <PayRentModal open />

PayRentModal
  ├── usePaymentMethods(tenantId)     — loads saved methods
  ├── useAddPaymentMethod(tenantId)   — adds new method to cache
  └── usePayRent(tenantId, leaseId)  — pays rent with optimistic update
        onSuccess → showToast("Rent paid successfully.") → close modal
        onError   → showToast("Payment failed: ...", "error")
```

### Optimistic Update for Pay Rent

```ts
onMutate: async ({ periodMonth }) => {
  await queryClient.cancelQueries({ queryKey: key }); // key = ["tenant", "dashboard", tenantId]
  const previous = queryClient.getQueryData<QueryData>(key);
  queryClient.setQueryData<QueryData>(key, (old) => ({
    ...old!,
    payments: old!.payments.map((p) =>
      p.periodMonth === periodMonth
        ? { ...p, status: "paid", amountPaid: p.amountDue, paidDate: new Date().toISOString() }
        : p
    ),
  }));
  return { previous };
},
onError: (_err, _vars, context) => {
  if (context?.previous !== undefined) queryClient.setQueryData(key, context.previous);
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: key });
},
```

---

## 9. Design System

### strings.ts — Copy Management

All user-visible copy is stored in a single typed object:

```ts
export const strings = {
  manager: {
    dashboard: { title, subtitle, loading, error, emptyTitle, ... },
    unitDetail: { loading, error, emptyTitle, ... },
    ...
  },
  tenant: {
    dashboard: { loading, error, emptyTitle, ... },
    ...
  },
  paymentTable: { colPeriod, colAmountDue, ... },
};
```

Components access their copy as:
```ts
const s = strings.manager.unitDetail;
// then: s.loading, s.emptyTitle, etc.
```

### colors.ts — Semantic Color Map

```ts
export const colors = {
  brand:   { 50: "#...", ..., 600: "#..." },
  success: { bg: "#...", text: "#..." },
  warning: { ... },
  danger:  { ... },
  chart:   ["#...", "#...", ...],  // for Recharts
};
```

Components use Tailwind class names for static colors (`text-neutral-900`, `bg-brand-600`) and `colors.ts` only for dynamic/programmatic colors (chart fills, status-based styles).

---

## 10. Key Design Decisions

### Why TanStack Query instead of a custom store?

The read + cache + invalidation + optimistic mutation pattern is precisely what TanStack Query was built for. It eliminates the plumbing of status fields, manual cache checks, rollback snapshots in reducers, and epic orchestration — replacing all of it with declarative hook configuration. The result is significantly fewer files and less boilerplate with equivalent behaviour.

### Why consolidate types into a single `types/index.ts`?

Scattering types across multiple module-local `type.ts` files creates import-path maintenance burden (especially with depth-sensitive relative paths in nested directories). A single `src/client/types/index.ts` means every hook, view, and component imports from one stable path. The mapper layer is still the only conversion boundary.

### Why keep per-row loading state local?

`processingPeriodMonth` and `sendingReminderPeriodMonth` are transient UI state with a lifetime bounded to the component. Hoisting them to a global store would add indirection without benefit. TanStack Query's `mutation.isPending` is global (any row), so per-row discrimination requires at minimum one local state value — local `useState` is the right scope.

### Why `staleTime: 5 * 60 * 1000` on read queries?

Navigating between property detail and unit detail (and back) would trigger unnecessary network requests without stale time. Five minutes covers normal browsing patterns without stale data risk on mutable data. Payment lists deliberately have no `staleTime` so they always reflect current state after mutations.

### Why `onSettled` (not `onSuccess`) for `invalidateQueries`?

`onSettled` fires for both success and error. This ensures the cache stays consistent even after an error — any optimistic update that was rolled back in `onError` will still trigger a re-fetch to confirm server state. Using `onSuccess` alone would leave the cache inconsistent after certain error scenarios.
