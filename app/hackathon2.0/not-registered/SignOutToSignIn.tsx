"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutToSignIn() {
  const router = useRouter();

  async function handle() {
    await signOut();
    router.push("/hackathon2.0/signin");
  }

  return (
    <button
      onClick={handle}
      className="block w-full text-center text-sm text-white/40 hover:text-white/70 transition-colors py-2 rounded-lg border border-white/10 hover:border-white/20"
    >
      Back to login page
    </button>
  );
}
