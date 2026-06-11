import { NextRequest, NextResponse } from "next/server";

export const DELAY_MS = 800;

export async function withDelay(req: NextRequest) {
  const fail = req.nextUrl.searchParams.get("fail") === "true";
  await new Promise((r) => setTimeout(r, DELAY_MS));
  if (fail) throw new Error("Forced failure (fail=true)");
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}
