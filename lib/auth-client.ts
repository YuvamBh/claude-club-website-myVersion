"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

// ─── Auth actions ─────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

// ─── useSession hook (Better Auth compatible shim) ────────────────────────────

type SessionData = {
  user: { email: string | undefined; name: string | undefined };
} | null;

export function useSession(): { data: SessionData; isPending: boolean } {
  const [data, setData] = useState<SessionData>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setData(sessionToData(session));
      setIsPending(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setData(sessionToData(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  return { data, isPending };
}

function sessionToData(session: Session | null): SessionData {
  if (!session) return null;
  return {
    user: {
      email: session.user.email,
      name:
        session.user.user_metadata?.full_name ??
        session.user.user_metadata?.name,
    },
  };
}
