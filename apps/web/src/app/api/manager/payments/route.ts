import { NextRequest, NextResponse } from "next/server";
import { db } from "@/platform/db";
import { withDelay, errorResponse } from "@/platform/utils";
import type { PaymentListItem } from "@repo/platform-types";

export async function GET(req: NextRequest) {
  try {
    await withDelay(req);

    const items: PaymentListItem[] = [];

    for (const payment of db.payments) {
      const lease = db.leases.find((l) => l.id === payment.lease_id);
      if (!lease) continue;
      const unit = db.units.find((u) => u.id === lease.unit_id);
      if (!unit) continue;
      const property = db.properties.find((p) => p.id === unit.property_id);
      if (!property) continue;
      const tenant = db.tenants.find((t) => t.id === lease.tenant_id);
      if (!tenant) continue;

      items.push({ payment, lease, unit, property, tenant });
    }

    // Sort: overdue first, then outstanding, then paid desc by period
    const order = { overdue: 0, outstanding: 1, paid: 2 };
    items.sort((a, b) => {
      const statusDiff = (order[a.payment.status] ?? 2) - (order[b.payment.status] ?? 2);
      if (statusDiff !== 0) return statusDiff;
      return b.payment.period_month.localeCompare(a.payment.period_month);
    });

    return NextResponse.json(items);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
