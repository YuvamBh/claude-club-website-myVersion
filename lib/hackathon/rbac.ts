/**
 * Role-Based Access Control for the HackASU platform.
 *
 * Design: Better Auth handles authentication (who you are).
 *         This module handles authorization (what you can do).
 *
 * A HackathonUser row is created on first platform access, keyed to the
 * Better Auth user.id.  Role defaults to PARTICIPANT; set ADMIN manually in DB
 * or via the seed script.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { HackathonUser } from "@prisma/client";

// ─── Session helpers ─────────────────────────────────────────────────────────

/** Returns the raw Better Auth session, or null. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Returns the HackathonUser for the current Better Auth session.
 * Creates the row on first access (upsert pattern).
 * Returns null when not authenticated.
 */
export async function getHackathonUser(): Promise<HackathonUser | null> {
  const session = await getSession();
  if (!session?.user) return null;

  const { id: userId, email, name } = session.user;

  return prisma.hackathonUser.upsert({
    where: { userId },
    create: { userId, email: email ?? "", name: name ?? "Anonymous" },
    update: { email: email ?? "", name: name ?? "Anonymous" },
  });
}

// ─── Guards ──────────────────────────────────────────────────────────────────

/**
 * Server-side auth guard for any platform page.
 * Redirects to /api/auth/signin if not authenticated.
 */
export async function requireAuth(): Promise<HackathonUser> {
  const user = await getHackathonUser();
  if (!user) redirect("/api/auth/signin");
  return user;
}

/**
 * Server-side guard that requires ADMIN role.
 * Redirects to /hackathon/dashboard if authenticated but not admin.
 */
export async function requireAdmin(): Promise<HackathonUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") redirect("/hackathon/dashboard");
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
