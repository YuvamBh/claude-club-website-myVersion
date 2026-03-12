"use client";

import { useState, useTransition } from "react";
import { upsertAnnouncement } from "@/lib/hackathon/actions";
import { Plus, Bell, Edit2, Check } from "lucide-react";

const HACKATHON_ID = process.env.NEXT_PUBLIC_HACKATHON_ID ?? "hackathon_placeholder";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<"announcements" | "tracks" | "rules" | "faq">(
    "announcements"
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Content Management</h1>
        <p className="text-sm text-white/40 mt-1">
          Manage tracks, rules, FAQ, and announcements.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/10">
        {(["announcements", "tracks", "rules", "faq"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-[#ff9b7a] text-[#ff9b7a]"
                : "border-transparent text-white/40 hover:text-white/60"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "announcements" && <AnnouncementsTab />}
      {activeTab === "tracks" && <ComingSoonTab label="Tracks" />}
      {activeTab === "rules" && <ComingSoonTab label="Rules" />}
      {activeTab === "faq" && <ComingSoonTab label="FAQ" />}
    </div>
  );
}

function AnnouncementsTab() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [publish, setPublish] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSave() {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await upsertAnnouncement({
        hackathonId: HACKATHON_ID,
        title: title.trim(),
        content: content.trim(),
        isPinned,
        publish,
      });
      if (result.success) {
        setSaved(true);
        setTitle("");
        setContent("");
        setIsPinned(false);
        setShowForm(false);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-white/40">
          Post announcements visible on participant dashboards.
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#ff9b7a]/10 hover:bg-[#ff9b7a]/20 text-[#ff9b7a] rounded-lg transition-colors"
        >
          <Plus size={13} /> New Announcement
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-400 mb-4 bg-green-400/10 border border-green-400/20 px-4 py-3 rounded-lg">
          <Check size={14} /> Announcement saved.
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5 mb-4">
          <h3 className="text-sm font-semibold text-white mb-4">New Announcement</h3>
          {error && (
            <div className="text-xs text-red-400 mb-3">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Title *</label>
              <input
                className="w-full bg-[#111] border border-white/10 focus:border-[#ff9b7a]/50 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none"
                placeholder="Important update..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Content *</label>
              <textarea
                className="w-full bg-[#111] border border-white/10 focus:border-[#ff9b7a]/50 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none min-h-[100px] resize-y"
                placeholder="Announcement body..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="accent-[#ff9b7a]"
                />
                Pin to top
              </label>
              <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publish}
                  onChange={(e) => setPublish(e.target.checked)}
                  className="accent-[#ff9b7a]"
                />
                Publish immediately
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowForm(false); setError(""); }}
                className="px-4 py-2 text-sm text-white/40 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="px-5 py-2 text-sm font-medium bg-[#ff9b7a] hover:bg-[#ffb89e] text-black rounded-lg transition-colors disabled:opacity-50"
              >
                {isPending ? "Saving…" : "Save Announcement"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
        <p className="text-xs text-white/30">
          Announcements are loaded live from the database. Refresh the page to see newly added ones here.
        </p>
      </div>
    </div>
  );
}

function ComingSoonTab({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-8 text-center">
      <Edit2 size={24} className="text-white/20 mx-auto mb-3" />
      <p className="text-sm text-white/40">{label} management UI coming in Phase 2.</p>
      <p className="text-xs text-white/20 mt-1">
        Use the database seeder or direct DB access to manage {label.toLowerCase()} for now.
      </p>
    </div>
  );
}
