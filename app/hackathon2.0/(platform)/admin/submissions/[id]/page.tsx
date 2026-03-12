import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/hackathon2.0/rbac";
import { getSubmissionById } from "@/lib/hackathon2.0/queries";
import { updateSubmissionStatus } from "@/lib/hackathon2.0/actions";
import { ArrowLeft, Github, Video, Globe, FileText, ExternalLink, Crown } from "lucide-react";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const submission = await getSubmissionById(id);
  if (!submission) notFound();

  const { team } = submission;

  async function handleStatusUpdate(formData: FormData) {
    "use server";
    const status = formData.get("status") as
      | "UNDER_REVIEW"
      | "SHORTLISTED"
      | "WINNER"
      | "DISQUALIFIED";
    const notes = formData.get("notes") as string;
    await updateSubmissionStatus(id, status, notes);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/hackathon2.0/admin/submissions"
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft size={14} /> Submissions
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-sm text-white/60">{submission.projectName ?? "Untitled"}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status card */}
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
            <div className="mb-3">
              <StatusBadge status={submission.status} large />
            </div>
            {submission.submittedAt && (
              <p className="text-xs text-white/30">
                Submitted {submission.submittedAt.toLocaleString()}
              </p>
            )}
            {submission.updatedAt && (
              <p className="text-xs text-white/20 mt-0.5">
                Last updated {submission.updatedAt.toLocaleString()}
              </p>
            )}
          </div>

          {/* Admin controls */}
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
            <p className="text-xs text-white/40 uppercase tracking-wide font-medium mb-3">
              Review Actions
            </p>
            <form action={handleStatusUpdate} className="space-y-3">
              <div className="space-y-1.5">
                {(["UNDER_REVIEW", "SHORTLISTED", "WINNER", "DISQUALIFIED"] as const).map((s) => (
                  <button
                    key={s}
                    name="status"
                    value={s}
                    type="submit"
                    className={`w-full text-left text-xs py-2 px-3 rounded-lg border transition-colors ${
                      submission.status === s ? statusActiveClass(s) : "border-white/10 text-white/40 hover:border-white/20"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
              <textarea
                name="notes"
                defaultValue={submission.adminNotes ?? ""}
                placeholder="Internal notes..."
                className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 placeholder-white/20 outline-none min-h-[80px] resize-y"
              />
            </form>
          </div>

          {/* Team */}
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
            <p className="text-xs text-white/40 uppercase tracking-wide font-medium mb-3">Team</p>
            <p className="font-semibold text-white mb-1">{team.name}</p>
            {team.track && (
              <span className="text-xs bg-[#ff9b7a]/10 text-[#ff9b7a] px-2 py-0.5 rounded-full">
                {team.track.name}
              </span>
            )}
            <div className="mt-3 space-y-2">
              {team.members.map((m: any) => (
                <div key={m.id} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-white/50">
                      {m.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 truncate">{m.user.name}</p>
                    <p className="text-[10px] text-white/30 truncate">{m.user.email}</p>
                  </div>
                  {m.role === "CAPTAIN" && <Crown size={11} className="text-[#ff9b7a] shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Project header */}
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
            <h1 className="text-xl font-bold text-white mb-1">
              {submission.projectName ?? "Untitled Project"}
            </h1>
            {submission.tagline && (
              <p className="text-sm text-white/50 mb-3">{submission.tagline}</p>
            )}
            {submission.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {submission.techStack.map((t: any) => (
                  <span key={t} className="text-xs bg-white/8 text-white/50 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <SubLink icon={Github} label="GitHub" href={submission.githubUrl} />
              <SubLink icon={Video} label="Demo Video" href={submission.videoUrl} />
              <SubLink icon={Globe} label="Live Site" href={submission.deploymentUrl} />
              <SubLink icon={FileText} label="Presentation" href={submission.presentationUrl} />
              <SubLink icon={Globe} label="Demo" href={submission.demoUrl} />
              <SubLink icon={FileText} label="Design" href={submission.designUrl} />
            </div>
          </div>

          {/* Descriptions */}
          {submission.shortDescription && (
            <TextSection title="Short Description" content={submission.shortDescription} />
          )}
          {submission.problemStatement && (
            <TextSection title="Problem Statement" content={submission.problemStatement} />
          )}
          {submission.solutionOverview && (
            <TextSection title="Solution Overview" content={submission.solutionOverview} />
          )}
          {submission.longDescription && (
            <TextSection title="Full Description" content={submission.longDescription} />
          )}
          {submission.additionalNotes && (
            <TextSection title="Additional Notes" content={submission.additionalNotes} />
          )}

          {/* Assets */}
          {submission.assets.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">
                Uploaded Assets
              </h3>
              <div className="space-y-2">
                {submission.assets.map((a: any) => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#ff9b7a] hover:text-[#ffb89e] transition-colors"
                  >
                    <FileText size={13} />
                    {a.name}
                    {a.sizeBytes && (
                      <span className="text-xs text-white/30">
                        ({Math.round(a.sizeBytes / 1024)}KB)
                      </span>
                    )}
                    <ExternalLink size={11} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function TextSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

function SubLink({ icon: Icon, label, href }: { icon: any; label: string; href: string | null | undefined }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 bg-white/3 hover:bg-white/6 rounded-lg text-xs text-[#ff9b7a] transition-colors"
    >
      <Icon size={13} />
      {label}
      <ExternalLink size={10} className="ml-auto text-white/20" />
    </a>
  );
}

function StatusBadge({ status, large }: { status: string; large?: boolean }) {
  const map: Record<string, string> = {
    DRAFT: "bg-white/5 text-white/40",
    SUBMITTED: "bg-blue-500/10 text-blue-400",
    UNDER_REVIEW: "bg-purple-500/10 text-purple-400",
    SHORTLISTED: "bg-[#ff9b7a]/10 text-[#ff9b7a]",
    WINNER: "bg-yellow-400/20 text-yellow-300",
    DISQUALIFIED: "bg-[#ff9b7a]/10 text-[#ff9b7a]",
  };
  return (
    <span className={`font-medium rounded-full ${map[status] ?? "bg-white/5 text-white/40"} ${large ? "text-xs px-3 py-1" : "text-[10px] px-2 py-0.5"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function statusActiveClass(s: string): string {
  const map: Record<string, string> = {
    UNDER_REVIEW: "bg-purple-500/10 border-purple-500/30 text-purple-400",
    SHORTLISTED: "bg-[#ff9b7a]/10 border-[#ff9b7a]/30 text-[#ff9b7a]",
    WINNER: "bg-yellow-400/10 border-yellow-400/30 text-yellow-300",
    DISQUALIFIED: "bg-[#ff9b7a]/10 border-[#ff9b7a]/30 text-[#ff9b7a]",
  };
  return map[s] ?? "";
}
