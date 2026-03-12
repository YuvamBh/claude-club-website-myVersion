"use server";

/**
 * Server Actions for the HackASU platform.
 *
 * Every mutation goes through:
 * 1. Authentication check (requireAuth)
 * 2. Authorization check (RBAC)
 * 3. Zod validation
 * 4. Supabase mutation
 * 5. Structured return: { success, data?, error? }
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, requireAdmin, canManageTeam } from "./rbac";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Application ─────────────────────────────────────────────────────────────

const ApplicationSchema = z.object({
  hackathonId: z.string(),
  university: z.string(),
  major: z.string(),
  year: z.string(),
  experienceLevel: z.string(),
  desiredTracks: z.array(z.string()),
  priorExperience: z.string().optional(),
  whyJoin: z.string(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  resumeUrl: z.string().url().optional().or(z.literal("")),
  dietaryNeeds: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
  agreedToRules: z.boolean(),
  submit: z.boolean().default(false),
});

export async function saveApplication(
  formData: z.infer<typeof ApplicationSchema>
): Promise<ActionResult> {
  const user = await requireAuth();
  const parsed = ApplicationSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { submit, hackathonId, ...rest } = parsed.data;
  const db = createAdminClient();
  const now = new Date().toISOString();

  const payload = {
    user_id: user.id,
    hackathon_id: hackathonId,
    university: rest.university,
    major: rest.major,
    year: rest.year,
    experience_level: rest.experienceLevel,
    desired_tracks: rest.desiredTracks,
    prior_experience: rest.priorExperience ?? null,
    why_join: rest.whyJoin,
    linkedin_url: rest.linkedinUrl || null,
    github_url: rest.githubUrl || null,
    resume_url: rest.resumeUrl || null,
    dietary_needs: rest.dietaryNeeds ?? null,
    accessibility_needs: rest.accessibilityNeeds ?? null,
    agreed_to_rules: rest.agreedToRules,
    agreed_at: rest.agreedToRules ? now : null,
    status: submit ? "SUBMITTED" : "DRAFT",
    submitted_at: submit ? now : null,
    updated_at: now,
  };

  const { data, error } = await db
    .from("hackathon_applications")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/hackathon2.0/dashboard");
  revalidatePath("/hackathon2.0/apply");
  return { success: true, data };
}

export async function getMyApplication(hackathonId: string): Promise<ActionResult> {
  const user = await requireAuth();
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_applications")
    .select("*")
    .eq("user_id", user.id)
    .eq("hackathon_id", hackathonId)
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  
  // Convert snake_case to camelCase nicely for the frontend state
  if (data) {
    const camelData = {
      university: data.university ?? "",
      major: data.major ?? "",
      year: data.year ?? "",
      experienceLevel: data.experience_level ?? "",
      desiredTracks: data.desired_tracks ?? [],
      priorExperience: data.prior_experience ?? "",
      whyJoin: data.why_join ?? "",
      linkedinUrl: data.linkedin_url ?? "",
      githubUrl: data.github_url ?? "",
      resumeUrl: data.resume_url ?? "",
      dietaryNeeds: data.dietary_needs ?? "",
      accessibilityNeeds: data.accessibility_needs ?? "",
      agreedToRules: data.agreed_to_rules ?? false,
    };
    return { success: true, data: camelData };
  }
  return { success: true, data: null };
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
    return { success: false, error: parsed.error.issues[0].message };
  }

  const db = createAdminClient();

  // Check user isn't already on a team for this hackathon
  const { data: existingMembership } = await db
    .from("hackathon_team_members")
    .select("id, hackathon_teams!inner(hackathon_id)")
    .eq("user_id", user.id)
    .eq("hackathon_teams.hackathon_id", parsed.data.hackathonId)
    .maybeSingle();

  if (existingMembership) {
    return { success: false, error: "You are already on a team." };
  }

  // Create team
  const { data: team, error: teamError } = await db
    .from("hackathon_teams")
    .insert({
      hackathon_id: parsed.data.hackathonId,
      name: parsed.data.name,
      track_id: parsed.data.trackId ?? null,
    })
    .select()
    .single();

  if (teamError) return { success: false, error: teamError.message };

  // Add creator as CAPTAIN
  const { error: memberError } = await db.from("hackathon_team_members").insert({
    team_id: team.id,
    user_id: user.id,
    role: "CAPTAIN",
  });

  if (memberError) return { success: false, error: memberError.message };

  revalidatePath("/hackathon2.0/team");
  revalidatePath("/hackathon2.0/dashboard");
  return { success: true, data: team };
}

export async function joinTeam(
  inviteCode: string,
  hackathonId: string
): Promise<ActionResult> {
  const user = await requireAuth();
  const db = createAdminClient();

  const { data: team } = await db
    .from("hackathon_teams")
    .select("*")
    .eq("invite_code", inviteCode)
    .maybeSingle();

  if (!team) return { success: false, error: "Invalid invite code." };
  if (team.hackathon_id !== hackathonId)
    return { success: false, error: "This code is for a different hackathon." };
  if (team.is_locked) return { success: false, error: "This team is locked." };

  const { count: memberCount } = await db
    .from("hackathon_team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", team.id);

  if ((memberCount ?? 0) >= team.max_size)
    return { success: false, error: "This team is full." };

  // Check not already on a team in this hackathon
  const { data: alreadyOnTeam } = await db
    .from("hackathon_team_members")
    .select("id, hackathon_teams!inner(hackathon_id)")
    .eq("user_id", user.id)
    .eq("hackathon_teams.hackathon_id", hackathonId)
    .maybeSingle();

  if (alreadyOnTeam) return { success: false, error: "You are already on a team." };

  const { data: membership, error } = await db
    .from("hackathon_team_members")
    .insert({ team_id: team.id, user_id: user.id, role: "MEMBER" })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/hackathon2.0/team");
  revalidatePath("/hackathon2.0/dashboard");
  return { success: true, data: membership };
}

export async function leaveTeam(teamId: string): Promise<ActionResult> {
  const user = await requireAuth();
  const db = createAdminClient();

  const { data: membership } = await db
    .from("hackathon_team_members")
    .select("*")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) return { success: false, error: "You are not on this team." };
  if (membership.role === "CAPTAIN") {
    return { success: false, error: "Transfer captain role before leaving." };
  }

  const { error } = await db
    .from("hackathon_team_members")
    .delete()
    .eq("id", membership.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/hackathon2.0/team");
  revalidatePath("/hackathon2.0/dashboard");
  return { success: true, data: null };
}

export async function transferCaptain(
  teamId: string,
  newCaptainUserId: string
): Promise<ActionResult> {
  const user = await requireAuth();
  const db = createAdminClient();

  const { data: myMembership } = await db
    .from("hackathon_team_members")
    .select("*")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!canManageTeam(user, myMembership?.user_id ?? ""))
    return { success: false, error: "Only the captain can transfer." };

  // Demote current captain
  await db
    .from("hackathon_team_members")
    .update({ role: "MEMBER" })
    .eq("team_id", teamId)
    .eq("user_id", user.id);

  // Promote new captain
  await db
    .from("hackathon_team_members")
    .update({ role: "CAPTAIN" })
    .eq("team_id", teamId)
    .eq("user_id", newCaptainUserId);

  revalidatePath("/hackathon2.0/team");
  return { success: true, data: null };
}

// ─── Submission ───────────────────────────────────────────────────────────────

const SubmissionSchema = z.object({
  teamId: z.string(),
  hackathonId: z.string(),
  projectName: z.string().max(100),
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
    return { success: false, error: parsed.error.issues[0].message };
  }

  const db = createAdminClient();

  // Verify user is captain of this team
  const { data: captainMembership } = await db
    .from("hackathon_team_members")
    .select("*")
    .eq("team_id", parsed.data.teamId)
    .eq("user_id", user.id)
    .eq("role", "CAPTAIN")
    .maybeSingle();

  if (!captainMembership && user.role !== "ADMIN") {
    return { success: false, error: "Only the team captain can manage submissions." };
  }

  // Check submission deadline
  if (parsed.data.submit) {
    const { data: hackathon } = await db
      .from("hackathons")
      .select("submission_deadline")
      .eq("id", parsed.data.hackathonId)
      .maybeSingle();

    if (hackathon?.submission_deadline && new Date() > new Date(hackathon.submission_deadline)) {
      return { success: false, error: "Submission deadline has passed." };
    }
    if (!parsed.data.agreedToRules) {
      return { success: false, error: "You must agree to the rules before submitting." };
    }
    if (!parsed.data.projectName || !parsed.data.githubUrl) {
      return { success: false, error: "Project name and GitHub link are required to submit." };
    }
  }

  const { submit, teamId, hackathonId, ...rest } = parsed.data;
  const now = new Date().toISOString();

  const payload = {
    team_id: teamId,
    hackathon_id: hackathonId,
    project_name: rest.projectName,
    tagline: rest.tagline ?? null,
    track_id: rest.trackId ?? null,
    short_description: rest.shortDescription ?? null,
    long_description: rest.longDescription ?? null,
    problem_statement: rest.problemStatement ?? null,
    solution_overview: rest.solutionOverview ?? null,
    tech_stack: rest.techStack,
    github_url: rest.githubUrl || null,
    demo_url: rest.demoUrl || null,
    video_url: rest.videoUrl || null,
    presentation_url: rest.presentationUrl || null,
    deployment_url: rest.deploymentUrl || null,
    design_url: rest.designUrl || null,
    additional_notes: rest.additionalNotes ?? null,
    agreed_to_rules: rest.agreedToRules,
    agreed_at: rest.agreedToRules ? now : null,
    status: submit ? "SUBMITTED" : "DRAFT",
    submitted_at: submit ? now : null,
    updated_at: now,
  };

  const { data, error } = await db
    .from("hackathon_submissions")
    .upsert(payload, { onConflict: "team_id" })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/hackathon2.0/submit");
  revalidatePath("/hackathon2.0/dashboard");
  return { success: true, data };
}

// ─── Admin: Update application status ────────────────────────────────────────

export async function updateApplicationStatus(
  applicationId: string,
  status: "ACCEPTED" | "REJECTED" | "WAITLISTED" | "UNDER_REVIEW",
  adminNotes?: string
): Promise<ActionResult> {
  await requireAdmin();
  const db = createAdminClient();

  const { data, error } = await db
    .from("hackathon_applications")
    .update({
      status,
      admin_notes: adminNotes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/hackathon2.0/admin/applicants");
  return { success: true, data };
}

// ─── Admin: Update submission status ─────────────────────────────────────────

export async function updateSubmissionStatus(
  submissionId: string,
  status: "UNDER_REVIEW" | "SHORTLISTED" | "WINNER" | "DISQUALIFIED",
  adminNotes?: string
): Promise<ActionResult> {
  await requireAdmin();
  const db = createAdminClient();

  const { data, error } = await db
    .from("hackathon_submissions")
    .update({
      status,
      admin_notes: adminNotes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/hackathon2.0/admin/submissions");
  return { success: true, data };
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
  const db = createAdminClient();
  const now = new Date().toISOString();

  let result;
  if (data.id) {
    result = await db
      .from("hackathon_announcements")
      .update({
        title: data.title,
        content: data.content,
        is_pinned: data.isPinned ?? false,
        published_at: data.publish ? now : undefined,
        updated_at: now,
      })
      .eq("id", data.id)
      .select()
      .single();
  } else {
    result = await db
      .from("hackathon_announcements")
      .insert({
        hackathon_id: data.hackathonId,
        title: data.title,
        content: data.content,
        is_pinned: data.isPinned ?? false,
        published_at: data.publish ? now : null,
      })
      .select()
      .single();
  }

  if (result.error) return { success: false, error: result.error.message };

  revalidatePath("/hackathon2.0/dashboard");
  revalidatePath("/hackathon2.0/admin/content");
  return { success: true, data: result.data };
}
