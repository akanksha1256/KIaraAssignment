import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { PaymentMethod } from "@repo/platform-types";

// ── DB mock ──────────────────────────────────────────────────────────────────

const existingMethod: PaymentMethod = {
  id: "pm-1",
  tenant_id: "tenant-1",
  label: "Visa ending 4242",
};

const mockDb = {
  leases: [],
  payments: [],
  paymentMethods: [existingMethod] as PaymentMethod[],
  properties: [],
  units: [],
  tenants: [],
};

let idCounter = 2;
const generateId = vi.fn((prefix: string) => `${prefix}-${idCounter++}`);

vi.mock("@/platform/db", () => ({ db: mockDb, generateId }));
vi.mock("@/platform/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/platform/utils")>();
  return { ...actual, withDelay: vi.fn().mockImplementation(async (req: import('next/server').NextRequest) => { if (req.nextUrl.searchParams.get('fail') === 'true') throw new Error('Forced failure (fail=true)'); }) };
});

beforeEach(() => {
  mockDb.paymentMethods = [{ ...existingMethod }];
  idCounter = 2;
});

const { GET, POST } = await import("@/app/api/tenants/[id]/payment-methods/route");

// ── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/tenants/[id]/payment-methods", () => {
  it("returns all saved methods for the tenant", async () => {
    const req = new NextRequest("http://localhost/api/tenants/tenant-1/payment-methods");
    const res = await GET(req, { params: { id: "tenant-1" } });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0]).toEqual(existingMethod);
  });

  it("returns an empty array for a tenant with no saved methods", async () => {
    const req = new NextRequest("http://localhost/api/tenants/tenant-99/payment-methods");
    const res = await GET(req, { params: { id: "tenant-99" } });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("returns 500 when ?fail=true is set", async () => {
    const req = new NextRequest(
      "http://localhost/api/tenants/tenant-1/payment-methods?fail=true",
    );
    const res = await GET(req, { params: { id: "tenant-1" } });

    expect(res.status).toBe(500);
  });
});

describe("POST /api/tenants/[id]/payment-methods", () => {
  it("creates a new payment method and returns it", async () => {
    const req = new NextRequest("http://localhost/api/tenants/tenant-1/payment-methods", {
      method: "POST",
      body: JSON.stringify({ label: "Mastercard ending 1234" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: { id: "tenant-1" } });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.label).toBe("Mastercard ending 1234");
    expect(body.tenant_id).toBe("tenant-1");
    expect(body.id).toBeDefined();
  });

  it("pushes the new method into the DB so future GETs include it", async () => {
    const req = new NextRequest("http://localhost/api/tenants/tenant-1/payment-methods", {
      method: "POST",
      body: JSON.stringify({ label: "Chase Sapphire" }),
      headers: { "Content-Type": "application/json" },
    });

    await POST(req, { params: { id: "tenant-1" } });

    expect(mockDb.paymentMethods).toHaveLength(2);
    expect(mockDb.paymentMethods[1].label).toBe("Chase Sapphire");
  });

  it("trims whitespace from the label", async () => {
    const req = new NextRequest("http://localhost/api/tenants/tenant-1/payment-methods", {
      method: "POST",
      body: JSON.stringify({ label: "  Amex  " }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: { id: "tenant-1" } });
    const body = await res.json();

    expect(body.label).toBe("Amex");
  });

  it("returns 400 when label is empty", async () => {
    const req = new NextRequest("http://localhost/api/tenants/tenant-1/payment-methods", {
      method: "POST",
      body: JSON.stringify({ label: "   " }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: { id: "tenant-1" } });

    expect(res.status).toBe(400);
    expect((await res.json()).message).toBe("Label is required");
  });

  it("returns 400 when label is missing", async () => {
    const req = new NextRequest("http://localhost/api/tenants/tenant-1/payment-methods", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: { id: "tenant-1" } });

    expect(res.status).toBe(400);
  });
});
