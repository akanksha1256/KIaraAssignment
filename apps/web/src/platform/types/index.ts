// Platform types — snake_case to match API/DB wire format

export interface Property {
  id: string;
  name: string;
  address: string;
}

export interface Unit {
  id: string;
  property_id: string;
  label: string;
}

export type KycStatus = "verified" | "pending" | "not_submitted";

export interface Tenant {
  id:              string;
  name:            string;
  contact:         string;
  email:           string;
  kyc_status:      KycStatus;
  kyc_verified_on: string | null;
  kyc_document:    string | null;
}

export interface Lease {
  id:             string;
  unit_id:        string;
  tenant_id:      string;
  start_date:     string;
  end_date:       string;
  monthly_rent:   number;
  terms:          string;
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

export type PropertyStatus = "paid" | "outstanding" | "overdue" | "vacant";

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

export interface PaymentBreakdown {
  paid: number;
  outstanding: number;
  overdue: number;
}

export interface MonthlyRevenue {
  month: string;
  expected: number;
  collected: number;
}

export interface ManagerDashboardData {
  stats: DashboardStats;
  payment_breakdown: PaymentBreakdown;
  monthly_revenue: MonthlyRevenue[];
  properties: PropertySummary[];
}

export interface UnitDetail {
  id: string;
  label: string;
  tenant: Tenant | null;
  lease: Lease | null;
  payment_status: PaymentStatus | "vacant";
}

export interface PropertyDetailData {
  property: Property;
  units: UnitDetail[];
}

export interface TenantStanding {
  total_payments:   number;
  on_time_payments: number;
  score:            number;
  label:            "Excellent" | "Good" | "Fair" | "Poor";
}

export interface TenantProfileData {
  tenant:   Tenant;
  lease:    Lease    | null;
  unit:     Unit     | null;
  property: Property | null;
  payments: Payment[];
  standing: TenantStanding | null;
}
