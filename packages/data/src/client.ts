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

export const api = {
  // Dashboard
  getManagerDashboard: () =>
    request<import("@repo/types").ManagerDashboardData>("/manager/dashboard"),

  // Properties
  getProperties: () => request<import("@repo/types").Property[]>("/properties"),
  getProperty: (id: string) =>
    request<import("@repo/types").Property>(`/properties/${id}`),
  getPropertiesSummary: () =>
    request<import("@repo/types").PropertySummary[]>("/properties/summary"),

  // Units
  getUnits: (propertyId: string) =>
    request<import("@repo/types").Unit[]>(`/properties/${propertyId}/units`),
  getUnit: (id: string) => request<import("@repo/types").Unit>(`/units/${id}`),

  // Tenants
  getTenant: (id: string) =>
    request<import("@repo/types").Tenant>(`/tenants/${id}`),

  // Leases
  getLease: (id: string) =>
    request<import("@repo/types").Lease>(`/leases/${id}`),
  getLeaseByUnit: (unitId: string) =>
    request<import("@repo/types").Lease | null>(`/units/${unitId}/lease`),
  createLease: (data: Omit<import("@repo/types").Lease, "id">) =>
    request<import("@repo/types").Lease>("/leases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  updateLease: (id: string, data: Partial<import("@repo/types").Lease>) =>
    request<import("@repo/types").Lease>(`/leases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  // Payments
  getPayments: (leaseId: string) =>
    request<import("@repo/types").Payment[]>(`/leases/${leaseId}/payments`),
  payRent: (
    leaseId: string,
    data: { periodMonth: string; paymentMethodId: string },
    fail?: boolean,
  ) =>
    request<import("@repo/types").Payment>(`/leases/${leaseId}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      fail,
    }),
  sendReminder: (leaseId: string, periodMonth: string) =>
    request<{ success: true }>(`/leases/${leaseId}/remind`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ periodMonth }),
    }),

  // Payment methods
  getPaymentMethods: (tenantId: string) =>
    request<import("@repo/types").PaymentMethod[]>(
      `/tenants/${tenantId}/payment-methods`,
    ),
  addPaymentMethod: (tenantId: string, label: string) =>
    request<import("@repo/types").PaymentMethod>(
      `/tenants/${tenantId}/payment-methods`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      },
    ),
};
