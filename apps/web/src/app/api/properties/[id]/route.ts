import { NextRequest, NextResponse } from "next/server";
import { db } from "@/platform/db";
import { resolvePayments } from "@/platform/payments";
import { withDelay, errorResponse } from "@/platform/utils";
import type { PropertyDetailData, UnitDetail, PaymentStatus } from "@repo/platform-types";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await withDelay(req);

    const property = db.properties.find((p) => p.id === params.id);
    if (!property) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 });
    }

    const units: UnitDetail[] = db.units
      .filter((u) => u.property_id === property.id)
      .map((u) => {
        const lease = db.leases.find((l) => l.unit_id === u.id) ?? null;
        const tenant = lease ? (db.tenants.find((t) => t.id === lease.tenant_id) ?? null) : null;

        let payment_status: PaymentStatus | "vacant" = "vacant";
        let current_period_month: string | null = null;
        if (lease) {
          if (new Date(lease.start_date) > new Date()) {
            payment_status = "upcoming";
          } else {
            const payments = resolvePayments(db.payments.filter((p) => p.lease_id === lease.id));
            const overdue = payments.find((p) => p.status === "overdue");
            const outstanding = payments.find((p) => p.status === "outstanding");
            if (overdue) { payment_status = "overdue"; current_period_month = overdue.period_month; }
            else if (outstanding) { payment_status = "outstanding"; current_period_month = outstanding.period_month; }
            else payment_status = "paid";
          }
        }

        return { id: u.id, label: u.label, tenant, lease, payment_status, current_period_month };
      });

    const data: PropertyDetailData = { property, units };
    return NextResponse.json(data);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
