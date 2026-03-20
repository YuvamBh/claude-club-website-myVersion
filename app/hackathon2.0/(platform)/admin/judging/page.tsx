import { requireAdmin } from "@/lib/hackathon2.0/rbac";
import { getActiveHackathon, getAllSubmissionsForJudging } from "@/lib/hackathon2.0/queries";
import Link from "next/link";
import { BarChart3, ChevronRight, Trophy, Users, Send, Star } from "lucide-react";

export const metadata = { title: "Judging – HackASU Admin" };

export default async function JudgingPage() {
  await requireAdmin();
  const hackathon = await getActiveHackathon();

  if (!hackathon) {
    return <div className="py-20 text-center text-white/30">No active hackathon.</div>;
  }

  const submissions = await getAllSubmissionsForJudging(hackathon.id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Judging</h1>
        <p className="text-xs sm:text-sm text-white/40 mt-1">
          {submissions.length} submitted project{submissions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-10 text-center">
          <Trophy size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/40">No submitted projects yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions
            .sort((a: any, b: any) => (b.avgScore ?? -1) - (a.avgScore ?? -1))
            .map((sub: any, i: number) => (
              <Link
                key={sub.id}
                href={`/hackathon2.0/admin/judging/${sub.id}`}
                className="block rounded-xl border border-white/10 bg-[#1a1a1a] hover:bg-white/5 transition-colors p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <span className="text-2xl font-bold text-white/20 w-7 shrink-0 text-right">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-white truncate">{sub.projectName ?? "Untitled Project"}</h3>
                        {sub.team?.track && (
                          <span className="text-[10px] bg-[#ff9b7a]/20 text-[#ff9b7a] px-2 py-0.5 rounded-full font-medium shrink-0">
                            {sub.team.track.name}
                          </span>
                        )}
                      </div>
                      {sub.tagline && (
                        <p className="text-xs text-white/40 mb-2 line-clamp-1">{sub.tagline}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-white/30">
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {sub.team?.name ?? "Unknown Team"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={11} />
                          {sub.scores?.length ?? 0} score{(sub.scores?.length ?? 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {sub.avgScore !== null ? (
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#ff9b7a]">{sub.avgScore}</p>
                        <p className="text-[10px] text-white/30">avg score</p>
                      </div>
                    ) : (
                      <span className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded">
                        Not judged
                      </span>
                    )}
                    <ChevronRight size={16} className="text-white/20" />
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
