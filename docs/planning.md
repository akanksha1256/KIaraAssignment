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
- Design system: single `strings.ts` for all copy, `colors.ts` for semantic palette, Tailwind token preset
- Three-guard loading pattern (loading / error / empty) on every data-fetching view
- snake_case ↔ camelCase boundary enforced at `mappers.ts` — only file that touches platform types

---

## What Was Cut and Why

### Create / Edit flows (properties, units, leases, tenants)

The brief asked for management of properties and leases. The full CRUD surface — create-property forms, edit-unit modals, new-lease wizards — was scoped out in favour of completing the read + action paths end-to-end. The decision was time: building correct form validation, controlled inputs, error surfaces, and the corresponding POST/PATCH API routes for each entity would have consumed the remaining time without producing the more visible read/action behaviour the brief emphasised. The data model and route structure are designed so these forms can be added incrementally (one entity at a time) without restructuring anything.

### shadcn/ui (or any third-party component library)

All UI components (DataTable, Pill, RowMenu, Toast, StatCard, Card, LoadingState, ErrorState, EmptyState) were written from scratch using Tailwind and Lucide. Adding shadcn was considered and rejected for two reasons: (1) it would have introduced a Radix dependency and a generated component layer that adds setup cost and noise before any feature is done; (2) writing the components directly gave full control over the design-token wiring (all colors and copy from a single source of truth) and the specific behaviours needed (portal-based RowMenu dropdown, per-row spinner isolation, fixed-top toast). The result is a smaller, fully-owned component set with no hidden abstractions.

### Authentication / session management

There is no login. Manager and tenant views are separated by route namespace only (`/manager` vs `/tenant`). The tenant view is hardcoded to Alice Johnson (tenant-1). Auth would require a session layer, middleware route protection, and role-aware data fetching — none of which changes the core data or UI behaviour being demonstrated. It was cut cleanly and the app is structured so a JWT-based auth wrapper could be layered in without touching any view or hook.

### Real-time sync / WebSockets

Multiple managers acting on the same portfolio would see stale data across tabs. Not implemented — the mock backend is in-process and doesn't support broadcast. TanStack Query's `invalidateQueries` is the right hook point for adding SSE or WebSocket invalidation later.

### Test coverage

No automated tests were written. Unit tests for hooks and mappers, MSW-based integration tests for API routes, and Playwright E2E for the pay-rent and mark-paid flows are the natural next additions — in that priority order.

### Monorepo package extraction

The brief mentioned extracting a `packages/ui` and `packages/tokens` layer. The `packages/` directory is scaffolded but empty. The design system lives inside `apps/web/src/client/designSystems/` for now. Extraction is straightforward (move files, update tsconfig paths) but was not worth the Turborepo pipeline complexity on a single-consumer monorepo.

---

## What Would Be Done Next

In priority order:

1. **Create / Edit forms** — property, unit, and lease creation using controlled forms, Zod validation, and the mutation hook pattern already established. Lease editing (end date, rent amount) and tenant KYC update would follow.
2. **Test suite** — hooks and mappers are pure enough for unit tests without mocking. API routes can be integration-tested with a reset-db helper. Playwright for the two critical write flows (mark paid, pay rent).
3. **Authentication** — Next.js middleware route guard, a session cookie or JWT, and a login page. The manager/tenant split in routing maps directly to two roles.
4. **Pagination** — the payment history tables load all records. `useInfiniteQuery` with cursor-based pagination on the payments endpoint is the right next step once the dataset grows.
5. **Monorepo package extraction** — move `designSystems/` into `packages/tokens` and `commonComponents/` into `packages/ui`, wire up Turborepo's internal package build pipeline.
6. **Real-time invalidation** — a lightweight SSE endpoint (`/api/events`) that broadcasts cache-key invalidation events; the client subscribes and calls `queryClient.invalidateQueries` on receipt.

---

## Key Technical Decision

**TanStack Query instead of Redux Toolkit + Redux-Observable**

The original brief and starter README referenced Redux + epics. After reviewing the feature surface, that stack was replaced with TanStack Query v5. The rationale: every operation in this app is either a read (fetch + cache + stale-time) or a write with optimistic update + rollback + re-fetch. TanStack Query covers that pattern natively — `useQuery`, `useMutation`, `onMutate`/`onError`/`onSettled` — with no reducers, no action creators, no epics, and no selector boilerplate. The resulting hook files are smaller and the data-flow is traceable in a single file per operation. The trade-off is that TanStack Query is not a general-purpose state store, so any genuinely global UI state (e.g. a cross-view notification counter) would need a separate solution — none arose in this scope.
