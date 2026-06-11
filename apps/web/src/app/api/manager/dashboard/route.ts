import { NextRequest, NextResponse } from "next/server";
import { db } from "@/platform/db";
import { withDelay, errorResponse } from "@/platform/utils";
import type { ManagerDashboardData, PropertySummary, PropertyStatus, MonthlyRevenue } from "@/platform/types";

export async function GET(req: NextRequest) {
  try {
    await withDelay(req);

    // ── Per-property summary ───────────────────────────────────────────────────
    const properties: PropertySummary[] = db.properties.map((prop) => {
      const units    = db.units.filter((u) => u.property_id === prop.id);
      const leases   = units.flatMap((u) => db.leases.filter((l) => l.unit_id === u.id));
      const payments = leases.flatMap((l) => db.payments.filter((p) => p.lease_id === l.id));

      const total_rent        = leases.reduce((s, l) => s + l.monthly_rent, 0);
      const hasOverdue        = payments.some((p) => p.status === "overdue");
      const hasOutstanding    = payments.some((p) => p.status === "outstanding");

      const status: PropertyStatus =
        hasOverdue ? "overdue" :
        hasOutstanding ? "outstanding" :
        leases.length === 0 ? "vacant" : "paid";

      return {
        id: prop.id, name: prop.name, address: prop.address,
        unit_count: units.length, leased_count: leases.length,
        total_rent, status,
      };
    });

    // ── Global stats ──────────────────────────────────────────────────────────
    const allLeases   = db.leases;
    const allPayments = db.payments;
    const total_units    = db.units.length;
    const occupied_units = allLeases.length;

    const total_monthly_rent    = allLeases.reduce((s, l) => s + l.monthly_rent, 0);
    const collected_this_month  = allPayments
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.amount_paid, 0);

    // ── Payment breakdown ─────────────────────────────────────────────────────
    const payment_breakdown = {
      paid:        allPayments.filter((p) => p.status === "paid").length,
      outstanding: allPayments.filter((p) => p.status === "outstanding").length,
      overdue:     allPayments.filter((p) => p.status === "overdue").length,
    };

    // ── Monthly revenue (last 6 months) ───────────────────────────────────────
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthly_revenue: MonthlyRevenue[] = [];

    const allMonths = [...new Set(allPayments.map((p) => p.period_month))].sort();
    const last6     = allMonths.slice(-6);

    for (const ym of last6) {
      const monthPayments = allPayments.filter((p) => p.period_month === ym);
      const expected  = monthPayments.reduce((s, p) => s + p.amount_due, 0);
      const collected = monthPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount_paid, 0);
      const [, month] = ym.split("-");
      monthly_revenue.push({ month: monthNames[Number(month) - 1], expected, collected });
    }

    const data: ManagerDashboardData = {
      stats: {
        total_properties:     db.properties.length,
        total_units,
        occupied_units,
        vacant_units:         total_units - occupied_units,
        total_monthly_rent,
        collected_this_month,
      },
      payment_breakdown,
      monthly_revenue,
      properties,
    };

    return NextResponse.json(data);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
