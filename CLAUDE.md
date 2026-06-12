# CLAUDE.md — Project Conventions & Best Practices

This file guides Claude in all sessions for this project. Follow every rule here without being asked. These were established through the development of this codebase and reflect deliberate architectural decisions.

---

## Project Overview

A two-sided rent management portal:
- **Manager view** at `/manager` — property/unit/lease/tenant management, payment actions
- **Tenant view** at `/tenant` — read-only dashboard (tenant-1 / Alice Johnson by default)

Stack: Next.js 14 App Router · TypeScript · Redux Toolkit + Redux-Observable · Tailwind CSS · Recharts · pnpm + Turborepo

---

## 1. State Management Rules

### Slice pattern — always use `reducers`, never `extraReducers` for your own actions

```ts
// ✅ CORRECT — actions defined in reducers, auto-generates typed action creators
const mySlice = createSlice({
  name: "mySlice",
  initialState,
  reducers: {
    fetchSomething: (state, action: PayloadAction<string>) => { ... },
    fetchSomethingSuccess: (state, action: PayloadAction<SomeType>) => { ... },
    fetchSomethingFailure: (state, action: PayloadAction<{ id: string; error: string }>) => { ... },
  },
});

// ❌ WRONG — do not use createAction + extraReducers for actions that belong to this slice
```

`extraReducers` is **only** for reacting to actions owned by another slice (e.g. `unitSlice` reacting to `property/fetchPropertyById`).

### Fetch state types — use the right one for the job

```ts
// For entity fetches (loading a page's data):
type FetchStateWithError = {
  status: "not-started" | "pending" | "completed" | "failed";
  error: string | null;
};

// For mutation actions (mark paid, send reminder, pay rent):
type FetchState<T> = { data: T | null; loading: boolean; error: string | null };

// For per-entity caching:
type FetchStateMap<T> = Record<string, FetchState<T>>;
```

### Always preserve existing data on pending/failure

```ts
fetchSomething: (state, action: PayloadAction<string>) => {
  state.dataById[action.payload] = {
    fetchState: { status: "pending", error: null },
    data: state.dataById[action.payload]?.data ?? null, // preserve stale data
  };
},
```

### Store shape

All manager-related slices live under `managerDashboard/`. The tenant dashboard has its own isolated slice under `tenantDashboard/`. Never mix them.

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

### Epics pattern

Every async operation lives in a `epics/index.ts` file alongside its slice. Use `mergeMap` + `catchError`:

```ts
const fetchSomethingEpic: Epic = (action$) =>
  action$.pipe(
    ofType(fetchSomething.type),
    mergeMap((action: ReturnType<typeof fetchSomething>) =>
      from(api.getSomething(action.payload)).pipe(
        mergeMap((data) => of(fetchSomethingSuccess({ id: action.payload, data }))),
        catchError((err: Error) =>
          of(fetchSomethingFailure({ id: action.payload, error: err.message }))
        ),
      ),
    ),
  );
```

### Selectors — always curried for per-ID lookups

```ts
export const selectTenantProfile =
  (id: string) => (state: RootState) => {
    const entry = state.tenant.tenantDataById[id];
    return {
      status:  entry?.fetchState.status ?? "not-started",
      error:   entry?.fetchState.error  ?? null,
      profile: entry?.data              ?? null,
    };
  };
```

---

## 2. Import Path Rules

### snake_case / camelCase boundary

- `src/platform/types/` — snake_case wire format (matches API/DB)
- `src/client/stateManagement/*/type.ts` — camelCase client types
- `src/client/apiClient/mappers.ts` — the **only** place that converts between them

**No component or slice ever imports from `@/platform/types` directly** (except the API client/mappers layer).

### Path aliases

All client-side imports use `@/client/...`. All platform imports use `@/platform/...`. Never use relative paths that cross these boundaries.

### Depth awareness for relative imports

Files inside `managerDashboard/[slice]/` are three levels deep from `src/client/`. Adjust relative paths accordingly:
- `../../helpers/type` → `../../../helpers/type`
- `../mainFile` → `../../mainFile`

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
formatDate("2024-01-15T00:00:00.000Z")  // → "15 Jan 2024"
formatPeriodMonth("2024-06")             // → "Jun 2024"
```

### New payment records always include `last_reminded_on: null`

Any route that creates a payment must include this field.

---

## 4. Component & View Rules

### Every data-fetching view uses the three-guard pattern

```tsx
if (status === "pending") return <LoadingState message={s.loading} />;
if (error)               return <ErrorState message={error} onRetry={() => dispatch(fetch(id))} />;
if (!data)               return <EmptyState title={s.emptyTitle} description={s.emptyDescription} />;
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

## 5. Optimistic Update Pattern

For mutations that should feel instant:

```ts
// 1. In the slice — snapshot, apply optimistic change
managerMarkPaid: (state, action) => {
  const payments = state.paymentsByLeaseId[action.payload.leaseId]?.data ?? [];
  state.markPaidState = { data: null, loading: true, error: null };
  state.markPaidState.previousPayments = payments; // snapshot for rollback
  // apply optimistic update to paymentsByLeaseId...
},

// 2. On failure — restore snapshot
managerMarkPaidFailure: (state, action) => {
  if (state.markPaidState.previousPayments) {
    state.paymentsByLeaseId[action.payload.leaseId].data = state.markPaidState.previousPayments;
  }
  state.markPaidState = { data: null, loading: false, error: action.payload.error };
},
```

### Per-row loading state

Use `processingPeriodMonth: string | null` (not a boolean) so each row independently tracks whether it is in-flight:

```ts
const [processingPeriodMonth, setProcessingPeriodMonth] = useState<string | null>(null);
const processingRef = useRef<string | null>(null); // set before dispatch, cleared in effect
```

### Toast dispatch detection

Use a `ref` set synchronously before dispatch. The `useEffect` checks the ref to avoid showing toasts triggered by other components:

```ts
const handleMarkPaid = (periodMonth: string) => {
  processingRef.current = periodMonth; // set before dispatch
  dispatch(managerMarkPaid({ leaseId, periodMonth }));
};

useEffect(() => {
  if (!processingRef.current) return; // not our dispatch — ignore
  if (!markPaidState.loading && markPaidState.data) {
    showToast("Payment marked as paid successfully.", "success");
    processingRef.current = null;
  }
}, [markPaidState]);
```

---

## 6. UI Component Rules

### DataTable uses `table-auto`

The `DataTable` component uses `table-auto` (not `table-fixed`) so `w-*` classes on `<th>` columns actually take effect. Column widths are set via `className` on the column definition:

```ts
{ label: "Address", align: "right", className: "w-96" }
```

### Status pills with `flex justify-end` for right-alignment

`<Pill>` uses `inline-flex` internally. To right-align it inside a `<td>`, wrap it:

```tsx
content: <div className="flex justify-end"><Pill status={row.status} /></div>
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

## 7. Adding a New Feature — Checklist

When adding a new data-driven feature, follow this order:

1. **Platform type** — add to `src/platform/types/index.ts` (snake_case)
2. **DB seed** — add data to `src/platform/db/index.ts`
3. **API route** — add route handler under `src/app/api/`
4. **Client type** — add to the relevant `stateManagement/*/type.ts` (camelCase)
5. **Mapper** — add mapping function in `src/client/apiClient/mappers.ts`
6. **API client method** — add to `src/client/apiClient/client.ts`
7. **Slice** — add actions (fetch/success/failure) in `reducers: {}`
8. **Epic** — add epic in `epics/index.ts`, register in `mainFile.ts`
9. **Selector** — add curried selector
10. **View** — build view component with three-guard loading pattern
11. **Page** — add thin server component under `src/app/`
12. **Strings** — add all copy to `strings.ts`

---

## 8. What NOT to Do

- Do not use `createAction` + `extraReducers` for actions owned by the same slice
- Do not import `@/platform/types` in components or views
- Do not hardcode copy strings in components — use `strings.ts`
- Do not hardcode colors — use the design token classes or `colors.ts`
- Do not use `table-fixed` in DataTable (breaks explicit column widths)
- Do not use `text-right` to align `inline-flex` pill elements — use `flex justify-end` wrapper
- Do not add `$` or currency formatting to count-based charts (payment status donut)
- Do not use `animate-in` / `slide-in-from-*` Tailwind classes — `tailwindcss-animate` is not installed
- Do not store JS `Date` objects in Redux state or the DB — always use ISO UTC strings
- Do not skip `last_reminded_on: null` when creating new payment records
