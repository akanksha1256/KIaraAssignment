# Low-Level Design - Rent Management Portal

## 1. Project Structure

```
KIaraAssignment/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/                              Next.js App Router - pages + API routes
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
│       │   │   └── layout.tsx                    Root layout - imports Providers + Nav from @repo/ui
│       │   │
│       │   ├── client/
│       │   │   ├── components/                   Reusable non-view components
│       │   │   │   ├── BackButton.tsx
│       │   │   │   ├── BarChartCard.tsx
│       │   │   │   ├── DonutChart.tsx
│       │   │   │   ├── FilterAndSearchSection.tsx  Filter bar + search input composite
│       │   │   │   ├── FilterPopup.tsx             Multi-row filter column/value picker
│       │   │   │   ├── PillTabs.tsx               Pill-shaped tab filter buttons
│       │   │   │   └── ScoreRing.tsx              Recharts donut ring for on-time score
│       │   │   └── views/                        Feature view components ("use client")
│       │   │       ├── manager/                  ManagerDashboard + sub-components
│       │   │       │   └── components/           StatusSection, MonthlyRevenueSection,
│       │   │       │                             PaymentStatusSection, AttentionHero,
│       │   │       │                             NeedsAttentionSection, AtRiskLeasesSection
│       │   │       ├── properties/               PropertiesList, PropertyDetail, UnitDetail
│       │   │       ├── tenant/                   TenantsList, TenantProfile (manager view)
│       │   │       ├── tenant-dashboard/         TenantDashboard, PayRentModal, cards
│       │   │       ├── lease/                    ManagerLeaseCard, TenantCurrentLeaseCard
│       │   │       └── payments/                 PaymentsPage, PaymentHistoryTable, components/
│       │   │
│       │   └── platform/                         Server-only - never imported by client code
│       │       ├── db/index.ts                   In-memory data store
│       │       ├── types/index.ts                Re-exports @repo/platform-types (snake_case)
│       │       └── utils.ts                      withDelay, errorResponse, generateId
│       │
│       ├── next.config.mjs                       transpilePackages: [@repo/tokens, @repo/ui, @repo/data, @repo/platform-types]
│       ├── src/platform/payments.ts              Due date logic: DUE_DATE=1, GRACE_DAYS=4 (due 1st, grace 1st–5th, overdue from 6th)
│       ├── tailwind.config.ts                    imports tailwindPreset from @repo/tokens
│       └── tsconfig.json
│
├── packages/
│   ├── platform-types/
│   │   └── src/
│   │       └── index.ts                          Canonical snake_case wire-format types
│   │
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
│   │           ├── useSendAllReminders.ts
│   │           ├── useAddPaymentMethod.ts
│   │           ├── useAllPayments.ts             Cross-portfolio payment list
│   │           ├── useAllTenants.ts              Full tenant list
│   │           ├── useCreateProperty.ts          Create property mutation
│   │           ├── useCreateLease.ts             Create lease mutation
│   │           └── useCreateTenant.ts            Create tenant mutation
│   │
│   └── ui/
│       └── src/
│           ├── index.ts                          Barrel: all components + utilities
│           ├── Badge.tsx                         Inline status badge (variant-based)
│           ├── Button.tsx                        shadcn-style (cva + @base-ui/react/button)
│           ├── Card.tsx
│           ├── DataTable.tsx                     "use client" - sortable table primitive
│           ├── MainHeader.tsx
│           ├── Nav.tsx
│           ├── Pill.tsx
│           ├── Providers.tsx                     QueryClientProvider + <Toaster /> (Sonner)
│           ├── RowMenu.tsx                       Portal-based action dropdown
│           ├── Select.tsx                        Accessible select input
│           ├── Spinner.tsx                       Loader2 + animate-spin (lucide-react)
│           ├── StatCard.tsx
│           ├── statCard.types.ts                 AccentType, StatCardProps, accentMap
│           ├── Toast.tsx                         useToast hook + Sonner <Toaster /> wrapper
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
@repo/platform-types              @repo/data                         @repo/ui / views
packages/platform-types/src/      packages/data/src/                 packages/ui/src/
  index.ts                          apiClient/
  (snake_case canonical)              client.ts   (imports P.*)
                                      mappers.ts  (converts)     →   types/index.ts
        ↑                                                              (camelCase - exported)
  apps/web re-exports via               ↑                               ↑
  platform/types/index.ts       Only client.ts and                 Used by hooks, views,
  API routes import              mappers.ts import                  and components
  from @repo/platform-types      from @repo/platform-types
```

`apps/web/src/platform/types/index.ts` is a thin `export type * from "@repo/platform-types"` - it exists only so API route handlers can use the `@/platform/types` alias without a full package path. The canonical definitions live in `@repo/platform-types`.

### Key Domain Types (camelCase - `packages/data/src/types/index.ts`)

```ts
// Core entities
Property        { id, name, address, managerName, managerEmail, managerContact }
Unit            { id, propertyId, label }
Tenant          { id, name, contact, email, kycStatus, kycVerifiedOn, kycDocument }
Lease           { id, unitId, tenantId, monthlyRent, startDate, endDate, terms, leaseDocument }

// Composite / view-level
PropertySummary     { id, name, address, unitCount, leasedCount, totalRent, status }
UnitDetailItem      { id, label, paymentStatus, currentPeriodMonth?, tenant?, lease? }
PropertyDetailData  { property: Property, units: UnitDetailItem[] }
TenantProfile       { tenant, lease, unit, property, payments, standing }
TenantDashboardData { tenantName, lease, unit, property }
TenantListItem      { tenant, lease?, unit?, property?, paymentStatus }
PaymentListItem     { payment, lease, unit, property, tenant }

// Payment
Payment        { id, leaseId, periodMonth, amountDue, amountPaid, status, paidDate?, method?, lastRemindedOn? }
PaymentMethod  { id, tenantId, label }
PaymentStatus  "paid" | "outstanding" | "overdue"
PaymentsListSortCol   "period" | "paidOn" | "status" | "amount" | "property"
PaymentsListFilterColKey  "status" | "property" | "period" | "amount"

// Dashboard aggregates
DashboardStats       { totalProperties, occupiedUnits, vacantUnits, totalUnits, totalMonthlyRent, collectedThisMonth }
StatsTrend           { newLeasesThisMonth, rentAddedThisMonth, prevCollectionRate }
PaymentBreakdown     { paid, outstanding, overdue, overdueAmount, outstandingAmount }
MonthlyRevenue       { month: string, expected: number, collected: number }
AtRiskLease          { tenantName, propertyName, unitLabel, amountDue, daysOverdue, leaseId, periodMonth, status }
ManagerDashboardData { stats, statsTrend, paymentBreakdown, monthlyRevenue, properties, atRiskLeases }
```

### Import Rules

```ts
// ✅ In view components and hooks
import type { Payment, Lease } from "@repo/data";
import { strings, colors } from "@repo/tokens";
import { Button, DataTable } from "@repo/ui";

// ✅ In API route handlers (server only)
import type { Payment } from "@repo/platform-types";
// or via the app alias:
import type { Payment } from "@/platform/types";

// ❌ Never
import type { Payment } from "@/platform/types"; // in components, views, or hooks
import type { Payment } from "../../types";        // relative cross-boundary import
```

---

## 3. API Routes

| Method | Path                                | Description                    | Returns                                                   |
| ------ | ----------------------------------- | ------------------------------ | --------------------------------------------------------- |
| GET    | `/api/manager/dashboard`            | Portfolio-level overview       | `ManagerDashboardData` (incl. `statsTrend`, `atRiskLeases`) |
| GET    | `/api/manager/payments`             | Cross-portfolio payment list   | `PaymentListItem[]`                                       |
| GET    | `/api/properties/[id]`              | Property header + all units    | `PropertyDetailData`                                      |
| GET    | `/api/tenants`                      | Full tenant list               | `TenantListItem[]`                                        |
| POST   | `/api/tenants`                      | Create a new tenant            | `{ tenant: Tenant }`                                      |
| GET    | `/api/tenants/[id]`                 | Tenant dashboard (tenant view) | `{ dashboard: TenantDashboardData, payments: Payment[] }` |
| GET    | `/api/tenants/[id]/profile`         | Tenant profile (manager view)  | `TenantProfile`                                           |
| GET    | `/api/tenants/[id]/payment-methods` | Saved payment methods          | `PaymentMethod[]`                                         |
| POST   | `/api/tenants/[id]/payment-methods` | Add a new payment method       | `PaymentMethod`                                           |
| GET    | `/api/leases/[id]/payments`         | Payment history for a lease    | `Payment[]`                                               |
| POST   | `/api/leases/[id]/pay`              | Mark payment as paid           | `Payment`                                                 |
| POST   | `/api/leases/[id]/remind`           | Send payment reminder          | `Payment` (with updated `lastRemindedOn`)                 |
| POST   | `/api/leases`                       | Create a new lease             | `{ lease: Lease }`                                        |

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

All async data operations live in `packages/data`. There is no global state store - query results live in TanStack Query's `QueryClient` cache.

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

### Mutation Hook Pattern - Optimistic Update

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

Always use `onSettled` (not `onSuccess`) for `invalidateQueries` - it fires for both success and error, keeping the cache consistent even after rollback.

### All Hooks Summary

| Hook                                   | Type     | Query Key                                         | Description                                    |
| -------------------------------------- | -------- | ------------------------------------------------- | ---------------------------------------------- |
| `useManagerDashboard`                  | query    | `["manager", "dashboard"]`                        | Stats, trends, charts, at-risk leases          |
| `usePropertyDetail(id)`                | query    | `["property", "detail", id]`                      | Property + all units                           |
| `useTenantProfile(id)`                 | query    | `["tenant", "profile", id]`                       | Profile + standing (manager view)              |
| `useTenantDashboard(id)`               | query    | `["tenant", "dashboard", id]`                     | Lease, property, payments (tenant view)        |
| `usePayments(leaseId)`                 | query    | `["payments", leaseId]`                           | Payment history list                           |
| `usePaymentMethods(tenantId)`          | query    | `["paymentMethods", tenantId]`                    | Saved payment methods                          |
| `useAllPayments()`                     | query    | `["payments", "all"]`                             | Cross-portfolio payment list                   |
| `useAllTenants()`                      | query    | `["tenants", "all"]`                              | Full tenant list with lease/property context   |
| `useMarkPaid(leaseId)`                 | mutation | optimistic on `["payments", leaseId]`             | Manager mark-paid with rollback                |
| `usePayRent(tenantId, leaseId)`        | mutation | optimistic on `["tenant", "dashboard", tenantId]` | Tenant pay rent with rollback                  |
| `useSendReminder(leaseId)`             | mutation | patches `["payments", leaseId]` cache             | Send email reminder                            |
| `useSendAllReminders()`                | mutation | -                                                 | Bulk send reminders to all at-risk leases      |
| `useAddPaymentMethod(tenantId)`        | mutation | appends to `["paymentMethods", tenantId]`         | Add payment method                             |
| `useCreateProperty()`                  | mutation | invalidates `["manager", "dashboard"]`            | Create a new property                          |
| `useCreateLease(propertyId)`           | mutation | invalidates property + dashboard + tenants        | Create a new lease; also calls useCreateTenant inline if needed |
| `useCreateTenant()`                    | mutation | invalidates `["tenants", "all"]`                  | Create a new tenant                            |

---

## 5. API Client Layer (`packages/data/src/apiClient/`)

### client.ts - Typed Async Methods

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

### mappers.ts - Conversion Boundary

The only file that imports snake_case types from `@repo/platform-types`. Every mapper follows:

```ts
import type * as P from "@repo/platform-types";

export function mapPayment(raw: P.Payment): Payment {
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

## 6. UI Component API (`packages/ui/src/`)

### DataTable

`DataTable` is a generic sortable table. Callers construct `TableColumn[]` and `TableRow[]` and pass them as props - no render-prop or children API.

```ts
// Column definition
interface TableColumn {
  label: string;
  align?: "left" | "right";  // defaults to "left"
  className?: string;         // e.g. "w-48" - works because table uses table-auto, not table-fixed
  sortable?: boolean;
}

// Cell definition
interface TableCell {
  content: React.ReactNode;  // any JSX
  className?: string;        // overrides td padding/alignment if needed
  sortValue?: string | number; // used for client-side sort; falls back to content string if omitted
}

// Row definition
interface TableRow {
  key: string;
  onClick?: () => void;  // makes the row clickable (cursor-pointer, hover highlight)
  cells: TableCell[];    // must align with columns array length
}
```

`w-*` column widths only take effect because the table uses `table-auto`. Switching to `table-fixed` breaks explicit widths - don't change it.

To right-align a `<Pill>` (which is `inline-flex`) inside a cell, wrap it in a flex container - `text-right` on the `<td>` has no effect on `inline-flex` children:

```tsx
// ✅
content: <div className="flex justify-end"><Pill status={row.status} /></div>

// ❌ text-right on the column align has no effect on inline-flex
```

### RowMenu

`RowMenu` renders a portal-based dropdown anchored to a trigger button. Because it mounts outside the table DOM, two refs are required for the outside-click handler, and menu items must call `stopPropagation` to prevent the portal from unmounting before the click fires:

```tsx
// Inside RowMenu.tsx - callers don't touch refs, but need to understand the constraint
const buttonRef = useRef<HTMLButtonElement>(null);
const dropdownRef = useRef<HTMLDivElement>(null);

// Outside-click handler checks both refs
const insideButton = buttonRef.current?.contains(target);
const insideDropdown = dropdownRef.current?.contains(target);

// Menu items must suppress mousedown so the portal doesn't close before click
<button onMouseDown={(e) => e.stopPropagation()} onClick={handleAction}>
  Action
</button>
```

Callers pass an `items` array - each item needs `label` and `onClick`. The positioning is computed from `buttonRef.current.getBoundingClientRect()` at open time.

### Toast - `useToast()` hook

Views use the `useToast()` hook from `@repo/ui`, not Sonner's `toast()` directly:

```ts
// ✅ Always use the hook
const { showToast } = useToast();
showToast("Payment marked as paid successfully.", "success");
showToast(err.message, "error");

// ❌ Do not import toast from sonner directly in views
import { toast } from "sonner";
```

`Providers.tsx` mounts `<Toaster position="top-right" richColors />` once at the app root. Toasts auto-dismiss after 4 seconds.

### Button - shadcn pattern

`Button` uses `@base-ui/react/button` as the accessible primitive and `class-variance-authority` for variant composition. Variants map to project token classes - no CSS variables required (Tailwind v3 compatible):

```ts
const buttonVariants = cva("inline-flex ... focus-visible:ring-brand-500 disabled:opacity-50", {
  variants: {
    variant: {
      default:     "bg-brand-600 text-white hover:bg-brand-700",
      secondary:   "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
      outline:     "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
      ghost:       "text-neutral-700 hover:bg-neutral-100",
      destructive: "bg-danger-500 text-white hover:bg-danger-700",
      link:        "text-brand-600 underline-offset-4 hover:underline",
    },
    size: {
      default: "h-9 px-4",
      sm:      "h-8 px-3 text-xs",
      lg:      "h-10 px-6",
      icon:    "h-9 w-9",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});
```

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
// apps/web/src/app/manager/properties/[id]/page.tsx - thin server component
export default function Page({ params }: { params: { id: string } }) {
  return <PropertyDetail propertyId={params.id} />;
}

// apps/web/src/client/views/properties/PropertyDetail.tsx - "use client" view
export const PropertyDetail = ({ propertyId }: Props) => {
  const { data, isLoading, isError, error, refetch } = usePropertyDetail(propertyId);
  // ... guards + render
};
```

### Component Decomposition

Views that would exceed a single screen of JSX are split into co-located sub-components. Sub-components receive plain props (not hooks) - only the root view component calls hooks.

```
UnitDetail (root - calls usePropertyDetail, usePayments, useMarkPaid, useSendReminder)
├── TenantInfoCard        (props: tenant)
├── ManagerLeaseCard      (props: lease, unit)
└── PaymentHistoryTable   (props: payments, actions)

TenantDashboard (root - calls useTenantDashboard)
├── PropertyInfoCard      (props: property, unit)
├── ManagerInfoCard       (props: property)
├── LeaseDetailsCard      (props: lease)
├── PaymentHistoryTable   (props: payments, tenantActions)
└── PayRentModal          (props: tenantId, leaseId, periodMonth, amountDue, onClose)
       └── calls usePaymentMethods, usePayRent, useAddPaymentMethod

TenantProfile (root - calls useTenantProfile)
├── TenantHeader          (props: tenant)
├── TenantCard            (props: tenant, standing)
│   └── RiskScore         (props: standing)
├── TenantInfoCard        (props: tenant)
├── ManagerLeaseCard      (props: lease)
└── PaymentHistoryTable   (props: payments)
```

### Modal State Ownership

Modal open/close state and the selected item live in the **parent view**, not inside the modal. This keeps the modal stateless with respect to which row triggered it:

```tsx
// TenantDashboard - parent owns the state
const [payingPeriodMonth, setPayingPeriodMonth] = useState<string | null>(null);
const pendingPayment = payingPeriodMonth
  ? (payments.find((p) => p.periodMonth === payingPeriodMonth) ?? null)
  : null;

// Modal only renders when both conditions hold - it never has to handle "no payment" internally
{payingPeriodMonth && pendingPayment && lease && (
  <PayRentModal
    tenantId={tenantId}
    leaseId={lease.id}
    periodMonth={payingPeriodMonth}
    amountDue={pendingPayment.amountDue}
    onClose={() => setPayingPeriodMonth(null)}
  />
)}
```

### View Map

| View Component     | Route                                     | Hook(s) Used                                                                       |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `ManagerDashboard` | `/manager`                                | `useManagerDashboard`                                                              |
| `PaymentsPage`     | `/manager/payments`                       | `useAllPayments`                                                                   |
| `PropertiesList`   | `/manager/properties`                     | `useManagerDashboard`, `useCreateProperty`                                         |
| `PropertyDetail`   | `/manager/properties/[id]`                | `usePropertyDetail`, `useCreateLease`, `useCreateTenant`, `useAllTenants`          |
| `UnitDetail`       | `/manager/properties/[id]/units/[unitId]` | `usePropertyDetail`, `usePayments`, `useMarkPaid`, `useSendReminder`               |
| `TenantsList`      | `/manager/tenants`                        | `useAllTenants`, `useCreateTenant`                                                 |
| `TenantProfile`    | `/manager/tenants/[id]`                   | `useTenantProfile`                                                                 |
| `TenantDashboard`  | `/tenant`                                 | `useTenantDashboard`                                                               |
| `PayRentModal`     | modal inside `/tenant`                    | `usePaymentMethods`, `usePayRent`, `useAddPaymentMethod`                           |

---

## 8. Per-Row Loading State

For payment table rows with in-flight actions, loading state is tracked with local component `useState` - not a global store, not `mutation.isPending` alone (which is global across all rows):

```tsx
const [processingPeriodMonth, setProcessingPeriodMonth] = useState<string | null>(null);

const handleMarkPaid = (periodMonth: string) => {
  setProcessingPeriodMonth(periodMonth);
  markPaid.mutate(
    { periodMonth },
    {
      onSuccess: () => showToast("Payment marked as paid successfully.", "success"),
      onError: (err) => showToast((err as Error).message, "error"),
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

### strings.ts - Copy Management

All user-visible copy is stored in a single typed object, imported as `@repo/tokens`:

```ts
export const strings = {
  manager: {
    dashboard:  { title, subtitle, loading, error, emptyTitle, ... },
    unitDetail: { loading, error, emptyTitle, ... },
    ...
  },
  tenant: {
    dashboard:    { loading, error, emptyTitle, payments: { empty, emptyDescription, ... } },
    payRentModal: { title, amount, selectMethod, methodsLoading, ... },
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

### colors.ts - Semantic Color Map

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

### Why a shared `@repo/platform-types` package instead of duplicating types?

Both `apps/web` route handlers and `packages/data/apiClient` need the snake_case wire types. Keeping a copy in each location means they drift silently - a field added to one is missed in the other until a runtime mismatch surfaces. A shared `@repo/platform-types` package makes the type the only source of truth; both consumers declare `"@repo/platform-types": "workspace:*"` and import directly.

### Why `transpilePackages` instead of a build pipeline?

Packages ship TypeScript source directly. Next.js compiles them in-process via `transpilePackages`. This eliminates the Turborepo `build` task dependency chain, `dist/` folder management, and cache invalidation tuning for a single-consumer monorepo. If a second app were added, adding a `tsc` build per package would be the natural next step.

### Why `onSettled` (not `onSuccess`) for `invalidateQueries`?

`onSettled` fires for both success and error. This ensures the cache stays consistent even after a failure - any optimistic update rolled back in `onError` still triggers a re-fetch to confirm server state. Using `onSuccess` alone would leave the cache stale after certain error scenarios.

### Why per-row loading state over `mutation.isPending`?

`mutation.isPending` is `true` for any in-flight mutation on that hook instance - it cannot distinguish which row triggered it. `processingPeriodMonth: string | null` costs one `useState` and gives per-row isolation with no shared state overhead.

### Why `staleTime: 5 * 60 * 1000` on read queries?

Navigating between property detail and unit detail (and back) would trigger unnecessary network requests without stale time. Five minutes covers normal browsing patterns without stale data risk. Payment lists deliberately have no `staleTime` so they always reflect the latest server state after mutations.

### Why shadcn variants are mapped to token classes (not CSS variables)?

shadcn's default "base-nova" style uses `@theme inline` and CSS variable-based tokens - a Tailwind v4 feature. This project uses Tailwind v3. Rather than upgrading or introducing a CSS variable layer, Button variants are written directly with token classes (`bg-brand-600`, `bg-danger-500`). The shadcn architecture (accessible primitive + `cva` + `cn`) is preserved while staying within the existing Tailwind v3 token conventions.
