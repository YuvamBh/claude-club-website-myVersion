import Link from "next/link";
import { requireAuth } from "@/lib/hackathon2.0/rbac";
import {
  getActiveHackathon,
  getUserApplication,
  getUserTeam,
  getTeamSubmission,
} from "@/lib/hackathon2.0/queries";
import {
  ClipboardList,
  Users,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Trophy,
  Zap,
  Info,
} from "lucide-react";

export const metadata = { title: "Dashboard - HackASU" };

export default async function DashboardPage() {
  const user = await requireAuth();
  const hackathon = await getActiveHackathon();

  if (!hackathon) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Trophy size={40} className="text-white/20 mb-4" />
        <h2 className="text-xl font-semibold text-white/60">No active hackathon</h2>
        <p className="text-sm text-white/30 mt-1">Check back soon for the next event.</p>
      </div>
    );
  }

  const [application, team] = await Promise.all([
    getUserApplication(user.id, hackathon.id),
    getUserTeam(user.id, hackathon.id),
  ]);

  const submission = team ? await getTeamSubmission(team.id) : null;
  const now = new Date();

  const appDeadlinePassed =
    hackathon.applicationDeadline && now > hackathon.applicationDeadline;
  const subDeadlinePassed =
    hackathon.submissionDeadline && now > hackathon.submissionDeadline;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const captain = team?.members.find((m: any) => m.role === "CAPTAIN");
  const isCaptain = captain?.userId === user.id;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user.name.split(" ")[0]} 
        </h1>
        <p className="text-sm text-white/40 mt-1">{hackathon.name}</p>
      </div>

      {/* Announcements */}
      {hackathon.announcements.length > 0 && (
        <div className="mb-6 space-y-2">
          {hackathon.announcements.slice(0, 2).map((a: any) => (
            <div
              key={a.id}
              className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
                a.isPinned
                  ? "bg-[#ff9b7a]/10 border border-[#ff9b7a]/20"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              <Info size={14} className="shrink-0 mt-0.5 text-[#ff9b7a]" />
              <div>
                <span className="font-medium text-white/80">{a.title}:</span>{" "}
                <span className="text-white/50">{a.content}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatusCard
          icon={ClipboardList}
          title="Application"
          status={
            !application
              ? "not_started"
              : application.status === "SUBMITTED" || application.status === "ACCEPTED"
              ? "done"
              : application.status === "DRAFT"
              ? "draft"
              : "done"
          }
          label={
            !application
              ? "Not started"
              : application.status === "ACCEPTED"
              ? "Accepted ✓"
              : application.status === "SUBMITTED"
              ? "Submitted"
              : application.status === "DRAFT"
              ? "Draft saved"
              : application.status
          }
          href="/hackathon2.0/apply"
          cta={!application ? "Start application" : application.status === "DRAFT" ? "Complete & submit" : "View application"}
          locked={!!appDeadlinePassed && !application}
        />

        <StatusCard
          icon={Users}
          title="Team"
          status={!team ? "not_started" : "done"}
          label={!team ? "No team yet" : team.name}
          href="/hackathon2.0/team"
          cta={!team ? "Create or join team" : `${team.members.length} member${team.members.length !== 1 ? "s" : ""}`}
          locked={false}
        />

        <StatusCard
          icon={Send}
          title="Submission"
          status={
            !team
              ? "locked"
              : !submission
              ? "not_started"
              : submission.status === "SUBMITTED"
              ? "done"
              : "draft"
          }
          label={
            !team
              ? "Join a team first"
              : !submission
              ? "Not started"
              : submission.status === "SUBMITTED"
              ? "Submitted ✓"
              : "Draft saved"
          }
          href="/hackathon2.0/submit"
          cta={
            !team
              ? "Requires team"
              : !submission
              ? "Start submission"
              : submission.status === "SUBMITTED"
              ? "View submission"
              : "Continue draft"
          }
          locked={!team || (!!subDeadlinePassed && !submission)}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deadlines */}
        <Section title="Important Deadlines">
          <div className="space-y-3">
            <Deadline
              label="Application Deadline"
              date={hackathon.applicationDeadline}
              passed={!!appDeadlinePassed}
            />
            <Deadline
              label="Submission Deadline"
              date={hackathon.submissionDeadline}
              passed={!!subDeadlinePassed}
            />
            <Deadline label="Event Start" date={hackathon.startDate} passed={now > hackathon.startDate} />
            <Deadline label="Event End" date={hackathon.endDate} passed={now > hackathon.endDate} />
          </div>
        </Section>

        {/* Team preview */}
        <Section
          title="Your Team"
          action={team ? { label: "Manage", href: "/hackathon2.0/team" } : undefined}
        >
          {team ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-white">{team.name}</h3>
                {team.track && (
                  <span className="text-[10px] bg-[#ff9b7a]/20 text-[#ff9b7a] px-2 py-0.5 rounded-full font-medium">
                    {team.track.name}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {team.members.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-2.5 text-sm">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-white/60 font-medium">
                        {m.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white/70">{m.user.name}</span>
                    {m.role === "CAPTAIN" && (
                      <span className="text-[9px] bg-[#ff9b7a]/15 text-[#ff9b7a] px-1.5 py-0.5 rounded font-medium">
                        Captain
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-xs text-white/30">
                  Invite code:{" "}
                  <span className="font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded">
                    {team.inviteCode}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <Users size={28} className="text-white/20 mb-3" />
              <p className="text-sm text-white/40 mb-3">You&apos;re not on a team yet</p>
              <Link
                href="/hackathon2.0/team"
                className="text-sm bg-[#ff9b7a]/10 hover:bg-[#ff9b7a]/20 text-[#ff9b7a] px-4 py-2 rounded-lg transition-colors"
              >
                Create or join a team
              </Link>
            </div>
          )}
        </Section>

        {/* Tracks */}
        {hackathon.tracks.length > 0 && (
          <Section title="Tracks">
            <div className="space-y-2">
              {hackathon.tracks.map((t: any) => (
                <div
                  key={t.id}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors"
                >
                  <Zap size={14} className="text-[#ff9b7a] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white/80">{t.name}</p>
                    {t.description && (
                      <p className="text-xs text-white/40 mt-0.5">{t.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Next actions */}
        <Section title="What&apos;s Next">
          <div className="space-y-2">
            {!application && !appDeadlinePassed && (
              <ActionItem
                label="Complete your application"
                href="/hackathon2.0/apply"
                priority="high"
              />
            )}
            {application?.status === "DRAFT" && (
              <ActionItem
                label="Submit your application"
                href="/hackathon2.0/apply"
                priority="high"
              />
            )}
            {!team && (
              <ActionItem label="Create or join a team" href="/hackathon2.0/team" priority="medium" />
            )}
            {team && isCaptain && !submission && !subDeadlinePassed && (
              <ActionItem
                label="Start your project submission"
                href="/hackathon2.0/submit"
                priority="high"
              />
            )}
            {team && isCaptain && submission?.status === "DRAFT" && (
              <ActionItem
                label="Finalize and submit your project"
                href="/hackathon2.0/submit"
                priority="high"
              />
            )}
            {application?.status === "ACCEPTED" && team && submission?.status === "SUBMITTED" && (
              <div className="flex items-center gap-2 text-sm text-green-400 px-3 py-2 bg-green-400/10 rounded-lg">
                <CheckCircle2 size={14} />
                All done! Good luck at the hackathon.
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusCard({
  icon: Icon,
  title,
  status,
  label,
  href,
  cta,
  locked,
}: {
  icon: any;
  title: string;
  status: "not_started" | "draft" | "done" | "locked";
  label: string;
  href: string;
  cta: string;
  locked: boolean;
}) {
  const colors = {
    not_started: "text-white/40",
    draft: "text-yellow-400",
    done: "text-green-400",
    locked: "text-white/20",
  };

  const bgColors = {
    not_started: "bg-white/5",
    draft: "bg-yellow-400/10",
    done: "bg-green-400/10",
    locked: "bg-white/3",
  };

  return (
    <div className={`rounded-xl p-4 border border-white/10 ${bgColors[status]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} className={colors[status]} />
        <span className="text-xs text-white/40 uppercase tracking-wide font-medium">{title}</span>
      </div>
      <p className={`text-sm font-semibold mb-3 ${colors[status]}`}>{label}</p>
      {locked ? (
        <span className="text-[11px] text-white/20">Deadline passed</span>
      ) : (
        <Link
          href={href}
          className="flex items-center gap-1 text-[11px] text-[#ff9b7a] hover:text-[#ffb89e] transition-colors"
        >
          {cta} <ChevronRight size={11} />
        </Link>
      )}
    </div>
  );
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">{title}</h2>
        {action && (
          <Link href={action.href} className="text-xs text-[#ff9b7a] hover:text-[#ffb89e] transition-colors">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function Deadline({
  label,
  date,
  passed,
}: {
  label: string;
  date: Date | null;
  passed: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-white/50">
        <Clock size={13} className={passed ? "text-white/20" : "text-[#ff9b7a]"} />
        {label}
      </div>
      <span className={`text-xs ${passed ? "text-white/20 line-through" : "text-white/60"}`}>
        {date
          ? date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "TBD"}
      </span>
    </div>
  );
}

function ActionItem({
  label,
  href,
  priority,
}: {
  label: string;
  href: string;
  priority: "high" | "medium";
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
        priority === "high"
          ? "bg-[#ff9b7a]/10 text-[#ff9b7a] hover:bg-[#ff9b7a]/15"
          : "bg-white/5 text-white/50 hover:bg-white/8"
      }`}
    >
      <div className="flex items-center gap-2">
        <AlertCircle size={13} />
        {label}
      </div>
      <ChevronRight size={13} />
    </Link>
  );
}
