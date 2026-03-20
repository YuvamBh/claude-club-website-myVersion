import { Trophy, UserX } from "lucide-react";
import { SignOutToSignIn } from "./SignOutToSignIn";

export const metadata = { title: "Not Registered – HackASU" };

export default function NotRegisteredPage() {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Trophy size={24} className="text-[#ff9b7a]" />
          <span className="font-bold text-[#ff9b7a] text-lg tracking-wide">HackASU</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-yellow-400/10 flex items-center justify-center">
              <UserX size={22} className="text-yellow-400" />
            </div>
          </div>

          <h1 className="text-xl font-bold text-white mb-2">Not registered</h1>
          <p className="text-sm text-white/50 mb-2">
            Your email is not on the participant list. Please find an organizer - show them this screen and they will add you.
          </p>
          <p className="text-xs text-white/30 mb-6">
            Make sure you are using your <span className="text-white/50">@asu.edu</span> email.
          </p>

          <SignOutToSignIn />
        </div>
      </div>
    </div>
  );
}
