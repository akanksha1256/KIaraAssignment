import { useQuery } from "@tanstack/react-query";
import { api } from "../apiClient/client";

export const tenantDashboardKey = (id: string) =>
  ["tenant", "dashboard", id] as const;

export function useTenantDashboard(tenantId: string) {
  return useQuery({
    queryKey: tenantDashboardKey(tenantId),
    queryFn:  () => api.getTenantDashboard(tenantId),
    staleTime: 5 * 60 * 1000,
    enabled:   !!tenantId,
  });
}
