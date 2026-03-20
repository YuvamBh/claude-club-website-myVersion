/**
 * Role-Based Access Control for the HackASU platform.
 *
 * Design: Supabase handles authentication (who you are).
 *         This module handles authorization (what you can do).
 *
 * A hackathon_users row is created on first platform access, keyed to the
 * Supabase auth user.id. Role defaults to PARTICIPANT; set ADMIN manually in DB.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Types ───────────────────────────────────────────────────────────────────

export type HackathonRole = "PARTICIPANT" | "ADMIN" | "JUDGE" | "ORGANIZER" | "MENTOR";

export interface HackathonUser {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: HackathonRole;
  qrToken?: string;
  created_at: string;
  updated_at: string;
}

// ─── Session helpers ─────────────────────────────────────────────────────────

/**
 * Returns the HackathonUser for the current Supabase session.
 * 
 * On first login:
 *  1. Checks if a pre-seeded row exists for this email (from Google Sheet import).
 *     If yes → links the auth user_id to it (so pre-registered users don't start fresh).
 *  2. If no pre-seeded row → creates a new row via upsert.
 * 
 * Returns null when not authenticated.
 */
export async function getHackathonUser(): Promise<HackathonUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { id: userId, email, user_metadata } = user;
  const name =
    user_metadata?.full_name ??
    user_metadata?.name ??
    email?.split("@")[0] ??
    "Anonymous";

  const admin = createAdminClient();

  // Look up all rows for this email (handles duplicates from prior auth upserts)
  const { data: rows } = await admin
    .from("hackathon_users")
    .select()
    .eq("email", email ?? "");

  if (!rows || rows.length === 0) {
    // Not pre-registered - platform access denied
    return null;
  }

  // Find a pre-seeded row (user_id is null) - this is the canonical row
  const preSeeded = rows.find((r) => r.user_id === null);
  if (preSeeded) {
    // Delete any orphan rows created by a prior auth upsert
    const orphans = rows.filter((r) => r.id !== preSeeded.id);
    if (orphans.length > 0) {
      await admin
        .from("hackathon_users")
        .delete()
        .in("id", orphans.map((r) => r.id));
    }
    // Link the auth user_id to the pre-seeded row
    const { data: linked } = await admin
      .from("hackathon_users")
      .update({ user_id: userId, name })
      .eq("id", preSeeded.id)
      .select()
      .single();
    return (linked ?? preSeeded) as HackathonUser;
  }

  // All rows already have user_ids - find the one matching this auth user
  const matched = rows.find((r) => r.user_id === userId);
  return (matched ?? rows[0]) as HackathonUser;
}

// ─── Guards ──────────────────────────────────────────────────────────────────

/**
 * Server-side auth guard for any platform page.
 * Redirects to /hackathon/signin if not authenticated.
 */
export async function requireAuth(): Promise<HackathonUser> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/hackathon2.0/signin");

  const hackUser = await getHackathonUser();
  if (!hackUser) redirect("/hackathon2.0/not-registered");
  return hackUser;
}

/**
 * Server-side guard that requires ADMIN role.
 * Redirects to /hackathon/dashboard if authenticated but not admin.
 */
export async function requireAdmin(): Promise<HackathonUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") redirect("/hackathon2.0/dashboard");
  return user;
}

// ─── Permission helpers ───────────────────────────────────────────────────────

export function canManageTeam(user: HackathonUser, teamCaptainUserId: string): boolean {
  return user.id === teamCaptainUserId || user.role === "ADMIN";
}
