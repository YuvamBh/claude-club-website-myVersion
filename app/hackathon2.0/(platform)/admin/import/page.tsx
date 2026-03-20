import { requireAdmin } from "@/lib/hackathon2.0/rbac";
import { ImportClient } from "./ImportClient";
import { Users } from "lucide-react";

export const metadata = { title: "Import Participants – HackASU Admin" };

export default async function ImportPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} className="text-[#ff9b7a]" />
          <h1 className="text-xl sm:text-2xl font-bold text-white">Import Participants</h1>
        </div>
        <p className="text-xs sm:text-sm text-white/40 mt-1">
          Paste data from Google Sheets / Sundevil Central to pre-register participants. They can then sign in with their ASU Google account and go directly to check-in.
        </p>
      </div>
      <ImportClient />
    </div>
  );
}
