import { requireAdmin } from "@/lib/hackathon2.0/rbac";
import { getActiveHackathon, getCheckinDays } from "@/lib/hackathon2.0/queries";
import { ScannerClient } from "./ScannerClient";

export const metadata = { title: "QR Scanner – HackASU Admin" };

export default async function ScannerPage() {
  await requireAdmin();
  const hackathon = await getActiveHackathon();

  if (!hackathon) {
    return (
      <div className="py-20 text-center text-white/30">No active hackathon.</div>
    );
  }

  const days = await getCheckinDays(hackathon.id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white">QR Scanner</h1>
        <p className="text-xs sm:text-sm text-white/40 mt-1">
          Scan participant badges to mark attendance
        </p>
      </div>

      {days.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-8 text-center">
          <p className="text-sm text-white/40">
            No check-in days configured. Add them in the Content admin panel.
          </p>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <ScannerClient hackathonId={hackathon.id} days={days} />
        </div>
      )}
    </div>
  );
}
