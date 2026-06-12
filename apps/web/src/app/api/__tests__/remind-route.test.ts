import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { Payment, Lease } from "@repo/platform-types";

// ── DB mock ──────────────────────────────────────────────────────────────────

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

const outstandingPayment: Payment = {
  id: "pay-1",
  lease_id: "lease-1",
  period_month: "2024-06",
  amount_due: 1800,
  amount_paid: 0,
  status: "outstanding",
  paid_date: null,
  method: null,
  last_reminded_on: null,
};

const mockDb = {
  leases: [lease] as Lease[],
  payments: [outstandingPayment] as Payment[],
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
  mockDb.payments = [{ ...outstandingPayment }];
});

const { POST } = await import("@/app/api/leases/[id]/remind/route");

// ── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/leases/[id]/remind", () => {
  it("sets last_reminded_on to the current timestamp and returns the updated payment", async () => {
    const before = new Date();

    const req = new NextRequest("http://localhost/api/leases/lease-1/remind", {
      method: "POST",
      body: JSON.stringify({ period_month: "2024-06" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: { id: "lease-1" } });

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.last_reminded_on).not.toBeNull();
    const remindedAt = new Date(body.last_reminded_on);
    expect(remindedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("mutates the in-memory payment record so subsequent reads reflect the reminder", async () => {
    const req = new NextRequest("http://localhost/api/leases/lease-1/remind", {
      method: "POST",
      body: JSON.stringify({ period_month: "2024-06" }),
      headers: { "Content-Type": "application/json" },
    });

    await POST(req, { params: { id: "lease-1" } });

    expect(mockDb.payments[0].last_reminded_on).not.toBeNull();
  });

  it("returns 404 when the lease does not exist", async () => {
    const req = new NextRequest("http://localhost/api/leases/bad-lease/remind", {
      method: "POST",
      body: JSON.stringify({ period_month: "2024-06" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: { id: "bad-lease" } });

    expect(res.status).toBe(404);
    expect((await res.json()).message).toBe("Lease not found");
  });

  it("returns 404 when no payment exists for that period", async () => {
    const req = new NextRequest("http://localhost/api/leases/lease-1/remind", {
      method: "POST",
      body: JSON.stringify({ period_month: "2099-01" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: { id: "lease-1" } });

    expect(res.status).toBe(404);
    expect((await res.json()).message).toBe("Payment not found");
  });

  it("returns 500 when ?fail=true is set", async () => {
    const req = new NextRequest("http://localhost/api/leases/lease-1/remind?fail=true", {
      method: "POST",
      body: JSON.stringify({ period_month: "2024-06" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: { id: "lease-1" } });

    expect(res.status).toBe(500);
  });
});
