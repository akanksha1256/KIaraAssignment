import { NextRequest, NextResponse } from "next/server";
import { db, generateId } from "@/platform/db";
import { resolvePaymentStatus } from "@/platform/payments";
import { withDelay, errorResponse } from "@/platform/utils";
import type { TenantListItem } from "@repo/platform-types";

export async function POST(req: NextRequest) {
  try {
    await withDelay(req);
    const { name, email, contact } = await req.json();

    if (!name?.trim()) return NextResponse.json({ message: "Name is required" }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ message: "Email is required" }, { status: 400 });

    const tenant = {
      id: generateId("tenant"),
      name: name.trim(),
      email: email.trim(),
      contact: contact?.trim() ?? "",
      kyc_status: "not_submitted" as const,
      kyc_verified_on: null,
      kyc_document: null,
    };
    db.tenants.push(tenant);

    return NextResponse.json({ tenant }, { status: 201 });
  } catch (e: any) {
    return errorResponse(e.message);
  }
}

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
        if (new Date(lease.start_date) > now) {
          paymentStatus = "upcoming";
        } else {
          const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
          const payment = db.payments.find(
            (p) => p.lease_id === lease.id && p.period_month === currentMonth,
          );
          paymentStatus = payment ? resolvePaymentStatus(payment) : "outstanding";
        }
      }

      return { tenant, lease, unit, property, payment_status: paymentStatus };
    });

    return NextResponse.json(items);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
