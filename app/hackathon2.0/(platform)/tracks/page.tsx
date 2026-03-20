import { requireAuth } from "@/lib/hackathon2.0/rbac";
import { getActiveHackathon } from "@/lib/hackathon2.0/queries";
import { Zap } from "lucide-react";

export const metadata = { title: "Tracks – HackASU" };

export default async function TracksPage() {
  await requireAuth();
  const hackathon = await getActiveHackathon();

  if (!hackathon) {
    return (
      <div className="py-20 text-center text-white/30">
        No active hackathon.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Competition Tracks</h1>
        <p className="text-xs sm:text-sm text-white/40 mt-1">{hackathon.name}</p>
      </div>

      {!hackathon.tracks?.length ? (
        <div className="py-12 text-center text-white/30">
          <Zap size={32} className="mx-auto mb-3 text-white/10" />
          <p>No tracks configured yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hackathon.tracks.map((track: any) => (
            <div
              key={track.id}
              className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5 flex items-start gap-4"
            >
              <Zap size={18} className="text-[#ff9b7a] mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-white">{track.name}</p>
                {track.description && (
                  <p className="text-sm text-white/40 mt-1">{track.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
