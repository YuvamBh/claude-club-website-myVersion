"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { TeamMember } from "../../../types/team";
import { ProfileCard } from "../ui/profile-card";

// Placeholder image for members without a real photo
const PLACEHOLDER = "/staff/claude.svg";

interface TeamMemberModalProps {
  member: TeamMember | null;
  onClose: () => void;
}

export function TeamMemberModal({ member, onClose }: TeamMemberModalProps) {
  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (member) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [member]);

  return (
    <AnimatePresence>
      {member && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none"
          >
            <div
              className="relative w-full max-w-3xl rounded-3xl p-6 sm:p-10 pointer-events-auto"
              style={{
                background: "radial-gradient(ellipse at top left, color-mix(in oklab, var(--theme-text-accent) 22%, #0d0a09) 0%, #0d0a09 55%, color-mix(in oklab, var(--theme-text-accent) 10%, #0d0a09) 100%)",
                border: "1px solid var(--theme-card-border)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 hover:opacity-80"
                style={{ background: "var(--theme-card-border)", color: "var(--theme-text-primary)" }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <ProfileCard
                name={member.name}
                title={member.position}
                description={member.description}
                imageUrl={member.image.includes("claude.svg") ? PLACEHOLDER : member.image}
                linkedinUrl={member.linkedinUrl}
                websiteUrl={member.websiteUrl}
                email={member.email}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
