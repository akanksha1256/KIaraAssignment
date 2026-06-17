# RentPortal

A two-sided rent management portal built with Next.js 14, TanStack Query v5, Tailwind CSS, Recharts, and shadcn/ui - structured as a pnpm + Turborepo monorepo.

---

## Prerequisites

- **Node.js** 18+
- **pnpm** 11+ - install with `npm install -g pnpm`

---

## Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd KIaraAssignment

# 2. Install dependencies
pnpm install
```

---

## Running the App

```bash
# Start the development server (runs the Next.js app via Turborepo)
pnpm dev
```

The app will be available at **http://localhost:3000**.

| Route                                     | Description                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `/manager`                                | Manager dashboard - portfolio overview, properties table                 |
| `/manager/properties/[id]`                | Property detail - units list                                             |
| `/manager/properties/[id]/units/[unitId]` | Unit detail - tenant, lease, payment history                             |
| `/manager/tenants/[id]`                   | Tenant profile - KYC, payment standing, history                          |
| `/tenant`                                 | Tenant view - read-only dashboard (defaults to Alice Johnson / tenant-1) |

---

## Monorepo Structure

```
KIaraAssignment/
├── apps/
│   └── web/                  # Next.js 14 app (pages, API routes, view components)
└── packages/
    ├── tokens/               # Design system primitives
    │   └── src/
    │       ├── colors.ts     # Semantic color palette
    │       ├── strings.ts    # All user-facing copy (single source of truth)
    │       ├── fonts.ts
    │       ├── spaces.ts
    │       └── tailwindPreset.js  # Tailwind preset consumed by apps/web
    ├── data/                 # All async logic
    │   └── src/
    │       ├── types/        # camelCase client types
    │       ├── wireTypes.ts  # snake_case wire types (internal, not exported)
    │       ├── apiClient/    # API client + mappers (snake_case ↔ camelCase boundary)
    │       └── hooks/        # TanStack Query hooks (useQuery + useMutation)
    └── ui/                   # Shared components
        └── src/
            ├── Button.tsx    # shadcn-style button (cva + @base-ui/react)
            ├── DataTable.tsx
            ├── Pill.tsx
            ├── StatCard.tsx
            ├── Toast.tsx     # Sonner-based toast
            ├── Nav.tsx
            ├── Providers.tsx # QueryClientProvider + Toaster
            └── ...
```

Packages ship TypeScript source directly - `apps/web` compiles them via `transpilePackages` in `next.config.mjs`, no build step required.

---

## Mock Backend

All data lives in-memory in [`apps/web/src/platform/db/index.ts`](apps/web/src/platform/db/index.ts). API routes under `apps/web/src/app/api/` read and mutate this in-process store - no database or external service is required.

### Simulating delay

Every API route calls `withDelay()` before responding, which adds an **800 ms artificial delay** to simulate network latency. This is defined in [`apps/web/src/platform/utils.ts`](apps/web/src/platform/utils.ts):

```ts
export const DELAY_MS = 800;
```

To change the delay globally, edit `DELAY_MS` in that file.

### Triggering a forced failure

Any API endpoint can be forced to return a 500 error by appending `?fail=true` to the request URL. The `withDelay()` utility checks for this query parameter and throws before the handler runs.

**From the browser / curl:**

```bash
# Force the dashboard endpoint to fail
curl "http://localhost:3000/api/manager/dashboard?fail=true"

# Force a payments fetch to fail
curl "http://localhost:3000/api/leases/lease-1/payments?fail=true"
```

**From a TanStack Query hook (in code):** pass `fail=true` as a query param when constructing the fetch URL inside any `queryFn` or `mutationFn` - the backend will throw and TanStack Query will surface the error through `isError` / `onError`, showing the error state in the UI.

### API routes reference

| Method | Route                               | Description                                                      |
| ------ | ----------------------------------- | ---------------------------------------------------------------- |
| `GET`  | `/api/manager/dashboard`            | Portfolio stats, revenue chart, payment breakdown, property list |
| `GET`  | `/api/properties/[id]`              | Property detail + units summary                                  |
| `GET`  | `/api/tenants/[id]`                 | Tenant profile, KYC, payment standing                            |
| `GET`  | `/api/leases/[id]/payments`         | Payment history for a lease                                      |
| `POST` | `/api/leases/[id]/pay`              | Mark a period as paid                                            |
| `POST` | `/api/leases/[id]/remind`           | Send a payment reminder                                          |
| `GET`  | `/api/tenants/[id]/payment-methods` | Saved payment methods for a tenant                               |
| `POST` | `/api/tenants/[id]/payment-methods` | Add a new payment method                                         |

---

## Second Pass — Design Feedback Addressed

The first submission was reviewed and flagged on six points. Here is exactly what was missing and how each was resolved:

| Feedback | What Was Missing | Resolution |
| --- | --- | --- |
| **No mobile support** | Sidebar always visible, tables desktop-only, no small-screen nav | Bottom nav bar at `<md`, slide-in sidebar drawer, card-per-row table fallback at `<sm` across all list views |
| **Spinners instead of skeletons** | Generic `Loader2` spinner on every loading state — no layout preview | Every view now has a `*LoadingScreen.tsx` skeleton that mirrors the real content's grid and card structure, including responsive breakpoints |
| **Stat cards lacked context** | Collection rate showed only "73%" — no dollar amounts | Card subtitle now shows "$X of $Y collected"; all four stat cards show SVG sparklines from 12 months of trend data |
| **Mobile scroll broken** | PaymentsList and TenantsList showed only two rows on mobile | `overflow-hidden` on outer wrapper was clipping the card list; added `flex flex-col` + `flex-1 overflow-y-auto` on both mobile and desktop scroll divs |
| **PaymentsTable header not rounded** | Table header corners were flush on large screens | `overflow-hidden` had been stripped when mobile/desktop divs were split; restored alongside `flex flex-col` on the outer wrapper |
| **Modal keyboard trap fragile** | Manual `useEffect` Escape handler — no Tab/Shift+Tab focus trapping | Replaced with `focus-trap-react`: proper focus trap, Escape deactivation blocked during processing, `onDeactivate: onClose` handles all close paths |

---

## Key Conventions

- **Data fetching** - every read is a `useQuery` hook, every write is a `useMutation` hook in `packages/data/src/hooks/`. No global store.
- **Optimistic updates** - mutations use `onMutate`/`onError`/`onSettled` for immediate UI feedback with automatic rollback on failure.
- **Type boundary** - `packages/data/src/wireTypes.ts` (snake_case, internal) ↔ `packages/data/src/types/` (camelCase, exported). Only `apiClient/mappers.ts` crosses this boundary.
- **Copy** - all user-facing strings live in `packages/tokens/src/strings.ts`. Nothing is hardcoded in components.
- **Colors** - Tailwind token classes only (`brand-*`, `neutral-*`, `success-*`, `warning-*`, `danger-*`). No hardcoded hex values in components.
- **Loading states** - every data-fetching view uses the three-guard pattern: `isLoading` → `<LoadingState>`, `isError` → `<ErrorState>`, `!data` → `<EmptyState>`.

---

## Other Commands

```bash
pnpm build        # Production build (all packages + app)
pnpm lint         # ESLint
pnpm type-check   # TypeScript check (no emit)
```
