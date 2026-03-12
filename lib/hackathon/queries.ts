/**
 * Typed query helpers for the hackathon platform.
 * All queries are server-only (never imported from client components).
 */

import { prisma } from "@/lib/prisma";

// ─── Hackathon ────────────────────────────────────────────────────────────────

export async function getActiveHackathon() {
  return prisma.hackathon.findFirst({
    where: { isActive: true, isPublished: true },
    include: {
      tracks: { orderBy: { name: "asc" } },
      rules: { orderBy: { order: "asc" } },
      faqs: { orderBy: { order: "asc" } },
      announcements: {
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
        where: { publishedAt: { not: null } },
      },
      judgingCriteria: { orderBy: { order: "asc" } },
    },
  });
}

export async function getHackathonBySlug(slug: string) {
  return prisma.hackathon.findUnique({
    where: { slug },
    include: {
      tracks: true,
      rules: { orderBy: { order: "asc" } },
      faqs: { orderBy: { order: "asc" } },
      judgingCriteria: { orderBy: { order: "asc" } },
    },
  });
}

// ─── Application ─────────────────────────────────────────────────────────────

export async function getUserApplication(userId: string, hackathonId: string) {
  return prisma.application.findFirst({
    where: { userId, hackathonId },
  });
}

export async function getApplicationById(id: string) {
  return prisma.application.findUnique({
    where: { id },
    include: { user: { include: { profile: true } } },
  });
}

export async function getAllApplications(hackathonId: string) {
  return prisma.application.findMany({
    where: { hackathonId },
    include: {
      user: { include: { profile: true, teamMemberships: { include: { team: true } } } },
    },
    orderBy: { submittedAt: "desc" },
  });
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export async function getUserTeam(userId: string, hackathonId: string) {
  const membership = await prisma.teamMember.findFirst({
    where: { userId, team: { hackathonId } },
    include: {
      team: {
        include: {
          members: { include: { user: { include: { profile: true } } } },
          track: true,
          submission: true,
        },
      },
    },
  });
  return membership?.team ?? null;
}

export async function getTeamByInviteCode(code: string) {
  return prisma.team.findUnique({
    where: { inviteCode: code },
    include: {
      members: { include: { user: true } },
      hackathon: true,
    },
  });
}

export async function getAllTeams(hackathonId: string) {
  return prisma.team.findMany({
    where: { hackathonId },
    include: {
      track: true,
      members: {
        include: { user: { include: { profile: true } } },
      },
      submission: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Submission ───────────────────────────────────────────────────────────────

export async function getTeamSubmission(teamId: string) {
  return prisma.submission.findUnique({
    where: { teamId },
    include: { assets: true, team: { include: { members: { include: { user: true } } } } },
  });
}

export async function getSubmissionById(id: string) {
  return prisma.submission.findUnique({
    where: { id },
    include: {
      assets: true,
      team: {
        include: {
          track: true,
          members: { include: { user: { include: { profile: true, application: true } } } },
        },
      },
    },
  });
}

export async function getAllSubmissions(hackathonId: string) {
  return prisma.submission.findMany({
    where: { hackathonId },
    include: {
      team: {
        include: { track: true, members: { include: { user: true } } },
      },
      assets: true,
    },
    orderBy: { submittedAt: "desc" },
  });
}

// ─── Admin stats ──────────────────────────────────────────────────────────────

export async function getAdminStats(hackathonId: string) {
  const [
    totalApplicants,
    acceptedApplicants,
    totalTeams,
    totalSubmissions,
    draftSubmissions,
  ] = await Promise.all([
    prisma.application.count({ where: { hackathonId } }),
    prisma.application.count({ where: { hackathonId, status: "ACCEPTED" } }),
    prisma.team.count({ where: { hackathonId } }),
    prisma.submission.count({ where: { hackathonId, status: { not: "DRAFT" } } }),
    prisma.submission.count({ where: { hackathonId, status: "DRAFT" } }),
  ]);

  return {
    totalApplicants,
    acceptedApplicants,
    totalTeams,
    totalSubmissions,
    draftSubmissions,
  };
}
