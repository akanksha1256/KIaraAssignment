// Platform types — snake_case to match API/DB wire format

export interface Property {
  id: string;
  name: string;
  address: string;
  manager_name: string;
  manager_email: string;
  manager_contact: string;
}

export interface Unit {
  id: string;
  property_id: string;
  label: string;
}

export type KycStatus = "verified" | "pending" | "not_submitted";

export interface Tenant {
  id: string;
  name: string;
  contact: string;
  email: string;
  kyc_status: KycStatus;
  kyc_verified_on: string | null;
  kyc_document: string | null;
}

export interface Lease {
  id: string;
  unit_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  terms: string;
  lease_document: string | null;
}

export type PaymentStatus = "paid" | "outstanding" | "overdue";

export interface Payment {
  id: string;
  lease_id: string;
  period_month: string;
  amount_due: number;
  amount_paid: number;
  status: PaymentStatus;
  paid_date: string | null;
  method: string | null;
  last_reminded_on: string | null;
}

export interface PaymentMethod {
  id: string;
  tenant_id: string;
  label: string;
}

export type PropertyStatus = "paid" | "outstanding" | "overdue" | "vacant" | "upcoming";

export interface PropertySummary {
  id: string;
  name: string;
  address: string;
  unit_count: number;
  leased_count: number;
  total_rent: number;
  status: PropertyStatus;
}

export interface TenantStanding {
  total_payments: number;
  on_time_payments: number;
  score: number;
  label: "Excellent" | "Good" | "Fair" | "Poor";
}

export interface DashboardStats {
  total_properties: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  total_monthly_rent: number;
  collected_this_month: number;
}

export interface StatsTrend {
  new_leases_this_month: number;
  rent_added_this_month: number;
  prev_collection_rate: number;
}

export interface PaymentBreakdown {
  paid: number;
  outstanding: number;
  overdue: number;
  overdue_amount: number;
  outstanding_amount: number;
}

export interface MonthlyRevenue {
  month: string;
  expected: number;
  collected: number;
}

export interface AtRiskLease {
  tenant_name: string;
  property_name: string;
  unit_label: string;
  amount_due: number;
  days_overdue: number;
  lease_id: string;
  period_month: string;
  status: "overdue" | "outstanding";
}

export interface ManagerDashboardData {
  stats: DashboardStats;
  stats_trend: StatsTrend;
  payment_breakdown: PaymentBreakdown;
  monthly_revenue: MonthlyRevenue[];
  properties: PropertySummary[];
  at_risk_leases: AtRiskLease[];
}

export interface UnitDetail {
  id: string;
  label: string;
  tenant: Tenant | null;
  lease: Lease | null;
  payment_status: PaymentStatus | "vacant";
  current_period_month: string | null;
}

export interface PropertyDetailData {
  property: Property;
  units: UnitDetail[];
}

export interface TenantProfileData {
  tenant: Tenant;
  lease: Lease | null;
  unit: Unit | null;
  property: Property | null;
  payments: Payment[];
  standing: TenantStanding | null;
}

export interface PaymentListItem {
  payment: Payment;
  lease: Lease;
  tenant: Tenant;
  unit: Unit;
  property: Property;
}

export interface TenantListItem {
  tenant: Tenant;
  lease: Lease | null;
  unit: Unit | null;
  property: Property | null;
  payment_status: PaymentStatus | "vacant";
}
