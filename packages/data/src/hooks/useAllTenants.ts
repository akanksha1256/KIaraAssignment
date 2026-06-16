import { useQuery } from "@tanstack/react-query";
import { api } from "../apiClient/client";

export const allTenantsKey = () => ["manager", "tenants"] as const;

export function useAllTenants() {
  return useQuery({
    queryKey: allTenantsKey(),
    queryFn: () => api.getAllTenants(),
    staleTime: 5 * 60 * 1000,
  });
}
