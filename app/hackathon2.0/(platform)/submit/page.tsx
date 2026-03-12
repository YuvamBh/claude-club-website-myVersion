"use client";

import { useState, useTransition, useEffect } from "react";
import { saveSubmission } from "@/lib/hackathon2.0/actions";
import {
  Github,
  Video,
  Globe,
  Presentation,
  FileText,
  Save,
  Send,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
} from "lucide-react";

const HACKATHON_ID = process.env.NEXT_PUBLIC_HACKATHON_ID ?? "hackathon_placeholder";

const STEPS = [
  { number: 1, label: "Project Info" },
  { number: 2, label: "Links" },
  { number: 3, label: "Details" },
  { number: 4, label: "Submit" },
];

interface SubmitForm {
  teamId: string;
  projectName: string;
  tagline: string;
  trackId: string;
  shortDescription: string;
  longDescription: string;
  problemStatement: string;
  solutionOverview: string;
  techStackInput: string;
  techStack: string[];
  githubUrl: string;
  demoUrl: string;
  videoUrl: string;
  presentationUrl: string;
  deploymentUrl: string;
  additionalNotes: string;
  agreedToRules: boolean;
}

export default function SubmitPage() {
  const [step, setStep] = useState(1);
  const [team, setTeam] = useState<{ id: string; name: string; tracks: { id: string; name: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCaptain, setIsCaptain] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState<SubmitForm>({
    teamId: "",
    projectName: "",
    tagline: "",
    trackId: "",
    shortDescription: "",
    longDescription: "",
    problemStatement: "",
    solutionOverview: "",
    techStackInput: "",
    techStack: [],
    githubUrl: "",
    demoUrl: "",
    videoUrl: "",
    presentationUrl: "",
    deploymentUrl: "",
    additionalNotes: "",
    agreedToRules: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/hackathon2.0/submission/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.team) {
          setTeam(data.team);
          setIsCaptain(data.isCaptain);
          if (data.submission) {
            const s = data.submission;
            setForm((prev) => ({
              ...prev,
              teamId: data.team.id,
              projectName: s.projectName ?? "",
              tagline: s.tagline ?? "",
              trackId: s.trackId ?? "",
              shortDescription: s.shortDescription ?? "",
              longDescription: s.longDescription ?? "",
              problemStatement: s.problemStatement ?? "",
              solutionOverview: s.solutionOverview ?? "",
              techStack: s.techStack ?? [],
              githubUrl: s.githubUrl ?? "",
              demoUrl: s.demoUrl ?? "",
              videoUrl: s.videoUrl ?? "",
              presentationUrl: s.presentationUrl ?? "",
              deploymentUrl: s.deploymentUrl ?? "",
              additionalNotes: s.additionalNotes ?? "",
              agreedToRules: s.agreedToRules ?? false,
            }));
            if (s.status === "SUBMITTED") setSubmitted(true);
          } else {
            setForm((prev) => ({ ...prev, teamId: data.team.id }));
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function validateStep(s: number) {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!form.projectName.trim()) errs.projectName = "Project name is required";
      if (form.shortDescription.trim().length > 500) errs.shortDescription = "Too long";
    }
    if (s === 2) {
      if (!form.githubUrl.trim()) errs.githubUrl = "GitHub URL is required";
      // Basic URL check
      try {
        if (form.githubUrl.trim()) new URL(form.githubUrl);
      } catch {
        errs.githubUrl = "Invalid URL";
      }
    }
    // Step 3 (Details) is mostly optional but we can add checks if needed
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  }

  function handleJumpToStep(target: number) {
    if (target < step) {
      setStep(target);
      return;
    }
    // Validate all steps between current and target
    for (let i = step; i < target; i++) {
      if (!validateStep(i)) return;
    }
    setStep(target);
  }

  function set<K extends keyof SubmitForm>(key: K, value: SubmitForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTechTag() {
    const tag = form.techStackInput.trim();
    if (tag && !form.techStack.includes(tag)) {
      set("techStack", [...form.techStack, tag]);
    }
    set("techStackInput", "");
  }

  function removeTechTag(tag: string) {
    set("techStack", form.techStack.filter((t) => t !== tag));
  }

  function buildPayload(submit: boolean) {
    return {
      teamId: form.teamId,
      hackathonId: HACKATHON_ID,
      projectName: form.projectName,
      tagline: form.tagline,
      trackId: form.trackId || undefined,
      shortDescription: form.shortDescription,
      longDescription: form.longDescription,
      problemStatement: form.problemStatement,
      solutionOverview: form.solutionOverview,
      techStack: form.techStack,
      githubUrl: form.githubUrl || undefined,
      demoUrl: form.demoUrl || undefined,
      videoUrl: form.videoUrl || undefined,
      presentationUrl: form.presentationUrl || undefined,
      deploymentUrl: form.deploymentUrl || undefined,
      additionalNotes: form.additionalNotes,
      agreedToRules: form.agreedToRules,
      submit,
    };
  }

  function handleSave() {
    setError("");
    startTransition(async () => {
      const result = await saveSubmission(buildPayload(false));
      if (result.success) {
        setSavedAt(new Date());
      } else {
        setError(result.error);
      }
    });
  }

  function handleSubmit() {
    setError("");
    if (!form.agreedToRules) return setError("You must agree to the rules before submitting.");
    if (!form.projectName) return setError("Project name is required.");
    if (!form.githubUrl) return setError("GitHub link is required.");
    startTransition(async () => {
      const result = await saveSubmission(buildPayload(true));
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error);
      }
    });
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-white/5 rounded animate-pulse" />
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-white/40 text-sm">You need to be on a team to submit a project.</p>
        <a
          href="/hackathon2.0/team"
          className="mt-4 text-sm text-[#ff9b7a] hover:text-[#ffb89e] transition-colors"
        >
          Go to Team →
        </a>
      </div>
    );
  }

  // Read-only logic: captains have full control, others just see.
  const isReadOnly = !isCaptain;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <CheckCircle2 size={48} className="text-green-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Project Submitted!</h2>
        <p className="text-white/40 text-sm">
          Your submission for <strong className="text-white/60">{form.projectName}</strong> is in.
          Good luck! 🎉
        </p>
        <button
          onClick={() => { setSubmitted(false); }}
          className="mt-6 text-sm text-[#ff9b7a] hover:text-[#ffb89e] transition-colors"
        >
          Edit submission
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Project Submission</h1>
              {isReadOnly && (
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-medium text-white/40 uppercase tracking-wider">
                  Read Only
                </span>
              )}
            </div>
            <p className="text-sm text-white/40 mt-1">Team: {team.name}</p>
          </div>
          {savedAt && (
            <p className="text-xs text-white/30">
              Draft saved {savedAt.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      {isReadOnly && (
        <div className="mb-6 px-4 py-3 bg-[#ff9b7a]/5 border border-[#ff9b7a]/10 rounded-lg flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#ff9b7a]/10 flex items-center justify-center shrink-0">
            <Presentation size={14} className="text-[#ff9b7a]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#ff9b7a]">Viewing as Team Member</p>
            <p className="text-xs text-white/40">Only the team captain can edit and submit the project.</p>
          </div>
        </div>
      )}

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2">
            <button
              onClick={() => handleJumpToStep(s.number)}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                step === s.number ? "text-[#ff9b7a]" : step > s.number ? "text-white/60 cursor-pointer" : "text-white/20"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step > s.number ? "bg-green-400/20 text-green-400" : step === s.number ? "bg-[#ff9b7a]/20 text-[#ff9b7a]" : "bg-white/5 text-white/30"
                }`}
              >
                {step > s.number ? "✓" : s.number}
              </span>
              <span className="hidden sm:block">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-white/10" />}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
        {/* Step 1: Project Info */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-white mb-4">Project Information</h2>
            <Field label="Project Name" error={errors.projectName} required>
              <input
                className={inputCls(!!errors.projectName)}
                placeholder="My Awesome Project"
                value={form.projectName}
                onChange={(e) => set("projectName", e.target.value)}
                readOnly={isReadOnly}
              />
            </Field>
            <Field label="Tagline">
              <input
                className={inputCls()}
                placeholder="One sentence that captures your project"
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                readOnly={isReadOnly}
              />
            </Field>
            {team.tracks && team.tracks.length > 0 && (
              <Field label="Track">
                <select
                  className={inputCls()}
                  value={form.trackId}
                  onChange={(e) => set("trackId", e.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="">Select a track</option>
                  {team.tracks.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Short Description (max 500 chars)" error={errors.shortDescription}>
              <textarea
                className={`${inputCls(!!errors.shortDescription)} min-h-[80px] resize-y`}
                placeholder="Brief overview of what your project does..."
                value={form.shortDescription}
                maxLength={500}
                onChange={(e) => set("shortDescription", e.target.value)}
                readOnly={isReadOnly}
              />
              <p className="text-xs text-white/30 mt-1 text-right">
                {form.shortDescription.length}/500
              </p>
            </Field>
            <Field label="Tech Stack">
              <div className="flex gap-2 mb-2">
                <input
                  className={inputCls()}
                  placeholder="React, Next.js, Python, etc. - press Enter"
                  value={form.techStackInput}
                  onChange={(e) => set("techStackInput", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTechTag())}
                  readOnly={isReadOnly}
                />
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={addTechTag}
                    className="shrink-0 px-3 py-2 bg-[#ff9b7a]/10 hover:bg-[#ff9b7a]/20 text-[#ff9b7a] rounded-lg transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.techStack.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs bg-white/8 text-white/60 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                    {!isReadOnly && (
                      <button onClick={() => removeTechTag(tag)} className="text-white/30 hover:text-white/60">
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </Field>
          </div>
        )}

        {/* Step 2: Links */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-white mb-4">Project Links</h2>
            <LinkField
              label="GitHub Repository"
              icon={Github}
              placeholder="https://github.com/team/project"
              value={form.githubUrl}
              error={errors.githubUrl}
              onChange={(v) => set("githubUrl", v)}
              required
              readOnly={isReadOnly}
            />
            <LinkField
              label="Demo / Live Site"
              icon={Globe}
              placeholder="https://myproject.vercel.app"
              value={form.deploymentUrl}
              onChange={(v) => set("deploymentUrl", v)}
              readOnly={isReadOnly}
            />
            <LinkField
              label="Demo Video"
              icon={Video}
              placeholder="https://youtube.com/watch?v=..."
              value={form.videoUrl}
              onChange={(v) => set("videoUrl", v)}
              readOnly={isReadOnly}
            />
            <LinkField
              label="Presentation / Slides"
              icon={FileText}
              placeholder="https://docs.google.com/presentation/..."
              value={form.presentationUrl}
              onChange={(v) => set("presentationUrl", v)}
              readOnly={isReadOnly}
            />
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-white mb-4">Project Details</h2>
            <Field label="Problem Statement">
              <textarea
                className={`${inputCls()} min-h-[100px] resize-y`}
                placeholder="What problem does your project solve?"
                value={form.problemStatement}
                onChange={(e) => set("problemStatement", e.target.value)}
                readOnly={isReadOnly}
              />
            </Field>
            <Field label="Solution Overview">
              <textarea
                className={`${inputCls()} min-h-[100px] resize-y`}
                placeholder="How does your project solve it?"
                value={form.solutionOverview}
                onChange={(e) => set("solutionOverview", e.target.value)}
                readOnly={isReadOnly}
              />
            </Field>
            <Field label="Long Description">
              <textarea
                className={`${inputCls()} min-h-[140px] resize-y`}
                placeholder="Full description of your project, architecture, challenges faced..."
                value={form.longDescription}
                onChange={(e) => set("longDescription", e.target.value)}
                readOnly={isReadOnly}
              />
            </Field>
            <Field label="Additional Notes">
              <textarea
                className={`${inputCls()} min-h-[80px] resize-y`}
                placeholder="Anything else you'd like the judges to know?"
                value={form.additionalNotes}
                onChange={(e) => set("additionalNotes", e.target.value)}
                readOnly={isReadOnly}
              />
            </Field>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-white mb-4">Review & Submit</h2>
            <ReviewRow label="Project Name" value={form.projectName} />
            <ReviewRow label="Tagline" value={form.tagline} />
            <ReviewRow label="Tech Stack" value={form.techStack.join(", ")} />
            {form.githubUrl && <ReviewRow label="GitHub" value={form.githubUrl} />}
            {form.videoUrl && <ReviewRow label="Video" value={form.videoUrl} />}
            {form.presentationUrl && <ReviewRow label="Slides" value={form.presentationUrl} />}
            {form.deploymentUrl && <ReviewRow label="Live Site" value={form.deploymentUrl} />}

            {/* Team members */}
            <div className="py-2 border-b border-white/5">
              <span className="text-xs text-white/40">Team</span>
              <span className="text-xs text-white/70 ml-4">{team.name}</span>
            </div>

            <div className="border-t border-white/10 pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-[#ff9b7a]"
                  checked={form.agreedToRules}
                  onChange={(e) => set("agreedToRules", e.target.checked)}
                  disabled={isReadOnly}
                />
                <span className="text-sm text-white/60">
                  I confirm this project was built during the hackathon and I agree to the
                  hackathon rules, judging criteria, and code of conduct.
                </span>
              </label>
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
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-white/50 border border-white/10 hover:border-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}
          {!isReadOnly && (
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-white/40 border border-white/5 hover:border-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={13} /> Save Draft
            </button>
          )}
        </div>
        {step < 4 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium bg-[#ff9b7a] hover:bg-[#ffb89e] text-black rounded-lg transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        ) : !isReadOnly && (
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium bg-[#ff9b7a] hover:bg-[#ffb89e] text-black rounded-lg transition-colors disabled:opacity-50"
          >
            <Send size={13} />
            {isPending ? "Submitting…" : "Submit Project"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inputCls(error?: boolean) {
  return `w-full bg-[#111] border ${error ? "border-red-500/50" : "border-white/10"} focus:border-[#ff9b7a]/50 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none transition-colors`;
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1.5">
        {label}
        {required && <span className="text-[#ff9b7a] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function LinkField({
  label, icon: Icon, placeholder, value, onChange, required, readOnly, error
}: {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  readOnly?: boolean;
  error?: string;
}) {
  return (
    <Field label={label} required={required} error={error}>
      <div className="flex items-center gap-2">
        <div className={`w-8 h-9 flex items-center justify-center ${error ? "text-red-400 border-red-500/50" : "text-white/20 border-white/10"} border bg-white/5 rounded-l-lg border-r-0`}>
          <Icon size={14} />
        </div>
        <input
          className={`flex-1 bg-[#111] border ${error ? "border-red-500/50" : "border-white/10"} focus:border-[#ff9b7a]/50 rounded-r-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none transition-colors`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
        />
      </div>
    </Field>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-white/5">
      <span className="text-xs text-white/40 shrink-0 w-28">{label}</span>
      <span className="text-xs text-white/70 text-right break-all">{value || "-"}</span>
    </div>
  );
}
