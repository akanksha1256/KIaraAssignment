import { useQuery } from "@tanstack/react-query";
import { api } from "../apiClient/client";

export const MANAGER_DASHBOARD_KEY = ["manager", "dashboard"] as const;

export function useManagerDashboard() {
  return useQuery({
    queryKey: MANAGER_DASHBOARD_KEY,
    queryFn:  () => api.getManagerDashboard(),
    staleTime: 5 * 60 * 1000,
  });
}
