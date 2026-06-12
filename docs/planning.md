# Planning & Decision Log — Rent Management Portal

## What Was Built

A two-sided rent management portal covering the full read + action surface required by the brief:

**Manager side (`/manager`)**

- Dashboard with portfolio stats, monthly revenue bar chart (expected vs collected, last 6 months), and a payment-status donut chart
- Property list → property detail → unit detail drill-down
- Per-unit payment history table with:
  - **Mark as Paid** — optimistic update with rollback on failure, per-row loading state, toast feedback
  - **Send Reminder** — 24-hour disable window, "Last sent" sublabel, toast feedback
- Tenant profile view with KYC status, on-time payment standing score, current lease card, and read-only payment history

**Tenant side (`/tenant`)**

- Dashboard with property details, manager contact card, lease terms card, and payment history
- **Pay Rent** modal with saved payment method picker, add-new-method flow, optimistic update, and rollback on failure

**Infrastructure**

- In-memory mock backend (Next.js API routes, `withDelay()`, `?fail=true` forced-failure flag)
- TanStack Query v5 for all data fetching — declarative caching, stale-time deduplication, and first-class optimistic mutations
- Three-guard loading pattern (loading / error / empty) on every data-fetching view
- snake_case ↔ camelCase boundary enforced at `mappers.ts` — only file that touches platform types

**Monorepo package split (`packages/`)**

- `packages/tokens` — design system primitives: `colors.ts`, `fonts.ts`, `spaces.ts`, `strings.ts`, and a `tailwindPreset.js` consumed by `apps/web/tailwind.config.ts`. Single source of truth for all copy and color tokens across the workspace.
- `packages/data` — all async logic: camelCase client types (`types/index.ts`), API client (`apiClient/client.ts`), snake_case wire types (`wireTypes.ts`, internal only), mappers, and every TanStack Query hook. Any app in the workspace can import `@repo/data` to get fully-typed hooks without knowing about the Next.js API layer.
- `packages/ui` — all shared components (DataTable, Pill, StatCard, Card, Button, Spinner, Toast, Nav, LoadingState, ErrorState, EmptyState) plus utilities (`cn`, `formatDate`, `formatPeriodMonth`, `statusConfig`). Consumed by `apps/web` via `transpilePackages` — no build step required.
- `apps/web` is now a thin Next.js shell: route handlers, page server components, and view components that import from the three packages above.

**shadcn/ui integration**

- shadcn installed (`components.json` at `apps/web/`).
- `Button` rebuilt using the shadcn pattern: `@base-ui/react/button` as the accessible primitive, `class-variance-authority` for variant composition, variants remapped to project token classes (`brand-*`, `neutral-*`, `danger-*`) to stay compatible with Tailwind v3. All interactive buttons across the app (`PayRentModal`, `UnitDetail`) use this component.
- Toast system replaced with **Sonner** (shadcn's recommended toast solution) — `<Toaster />` lives in `Providers`, call sites use `toast()` / `toast.error()` from `sonner` directly (no `useToast` context needed).

---

## What Was Cut and Why

### Create / Edit flows (properties, units, leases, tenants)

The brief asked for management of properties and leases. The full CRUD surface — create-property forms, edit-unit modals, new-lease wizards — was scoped out in favour of completing the read + action paths end-to-end. The decision was time: building correct form validation, controlled inputs, error surfaces, and the corresponding POST/PATCH API routes for each entity would have consumed the remaining time without producing the more visible read/action behaviour the brief emphasised. The data model and route structure are designed so these forms can be added incrementally (one entity at a time) without restructuring anything.

### Authentication / session management

There is no login. Manager and tenant views are separated by route namespace only (`/manager` vs `/tenant`). The tenant view is hardcoded to Alice Johnson (`tenant-1`).

The hardcoding is intentional for this demo scope: in a real application, a tenant would log in and the session would carry their `tenantId`. The `/tenant` route would read that ID from the session and pass it to `useTenantDashboard(tenantId)`, directing each tenant directly to their own dashboard. Since there is no auth layer here, `tenant-1` is used as a stand-in for "the currently logged-in tenant."

The data-fetching code is already written generically — `useTenantDashboard` and `usePayRent` both accept `tenantId` as a parameter, so swapping in a real session ID requires no changes to hooks or views, only to where the ID is sourced.

### Real-time sync / WebSockets

Multiple managers acting on the same portfolio would see stale data across tabs. Not implemented — the mock backend is in-process and doesn't support broadcast. TanStack Query's `invalidateQueries` is the right hook point for adding SSE or WebSocket invalidation later.

### Test coverage

Automated tests are in place across three layers:

- **Hook tests** (`packages/data/src/hooks/`) — Vitest + `@testing-library/react` `renderHook` in a `happy-dom` environment. Covers `usePayments` (query caching and deduplication), `useMarkPaid`, and `usePayRent`. The optimistic update and rollback paths are explicitly tested: each mutation test pre-populates the cache, mocks the API to fail, and asserts the cache is restored to its pre-mutation snapshot.
- **API route integration tests** (`apps/web/src/app/api/__tests__/`) — Vitest Node environment, `NextRequest` constructed directly against the handler functions. The DB is mocked to a controlled object reset in `beforeEach` so mutations don't leak between tests. `withDelay` is mocked to be instant while preserving the `?fail=true` throw. Covers the payments, pay, remind, and payment-methods routes — happy paths, 404s, validation errors, and forced-failure responses.
- **E2E tests** (`e2e/`) — Playwright against `next dev` via `webServer` in `playwright.config.ts`. Covers the manager dashboard, property and unit detail navigation, mark-paid and send-reminder flows, the tenant dashboard, and the full pay-rent modal sequence (open, select method, pay, success toast).

---

## What Would Be Done Next

In priority order:

1. **Create / Edit forms** — property, unit, and lease creation using controlled forms, Zod validation, and the mutation hook pattern already established. Lease editing (end date, rent amount) and tenant KYC update would follow.
2. **Authentication** — Next.js middleware route guard, a session cookie or JWT, and a login page. The manager/tenant split in routing maps directly to two roles.
3. **Pagination** — the payment history tables load all records. `useInfiniteQuery` with cursor-based pagination on the payments endpoint is the right next step once the dataset grows.
4. **Real-time invalidation** — a lightweight SSE endpoint (`/api/events`) that broadcasts cache-key invalidation events; the client subscribes and calls `queryClient.invalidateQueries` on receipt.

---

## Key Technical Decisions

### TanStack Query as the data layer

The stack is Next.js 14, TanStack Query v5, Tailwind CSS, and Recharts — as specified in the brief. Every async operation maps to one of two primitives: `useQuery` for reads (with declarative caching and stale-time deduplication) and `useMutation` for writes (with `onMutate`/`onError`/`onSettled` for optimistic updates and rollback). Query hooks live in `packages/data/src/hooks/` with exported key factories so mutations can reference and invalidate the correct cache entries. The trade-off is that TanStack Query is not a general-purpose state store — any genuinely global UI state would need a separate solution, but none arose in this scope.

### shadcn with Tailwind v3 — variant remapping, not CSS variables

shadcn's default "base-nova" style targets Tailwind v4 (`@theme inline`, CSS variable-based color tokens). This project uses Tailwind v3 with a custom token preset. Rather than upgrading Tailwind or adopting the CSS variable layer, the Button variants were written directly using the existing token classes (`bg-brand-600`, `bg-danger-500`, etc.). This keeps the shadcn component architecture (accessible primitive + `cva` + `cn`) while staying fully within the project's design token conventions. The same pattern applies to any future shadcn component additions.

### `packages/data` wire-type boundary

The `apps/web` API routes and platform DB use a snake_case wire format (`src/platform/types/`). Rather than exposing that internal path across the workspace, `packages/data` carries its own copy of the wire types in `src/wireTypes.ts` (not exported from the package index). Only `apiClient/client.ts` and `apiClient/mappers.ts` import from it — the same single-file boundary that existed inside `apps/web`, now enforced at the package level.

### `transpilePackages` over a build pipeline

Workspace packages (`@repo/tokens`, `@repo/ui`, `@repo/data`) ship TypeScript source directly — no `tsc` build step, no `dist/` folder. Next.js compiles them on the fly via `transpilePackages` in `next.config.mjs`. This eliminates the Turborepo pipeline complexity (no `build` task dependencies, no cache invalidation tuning) for a single-consumer monorepo while preserving the clean package boundary. If a second consumer app were added, a `tsc` build step per package would be the straightforward next step.
