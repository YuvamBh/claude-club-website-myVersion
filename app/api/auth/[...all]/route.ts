// Better Auth handler removed — OAuth is now handled by Supabase.
// The active callback route is at /api/auth/callback.
import { NextResponse } from "next/server";
export function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
export function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
