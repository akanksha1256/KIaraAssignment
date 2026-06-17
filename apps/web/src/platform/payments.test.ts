import { describe, it, expect } from "vitest";
import { daysOverdue, getDueWindowEnd, isOverdue, resolvePaymentStatus, resolvePayments, withResolvedStatus } from "./payments";
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

describe("getDueWindowEnd", () => {
  it("returns the 5th of the period month", () => {
    const end = getDueWindowEnd("2026-06");
    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(5);
    expect(end.getDate()).toBe(5);
  });

  it("works across month and year boundaries", () => {
    const end = getDueWindowEnd("2027-01");
    expect(end.getFullYear()).toBe(2027);
    expect(end.getMonth()).toBe(0);
    expect(end.getDate()).toBe(5);
  });
});

describe("isOverdue", () => {
  it("returns false on the due date itself", () => {
    expect(isOverdue("2026-06", new Date(2026, 5, 1))).toBe(false);
  });

  it("returns false before the due window ends", () => {
    expect(isOverdue("2026-06", new Date(2026, 5, 4))).toBe(false);
  });

  it("returns false on the last day of the due window", () => {
    expect(isOverdue("2026-06", new Date(2026, 5, 5))).toBe(false);
  });

  it("returns true the day after the due window ends", () => {
    expect(isOverdue("2026-06", new Date(2026, 5, 6))).toBe(true);
  });

  it("returns true well past the due window", () => {
    expect(isOverdue("2026-06", new Date(2026, 5, 30))).toBe(true);
  });
});

describe("daysOverdue", () => {
  it("returns 0 while payment is still outstanding", () => {
    expect(daysOverdue("2026-06", new Date(2026, 5, 4))).toBe(0);
  });

  it("returns 0 on the last day of the due window", () => {
    expect(daysOverdue("2026-06", new Date(2026, 5, 5))).toBe(0);
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

  it("treats fully-covered amount_paid as paid regardless of status field", () => {
    expect(
      resolvePaymentStatus(
        { ...unpaid("2026-06"), status: "outstanding", amount_paid: 1800 },
        new Date(2026, 5, 4),
      ),
    ).toBe("paid");
  });

  it("returns outstanding before the due window ends", () => {
    expect(resolvePaymentStatus(unpaid("2026-06"), new Date(2026, 5, 4))).toBe("outstanding");
  });

  it("returns outstanding on the last day of the due window", () => {
    expect(resolvePaymentStatus(unpaid("2026-06"), new Date(2026, 5, 5))).toBe("outstanding");
  });

  it("returns overdue after the due window ends", () => {
    expect(resolvePaymentStatus(unpaid("2026-06"), new Date(2026, 5, 6))).toBe("overdue");
  });

  it("returns overdue for a partial payment past the window", () => {
    expect(
      resolvePaymentStatus(
        { ...unpaid("2026-06"), amount_paid: 500 },
        new Date(2026, 5, 6),
      ),
    ).toBe("overdue");
  });
});

describe("withResolvedStatus", () => {
  it("preserves all fields and resolves status", () => {
    const payment = unpaid("2026-06");
    const result = withResolvedStatus(payment, new Date(2026, 5, 6));
    expect(result).toEqual({ ...payment, status: "overdue" });
  });

  it("does not mutate the original payment", () => {
    const payment = unpaid("2026-06");
    withResolvedStatus(payment, new Date(2026, 5, 6));
    expect(payment.status).toBe("outstanding");
  });
});

describe("resolvePayments", () => {
  it("resolves status for each payment in the array", () => {
    const payments: Payment[] = [
      unpaid("2026-05"),
      unpaid("2026-06"),
      { ...unpaid("2026-04"), status: "paid", amount_paid: 1800 },
    ];
    const now = new Date(2026, 5, 6);
    const result = resolvePayments(payments, now);
    expect(result[0]!.status).toBe("overdue");
    expect(result[1]!.status).toBe("overdue");
    expect(result[2]!.status).toBe("paid");
  });

  it("returns an empty array unchanged", () => {
    expect(resolvePayments([], new Date(2026, 5, 6))).toEqual([]);
  });
});
