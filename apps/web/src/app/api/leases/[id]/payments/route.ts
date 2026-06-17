import { NextRequest, NextResponse } from "next/server";
import { db } from "@/platform/db";
import { resolvePayments, withResolvedStatus } from "@/platform/payments";
import { withDelay, errorResponse } from "@/platform/utils";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await withDelay(req);
    const payments = resolvePayments(db.payments.filter((p) => p.lease_id === params.id));
    return NextResponse.json(payments);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
