import { NextResponse } from "next/server";
import { getHackathonUser } from "@/lib/hackathon2.0/rbac";
import { getUserTeam, getActiveHackathon } from "@/lib/hackathon2.0/queries";

/**
 * GET /api/hackathon2.0/team/me
 * Returns the current user's team + userId for the team page client component.
 */
export async function GET() {
  const user = await getHackathonUser();
  if (!user) return NextResponse.json({ team: null, userId: null }, { status: 401 });

  const hackathon = await getActiveHackathon();
  if (!hackathon) return NextResponse.json({ team: null, userId: user.id });

  const team = await getUserTeam(user.id, hackathon.id);

  return NextResponse.json({ team: team ?? null, userId: user.id });
}
