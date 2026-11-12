import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/portal-access";
import { currentSession, revokeSessions } from "@/lib/portal-session";

// GET: is this browser's one-time verification still valid? (no personal data returned)
// DELETE: sign out on this browser; ?everywhere=1 signs out every device.
export async function GET(request: NextRequest) {
  const p = await currentSession(request.cookies);
  return NextResponse.json(
    { verified: !!p, expires_at: p ? new Date(p.exp * 1000).toISOString() : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function DELETE(request: NextRequest) {
  const p = await currentSession(request.cookies);
  if (p) await revokeSessions(p, request.nextUrl.searchParams.get("everywhere") === "1");
  const res = NextResponse.json({ verified: false });
  res.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
