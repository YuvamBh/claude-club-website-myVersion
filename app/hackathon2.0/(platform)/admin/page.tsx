import { requireAdmin } from "@/lib/hackathon2.0/rbac";
import { getAdminStats, getActiveHackathon } from "@/lib/hackathon2.0/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Send, ClipboardList, Clock, TrendingUp } from "lucide-react";

export const metadata = { title: "Admin Overview - HackASU" };

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

  const stats = await getAdminStats(hackathon.id);
  const db = createAdminClient();

  // Recent applicants
  const { data: recentApplicationsData } = await db
    .from("hackathon_applications")
    .select("id, status, created_at, hackathon_users(name, email)")
    .eq("hackathon_id", hackathon.id)
    .order("created_at", { ascending: false })
    .limit(5);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentApplications: any[] = recentApplicationsData ?? [];

  // Recent submissions
  const { data: recentSubmissionsData } = await db
    .from("hackathon_submissions")
    .select("id, status, project_name, updated_at, hackathon_teams(name)")
    .eq("hackathon_id", hackathon.id)
    .order("updated_at", { ascending: false })
    .limit(5);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentSubmissions: any[] = recentSubmissionsData ?? [];

  const now = new Date();
  const appDaysLeft = hackathon.application_deadline
    ? Math.ceil((new Date(hackathon.application_deadline).getTime() - now.getTime()) / 86400000)
    : null;
  const subDaysLeft = hackathon.submission_deadline
    ? Math.ceil((new Date(hackathon.submission_deadline).getTime() - now.getTime()) / 86400000)
    : null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-sm text-white/40 mt-1">{hackathon.name}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={ClipboardList}
          label="Total Applicants"
          value={stats.totalApplicants}
          sub={`${stats.acceptedApplicants} accepted`}
        />
        <StatCard
          icon={Users}
          label="Teams"
          value={stats.totalTeams}
          sub="registered"
        />
        <StatCard
          icon={Send}
          label="Submitted"
          value={stats.totalSubmissions}
          sub={`${stats.draftSubmissions} drafts`}
        />
        <StatCard
          icon={TrendingUp}
          label="Submission Rate"
          value={
            stats.totalTeams > 0
              ? `${Math.round((stats.totalSubmissions / stats.totalTeams) * 100)}%`
              : "0%"
          }
          sub="teams submitted"
        />
      </div>

      {/* Deadline status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <DeadlineCard
          label="Application Deadline"
          date={hackathon.application_deadline ? new Date(hackathon.application_deadline) : null}
          daysLeft={appDaysLeft}
        />
        <DeadlineCard
          label="Submission Deadline"
          date={hackathon.submission_deadline ? new Date(hackathon.submission_deadline) : null}
          daysLeft={subDaysLeft}
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent applicants */}
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
              Recent Applicants
            </h2>
            <a
              href="/hackathon2.0/admin/applicants"
              className="text-xs text-[#ff9b7a] hover:text-[#ffb89e]"
            >
              View all →
            </a>
          </div>
          <div className="space-y-2">
            {recentApplications.length === 0 ? (
              <p className="text-sm text-white/30">No applications yet.</p>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              recentApplications.map((app: any) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div>
                    <p className="text-sm text-white/70">{app.hackathon_users?.name}</p>
                    <p className="text-xs text-white/30">{app.hackathon_users?.email}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent submissions */}
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
              Recent Submissions
            </h2>
            <a
              href="/hackathon2.0/admin/submissions"
              className="text-xs text-[#ff9b7a] hover:text-[#ffb89e]"
            >
              View all →
            </a>
          </div>
          <div className="space-y-2">
            {recentSubmissions.length === 0 ? (
              <p className="text-sm text-white/30">No submissions yet.</p>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              recentSubmissions.map((sub: any) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div>
                    <p className="text-sm text-white/70">
                      {sub.project_name ?? "Untitled"}
                    </p>
                    <p className="text-xs text-white/30">{sub.hackathon_teams?.name}</p>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  value: number | string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-[#ff9b7a]" />
        <span className="text-xs text-white/40">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/30 mt-0.5">{sub}</p>
    </div>
  );
}

function DeadlineCard({
  label,
  date,
  daysLeft,
}: {
  label: string;
  date: Date | null;
  daysLeft: number | null;
}) {
  const isOver = daysLeft !== null && daysLeft <= 0;
  const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;

  return (
    <div
      className={`rounded-xl border p-4 flex items-center gap-3 ${
        isOver
          ? "border-white/5 bg-white/3"
          : isUrgent
          ? "border-red-500/20 bg-red-500/5"
          : "border-white/10 bg-[#1a1a1a]"
      }`}
    >
      <Clock
        size={18}
        className={isOver ? "text-white/20" : isUrgent ? "text-red-400" : "text-[#ff9b7a]"}
      />
      <div>
        <p className="text-sm text-white/60">{label}</p>
        <p className={`text-xs mt-0.5 ${isOver ? "text-white/30" : isUrgent ? "text-red-400" : "text-white/40"}`}>
          {date
            ? isOver
              ? `Closed ${Math.abs(daysLeft!)} days ago`
              : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining • ${date.toLocaleDateString()}`
            : "Not set"}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-white/5 text-white/40",
    SUBMITTED: "bg-blue-500/10 text-blue-400",
    ACCEPTED: "bg-green-500/10 text-green-400",
    REJECTED: "bg-red-500/10 text-red-400",
    WAITLISTED: "bg-yellow-500/10 text-yellow-400",
    UNDER_REVIEW: "bg-purple-500/10 text-purple-400",
    SHORTLISTED: "bg-[#ff9b7a]/10 text-[#ff9b7a]",
    WINNER: "bg-yellow-400/20 text-yellow-300",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${map[status] ?? "bg-white/5 text-white/40"}`}>
      {status}
    </span>
  );
}
