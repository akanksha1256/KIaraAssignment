import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient/client";
import { MANAGER_DASHBOARD_KEY } from "./useManagerDashboard";
import { propertyDetailKey } from "./usePropertyDetail";

export function useCreateLease(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Parameters<typeof api.createLease>[0], never>) =>
      api.createLease(data),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: propertyDetailKey(propertyId) });
      queryClient.invalidateQueries({ queryKey: MANAGER_DASHBOARD_KEY });
    },
  });
}
