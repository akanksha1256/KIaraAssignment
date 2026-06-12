// @vitest-environment happy-dom

import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePayments, paymentsKey } from "./usePayments";
import { api } from "../apiClient/client";
import type { Payment } from "../types";

vi.mock("../apiClient/client", () => ({
  api: { getPayments: vi.fn() },
}));

const payment: Payment = {
  id: "pay-1",
  leaseId: "lease-1",
  periodMonth: "2024-06",
  amountDue: 1800,
  amountPaid: 1800,
  status: "paid",
  paidDate: "2024-06-01T00:00:00.000Z",
  method: "Bank Transfer",
  lastRemindedOn: null,
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children),
  };
}

afterEach(() => vi.clearAllMocks());

describe("usePayments", () => {
  it("returns mapped payments from the API", async () => {
    vi.mocked(api.getPayments).mockResolvedValueOnce([payment]);
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => usePayments("lease-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([payment]);
    expect(vi.mocked(api.getPayments)).toHaveBeenCalledWith("lease-1");
  });

  it("is disabled when leaseId is undefined", () => {
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => usePayments(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(vi.mocked(api.getPayments)).not.toHaveBeenCalled();
  });

  it("exposes isError and error when the API call fails", async () => {
    vi.mocked(api.getPayments).mockRejectedValueOnce(new Error("Lease not found"));
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => usePayments("bad-id"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error).message).toBe("Lease not found");
  });

  it("uses the expected query key", () => {
    expect(paymentsKey("lease-1")).toEqual(["payments", "lease-1"]);
  });

  it("deduplicates concurrent calls using the cache", async () => {
    vi.mocked(api.getPayments).mockResolvedValue([payment]);
    const { wrapper } = makeWrapper();

    const { result: r1 } = renderHook(() => usePayments("lease-1"), { wrapper });
    const { result: r2 } = renderHook(() => usePayments("lease-1"), { wrapper });

    await waitFor(() => expect(r1.current.isSuccess).toBe(true));
    await waitFor(() => expect(r2.current.isSuccess).toBe(true));

    // Both hooks share one cache entry — API called exactly once
    expect(vi.mocked(api.getPayments)).toHaveBeenCalledTimes(1);
  });
});
