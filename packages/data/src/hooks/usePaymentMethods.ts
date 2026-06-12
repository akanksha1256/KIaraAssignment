import { useQuery } from "@tanstack/react-query";
import { api } from "../apiClient/client";

export const paymentMethodsKey = (tenantId: string) =>
  ["paymentMethods", tenantId] as const;

export function usePaymentMethods(tenantId: string) {
  return useQuery({
    queryKey: paymentMethodsKey(tenantId),
    queryFn:  () => api.getPaymentMethods(tenantId),
    staleTime: 10 * 60 * 1000,
    enabled:   !!tenantId,
  });
}
