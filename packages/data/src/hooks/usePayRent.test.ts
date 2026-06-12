// @vitest-environment happy-dom

import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePayRent } from "./usePayRent";
import { tenantDashboardKey } from "./useTenantDashboard";
import { api } from "../apiClient/client";
import type { Payment, TenantDashboardData } from "../types";

vi.mock("../apiClient/client", () => ({
  api: { payRent: vi.fn() },
}));

const lease = {
  id: "lease-1",
  unitId: "unit-1",
  tenantId: "tenant-1",
  monthlyRent: 1800,
  startDate: "2024-01-01T00:00:00.000Z",
  endDate: "2024-12-31T00:00:00.000Z",
  terms: "12-month lease.",
  leaseDocument: null,
};

const outstandingPayment: Payment = {
  id: "pay-7",
  leaseId: "lease-1",
  periodMonth: "2024-07",
  amountDue: 1800,
  amountPaid: 0,
  status: "outstanding",
  paidDate: null,
  method: null,
  lastRemindedOn: null,
};

const dashboardData: { dashboard: TenantDashboardData; payments: Payment[] } = {
  dashboard: {
    tenantName: "Alice Johnson",
    lease,
    unit: { id: "unit-1", propertyId: "prop-1", label: "Apt 101" },
    property: {
      id: "prop-1",
      name: "Maple Heights",
      address: "123 Maple St",
      managerName: "James Carter",
      managerEmail: "james@example.com",
      managerContact: "+1 512-555-0200",
    },
  },
  payments: [outstandingPayment],
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children),
  };
}

afterEach(() => vi.clearAllMocks());

describe("usePayRent — optimistic update", () => {
  it("optimistically marks the payment as paid in the tenant dashboard cache", async () => {
    vi.mocked(api.payRent).mockImplementationOnce(
      () =>
        new Promise<Payment>((resolve) => {
          setTimeout(
            () =>
              resolve({
                ...outstandingPayment,
                status: "paid",
                amountPaid: 1800,
                paidDate: new Date().toISOString(),
              }),
            200,
          );
        }),
    );

    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(tenantDashboardKey("tenant-1"), dashboardData);

    const { result } = renderHook(() => usePayRent("tenant-1", "lease-1"), { wrapper });

    act(() => {
      result.current.mutate({ periodMonth: "2024-07", paymentMethodId: "pm-1" });
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<typeof dashboardData>(
        tenantDashboardKey("tenant-1"),
      );
      expect(cached?.payments[0].status).toBe("paid");
      expect(cached?.payments[0].amountPaid).toBe(1800);
    });
  });

  it("preserves the dashboard shape — only the payments array is mutated", async () => {
    vi.mocked(api.payRent).mockImplementationOnce(
      () =>
        new Promise<Payment>((resolve) => {
          setTimeout(() => resolve({ ...outstandingPayment, status: "paid", amountPaid: 1800, paidDate: new Date().toISOString() }), 100);
        }),
    );

    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(tenantDashboardKey("tenant-1"), dashboardData);

    const { result } = renderHook(() => usePayRent("tenant-1", "lease-1"), { wrapper });

    act(() => {
      result.current.mutate({ periodMonth: "2024-07", paymentMethodId: "pm-1" });
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<typeof dashboardData>(tenantDashboardKey("tenant-1"));
      expect(cached?.dashboard.tenantName).toBe("Alice Johnson"); // dashboard unchanged
    });
  });
});

describe("usePayRent — rollback on failure", () => {
  it("restores the full dashboard cache state when the API call fails", async () => {
    vi.mocked(api.payRent).mockRejectedValueOnce(new Error("Payment declined"));

    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(tenantDashboardKey("tenant-1"), dashboardData);

    const { result } = renderHook(() => usePayRent("tenant-1", "lease-1"), { wrapper });

    act(() => {
      result.current.mutate({ periodMonth: "2024-07", paymentMethodId: "pm-1" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const cached = queryClient.getQueryData<typeof dashboardData>(tenantDashboardKey("tenant-1"));
    expect(cached?.payments[0].status).toBe("outstanding");
    expect(cached?.payments[0].amountPaid).toBe(0);
  });

  it("does not mutate the cache when there is no prior data", async () => {
    vi.mocked(api.payRent).mockRejectedValueOnce(new Error("Payment declined"));

    const { queryClient, wrapper } = makeWrapper();
    // No data in cache — onMutate returns undefined for previous

    const { result } = renderHook(() => usePayRent("tenant-1", "lease-1"), { wrapper });

    act(() => {
      result.current.mutate({ periodMonth: "2024-07", paymentMethodId: "pm-1" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(queryClient.getQueryData(tenantDashboardKey("tenant-1"))).toBeUndefined();
  });
});

describe("usePayRent — cache invalidation", () => {
  it("invalidates the tenant dashboard query on settle", async () => {
    vi.mocked(api.payRent).mockResolvedValueOnce({
      ...outstandingPayment,
      status: "paid",
      amountPaid: 1800,
      paidDate: new Date().toISOString(),
    });

    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(tenantDashboardKey("tenant-1"), dashboardData);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => usePayRent("tenant-1", "lease-1"), { wrapper });

    await act(async () => {
      result.current.mutate({ periodMonth: "2024-07", paymentMethodId: "pm-1" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: tenantDashboardKey("tenant-1") }),
    );
  });
});
