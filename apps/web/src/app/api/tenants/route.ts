import { NextRequest, NextResponse } from "next/server";
import { db } from "@/platform/db";
import { withDelay, errorResponse } from "@/platform/utils";
import type { TenantListItem } from "@repo/platform-types";

export async function GET(req: NextRequest) {
  try {
    await withDelay(req);

    const items: TenantListItem[] = db.tenants.map((tenant) => {
      const lease = db.leases.find((l) => l.tenant_id === tenant.id) ?? null;
      const unit = lease ? (db.units.find((u) => u.id === lease.unit_id) ?? null) : null;
      const property = unit ? (db.properties.find((p) => p.id === unit.property_id) ?? null) : null;

      let paymentStatus: TenantListItem["payment_status"] = "vacant";
      if (lease) {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const payment = db.payments.find(
          (p) => p.lease_id === lease.id && p.period_month === currentMonth,
        );
        paymentStatus = payment ? payment.status : "outstanding";
      }

      return { tenant, lease, unit, property, payment_status: paymentStatus };
    });

    return NextResponse.json(items);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
