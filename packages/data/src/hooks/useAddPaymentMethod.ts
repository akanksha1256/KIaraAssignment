import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient/client";
import { paymentMethodsKey } from "./usePaymentMethods";

export function useAddPaymentMethod(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ label }: { label: string }) =>
      api.addPaymentMethod(tenantId, label),

    onSuccess: (newMethod) => {
      queryClient.setQueryData(
        paymentMethodsKey(tenantId),
        (old: typeof newMethod[] = []) => [...old, newMethod],
      );
    },
  });
}
