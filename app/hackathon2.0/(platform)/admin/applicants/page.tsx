import { requireAdmin } from "@/lib/hackathon2.0/rbac";
import { getActiveHackathon, getAllParticipants, getCheckinDays } from "@/lib/hackathon2.0/queries";
import { todayArizona } from "@/lib/hackathon2.0/timezone";
import { CheckCircle2, Circle, Users, Github } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Participants – HackASU Admin" };

export default async function AdminParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; checkin?: string }>;
}) {
  await requireAdmin();
  const hackathon = await getActiveHackathon();
  const params = await searchParams;

  if (!hackathon) return <p className="text-white/40">No active hackathon.</p>;

  const [participants, days] = await Promise.all([
    getAllParticipants(hackathon.id),
    getCheckinDays(hackathon.id),
  ]);

  const q = params.q?.toLowerCase() ?? "";
  const checkinFilter = params.checkin;

  const filtered = participants.filter((p: any) => {
    const matchQ =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      (p.major ?? "").toLowerCase().includes(q) ||
      (p.year ?? "").toLowerCase().includes(q);

    const matchCheckin =
      !checkinFilter ||
      (checkinFilter === "none"
        ? p.checkins.length === 0
        : p.checkins.some((c: any) => c.checkinDayId === checkinFilter));

    return matchQ && matchCheckin;
  });

  const checkedInToday = (() => {
    const today = todayArizona();
    const todayDay = days.find((d: any) => d.date === today);
    if (!todayDay) return null;
    return participants.filter((p: any) =>
      p.checkins.some((c: any) => c.checkinDayId === todayDay.id)
    ).length;
  })();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Participants</h1>
        <p className="text-xs text-white/30 mt-1">
          {participants.length} registered
          {checkedInToday !== null && (
            <> · <span className="text-green-400">{checkedInToday} checked in today</span></>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <form className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search name, email, major…"
            className="bg-[#1a1a1a] border border-white/10 focus:border-[#ff9b7a]/50 rounded-lg px-3 py-1.5 text-sm text-white/70 placeholder-white/20 outline-none w-56"
          />
          {checkinFilter && <input type="hidden" name="checkin" value={checkinFilter} />}
          <button
            type="submit"
            className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-white/50 rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        {days.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <FilterPill href="/hackathon2.0/admin/applicants" active={!checkinFilter} label="All" />
            {days.map((d: any) => (
              <FilterPill
                key={d.id}
                href={`/hackathon2.0/admin/applicants?checkin=${d.id}`}
                active={checkinFilter === d.id}
                label={`${d.label} ✓`}
              />
            ))}
            <FilterPill
              href="/hackathon2.0/admin/applicants?checkin=none"
              active={checkinFilter === "none"}
              label="Not checked in"
            />
          </div>
        )}
      </div>

      {/* Per-day check-in stats */}
      {days.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {days.map((d: any) => {
            const count = participants.filter((p: any) =>
              p.checkins.some((c: any) => c.checkinDayId === d.id)
            ).length;
            const pct =
              participants.length > 0
                ? Math.round((count / participants.length) * 100)
                : 0;
            const today = todayArizona();
            const isToday = d.date === today;
            return (
              <div
                key={d.id}
                className={`rounded-lg border p-3 ${
                  isToday
                    ? "border-[#ff9b7a]/30 bg-[#ff9b7a]/8"
                    : "border-white/8 bg-[#1a1a1a]"
                }`}
              >
                <p className={`text-xs ${isToday ? "text-[#ff9b7a]" : "text-white/40"}`}>
                  {d.label}
                </p>
                <p
                  className={`text-xl font-bold mt-0.5 ${
                    isToday ? "text-white" : "text-white/60"
                  }`}
                >
                  {count}
                </p>
                <p className={`text-xs ${isToday ? "text-white/40" : "text-white/20"}`}>
                  {pct}% of {participants.length}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/3">
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Participant</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden md:table-cell">
                Year / Major
              </th>
              {days.map((d: any) => (
                <th
                  key={d.id}
                  className="text-center text-xs text-white/40 font-medium px-3 py-3 whitespace-nowrap"
                >
                  {d.label}
                </th>
              ))}
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Team</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden lg:table-cell">
                GitHub
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4 + days.length}
                  className="px-4 py-10 text-center text-white/30 text-sm"
                >
                  {participants.length === 0
                    ? "No participants yet. Use the Import page to add participants from your Google Sheet."
                    : "No participants match your search."}
                </td>
              </tr>
            ) : (
              filtered.map((p: any) => {
                const membership = p.teamMemberships?.[0];
                const team = membership?.hackathonTeams ?? membership?.team;
                const checkedDayIds = new Set(
                  p.checkins.map((c: any) => c.checkinDayId)
                );
                return (
                  <tr
                    key={p.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-white/80 truncate max-w-[200px]">
                        {p.name}
                      </p>
                      <p className="text-xs text-white/30 truncate max-w-[200px]">
                        {p.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-white/50">{p.year ?? "-"}</p>
                      <p className="text-xs text-white/30">{p.major ?? ""}</p>
                    </td>
                    {days.map((d: any) => (
                      <td key={d.id} className="px-3 py-3 text-center">
                        {checkedDayIds.has(d.id) ? (
                          <CheckCircle2 size={15} className="text-green-400 mx-auto" />
                        ) : (
                          <Circle size={15} className="text-white/15 mx-auto" />
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      {team ? (
                        <div className="flex items-center gap-1.5">
                          <Users size={11} className="text-white/30 shrink-0" />
                          <span className="text-xs text-white/60 truncate max-w-[120px]">
                            {team.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-white/20">No team</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {p.github ? (
                        <a
                          href={
                            p.github.startsWith("http")
                              ? p.github
                              : `https://github.com/${p.github}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-[#ff9b7a] hover:text-[#ffb89e]"
                        >
                          <Github size={11} />
                          <span className="truncate max-w-[100px]">
                            {p.github.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                          </span>
                        </a>
                      ) : (
                        <span className="text-xs text-white/20">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-white/20 mt-3">
        {filtered.length} of {participants.length} participants shown
      </p>
    </div>
  );
}

function FilterPill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <a
      href={href}
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
