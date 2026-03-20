import { getHackathonUser } from "@/lib/hackathon2.0/rbac";
import { getActiveHackathon, getCheckinDays, getUserCheckins, getUserTeam } from "@/lib/hackathon2.0/queries";
import { CheckInClient } from "./CheckInClient";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, Pin, Users, Send, ChevronRight, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Dashboard – HackASU" };

export default async function CheckInPage() {
  const user = await getHackathonUser();
  if (!user) redirect("/hackathon2.0/signin");

  if (user.role === "ADMIN" || user.role === "ORGANIZER") {
    redirect("/hackathon2.0/admin");
  }

  const hackathon = await getActiveHackathon();
  if (!hackathon) {
    return (
      <div className="py-20 text-center text-white/30">
        No active hackathon.
      </div>
    );
  }

  const [days, checkins, team] = await Promise.all([
    getCheckinDays(hackathon.id),
    getUserCheckins(user.id, hackathon.id),
    getUserTeam(user.id, hackathon.id),
  ]);

  const announcements = (hackathon.announcements ?? []) as any[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome, {user.name.split(" ")[0]}!</h1>
        <p className="text-xs sm:text-sm text-white/40 mt-1">{hackathon.name}</p>
      </div>

      <div className="max-w-lg mx-auto space-y-4">

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="space-y-2">
            {announcements.map((a: any) => (
              <div
                key={a.id}
                className={`rounded-2xl border p-4 ${
                  a.isPinned
                    ? "border-[#ff9b7a]/30 bg-[#ff9b7a]/8"
                    : "border-white/10 bg-[#1a1a1a]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {a.isPinned ? (
                      <Pin size={13} className="text-[#ff9b7a]" />
                    ) : (
                      <Bell size={13} className="text-white/30" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${a.isPinned ? "text-[#ff9b7a]" : "text-white/80"}`}>
                      {a.title}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5 whitespace-pre-wrap">{a.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Check-in section */}
        <CheckInClient
          userId={user.id}
          qrToken={user.qrToken ?? user.id}
          userName={user.name}
          hackathonId={hackathon.id}
          days={days}
          checkins={checkins}
        />

        {/* Team card */}
        <Link
          href="/hackathon2.0/team"
          className="block rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 hover:border-white/20 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
                <Users size={16} className="text-white/40 group-hover:text-[#ff9b7a] transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">Team</p>
                {team ? (
                  <p className="text-xs text-white/40 mt-0.5">
                    {team.name} · {(team.members ?? []).length} member{(team.members ?? []).length !== 1 ? "s" : ""}
                    {team.track ? ` · ${team.track.name}` : ""}
                  </p>
                ) : (
                  <p className="text-xs text-white/30 mt-0.5">No team yet — create or join one</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {team && (
                <span className="text-[10px] bg-green-400/10 text-green-400 px-2 py-0.5 rounded-full font-medium">
                  Joined
                </span>
              )}
              <ChevronRight size={14} className="text-white/20 group-hover:text-[#ff9b7a] transition-colors" />
            </div>
          </div>
        </Link>

        {/* Submission card */}
        <Link
          href="/hackathon2.0/submit"
          className="block rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 hover:border-white/20 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
                <Send size={16} className="text-white/40 group-hover:text-[#ff9b7a] transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">Submission</p>
                {team?.submission ? (
                  <p className="text-xs text-white/40 mt-0.5">
                    {team.submission.projectName ?? "Draft"} · {team.submission.status ?? "DRAFT"}
                  </p>
                ) : (
                  <p className="text-xs text-white/30 mt-0.5">
                    {team ? "No submission yet — submit your project" : "Join a team first"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {team?.submission?.status === "SUBMITTED" && (
                <span className="text-[10px] bg-green-400/10 text-green-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle2 size={10} /> Submitted
                </span>
              )}
              <ChevronRight size={14} className="text-white/20 group-hover:text-[#ff9b7a] transition-colors" />
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
