# RentPortal

A two-sided rent management portal built with Next.js 14, TanStack Query, Tailwind CSS, and Recharts.

---

## Prerequisites

- **Node.js** 18+
- **pnpm** 11+ — install with `npm install -g pnpm`

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

| Route | Description |
|---|---|
| `/manager` | Manager dashboard — portfolio overview, properties table |
| `/manager/properties/[id]` | Property detail — units list |
| `/manager/properties/[id]/units/[unitId]` | Unit detail — tenant, lease, payment history |
| `/manager/tenants/[id]` | Tenant profile — KYC, payment standing, history |
| `/tenant` | Tenant view — read-only dashboard (defaults to Alice Johnson / tenant-1) |

---

## Mock Backend

All data lives in-memory in [`apps/web/src/platform/db/index.ts`](apps/web/src/platform/db/index.ts). API routes under `src/app/api/` read and mutate this in-process store — no database or external service is required.

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

**From the Redux thunks (in code):** pass `fail=true` as a query param when constructing the fetch URL inside any epic or thunk — the backend will throw and the slice's failure action will be dispatched, showing the error state in the UI.

### API routes reference

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/manager/dashboard` | Portfolio stats, revenue chart, payment breakdown, property list |
| `GET` | `/api/properties/[id]` | Property detail + units summary |
| `GET` | `/api/tenants/[id]` | Tenant profile, KYC, payment standing |
| `GET` | `/api/leases/[id]/payments` | Payment history for a lease |
| `POST` | `/api/leases/[id]/pay` | Mark a period as paid |
| `POST` | `/api/leases/[id]/remind` | Send a payment reminder |

---

## Other Commands

```bash
pnpm build        # Production build
pnpm lint         # ESLint
pnpm type-check   # TypeScript check (no emit)
```
