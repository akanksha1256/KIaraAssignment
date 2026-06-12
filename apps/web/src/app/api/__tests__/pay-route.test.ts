import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { Payment, Lease, PaymentMethod } from "@repo/platform-types";

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

const paymentMethod: PaymentMethod = {
  id: "pm-1",
  tenant_id: "tenant-1",
  label: "Visa ending 4242",
};

const mockDb = {
  leases: [lease] as Lease[],
  payments: [outstandingPayment] as Payment[],
  paymentMethods: [paymentMethod] as PaymentMethod[],
  properties: [],
  units: [],
  tenants: [],
};

const generateId = vi.fn((prefix: string) => `${prefix}-new`);

vi.mock("@/platform/db", () => ({ db: mockDb, generateId }));
vi.mock("@/platform/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/platform/utils")>();
  return { ...actual, withDelay: vi.fn().mockImplementation(async (req: import('next/server').NextRequest) => { if (req.nextUrl.searchParams.get('fail') === 'true') throw new Error('Forced failure (fail=true)'); }) };
});

beforeEach(() => {
  mockDb.payments = [{ ...outstandingPayment }];
  generateId.mockImplementation((prefix: string) => `${prefix}-new`);
});

const { POST } = await import("@/app/api/leases/[id]/pay/route");

// ── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/leases/[id]/pay — mark existing payment as paid", () => {
  it("marks an existing outstanding payment as paid and returns it", async () => {
    const req = new NextRequest("http://localhost/api/leases/lease-1/pay", {
      method: "POST",
      body: JSON.stringify({ period_month: "2024-06", payment_method_id: "pm-1" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: { id: "lease-1" } });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("paid");
    expect(body.amount_paid).toBe(1800);
    expect(body.method).toBe("Visa ending 4242");
    expect(body.paid_date).not.toBeNull();
  });

  it("mutates the in-memory payment record directly (no duplicate created)", async () => {
    const req = new NextRequest("http://localhost/api/leases/lease-1/pay", {
      method: "POST",
      body: JSON.stringify({ period_month: "2024-06", payment_method_id: "" }),
      headers: { "Content-Type": "application/json" },
    });

    await POST(req, { params: { id: "lease-1" } });

    expect(mockDb.payments).toHaveLength(1);
    expect(mockDb.payments[0].status).toBe("paid");
  });

  it("uses 'Directly to Manager' when no payment_method_id is provided", async () => {
    const req = new NextRequest("http://localhost/api/leases/lease-1/pay", {
      method: "POST",
      body: JSON.stringify({ period_month: "2024-06", payment_method_id: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: { id: "lease-1" } });
    const body = await res.json();

    expect(body.method).toBe("Directly to Manager");
  });
});

describe("POST /api/leases/[id]/pay — create new payment", () => {
  it("creates a new paid payment when no record exists for that period", async () => {
    // No existing record for 2024-07
    const req = new NextRequest("http://localhost/api/leases/lease-1/pay", {
      method: "POST",
      body: JSON.stringify({ period_month: "2024-07", payment_method_id: "pm-1" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: { id: "lease-1" } });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("pay-new");
    expect(body.status).toBe("paid");
    expect(body.amount_due).toBe(1800); // from lease.monthly_rent
    expect(body.last_reminded_on).toBeNull();

    // New record pushed into DB
    expect(mockDb.payments).toHaveLength(2);
  });
});

describe("POST /api/leases/[id]/pay — error cases", () => {
  it("returns 404 when the lease does not exist", async () => {
    const req = new NextRequest("http://localhost/api/leases/bad-lease/pay", {
      method: "POST",
      body: JSON.stringify({ period_month: "2024-06", payment_method_id: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: { id: "bad-lease" } });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.message).toBe("Lease not found");
  });

  it("returns 500 when ?fail=true is set", async () => {
    const req = new NextRequest("http://localhost/api/leases/lease-1/pay?fail=true", {
      method: "POST",
      body: JSON.stringify({ period_month: "2024-06", payment_method_id: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: { id: "lease-1" } });

    expect(res.status).toBe(500);
  });
});
