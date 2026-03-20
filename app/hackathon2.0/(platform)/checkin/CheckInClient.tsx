"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, QrCode, CheckCircle2, AlertCircle, Loader2, Camera } from "lucide-react";
import { checkinWithLocation } from "@/lib/hackathon2.0/actions";
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
  const [showQr, setShowQr] = useState(false);
  const [locStatus, setLocStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [locMessage, setLocMessage] = useState("");
  const [activeDay, setActiveDay] = useState<string | null>(null);

  const checkedInDayIds = new Set(checkins.map((c) => c.checkinDayId));

  // Today's check-in day (match by date)
  const today = new Date().toISOString().split("T")[0];
  const todayDay = days.find((d) => d.date === today);

  // Generate QR code when shown
  useEffect(() => {
    if (showQr && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrToken, {
        width: 280,
        margin: 2,
        color: { dark: "#ffffff", light: "#1a1a1a" },
      });
    }
  }, [showQr, qrToken]);

  async function handleLocationCheckin() {
    const dayId = activeDay ?? todayDay?.id;
    if (!dayId) {
      setLocMessage("No check-in day is configured for today.");
      setLocStatus("error");
      return;
    }

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
          dayId,
          pos.coords.latitude,
          pos.coords.longitude
        );
        if (result.success) {
          setLocStatus("success");
          setLocMessage("You're checked in! ✓");
        } else {
          setLocStatus("error");
          setLocMessage(result.error ?? "Check-in failed.");
        }
      },
      (err) => {
        setLocStatus("error");
        setLocMessage(
          err.code === 1
            ? "Location permission denied. Please allow access and try again."
            : "Could not get your location. Try again."
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  const requiredDays = days.filter((d) => d.required);
  const checkedRequiredCount = requiredDays.filter((d) => checkedInDayIds.has(d.id)).length;
  const attendanceOk = checkedRequiredCount >= 2;

  return (
    <div className="space-y-6">
      {/* Attendance summary */}
      <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">
          Attendance Status
        </h2>
        <div className="flex items-center gap-3 mb-4">
          {attendanceOk ? (
            <CheckCircle2 size={20} className="text-green-400 shrink-0" />
          ) : (
            <AlertCircle size={20} className="text-yellow-400 shrink-0" />
          )}
          <p className="text-sm text-white/70">
            {checkedRequiredCount} of {requiredDays.length} required days attended
            {attendanceOk ? " — requirement met ✓" : " — need at least 2"}
          </p>
        </div>
        <div className="space-y-2">
          {days.map((day) => {
            const done = checkedInDayIds.has(day.id);
            const isToday = day.date === today;
            return (
              <div
                key={day.id}
                className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm border ${
                  done
                    ? "bg-green-400/10 border-green-400/20 text-green-400"
                    : isToday
                    ? "bg-[#ff9b7a]/10 border-[#ff9b7a]/20 text-[#ff9b7a]"
                    : "bg-white/3 border-white/10 text-white/40"
                }`}
              >
                <span className="font-medium">{day.label}</span>
                <span className="text-xs">
                  {done ? "Checked in ✓" : isToday ? "Today — check in now" : new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      {todayDay && !checkedInDayIds.has(todayDay.id) && (
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">
            Check In for {todayDay.label}
          </h2>
          <p className="text-xs text-white/40 mb-5">
            Check in using your device&apos;s location. Make sure you are at the venue.
            Alternatively, ask an organizer to scan your QR code below.
          </p>

          <button
            onClick={handleLocationCheckin}
            disabled={locStatus === "loading" || locStatus === "success"}
            className="w-full flex items-center justify-center gap-2.5 bg-[#ff9b7a]/10 hover:bg-[#ff9b7a]/20 border border-[#ff9b7a]/30 text-[#ff9b7a] rounded-xl py-3.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {locStatus === "loading" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : locStatus === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <MapPin size={16} />
            )}
            {locStatus === "idle" && "Check In with Location"}
            {locStatus === "loading" && locMessage}
            {locStatus === "success" && "Checked In!"}
            {locStatus === "error" && "Retry Location Check-in"}
          </button>

          {locStatus === "error" && (
            <p className="mt-3 text-xs text-red-400 text-center">{locMessage}</p>
          )}
          {locStatus === "success" && (
            <p className="mt-3 text-xs text-green-400 text-center">{locMessage}</p>
          )}
        </div>
      )}

      {todayDay && checkedInDayIds.has(todayDay.id) && (
        <div className="rounded-xl border border-green-400/20 bg-green-400/10 p-5 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-400">You&apos;re checked in for today!</p>
            <p className="text-xs text-green-400/60 mt-0.5">{todayDay.label}</p>
          </div>
        </div>
      )}

      {/* QR Code */}
      <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white/70">Your QR Badge</h2>
            <p className="text-xs text-white/30 mt-0.5">Show this to organizers for manual check-in</p>
          </div>
          <button
            onClick={() => setShowQr(!showQr)}
            className="flex items-center gap-2 text-xs text-[#ff9b7a] hover:text-[#ffb89e] transition-colors px-3 py-1.5 rounded-lg border border-[#ff9b7a]/20 hover:bg-[#ff9b7a]/10"
          >
            {showQr ? "Hide" : <><QrCode size={13} /> Show QR</>}
          </button>
        </div>
        {showQr && (
          <div className="flex flex-col items-center gap-3 pt-2">
            <canvas ref={canvasRef} className="rounded-xl" />
            <p className="text-xs text-white/30">{userName}</p>
          </div>
        )}
      </div>
    </div>
  );
}
