import { NextResponse } from "next/server";
import { getHackathonUser } from "@/lib/hackathon/rbac";
import { getUserTeam, getActiveHackathon } from "@/lib/hackathon/queries";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/hackathon/team/me
 * Returns the current user's team + userId for the team page client component.
 */
export async function GET() {
  const user = await getHackathonUser();
  if (!user) return NextResponse.json({ team: null, userId: null }, { status: 401 });

  const hackathon = await getActiveHackathon();
  if (!hackathon) return NextResponse.json({ team: null, userId: user.id });

  const team = await getUserTeam(user.id, hackathon.id);

  // Serialize dates for JSON
  const safeTeam = team
    ? {
        ...team,
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
        submission: team.submission
          ? {
              ...team.submission,
              createdAt: team.submission.createdAt.toISOString(),
              updatedAt: team.submission.updatedAt.toISOString(),
              submittedAt: team.submission.submittedAt?.toISOString() ?? null,
              agreedAt: team.submission.agreedAt?.toISOString() ?? null,
              reviewedAt: team.submission.reviewedAt?.toISOString() ?? null,
            }
          : null,
        members: team.members.map((m) => ({
          ...m,
          joinedAt: m.joinedAt.toISOString(),
        })),
      }
    : null;

  return NextResponse.json({ team: safeTeam, userId: user.id });
}
