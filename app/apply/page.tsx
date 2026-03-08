"use client";

import { useState, useRef, Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Upload, X, Briefcase, Cpu, Building2, Settings, Rocket } from "lucide-react";
import { RippleButton } from "../components/ui/ripple-button";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
);
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Heading,
  Text,
  Label,
  Input,
  Button,
  Container,
} from "../components/ui";

//Constants

const TOTAL_STEPS = 3;

const POSITIONS = [
  { id: "business",   label: "Business",   description: "Partnerships & growth strategy", icon: Briefcase },
  { id: "technology", label: "Technology", description: "Engineering & technical projects", icon: Cpu },
  { id: "industry",   label: "Industry",   description: "Industry relations & professional dev", icon: Building2 },
  { id: "operations", label: "Operations", description: "Logistics, events & coordination", icon: Settings },
  { id: "hackathon",  label: "Hackathon",  description: "Technical & non-technical roles", icon: Rocket },
] as const;

const STEPS = [
  { number: 1, label: "Personal Info" },
  { number: 2, label: "Links" },
  { number: 3, label: "Position & Resume" },
];

//Types
interface FormData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  website: string;
  positions: string[];
  resume: File | null;
}

interface Errors {
  fullName?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  positions?: string;
  resume?: string;
}

const initial: FormData = {
  fullName: "", email: "", phone: "",
  linkedin: "", github: "", website: "",
  positions: [], resume: null,
};

//Step content variants

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
};

//Main Component

export default function ApplyPage() {
  const [isHovered, setIsHovered] = useState(false);
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [formData, setFormData] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const progress = ((step - 1) / TOTAL_STEPS) * 100;

  //Field helpers
  const field = (name: keyof FormData) => ({
    name,
    value: formData[name] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(p => ({ ...p, [name]: e.target.value }));
      setErrors(p => ({ ...p, [name]: undefined }));
    },
  });

  // Phone auto-formatter — produces (XXX) XXX-XXXX
  const phoneField = {
    name: "phone" as const,
    value: formData.phone,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
      let formatted = digits;
      if (digits.length > 6)       formatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
      else if (digits.length > 3)  formatted = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
      else if (digits.length > 0)  formatted = `(${digits}`;
      setFormData(p => ({ ...p, phone: formatted }));
      setErrors(p => ({ ...p, phone: undefined }));
    },
  };

  //Validation per step
  const validateStep = (s: number): boolean => {
    const e: Errors = {};

    // Strict regex constants
    const emailRx   = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    const urlRx     = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
    const phoneDigits = formData.phone.replace(/\D/g, "");

    if (s === 1) {
      // Full name: must contain at least two words (first + last)
      const nameParts = formData.fullName.trim().split(/\s+/);
      if (nameParts.length < 2 || nameParts.some(p => p.length < 1))
        e.fullName = "Please enter your first and last name";

      // Email
      if (!formData.email.trim())                     e.email = "Required";
      else if (!emailRx.test(formData.email.trim()))  e.email = "Enter a valid email address";

      // Phone: exactly 10 digits
      if (!formData.phone.trim())     e.phone = "Required";
      else if (phoneDigits.length !== 10) e.phone = "Enter a valid 10-digit phone number";
    }

    if (s === 2) {
      // LinkedIn — required, must be a valid URL
      if (!formData.linkedin.trim())                     e.linkedin = "LinkedIn URL is required";
      else if (!urlRx.test(formData.linkedin.trim()))    e.linkedin = "Enter a valid URL (include https://)";

      // GitHub — optional, but if provided must be valid URL  
      if (formData.github.trim() && !urlRx.test(formData.github.trim()))
        e.github = "Enter a valid URL (include https://)";

      // Website — optional, but if provided must be valid URL
      if (formData.website.trim() && !urlRx.test(formData.website.trim()))
        e.website = "Enter a valid URL (include https://)";
    }

    if (s === 3) {
      if (formData.positions.length === 0) e.positions = "Select at least one position";
      if (!formData.resume) e.resume = "Resume is required";
      else if (formData.resume.size > 10 * 1024 * 1024) e.resume = "Max 10 MB";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    if (step < TOTAL_STEPS) {
      setDir(1);
      setStep(s => s + 1);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    setDir(-1);
    setStep(s => s - 1);
  };

  const togglePos = (id: string) => {
    setFormData(p => {
      const cur = p.positions;
      if (cur.includes(id)) return { ...p, positions: cur.filter(x => x !== id) };
      if (cur.length >= 2) return p;
      return { ...p, positions: [...cur, id] };
    });
    setErrors(p => ({ ...p, positions: undefined }));
  };

  //Submit
  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setIsSubmitting(true);

    try {
      const body = new FormData();
      body.append("fullName", formData.fullName.trim());
      body.append("email", formData.email.trim());
      body.append("phone", formData.phone.trim());
      body.append("website", formData.website.trim());
      body.append("github", formData.github.trim());
      body.append("linkedin", formData.linkedin.trim());
      body.append("positions", JSON.stringify(formData.positions));
      if (formData.resume) body.append("resume", formData.resume);

      const res = await fetch("/api/apply", { method: "POST", body });
      if (res.ok) {
        setSubmitStatus("success");
      } else {
        const d = await res.json().catch(() => ({}));
        setErrorMsg(d.error || "Submission failed. Please try again.");
        setSubmitStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Check your connection and try again.");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setFormData(initial);
    setErrors({});
    setSubmitStatus("idle");
    setErrorMsg("");
    setStep(1);
    setDir(1);
    if (fileRef.current) fileRef.current.value = "";
  };

  //Success screen
  if (submitStatus === "success") {
    return (
      <div className="min-h-dvh flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "var(--theme-gradient-accent)", border: "2px solid var(--theme-text-accent)" }}
            >
              <CheckCircle2 className="w-10 h-10" style={{ color: "var(--theme-text-accent)" }} />
            </motion.div>
            <Heading level="h2" animate={false} className="mb-3">Application Submitted!</Heading>
            <Text variant="secondary" className="mb-8">
              Thank you for applying. We will review your application and reach out soon.
            </Text>
            <Button onClick={reset} variant="secondary">Submit Another Application</Button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  //Main form
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1 py-12 sm:py-16">
        <Container size="xl" animate>

          {/*Page title with Dithering background*/}
          <div
            className="text-center mb-10 space-y-3 relative rounded-3xl overflow-hidden py-12 px-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/*Dithering shader background*/}
            <Suspense fallback={null}>
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30 dark:opacity-25 mix-blend-multiply dark:mix-blend-screen">
                <Dithering
                  colorBack="#00000000"
                  colorFront="#ff9b7a"
                  shape="warp"
                  type="4x4"
                  speed={isHovered ? 0.8 : 0.15}
                  className="size-full"
                  minPixelRatio={1}
                />
              </div>
            </Suspense>

            {/*Content*/}
            <div className="relative z-10">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border mb-4"
                style={{ borderColor: "var(--theme-text-accent)", color: "var(--theme-text-accent)", background: "var(--theme-gradient-accent)" }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--theme-text-accent)" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--theme-text-accent)" }} />
                </span>
                Applications Open!
              </div>
              <Heading level="h1" animate={false}>Join the Team</Heading>
              <Text size="lg" variant="secondary" className="max-w-xl mx-auto mt-2">
                We&apos;re looking for ambitious, driven students who want to shape the future of AI at ASU!
              </Text>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">

            {/*Card*/}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ background: "var(--theme-card-bg)", borderColor: "var(--theme-card-border)" }}
            >
              {/*Progress header*/}
              <div className="px-6 pt-6 pb-5 border-b" style={{ borderColor: "var(--theme-card-border)" }}>
                {/*Step pills*/}
                <div className="flex items-center gap-2 mb-5">
                  {STEPS.map((s, i) => (
                    <div key={s.number} className="flex items-center gap-2 flex-1 last:flex-none">
                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                          style={{
                            background: s.number < step ? "var(--theme-text-accent)" : s.number === step ? "var(--theme-gradient-accent)" : "transparent",
                            border: `2px solid ${s.number <= step ? "var(--theme-text-accent)" : "var(--theme-card-border)"}`,
                            color: s.number < step ? "var(--theme-card-bg)" : s.number === step ? "var(--theme-text-accent)" : "var(--theme-text-primary)",
                          }}
                        >
                          {s.number < step ? <CheckCircle2 className="w-4 h-4" /> : s.number}
                        </div>
                        <span
                          className="text-xs font-medium hidden sm:block"
                          style={{ color: s.number === step ? "var(--theme-text-accent)" : "var(--theme-text-primary)", opacity: s.number === step ? 1 : 0.5 }}
                        >
                          {s.label}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="flex-1 h-px transition-all duration-500" style={{ background: step > s.number ? "var(--theme-text-accent)" : "var(--theme-card-border)" }} />
                      )}
                    </div>
                  ))}
                </div>

                {/*Progress bar*/}
                <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "var(--theme-card-border)" }}>
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: "var(--theme-text-accent)" }}
                    animate={{ width: `${progress + (100 / TOTAL_STEPS)}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <Text size="xs" variant="secondary" className="font-medium">
                    Step {step} of {TOTAL_STEPS} : {STEPS[step - 1].label}
                  </Text>
                  <Text size="xs" variant="secondary">{Math.round(progress + 100 / TOTAL_STEPS)}% complete</Text>
                </div>
              </div>

              {/*Step content*/}
              <div className="px-6 py-6 min-h-[340px]">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={step}
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >

                    {/*Step 1: Personal Info*/}
                    {step === 1 && (
                      <div className="space-y-5">
                        <div>
                          <Text size="sm" className="font-semibold mb-4" style={{ color: "var(--theme-text-accent)" }}>
                            Tell us about yourself
                          </Text>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="fullName" required>Full Name</Label>
                            <Input id="fullName" placeholder="Jane Doe" error={errors.fullName} fullWidth {...field("fullName")} />
                          </div>
                          <div>
                            <Label htmlFor="email" required>Email</Label>
                            <Input id="email" type="email" placeholder="jane@asu.edu" error={errors.email} fullWidth {...field("email")} />
                          </div>
                          <div className="sm:col-span-2">
                            <Label htmlFor="phone" required>Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="(555) 555-5555" error={errors.phone} fullWidth {...phoneField} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/*Step 2: Links*/}
                    {step === 2 && (
                      <div className="space-y-5">
                        <div>
                          <Text size="sm" className="font-semibold mb-4" style={{ color: "var(--theme-text-accent)" }}>
                            Your online presence
                          </Text>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="linkedin" required>LinkedIn Profile</Label>
                            <div className="relative">
                              <Input
                                id="linkedin"
                                placeholder="https://linkedin.com/in/janedoe"
                                error={errors.linkedin}
                                fullWidth
                                {...field("linkedin")}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="github">
                              GitHub <span className="text-xs opacity-40 font-normal">(optional)</span>
                            </Label>
                            <Input id="github" placeholder="https://github.com/janedoe" error={errors.github} fullWidth {...field("github")} />
                          </div>
                          <div>
                            <Label htmlFor="website">
                              Personal Website <span className="text-xs opacity-40 font-normal">(optional)</span>
                            </Label>
                            <Input id="website" type="url" placeholder="https://janedoe.dev" error={errors.website} fullWidth {...field("website")} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/*Step 3: Position + Resume*/}
                    {step === 3 && (
                      <div className="space-y-6">

                        {/*Positions*/}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Text size="sm" className="font-semibold" style={{ color: "var(--theme-text-accent)" }}>
                              Select position(s)
                            </Text>
                            <Text size="xs" variant="secondary">{formData.positions.length}/2 selected</Text>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {POSITIONS.map(pos => {
                              const Icon = pos.icon;
                              const selected = formData.positions.includes(pos.id);
                              const disabled = !selected && formData.positions.length >= 2;
                              return (
                                <button
                                  key={pos.id}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => togglePos(pos.id)}
                                  className={[
                                    "flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200",
                                    selected ? "shadow-sm" : disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-[1.02]",
                                  ].join(" ")}
                                  style={{
                                    borderColor: selected ? "var(--theme-text-accent)" : "var(--theme-card-border)",
                                    background: selected ? "var(--theme-gradient-accent)" : "transparent",
                                  }}
                                >
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: selected ? "var(--theme-text-accent)" : "var(--theme-card-border)" }}
                                  >
                                    <Icon className="w-4 h-4" style={{ color: selected ? "var(--theme-card-bg)" : "var(--theme-text-primary)" }} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold" style={{ color: "var(--theme-text-primary)" }}>{pos.label}</p>
                                    <p className="text-xs truncate" style={{ color: "var(--theme-text-primary)", opacity: 0.55 }}>{pos.description}</p>
                                  </div>
                                  {selected && (
                                    <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: "var(--theme-text-accent)" }} />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {errors.positions && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-xs text-red-400">
                              {errors.positions}
                            </motion.p>
                          )}
                        </div>

                        {/*Resume upload*/}
                        <div>
                          <Label htmlFor="resume" required>Resume</Label>
                          <div
                            onClick={() => fileRef.current?.click()}
                            className={[
                              "relative mt-1 flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
                              formData.resume ? "hover:opacity-80" : "hover:scale-[1.01]",
                            ].join(" ")}
                            style={{
                              borderColor: formData.resume ? "var(--theme-text-accent)" : errors.resume ? "rgb(239 68 68 / 0.5)" : "var(--theme-card-border)",
                              background: formData.resume ? "var(--theme-gradient-accent)" : "transparent",
                            }}
                          >
                            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={e => {
                              const f = e.target.files?.[0] ?? null;
                              setFormData(p => ({ ...p, resume: f }));
                              setErrors(p => ({ ...p, resume: undefined }));
                            }} className="hidden" id="resume" />

                            {formData.resume ? (
                              <>
                                <div className="flex items-center gap-3 w-full">
                                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--theme-text-accent)" }}>
                                    <Upload className="w-5 h-5" style={{ color: "var(--theme-card-bg)" }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: "var(--theme-text-accent)" }}>{formData.resume.name}</p>
                                    <p className="text-xs" style={{ color: "var(--theme-text-primary)", opacity: 0.5 }}>{(formData.resume.size / (1024 * 1024)).toFixed(2)} MB · Click to change</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); setFormData(p => ({ ...p, resume: null })); if (fileRef.current) fileRef.current.value = ""; }}
                                    className="p-1 rounded-full shrink-0 hover:opacity-70"
                                    style={{ background: "var(--theme-text-accent)" }}
                                  >
                                    <X className="w-3 h-3" style={{ color: "var(--theme-card-bg)" }} />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--theme-card-border)" }}>
                                  <Upload className="w-5 h-5" style={{ color: "var(--theme-text-primary)", opacity: 0.5 }} />
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium" style={{ color: "var(--theme-text-primary)" }}>Click to upload your resume</p>
                                  <p className="text-xs mt-0.5" style={{ color: "var(--theme-text-primary)", opacity: 0.45 }}>PDF or DOCX · max 10 MB</p>
                                </div>
                              </>
                            )}
                          </div>
                          {errors.resume && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-400">
                              {errors.resume}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>

              {/*Footer / Navigation*/}
              <div
                className="px-6 py-4 border-t flex items-center justify-between"
                style={{ borderColor: "var(--theme-card-border)", background: "var(--theme-card-gradient-end)" }}
              >
                <div>
                  {step > 1 ? (
                    <RippleButton variant="ghost" onClick={goBack}>
                      <ArrowLeft className="w-4 h-4" /> Back
                    </RippleButton>
                  ) : (
                    <Text size="xs" variant="secondary">
                      Reviewed within 5 business days.
                    </Text>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {submitStatus === "error" && (
                    <Text size="xs" className="text-red-400 max-w-[200px] text-right">{errorMsg}</Text>
                  )}
                  <RippleButton onClick={goNext} disabled={isSubmitting}>
                    {step < TOTAL_STEPS ? (
                      <>{STEPS[step].label}<ArrowRight className="w-4 h-4" /></>
                    ) : isSubmitting ? (
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        Submitting…
                      </motion.span>
                    ) : (
                      "Submit Application"
                    )}
                  </RippleButton>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </main>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
