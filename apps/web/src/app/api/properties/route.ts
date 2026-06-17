import { NextRequest, NextResponse } from "next/server";
import { db, generateId } from "@/platform/db";
import { withDelay, errorResponse } from "@/platform/utils";
import type { Property, Unit } from "@repo/platform-types";

export async function POST(req: NextRequest) {
  try {
    await withDelay(req);
    const body = await req.json();
    const { name, address, units: unitLabels } = body;

    if (!name?.trim()) return NextResponse.json({ message: "Property name is required" }, { status: 400 });
    if (!address?.trim()) return NextResponse.json({ message: "Address is required" }, { status: 400 });

    // Inherit manager info from the first existing property (single-manager demo)
    const ref = db.properties[0];
    const property: Property = {
      id: generateId("prop"),
      name: name.trim(),
      address: address.trim(),
      manager_name: ref?.manager_name ?? "Manager",
      manager_email: ref?.manager_email ?? "",
      manager_contact: ref?.manager_contact ?? "",
    };
    db.properties.push(property);

    const labels: string[] = Array.isArray(unitLabels)
      ? unitLabels.map((l: string) => l?.trim()).filter(Boolean)
      : [];

    const units: Unit[] = labels.map((label) => {
      const unit: Unit = { id: generateId("unit"), property_id: property.id, label };
      db.units.push(unit);
      return unit;
    });

    return NextResponse.json({ property, units }, { status: 201 });
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
