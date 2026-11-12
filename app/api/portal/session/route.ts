import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, readAccessToken } from "@/lib/portal-access";

// GET: is this browser's one-time verification still valid?
// DELETE: sign out on this browser (clears the cookie).
export async function GET(request: NextRequest) {
  const p = readAccessToken(request.cookies.get(ACCESS_COOKIE)?.value);
  return NextResponse.json(
    { verified: !!p, expires_at: p ? new Date(p.exp * 1000).toISOString() : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function DELETE() {
  const res = NextResponse.json({ verified: false });
  res.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
