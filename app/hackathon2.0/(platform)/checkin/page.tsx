import { requireAuth } from "@/lib/hackathon2.0/rbac";
import { getActiveHackathon, getCheckinDays, getUserCheckins } from "@/lib/hackathon2.0/queries";
import { CheckInClient } from "./CheckInClient";
import { getHackathonUser } from "@/lib/hackathon2.0/rbac";
import { redirect } from "next/navigation";

export const metadata = { title: "Check In – HackASU" };

export default async function CheckInPage() {
  const user = await getHackathonUser();
  if (!user) redirect("/hackathon2.0/signin");

  const hackathon = await getActiveHackathon();
  if (!hackathon) {
    return (
      <div className="py-20 text-center text-white/30">
        No active hackathon.
      </div>
    );
  }

  const [days, checkins] = await Promise.all([
    getCheckinDays(hackathon.id),
    getUserCheckins(user.id, hackathon.id),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Check In</h1>
        <p className="text-xs sm:text-sm text-white/40 mt-1">{hackathon.name}</p>
      </div>

      {days.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-8 text-center">
          <p className="text-sm text-white/40">
            Check-in days haven&apos;t been configured yet. Check back soon.
          </p>
        </div>
      ) : (
        <CheckInClient
          userId={user.id}
          qrToken={user.qrToken ?? user.id}
          userName={user.name}
          hackathonId={hackathon.id}
          days={days}
          checkins={checkins}
        />
      )}
    </div>
  );
}
