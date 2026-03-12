"use client";

import { useState, useEffect, Suspense } from "react";
import { signInWithGoogle } from "@/lib/auth-client";
import { Trophy, AlertCircle, ExternalLink, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

function SignInContent() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  async function handleSignIn() {
    setLoading(true);
    await signInWithGoogle();
    // signInWithGoogle redirects, so we stay in loading state
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-4 relative">
      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Trophy size={24} className="text-[#ff9b7a]" />
          <span className="font-bold text-[#ff9b7a] text-lg tracking-wide">HackASU</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-8 text-center">
          <h1 className="text-xl font-bold text-white mb-2">Sign in to continue</h1>
          <p className="text-sm text-white/40 mb-6">
            Use your <span className="text-white/60">@asu.edu</span> Google account to access the
            hackathon platform.
          </p>

          {errorParam === "domain" && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start text-left gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">
                Access restricted. You must use an <strong>@asu.edu</strong> email address to participate in this hackathon.
              </p>
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-white/90 text-black font-medium text-sm py-2.5 px-4 rounded-lg transition-colors disabled:opacity-60"
          >
            {/* Google icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            {loading ? "Signing in…" : "Sign in with Google"}
          </button>

          <p className="text-xs text-white/20 mt-4">
            Only @asu.edu accounts are permitted.
          </p>
        </div>

        {/* Not a participant section */}
        <div className="mt-8 rounded-2xl border border-white/5 bg-[#1a1a1a]/50 p-6">
          <h2 className="text-sm font-medium text-white/80 mb-4 text-center">
            Not an ASU student?
          </h2>
          <div className="space-y-3">
             <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ff9b7a]/20 flex items-center justify-center text-[#ff9b7a]">
                    <Trophy size={14} />
                  </div>
                  <span className="text-sm text-white/90 font-medium tracking-wide">Become a Sponsor</span>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
             </a>
             <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ff9b7a]/20 flex items-center justify-center text-[#ff9b7a]">
                    <ExternalLink size={14} />
                  </div>
                  <span className="text-sm text-white/90 font-medium tracking-wide">Join as a Mentor/Judge</span>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
             </a>
          </div>
        </div>

        <p className="text-center mt-6">
          <a
            href="/hackathon2.0"
            className="text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            ← Back to hackathon info
          </a>
        </p>
      </div>
    </div>
  );
}

export default function HackathonSignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4">
          <div className="text-white/50 text-sm">Loading...</div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
