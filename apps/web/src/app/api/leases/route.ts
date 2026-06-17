import { NextRequest, NextResponse } from "next/server";
import { db, generateId } from "@/platform/db";
import { withDelay, errorResponse } from "@/platform/utils";
import type { Lease } from "@repo/platform-types";

export async function POST(req: NextRequest) {
  try {
    await withDelay(req);
    const { unit_id, tenant_id, start_date, end_date, monthly_rent, terms } = await req.json();

    if (!unit_id)       return NextResponse.json({ message: "Unit is required" }, { status: 400 });
    if (!tenant_id)     return NextResponse.json({ message: "Tenant is required" }, { status: 400 });
    if (!start_date)    return NextResponse.json({ message: "Start date is required" }, { status: 400 });
    if (!end_date)      return NextResponse.json({ message: "End date is required" }, { status: 400 });
    if (!monthly_rent)  return NextResponse.json({ message: "Monthly rent is required" }, { status: 400 });

    if (!db.units.find((u) => u.id === unit_id))
      return NextResponse.json({ message: "Unit not found" }, { status: 404 });
    if (!db.tenants.find((t) => t.id === tenant_id))
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 });

    // Remove any existing lease for this unit
    const existingIdx = db.leases.findIndex((l) => l.unit_id === unit_id);
    if (existingIdx !== -1) db.leases.splice(existingIdx, 1);

    const lease: Lease = {
      id: generateId("lease"),
      unit_id,
      tenant_id,
      start_date,
      end_date,
      monthly_rent: Number(monthly_rent),
      terms: terms ?? "",
      lease_document: null,
    };
    db.leases.push(lease);

    return NextResponse.json(lease, { status: 201 });
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
