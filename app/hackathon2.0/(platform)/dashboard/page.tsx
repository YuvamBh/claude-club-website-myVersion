import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/hackathon2.0/rbac";
import {
  getActiveHackathon,
  getUserTeam,
  getTeamSubmission,
  getCheckinDays,
  getUserCheckins,
} from "@/lib/hackathon2.0/queries";
import {
  Users,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Trophy,
  Zap,
  Info,
  MapPin,
  Calendar,
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

  const [team, checkinDays, checkins] = await Promise.all([
    getUserTeam(user.id, hackathon.id),
    getCheckinDays(hackathon.id),
    getUserCheckins(user.id, hackathon.id),
  ]);

  const submission = team ? await getTeamSubmission(team.id) : null;
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const subDeadlinePassed = hackathon.submissionDeadline && now > hackathon.submissionDeadline;
  const captain = team?.members.find((m: any) => m.role === "CAPTAIN");
  const isCaptain = captain?.userId === user.id;

  // Check-in stats
  const checkedInDayIds = new Set(checkins.map((c: any) => c.checkinDayId));
  const requiredDays = checkinDays.filter((d: any) => d.required);
  const checkedRequiredCount = requiredDays.filter((d: any) => checkedInDayIds.has(d.id)).length;
  const todayDay = checkinDays.find((d: any) => d.date === today);
  const checkedInToday = todayDay ? checkedInDayIds.has(todayDay.id) : false;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Welcome, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-xs sm:text-sm text-white/40 mt-1">{hackathon.name}</p>
      </div>

      {/* Announcements */}
      {hackathon.announcements?.length > 0 && (
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

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Check-in card */}
        <StatusCard
          icon={MapPin}
          title="Attendance"
          status={
            !checkinDays.length ? "locked"
            : checkedInToday ? "done"
            : "not_started"
          }
          label={
            !checkinDays.length ? "Not configured"
            : checkedInToday ? `Day checked in ✓`
            : todayDay ? "Check in today"
            : "No event today"
          }
          sublabel={`${checkedRequiredCount}/${requiredDays.length} required days`}
          href="/hackathon2.0/checkin"
          cta={checkedInToday ? "View attendance" : "Check in now"}
          locked={!checkinDays.length}
        />

        {/* Team card */}
        <StatusCard
          icon={Users}
          title="Team"
          status={!team ? "not_started" : "done"}
          label={!team ? "No team yet" : team.name}
          sublabel={team ? `${team.members.length} member${team.members.length !== 1 ? "s" : ""}` : undefined}
          href="/hackathon2.0/team"
          cta={!team ? "Create or join team" : "Manage team"}
          locked={false}
        />

        {/* Submission card */}
        <StatusCard
          icon={Send}
          title="Submission"
          status={
            !team ? "locked"
            : !submission ? "not_started"
            : submission.status === "SUBMITTED" ? "done"
            : "draft"
          }
          label={
            !team ? "Join a team first"
            : !submission ? "Not started"
            : submission.status === "SUBMITTED" ? "Submitted ✓"
            : "Draft saved"
          }
          sublabel={submission?.projectName ?? undefined}
          href="/hackathon2.0/submit"
          cta={
            !team ? "Requires team"
            : !submission ? "Start submission"
            : submission.status === "SUBMITTED" ? "View submission"
            : "Continue draft"
          }
          locked={!team || (!!subDeadlinePassed && !submission)}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in calendar */}
        {checkinDays.length > 0 && (
          <Section
            title="Check-in Calendar"
            action={{ label: "Check In", href: "/hackathon2.0/checkin" }}
          >
            <div className="space-y-2">
              {checkinDays.map((day: any) => {
                const done = checkedInDayIds.has(day.id);
                const isToday = day.date === today;
                return (
                  <div
                    key={day.id}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm border ${
                      done
                        ? "border-green-400/20 bg-green-400/10"
                        : isToday
                        ? "border-[#ff9b7a]/20 bg-[#ff9b7a]/10"
                        : "border-white/10 bg-white/3"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className={done ? "text-green-400" : isToday ? "text-[#ff9b7a]" : "text-white/30"} />
                      <span className={done ? "text-green-400" : isToday ? "text-[#ff9b7a]" : "text-white/50"}>
                        {day.label}
                      </span>
                    </div>
                    {done ? (
                      <CheckCircle2 size={14} className="text-green-400" />
                    ) : isToday ? (
                      <Link href="/hackathon2.0/checkin" className="text-[10px] text-[#ff9b7a] hover:underline">
                        Check in →
                      </Link>
                    ) : (
                      <span className="text-xs text-white/20">
                        {new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

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
                      <span className="text-[10px] text-white/60 font-medium">{m.user.name.charAt(0).toUpperCase()}</span>
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
                  <span className="font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded">{team.inviteCode}</span>
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
        {hackathon.tracks?.length > 0 && (
          <Section title="Tracks">
            <div className="space-y-2">
              {hackathon.tracks.map((t: any) => (
                <div key={t.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                  <Zap size={14} className="text-[#ff9b7a] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white/80">{t.name}</p>
                    {t.description && <p className="text-xs text-white/40 mt-0.5">{t.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Next actions */}
        <Section title="What's Next">
          <div className="space-y-2">
            {todayDay && !checkedInToday && (
              <ActionItem label="Check in for today's event" href="/hackathon2.0/checkin" priority="high" />
            )}
            {!team && (
              <ActionItem label="Create or join a team" href="/hackathon2.0/team" priority="medium" />
            )}
            {team && isCaptain && !submission && !subDeadlinePassed && (
              <ActionItem label="Start your project submission" href="/hackathon2.0/submit" priority="high" />
            )}
            {team && isCaptain && submission?.status === "DRAFT" && (
              <ActionItem label="Finalize and submit your project" href="/hackathon2.0/submit" priority="high" />
            )}
            {team && submission?.status === "SUBMITTED" && checkedRequiredCount >= 2 && (
              <div className="flex items-center gap-2 text-sm text-green-400 px-3 py-2 bg-green-400/10 rounded-lg">
                <CheckCircle2 size={14} />
                All done! Good luck at the hackathon.
              </div>
            )}
            {!todayDay && !team && checkinDays.length === 0 && (
              <p className="text-xs text-white/30 px-3 py-2">No actions needed right now. Stay tuned!</p>
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
  sublabel,
  href,
  cta,
  locked,
}: {
  icon: any;
  title: string;
  status: "not_started" | "draft" | "done" | "locked";
  label: string;
  sublabel?: string;
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
      <p className={`text-sm font-semibold ${colors[status]}`}>{label}</p>
      {sublabel && <p className="text-xs text-white/30 mt-0.5 mb-3">{sublabel}</p>}
      {!sublabel && <div className="mb-3" />}
      {locked ? (
        <span className="text-[11px] text-white/20">Locked</span>
      ) : (
        <Link href={href} className="flex items-center gap-1 text-[11px] text-[#ff9b7a] hover:text-[#ffb89e] transition-colors">
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

function ActionItem({ label, href, priority }: { label: string; href: string; priority: "high" | "medium" }) {
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
