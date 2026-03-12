"use client";

import { useState, useTransition, useEffect } from "react";
import { createTeam, joinTeam, leaveTeam, transferCaptain } from "@/lib/hackathon2.0/actions";
import { Users, Plus, Link2, Copy, Check, LogOut, Crown, UserMinus } from "lucide-react";

const HACKATHON_ID = process.env.NEXT_PUBLIC_HACKATHON_ID ?? "hackathon_placeholder";

interface TeamMember {
  id: string;
  userId: string;
  role: "CAPTAIN" | "MEMBER";
  user: { name: string; email: string };
}

interface Team {
  id: string;
  name: string;
  inviteCode: string;
  maxSize: number;
  isLocked: boolean;
  track: { id: string; name: string } | null;
  members: TeamMember[];
}

// This page is a client component that loads its own data via a fetch
export default function TeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [newTeamName, setNewTeamName] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/hackathon2.0/team/me")
      .then((r) => r.json())
      .then((data) => {
        setTeam(data.team);
        setCurrentUserId(data.userId);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function copyInvite() {
    if (!team) return;
    navigator.clipboard.writeText(team.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCreate() {
    if (!newTeamName.trim()) return setError("Team name is required");
    setError("");
    startTransition(async () => {
      const result = await createTeam({ hackathonId: HACKATHON_ID, name: newTeamName.trim() });
      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error);
      }
    });
  }

  function handleJoin() {
    if (!inviteInput.trim()) return setError("Invite code is required");
    setError("");
    startTransition(async () => {
      const result = await joinTeam(inviteInput.trim(), HACKATHON_ID);
      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error);
      }
    });
  }

  function handleLeave() {
    if (!team) return;
    startTransition(async () => {
      const result = await leaveTeam(team.id);
      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error);
      }
    });
  }

  function handleTransferCaptain(newUserId: string) {
    if (!team) return;
    startTransition(async () => {
      const result = await transferCaptain(team.id, newUserId);
      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error);
      }
    });
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  const isCaptain = team?.members.find((m) => m.userId === currentUserId)?.role === "CAPTAIN";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Team</h1>
        <p className="text-sm text-white/40 mt-1">
          Teams can have up to 4 members. The captain manages the project submission.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      {!team ? (
        // No team - show create/join options
        <div className="space-y-4">
          {mode === "idle" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setMode("create")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-white/10 hover:border-[#ff9b7a]/30 bg-[#1a1a1a] hover:bg-[#ff9b7a]/5 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-[#ff9b7a]/10 flex items-center justify-center group-hover:bg-[#ff9b7a]/20 transition-colors">
                  <Plus size={18} className="text-[#ff9b7a]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white/80">Create a Team</p>
                  <p className="text-xs text-white/30 mt-1">Start a new team and invite others</p>
                </div>
              </button>

              <button
                onClick={() => setMode("join")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-white/10 hover:border-[#ff9b7a]/30 bg-[#1a1a1a] hover:bg-[#ff9b7a]/5 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-[#ff9b7a]/10 flex items-center justify-center group-hover:bg-[#ff9b7a]/20 transition-colors">
                  <Link2 size={18} className="text-[#ff9b7a]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white/80">Join a Team</p>
                  <p className="text-xs text-white/30 mt-1">Enter an invite code from your teammate</p>
                </div>
              </button>
            </div>
          )}

          {mode === "create" && (
            <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
              <h2 className="text-base font-semibold text-white mb-4">Create New Team</h2>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                Team Name <span className="text-[#ff9b7a]">*</span>
              </label>
              <input
                className="w-full bg-[#111] border border-white/10 focus:border-[#ff9b7a]/50 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none transition-colors mb-4"
                placeholder="Team Awesome"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setMode("idle"); setError(""); }}
                  className="px-4 py-2 text-sm text-white/40 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isPending}
                  className="px-5 py-2 text-sm font-medium bg-[#ff9b7a] hover:bg-[#ffb89e] text-black rounded-lg transition-colors disabled:opacity-50"
                >
                  {isPending ? "Creating…" : "Create Team"}
                </button>
              </div>
            </div>
          )}

          {mode === "join" && (
            <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
              <h2 className="text-base font-semibold text-white mb-4">Join a Team</h2>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                Invite Code <span className="text-[#ff9b7a]">*</span>
              </label>
              <input
                className="w-full bg-[#111] border border-white/10 focus:border-[#ff9b7a]/50 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none transition-colors mb-4 font-mono"
                placeholder="paste invite code here"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setMode("idle"); setError(""); }}
                  className="px-4 py-2 text-sm text-white/40 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoin}
                  disabled={isPending}
                  className="px-5 py-2 text-sm font-medium bg-[#ff9b7a] hover:bg-[#ffb89e] text-black rounded-lg transition-colors disabled:opacity-50"
                >
                  {isPending ? "Joining…" : "Join Team"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Has team - show team details
        <div className="space-y-5">
          {/* Team card */}
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">{team.name}</h2>
                {team.track && (
                  <span className="text-xs bg-[#ff9b7a]/15 text-[#ff9b7a] px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                    {team.track.name}
                  </span>
                )}
              </div>
              {team.isLocked && (
                <span className="text-xs bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded-lg border border-yellow-400/20">
                  Locked
                </span>
              )}
            </div>

            {/* Invite code */}
            {isCaptain && !team.isLocked && (
              <div className="flex items-center gap-2 mb-5 p-3 bg-[#111] rounded-lg border border-white/5">
                <div>
                  <p className="text-xs text-white/30 mb-0.5">Invite Code</p>
                  <p className="text-sm font-mono text-white/70">{team.inviteCode}</p>
                </div>
                <button
                  onClick={copyInvite}
                  className="ml-auto flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}

            {/* Members */}
            <div className="space-y-3">
              <p className="text-xs text-white/30 uppercase tracking-wide font-medium">
                Members ({team.members.length}/{team.maxSize})
              </p>
              {team.members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-xs text-white/60 font-medium">
                      {m.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 font-medium">{m.user.name}</p>
                    <p className="text-xs text-white/30 truncate">{m.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.role === "CAPTAIN" && (
                      <span className="flex items-center gap-1 text-[10px] bg-[#ff9b7a]/15 text-[#ff9b7a] px-2 py-0.5 rounded-full font-medium">
                        <Crown size={10} /> Captain
                      </span>
                    )}
                    {/* Captain actions on other members */}
                    {isCaptain && m.userId !== currentUserId && (
                      <button
                        onClick={() => handleTransferCaptain(m.userId)}
                        disabled={isPending}
                        title="Transfer captain"
                        className="text-white/20 hover:text-[#ff9b7a] transition-colors"
                      >
                        <Crown size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave team */}
          {!isCaptain && (
            <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4">
              <p className="text-sm text-white/50 mb-3">
                Leaving the team is permanent. You can join a different team afterward.
              </p>
              <button
                onClick={handleLeave}
                disabled={isPending}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <LogOut size={14} />
                {isPending ? "Leaving…" : "Leave Team"}
              </button>
            </div>
          )}

          {isCaptain && (
            <div className="rounded-xl border border-white/5 bg-[#1a1a1a] p-4">
              <p className="text-xs text-white/30">
                As captain, you manage the final project submission. Transfer captain role before
                leaving the team.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
