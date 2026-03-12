"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveApplication } from "@/lib/hackathon/actions";
import { CheckCircle2, Save, Send, ChevronRight, ChevronLeft, Upload } from "lucide-react";

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate", "Other"];
const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner — First hackathon or new to coding" },
  { value: "intermediate", label: "Intermediate — Some projects under my belt" },
  { value: "advanced", label: "Advanced — Shipped products or multiple hackathons" },
];

// Replace with your real hackathon ID from DB / env
const HACKATHON_ID = process.env.NEXT_PUBLIC_HACKATHON_ID ?? "hackathon_placeholder";

interface FormState {
  university: string;
  major: string;
  year: string;
  experienceLevel: string;
  desiredTracks: string[];
  priorExperience: string;
  whyJoin: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeUrl: string;
  dietaryNeeds: string;
  accessibilityNeeds: string;
  agreedToRules: boolean;
}

const defaultState: FormState = {
  university: "",
  major: "",
  year: "",
  experienceLevel: "",
  desiredTracks: [],
  priorExperience: "",
  whyJoin: "",
  linkedinUrl: "",
  githubUrl: "",
  resumeUrl: "",
  dietaryNeeds: "",
  accessibilityNeeds: "",
  agreedToRules: false,
};

const STEPS = [
  { number: 1, label: "Personal Info" },
  { number: 2, label: "Experience" },
  { number: 3, label: "Links & Resume" },
  { number: 4, label: "Review & Submit" },
];

const TRACKS = ["AI / ML", "Web & Mobile", "Fintech", "Healthcare", "Social Good", "Open Track"];

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(defaultState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleTrack(track: string) {
    set(
      "desiredTracks",
      form.desiredTracks.includes(track)
        ? form.desiredTracks.filter((t) => t !== track)
        : [...form.desiredTracks, track]
    );
  }

  function validateStep(s: number): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (s === 1) {
      if (!form.university.trim()) errs.university = "Required";
      if (!form.major.trim()) errs.major = "Required";
      if (!form.year) errs.year = "Required";
    }
    if (s === 2) {
      if (!form.experienceLevel) errs.experienceLevel = "Required";
      if (form.desiredTracks.length === 0) errs.desiredTracks = "Select at least one track";
      if (form.whyJoin.trim().length < 20) errs.whyJoin = "Please write at least 20 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) setStep((s) => s + 1);
  }

  function handleSaveDraft() {
    startTransition(async () => {
      const result = await saveApplication({ ...form, hackathonId: HACKATHON_ID, submit: false });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  function handleSubmit() {
    if (!form.agreedToRules) {
      setErrors({ agreedToRules: "You must agree to the rules" });
      return;
    }
    startTransition(async () => {
      const result = await saveApplication({ ...form, hackathonId: HACKATHON_ID, submit: true });
      if (result.success) {
        setSubmitted(true);
        setTimeout(() => router.push("/hackathon/dashboard"), 1500);
      }
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <CheckCircle2 size={48} className="text-green-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
        <p className="text-white/40 text-sm">Redirecting to dashboard…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Hackathon Application</h1>
        <p className="text-sm text-white/40 mt-1">
          Complete all steps and submit before the deadline.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2">
            <button
              onClick={() => step > s.number && setStep(s.number)}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                step === s.number
                  ? "text-[#ff9b7a]"
                  : step > s.number
                  ? "text-white/60 cursor-pointer hover:text-white/80"
                  : "text-white/20"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step > s.number
                    ? "bg-green-400/20 text-green-400"
                    : step === s.number
                    ? "bg-[#ff9b7a]/20 text-[#ff9b7a]"
                    : "bg-white/5 text-white/30"
                }`}
              >
                {step > s.number ? "✓" : s.number}
              </span>
              <span className="hidden sm:block">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className="w-6 h-px bg-white/10" />
            )}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-white mb-4">Personal Information</h2>
            <Field label="University / School" error={errors.university} required>
              <input
                className={inputCls(!!errors.university)}
                placeholder="Arizona State University"
                value={form.university}
                onChange={(e) => set("university", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Major" error={errors.major} required>
                <input
                  className={inputCls(!!errors.major)}
                  placeholder="Computer Science"
                  value={form.major}
                  onChange={(e) => set("major", e.target.value)}
                />
              </Field>
              <Field label="Year" error={errors.year} required>
                <select
                  className={inputCls(!!errors.year)}
                  value={form.year}
                  onChange={(e) => set("year", e.target.value)}
                >
                  <option value="">Select year</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y.toLowerCase()}>
                      {y}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-white mb-4">Experience & Interests</h2>
            <Field label="Experience Level" error={errors.experienceLevel} required>
              <div className="space-y-2">
                {EXPERIENCE_LEVELS.map((el) => (
                  <label
                    key={el.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.experienceLevel === el.value
                        ? "border-[#ff9b7a]/50 bg-[#ff9b7a]/5"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      className="mt-0.5 accent-[#ff9b7a]"
                      checked={form.experienceLevel === el.value}
                      onChange={() => set("experienceLevel", el.value)}
                    />
                    <span className="text-sm text-white/70">{el.label}</span>
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Desired Tracks" error={errors.desiredTracks as string} required>
              <div className="flex flex-wrap gap-2">
                {TRACKS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTrack(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      form.desiredTracks.includes(t)
                        ? "bg-[#ff9b7a]/20 border-[#ff9b7a]/50 text-[#ff9b7a]"
                        : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Why do you want to participate?" error={errors.whyJoin} required>
              <textarea
                className={`${inputCls(!!errors.whyJoin)} min-h-[100px] resize-y`}
                placeholder="Tell us what you hope to build or learn..."
                value={form.whyJoin}
                onChange={(e) => set("whyJoin", e.target.value)}
              />
              <p className="text-xs text-white/30 mt-1 text-right">{form.whyJoin.length} / 20+ chars</p>
            </Field>

            <Field label="Prior experience (optional)">
              <textarea
                className={`${inputCls(false)} min-h-[80px] resize-y`}
                placeholder="Previous projects, hackathons, or relevant experience..."
                value={form.priorExperience}
                onChange={(e) => set("priorExperience", e.target.value)}
              />
            </Field>
          </div>
        )}

        {/* Step 3: Links & Resume */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-white mb-4">Links & Resume</h2>
            <Field label="GitHub URL">
              <input
                className={inputCls(false)}
                placeholder="https://github.com/username"
                value={form.githubUrl}
                onChange={(e) => set("githubUrl", e.target.value)}
              />
            </Field>
            <Field label="LinkedIn URL">
              <input
                className={inputCls(false)}
                placeholder="https://linkedin.com/in/username"
                value={form.linkedinUrl}
                onChange={(e) => set("linkedinUrl", e.target.value)}
              />
            </Field>
            <Field label="Resume URL (Google Drive, Dropbox, etc.)">
              <input
                className={inputCls(false)}
                placeholder="https://drive.google.com/..."
                value={form.resumeUrl}
                onChange={(e) => set("resumeUrl", e.target.value)}
              />
              <p className="text-xs text-white/30 mt-1">
                Upload your resume to Google Drive or Dropbox and paste the shareable link.
                File uploads coming soon.
              </p>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Dietary needs (optional)">
                <input
                  className={inputCls(false)}
                  placeholder="Vegetarian, Vegan, etc."
                  value={form.dietaryNeeds}
                  onChange={(e) => set("dietaryNeeds", e.target.value)}
                />
              </Field>
              <Field label="Accessibility needs (optional)">
                <input
                  className={inputCls(false)}
                  placeholder="Wheelchair access, etc."
                  value={form.accessibilityNeeds}
                  onChange={(e) => set("accessibilityNeeds", e.target.value)}
                />
              </Field>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-white mb-4">Review & Submit</h2>

            <ReviewRow label="University" value={form.university} />
            <ReviewRow label="Major" value={form.major} />
            <ReviewRow label="Year" value={form.year} />
            <ReviewRow label="Experience" value={form.experienceLevel} />
            <ReviewRow label="Tracks" value={form.desiredTracks.join(", ")} />
            <ReviewRow label="Why join" value={form.whyJoin} />
            {form.githubUrl && <ReviewRow label="GitHub" value={form.githubUrl} />}
            {form.linkedinUrl && <ReviewRow label="LinkedIn" value={form.linkedinUrl} />}
            {form.resumeUrl && <ReviewRow label="Resume" value="Provided" />}

            <div className="border-t border-white/10 pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-[#ff9b7a]"
                  checked={form.agreedToRules}
                  onChange={(e) => set("agreedToRules", e.target.checked)}
                />
                <span className="text-sm text-white/60">
                  I agree to the hackathon rules and code of conduct. I understand that
                  misrepresentation of information may result in disqualification.
                </span>
              </label>
              {errors.agreedToRules && (
                <p className="text-xs text-red-400 mt-1 pl-6">{errors.agreedToRules}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-2">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}
          <button
            onClick={handleSaveDraft}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-white/40 hover:text-white/70 border border-white/5 hover:border-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={13} />
            {saved ? "Saved!" : "Save Draft"}
          </button>
        </div>

        <div>
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium bg-[#ff9b7a] hover:bg-[#ffb89e] text-black rounded-lg transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium bg-[#ff9b7a] hover:bg-[#ffb89e] text-black rounded-lg transition-colors disabled:opacity-50"
            >
              <Send size={13} />
              {isPending ? "Submitting…" : "Submit Application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return `w-full bg-[#111] border ${
    hasError ? "border-red-500/50" : "border-white/10 focus:border-[#ff9b7a]/50"
  } rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none transition-colors`;
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1.5">
        {label}
        {required && <span className="text-[#ff9b7a] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-white/5">
      <span className="text-xs text-white/40 shrink-0">{label}</span>
      <span className="text-xs text-white/70 text-right">{value || "—"}</span>
    </div>
  );
}
