import { useQuery } from "@tanstack/react-query";
import { api } from "../apiClient/client";

export const allPaymentsKey = () => ["manager", "payments"] as const;

export function useAllPayments() {
  return useQuery({
    queryKey: allPaymentsKey(),
    queryFn: () => api.getAllPayments(),
    staleTime: 2 * 60 * 1000,
  });
}
