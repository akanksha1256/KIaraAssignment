import { NextRequest, NextResponse } from "next/server";
import { db } from "@/platform/db";
import { daysOverdue, resolvePayments } from "@/platform/payments";
import { withDelay, errorResponse } from "@/platform/utils";
import type {
  ManagerDashboardData,
  PropertySummary,
  PropertyStatus,
  MonthlyRevenue,
  AtRiskLease,
  StatsTrend,
} from "@repo/platform-types";

export async function GET(req: NextRequest) {
  try {
    await withDelay(req);

    // ── Per-property summary ───────────────────────────────────────────────────
    const properties: PropertySummary[] = db.properties.map((prop) => {
      const units = db.units.filter((u) => u.property_id === prop.id);
      const leases = units.flatMap((u) => db.leases.filter((l) => l.unit_id === u.id));
      const payments = resolvePayments(leases.flatMap((l) => db.payments.filter((p) => p.lease_id === l.id)));

      const total_rent = leases.reduce((s, l) => s + l.monthly_rent, 0);
      const hasOverdue = payments.some((p) => p.status === "overdue");
      const hasOutstanding = payments.some((p) => p.status === "outstanding");
      const now = new Date();
      const hasStartedLease = leases.some((l) => new Date(l.start_date) <= now);

      const status: PropertyStatus = hasOverdue
        ? "overdue"
        : hasOutstanding
          ? "outstanding"
          : leases.length === 0
            ? "vacant"
            : !hasStartedLease
              ? "upcoming"
              : "paid";

      return {
        id: prop.id,
        name: prop.name,
        address: prop.address,
        unit_count: units.length,
        leased_count: leases.length,
        total_rent,
        status,
      };
    });

    // ── Global stats ──────────────────────────────────────────────────────────
    const allLeases = db.leases;
    const allPayments = resolvePayments(db.payments);
    const total_units = db.units.length;
    const occupied_units = allLeases.length;

    const total_monthly_rent = allLeases.reduce((s, l) => s + l.monthly_rent, 0);

    // Current period = most recent month in payment records
    const allPeriods = [...new Set(allPayments.map((p) => p.period_month))].sort();
    const currentPeriod = allPeriods[allPeriods.length - 1] ?? "";
    const collected_this_month = allPayments
      .filter((p) => p.period_month === currentPeriod && p.status === "paid")
      .reduce((s, p) => s + p.amount_paid, 0);

    // ── Payment breakdown ─────────────────────────────────────────────────────
    const overduePayments = allPayments.filter((p) => p.status === "overdue");
    const outstandingPayments = allPayments.filter((p) => p.status === "outstanding");

    const payment_breakdown = {
      paid: allPayments.filter((p) => p.status === "paid").length,
      outstanding: outstandingPayments.length,
      overdue: overduePayments.length,
      overdue_amount: overduePayments.reduce((s, p) => s + p.amount_due, 0),
      outstanding_amount: outstandingPayments.reduce((s, p) => s + p.amount_due, 0),
    };

    // ── At-risk leases ────────────────────────────────────────────────────────
    const atRiskPayments = allPayments.filter(
      (p) => p.status === "overdue" || p.status === "outstanding",
    );

    const at_risk_leases: AtRiskLease[] = atRiskPayments
      .map((p) => {
        const lease = db.leases.find((l) => l.id === p.lease_id);
        if (!lease) return null;
        const unit = db.units.find((u) => u.id === lease.unit_id);
        if (!unit) return null;
        const property = db.properties.find((pr) => pr.id === unit.property_id);
        if (!property) return null;
        const tenant = db.tenants.find((t) => t.id === lease.tenant_id);
        if (!tenant) return null;
        return {
          tenant_name: tenant.name,
          property_name: property.name,
          unit_label: unit.label,
          amount_due: p.amount_due,
          days_overdue: p.status === "overdue" ? daysOverdue(p.period_month) : 0,
          lease_id: lease.id,
          period_month: p.period_month,
          status: p.status as "overdue" | "outstanding",
        };
      })
      .filter((x): x is AtRiskLease => x !== null)
      // Sort overdue first, then by days overdue desc
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "overdue" ? -1 : 1;
        return b.days_overdue - a.days_overdue;
      })
      .slice(0, 6);

    // ── Monthly revenue (last 12 months, always 12 slots with zeros for empty) ─
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthly_revenue: MonthlyRevenue[] = [];

    const now2 = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now2.getFullYear(), now2.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthPayments = allPayments.filter((p) => p.period_month === ym);
      const expected = monthPayments.reduce((s, p) => s + p.amount_due, 0);
      const collected = monthPayments
        .filter((p) => p.status === "paid")
        .reduce((s, p) => s + p.amount_paid, 0);
      monthly_revenue.push({ month: monthNames[d.getMonth()], expected, collected });
    }

    // ── Stats trends (month-over-month) ──────────────────────────────────────
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const newLeasesThisMonth = db.leases.filter((l) => l.start_date >= thisMonthStart);
    const rent_added_this_month = newLeasesThisMonth.reduce((s, l) => s + l.monthly_rent, 0);

    const prevPeriod = allPeriods[allPeriods.length - 2] ?? "";
    const prevPeriodPayments = allPayments.filter((p) => p.period_month === prevPeriod);
    const prevExpected = prevPeriodPayments.reduce((s, p) => s + p.amount_due, 0);
    const prevCollected = prevPeriodPayments
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.amount_paid, 0);
    const prev_collection_rate =
      prevExpected > 0 ? Math.round((prevCollected / prevExpected) * 100) : 0;

    const stats_trend: StatsTrend = {
      new_leases_this_month: newLeasesThisMonth.length,
      rent_added_this_month,
      prev_collection_rate,
    };

    const data: ManagerDashboardData = {
      stats: {
        total_properties: db.properties.length,
        total_units,
        occupied_units,
        vacant_units: total_units - occupied_units,
        total_monthly_rent,
        collected_this_month,
      },
      stats_trend,
      payment_breakdown,
      monthly_revenue,
      properties,
      at_risk_leases,
    };

    return NextResponse.json(data);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
