const BASE = "/api";

async function request<T>(
  path: string,
  options?: RequestInit & { fail?: boolean },
): Promise<T> {
  const url = new URL(BASE + path, window.location.origin);
  if (options?.fail) url.searchParams.set("fail", "true");

  const res = await fetch(url.toString(), options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? "Request failed");
  }
  return res.json();
}

import type {
  Property, PropertySummary, Unit, Tenant, Lease, Payment, PaymentMethod, ManagerDashboardData,
} from "@/platform/types";

export const api = {
  getManagerDashboard: () => request<ManagerDashboardData>("/manager/dashboard"),

  getProperties:       () => request<Property[]>("/properties"),
  getProperty:         (id: string) => request<Property>(`/properties/${id}`),
  getPropertiesSummary:() => request<PropertySummary[]>("/properties/summary"),

  getUnits:            (propertyId: string) => request<Unit[]>(`/properties/${propertyId}/units`),
  getUnit:             (id: string) => request<Unit>(`/units/${id}`),

  getTenant:           (id: string) => request<Tenant>(`/tenants/${id}`),

  getLease:            (id: string) => request<Lease>(`/leases/${id}`),
  getLeaseByUnit:      (unitId: string) => request<Lease | null>(`/units/${unitId}/lease`),
  createLease:         (data: Omit<Lease, "id">) =>
    request<Lease>("/leases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  updateLease:         (id: string, data: Partial<Lease>) =>
    request<Lease>(`/leases/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),

  getPayments:         (leaseId: string) => request<Payment[]>(`/leases/${leaseId}/payments`),
  payRent:             (leaseId: string, data: { periodMonth: string; paymentMethodId: string }, fail?: boolean) =>
    request<Payment>(`/leases/${leaseId}/pay`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), fail }),
  sendReminder:        (leaseId: string, periodMonth: string) =>
    request<{ success: true }>(`/leases/${leaseId}/remind`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ periodMonth }) }),

  getPaymentMethods:   (tenantId: string) => request<PaymentMethod[]>(`/tenants/${tenantId}/payment-methods`),
  addPaymentMethod:    (tenantId: string, label: string) =>
    request<PaymentMethod>(`/tenants/${tenantId}/payment-methods`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label }) }),
};
