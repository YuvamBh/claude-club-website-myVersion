import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/hackathon/rbac";
import { getApplicationById } from "@/lib/hackathon/queries";
import { updateApplicationStatus } from "@/lib/hackathon/actions";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Linkedin,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
} from "lucide-react";

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) notFound();

  const user = application.user;
  const profile = user.profile;

  async function handleStatus(formData: FormData) {
    "use server";
    const status = formData.get("status") as
      | "ACCEPTED"
      | "REJECTED"
      | "WAITLISTED"
      | "UNDER_REVIEW";
    const notes = formData.get("notes") as string;
    await updateApplicationStatus(id, status, notes);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/hackathon/admin/applicants"
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft size={14} /> Applicants
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-sm text-white/60">{user.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: profile + status */}
        <div className="space-y-5">
          {/* Profile card */}
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ff9b7a]/20 flex items-center justify-center">
                <span className="text-[#ff9b7a] font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-xs text-white/40">{user.email}</p>
              </div>
            </div>

            <StatusBadge status={application.status} large />

            {/* Links */}
            <div className="mt-4 space-y-2">
              {application.githubUrl && (
                <ExternalLinkItem
                  icon={Github}
                  label="GitHub"
                  href={application.githubUrl}
                />
              )}
              {application.linkedinUrl && (
                <ExternalLinkItem
                  icon={Linkedin}
                  label="LinkedIn"
                  href={application.linkedinUrl}
                />
              )}
              {application.resumeUrl && (
                <ExternalLinkItem
                  icon={FileText}
                  label="Resume"
                  href={application.resumeUrl}
                />
              )}
            </div>
          </div>

          {/* Admin status control */}
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
            <p className="text-xs text-white/40 uppercase tracking-wide font-medium mb-3">
              Update Status
            </p>
            <form action={handleStatus} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {(["ACCEPTED", "REJECTED", "WAITLISTED", "UNDER_REVIEW"] as const).map((s) => (
                  <button
                    key={s}
                    name="status"
                    value={s}
                    type="submit"
                    className={`text-xs py-2 px-3 rounded-lg border transition-colors ${
                      application.status === s
                        ? statusButtonActive(s)
                        : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                    }`}
                  >
                    {s === "UNDER_REVIEW" ? "Review" : s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              <textarea
                name="notes"
                defaultValue={application.adminNotes ?? ""}
                placeholder="Internal notes (optional)..."
                className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 placeholder-white/20 outline-none min-h-[80px] resize-y"
              />
            </form>
            {application.reviewedAt && (
              <p className="text-xs text-white/20 mt-2">
                Reviewed {application.reviewedAt.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Right column: application details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Academic info */}
          <Section title="Academic Information">
            <Grid>
              <InfoItem label="University" value={application.university} />
              <InfoItem label="Major" value={application.major} />
              <InfoItem label="Year" value={application.year} />
              <InfoItem label="Experience" value={application.experienceLevel} />
            </Grid>
          </Section>

          {/* Tracks */}
          <Section title="Desired Tracks">
            <div className="flex flex-wrap gap-1.5">
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {(application.desiredTracks ?? []).map((t: any) => (
                <span
                  key={t}
                  className="text-xs bg-[#ff9b7a]/10 text-[#ff9b7a] px-2.5 py-1 rounded-full"
                >
                  {t}
                </span>
              ))}
              {(!application.desiredTracks || application.desiredTracks.length === 0) && (
                <span className="text-xs text-white/30">None selected</span>
              )}
            </div>
          </Section>

          {/* Why join */}
          {application.whyJoin && (
            <Section title="Why They Want to Join">
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
                {application.whyJoin}
              </p>
            </Section>
          )}

          {/* Prior experience */}
          {application.priorExperience && (
            <Section title="Prior Experience">
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
                {application.priorExperience}
              </p>
            </Section>
          )}

          {/* Operational */}
          {(application.dietaryNeeds || application.accessibilityNeeds) && (
            <Section title="Operational Details">
              <Grid>
                {application.dietaryNeeds && (
                  <InfoItem label="Dietary" value={application.dietaryNeeds} />
                )}
                {application.accessibilityNeeds && (
                  <InfoItem label="Accessibility" value={application.accessibilityNeeds} />
                )}
              </Grid>
            </Section>
          )}

          {/* Timestamps */}
          <Section title="Timestamps">
            <Grid>
              <InfoItem
                label="Applied"
                value={
                  application.submittedAt?.toLocaleDateString() ?? "Draft not submitted"
                }
              />
              <InfoItem
                label="Created"
                value={application.createdAt.toLocaleDateString()}
              />
              <InfoItem
                label="Agreement"
                value={
                  application.agreedToRules
                    ? `Agreed ${application.agreedAt?.toLocaleDateString() ?? ""}`
                    : "Not agreed"
                }
              />
            </Grid>
          </Section>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-white/30 mb-0.5">{label}</p>
      <p className="text-sm text-white/70">{value ?? "—"}</p>
    </div>
  );
}

function ExternalLinkItem({
  icon: Icon,
  label,
  href,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-xs text-[#ff9b7a] hover:text-[#ffb89e] transition-colors"
    >
      <Icon size={13} />
      {label}
      <ExternalLink size={10} />
    </a>
  );
}

function StatusBadge({ status, large }: { status: string; large?: boolean }) {
  const map: Record<string, string> = {
    DRAFT: "bg-white/5 text-white/40",
    SUBMITTED: "bg-blue-500/10 text-blue-400",
    ACCEPTED: "bg-green-500/10 text-green-400",
    REJECTED: "bg-red-500/10 text-red-400",
    WAITLISTED: "bg-yellow-500/10 text-yellow-400",
    UNDER_REVIEW: "bg-purple-500/10 text-purple-400",
  };
  return (
    <span
      className={`font-medium rounded-full ${map[status] ?? "bg-white/5 text-white/40"} ${large ? "text-xs px-3 py-1" : "text-[10px] px-2 py-0.5"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function statusButtonActive(status: string): string {
  const map: Record<string, string> = {
    ACCEPTED: "bg-green-500/10 border-green-500/30 text-green-400",
    REJECTED: "bg-red-500/10 border-red-500/30 text-red-400",
    WAITLISTED: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    UNDER_REVIEW: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  };
  return map[status] ?? "";
}
