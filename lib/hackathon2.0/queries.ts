/**
 * Typed query helpers for the hackathon platform.
 * All queries are server-only (never imported from client components).
 * Uses Supabase admin client (service role) for all reads.
 *
 * Data is returned normalized to camelCase and cast to `any` to match the
 * expected shapes in page components (originally written for Prisma).
 */

import { createAdminClient } from "@/lib/supabase/admin";

// ─── Types ────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

/** Shallow snake_case → camelCase key transformer */
function toCamel(obj: Row): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(obj)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  }
  return out;
}

/** Deep normalize: converts keys and recurses into arrays/objects */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(val: any): any {
  if (Array.isArray(val)) return val.map(normalize);
  if (val !== null && typeof val === "object" && !(val instanceof Date)) {
    const camel = toCamel(val);
    for (const k of Object.keys(camel)) {
      camel[k] = normalize(camel[k]);
    }
    return camel;
  }
  return val;
}

// ─── Hackathon ────────────────────────────────────────────────────────────────

export async function getActiveHackathon() {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathons")
    .select(
      `*, 
       hackathon_tracks(*), 
       hackathon_rules(*), 
       hackathon_faqs(*), 
       hackathon_announcements(*), 
       hackathon_judging_criteria(*)`
    )
    .eq("is_active", true)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const n = normalize(data) as Row;
  return {
    ...n,
    tracks: normalize(data.hackathon_tracks ?? []).sort((a: Row, b: Row) =>
      a.name.localeCompare(b.name)
    ),
    rules: normalize(data.hackathon_rules ?? []).sort((a: Row, b: Row) => a.order - b.order),
    faqs: normalize(data.hackathon_faqs ?? []).sort((a: Row, b: Row) => a.order - b.order),
    announcements: normalize(data.hackathon_announcements ?? [])
      .filter((a: Row) => a.publishedAt !== null)
      .sort((a: Row, b: Row) => {
        if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }),
    judgingCriteria: normalize(data.hackathon_judging_criteria ?? []).sort(
      (a: Row, b: Row) => a.order - b.order
    ),
    startDate: data.start_date ? new Date(data.start_date) : null,
    endDate: data.end_date ? new Date(data.end_date) : null,
    applicationDeadline: data.application_deadline ? new Date(data.application_deadline) : null,
    submissionDeadline: data.submission_deadline ? new Date(data.submission_deadline) : null,
  } as any;
}

export async function getHackathonBySlug(slug: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathons")
    .select(
      `*, 
       hackathon_tracks(*), 
       hackathon_rules(*), 
       hackathon_faqs(*), 
       hackathon_judging_criteria(*)`
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const n = normalize(data) as Row;
  return {
    ...n,
    tracks: normalize(data.hackathon_tracks ?? []),
    rules: normalize(data.hackathon_rules ?? []).sort((a: Row, b: Row) => a.order - b.order),
    faqs: normalize(data.hackathon_faqs ?? []).sort((a: Row, b: Row) => a.order - b.order),
    judgingCriteria: normalize(data.hackathon_judging_criteria ?? []).sort(
      (a: Row, b: Row) => a.order - b.order
    ),
    startDate: data.start_date ? new Date(data.start_date) : null,
    endDate: data.end_date ? new Date(data.end_date) : null,
    applicationDeadline: data.application_deadline ? new Date(data.application_deadline) : null,
    submissionDeadline: data.submission_deadline ? new Date(data.submission_deadline) : null,
  } as any;
}

// ─── Tracks ───────────────────────────────────────────────────────────────────

export async function getTracks(hackathonId: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_tracks")
    .select("id, name")
    .eq("hackathon_id", hackathonId)
    .order("name");

  if (error) throw error;
  return (data ?? []) as any[];
}

// ─── Application ─────────────────────────────────────────────────────────────

export async function getUserApplication(userId: string, hackathonId: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_applications")
    .select("*")
    .eq("user_id", userId)
    .eq("hackathon_id", hackathonId)
    .maybeSingle();

  if (error) throw error;
  return data ? (normalize(data) as any) : null;
}

export async function getApplicationById(id: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_applications")
    .select(`*, hackathon_users(*)`)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const n = normalize(data) as Row;
  return n;
}

export async function getAllApplications(hackathonId: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_applications")
    .select(
      `*, hackathon_users(*, hackathon_team_members(*, hackathon_teams(*)))`
    )
    .eq("hackathon_id", hackathonId)
    .order("submitted_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data ?? []).map((app) => {
    const n = normalize(app) as Row;
    const u = (app.hackathon_users as Row) ?? {};
    return {
      ...n,
      user: {
        ...normalize(u),
        teamMemberships: normalize(u.hackathon_team_members ?? []).map((tm: Row) => ({
          ...tm,
          team: normalize((u.hackathon_team_members as Row[])
            ?.find((x: Row) => x.id === tm.id)?.hackathon_teams ?? null),
        })),
      },
    } as any;
  });
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export async function getUserTeam(userId: string, hackathonId: string) {
  const db = createAdminClient();

  const { data: memberships, error } = await db
    .from("hackathon_team_members")
    .select(
      `*, hackathon_teams(
         *, 
         hackathon_tracks(*), 
         hackathon_submissions(*),
         hackathon_team_members(
           *, 
           hackathon_users(*)
         )
       )`
    )
    .eq("user_id", userId);

  if (error) throw error;
  if (!memberships || memberships.length === 0) return null;

  const membership = memberships.find(
    (m) => (m.hackathon_teams as Row)?.hackathon_id === hackathonId
  );
  if (!membership) return null;

  const team = membership.hackathon_teams as Row;
  const n = normalize(team) as Row;

  return {
    ...n,
    track: team.hackathon_tracks ? normalize(team.hackathon_tracks) : null,
    submission: team.hackathon_submissions ? normalize(team.hackathon_submissions) : null,
    members: ((team.hackathon_team_members ?? []) as Row[]).map((m) => ({
      ...normalize(m),
      user: normalize(m.hackathon_users ?? {}),
    })),
    inviteCode: team.invite_code,
    maxSize: team.max_size,
    isLocked: team.is_locked,
    hackathonId: team.hackathon_id,
    trackId: team.track_id,
    createdAt: team.created_at,
    updatedAt: team.updated_at,
  } as any;
}

export async function getTeamByInviteCode(code: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_teams")
    .select(`*, hackathon_team_members(*, hackathon_users(*)), hackathons(*)`)
    .eq("invite_code", code)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const n = normalize(data) as Row;
  return {
    ...n,
    members: ((data.hackathon_team_members ?? []) as Row[]).map((m) => ({
      ...normalize(m),
      user: normalize(m.hackathon_users ?? {}),
    })),
    hackathon: normalize(data.hackathons ?? null),
    inviteCode: data.invite_code,
  } as any;
}

export async function getAllTeams(hackathonId: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_teams")
    .select(
      `*, hackathon_tracks(*), hackathon_submissions(*),
       hackathon_team_members(*, hackathon_users(*))`
    )
    .eq("hackathon_id", hackathonId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((team) => {
    const n = normalize(team) as Row;
    return {
      ...n,
      track: normalize(team.hackathon_tracks ?? null),
      submission: normalize(team.hackathon_submissions ?? null),
      members: ((team.hackathon_team_members ?? []) as Row[]).map((m) => ({
        ...normalize(m),
        user: normalize(m.hackathon_users ?? {}),
      })),
    } as any;
  });
}

// ─── Submission ───────────────────────────────────────────────────────────────

export async function getTeamSubmission(teamId: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_submissions")
    .select(
      `*, hackathon_teams(*, hackathon_team_members(*, hackathon_users(*)))`
    )
    .eq("team_id", teamId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const n = normalize(data) as Row;
  const t = data.hackathon_teams as Row;
  return {
    ...n,
    assets: n.assetUrls ?? [],
    team: t ? {
      ...normalize(t),
      members: ((t.hackathon_team_members ?? []) as Row[]).map((m) => ({
        ...normalize(m),
        user: normalize(m.hackathon_users ?? {}),
      })),
    } : null,
  } as any;
}

export async function getSubmissionById(id: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_submissions")
    .select(
      `*,
       hackathon_teams(
         *, hackathon_tracks(*),
         hackathon_team_members(
           *, hackathon_users(
             *, hackathon_applications(*)
           )
         )
       )`
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const n = normalize(data) as Row;
  const t = data.hackathon_teams as Row;
  return {
    ...n,
    assets: n.assetUrls ?? [],
    team: t ? {
      ...normalize(t),
      track: normalize(t.hackathon_tracks ?? null),
      members: ((t.hackathon_team_members ?? []) as Row[]).map((m) => ({
        ...normalize(m),
        user: normalize(m.hackathon_users ?? {}),
      })),
    } : null,
  } as any;
}

export async function getAllSubmissions(hackathonId: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_submissions")
    .select(
      `*, hackathon_teams(*, hackathon_tracks(*), hackathon_team_members(*, hackathon_users(*)))`
    )
    .eq("hackathon_id", hackathonId)
    .order("submitted_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data ?? []).map((sub) => {
    const n = normalize(sub) as Row;
    const t = sub.hackathon_teams as Row;
    return {
      ...n,
      assets: n.assetUrls ?? [],
      team: t ? {
        ...normalize(t),
        track: normalize(t.hackathon_tracks ?? null),
        members: ((t.hackathon_team_members ?? []) as Row[]).map((m) => ({
          ...normalize(m),
          user: normalize(m.hackathon_users ?? {}),
        })),
      } : null,
    } as any;
  });
}

// ─── Admin stats ──────────────────────────────────────────────────────────────

export async function getAdminStats(hackathonId: string) {
  const db = createAdminClient();
  const [
    { count: totalApplicants },
    { count: acceptedApplicants },
    { count: totalTeams },
    { count: totalSubmissions },
    { count: draftSubmissions },
  ] = await Promise.all([
    db.from("hackathon_applications").select("*", { count: "exact", head: true }).eq("hackathon_id", hackathonId),
    db.from("hackathon_applications").select("*", { count: "exact", head: true }).eq("hackathon_id", hackathonId).eq("status", "ACCEPTED"),
    db.from("hackathon_teams").select("*", { count: "exact", head: true }).eq("hackathon_id", hackathonId),
    db.from("hackathon_submissions").select("*", { count: "exact", head: true }).eq("hackathon_id", hackathonId).neq("status", "DRAFT"),
    db.from("hackathon_submissions").select("*", { count: "exact", head: true }).eq("hackathon_id", hackathonId).eq("status", "DRAFT"),
  ]);

  return {
    totalApplicants: totalApplicants ?? 0,
    acceptedApplicants: acceptedApplicants ?? 0,
    totalTeams: totalTeams ?? 0,
    totalSubmissions: totalSubmissions ?? 0,
    draftSubmissions: draftSubmissions ?? 0,
  } as any;
}
