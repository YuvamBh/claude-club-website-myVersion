import Link from "next/link";
import { requireAdmin } from "@/lib/hackathon2.0/rbac";
import { getActiveHackathon, getAllTeams } from "@/lib/hackathon2.0/queries";
import { Crown, Send, FileText } from "lucide-react";

export const metadata = { title: "Teams — HackASU Admin" };

export default async function AdminTeamsPage() {
  await requireAdmin();
  const hackathon = await getActiveHackathon();
  if (!hackathon) return <p className="text-white/40">No active hackathon.</p>;

  const teams = await getAllTeams(hackathon.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Teams</h1>
        <p className="text-sm text-white/40 mt-1">{teams.length} registered teams</p>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/3">
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Team</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden md:table-cell">
                Track
              </th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Members</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden sm:table-cell">
                Application
              </th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Submission</th>
            </tr>
          </thead>
          <tbody>
            {teams.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/30 text-sm">
                  No teams yet.
                </td>
              </tr>
            ) : (
              teams.map((team) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const captain = team.members.find((m: any) => m.role === "CAPTAIN");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const submittedMembers = team.members.filter(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (m: any) => m.user.application?.status === "SUBMITTED" || m.user.application?.status === "ACCEPTED"
                );
                return (
                  <tr
                    key={team.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-white/80">{team.name}</p>
                      {captain && (
                        <p className="text-xs text-white/30 flex items-center gap-1 mt-0.5">
                          <Crown size={10} className="text-[#ff9b7a]" />
                          {captain.user.name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {team.track ? (
                        <span className="text-xs bg-[#ff9b7a]/10 text-[#ff9b7a] px-2 py-0.5 rounded-full">
                          {team.track.name}
                        </span>
                      ) : (
                        <span className="text-xs text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-1.5">
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        {team.members.slice(0, 4).map((m: any) => (
                          <div
                            key={m.id}
                            className="w-6 h-6 rounded-full bg-[#1a1a1a] border border-white/20 flex items-center justify-center"
                            title={m.user.name}
                          >
                            <span className="text-[9px] text-white/50 font-medium">
                              {m.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-white/30 mt-0.5">
                        {team.members.length}/{team.maxSize}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-xs text-white/50">
                        {submittedMembers.length}/{team.members.length} applied
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {team.submission ? (
                        <Link
                          href={`/hackathon/admin/submissions/${team.submission.id}`}
                          className="flex items-center gap-1 text-xs text-[#ff9b7a] hover:text-[#ffb89e] transition-colors"
                        >
                          <Send size={11} />
                          {team.submission.status === "SUBMITTED" ? "Submitted" : "Draft"}
                        </Link>
                      ) : (
                        <span className="text-xs text-white/20">No submission</span>
                      )}
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
