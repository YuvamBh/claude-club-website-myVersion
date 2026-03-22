"use client";

import { useState, useTransition } from "react";
import { submitBulkJudgeScores } from "@/lib/hackathon2.0/actions";
import { Check, Loader2 } from "lucide-react";

export default function JudgingForm({
  submissionId,
  criteria,
  initialScores = {},
  initialOverride = "",
  initialNotes = "",
}: {
  submissionId: string;
  criteria: any[];
  initialScores?: Record<string, number>;
  initialOverride?: string;
  initialNotes?: string;
}) {
  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [overrideScore, setOverrideScore] = useState<string>(initialOverride);
  const [notes, setNotes] = useState<string>(initialNotes);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const totalCalculated = criteria.reduce((sum, c) => sum + (scores[c.id] || 0), 0);
  const maxPossible = criteria.reduce((sum, c) => sum + (c.maxScore ?? 10), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    startTransition(async () => {
      const payload = {
        submissionId,
        scores: Object.entries(scores).map(([criterionId, score]) => ({
          criterionId,
          score,
        })),
        overrideScore: overrideScore ? parseInt(overrideScore) : undefined,
        notes,
      };

      const result = await submitBulkJudgeScores(payload);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to submit scores");
      }
    });
  };

  if (!criteria || criteria.length === 0) {
    return <div className="text-sm text-white/40">No judging criteria configured.</div>;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <p className="text-xs text-white/40 uppercase tracking-wide font-medium mb-3">
        Judging Form
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {criteria.map((c) => (
            <div key={c.id} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm text-white/80 font-medium">{c.name}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={c.maxScore ?? 10}
                    value={scores[c.id] ?? ""}
                    onChange={(e) => {
                      const max = c.maxScore ?? 10;
                      const val = e.target.value === "" ? 0 : Math.min(max, Math.max(0, parseInt(e.target.value)));
                      setScores({ ...scores, [c.id]: val });
                    }}
                    className="w-14 bg-[#111] border border-white/10 focus:border-[#ff9b7a]/50 rounded px-2 py-1 text-sm text-center text-white outline-none transition-all"
                  />
                  <span className="text-xs font-semibold text-white/20">/ {c.maxScore ?? 10}</span>
                </div>
              </div>
              {c.description && <p className="text-[10px] text-white/40">{c.description}</p>}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-sm text-white/60">Calculated Score:</span>
          <span className="text-sm font-semibold text-white">{totalCalculated} / {maxPossible}</span>
        </div>

        <div className="space-y-1.5 mt-4">
          <label className="text-xs text-white/70 font-medium">Manual Override Score (Optional)</label>
          <input
            type="number"
            placeholder="e.g. 95"
            value={overrideScore}
            onChange={(e) => setOverrideScore(e.target.value)}
            className="w-full bg-[#111] border border-white/10 focus:border-[#ff9b7a]/50 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition-all"
          />
        </div>

        <div className="space-y-1.5 mt-4">
          <label className="text-xs text-white/70 font-medium">Judging Notes</label>
          <textarea
            placeholder="Private notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#111] border border-white/10 focus:border-[#ff9b7a]/50 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none min-h-[80px] resize-y transition-all"
          />
        </div>

        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-[#ff9b7a]/20 border border-white/10 hover:border-[#ff9b7a]/30 text-white hover:text-[#ff9b7a] text-sm font-medium rounded-lg transition-all disabled:opacity-50"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {success ? "Scores Saved!" : "Save Scores"}
        </button>
      </form>
    </div>
  );
}

