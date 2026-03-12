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
  created_at: string;
  updated_at: string;
}

// ─── Session helpers ─────────────────────────────────────────────────────────

/**
 * Returns the HackathonUser for the current Supabase session.
 * Creates the row on first access (upsert pattern).
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
  const { data, error } = await admin
    .from("hackathon_users")
    .upsert(
      { user_id: userId, email: email ?? "", name },
      { onConflict: "user_id", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) {
    // If it fails with concurrent unique constraint violation on email (23505),
    // it means a concurrent request already created the row. Fetch it.
    if (error.code === "23505") {
      const { data: existingData } = await admin
        .from("hackathon_users")
        .select()
        .eq("user_id", userId)
        .single();
      
      if (existingData) return existingData as HackathonUser;
    }
    console.error("getHackathonUser upsert error:", error);
    return null;
  }

  return data as HackathonUser;
}

// ─── Guards ──────────────────────────────────────────────────────────────────

/**
 * Server-side auth guard for any platform page.
 * Redirects to /hackathon/signin if not authenticated.
 */
export async function requireAuth(): Promise<HackathonUser> {
  const user = await getHackathonUser();
  if (!user) redirect("/hackathon2.0/signin");
  return user;
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

// ─── Permission checks (use in server actions) ────────────────────────────────

export function isAdmin(user: HackathonUser): boolean {
  return user.role === "ADMIN";
}

export function canEditApplication(
  user: HackathonUser,
  applicationUserId: string,
  deadline: Date | null
): boolean {
  if (user.role === "ADMIN") return true;
  if (user.id !== applicationUserId) return false;
  if (deadline && new Date() > deadline) return false;
  return true;
}

export function canEditSubmission(
  user: HackathonUser,
  teamCaptainUserId: string,
  deadline: Date | null
): boolean {
  if (user.role === "ADMIN") return true;
  if (user.id !== teamCaptainUserId) return false;
  if (deadline && new Date() > deadline) return false;
  return true;
}

export function canManageTeam(
  user: HackathonUser,
  captainUserId: string
): boolean {
  if (user.role === "ADMIN") return true;
  return user.id === captainUserId;
}
