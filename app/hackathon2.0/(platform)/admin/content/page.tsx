import { getActiveHackathon } from "@/lib/hackathon2.0/queries";
import { getAdminAnnouncements } from "@/lib/hackathon2.0/queries";
import { AnnouncementsTab } from "./AnnouncementsTab";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const hackathon = await getActiveHackathon();
  const announcements = hackathon
    ? await getAdminAnnouncements(hackathon.id)
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Announcements</h1>
        <p className="text-sm text-white/40 mt-1">
          Post and manage announcements visible on participant dashboards.
        </p>
      </div>
      <AnnouncementsTab
        hackathonId={hackathon?.id ?? ""}
        initialAnnouncements={announcements}
      />
    </div>
  );
}
