import { describe, it, expect } from "vitest";
import { daysOverdue, isOverdue, resolvePaymentStatus } from "./payments";
import type { Payment } from "@repo/platform-types";

const unpaid = (periodMonth: string, status: Payment["status"] = "outstanding"): Payment => ({
  id: "pay-1",
  lease_id: "lease-1",
  period_month: periodMonth,
  amount_due: 1800,
  amount_paid: 0,
  status,
  paid_date: null,
  method: null,
  last_reminded_on: null,
});

describe("isOverdue", () => {
  it("returns false on the last day of the due window", () => {
    expect(isOverdue("2026-06", new Date(2026, 5, 5))).toBe(false);
  });

  it("returns false before the due window ends", () => {
    expect(isOverdue("2026-06", new Date(2026, 5, 4))).toBe(false);
  });

  it("returns true the day after the due window ends", () => {
    expect(isOverdue("2026-06", new Date(2026, 5, 6))).toBe(true);
  });
});

describe("daysOverdue", () => {
  it("returns 0 while payment is still outstanding", () => {
    expect(daysOverdue("2026-06", new Date(2026, 5, 4))).toBe(0);
  });

  it("returns 1 on the first overdue day", () => {
    expect(daysOverdue("2026-06", new Date(2026, 5, 6))).toBe(1);
  });

  it("counts whole days after the due window end", () => {
    expect(daysOverdue("2026-06", new Date(2026, 5, 17))).toBe(12);
  });
});

describe("resolvePaymentStatus", () => {
  it("keeps paid payments as paid", () => {
    expect(
      resolvePaymentStatus(
        { ...unpaid("2026-06"), status: "paid", amount_paid: 1800 },
        new Date(2026, 5, 17),
      ),
    ).toBe("paid");
  });

  it("returns outstanding before the due window ends", () => {
    expect(resolvePaymentStatus(unpaid("2026-06"), new Date(2026, 5, 4))).toBe("outstanding");
  });

  it("returns overdue after the due window ends", () => {
    expect(resolvePaymentStatus(unpaid("2026-06"), new Date(2026, 5, 6))).toBe("overdue");
  });
});
