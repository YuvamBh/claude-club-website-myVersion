"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, CheckCircle2, AlertCircle, Loader2, QrCode, X } from "lucide-react";
import { adminCheckinByQr } from "@/lib/hackathon2.0/actions";
import jsQR from "jsqr";

interface ScannerClientProps {
  hackathonId: string;
  days: Array<{ id: string; label: string; date: string }>;
}

export function ScannerClient({ hackathonId, days }: ScannerClientProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>(days[0]?.id ?? "");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [lastScan, setLastScan] = useState<string | null>(null);

  // Today's day auto-select
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayDay = days.find((d) => d.date === today);
    if (todayDay) setSelectedDay(todayDay.id);
  }, [days]);

  async function startCamera() {
    setScanning(true);
    setStatus("idle");
    setMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanLoop();
      }
    } catch {
      setStatus("error");
      setMessage("Camera permission denied.");
      setScanning(false);
    }
  }

  function stopCamera() {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }

  function scanLoop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animRef.current = requestAnimationFrame(scanLoop);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);
    if (code?.data && code.data !== lastScan) {
      handleQrDetected(code.data);
    } else {
      animRef.current = requestAnimationFrame(scanLoop);
    }
  }

  async function handleQrDetected(token: string) {
    setLastScan(token);
    setMessage("Processing…");
    const result = await adminCheckinByQr(token, selectedDay, hackathonId);
    if (result.success) {
      setStatus("success");
      setMessage(`✓ ${result.data.participantName} checked in!`);
    } else {
      setStatus("error");
      setMessage(result.error ?? "Failed.");
    }
    // Resume scanning after 3s
    setTimeout(() => {
      setStatus("idle");
      setMessage("");
      setLastScan(null);
      animRef.current = requestAnimationFrame(scanLoop);
    }, 3000);
  }

  return (
    <div className="space-y-6">
      {/* Day selector */}
      <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
        <label className="block text-xs font-medium text-white/40 uppercase tracking-wide mb-2">
          Checking in for
        </label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#ff9b7a]/40"
        >
          {days.map((d) => (
            <option key={d.id} value={d.id} className="bg-[#1a1a1a]">
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Camera scanner */}
      <div className="rounded-xl border border-white/10 bg-[#1a1a1a] overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white/70">QR Scanner</h2>
            <p className="text-xs text-white/30 mt-0.5">Point camera at participant&apos;s QR badge</p>
          </div>
          {scanning && (
            <button
              onClick={stopCamera}
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {scanning ? (
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full max-h-72 object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-[#ff9b7a]/60 rounded-xl" />
            </div>
            {/* Status overlay */}
            {status !== "idle" && (
              <div
                className={`absolute inset-0 flex items-center justify-center ${
                  status === "success" ? "bg-green-400/20" : "bg-red-400/20"
                }`}
              >
                <div
                  className={`flex flex-col items-center gap-2 rounded-xl px-6 py-4 ${
                    status === "success" ? "bg-green-400/20" : "bg-red-400/20"
                  }`}
                >
                  {status === "success" ? (
                    <CheckCircle2 size={32} className="text-green-400" />
                  ) : (
                    <AlertCircle size={32} className="text-red-400" />
                  )}
                  <p
                    className={`text-sm font-semibold text-center ${
                      status === "success" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {message}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#ff9b7a]/10 flex items-center justify-center">
              <QrCode size={28} className="text-[#ff9b7a]" />
            </div>
            <button
              onClick={startCamera}
              disabled={!selectedDay}
              className="flex items-center gap-2 bg-[#ff9b7a]/10 hover:bg-[#ff9b7a]/20 border border-[#ff9b7a]/30 text-[#ff9b7a] rounded-xl px-6 py-3 text-sm font-medium transition-colors disabled:opacity-40"
            >
              <Camera size={16} />
              Start Scanning
            </button>
          </div>
        )}
      </div>

      {/* Manual token entry fallback */}
      <ManualEntry hackathonId={hackathonId} selectedDay={selectedDay} />
    </div>
  );
}

function ManualEntry({
  hackathonId,
  selectedDay,
}: {
  hackathonId: string;
  selectedDay: string;
}) {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    setStatus("loading");
    const result = await adminCheckinByQr(token.trim(), selectedDay, hackathonId);
    if (result.success) {
      setStatus("success");
      setMessage(`✓ ${result.data.participantName} checked in!`);
      setToken("");
    } else {
      setStatus("error");
      setMessage(result.error ?? "Failed.");
    }
    setTimeout(() => { setStatus("idle"); setMessage(""); }, 4000);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">
        Manual Token Entry
      </h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste QR token…"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#ff9b7a]/40"
        />
        <button
          type="submit"
          disabled={!token.trim() || status === "loading"}
          className="bg-[#ff9b7a]/10 hover:bg-[#ff9b7a]/20 text-[#ff9b7a] border border-[#ff9b7a]/30 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40"
        >
          {status === "loading" ? <Loader2 size={14} className="animate-spin" /> : "Check In"}
        </button>
      </form>
      {message && (
        <p className={`mt-2 text-xs ${status === "success" ? "text-green-400" : "text-red-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
