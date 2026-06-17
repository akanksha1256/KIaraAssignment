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

### All components are arrow functions

Every React component — views, sub-components, helpers — must be defined as an arrow function and exported with `const`:

```tsx
// ✅ correct
export const MyComponent = ({ label }: { label: string }) => (
  <div>{label}</div>
);

// ❌ wrong
export function MyComponent({ label }: { label: string }) {
  return <div>{label}</div>;
}
```

This applies to local helper components inside a file too (e.g. `const LegendItem = ...`).

### No inline strings in components

All user-facing copy lives in `packages/tokens/src/strings.ts`. Import via `@repo/tokens` and alias the relevant section at the top of the file:

```ts
import { strings } from "@repo/tokens";
const s = strings.manager.unitDetail; // pick the relevant section
// then use s.loading, s.emptyTitle, etc.
```

If a string doesn't exist yet, add it to `strings.ts` first — never write the literal inline in JSX.

### Use Typography components for all text

All text rendering must use a component from `packages/ui/src/Typography.tsx`. Never write raw `text-[Xpx]` Tailwind size classes inline in JSX. If no existing component matches, add one to `Typography.tsx` and export it from `packages/ui/src/index.ts`.

Current palette:

| Component | Size | Weight | Color |
|---|---|---|---|
| `PageTitle` | 40px | semibold | maroon-600 (serif) |
| `SectionTitle` | 36px | semibold | maroon-600 (serif) |
| `CardTitle` | 18px | semibold | espresso-900 |
| `LeadText` | 15px | regular | espresso-700 |
| `LinkText` | 13.5px | medium | maroon-600 |
| `BodyText` | 14px | regular | espresso-700 |
| `PrimaryLabelMedium` | 14px | medium | espresso-900 |
| `PrimaryLabelSemibold` | 14px | semibold | espresso-900 |
| `MutedText` | 13px | regular | muted-foreground |
| `Caption` | 12.5px | regular | muted-foreground |
| `Overline` | 11.5px | semibold uppercase | muted-foreground |
| `StatusLabel` | 11.5px | medium | destructive or warning |
| `MetricValue` | 22px | semibold | espresso-900 |
| `MetricCount` | 20px | semibold | espresso-900 |
| `MoneyText` | 44px (t-money) | — | — |

Use `className` to override color or weight when needed (e.g. `<MutedText className="text-destructive font-medium">`).

### Skeleton loaders live in dedicated `*LoadingScreen.tsx` files

Every skeleton loading state must be extracted into its own file alongside the view it belongs to:

```
views/properties/PropertyDetail.tsx
views/properties/PropertyDetailLoadingScreen.tsx  ← skeleton lives here
```

The skeleton component must be an arrow function and exported by name.

### No hardcoded colors in components

Use Tailwind classes from the design token palette only (`brand-*`, `neutral-*`, `success-*`, `warning-*`, `danger-*`). For dynamic colors (charts, status), use `colors.ts` from `@repo/tokens`.

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
- Do not define React components as `function Foo()` — always use `export const Foo = () =>`
- Do not hardcode copy strings in components — add them to `strings.ts` first, then import via `@repo/tokens`
- Do not use raw `text-[Xpx]` Tailwind classes — use a component from `Typography.tsx`; add one if missing
- Do not hardcode colors — use the design token classes or `colors.ts` from `@repo/tokens`
- Do not define skeleton loaders inline — put them in a `*LoadingScreen.tsx` file next to the view
- Do not name icon imports without the `Icon` suffix — use `import { Building2 as Building2Icon } from "lucide-react"`
- Do not use `table-fixed` in DataTable (breaks explicit column widths)
- Do not use `text-right` to align `inline-flex` pill elements — use `flex justify-end` wrapper
- Do not add `$` or currency formatting to count-based charts (payment status donut)
- Do not use `animate-in` / `slide-in-from-*` Tailwind classes — `tailwindcss-animate` is not installed
- Do not store JS `Date` objects in the DB or state — always use ISO UTC strings
- Do not skip `last_reminded_on: null` when creating new payment records
- Do not use `onSuccess` alone for `invalidateQueries` — always use `onSettled` so the cache stays consistent after errors too
