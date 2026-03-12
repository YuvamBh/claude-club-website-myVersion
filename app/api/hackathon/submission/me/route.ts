import { NextResponse } from "next/server";
import { getHackathonUser } from "@/lib/hackathon/rbac";
import { getUserTeam, getTeamSubmission, getActiveHackathon } from "@/lib/hackathon/queries";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/hackathon/submission/me
 * Returns the current user's team + submission data for the submit page.
 */
export async function GET() {
  const user = await getHackathonUser();
  if (!user) return NextResponse.json({ team: null, submission: null }, { status: 401 });

  const hackathon = await getActiveHackathon();
  if (!hackathon) return NextResponse.json({ team: null, submission: null });

  const team = await getUserTeam(user.id, hackathon.id);
  if (!team) return NextResponse.json({ team: null, submission: null, isCaptain: false });

  const submission = await getTeamSubmission(team.id);
  const isCaptain = team.members.some(
    (m) => m.userId === user.id && m.role === "CAPTAIN"
  );

  // Fetch tracks for the submission form
  const tracks = await prisma.track.findMany({
    where: { hackathonId: hackathon.id },
    select: { id: true, name: true },
  });

  // Safe serialization
  const safeTeam = {
    id: team.id,
    name: team.name,
    tracks,
  };

  const safeSubmission = submission
    ? {
        ...submission,
        createdAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
        submittedAt: submission.submittedAt?.toISOString() ?? null,
        agreedAt: submission.agreedAt?.toISOString() ?? null,
        reviewedAt: submission.reviewedAt?.toISOString() ?? null,
      }
    : null;

  return NextResponse.json({ team: safeTeam, submission: safeSubmission, isCaptain });
}
