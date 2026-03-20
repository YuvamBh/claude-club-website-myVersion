"use client";

import { useState, useTransition } from "react";
import { upsertAnnouncement, deleteAnnouncement } from "@/lib/hackathon2.0/actions";
import { Plus, Bell, Pin, Check, Trash2, Loader2 } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  publishedAt: string | null;
  createdAt: string;
}

interface AnnouncementsTabProps {
  hackathonId: string;
  initialAnnouncements: Announcement[];
}

export function AnnouncementsTab({ hackathonId, initialAnnouncements }: AnnouncementsTabProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [publish, setPublish] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleSave() {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await upsertAnnouncement({
        hackathonId,
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
        // Optimistically add to list
        setAnnouncements((prev) => [
          {
            id: (result.data as any)?.id ?? Math.random().toString(),
            title: title.trim(),
            content: content.trim(),
            isPinned,
            publishedAt: publish ? new Date().toISOString() : null,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError((result as any).error);
      }
    });
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteAnnouncement(id);
      if (result.success) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      }
      setDeletingId(null);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-white/40">
          {announcements.length} announcement{announcements.length !== 1 ? "s" : ""}
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
          {error && <div className="text-xs text-[#ff9b7a] mb-3">{error}</div>}
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

      {/* Existing announcements */}
      {announcements.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-8 text-center">
          <Bell size={24} className="text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/40">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border p-4 flex items-start gap-3 ${
                a.isPinned ? "border-[#ff9b7a]/30 bg-[#ff9b7a]/8" : "border-white/10 bg-[#1a1a1a]"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {a.isPinned ? (
                  <Pin size={13} className="text-[#ff9b7a]" />
                ) : (
                  <Bell size={13} className="text-white/30" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${a.isPinned ? "text-[#ff9b7a]" : "text-white/80"}`}>
                  {a.title}
                </p>
                <p className="text-xs text-white/50 mt-0.5 whitespace-pre-wrap">{a.content}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {a.publishedAt ? (
                    <span className="text-[10px] text-green-400/60">Published</span>
                  ) : (
                    <span className="text-[10px] text-white/30">Draft</span>
                  )}
                  <span className="text-[10px] text-white/20">
                    {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                disabled={deletingId === a.id}
                className="shrink-0 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
              >
                {deletingId === a.id ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
