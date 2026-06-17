import { NextRequest, NextResponse } from "next/server";
import { db } from "@/platform/db";
import { withResolvedStatus } from "@/platform/payments";
import { withDelay, errorResponse } from "@/platform/utils";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await withDelay(req);
    const { period_month } = await req.json();
    const lease = db.leases.find((l) => l.id === params.id);
    if (!lease) return NextResponse.json({ message: "Lease not found" }, { status: 404 });
    const payment = db.payments.find(
      (p) => p.lease_id === params.id && p.period_month === period_month,
    );
    if (!payment) return NextResponse.json({ message: "Payment not found" }, { status: 404 });
    payment.last_reminded_on = new Date().toISOString();
    return NextResponse.json(withResolvedStatus(payment));
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
