import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient/client";
import { paymentsKey } from "./usePayments";

export function useSendReminder(leaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ periodMonth }: { periodMonth: string }) =>
      api.sendReminder(leaseId, periodMonth),

    onSuccess: (updatedPayment) => {
      queryClient.setQueryData(
        paymentsKey(leaseId),
        (old: typeof updatedPayment[] = []) =>
          old.map((p) =>
            p.periodMonth === updatedPayment.periodMonth ? updatedPayment : p,
          ),
      );
    },
  });
}
