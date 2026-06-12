import { NextRequest, NextResponse } from "next/server";
import { db, generateId } from "@/platform/db";
import { withDelay, errorResponse } from "@/platform/utils";
import type { Payment } from "@/platform/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await withDelay(req);
    const { period_month, payment_method_id } = await req.json();
    const lease = db.leases.find((l) => l.id === params.id);
    if (!lease)
      return NextResponse.json({ message: "Lease not found" }, { status: 404 });

    const existing = db.payments.find(
      (p) => p.lease_id === params.id && p.period_month === period_month,
    );
    const paidAt = new Date().toISOString();
    const method = payment_method_id
      ? (db.paymentMethods.find((m) => m.id === payment_method_id)?.label ??
        "Directly to Manager")
      : "Directly to Manager";

    if (existing) {
      existing.status = "paid";
      existing.amount_paid = existing.amount_due;
      existing.paid_date = paidAt;
      existing.method = method;
      return NextResponse.json(existing);
    }

    const payment: Payment = {
      id: generateId("pay"),
      lease_id: params.id,
      period_month,
      amount_due: lease.monthly_rent,
      amount_paid: lease.monthly_rent,
      status: "paid",
      paid_date: paidAt,
      method,
      last_reminded_on: null,
    };
    db.payments.push(payment);
    return NextResponse.json(payment);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
