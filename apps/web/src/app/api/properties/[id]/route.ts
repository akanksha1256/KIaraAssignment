import { NextRequest, NextResponse } from "next/server";
import { db } from "@/platform/db";
import { withDelay, errorResponse } from "@/platform/utils";
import type { PropertyDetailData, UnitDetail, PaymentStatus } from "@/platform/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await withDelay(req);

    const property = db.properties.find((p) => p.id === params.id);
    if (!property) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 });
    }

    const units: UnitDetail[] = db.units
      .filter((u) => u.property_id === property.id)
      .map((u) => {
        const lease  = db.leases.find((l) => l.unit_id === u.id) ?? null;
        const tenant = lease ? db.tenants.find((t) => t.id === lease.tenant_id) ?? null : null;

        let payment_status: PaymentStatus | "vacant" = "vacant";
        if (lease) {
          const payments = db.payments.filter((p) => p.lease_id === lease.id);
          if (payments.some((p) => p.status === "overdue"))      payment_status = "overdue";
          else if (payments.some((p) => p.status === "outstanding")) payment_status = "outstanding";
          else payment_status = "paid";
        }

        return { id: u.id, label: u.label, tenant, lease, payment_status };
      });

    const data: PropertyDetailData = { property, units };
    return NextResponse.json(data);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
