import { describe, it, expect } from "vitest";
import { mapPayment, mapTenant } from "./mappers";
import { rawPayment, rawTenant } from "./mocks";

describe("mapPayment", () => {
  it("converts snake_case wire fields to camelCase client fields", () => {
    expect(mapPayment(rawPayment)).toEqual({
      id: "pay-1",
      leaseId: "lease-1",
      periodMonth: "2024-06",
      amountDue: 1500,
      amountPaid: 1500,
      status: "paid",
      paidDate: "2024-06-01T00:00:00.000Z",
      method: "Bank Transfer",
      lastRemindedOn: null,
    });
  });
});

describe("mapTenant", () => {
  it("maps all fields including optional KYC fields", () => {
    expect(mapTenant(rawTenant)).toEqual({
      id: "tenant-1",
      name: "Alice Johnson",
      contact: "555-0100",
      email: "alice@example.com",
      kycStatus: "verified",
      kycVerifiedOn: "2024-01-10T00:00:00.000Z",
      kycDocument: "passport",
    });
  });
});
