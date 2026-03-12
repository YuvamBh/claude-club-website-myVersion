"use server";

/**
 * Server Actions for the HackASU platform.
 *
 * Every mutation goes through:
 * 1. Authentication check (requireAuth)
 * 2. Authorization check (RBAC)
 * 3. Zod validation
 * 4. Prisma mutation
 * 5. Structured return: { success, data?, error? }
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, canEditSubmission, canManageTeam } from "./rbac";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Application ─────────────────────────────────────────────────────────────

const ApplicationSchema = z.object({
  hackathonId: z.string(),
  university: z.string().min(2),
  major: z.string().min(2),
  year: z.string(),
  experienceLevel: z.string(),
  desiredTracks: z.array(z.string()).min(1),
  priorExperience: z.string().optional(),
  whyJoin: z.string().min(20),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  resumeUrl: z.string().url().optional().or(z.literal("")),
  dietaryNeeds: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
  agreedToRules: z.boolean().refine((v) => v, "You must agree to the rules"),
  submit: z.boolean().default(false), // false = save draft, true = submit
});

export async function saveApplication(
  formData: z.infer<typeof ApplicationSchema>
): Promise<ActionResult> {
  const user = await requireAuth();
  const parsed = ApplicationSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { submit, ...data } = parsed.data;

  const application = await prisma.application.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...data,
      status: submit ? "SUBMITTED" : "DRAFT",
      submittedAt: submit ? new Date() : null,
      agreedAt: data.agreedToRules ? new Date() : null,
    },
    update: {
      ...data,
      status: submit ? "SUBMITTED" : "DRAFT",
      submittedAt: submit ? new Date() : undefined,
      agreedAt: data.agreedToRules ? new Date() : null,
    },
  });

  revalidatePath("/hackathon/dashboard");
  revalidatePath("/hackathon/apply");
  return { success: true, data: application };
}

// ─── Team ─────────────────────────────────────────────────────────────────────

const CreateTeamSchema = z.object({
  hackathonId: z.string(),
  name: z.string().min(2).max(50),
  trackId: z.string().optional(),
});

export async function createTeam(
  formData: z.infer<typeof CreateTeamSchema>
): Promise<ActionResult> {
  const user = await requireAuth();
  const parsed = CreateTeamSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Check user isn't already on a team for this hackathon
  const existing = await prisma.teamMember.findFirst({
    where: { userId: user.id, team: { hackathonId: parsed.data.hackathonId } },
  });
  if (existing) return { success: false, error: "You are already on a team." };

  const team = await prisma.team.create({
    data: {
      ...parsed.data,
      members: {
        create: { userId: user.id, role: "CAPTAIN" },
      },
    },
  });

  revalidatePath("/hackathon/team");
  revalidatePath("/hackathon/dashboard");
  return { success: true, data: team };
}

export async function joinTeam(
  inviteCode: string,
  hackathonId: string
): Promise<ActionResult> {
  const user = await requireAuth();

  const team = await prisma.team.findUnique({ where: { inviteCode } });
  if (!team) return { success: false, error: "Invalid invite code." };
  if (team.hackathonId !== hackathonId)
    return { success: false, error: "This code is for a different hackathon." };
  if (team.isLocked) return { success: false, error: "This team is locked." };

  const memberCount = await prisma.teamMember.count({ where: { teamId: team.id } });
  if (memberCount >= team.maxSize)
    return { success: false, error: "This team is full." };

  const alreadyOnTeam = await prisma.teamMember.findFirst({
    where: { userId: user.id, team: { hackathonId } },
  });
  if (alreadyOnTeam) return { success: false, error: "You are already on a team." };

  const membership = await prisma.teamMember.create({
    data: { teamId: team.id, userId: user.id, role: "MEMBER" },
  });

  revalidatePath("/hackathon/team");
  revalidatePath("/hackathon/dashboard");
  return { success: true, data: membership };
}

export async function leaveTeam(teamId: string): Promise<ActionResult> {
  const user = await requireAuth();

  const membership = await prisma.teamMember.findFirst({
    where: { teamId, userId: user.id },
  });
  if (!membership) return { success: false, error: "You are not on this team." };
  if (membership.role === "CAPTAIN") {
    return {
      success: false,
      error: "Transfer captain role before leaving.",
    };
  }

  await prisma.teamMember.delete({ where: { id: membership.id } });

  revalidatePath("/hackathon/team");
  revalidatePath("/hackathon/dashboard");
  return { success: true, data: null };
}

export async function transferCaptain(
  teamId: string,
  newCaptainUserId: string
): Promise<ActionResult> {
  const user = await requireAuth();

  const myMembership = await prisma.teamMember.findFirst({
    where: { teamId, userId: user.id },
  });
  if (!canManageTeam(user, myMembership?.userId ?? ""))
    return { success: false, error: "Only the captain can transfer." };

  await prisma.$transaction([
    prisma.teamMember.updateMany({
      where: { teamId, userId: user.id },
      data: { role: "MEMBER" },
    }),
    prisma.teamMember.updateMany({
      where: { teamId, userId: newCaptainUserId },
      data: { role: "CAPTAIN" },
    }),
  ]);

  revalidatePath("/hackathon/team");
  return { success: true, data: null };
}

// ─── Submission ───────────────────────────────────────────────────────────────

const SubmissionSchema = z.object({
  teamId: z.string(),
  hackathonId: z.string(),
  projectName: z.string().min(2).max(100),
  tagline: z.string().max(200).optional(),
  trackId: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().optional(),
  problemStatement: z.string().optional(),
  solutionOverview: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  githubUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  presentationUrl: z.string().url().optional().or(z.literal("")),
  deploymentUrl: z.string().url().optional().or(z.literal("")),
  designUrl: z.string().url().optional().or(z.literal("")),
  additionalNotes: z.string().optional(),
  agreedToRules: z.boolean().default(false),
  submit: z.boolean().default(false),
});

export async function saveSubmission(
  formData: z.infer<typeof SubmissionSchema>
): Promise<ActionResult> {
  const user = await requireAuth();
  const parsed = SubmissionSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Verify user is captain of this team
  const captainMembership = await prisma.teamMember.findFirst({
    where: { teamId: parsed.data.teamId, userId: user.id, role: "CAPTAIN" },
  });
  if (!captainMembership && user.role !== "ADMIN") {
    return { success: false, error: "Only the team captain can manage submissions." };
  }

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: parsed.data.hackathonId },
  });

  if (parsed.data.submit) {
    if (hackathon?.submissionDeadline && new Date() > hackathon.submissionDeadline) {
      return { success: false, error: "Submission deadline has passed." };
    }
    if (!parsed.data.agreedToRules) {
      return { success: false, error: "You must agree to the rules before submitting." };
    }
    if (!parsed.data.projectName || !parsed.data.githubUrl) {
      return {
        success: false,
        error: "Project name and GitHub link are required to submit.",
      };
    }
  }

  const { submit, ...data } = parsed.data;

  const submission = await prisma.submission.upsert({
    where: { teamId: parsed.data.teamId },
    create: {
      ...data,
      status: submit ? "SUBMITTED" : "DRAFT",
      submittedAt: submit ? new Date() : null,
      agreedAt: data.agreedToRules ? new Date() : null,
    },
    update: {
      ...data,
      status: submit ? "SUBMITTED" : "DRAFT",
      submittedAt: submit ? new Date() : undefined,
      agreedAt: data.agreedToRules ? new Date() : null,
    },
  });

  revalidatePath("/hackathon/submit");
  revalidatePath("/hackathon/dashboard");
  return { success: true, data: submission };
}

// ─── Admin: Update application status ────────────────────────────────────────

export async function updateApplicationStatus(
  applicationId: string,
  status: "ACCEPTED" | "REJECTED" | "WAITLISTED" | "UNDER_REVIEW",
  adminNotes?: string
): Promise<ActionResult> {
  await requireAdmin();

  const application = await prisma.application.update({
    where: { id: applicationId },
    data: { status, adminNotes, reviewedAt: new Date() },
  });

  revalidatePath("/hackathon/admin/applicants");
  return { success: true, data: application };
}

// ─── Admin: Update submission status ─────────────────────────────────────────

export async function updateSubmissionStatus(
  submissionId: string,
  status: "UNDER_REVIEW" | "SHORTLISTED" | "WINNER" | "DISQUALIFIED",
  adminNotes?: string
): Promise<ActionResult> {
  await requireAdmin();

  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: { status, adminNotes, reviewedAt: new Date() },
  });

  revalidatePath("/hackathon/admin/submissions");
  return { success: true, data: submission };
}

// ─── Admin: Upsert hackathon content ─────────────────────────────────────────

export async function upsertAnnouncement(data: {
  hackathonId: string;
  id?: string;
  title: string;
  content: string;
  isPinned?: boolean;
  publish?: boolean;
}): Promise<ActionResult> {
  await requireAdmin();

  const announcement = data.id
    ? await prisma.announcement.update({
        where: { id: data.id },
        data: {
          title: data.title,
          content: data.content,
          isPinned: data.isPinned ?? false,
          publishedAt: data.publish ? new Date() : undefined,
        },
      })
    : await prisma.announcement.create({
        data: {
          hackathonId: data.hackathonId,
          title: data.title,
          content: data.content,
          isPinned: data.isPinned ?? false,
          publishedAt: data.publish ? new Date() : null,
        },
      });

  revalidatePath("/hackathon/dashboard");
  revalidatePath("/hackathon/admin/content");
  return { success: true, data: announcement };
}
