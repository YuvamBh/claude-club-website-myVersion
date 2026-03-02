"use client";
import { motion } from "framer-motion";
import { Linkedin, Globe, Mail } from "lucide-react";
import Link from "next/link";

export interface ProfileCardProps {
  name: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  email?: string;
}

export function ProfileCard({
  name,
  title,
  description = "No additional information provided.",
  imageUrl,
  linkedinUrl,
  websiteUrl,
  email,
}: ProfileCardProps) {
  const socials = [
    linkedinUrl && { icon: Linkedin, url: linkedinUrl, label: "LinkedIn" },
    websiteUrl && { icon: Globe, url: websiteUrl, label: "Website" },
    email && { icon: Mail, url: `mailto:${email}`, label: "Email" },
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; url: string; label: string }[];

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden md:flex relative items-center">
        {/* Photo */}
        <div
          className="w-[380px] h-[380px] rounded-2xl overflow-hidden flex-shrink-0"
          style={{ background: "var(--theme-card-bg)" }}
        >
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Overlapping card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-2xl shadow-2xl p-8 ml-[-70px] z-10 max-w-md flex-1"
          style={{
            background: "var(--theme-card-bg)",
            border: "1px solid var(--theme-card-border)",
          }}
        >
          <div className="mb-4">
            <h2
              className="text-2xl font-bold mb-1"
              style={{ color: "var(--theme-text-primary)" }}
            >
              {name}
            </h2>
            <p
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--theme-text-accent)" }}
            >
              {title}
            </p>
          </div>

          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "var(--theme-text-primary)", opacity: 0.7 }}
          >
            {description}
          </p>

          {socials.length > 0 && (
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, url, label }) => (
                <Link
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 hover:opacity-80"
                  style={{
                    background: "var(--theme-text-accent)",
                    color: "var(--theme-button-text)",
                  }}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Mobile layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="md:hidden text-center"
      >
        <div
          className="w-full aspect-square rounded-2xl overflow-hidden mb-5"
          style={{ background: "var(--theme-card-bg)" }}
        >
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        <h2
          className="text-xl font-bold mb-1"
          style={{ color: "var(--theme-text-primary)" }}
        >
          {name}
        </h2>
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-4"
          style={{ color: "var(--theme-text-accent)" }}
        >
          {title}
        </p>
        <p
          className="text-sm leading-relaxed mb-6"
          style={{ color: "var(--theme-text-primary)", opacity: 0.7 }}
        >
          {description}
        </p>

        {socials.length > 0 && (
          <div className="flex justify-center gap-3">
            {socials.map(({ icon: Icon, url, label }) => (
              <Link
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-80"
                style={{
                  background: "var(--theme-text-accent)",
                  color: "var(--theme-button-text)",
                }}
              >
                <Icon className="w-5 h-5" />
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}
