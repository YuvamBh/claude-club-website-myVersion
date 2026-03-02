"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 20,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 15,
    },
  },
};

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Team", href: "/team" },
  { label: "Industry", href: "/industry" },
  { label: "Past Events", href: "/past-events" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  {
    label: "Discord",
    href: "https://discord.gg/PRh8F2XebB",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/shiven01/asucbc",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.31-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.53-1.52.12-3.17 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4 1.02 0 2.05.13 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.69.8.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <motion.footer
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="relative z-10 border-t border-[var(--theme-card-border)] mt-8"
    >
      {/* Subtle top glow line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, var(--theme-text-accent), transparent)",
          opacity: 0.4,
        }}
      />

      {/*Mobile footer: compact bar*/}
      <div className="sm:hidden px-6 py-6 space-y-5">
        {/*Brand + socials row*/}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold tracking-wide text-[var(--theme-text-primary)] uppercase">
            ASU Claude Builder Club
          </span>
          <div className="flex items-center gap-2">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="p-2 rounded-lg text-[var(--theme-text-primary)]/60 hover:text-[var(--theme-text-accent)] transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
        {/* Nav links grid */}
        <div className="grid grid-cols-3 gap-y-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--theme-text-primary)]/60 hover:text-[var(--theme-text-accent)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        {/*Copyright*/}
        <p className="text-xs text-[var(--theme-text-primary)]/35 pt-1 border-t border-[var(--theme-card-border)]">
          © {new Date().getFullYear()} ASU Claude Builder Club
        </p>
      </div>

      <div className="hidden sm:block max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 sm:gap-12">
          {/*Column 1 — Brand*/}
          <motion.div variants={itemVariants} className="space-y-3 text-center sm:text-left pb-6 sm:pb-0 border-b border-[var(--theme-card-border)] sm:border-b-0">
            <p className="text-sm font-bold tracking-wide text-[var(--theme-text-primary)] uppercase">
              ASU Claude Builder Club
            </p>
            <p className="text-xs text-[var(--theme-text-primary)]/60 leading-relaxed max-w-xs mx-auto sm:mx-0">
              Building the next generation of AI-native products at Arizona State
              University.
            </p>
            {/*Social icons*/}
            <div className="flex items-center gap-3 pt-1 justify-center sm:justify-start">
              {socialLinks.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg text-[var(--theme-text-primary)]/60 hover:text-[var(--theme-text-accent)] hover:bg-[var(--theme-text-accent)]/10 transition-colors duration-200"
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/*Column 2 — Quick Links*/}
          <motion.div variants={itemVariants} className="space-y-3 text-center sm:text-left py-6 sm:py-0 border-b border-[var(--theme-card-border)] sm:border-b-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--theme-text-primary)]/50">
              Quick Links
            </p>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--theme-text-primary)]/70 hover:text-[var(--theme-text-accent)] transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-[var(--theme-text-accent)] transition-all duration-200 rounded hidden sm:inline-block" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/*Column 3 — Sponsor CTA*/}
          <motion.div variants={itemVariants} className="space-y-3 text-center sm:text-left pt-6 sm:pt-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--theme-text-primary)]/50">
              Partner With Us
            </p>
            <p className="text-xs text-[var(--theme-text-primary)]/60 leading-relaxed">
              Interested in sponsoring our events or partnering with our club?
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex justify-center sm:justify-start">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--theme-text-accent)] hover:underline underline-offset-4 transition-all duration-200"
              >
                Get in touch
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/*Bottom bar*/}
        <motion.div
          variants={itemVariants}
          className="mt-8 pt-6 border-t border-[var(--theme-card-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--theme-text-primary)]/40 text-center"
        >
          <span>© {new Date().getFullYear()} ASU Claude Builder Club. All rights reserved.</span>
          <motion.a
            href="https://github.com/shiven01/asucbc"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 hover:text-[var(--theme-text-accent)] transition-colors duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.31-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.53-1.52.12-3.17 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4 1.02 0 2.05.13 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.69.8.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z" />
            </svg>
            Open Source
          </motion.a>
        </motion.div>
      </div>
    </motion.footer>
  );
}
