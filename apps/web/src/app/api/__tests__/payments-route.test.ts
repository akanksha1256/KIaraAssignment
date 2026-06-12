import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { Payment, Lease } from "@repo/platform-types";

// ── DB mock (reset before each test) ────────────────────────────────────────

const lease: Lease = {
  id: "lease-1",
  unit_id: "unit-1",
  tenant_id: "tenant-1",
  start_date: "2024-01-01T00:00:00.000Z",
  end_date: "2024-12-31T00:00:00.000Z",
  monthly_rent: 1800,
  terms: "12-month lease.",
  lease_document: null,
};

const payment: Payment = {
  id: "pay-1",
  lease_id: "lease-1",
  period_month: "2024-06",
  amount_due: 1800,
  amount_paid: 1800,
  status: "paid",
  paid_date: "2024-06-01T00:00:00.000Z",
  method: "Bank Transfer",
  last_reminded_on: null,
};

const mockDb = {
  leases: [lease] as Lease[],
  payments: [payment] as Payment[],
  paymentMethods: [],
  properties: [],
  units: [],
  tenants: [],
};

vi.mock("@/platform/db", () => ({ db: mockDb, generateId: (p: string) => `${p}-new` }));
vi.mock("@/platform/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/platform/utils")>();
  return { ...actual, withDelay: vi.fn().mockImplementation(async (req: import('next/server').NextRequest) => { if (req.nextUrl.searchParams.get('fail') === 'true') throw new Error('Forced failure (fail=true)'); }) };
});

beforeEach(() => {
  mockDb.payments = [{ ...payment }];
});

// ── Import route handler after mocks are registered ──────────────────────────

const { GET } = await import("@/app/api/leases/[id]/payments/route");

// ── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/leases/[id]/payments", () => {
  it("returns all payments for a known lease", async () => {
    const req = new NextRequest("http://localhost/api/leases/lease-1/payments");
    const res = await GET(req, { params: { id: "lease-1" } });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].lease_id).toBe("lease-1");
    expect(body[0].period_month).toBe("2024-06");
  });

  it("returns an empty array for a lease with no payments", async () => {
    const req = new NextRequest("http://localhost/api/leases/unknown-lease/payments");
    const res = await GET(req, { params: { id: "unknown-lease" } });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns only payments belonging to the requested lease", async () => {
    mockDb.payments = [
      { ...payment, id: "pay-1", lease_id: "lease-1" },
      { ...payment, id: "pay-2", lease_id: "lease-2", period_month: "2024-07" },
    ];

    const req = new NextRequest("http://localhost/api/leases/lease-1/payments");
    const res = await GET(req, { params: { id: "lease-1" } });
    const body = await res.json();

    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("pay-1");
  });

  it("returns an error response when ?fail=true", async () => {
    const req = new NextRequest("http://localhost/api/leases/lease-1/payments?fail=true");
    const res = await GET(req, { params: { id: "lease-1" } });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toHaveProperty("message");
  });
});
