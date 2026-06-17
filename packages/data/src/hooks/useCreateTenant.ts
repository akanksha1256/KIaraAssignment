import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient/client";
import { allTenantsKey } from "./useAllTenants";

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; email: string; contact?: string }) =>
      api.createTenant(data),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: allTenantsKey() });
    },
  });
}
