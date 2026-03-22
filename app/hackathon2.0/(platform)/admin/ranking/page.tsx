import Link from "next/link";
import { requireAdmin } from "@/lib/hackathon2.0/rbac";
import { getActiveHackathon, getAllSubmissionsForJudging } from "@/lib/hackathon2.0/queries";
import { ExternalLink, Target, Users } from "lucide-react";

export const metadata = { title: "Ranking - HackASU Admin" };

export default async function AdminRankingPage() {
  await requireAdmin();
  const hackathon = await getActiveHackathon();
  if (!hackathon) return <p className="text-white/40 p-8">No active hackathon found.</p>;

  const rankedSubmissions = (await getAllSubmissionsForJudging(hackathon.id))
    .sort((a, b) => a.rank - b.rank);

  // Build per-track top 3 using global rank order
  const tracks: { id: string; name: string; color: string }[] = hackathon.tracks ?? [];
  const trackTopThree = tracks.map((track) => {
    const subs = rankedSubmissions
      .filter((s) => s.trackId === track.id)
      .slice(0, 3);
    return { track, subs };
  }).filter((t) => t.subs.length > 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">
            Project Rankings
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Top performing submissions based on judge scores and manual overrides.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Total Ranked</p>
          <p className="text-xl font-black text-white">{rankedSubmissions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Global Rankings */}
        <div className="xl:col-span-2">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3">Global Rankings</p>
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a]/50 overflow-hidden shadow-2xl">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-5 py-4 font-bold text-white/40 uppercase tracking-widest text-[10px] w-16">Rank</th>
                  <th className="px-5 py-4 font-bold text-white/40 uppercase tracking-widest text-[10px]">Project & Team</th>
                  <th className="px-5 py-4 font-bold text-white/40 uppercase tracking-widest text-[10px] text-center">Score</th>
                  <th className="px-5 py-4 font-bold text-white/40 uppercase tracking-widest text-[10px] text-center hidden md:table-cell">Judges</th>
                  <th className="px-5 py-4 font-bold text-white/40 uppercase tracking-widest text-[10px] text-center">Status</th>
                  <th className="px-5 py-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rankedSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-white/20 italic">
                      No submissions have been ranked yet.
                    </td>
                  </tr>
                ) : (
                  rankedSubmissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="group hover:bg-white/3 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className={`text-lg font-black ${
                          sub.rank === 1 ? "text-yellow-400" :
                          sub.rank === 2 ? "text-slate-300" :
                          sub.rank === 3 ? "text-amber-600" : "text-white/20"
                        }`}>
                          #{sub.rank}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-white/90 group-hover:text-[#ff9b7a] transition-colors text-sm">
                          {sub.projectName ?? "Untitled Project"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Users size={10} className="text-white/20" />
                          <span className="text-xs text-white/40">{sub.team.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-center">
                          <span className="text-base font-black text-white">{sub.finalScore.toFixed(1)}</span>
                          <span className="text-[9px] text-white/20 font-bold uppercase tracking-tighter">Percentile: {sub.percentile}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {[...Array(Math.min(sub.judgeCount, 3))].map((_, i) => (
                              <div key={i} className="w-5 h-5 rounded-full border border-[#1a1a1a] bg-white/5 flex items-center justify-center">
                                <Target size={8} className="text-white/30" />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs font-medium text-white/40">{sub.judgeCount}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center">
                          <StatusBadge status={sub.status} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/hackathon2.0/admin/submissions/${sub.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#ff9b7a]/60 hover:text-[#ff9b7a] bg-[#ff9b7a]/5 hover:bg-[#ff9b7a]/10 px-2.5 py-1 rounded-lg border border-[#ff9b7a]/10 transition-all uppercase tracking-widest"
                        >
                          View <ExternalLink size={9} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Per-Track Top 3 */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Top 3 by Track</p>
          {trackTopThree.length === 0 ? (
            <p className="text-xs text-white/20 italic">No scored submissions yet.</p>
          ) : (
            trackTopThree.map(({ track, subs }) => (
              <div key={track.id} className="rounded-xl border border-white/10 bg-[#1a1a1a]/50 overflow-hidden">
                <div
                  className="px-4 py-2.5 border-b border-white/5"
                  style={{ borderLeft: `3px solid ${track.color ?? "#ff9b7a"}` }}
                >
                  <p className="text-xs font-bold text-white/70">{track.name}</p>
                </div>
                <div className="divide-y divide-white/5">
                  {subs.map((sub, i) => (
                    <Link
                      key={sub.id}
                      href={`/hackathon2.0/admin/submissions/${sub.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors group"
                    >
                      <span className={`text-sm font-black w-6 shrink-0 ${
                        i === 0 ? "text-yellow-400" :
                        i === 1 ? "text-slate-300" :
                        "text-amber-600"
                      }`}>
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white/80 group-hover:text-[#ff9b7a] transition-colors truncate">
                          {sub.projectName ?? "Untitled"}
                        </p>
                        <p className="text-[10px] text-white/30 truncate">{sub.team.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-white">{sub.finalScore.toFixed(1)}</p>
                        <p className="text-[10px] text-white/20">#{sub.rank} global</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-white/5 text-white/40 border-white/10",
    SUBMITTED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    SHORTLISTED: "bg-[#ff9b7a]/10 text-[#ff9b7a] border-[#ff9b7a]/20",
    WINNER: "bg-yellow-400/20 text-yellow-300 border-yellow-400/30",
    REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
    DISQUALIFIED: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest ${map[status] ?? "bg-white/5 text-white/40"}`}>
      {status.replace("_", " ")}
    </span>
  );
}
