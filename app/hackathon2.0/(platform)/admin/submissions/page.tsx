import Link from "next/link";
import { requireAdmin } from "@/lib/hackathon2.0/rbac";
import { getActiveHackathon, getAllSubmissions } from "@/lib/hackathon2.0/queries";
import { ExternalLink, Github, Video, Globe } from "lucide-react";

export const metadata = { title: "Submissions — HackASU Admin" };

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; track?: string; q?: string }>;
}) {
  await requireAdmin();
  const hackathon = await getActiveHackathon();
  const params = await searchParams;
  if (!hackathon) return <p className="text-white/40">No active hackathon.</p>;

  const allSubmissions = await getAllSubmissions(hackathon.id);

  const filtered = allSubmissions.filter((s) => {
    const matchStatus = !params.status || s.status === params.status;
    const matchTrack = !params.track || s.team.track?.id === params.track;
    const q = params.q?.toLowerCase() ?? "";
    const matchQ =
      !q ||
      (s.projectName ?? "").toLowerCase().includes(q) ||
      s.team.name.toLowerCase().includes(q);
    return matchStatus && matchTrack && matchQ;
  });

  const statusCounts = allSubmissions.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  const statuses = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "WINNER", "DISQUALIFIED"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Submissions</h1>
        <p className="text-sm text-white/40 mt-1">
          {allSubmissions.length} total · {statusCounts["SUBMITTED"] ?? 0} submitted
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <form className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search project or team…"
            className="bg-[#1a1a1a] border border-white/10 focus:border-[#ff9b7a]/50 rounded-lg px-3 py-1.5 text-sm text-white/70 placeholder-white/20 outline-none w-56"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-white/50 rounded-lg transition-colors"
          >
            Search
          </button>
        </form>
        <div className="flex flex-wrap gap-1.5">
          <StatusFilter status="" current={params.status} label={`All (${allSubmissions.length})`} />
          {statuses.map((s) => (
            <StatusFilter
              key={s}
              status={s}
              current={params.status}
              label={`${s} (${statusCounts[s] ?? 0})`}
            />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/3">
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Project</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden md:table-cell">
                Team
              </th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden lg:table-cell">
                Track
              </th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden sm:table-cell">
                Links
              </th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden lg:table-cell">
                Submitted
              </th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-white/30 text-sm">
                  No submissions match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-white/80">
                      {sub.projectName ?? "Untitled"}
                    </p>
                    {sub.tagline && (
                      <p className="text-xs text-white/30 truncate max-w-[200px]">{sub.tagline}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-white/60">{sub.team.name}</p>
                    <p className="text-xs text-white/30">{sub.team.members.length} members</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {sub.team.track ? (
                      <span className="text-xs bg-[#ff9b7a]/10 text-[#ff9b7a] px-2 py-0.5 rounded-full">
                        {sub.team.track.name}
                      </span>
                    ) : (
                      <span className="text-xs text-white/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex gap-2">
                      {sub.githubUrl && (
                        <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer"
                          className="text-white/30 hover:text-white/60 transition-colors">
                          <Github size={13} />
                        </a>
                      )}
                      {sub.videoUrl && (
                        <a href={sub.videoUrl} target="_blank" rel="noopener noreferrer"
                          className="text-white/30 hover:text-white/60 transition-colors">
                          <Video size={13} />
                        </a>
                      )}
                      {sub.deploymentUrl && (
                        <a href={sub.deploymentUrl} target="_blank" rel="noopener noreferrer"
                          className="text-white/30 hover:text-white/60 transition-colors">
                          <Globe size={13} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-xs text-white/40">
                      {sub.submittedAt?.toLocaleDateString() ?? "Draft"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/hackathon/admin/submissions/${sub.id}`}
                      className="text-xs text-[#ff9b7a] hover:text-[#ffb89e] flex items-center gap-1 transition-colors"
                    >
                      View <ExternalLink size={11} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusFilter({ status, current, label }: { status: string; current?: string; label: string }) {
  const active = status === (current ?? "");
  return (
    <a
      href={`/hackathon/admin/submissions${status ? `?status=${status}` : ""}`}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-[#ff9b7a]/20 border-[#ff9b7a]/40 text-[#ff9b7a]"
          : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
      }`}
    >
      {label}
    </a>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-white/5 text-white/40",
    SUBMITTED: "bg-blue-500/10 text-blue-400",
    UNDER_REVIEW: "bg-purple-500/10 text-purple-400",
    SHORTLISTED: "bg-[#ff9b7a]/10 text-[#ff9b7a]",
    WINNER: "bg-yellow-400/20 text-yellow-300",
    DISQUALIFIED: "bg-red-500/10 text-red-400",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${map[status] ?? "bg-white/5 text-white/40"}`}>
      {status.replace("_", " ")}
    </span>
  );
}
