import { NextRequest, NextResponse } from "next/server";
import { db, generateId } from "@/platform/db";
import { withDelay, errorResponse } from "@/platform/utils";
import type { PaymentMethod } from "@/platform/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await withDelay(req);
    const methods = db.paymentMethods.filter((m) => m.tenant_id === params.id);
    return NextResponse.json(methods);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await withDelay(req);
    const { label } = await req.json();
    if (!label?.trim())
      return NextResponse.json({ message: "Label is required" }, { status: 400 });

    const method: PaymentMethod = {
      id: generateId("pm"),
      tenant_id: params.id,
      label: label.trim(),
    };
    db.paymentMethods.push(method);
    return NextResponse.json(method);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
