// @vitest-environment happy-dom

import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMarkPaid } from "./useMarkPaid";
import { paymentsKey } from "./usePayments";
import { api } from "../apiClient/client";
import type { Payment } from "../types";

vi.mock("../apiClient/client", () => ({
  api: { payRent: vi.fn() },
}));

const outstandingPayment: Payment = {
  id: "pay-1",
  leaseId: "lease-1",
  periodMonth: "2024-06",
  amountDue: 1800,
  amountPaid: 0,
  status: "outstanding",
  paidDate: null,
  method: null,
  lastRemindedOn: null,
};

const paidPayment: Payment = {
  ...outstandingPayment,
  status: "paid",
  amountPaid: 1800,
  paidDate: "2024-06-15T00:00:00.000Z",
  method: "Directly to Manager",
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

describe("useMarkPaid — optimistic update", () => {
  it("applies the optimistic update to the cache immediately on mutate", async () => {
    // Delay the API response so we can observe the optimistic state
    vi.mocked(api.payRent).mockImplementationOnce(
      () =>
        new Promise<Payment>((resolve) => {
          setTimeout(() => resolve(paidPayment), 200);
        }),
    );

    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(paymentsKey("lease-1"), [outstandingPayment]);

    const { result } = renderHook(() => useMarkPaid("lease-1"), { wrapper });

    act(() => {
      result.current.mutate({ periodMonth: "2024-06" });
    });

    // Optimistic: cache updated before API responds
    await waitFor(() => {
      const cached = queryClient.getQueryData<Payment[]>(paymentsKey("lease-1"));
      expect(cached?.[0].status).toBe("paid");
      expect(cached?.[0].amountPaid).toBe(1800);
    });
  });

  it("only updates the matching periodMonth row, leaving others unchanged", async () => {
    const june: Payment = { ...outstandingPayment, id: "pay-1", periodMonth: "2024-06" };
    const july: Payment = { ...outstandingPayment, id: "pay-2", periodMonth: "2024-07" };

    vi.mocked(api.payRent).mockResolvedValueOnce(paidPayment);
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(paymentsKey("lease-1"), [june, july]);

    const { result } = renderHook(() => useMarkPaid("lease-1"), { wrapper });

    await act(async () => {
      result.current.mutate({ periodMonth: "2024-06" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = queryClient.getQueryData<Payment[]>(paymentsKey("lease-1"));
    expect(cached?.[0].periodMonth).toBe("2024-06");
    expect(cached?.[0].status).toBe("paid");
    expect(cached?.[1].periodMonth).toBe("2024-07");
    expect(cached?.[1].status).toBe("outstanding"); // unchanged
  });
});

describe("useMarkPaid — rollback on failure", () => {
  it("restores the previous cache state when the API call fails", async () => {
    vi.mocked(api.payRent).mockRejectedValueOnce(new Error("Payment failed"));

    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(paymentsKey("lease-1"), [outstandingPayment]);

    const { result } = renderHook(() => useMarkPaid("lease-1"), { wrapper });

    act(() => {
      result.current.mutate({ periodMonth: "2024-06" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Cache must be restored to the pre-mutation snapshot
    const cached = queryClient.getQueryData<Payment[]>(paymentsKey("lease-1"));
    expect(cached).toEqual([outstandingPayment]);
    expect(cached?.[0].status).toBe("outstanding");
    expect(cached?.[0].amountPaid).toBe(0);
  });

  it("does not throw when onMutate has no prior data — isError is true and mutation settles", async () => {
    vi.mocked(api.payRent).mockRejectedValueOnce(new Error("Payment failed"));

    const { queryClient, wrapper } = makeWrapper();
    // No prior data — previous will be undefined; rollback guard skips setQueryData

    const { result } = renderHook(() => useMarkPaid("lease-1"), { wrapper });

    act(() => {
      result.current.mutate({ periodMonth: "2024-06" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // setQueryData runs with (old = []) => [].map(...) → cache is [] not undefined
    // The rollback guard correctly skips restoring undefined, so cache stays []
    const cached = queryClient.getQueryData(paymentsKey("lease-1"));
    expect(cached).toEqual([]);
  });
});

describe("useMarkPaid — cache invalidation", () => {
  it("calls invalidateQueries for the payments key on success", async () => {
    vi.mocked(api.payRent).mockResolvedValueOnce(paidPayment);

    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(paymentsKey("lease-1"), [outstandingPayment]);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useMarkPaid("lease-1"), { wrapper });

    await act(async () => {
      result.current.mutate({ periodMonth: "2024-06" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: paymentsKey("lease-1") }),
    );
  });

  it("still calls invalidateQueries on failure so the cache stays consistent", async () => {
    vi.mocked(api.payRent).mockRejectedValueOnce(new Error("fail"));

    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(paymentsKey("lease-1"), [outstandingPayment]);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useMarkPaid("lease-1"), { wrapper });

    act(() => {
      result.current.mutate({ periodMonth: "2024-06" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // onSettled fires for both success and error
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: paymentsKey("lease-1") }),
    );
  });
});
