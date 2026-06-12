import { NextRequest, NextResponse } from "next/server";
import { db } from "@/platform/db";
import { withDelay, errorResponse } from "@/platform/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await withDelay(req);
    const payments = db.payments.filter((p) => p.lease_id === params.id);
    return NextResponse.json(payments);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
