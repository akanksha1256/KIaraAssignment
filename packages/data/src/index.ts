// Types
export type {
  PropertyStatus,
  Property,
  PropertySummary,
  UnitDetailItem,
  PropertyDetailData,
  Unit,
  KycStatus,
  Tenant,
  Lease,
  TenantStanding,
  TenantProfile,
  TenantDashboardData,
  Payment,
  PaymentMethod,
  PaymentStatus,
  DashboardStats,
  PaymentBreakdown,
  MonthlyRevenue,
  ManagerDashboardData,
} from "./types";

// API client
export { api } from "./apiClient/client";

// Query key factories + hooks
export { MANAGER_DASHBOARD_KEY, useManagerDashboard } from "./hooks/useManagerDashboard";

export { propertyDetailKey, usePropertyDetail } from "./hooks/usePropertyDetail";

export { tenantProfileKey, useTenantProfile } from "./hooks/useTenantProfile";

export { tenantDashboardKey, useTenantDashboard } from "./hooks/useTenantDashboard";

export { paymentsKey, usePayments } from "./hooks/usePayments";

export { paymentMethodsKey, usePaymentMethods } from "./hooks/usePaymentMethods";

export { useMarkPaid } from "./hooks/useMarkPaid";
export { usePayRent } from "./hooks/usePayRent";
export { useSendReminder } from "./hooks/useSendReminder";
export { useAddPaymentMethod } from "./hooks/useAddPaymentMethod";
