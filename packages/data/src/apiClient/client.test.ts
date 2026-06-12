import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "./client";
import {
  rawPayment,
  rawPaymentPaid,
  rawPaymentReminded,
  rawPaymentMethod,
  rawPaymentMethodNew,
} from "./mocks";

// --- helpers ---

function mockOk<T>(body: T): Promise<Response> {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  } as Response);
}

function mockError(message: string, status = 500): Promise<Response> {
  return Promise.resolve({
    ok: false,
    status,
    statusText: "Internal Server Error",
    json: () => Promise.resolve({ message }),
  } as Response);
}

// --- setup ---

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("window", { location: { origin: "http://localhost:3000" } });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

// --- GET tests ---

describe("api.getPayments", () => {
  it("calls the correct URL and maps snake_case payments to camelCase", async () => {
    fetchMock.mockReturnValueOnce(mockOk([rawPayment]));

    const result = await api.getPayments("lease-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/leases/lease-1/payments",
      expect.objectContaining({}),
    );
    expect(result).toEqual([
      {
        id: "pay-1",
        leaseId: "lease-1",
        periodMonth: "2024-06",
        amountDue: 1500,
        amountPaid: 1500,
        status: "paid",
        paidDate: "2024-06-01T00:00:00.000Z",
        method: "Bank Transfer",
        lastRemindedOn: null,
      },
    ]);
  });
});

describe("api.getPaymentMethods", () => {
  it("calls the correct URL and maps payment methods", async () => {
    fetchMock.mockReturnValueOnce(mockOk([rawPaymentMethod]));

    const result = await api.getPaymentMethods("tenant-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/tenants/tenant-1/payment-methods",
      expect.objectContaining({}),
    );
    expect(result).toEqual([{ id: "pm-1", tenantId: "tenant-1", label: "Visa ending 4242" }]);
  });
});

// --- POST tests ---

describe("api.payRent", () => {
  it("sends POST with snake_case body and returns mapped payment", async () => {
    fetchMock.mockReturnValueOnce(mockOk(rawPaymentPaid));

    const result = await api.payRent("lease-1", {
      periodMonth: "2024-07",
      paymentMethodId: "pm-1",
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3000/api/leases/lease-1/pay");
    expect(options.method).toBe("POST");

    // body must use snake_case to match the wire format the API expects
    const body = JSON.parse(options.body);
    expect(body).toEqual({ period_month: "2024-07", payment_method_id: "pm-1" });

    expect(result.periodMonth).toBe("2024-07");
    expect(result.status).toBe("paid");
  });
});

describe("api.addPaymentMethod", () => {
  it("sends POST with label and returns mapped method", async () => {
    fetchMock.mockReturnValueOnce(mockOk(rawPaymentMethodNew));

    const result = await api.addPaymentMethod("tenant-1", "Mastercard");

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3000/api/tenants/tenant-1/payment-methods");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ label: "Mastercard" });

    expect(result).toEqual({ id: "pm-2", tenantId: "tenant-1", label: "Mastercard" });
  });
});

describe("api.sendReminder", () => {
  it("sends POST with snake_case period_month in body", async () => {
    fetchMock.mockReturnValueOnce(mockOk(rawPaymentReminded));

    await api.sendReminder("lease-1", "2024-06");

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3000/api/leases/lease-1/remind");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ period_month: "2024-06" });
  });
});

// --- error handling ---

describe("request error handling", () => {
  it("throws with the server error message when response is not ok", async () => {
    fetchMock.mockReturnValueOnce(mockError("Lease not found"));

    await expect(api.getPayments("bad-lease")).rejects.toThrow("Lease not found");
  });
});
