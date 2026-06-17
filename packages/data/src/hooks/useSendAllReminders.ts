import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient/client";
import { MANAGER_DASHBOARD_KEY } from "./useManagerDashboard";
import type { AtRiskLease } from "../types";

export function useSendAllReminders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leases: AtRiskLease[]) =>
      Promise.all(leases.map((l) => api.sendReminder(l.leaseId, l.periodMonth))),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MANAGER_DASHBOARD_KEY });
    },
  });
}
