import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/client/apiClient/client";
import { paymentsKey } from "./usePayments";
import type { Payment } from "@/client/types";

export function useMarkPaid(leaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ periodMonth }: { periodMonth: string }) =>
      api.payRent(leaseId, { periodMonth, paymentMethodId: "" }),

    onMutate: async ({ periodMonth }) => {
      await queryClient.cancelQueries({ queryKey: paymentsKey(leaseId) });
      const previous = queryClient.getQueryData<Payment[]>(paymentsKey(leaseId));
      queryClient.setQueryData<Payment[]>(paymentsKey(leaseId), (old = []) =>
        old.map((p) =>
          p.periodMonth === periodMonth
            ? { ...p, status: "paid", amountPaid: p.amountDue, paidDate: new Date().toISOString(), method: "Directly to Manager" }
            : p,
        ),
      );
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(paymentsKey(leaseId), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKey(leaseId) });
    },
  });
}
