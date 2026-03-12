"use client";

import { signOut } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/hackathon2.0");
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
    >
      <LogOut size={13} />
      Sign out
    </button>
  );
}
