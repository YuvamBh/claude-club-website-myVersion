import { getHackathonUser } from "@/lib/hackathon2.0/rbac";
import { getActiveHackathon, getCheckinDays, getUserCheckins } from "@/lib/hackathon2.0/queries";
import { CheckInClient } from "./CheckInClient";
import { redirect } from "next/navigation";

export const metadata = { title: "Check In – HackASU" };

export default async function CheckInPage() {
  const user = await getHackathonUser();
  if (!user) redirect("/hackathon2.0/signin");

  // Admins go straight to the admin panel
  if (user.role === "ADMIN" || user.role === "ORGANIZER") {
    redirect("/hackathon2.0/admin");
  }

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
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome, {user.name.split(" ")[0]}! 👋</h1>
        <p className="text-xs sm:text-sm text-white/40 mt-1">{hackathon.name}</p>
      </div>

      <CheckInClient
        userId={user.id}
        qrToken={user.qrToken ?? user.id}
        userName={user.name}
        hackathonId={hackathon.id}
        days={days}
        checkins={checkins}
      />
    </div>
  );
}
