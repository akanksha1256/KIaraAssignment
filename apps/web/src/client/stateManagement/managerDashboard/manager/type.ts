import type { PropertySummary } from "../property/type";

export interface DashboardStats {
  totalProperties:    number;
  totalUnits:         number;
  occupiedUnits:      number;
  vacantUnits:        number;
  totalMonthlyRent:   number;
  collectedThisMonth: number;
}

export interface PaymentBreakdown {
  paid:        number;
  outstanding: number;
  overdue:     number;
}

export interface MonthlyRevenue {
  month:     string;
  expected:  number;
  collected: number;
}

export interface ManagerDashboardData {
  stats:            DashboardStats;
  paymentBreakdown: PaymentBreakdown;
  monthlyRevenue:   MonthlyRevenue[];
  properties:       PropertySummary[];
}
