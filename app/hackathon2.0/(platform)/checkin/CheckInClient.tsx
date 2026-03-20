"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, QrCode, CheckCircle2, AlertCircle, Loader2, ChevronRight, Calendar, Sparkles } from "lucide-react";
import { checkinWithLocation } from "@/lib/hackathon2.0/actions";
import Link from "next/link";
import QRCode from "qrcode";

interface CheckInClientProps {
  userId: string;
  qrToken: string;
  userName: string;
  hackathonId: string;
  days: Array<{
    id: string;
    label: string;
    date: string;
    required: boolean;
  }>;
  checkins: Array<{
    checkinDayId: string;
    method: string;
    checkedInAt: string;
  }>;
}

export function CheckInClient({
  userId,
  qrToken,
  userName,
  hackathonId,
  days,
  checkins,
}: CheckInClientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);
  const [locStatus, setLocStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [locMessage, setLocMessage] = useState("");

  const checkedInDayIds = new Set(checkins.map((c) => c.checkinDayId));
  const today = new Date().toISOString().split("T")[0];
  const todayDay = days.find((d) => d.date === today);
  const checkedInToday = todayDay ? checkedInDayIds.has(todayDay.id) : false;
  const requiredDays = days.filter((d) => d.required);
  const checkedRequiredCount = requiredDays.filter((d) => checkedInDayIds.has(d.id)).length;

  // Generate QR code on mount - always visible
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrToken, {
        width: 220,
        margin: 2,
        color: { dark: "#1a1a1a", light: "#ffffff" },
      }).then(() => setQrReady(true));
    }
  }, [qrToken]);

  async function handleLocationCheckin() {
    if (!todayDay) return;
    setLocStatus("loading");
    setLocMessage("Getting your location…");

    if (!navigator.geolocation) {
      setLocStatus("error");
      setLocMessage("Your browser doesn't support location services.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocMessage("Verifying location…");
        const result = await checkinWithLocation(
          hackathonId,
          todayDay.id,
          pos.coords.latitude,
          pos.coords.longitude
        );
        if (result.success) {
          setLocStatus("success");
          setLocMessage("You're checked in!");
        } else {
          setLocStatus("error");
          setLocMessage(result.error ?? "Check-in failed.");
        }
      },
      (err) => {
        setLocStatus("error");
        setLocMessage(
          err.code === 1
            ? "Location permission denied. Please allow location access and try again."
            : "Could not get your location. Try again or ask an organizer to scan your QR."
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">

      {/* ── Today's check-in status banner ── */}
      {checkedInToday ? (
        <div className="rounded-2xl bg-green-400/10 border border-green-400/25 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-green-400/20 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} className="text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-green-400">You&apos;re checked in for today! ✓</p>
            <p className="text-xs text-green-400/60 mt-0.5">{todayDay?.label}</p>
          </div>
        </div>
      ) : todayDay ? (
        <div className="rounded-2xl bg-[#ff9b7a]/10 border border-[#ff9b7a]/25 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#ff9b7a]/20 flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-[#ff9b7a]" />
            </div>
            <div>
              <p className="font-semibold text-white">Check in now</p>
              <p className="text-xs text-white/40 mt-0.5">{todayDay.label}</p>
            </div>
          </div>
          <button
            onClick={handleLocationCheckin}
            disabled={locStatus === "loading" || locStatus === "success"}
            className="w-full flex items-center justify-center gap-2.5 bg-[#ff9b7a] hover:bg-[#ffb89e] text-[#1a1a1a] font-semibold rounded-xl py-3.5 text-sm transition-colors disabled:opacity-60"
          >
            {locStatus === "loading" && <Loader2 size={16} className="animate-spin" />}
            {locStatus === "success" && <CheckCircle2 size={16} />}
            {locStatus === "idle" && <MapPin size={16} />}
            {locStatus === "error" && <MapPin size={16} />}
            {locStatus === "idle" && "Check In with Location"}
            {locStatus === "loading" && locMessage}
            {locStatus === "success" && "Checked In!"}
            {locStatus === "error" && "Retry Location Check-in"}
          </button>
          {locStatus === "error" && (
            <p className="mt-3 text-xs text-red-400 text-center">{locMessage}</p>
          )}
          <p className="mt-3 text-center text-xs text-white/30">
            Or ask an organizer to scan your QR badge below
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex items-center gap-3">
          <Sparkles size={18} className="text-[#ff9b7a] shrink-0" />
          <p className="text-sm text-white/60">
            {days.length === 0
              ? "Check-in hasn't opened yet - come back soon!"
              : "No check-in event today. See the calendar below."}
          </p>
        </div>
      )}

      {/* ── QR Badge - always visible ── */}
      <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-6">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <QrCode size={15} className="text-[#ff9b7a]" />
            <h2 className="text-sm font-semibold text-white/70">Your QR Badge</h2>
          </div>
          <p className="text-xs text-white/30">
            Show this to any organizer for manual check-in
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className={`bg-white p-3 rounded-xl transition-opacity duration-300 ${qrReady ? "opacity-100" : "opacity-0"}`}>
            <canvas ref={canvasRef} className="block" />
          </div>
          {!qrReady && (
            <div className="w-[220px] h-[220px] bg-white/5 rounded-xl flex items-center justify-center">
              <Loader2 size={24} className="text-white/30 animate-spin" />
            </div>
          )}
          <p className="text-xs text-white/40 font-medium">{userName}</p>
        </div>
      </div>

      {/* ── Attendance calendar ── */}
      {days.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-white/40" />
              <h2 className="text-sm font-semibold text-white/60">Attendance</h2>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              checkedRequiredCount >= 2
                ? "bg-green-400/15 text-green-400"
                : "bg-white/5 text-white/30"
            }`}>
              {checkedRequiredCount}/{requiredDays.length} required
            </span>
          </div>
          <div className="space-y-2">
            {days.map((day) => {
              const done = checkedInDayIds.has(day.id);
              const isToday = day.date === today;
              return (
                <div
                  key={day.id}
                  className={`flex items-center justify-between rounded-lg px-3.5 py-3 text-sm border transition-colors ${
                    done
                      ? "bg-green-400/8 border-green-400/20"
                      : isToday
                      ? "bg-[#ff9b7a]/8 border-[#ff9b7a]/20"
                      : "bg-white/3 border-white/8"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {done ? (
                      <CheckCircle2 size={15} className="text-green-400 shrink-0" />
                    ) : isToday ? (
                      <AlertCircle size={15} className="text-[#ff9b7a] shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" />
                    )}
                    <span className={done ? "text-green-400" : isToday ? "text-[#ff9b7a]" : "text-white/40"}>
                      {day.label}
                    </span>
                    {day.required && (
                      <span className="text-[9px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded">required</span>
                    )}
                  </div>
                  <span className={`text-xs ${done ? "text-green-400/60" : isToday ? "text-[#ff9b7a]/60" : "text-white/20"}`}>
                    {done ? "✓ Done" : isToday ? "Today" : new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}


    </div>
  );
}
