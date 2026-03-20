import { requireAdmin } from "@/lib/hackathon2.0/rbac";
import { getActiveHackathon, getAdminCheckinStats, getAllParticipants } from "@/lib/hackathon2.0/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Send, QrCode, Star, CheckCircle2, Clock, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Overview – HackASU" };

export default async function AdminPage() {
  await requireAdmin();
  const hackathon = await getActiveHackathon();

  if (!hackathon) {
    return (
      <div className="py-24 text-center">
        <p className="text-white/40">No active hackathon found. Create one in the DB first.</p>
      </div>
    );
  }

  const db = createAdminClient();
  const [
    checkinStats,
    { count: totalParticipants },
    { count: totalTeams },
    { count: totalSubmissions },
    { count: submittedCount },
    { data: recentSubmissionsData },
    { data: recentCheckins },
  ] = await Promise.all([
    getAdminCheckinStats(hackathon.id),
    db.from("hackathon_users").select("*", { count: "exact", head: true }).not("role", "eq", "ADMIN"),
    db.from("hackathon_teams").select("*", { count: "exact", head: true }).eq("hackathon_id", hackathon.id),
    db.from("hackathon_submissions").select("*", { count: "exact", head: true }).eq("hackathon_id", hackathon.id),
    db.from("hackathon_submissions").select("*", { count: "exact", head: true }).eq("hackathon_id", hackathon.id).eq("status", "SUBMITTED"),
    db.from("hackathon_submissions")
      .select("id, project_name, status, updated_at, hackathon_teams(name)")
      .eq("hackathon_id", hackathon.id)
      .order("updated_at", { ascending: false })
      .limit(5),
    db.from("hackathon_checkins")
      .select("checked_in_at, method, hackathon_users(name), hackathon_checkin_days(label)")
      .eq("hackathon_id", hackathon.id)
      .order("checked_in_at", { ascending: false })
      .limit(6),
  ]);

  const submissions = recentSubmissionsData ?? [];
  const latestCheckins = recentCheckins ?? [];
  const today = new Date().toISOString().split("T")[0];
  const todayCheckin = checkinStats.find((d: any) => d.date === today);
  const subRate = (totalTeams ?? 0) > 0 ? Math.round(((submittedCount ?? 0) / (totalTeams ?? 1)) * 100) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Operations Overview</h1>
        <p className="text-xs text-white/30 mt-1">{hackathon.name} · Today is Day {checkinStats.findIndex((d: any) => d.date === today) + 1 || "?"}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <QuickAction href="/hackathon2.0/admin/scanner" icon={QrCode} label="QR Scanner" description="Check in participants" accent />
        <QuickAction href="/hackathon2.0/admin/applicants" icon={Users} label="Participants" description={`${totalParticipants ?? 0} registered`} />
        <QuickAction href="/hackathon2.0/admin/submissions" icon={Send} label="Submissions" description={`${submittedCount ?? 0} submitted`} />
        <QuickAction href="/hackathon2.0/admin/judging" icon={Star} label="Judging" description="Score projects" />
      </div>

      {/* Check-in stats - the #1 priority during event */}
      <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide">Attendance</h2>
          <Link href="/hackathon2.0/admin/scanner" className="text-xs text-[#ff9b7a] hover:text-[#ffb89e] flex items-center gap-1">
            Open scanner <ChevronRight size={11} />
          </Link>
        </div>
        {checkinStats.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-white/30">No check-in days configured yet.</p>
            <p className="text-xs text-white/20 mt-1">Run the SQL seed to add Day 1, 2, 3</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {checkinStats.map((day: any) => {
              const isToday = day.date === today;
              const pct = (totalParticipants ?? 0) > 0 ? Math.round((day.checkedInCount / (totalParticipants ?? 1)) * 100) : 0;
              return (
                <div key={day.id} className={`rounded-lg p-4 border ${isToday ? "border-[#ff9b7a]/30 bg-[#ff9b7a]/8" : "border-white/8 bg-white/3"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-xs font-medium ${isToday ? "text-[#ff9b7a]" : "text-white/40"}`}>{day.label}</p>
                    {isToday && <span className="text-[9px] bg-[#ff9b7a]/20 text-[#ff9b7a] px-1.5 py-0.5 rounded font-medium">Today</span>}
                  </div>
                  <p className={`text-2xl font-bold ${isToday ? "text-white" : "text-white/50"}`}>{day.checkedInCount}</p>
                  <p className={`text-xs mt-0.5 ${isToday ? "text-white/40" : "text-white/20"}`}>{pct}% of {totalParticipants ?? 0}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users}         label="Participants" value={totalParticipants ?? 0} sub="registered" />
        <StatCard icon={Users}         label="Teams"        value={totalTeams ?? 0}        sub="formed" />
        <StatCard icon={Send}          label="Submitted"    value={submittedCount ?? 0}     sub={`of ${totalSubmissions ?? 0} total`} />
        <StatCard icon={Zap}           label="Submit Rate"  value={`${subRate}%`}           sub="teams submitted" />
      </div>

      {/* Bottom two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent check-ins */}
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">Recent Check-ins</h2>
          {latestCheckins.length === 0 ? (
            <p className="text-sm text-white/30">No check-ins yet.</p>
          ) : (
            <div className="space-y-2">
              {latestCheckins.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-green-400 shrink-0" />
                    <span className="text-sm text-white/70">{c.hackathon_users?.name ?? "Unknown"}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/30">{c.hackathon_checkin_days?.label}</p>
                    <p className="text-[10px] text-white/20">{c.method}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent submissions */}
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide">Recent Submissions</h2>
            <Link href="/hackathon2.0/admin/submissions" className="text-xs text-[#ff9b7a] hover:text-[#ffb89e]">View all →</Link>
          </div>
          {submissions.length === 0 ? (
            <p className="text-sm text-white/30">No submissions yet.</p>
          ) : (
            <div className="space-y-2">
              {submissions.map((sub: any) => (
                <div key={sub.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-white/70">{sub.project_name ?? "Untitled"}</p>
                    <p className="text-xs text-white/30">{sub.hackathon_teams?.name}</p>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Components ───────────────────────────────────────────────────────────────

function QuickAction({ href, icon: Icon, label, description, accent }: { href: string; icon: any; label: string; description: string; accent?: boolean }) {
  return (
    <Link href={href} className={`rounded-xl border p-4 hover:bg-white/5 transition-colors group ${accent ? "border-[#ff9b7a]/25 bg-[#ff9b7a]/8" : "border-white/10 bg-[#1a1a1a]"}`}>
      <Icon size={18} className={`mb-2 ${accent ? "text-[#ff9b7a]" : "text-white/40 group-hover:text-[#ff9b7a] transition-colors"}`} />
      <p className={`text-sm font-semibold ${accent ? "text-[#ff9b7a]" : "text-white/70"}`}>{label}</p>
      <p className="text-xs text-white/30 mt-0.5">{description}</p>
    </Link>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: number | string; sub: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} className="text-white/30" />
        <span className="text-xs text-white/30">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/25 mt-0.5">{sub}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-white/5 text-white/30",
    SUBMITTED: "bg-green-500/10 text-green-400",
    UNDER_REVIEW: "bg-purple-500/10 text-purple-400",
    SHORTLISTED: "bg-[#ff9b7a]/10 text-[#ff9b7a]",
    WINNER: "bg-yellow-400/20 text-yellow-300",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${map[status] ?? "bg-white/5 text-white/30"}`}>
      {status}
    </span>
  );
}
