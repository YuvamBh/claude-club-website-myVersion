import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

interface ParticipantInput {
  name: string;
  email: string;
  year?: string;
  major?: string;
  github?: string;
}

export async function POST(req: NextRequest) {
  // Auth check - must be admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();
  const { data: hackUser } = await db
    .from("hackathon_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!hackUser || hackUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { participants } = (await req.json()) as { participants: ParticipantInput[] };
  if (!Array.isArray(participants) || participants.length === 0) {
    return NextResponse.json({ error: "No participants provided" }, { status: 400 });
  }

  // Validate, normalize, and deduplicate by email (keep last occurrence)
  const seen = new Map<string, ParticipantInput>();
  const invalidResults: object[] = [];

  for (const p of participants) {
    const email = p.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      invalidResults.push({ email, name: p.name, status: "error", message: "Invalid email" });
    } else {
      seen.set(email, { ...p, email, name: p.name?.trim() || email.split("@")[0] || "Participant" });
    }
  }

  const valid = Array.from(seen.values());

  if (valid.length === 0) {
    return NextResponse.json({ results: invalidResults });
  }

  // Fetch which emails already exist (one query)
  const { data: existing } = await db
    .from("hackathon_users")
    .select("email")
    .in("email", valid.map((p) => p.email));

  const existingEmails = new Set((existing ?? []).map((u: any) => u.email));

  const toInsert = valid
    .filter((p) => !existingEmails.has(p.email))
    .map((p) => ({
      email: p.email,
      name: p.name,
      role: "PARTICIPANT",
      year: p.year ?? null,
      major: p.major ?? null,
      github: p.github ?? null,
      // user_id intentionally omitted - linked on first login
    }));

  const toUpdate = valid.filter((p) => existingEmails.has(p.email));

  const results: object[] = [...invalidResults];

  // Batch insert new participants
  if (toInsert.length > 0) {
    const { data: inserted, error: insertError } = await db
      .from("hackathon_users")
      .insert(toInsert)
      .select("email, name");

    if (insertError) {
      for (const p of toInsert) {
        results.push({ email: p.email, name: p.name, status: "error", message: insertError.message });
      }
    } else {
      for (const row of inserted ?? []) {
        results.push({ email: row.email, name: row.name, status: "imported" });
      }
    }
  }

  // Batch update existing participants with extra fields (chunks of 50)
  const CHUNK = 50;
  for (let i = 0; i < toUpdate.length; i += CHUNK) {
    const chunk = toUpdate.slice(i, i + CHUNK);
    await Promise.all(
      chunk.map((p) => {
        const update: Record<string, string | null> = { name: p.name };
        if (p.year !== undefined) update.year = p.year ?? null;
        if (p.major !== undefined) update.major = p.major ?? null;
        if (p.github !== undefined) update.github = p.github ?? null;
        return db.from("hackathon_users").update(update).eq("email", p.email);
      })
    );
    for (const p of chunk) {
      results.push({ email: p.email, name: p.name, status: "exists" });
    }
  }

  return NextResponse.json({ results });
}
