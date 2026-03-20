"use client";

import { useState, useTransition } from "react";
import { updateVenueCoordinates } from "@/lib/hackathon2.0/actions";
import { MapPin, Check, Loader2 } from "lucide-react";

const HACKATHON_ID = process.env.NEXT_PUBLIC_HACKATHON_ID ?? "";

export default function AdminSettingsPage() {
  const [lat, setLat] = useState("33.43129113390276");
  const [lng, setLng] = useState("-111.93511720740189");
  const [radius, setRadius] = useState("300");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError("");
    const fd = new FormData();
    fd.set("hackathonId", HACKATHON_ID);
    fd.set("venueLat", lat);
    fd.set("venueLng", lng);
    fd.set("venueRadiusM", radius);

    startTransition(async () => {
      const result = await updateVenueCoordinates(fd);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error ?? "Failed to save.");
      }
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Settings</h1>
        <p className="text-xs text-white/30 mt-1">Venue geolocation for check-in</p>
      </div>

      <div className="max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={14} className="text-[#ff9b7a]" />
          <p className="text-sm font-semibold text-white/70">Venue Coordinates</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Latitude</label>
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full bg-[#111] border border-white/10 focus:border-[#ff9b7a]/50 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none font-mono"
              placeholder="33.4312..."
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Longitude</label>
            <input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full bg-[#111] border border-white/10 focus:border-[#ff9b7a]/50 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none font-mono"
              placeholder="-111.935..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5">Radius (meters)</label>
          <input
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="w-full bg-[#111] border border-white/10 focus:border-[#ff9b7a]/50 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none font-mono"
            placeholder="300"
          />
          <p className="text-[10px] text-white/20 mt-1">Participants must be within this radius to check in via location.</p>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-[#ff9b7a] hover:bg-[#ffb89e] disabled:opacity-50 text-[#1a1a1a] font-semibold rounded-xl py-2.5 text-sm transition-colors"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <MapPin size={14} />}
          {isPending ? "Saving…" : saved ? "Saved!" : "Save Venue Location"}
        </button>
      </div>
    </div>
  );
}
