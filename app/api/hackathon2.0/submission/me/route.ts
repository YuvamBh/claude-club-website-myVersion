import { NextResponse } from "next/server";
import { getHackathonUser } from "@/lib/hackathon2.0/rbac";
import { getUserTeam, getActiveHackathon, getTracks } from "@/lib/hackathon2.0/queries";

/**
 * GET /api/hackathon2.0/submission/me
 * Returns the current user's team + submission data for the submit page.
 */
export async function GET() {
  const user = await getHackathonUser();
  if (!user) return NextResponse.json({ team: null, submission: null }, { status: 401 });

  const hackathon = await getActiveHackathon();
  if (!hackathon) return NextResponse.json({ team: null, submission: null });

  const team = await getUserTeam(user.id, hackathon.id);
  if (!team) return NextResponse.json({ team: null, submission: null, isCaptain: false });

  const submission = team.submission ?? null;
  const members = team.members ?? [];
  
  const isCaptain = members.some(
    (m: any) => m.userId === user.id && m.role === "CAPTAIN"
  );

  // Fetch tracks for the submission form
  const tracks = await getTracks(hackathon.id);

  // Safe serialization
  const safeTeam = {
    id: (team as { id: string }).id,
    name: (team as { name: string }).name,
    tracks,
  };

  return NextResponse.json({ team: safeTeam, submission, isCaptain });
}
