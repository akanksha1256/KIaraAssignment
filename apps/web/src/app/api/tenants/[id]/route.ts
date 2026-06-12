import { NextRequest, NextResponse } from "next/server";
import { db } from "@/platform/db";
import { withDelay, errorResponse } from "@/platform/utils";
import type { TenantProfileData, TenantStanding } from "@repo/platform-types";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await withDelay(req);

    const tenant = db.tenants.find((t) => t.id === params.id);
    if (!tenant) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    }

    const lease = db.leases.find((l) => l.tenant_id === tenant.id) ?? null;
    const unit = lease ? (db.units.find((u) => u.id === lease.unit_id) ?? null) : null;
    const property = unit ? (db.properties.find((p) => p.id === unit.property_id) ?? null) : null;
    const payments = lease ? db.payments.filter((p) => p.lease_id === lease.id) : [];

    let standing: TenantStanding | null = null;
    if (payments.length > 0) {
      const onTime = payments.filter((p) => p.status === "paid").length;
      const score = Math.round((onTime / payments.length) * 100);
      const label =
        score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "Poor";
      standing = { total_payments: payments.length, on_time_payments: onTime, score, label };
    }

    const data: TenantProfileData = { tenant, lease, unit, property, payments, standing };
    return NextResponse.json(data);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
