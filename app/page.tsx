"use client";

import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CalendarContainer from "./components/calendar/CalendarContainer";
import { Text } from "./components/ui";
import { ExpandOnHover } from "./components/ui/expand-cards";
import { motion } from "framer-motion";
import { RevealWaveImage } from "./components/ui/reveal-wave-image";

const fade = (delay = 0) => ({
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 55, damping: 22, delay },
  },
});

const stats = [
  { value: "200+", label: "Active Members" },
  { value: "15+", label: "Events Hosted" },
  { value: "6+", label: "Sponsors" },
  { value: "24h", label: "Hackathon" },
];

export default function Home() {
  return (
    <div className="min-h-full flex flex-col">
      <Header />

      <main className="flex-1 relative z-10 font-sans">

        {/* ── Hero: RevealWave full-screen ── */}
        <section className="relative w-full" style={{ height: "calc(100dvh - 56px)" }}>
          <RevealWaveImage
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop"
            waveSpeed={0.2}
            waveFrequency={0.7}
            waveAmplitude={0.5}
            revealRadius={0.5}
            revealSoftness={1}
            pixelSize={2}
            mouseRadius={0.4}
            className="absolute inset-0 w-full h-full"
          />
        </section>
        {/* ── Event Gallery ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 50, damping: 22, delay: 0.22 }}
          className="px-6 md:px-10 pb-16 hidden sm:block"
        >
          <ExpandOnHover />
        </motion.section>

        {/* ── Stats bar ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 50, damping: 22, delay: 0.28 }}
          className="px-6 sm:px-10 md:px-20 pb-16"
        >
          <div
            className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 rounded-2xl overflow-hidden border"
            style={{ borderColor: "var(--theme-card-border)", background: "var(--theme-card-bg)" }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.32 + i * 0.06 }}
                className="flex flex-col items-center justify-center py-7 px-4 text-center"
                style={{ borderColor: "var(--theme-card-border)" }}
              >
                <span
                  className="text-3xl font-bold tracking-tight mb-1"
                  style={{ color: "var(--theme-text-accent)" }}
                >
                  {stat.value}
                </span>
                <Text size="xs" variant="secondary" className="uppercase tracking-widest font-medium">
                  {stat.label}
                </Text>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Calendar section ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 50, damping: 22, delay: 0.4 }}
          className="px-6 sm:px-10 md:px-20 pb-20"
        >
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex items-center gap-3">
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "var(--theme-text-accent)" }}
              >
                Upcoming Events
              </span>
              <div className="flex-1 h-px" style={{ background: "var(--theme-card-border)" }} />
            </div>
            <CalendarContainer className="w-full" />
          </div>
        </motion.section>

        {/* ── Join CTA strip ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 50, damping: 22 }}
          className="px-6 sm:px-10 md:px-20 pb-24"
        >
          <div
            className="max-w-5xl mx-auto rounded-2xl border px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{ borderColor: "var(--theme-card-border)", background: "var(--theme-card-bg)" }}
          >
            <div>
              <p className="text-xl font-bold mb-1" style={{ color: "var(--theme-text-primary)" }}>
                Ready to join?
              </p>
              <p className="text-sm" style={{ color: "var(--theme-text-primary)", opacity: 0.6 }}>
                Free Claude Pro + $50 API credits · Workshops · Merch*
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="https://discord.gg/PRh8F2XebB"
                target="_blank"
                rel="noopener noreferrer"
                data-umami-event="CTA Strip - Discord"
                className="inline-flex items-center rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.03] hover:shadow-md"
                style={{ background: "var(--theme-button-bg)", color: "var(--theme-button-text)" }}
              >
                Join Discord
              </Link>
              <Link
                href="https://docs.google.com/forms/d/e/1FAIpQLScP9LuFwiHEx806tv9zczjCIEzqO1Zjb-FjB4XWoa6BS1NNKQ/viewform"
                target="_blank"
                rel="noopener noreferrer"
                data-umami-event="CTA Strip - Benefits"
                className="inline-flex items-center rounded-xl px-6 py-3 text-sm font-semibold border transition-all hover:scale-[1.03]"
                style={{ borderColor: "var(--theme-text-accent)", color: "var(--theme-text-accent)", background: "transparent" }}
              >
                Sign up for benefits
              </Link>
            </div>
          </div>
          <p className="text-center text-xs mt-3" style={{ color: "var(--theme-text-primary)", opacity: 0.4 }}>
            *Benefits require attendance at a CBC event for activation
          </p>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
}
