import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient/client";
import { tenantDashboardKey } from "./useTenantDashboard";
import type { TenantDashboardData } from "../types";
import type { Payment } from "../types";

interface QueryData {
  dashboard: TenantDashboardData;
  payments: Payment[];
}

export function usePayRent(tenantId: string, leaseId: string) {
  const queryClient = useQueryClient();
  const key = tenantDashboardKey(tenantId);

  return useMutation({
    mutationFn: ({
      periodMonth,
      paymentMethodId,
    }: {
      periodMonth: string;
      paymentMethodId: string;
    }) => api.payRent(leaseId, { periodMonth, paymentMethodId }),

    onMutate: async ({ periodMonth }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<QueryData>(key);
      queryClient.setQueryData<QueryData>(key, (old) => {
        if (!old) return old;
        return {
          ...old,
          payments: old.payments.map((p) =>
            p.periodMonth === periodMonth
              ? {
                  ...p,
                  status: "paid",
                  amountPaid: p.amountDue,
                  paidDate: new Date().toISOString(),
                }
              : p,
          ),
        };
      });
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(key, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
