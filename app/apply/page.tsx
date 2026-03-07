"use client";

import { useState, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Heading,
  Text,
  Label,
  Input,
  Button,
  Card,
  Container,
} from "../components/ui";

const POSITIONS = [
  {
    id: "business",
    label: "Business",
    description: "Operations, partnerships, and growth strategy",
    icon: "💼",
  },
  {
    id: "technology",
    label: "Technology",
    description: "Engineering, development, and technical projects",
    icon: "💻",
  },
  {
    id: "industry",
    label: "Industry",
    description: "Industry relations and professional development",
    icon: "🏭",
  },
  {
    id: "operations",
    label: "Operations",
    description: "Logistics, events, and internal coordination",
    icon: "⚙️",
  },
  {
    id: "hackathon",
    label: "Hackathon",
    description: "Technical & non-technical roles welcome",
    icon: "🚀",
  },
];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  website: string;
  github: string;
  linkedin: string;
  positions: string[];
  resume: File | null;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  positions?: string;
  resume?: string;
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  website: "",
  github: "",
  linkedin: "",
  positions: [],
  resume: null,
};

export default function ApplyPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    if (!formData.linkedin.trim()) {
      newErrors.linkedin = "LinkedIn profile is required";
    }

    if (formData.positions.length === 0) {
      newErrors.positions = "Please select at least one position";
    }

    if (!formData.resume) {
      newErrors.resume = "Resume is required";
    } else if (formData.resume.size > 10 * 1024 * 1024) {
      newErrors.resume = "Resume must be under 10 MB";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePositionToggle = (positionId: string) => {
    setFormData((prev) => {
      const current = prev.positions;
      if (current.includes(positionId)) {
        return { ...prev, positions: current.filter((p) => p !== positionId) };
      }
      if (current.length >= 2) return prev; // max 2
      return { ...prev, positions: [...current, positionId] };
    });
    if (errors.positions) {
      setErrors((prev) => ({ ...prev, positions: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, resume: file }));
    if (errors.resume) {
      setErrors((prev) => ({ ...prev, resume: undefined }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setSubmitStatus("idle");
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

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

      const response = await fetch("/api/apply", { method: "POST", body });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData(initialFormData);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data.error || "Submission failed. Please try again.");
        setSubmitStatus("error");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh relative">
      <Header />
      <main className="py-12 sm:py-16">
        <Container size="xl" animate>
          {/*Page header*/}
          <div className="mb-12 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 border"
              style={{ borderColor: "var(--theme-text-accent)", color: "var(--theme-text-accent)", background: "var(--theme-gradient-accent)" }}>
              ✨ Now Accepting Applications
            </div>
            <Heading level="h1" animate={false}>
              Join Our Officer Team
            </Heading>
            <Text size="lg" variant="secondary" className="max-w-2xl mx-auto">
              Apply to become an officer at ASU Claude Builder Club. Select up to{" "}
              <span style={{ color: "var(--theme-text-accent)" }} className="font-semibold">two positions</span>{" "}
              you're interested in and we'll be in touch.
            </Text>
          </div>

          {/*Success state*/}
          {submitStatus === "success" && (
            <Card gradient className="mb-8 text-center py-10">
              <div className="text-5xl mb-4">🎉</div>
              <Heading level="h3" animate={false} className="mb-2">
                Application submitted!
              </Heading>
              <Text variant="secondary" className="mb-6 max-w-md mx-auto">
                Thank you for applying. The relevant team leads will review your
                application and reach out to you soon.
              </Text>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Submit another application
              </Button>
            </Card>
          )}

          {/*Error banner*/}
          {submitStatus === "error" && (
            <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          {submitStatus !== "success" && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/*Sidebar: position info*/}
              <div className="lg:col-span-1 space-y-4">
                <Card animated={false} gradient className="p-5">
                  <Text size="sm" className="font-semibold mb-3" style={{ color: "var(--theme-text-accent)" }}>
                    Open Positions
                  </Text>
                  <div className="space-y-3">
                    {POSITIONS.map((pos) => (
                      <div key={pos.id} className="flex items-start gap-3">
                        <span className="text-xl leading-none mt-0.5">{pos.icon}</span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--theme-text-primary)" }}>
                            {pos.label}
                          </p>
                          <p className="text-xs" style={{ color: "var(--theme-text-primary)", opacity: 0.6 }}>
                            {pos.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card animated={false} gradient className="p-5">
                  <Text size="sm" className="font-semibold mb-2" style={{ color: "var(--theme-text-accent)" }}>
                    Tips
                  </Text>
                  <ul className="space-y-2 text-xs" style={{ color: "var(--theme-text-primary)", opacity: 0.7 }}>
                    <li>• You may select up to <strong>2 positions</strong></li>
                    <li>• Resumes must be in PDF or DOCX format, under 10 MB</li>
                    <li>• LinkedIn profile is required</li>
                    <li>• Applications are reviewed by respective team leads</li>
                  </ul>
                </Card>
              </div>

              {/*Main form*/}
              <div className="lg:col-span-2">
                <Card animated={false} gradient>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/*Personal info*/}
                    <div>
                      <h2 className="text-base font-semibold mb-4 pb-2 border-b"
                        style={{ color: "var(--theme-text-primary)", borderColor: "var(--theme-card-border)" }}>
                        Personal Information
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName" required>Full Name</Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Jane Doe"
                            error={errors.fullName}
                            fullWidth
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" required>Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="jane@asu.edu"
                            error={errors.email}
                            fullWidth
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" required>Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 000-0000"
                            error={errors.phone}
                            fullWidth
                          />
                        </div>
                        <div>
                          <Label htmlFor="linkedin" required>LinkedIn</Label>
                          <Input
                            id="linkedin"
                            name="linkedin"
                            value={formData.linkedin}
                            onChange={handleChange}
                            placeholder="linkedin.com/in/janedoe"
                            error={errors.linkedin}
                            fullWidth
                          />
                        </div>
                        <div>
                          <Label htmlFor="github">GitHub <span className="text-xs opacity-50">(optional)</span></Label>
                          <Input
                            id="github"
                            name="github"
                            value={formData.github}
                            onChange={handleChange}
                            placeholder="github.com/janedoe"
                            fullWidth
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Personal Website <span className="text-xs opacity-50">(optional)</span></Label>
                          <Input
                            id="website"
                            name="website"
                            type="url"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://janedoe.dev"
                            fullWidth
                          />
                        </div>
                      </div>
                    </div>

                    {/*Position selection*/}
                    <div>
                      <h2 className="text-base font-semibold mb-1 pb-2 border-b"
                        style={{ color: "var(--theme-text-primary)", borderColor: "var(--theme-card-border)" }}>
                        Position Selection
                      </h2>
                      <p className="text-xs mb-4" style={{ color: "var(--theme-text-primary)", opacity: 0.6 }}>
                        Select up to 2 positions — {formData.positions.length}/2 selected
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {POSITIONS.map((pos) => {
                          const isSelected = formData.positions.includes(pos.id);
                          const isDisabled = !isSelected && formData.positions.length >= 2;
                          return (
                            <button
                              key={pos.id}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => handlePositionToggle(pos.id)}
                              className={[
                                "relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200",
                                isSelected
                                  ? "border-[var(--theme-text-accent)] bg-[var(--theme-gradient-accent)] shadow-sm"
                                  : isDisabled
                                  ? "opacity-40 cursor-not-allowed border-[var(--theme-card-border)]"
                                  : "border-[var(--theme-card-border)] hover:border-[var(--theme-text-accent)]/50 hover:bg-[var(--theme-gradient-accent)]/50",
                              ].join(" ")}
                            >
                              <div className="flex items-center justify-center w-5 h-5 mt-0.5 rounded border-2 flex-shrink-0 transition-all duration-200"
                                style={{
                                  borderColor: isSelected ? "var(--theme-text-accent)" : "var(--theme-card-border)",
                                  background: isSelected ? "var(--theme-text-accent)" : "transparent",
                                }}>
                                {isSelected && (
                                  <svg className="w-3 h-3" viewBox="0 0 12 10" fill="none">
                                    <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                      style={{ color: isSelected ? "var(--theme-card-bg)" : "transparent" }} />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold flex items-center gap-2"
                                  style={{ color: "var(--theme-text-primary)" }}>
                                  <span>{pos.icon}</span> {pos.label}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: "var(--theme-text-primary)", opacity: 0.6 }}>
                                  {pos.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {errors.positions && (
                        <p className="mt-2 text-xs text-red-400">{errors.positions}</p>
                      )}
                    </div>

                    {/*Resume upload*/}
                    <div>
                      <h2 className="text-base font-semibold mb-4 pb-2 border-b"
                        style={{ color: "var(--theme-text-primary)", borderColor: "var(--theme-card-border)" }}>
                        Resume
                      </h2>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={[
                          "relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
                          formData.resume
                            ? "border-[var(--theme-text-accent)] bg-[var(--theme-gradient-accent)]"
                            : errors.resume
                            ? "border-red-500/50 bg-red-500/5"
                            : "border-[var(--theme-card-border)] hover:border-[var(--theme-text-accent)]/50 hover:bg-[var(--theme-gradient-accent)]/50",
                        ].join(" ")}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                          id="resume"
                        />
                        {formData.resume ? (
                          <>
                            <div className="text-3xl">📄</div>
                            <div className="text-center">
                              <p className="text-sm font-semibold" style={{ color: "var(--theme-text-accent)" }}>
                                {formData.resume.name}
                              </p>
                              <p className="text-xs mt-1" style={{ color: "var(--theme-text-primary)", opacity: 0.5 }}>
                                {(formData.resume.size / (1024 * 1024)).toFixed(2)} MB — click to change
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl opacity-40">📎</div>
                            <div className="text-center">
                              <p className="text-sm font-semibold" style={{ color: "var(--theme-text-primary)" }}>
                                Click to upload your resume
                              </p>
                              <p className="text-xs mt-1" style={{ color: "var(--theme-text-primary)", opacity: 0.5 }}>
                                PDF or DOCX — max 10 MB
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      {errors.resume && (
                        <p className="mt-2 text-xs text-red-400">{errors.resume}</p>
                      )}
                    </div>

                    {/*Submit*/}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                      <Text size="xs" variant="secondary">
                        Your application is sent securely to the relevant team leads.
                      </Text>
                      <Button type="submit" disabled={isSubmitting} className="sm:min-w-[160px]">
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            </div>
          )}
        </Container>
        <div className="mt-16">
          <Footer />
        </div>
      </main>
    </div>
  );
}
