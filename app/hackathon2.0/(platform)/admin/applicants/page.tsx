import Link from "next/link";
import { requireAdmin } from "@/lib/hackathon2.0/rbac";
import { getActiveHackathon, getAllApplications } from "@/lib/hackathon2.0/queries";
import { Search, ExternalLink, FileText } from "lucide-react";

export const metadata = { title: "Applicants - HackASU Admin" };

export default async function AdminApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdmin();
  const hackathon = await getActiveHackathon();
  const params = await searchParams;

  if (!hackathon) return <p className="text-white/40">No active hackathon.</p>;

  const allApplications = await getAllApplications(hackathon.id);

  // Filter
  const filtered = allApplications.filter((a) => {
    const matchStatus = !params.status || a.status === params.status;
    const q = params.q?.toLowerCase() ?? "";
    const matchQ =
      !q ||
      a.user.name.toLowerCase().includes(q) ||
      a.user.email.toLowerCase().includes(q) ||
      (a.university ?? "").toLowerCase().includes(q) ||
      (a.major ?? "").toLowerCase().includes(q);
    return matchStatus && matchQ;
  });

  const statusCounts = allApplications.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  const statuses = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "WAITLISTED", "REJECTED"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Applicants</h1>
        <p className="text-sm text-white/40 mt-1">
          {allApplications.length} total applications
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <form className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Search name, email, school…"
              className="bg-[#1a1a1a] border border-white/10 focus:border-[#ff9b7a]/50 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white/70 placeholder-white/20 outline-none w-64"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-white/50 rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          <StatusFilter status="" current={params.status} label={`All (${allApplications.length})`} />
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
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Applicant</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden md:table-cell">
                School / Major
              </th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden lg:table-cell">
                Tracks
              </th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden sm:table-cell">
                Team
              </th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/30 text-sm">
                  No applications match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((app) => {
                const team = app.user.teamMemberships?.[0]?.team;
                return (
                  <tr
                    key={app.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-white/80">{app.user.name}</p>
                      <p className="text-xs text-white/30">{app.user.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-white/60">{app.university ?? "-"}</p>
                      <p className="text-xs text-white/30">{app.major ?? ""} · {app.year ?? ""}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        {(app.desiredTracks ?? []).slice(0, 2).map((t: any) => (
                          <span
                            key={t}
                            className="text-[10px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {team ? (
                        <p className="text-xs text-white/50">{team.name}</p>
                      ) : (
                        <p className="text-xs text-white/20">No team</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/hackathon/admin/applicants/${app.id}`}
                        className="text-xs text-[#ff9b7a] hover:text-[#ffb89e] transition-colors flex items-center gap-1"
                      >
                        View <ExternalLink size={11} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusFilter({
  status,
  current,
  label,
}: {
  status: string;
  current?: string;
  label: string;
}) {
  const active = status === (current ?? "");
  return (
    <a
      href={`/hackathon/admin/applicants${status ? `?status=${status}` : ""}`}
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
    ACCEPTED: "bg-green-500/10 text-green-400",
    REJECTED: "bg-red-500/10 text-red-400",
    WAITLISTED: "bg-yellow-500/10 text-yellow-400",
    UNDER_REVIEW: "bg-purple-500/10 text-purple-400",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${map[status] ?? "bg-white/5 text-white/40"}`}>
      {status}
    </span>
  );
}
