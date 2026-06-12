# CLAUDE.md — Project Conventions & Best Practices

This file guides Claude in all sessions for this project. Follow every rule here without being asked. These were established through the development of this codebase and reflect deliberate architectural decisions.

---

## Project Overview

A two-sided rent management portal:

- **Manager view** at `/manager` — property/unit/lease/tenant management, payment actions
- **Tenant view** at `/tenant` — read-only dashboard + pay rent (tenant-1 / Alice Johnson by default)

Stack: Next.js 14 App Router · TypeScript · TanStack Query v5 · Tailwind CSS · Recharts · pnpm + Turborepo

---

## 1. Data Fetching — TanStack Query

### Query hooks live in `src/client/hooks/`

Every async read is a `useQuery` hook, every write is a `useMutation` hook. There is no global Redux store.

```ts
// Query key factory — always export so mutations can reference it
export const propertyDetailKey = (id: string) => ["property", "detail", id] as const;

export function usePropertyDetail(propertyId: string) {
  return useQuery({
    queryKey: propertyDetailKey(propertyId),
    queryFn: () => api.getPropertyDetail(propertyId),
    staleTime: 5 * 60 * 1000, // 5 min — prevents re-fetch on tab revisit
    enabled: !!propertyId,
  });
}
```

### Mutation hooks — optimistic update pattern

```ts
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

Always use `onSettled` (not `onSuccess`) for `invalidateQueries` — it fires for both success and error, keeping the cache consistent even after rollback.

### Per-row loading state

Use `processingPeriodMonth: string | null` in local `useState` — not a global or boolean — so each row independently tracks whether it is in-flight:

```ts
const [processingPeriodMonth, setProcessingPeriodMonth] = useState<string | null>(null);

const handleMarkPaid = (periodMonth: string) => {
  setProcessingPeriodMonth(periodMonth);
  markPaid.mutate(
    { periodMonth },
    {
      onSuccess: () => showToast("Payment marked as paid successfully."),
      onError: (err) => showToast(err.message, "error"),
      onSettled: () => setProcessingPeriodMonth(null),
    },
  );
};
```

### Query key conventions

| Key                            | What it covers                                    |
| ------------------------------ | ------------------------------------------------- |
| `["manager", "dashboard"]`     | Manager dashboard (stats, charts, property list)  |
| `["property", "detail", id]`   | Property + all units                              |
| `["tenant", "profile", id]`    | Tenant profile (manager view)                     |
| `["tenant", "dashboard", id]`  | Tenant dashboard (tenant view — lease + payments) |
| `["payments", leaseId]`        | Payment list for a lease                          |
| `["paymentMethods", tenantId]` | Saved payment methods                             |

---

## 2. Import Path Rules

### Types — single source of truth

All camelCase client types live in `src/client/types/index.ts`. Import from there:

```ts
import type { Payment, Lease, TenantProfile } from "@/client/types";
```

**Never** import `@/platform/types` in components, views, or hooks — only in `apiClient/client.ts` and `apiClient/mappers.ts`.

### snake_case / camelCase boundary

- `src/platform/types/` — snake_case wire format (matches API/DB)
- `src/client/types/index.ts` — camelCase client types
- `src/client/apiClient/mappers.ts` — the **only** place that converts between them

### Path aliases

All client-side imports use `@/client/...`. All platform imports use `@/platform/...`. Never use relative paths that cross these boundaries.

---

## 3. API & Data Rules

### Every route handler calls `withDelay(req)`

```ts
export async function GET(req: NextRequest) {
  try {
    await withDelay(req); // adds 800ms delay; ?fail=true throws
    // ...
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
```

### All dates are ISO UTC strings

Store and return: `"2024-01-15T00:00:00.000Z"`. Never store display strings or JS Date objects in the DB or state.

Format for display using the shared helpers:

```ts
formatDate("2024-01-15T00:00:00.000Z"); // → "15 Jan 2024"
formatPeriodMonth("2024-06"); // → "Jun 2024"
```

### New payment records always include `last_reminded_on: null`

Any route that creates a payment must include this field.

---

## 4. Component & View Rules

### Every data-fetching view uses the three-guard pattern

```tsx
const { data, isLoading, isError, error, refetch } = useSomeQuery(id);

if (isLoading) return <LoadingState message={s.loading} />;
if (isError)
  return <ErrorState message={(error as Error)?.message ?? s.error} onRetry={() => refetch()} />;
if (!data) return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;
// render content
```

Never render partial content without these guards.

### Pages are thin server components

```tsx
// app/manager/properties/[id]/page.tsx
import { PropertyDetail } from "@/client/views/properties/PropertyDetail";
export default function Page({ params }: { params: { id: string } }) {
  return <PropertyDetail propertyId={params.id} />;
}
```

All logic lives in the view component (`"use client"`). Pages never contain hooks or state.

### No inline strings in components

All user-facing copy lives in `src/client/designSystems/strings.ts`. Reference it as:

```ts
const s = strings.manager.unitDetail; // pick the relevant section
// then use s.loading, s.emptyTitle, etc.
```

### No hardcoded colors in components

Use Tailwind classes from the design token palette only (`brand-*`, `neutral-*`, `success-*`, `warning-*`, `danger-*`). For dynamic colors (charts, status), use `colors.ts`.

---

## 5. UI Component Rules

### DataTable uses `table-auto`

The `DataTable` component uses `table-auto` (not `table-fixed`) so `w-*` classes on `<th>` columns actually take effect. Column widths are set via `className` on the column definition:

```ts
{ label: "Address", align: "right", className: "w-96" }
```

### Status pills with `flex justify-end` for right-alignment

`<Pill>` uses `inline-flex` internally. To right-align it inside a `<td>`, wrap it:

```tsx
content: <div className="flex justify-end">
  <Pill status={row.status} />
</div>;
```

`text-right` on the `<td>` does not move `inline-flex` children.

### RowMenu — always use `dropdownRef` and `stopPropagation`

The portal-based dropdown needs both `buttonRef` and `dropdownRef` in the outside-click handler. Menu items must call `onMouseDown={e => e.stopPropagation()}` to prevent the portal from unmounting before the click fires.

### Toast — always use `useToast()` hook

```ts
const { showToast } = useToast();
showToast("Message here", "success"); // or "error"
```

Toasts are fixed top-right and auto-dismiss after 4 seconds.

---

## 6. Adding a New Feature — Checklist

When adding a new data-driven feature, follow this order:

1. **Platform type** — add to `src/platform/types/index.ts` (snake_case)
2. **DB seed** — add data to `src/platform/db/index.ts`
3. **API route** — add route handler under `src/app/api/`
4. **Client type** — add to `src/client/types/index.ts` (camelCase)
5. **Mapper** — add mapping function in `src/client/apiClient/mappers.ts`
6. **API client method** — add to `src/client/apiClient/client.ts`
7. **Query/mutation hook** — add to `src/client/hooks/` with exported key factory
8. **View** — build view component with three-guard loading pattern, using the new hook
9. **Page** — add thin server component under `src/app/`
10. **Strings** — add all copy to `strings.ts`

---

## 7. What NOT to Do

- Do not use Redux, `createSlice`, `createAction`, `extraReducers`, epics, or RxJS — the project uses TanStack Query
- Do not import `@/platform/types` in components, views, or hooks
- Do not import types from anywhere other than `@/client/types` in client code
- Do not hardcode copy strings in components — use `strings.ts`
- Do not hardcode colors — use the design token classes or `colors.ts`
- Do not use `table-fixed` in DataTable (breaks explicit column widths)
- Do not use `text-right` to align `inline-flex` pill elements — use `flex justify-end` wrapper
- Do not add `$` or currency formatting to count-based charts (payment status donut)
- Do not use `animate-in` / `slide-in-from-*` Tailwind classes — `tailwindcss-animate` is not installed
- Do not store JS `Date` objects in the DB or state — always use ISO UTC strings
- Do not skip `last_reminded_on: null` when creating new payment records
- Do not use `onSuccess` alone for `invalidateQueries` — always use `onSettled` so the cache stays consistent after errors too
