import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient/client";
import { MANAGER_DASHBOARD_KEY } from "./useManagerDashboard";

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      address: string;
      units: string[];
    }) => api.createProperty(data),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MANAGER_DASHBOARD_KEY });
    },
  });
}
