# Low-Level Design — Rent Management Portal

## 1. Project Structure

```
KIaraAssignment/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/                              Next.js App Router — pages + API routes
│       │   │   ├── api/
│       │   │   │   ├── manager/dashboard/        GET  manager summary
│       │   │   │   ├── properties/[id]/          GET  property + units
│       │   │   │   ├── tenants/[id]/             GET  tenant dashboard or profile
│       │   │   │   │   └── payment-methods/      GET + POST  saved methods
│       │   │   │   ├── leases/[id]/
│       │   │   │   │   ├── payments/             GET  payment list
│       │   │   │   │   ├── pay/                  POST mark paid / pay rent
│       │   │   │   │   └── remind/               POST send reminder
│       │   │   │   └── units/[id]/               GET  unit info
│       │   │   ├── manager/                      Manager pages (thin server components)
│       │   │   ├── tenant/                       Tenant page
│       │   │   └── layout.tsx                    Root layout — imports Providers + Nav from @repo/ui
│       │   │
│       │   ├── client/
│       │   │   └── views/                        Feature view components ("use client")
│       │   │       ├── manager/                  ManagerDashboard + sub-components
│       │   │       ├── properties/               PropertyDetail, UnitDetail
│       │   │       ├── tenant/                   TenantProfile (manager view)
│       │   │       ├── tenant-dashboard/         TenantDashboard, PayRentModal, cards
│       │   │       ├── lease/                    ManagerLeaseCard, TenantCurrentLeaseCard
│       │   │       └── payments/                 PaymentHistoryTable
│       │   │
│       │   └── platform/                         Server-only — never imported by client code
│       │       ├── db/index.ts                   In-memory data store
│       │       ├── types/index.ts                snake_case wire-format types
│       │       └── utils.ts                      withDelay, errorResponse, generateId
│       │
│       ├── next.config.mjs                       transpilePackages: [@repo/tokens, @repo/ui, @repo/data]
│       ├── tailwind.config.ts                    imports tailwindPreset from @repo/tokens
│       ├── components.json                       shadcn config (style: base-nova, aliases → @repo/ui)
│       └── tsconfig.json
│
├── packages/
│   ├── tokens/
│   │   └── src/
│   │       ├── index.ts                          Barrel: colors, fonts, spaces, strings
│   │       ├── colors.ts                         Semantic color palette
│   │       ├── strings.ts                        All UI copy
│   │       ├── fonts.ts
│   │       ├── spaces.ts
│   │       └── tailwindPreset.js                 Tailwind preset consumed by apps/web
│   │
│   ├── data/
│   │   └── src/
│   │       ├── index.ts                          Barrel: types, api, all hooks
│   │       ├── types/index.ts                    camelCase domain types (single source of truth)
│   │       ├── wireTypes.ts                      snake_case wire types (internal — not exported)
│   │       ├── apiClient/
│   │       │   ├── client.ts                     Typed async fetch methods
│   │       │   └── mappers.ts                    snake_case → camelCase (only conversion point)
│   │       └── hooks/
│   │           ├── useManagerDashboard.ts
│   │           ├── usePropertyDetail.ts
│   │           ├── useTenantProfile.ts
│   │           ├── useTenantDashboard.ts
│   │           ├── usePayments.ts
│   │           ├── usePaymentMethods.ts
│   │           ├── useMarkPaid.ts
│   │           ├── usePayRent.ts
│   │           ├── useSendReminder.ts
│   │           └── useAddPaymentMethod.ts
│   │
│   └── ui/
│       └── src/
│           ├── index.ts                          Barrel: all components + utilities
│           ├── Button.tsx                        shadcn-style (cva + @base-ui/react/button)
│           ├── Card.tsx
│           ├── DataTable.tsx                     "use client" — uses useState/useMemo
│           ├── MainHeader.tsx
│           ├── Nav.tsx
│           ├── Pill.tsx
│           ├── Providers.tsx                     QueryClientProvider + <Toaster /> (Sonner)
│           ├── RowMenu.tsx
│           ├── Spinner.tsx                       Loader2 + animate-spin (lucide-react)
│           ├── StatCard.tsx
│           ├── statCard.types.ts                 AccentType, StatCardProps, accentMap
│           ├── Toast.tsx                         Sonner <Toaster /> wrapper
│           ├── Tooltip.tsx
│           └── utils.ts                          cn, formatDate, formatPeriodMonth, statusConfig
│
├── turbo.json
└── CLAUDE.md
```

---

## 2. Type System

### Three-Layer Type Model

```
Platform Layer                      @repo/data                         @repo/ui / views
apps/web/src/platform/              packages/data/src/                 packages/ui/src/
  types/index.ts        →             wireTypes.ts  (internal)
  (snake_case)                        mappers.ts    (converts)     →   types/index.ts
                                                                        (camelCase — exported)
        ↑                                   ↑                               ↑
  Only API route              Only client.ts and                  Used by hooks, views,
  handlers touch              mappers.ts import                   and components
  this layer                  wireTypes.ts
```

### Key Domain Types (camelCase — `packages/data/src/types/index.ts`)

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

### Import Rules

```ts
// ✅ In view components and hooks
import type { Payment, Lease } from "@repo/data";
import { strings, colors } from "@repo/tokens";
import { Button, DataTable } from "@repo/ui";

// ✅ In API route handlers (server only)
import type { RawPayment } from "@/platform/types";

// ❌ Never
import type { Payment } from "@/platform/types"; // wrong layer
import type { Payment } from "../../types"; // relative cross-boundary
```

---

## 3. API Routes

| Method | Path                                | Description                    | Returns                                                   |
| ------ | ----------------------------------- | ------------------------------ | --------------------------------------------------------- |
| GET    | `/api/manager/dashboard`            | Portfolio-level overview       | `ManagerDashboardData`                                    |
| GET    | `/api/properties/[id]`              | Property header + all units    | `PropertyDetailData`                                      |
| GET    | `/api/tenants/[id]`                 | Tenant dashboard (tenant view) | `{ dashboard: TenantDashboardData, payments: Payment[] }` |
| GET    | `/api/tenants/[id]/profile`         | Tenant profile (manager view)  | `TenantProfile`                                           |
| GET    | `/api/tenants/[id]/payment-methods` | Saved payment methods          | `PaymentMethod[]`                                         |
| POST   | `/api/tenants/[id]/payment-methods` | Add a new payment method       | `PaymentMethod`                                           |
| GET    | `/api/leases/[id]/payments`         | Payment history for a lease    | `Payment[]`                                               |
| POST   | `/api/leases/[id]/pay`              | Mark payment as paid           | `Payment`                                                 |
| POST   | `/api/leases/[id]/remind`           | Send payment reminder          | `Payment` (with updated `lastRemindedOn`)                 |
| GET    | `/api/units/[id]`                   | Unit detail                    | `Unit`                                                    |

### Shared Route Convention

```ts
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

## 4. TanStack Query Hooks (`packages/data/src/hooks/`)

All async data operations live in `packages/data`. There is no global state store — query results live in TanStack Query's `QueryClient` cache.

### Query Hook Pattern

```ts
// packages/data/src/hooks/usePropertyDetail.ts
export const propertyDetailKey = (id: string) => ["property", "detail", id] as const;

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
// packages/data/src/hooks/useMarkPaid.ts
export function useMarkPaid(leaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ periodMonth }) => api.payRent(leaseId, { periodMonth, paymentMethodId: "" }),

    onMutate: async ({ periodMonth }) => {
      await queryClient.cancelQueries({ queryKey: paymentsKey(leaseId) });
      const previous = queryClient.getQueryData<Payment[]>(paymentsKey(leaseId));
      queryClient.setQueryData<Payment[]>(paymentsKey(leaseId), (old = []) =>
        old.map((p) =>
          p.periodMonth === periodMonth
            ? { ...p, status: "paid", amountPaid: p.amountDue, paidDate: new Date().toISOString() }
            : p,
        ),
      );
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined)
        queryClient.setQueryData(paymentsKey(leaseId), context.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKey(leaseId) });
    },
  });
}
```

### All Hooks Summary

| Hook                            | Type     | Query Key                                         | Description                             |
| ------------------------------- | -------- | ------------------------------------------------- | --------------------------------------- |
| `useManagerDashboard`           | query    | `["manager", "dashboard"]`                        | Stats, charts, property list            |
| `usePropertyDetail(id)`         | query    | `["property", "detail", id]`                      | Property + all units                    |
| `useTenantProfile(id)`          | query    | `["tenant", "profile", id]`                       | Profile + standing (manager view)       |
| `useTenantDashboard(id)`        | query    | `["tenant", "dashboard", id]`                     | Lease, property, payments (tenant view) |
| `usePayments(leaseId)`          | query    | `["payments", leaseId]`                           | Payment history list                    |
| `usePaymentMethods(tenantId)`   | query    | `["paymentMethods", tenantId]`                    | Saved payment methods                   |
| `useMarkPaid(leaseId)`          | mutation | invalidates `["payments", leaseId]`               | Optimistic mark-paid                    |
| `usePayRent(tenantId, leaseId)` | mutation | optimistic on `["tenant", "dashboard", tenantId]` | Tenant pay rent                         |
| `useSendReminder(leaseId)`      | mutation | patches `["payments", leaseId]` cache             | Send email reminder                     |
| `useAddPaymentMethod(tenantId)` | mutation | appends to `["paymentMethods", tenantId]`         | Add payment method                      |

---

## 5. API Client Layer (`packages/data/src/apiClient/`)

### client.ts — Typed Async Methods

```ts
// All methods return camelCase types from packages/data/src/types
export const api = {
  getManagerDashboard: async (): Promise<ManagerDashboardData> => {
    const res = await fetch("/api/manager/dashboard");
    if (!res.ok) throw new Error((await res.json()).error);
    return mapManagerDashboard(await res.json());
  },

  getPropertyDetail:  async (id: string): Promise<PropertyDetailData> => { ... },
  getTenantDashboard: async (id: string): Promise<{ dashboard: TenantDashboardData; payments: Payment[] }> => { ... },
  getPayments:        async (leaseId: string): Promise<Payment[]> => { ... },
  getPaymentMethods:  async (tenantId: string): Promise<PaymentMethod[]> => { ... },
  payRent:            async (leaseId: string, body: PayRentBody): Promise<Payment> => { ... },
  sendReminder:       async (leaseId: string, periodMonth: string): Promise<Payment> => { ... },
  addPaymentMethod:   async (tenantId: string, label: string): Promise<PaymentMethod> => { ... },
};
```

### mappers.ts — Conversion Boundary

The only file that imports from `wireTypes.ts`. Every mapper follows:

```ts
export function mapPayment(raw: RawPayment): Payment {
  return {
    id: raw.id,
    leaseId: raw.lease_id,
    periodMonth: raw.period_month,
    amountDue: raw.amount_due,
    amountPaid: raw.amount_paid ?? 0,
    status: raw.status,
    paidDate: raw.paid_date ?? null,
    method: raw.method ?? null,
    lastRemindedOn: raw.last_reminded_on ?? null,
  };
}
```

---

## 6. UI Components (`packages/ui/src/`)

### Button — shadcn pattern

`Button` uses `@base-ui/react/button` as the accessible primitive and `class-variance-authority` for variant composition. Variants are mapped to project token classes so no CSS variables are required (Tailwind v3 compatible):

```ts
const buttonVariants = cva("inline-flex ... focus-visible:ring-brand-500 disabled:opacity-50", {
  variants: {
    variant: {
      default: "bg-brand-600 text-white hover:bg-brand-700",
      secondary: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
      outline: "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
      ghost: "text-neutral-700 hover:bg-neutral-100",
      destructive: "bg-danger-500 text-white hover:bg-danger-700",
      link: "text-brand-600 underline-offset-4 hover:underline",
    },
    size: {
      default: "h-9 px-4",
      sm: "h-8 px-3 text-xs",
      lg: "h-10 px-6",
      icon: "h-9 w-9",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});
```

### Toast — Sonner

`Providers.tsx` mounts `<Toaster position="top-right" richColors />` once at the app root. Call sites import `toast` from `sonner` directly — no context or custom hook needed:

```ts
// success
toast("Payment marked as paid successfully.");

// error
toast.error(err.message);
```

### Spinner

Uses `Loader2` from `lucide-react` with `animate-spin` — the shadcn-idiomatic pattern. No custom SVG.

### DataTable

Uses `table-auto` (not `table-fixed`) so `w-*` classes on `<th>` columns take effect. Requires `"use client"` because it uses `useState` and `useMemo`.

### Providers

```tsx
// packages/ui/src/Providers.tsx
"use client";
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
```

---

## 7. View Components (`apps/web/src/client/views/`)

### Three-Guard Loading Pattern

Every data-fetching view component follows this exact structure before rendering content:

```tsx
const { data, isLoading, isError, error, refetch } = useSomeQuery(id);

if (isLoading) return <LoadingState message={s.loading} />;
if (isError)
  return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
if (!data) return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;

// render content using `data`
```

### Pages vs Views

```tsx
// apps/web/src/app/manager/properties/[id]/page.tsx — thin server component
export default function Page({ params }: { params: { id: string } }) {
  return <PropertyDetail propertyId={params.id} />;
}

// apps/web/src/client/views/properties/PropertyDetail.tsx — "use client" view
export const PropertyDetail = ({ propertyId }: Props) => {
  const { data, isLoading, isError, error, refetch } = usePropertyDetail(propertyId);
  // ... guards + render
};
```

### View Map

| View Component     | Route                                     | Hook(s) Used                                                         |
| ------------------ | ----------------------------------------- | -------------------------------------------------------------------- |
| `ManagerDashboard` | `/manager`                                | `useManagerDashboard`                                                |
| `PropertyDetail`   | `/manager/properties/[id]`                | `usePropertyDetail`                                                  |
| `UnitDetail`       | `/manager/properties/[id]/units/[unitId]` | `usePropertyDetail`, `usePayments`, `useMarkPaid`, `useSendReminder` |
| `TenantProfile`    | `/manager/tenants/[id]`                   | `useTenantProfile`                                                   |
| `TenantDashboard`  | `/tenant`                                 | `useTenantDashboard`                                                 |
| `PayRentModal`     | modal inside `/tenant`                    | `usePaymentMethods`, `usePayRent`, `useAddPaymentMethod`             |

---

## 8. Per-Row Loading State

For payment table rows with in-flight actions, loading state is tracked with local component `useState` — not a global store, not `mutation.isPending` alone (which is global across all rows):

```tsx
const [processingPeriodMonth, setProcessingPeriodMonth] = useState<string | null>(null);

const handleMarkPaid = (periodMonth: string) => {
  setProcessingPeriodMonth(periodMonth);
  markPaid.mutate(
    { periodMonth },
    {
      onSuccess: () => toast("Payment marked as paid successfully."),
      onError: (err) => toast.error((err as Error).message),
      onSettled: () => setProcessingPeriodMonth(null),
    },
  );
};

// In render:
const isProcessing = processingPeriodMonth === row.periodMonth;
```

Multiple rows can be independently in-flight. `sendingReminderPeriodMonth` follows the same pattern for the Send Reminder action.

---

## 9. Design System (`packages/tokens/src/`)

### strings.ts — Copy Management

All user-visible copy is stored in a single typed object, imported as `@repo/tokens`:

```ts
export const strings = {
  manager: {
    dashboard: { title, subtitle, loading, error, emptyTitle, ... },
    unitDetail: { loading, error, emptyTitle, ... },
    ...
  },
  tenant: {
    dashboard: { loading, error, emptyTitle, ... },
    payRentModal: { title, amount, selectMethod, ... },
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
  chart:   ["#...", "#...", ...],  // for Recharts fills
};
```

Components use Tailwind class names for static colors (`text-neutral-900`, `bg-brand-600`) and `colors.ts` only for dynamic/programmatic values (chart fills, status-based styles passed as props).

---

## 10. Key Design Decisions

### Why `packages/data/src/wireTypes.ts` instead of importing `@/platform/types`?

`apps/web/src/platform/types/` is an internal app path. Importing it from `packages/data` would couple the workspace package to the app's internal structure. `wireTypes.ts` is a private copy (not exported from `packages/data/index.ts`) — the same snake_case ↔ camelCase boundary that existed before the split, now enforced at the package level.

### Why `transpilePackages` instead of a build pipeline?

Packages ship TypeScript source directly. Next.js compiles them in-process via `transpilePackages`. This eliminates the Turborepo `build` task dependency chain, `dist/` folder management, and cache invalidation tuning for a single-consumer monorepo. If a second app were added, adding a `tsc` build per package would be the natural next step.

### Why `onSettled` (not `onSuccess`) for `invalidateQueries`?

`onSettled` fires for both success and error. This ensures the cache stays consistent even after a failure — any optimistic update rolled back in `onError` still triggers a re-fetch to confirm server state. Using `onSuccess` alone would leave the cache in an inconsistent state after certain error scenarios.

### Why per-row loading state over `mutation.isPending`?

`mutation.isPending` is `true` for any in-flight mutation on that hook instance — it cannot distinguish which row triggered it. `processingPeriodMonth: string | null` costs one `useState` and gives per-row isolation with no shared state overhead.

### Why `staleTime: 5 * 60 * 1000` on read queries?

Navigating between property detail and unit detail (and back) would trigger unnecessary network requests without stale time. Five minutes covers normal browsing patterns without stale data risk. Payment lists deliberately have no `staleTime` so they always reflect the latest server state after mutations.

### Why shadcn variants are mapped to token classes (not CSS variables)?

shadcn's default "base-nova" style uses `@theme inline` and CSS variable-based tokens — a Tailwind v4 feature. This project uses Tailwind v3. Rather than upgrading or introducing a CSS variable layer, Button variants are written directly with token classes (`bg-brand-600`, `bg-danger-500`). The shadcn architecture (accessible primitive + `cva` + `cn`) is preserved while staying within the existing Tailwind v3 token conventions.
