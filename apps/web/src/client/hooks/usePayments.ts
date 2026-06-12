import { useQuery } from "@tanstack/react-query";
import { api } from "@/client/apiClient/client";

export const paymentsKey = (leaseId: string) =>
  ["payments", leaseId] as const;

export function usePayments(leaseId: string | undefined) {
  return useQuery({
    queryKey: paymentsKey(leaseId ?? ""),
    queryFn:  () => api.getPayments(leaseId!),
    enabled:  !!leaseId,
  });
}
