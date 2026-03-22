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

export async function getAdminAnnouncements(hackathonId: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_announcements")
    .select("id, title, content, is_pinned, published_at, created_at")
    .eq("hackathon_id", hackathonId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return normalize(data ?? []) as Array<{
    id: string;
    title: string;
    content: string;
    isPinned: boolean;
    publishedAt: string | null;
    createdAt: string;
  }>;
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
  return {
    ...n,
    user: normalize(data.hackathon_users ?? {}),
    createdAt: new Date(data.created_at),
    submittedAt: data.submitted_at ? new Date(data.submitted_at) : null,
    reviewedAt: data.reviewed_at ? new Date(data.reviewed_at) : null,
    agreedAt: data.agreed_at ? new Date(data.agreed_at) : null,
  } as any;
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
      submittedAt: app.submitted_at ? new Date(app.submitted_at) : null,
      createdAt: new Date(app.created_at),
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
       ),
       hackathon_judge_scores(*)
      `
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
    submittedAt: data.submitted_at ? new Date(data.submitted_at) : null,
    updatedAt: data.updated_at ? new Date(data.updated_at) : null,
    reviewedAt: data.reviewed_at ? new Date(data.reviewed_at) : null,
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
      submittedAt: sub.submitted_at ? new Date(sub.submitted_at) : null,
      updatedAt: sub.updated_at ? new Date(sub.updated_at) : null,
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

// ─── Participants (for admin view) ────────────────────────────────────────────

export async function getAllParticipants(hackathonId: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_users")
    .select(`*, hackathon_checkins!hackathon_checkins_user_id_fkey(*, hackathon_checkin_days(*)), hackathon_team_members(*, hackathon_teams(*))`)
    .neq("role", "ADMIN")
    .order("name");

  if (error) throw error;
  return (data ?? []).map((u) => {
    const n = normalize(u) as Row;
    return {
      ...n,
      checkins: normalize(u.hackathon_checkins ?? []).filter((c: Row) => c.hackathonId === hackathonId),
      teamMemberships: normalize(u.hackathon_team_members ?? []),
    } as any;
  });
}

// ─── Check-in ─────────────────────────────────────────────────────────────────

export async function getCheckinDays(hackathonId: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_checkin_days")
    .select("*")
    .eq("hackathon_id", hackathonId)
    .order("order");

  if (error) throw error;
  return (data ?? []).map(normalize) as any[];
}

export async function getUserCheckins(userId: string, hackathonId: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_checkins")
    .select("*, hackathon_checkin_days(*)")
    .eq("user_id", userId)
    .eq("hackathon_id", hackathonId);

  if (error) throw error;
  return (data ?? []).map((c) => ({
    ...normalize(c),
    day: normalize(c.hackathon_checkin_days),
  })) as any[];
}

export async function getUserByQrToken(qrToken: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_users")
    .select("*")
    .eq("qr_token", qrToken)
    .maybeSingle();

  if (error) throw error;
  return data ? (normalize(data) as any) : null;
}

// ─── Judging ──────────────────────────────────────────────────────────────────

export async function getJudgeScoresForSubmission(submissionId: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_judge_scores")
    .select("*, hackathon_judging_criteria(*), hackathon_users(name)")
    .eq("submission_id", submissionId);

  if (error) throw error;
  return (data ?? []).map((s) => ({
    ...normalize(s),
    criterion: normalize(s.hackathon_judging_criteria),
    judge: normalize(s.hackathon_users),
  })) as any[];
}

export async function getAllSubmissionsForJudging(hackathonId: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hackathon_submissions")
    .select(`
      id, project_name, tagline, status, track_id, submitted_at, admin_notes, bonus_points,
      hackathon_teams(name, hackathon_tracks(name), hackathon_team_members(hackathon_users(name))),
      hackathon_judge_scores(judge_id, score, criterion_id)
    `)
    .eq("hackathon_id", hackathonId)
    .neq("status", "DRAFT")
    .order("submitted_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  
  const submissions = (data ?? []).map((sub) => {
    const n = normalize(sub) as Row;
    const t = sub.hackathon_teams as Row;
    const scores = (sub.hackathon_judge_scores ?? []) as Row[];
    
    // Group scores by judge to get total score per judge
    const scoresByJudge: Record<string, number> = {};
    scores.forEach((s: any) => {
      scoresByJudge[s.judge_id] = (scoresByJudge[s.judge_id] || 0) + (s.score ?? 0);
    });
    
    const judgeTotals = Object.values(scoresByJudge);
    const avgTotalScore = judgeTotals.length > 0
      ? judgeTotals.reduce((a, b) => a + b, 0) / judgeTotals.length
      : 0;

    // Check for manual override in notes
    let finalScore = avgTotalScore;
    const overrideMatch = sub.admin_notes?.match(/\[Manual Override Final Score: (\d+)\]/);
    if (overrideMatch) {
      finalScore = parseInt(overrideMatch[1]);
    }

    // Add admin bonus points
    finalScore += (sub.bonus_points ?? 0);

    return {
      ...n,
      team: t ? { ...normalize(t), track: normalize(t.hackathon_tracks ?? null) } : null,
      scores: normalize(scores),
      avgScore: Math.round(avgTotalScore * 10) / 10,
      finalScore,
      judgeCount: judgeTotals.length,
    } as any;
  });

  // Sort by finalScore descending to determine rank
  const ranked = [...submissions].sort((a, b) => b.finalScore - a.finalScore);
  
  return submissions.map(sub => {
    const rank = ranked.findIndex(r => r.id === sub.id) + 1;
    const total = ranked.length;
    const percentile = total > 1 ? Math.round((1 - (rank - 1) / (total - 1)) * 100) : 100;
    
    return {
      ...sub,
      rank,
      totalCount: total,
      percentile,
    };
  });
}

export async function getSubmissionRank(submissionId: string, hackathonId: string | undefined) {
  if (!hackathonId) return null;
  const submissions = await getAllSubmissionsForJudging(hackathonId);
  const sub = submissions.find((s) => s.id === submissionId);
  if (!sub) return null;
  
  return {
    rank: sub.rank,
    total: sub.totalCount,
    percentile: sub.percentile,
    finalScore: sub.finalScore,
    judgeCount: sub.judgeCount,
  };
}

export async function getAdminCheckinStats(hackathonId: string) {
  const db = createAdminClient();
  const days = await getCheckinDays(hackathonId);
  const stats = await Promise.all(
    days.map(async (day: any) => {
      const { count } = await db
        .from("hackathon_checkins")
        .select("*", { count: "exact", head: true })
        .eq("checkin_day_id", day.id);
      return { ...day, checkedInCount: count ?? 0 };
    })
  );
  return stats as any[];
}
