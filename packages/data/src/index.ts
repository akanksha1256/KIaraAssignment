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
  TenantListItem,
  PaymentListItem,
  TenantDashboardData,
  Payment,
  PaymentMethod,
  PaymentStatus,
  DashboardStats,
  PaymentBreakdown,
  MonthlyRevenue,
  AtRiskLease,
  ManagerDashboardData,
  EmptyIcon,
  PaymentTableActions,
  TenantPaymentActions,
  PaymentHistoryTableProps,
  PaymentsListSortCol,
  SortDir,
  PaymentsListFilterColKey,
  PaymentsListFilterRow,
} from "./types";

// Status constants
export { PropertyStatusValues, PaymentStatusValues } from "./types";

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
export { useSendAllReminders } from "./hooks/useSendAllReminders";
export { useAddPaymentMethod } from "./hooks/useAddPaymentMethod";
export { allTenantsKey, useAllTenants } from "./hooks/useAllTenants";
export { allPaymentsKey, useAllPayments } from "./hooks/useAllPayments";
export { useCreateProperty } from "./hooks/useCreateProperty";
export { useCreateLease } from "./hooks/useCreateLease";
export { useCreateTenant } from "./hooks/useCreateTenant";
