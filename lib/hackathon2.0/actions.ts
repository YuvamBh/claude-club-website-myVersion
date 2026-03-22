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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateInviteCode(): string {
  const words = [
    "sudo", "git", "hack", "asu", "code", "push", "pull", "commit", "build", 
    "dev", "prod", "main", "debug", "pizza", "coffee", "react", "node", 
    "logic", "byte", "pixel", "cloud", "stack", "error", "fixed", "claude"
  ];
  const count = Math.floor(Math.random() * 3) + 2; // 2-4 words
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(words[Math.floor(Math.random() * words.length)]);
  }
  return result.join("-") + "-" + Math.floor(Math.random() * 90 + 10);
}

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
  resumeUrl: z.string().url().optional().or(z.literal("")), // Validated as required conditionally in saveAction
  dietaryNeeds: z.string().optional(),
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

  // Final validation for submission
  if (submit) {
    if (!rest.githubUrl || rest.githubUrl.trim() === "") {
      return { success: false, error: "GitHub URL is required for submission." };
    }
    if (!rest.resumeUrl || rest.resumeUrl.trim() === "") {
      return { success: false, error: "Resume is required for submission." };
    }
  }

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

export async function uploadResume(formData: FormData): Promise<ActionResult<string>> {
  const user = await requireAuth();
  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };
  if (file.size > 10 * 1024 * 1024) return { success: false, error: "File too large (max 10MB)" };

  const db = createAdminClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `resumes/${fileName}`;

  const { error: uploadError } = await db.storage
    .from("hackathon-assets")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    // If bucket doesn't exist, this might fail. We assume "hackathon-assets" exists.
    return { success: false, error: uploadError.message };
  }

  const { data } = db.storage.from("hackathon-assets").getPublicUrl(filePath);
  return { success: true, data: data.publicUrl };
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
      agreedToRules: data.agreed_to_rules ?? false,
      status: data.status,
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
      invite_code: generateInviteCode(),
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

  const { data: members } = await db
    .from("hackathon_team_members")
    .select("*")
    .eq("team_id", teamId)
    .order("joined_at", { ascending: true });

  const membership = members?.find((m) => m.user_id === user.id);
  if (!membership) return { success: false, error: "You are not on this team." };

  if (membership.role === "CAPTAIN") {
    // If other members exist, promote the next oldest joiner
    const others = members?.filter((m) => m.user_id !== user.id);
    if (others && others.length > 0) {
      await db
        .from("hackathon_team_members")
        .update({ role: "CAPTAIN" })
        .eq("id", others[0].id);
    } else {
      // If last member is captain, delete team
      await db.from("hackathon_teams").delete().eq("id", teamId);
      revalidatePath("/hackathon2.0/team");
      return { success: true, data: null };
    }
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

export async function deleteTeam(teamId: string): Promise<ActionResult> {
  const user = await requireAuth();
  const db = createAdminClient();

  // Verify user is captain
  const { data: membership } = await db
    .from("hackathon_team_members")
    .select("*")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .eq("role", "CAPTAIN")
    .maybeSingle();

  if (!membership && user.role !== "ADMIN") {
    return { success: false, error: "Only the captain can delete the team." };
  }

  const { error } = await db.from("hackathon_teams").delete().eq("id", teamId);
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
  videoUrl: z.string().url().optional().or(z.literal("")),
  presentationUrl: z.string().url().optional().or(z.literal("")),
  deploymentUrl: z.string().url().optional().or(z.literal("")),
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

  if (process.env.NEXT_PUBLIC_SUBMISSION_LOCKED === "true" && user.role !== "ADMIN") {
    return { success: false, error: "Submissions are currently locked." };
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
    video_url: rest.videoUrl || null,
    presentation_url: rest.presentationUrl || null,
    deployment_url: rest.deploymentUrl || null,
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

  // Dispatch email to all team members if the project was just submitted
  if (submit) {
    try {
      const { data: members } = await db
        .from("hackathon_team_members")
        .select("user_id")
        .eq("team_id", teamId);

      const memberIds = members?.map((m) => m.user_id) || [];
      if (memberIds.length > 0) {
        const { data: users } = await db
          .from("hackathon_users")
          .select("email")
          .in("id", memberIds);

        const emails = users?.map((u) => u.email).filter(Boolean) as string[];
        if (emails && emails.length > 0) {
          const { sendSubmissionConfirmationEmail } = await import("./email");
          await sendSubmissionConfirmationEmail(emails, parsed.data.projectName);
        }
      }
    } catch (e) {
      console.error("Failed to send submission email:", e);
      // We still return success since the DB commit succeeded
    }
  }

  revalidatePath("/hackathon2.0/submit");
  revalidatePath("/hackathon2.0/dashboard");
  return { success: true, data };
}

// ─── Admin: Unlock submission ────────────────────────────────────────────────

export async function unlockSubmission(submissionId: string): Promise<ActionResult> {
  await requireAdmin();
  const db = createAdminClient();

  const { data, error } = await db
    .from("hackathon_submissions")
    .update({ status: "DRAFT", submitted_at: null })
    .eq("id", submissionId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath(`/hackathon2.0/admin/submissions/${submissionId}`);
  revalidatePath("/hackathon2.0/admin/submissions");
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

  revalidatePath("/hackathon2.0/checkin");
  revalidatePath("/hackathon2.0/admin/content");
  return { success: true, data: result.data };
}

export async function deleteAnnouncement(id: string): Promise<ActionResult<null>> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("hackathon_announcements").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/hackathon2.0/checkin");
  revalidatePath("/hackathon2.0/admin/content");
  return { success: true, data: null };
}

// ─── Check-in ─────────────────────────────────────────────────────────────────

/** Haversine distance in meters between two lat/lng points */
function distanceMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function checkinWithLocation(
  hackathonId: string,
  checkinDayId: string,
  lat: number,
  lng: number
): Promise<ActionResult<{ checkedIn: true }>> {
  const user = await requireAuth();
  const db = createAdminClient();

  // Fetch venue coordinates
  const { data: hackathon, error: hErr } = await db
    .from("hackathons")
    .select("venue_lat, venue_lng, venue_radius_m")
    .eq("id", hackathonId)
    .single();

  if (hErr || !hackathon) return { success: false, error: "Hackathon not found." };
  if (!hackathon.venue_lat || !hackathon.venue_lng) {
    return { success: false, error: "Venue coordinates are not configured yet." };
  }

  const distance = distanceMeters(lat, lng, hackathon.venue_lat, hackathon.venue_lng);
  const radius = hackathon.venue_radius_m ?? 200;
  if (distance > radius) {
    return {
      success: false,
      error: `You must be within ${radius}m of the venue to check in. You are currently ${Math.round(distance)}m away.`,
    };
  }

  const { error } = await db.from("hackathon_checkins").upsert({
    user_id: user.id,
    hackathon_id: hackathonId,
    checkin_day_id: checkinDayId,
    method: "LOCATION",
    latitude: lat,
    longitude: lng,
  }, { onConflict: "user_id,checkin_day_id" });

  if (error) return { success: false, error: error.message };

  revalidatePath("/hackathon2.0/checkin");
  revalidatePath("/hackathon2.0/dashboard");
  revalidatePath("/hackathon2.0/admin");
  return { success: true, data: { checkedIn: true } };
}

export async function adminCheckinByQr(
  qrToken: string,
  checkinDayId: string,
  hackathonId: string
): Promise<ActionResult<{ participantName: string }>> {
  const admin = await requireAdmin();
  const db = createAdminClient();

  // Look up participant by id (QR code encodes user.id)
  const { data: participant, error: pErr } = await db
    .from("hackathon_users")
    .select("id, name")
    .eq("id", qrToken)
    .maybeSingle();

  if (pErr || !participant) return { success: false, error: "QR code not recognised." };

  const { error } = await db.from("hackathon_checkins").upsert({
    user_id: participant.id,
    hackathon_id: hackathonId,
    checkin_day_id: checkinDayId,
    method: "ADMIN_QR",
    overridden_by: admin.id,
  }, { onConflict: "user_id,checkin_day_id" });

  if (error) return { success: false, error: error.message };

  revalidatePath("/hackathon2.0/admin/scanner");
  revalidatePath("/hackathon2.0/admin");
  return { success: true, data: { participantName: participant.name } };
}

// ─── Judging ──────────────────────────────────────────────────────────────────

const JudgeScoreSchema = z.object({
  submissionId: z.string(),
  criterionId: z.string(),
  score: z.number().int().min(0).max(100),
  notes: z.string().optional(),
});

export async function submitJudgeScore(
  formData: FormData
): Promise<ActionResult<{ saved: true }>> {
  const judge = await requireAuth();
  if (judge.role !== "JUDGE" && judge.role !== "ADMIN") {
    return { success: false, error: "Only judges can score submissions." };
  }

  const raw = {
    submissionId: formData.get("submissionId"),
    criterionId: formData.get("criterionId"),
    score: Number(formData.get("score")),
    notes: formData.get("notes") ?? undefined,
  };

  const parsed = JudgeScoreSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Invalid score data." };

  const db = createAdminClient();
  const { error } = await db.from("hackathon_judge_scores").upsert({
    submission_id: parsed.data.submissionId,
    judge_id: judge.id,
    criterion_id: parsed.data.criterionId,
    score: parsed.data.score,
    notes: parsed.data.notes ?? null,
  }, { onConflict: "submission_id,judge_id,criterion_id" });

  if (error) return { success: false, error: error.message };

  revalidatePath("/hackathon2.0/admin/judging");
  return { success: true, data: { saved: true } };
}

// ─── Admin: Update Venue Coordinates ─────────────────────────────────────────

const VenueSchema = z.object({
  hackathonId: z.string(),
  venueLat: z.number().min(-90).max(90),
  venueLng: z.number().min(-180).max(180),
  venueRadiusM: z.number().int().min(10).max(5000),
});

export async function updateVenueCoordinates(
  formData: FormData
): Promise<ActionResult<{ updated: true }>> {
  await requireAdmin();

  const parsed = VenueSchema.safeParse({
    hackathonId: formData.get("hackathonId"),
    venueLat: Number(formData.get("venueLat")),
    venueLng: Number(formData.get("venueLng")),
    venueRadiusM: Number(formData.get("venueRadiusM")),
  });

  if (!parsed.success) return { success: false, error: "Invalid coordinates." };

  const db = createAdminClient();
  const { error } = await db
    .from("hackathons")
    .update({
      venue_lat: parsed.data.venueLat,
      venue_lng: parsed.data.venueLng,
      venue_radius_m: parsed.data.venueRadiusM,
    })
    .eq("id", parsed.data.hackathonId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/hackathon2.0/admin/content");
  return { success: true, data: { updated: true } };
}
