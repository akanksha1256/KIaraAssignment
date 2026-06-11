import { NextRequest, NextResponse } from "next/server";
import { db } from "@/platform/db";
import { withDelay, errorResponse } from "@/platform/utils";
import type {
  ManagerDashboardData,
  PropertySummary,
  PropertyStatus,
  MonthlyRevenue,
} from "@/platform/types";

export async function GET(req: NextRequest) {
  try {
    await withDelay(req);

    // ── Per-property summary ───────────────────────────────────────────────────
    const properties: PropertySummary[] = db.properties.map((prop) => {
      const units = db.units.filter((u) => u.propertyId === prop.id);
      const leases = units.flatMap((u) =>
        db.leases.filter((l) => l.unitId === u.id),
      );
      const payments = leases.flatMap((l) =>
        db.payments.filter((p) => p.leaseId === l.id),
      );

      const totalRent = leases.reduce((s, l) => s + l.monthlyRent, 0);
      const hasOverdue = payments.some((p) => p.status === "overdue");
      const hasOutstanding = payments.some((p) => p.status === "outstanding");

      const status: PropertyStatus = hasOverdue
        ? "overdue"
        : hasOutstanding
          ? "outstanding"
          : leases.length === 0
            ? "vacant"
            : "paid";

      return {
        id: prop.id,
        name: prop.name,
        address: prop.address,
        unitCount: units.length,
        leasedCount: leases.length,
        totalRent,
        status,
      };
    });

    // ── Global stats ──────────────────────────────────────────────────────────
    const allLeases = db.leases;
    const allPayments = db.payments;
    const totalUnits = db.units.length;
    const occupiedUnits = allLeases.length;

    const totalMonthlyRent = allLeases.reduce((s, l) => s + l.monthlyRent, 0);
    const collectedThisMonth = allPayments
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.amountPaid, 0);

    // ── Payment breakdown ─────────────────────────────────────────────────────
    const paymentBreakdown = {
      paid: allPayments.filter((p) => p.status === "paid").length,
      outstanding: allPayments.filter((p) => p.status === "outstanding").length,
      overdue: allPayments.filter((p) => p.status === "overdue").length,
    };

    // ── Monthly revenue (last 6 months) ───────────────────────────────────────
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyRevenue: MonthlyRevenue[] = [];

    // Collect distinct months from payments, take last 6
    const allMonths = [
      ...new Set(allPayments.map((p) => p.periodMonth)),
    ].sort();
    const last6 = allMonths.slice(-6);

    for (const ym of last6) {
      const monthPayments = allPayments.filter((p) => p.periodMonth === ym);
      const expected = monthPayments.reduce((s, p) => s + p.amountDue, 0);
      const collected = monthPayments
        .filter((p) => p.status === "paid")
        .reduce((s, p) => s + p.amountPaid, 0);
      const [, month] = ym.split("-");
      monthlyRevenue.push({
        month: monthNames[Number(month) - 1],
        expected,
        collected,
      });
    }

    const data: ManagerDashboardData = {
      stats: {
        totalProperties: db.properties.length,
        totalUnits,
        occupiedUnits,
        vacantUnits: totalUnits - occupiedUnits,
        totalMonthlyRent,
        collectedThisMonth,
      },
      paymentBreakdown,
      monthlyRevenue,
      properties,
    };

    return NextResponse.json(data);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
