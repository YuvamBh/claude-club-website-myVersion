"use client";

import Header from "./components/Header";
import Footer from "./components/Footer";
import CalendarContainer from "./components/calendar/CalendarContainer";
import JoinCard from "./components/JoinCard";
import HackathonPromo from "./components/HackathonPromo";
import { showHackathonPromo } from "./theme-config";
import { Text } from "./components/ui";
import { motion } from "framer-motion";

/* ─── animation variants ─── */
const fade = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 60, damping: 20, delay },
  },
});

const fadeLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 60,
      damping: 20,
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 60,
      damping: 20,
      delay: 0.2,
    },
  },
};

const stats = [
  { value: "200+", label: "Active Members" },
  { value: "15+", label: "Events Hosted" },
  { value: "6+", label: "Sponsors" },
  { value: "24h", label: "Hackathon" },
];

export default function Home() {
  return (
    <div className="min-h-full flex flex-col relative overflow-hidden">
      {/* ── Decorative background orbs ── */}
      <div aria-hidden="true" className="pointer-events-none select-none">
        {/* Top-left warm glow */}
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
          style={{ background: "var(--theme-text-accent)" }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Bottom-right cool glow */}
        <motion.div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10"
          style={{ background: "var(--theme-text-accent)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.16, 0.08] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
        {/* Center subtle orb */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[140px] opacity-[0.06]"
          style={{ background: "var(--theme-text-accent)" }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <Header />

      {/* ── Main content ── */}
      <main className="flex-1 relative z-10 font-sans px-4 sm:px-8 md:px-16 lg:px-20 pt-10 sm:pt-14 pb-6">
        <div className="max-w-7xl mx-auto">

          {/* Hero grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">

            {/* ── LEFT: Hero copy + join card ── */}
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-8 text-center lg:text-left"
            >
              {/* Eyebrow badge */}
              <motion.div variants={fade(0)} className="flex justify-center lg:justify-start">
                <span
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full border"
                  style={{
                    borderColor: "var(--theme-text-accent)",
                    color: "var(--theme-text-accent)",
                    background: "color-mix(in oklab, var(--theme-text-accent) 10%, transparent)",
                  }}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--theme-text-accent)" }}
                  />
                  Open to all ASU students
                </span>
              </motion.div>

              {/* Headline */}
              <motion.div variants={fade(0.05)} className="space-y-4">
                <h1
                  className="text-4xl sm:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] font-bold leading-[1.08] tracking-tight text-balance"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Build real things with{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, var(--theme-text-accent), color-mix(in oklab, var(--theme-text-accent) 70%, white))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Claude AI
                  </span>{" "}
                  at ASU
                </h1>

                <p
                  className="text-lg sm:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 text-balance"
                  style={{ color: "var(--theme-text-primary)", opacity: 0.7 }}
                >
                  The Arizona State University Claude Builder Club is where curious
                  students ship{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "var(--theme-text-accent)" }}
                  >
                    production-grade AI apps
                  </span>
                  , attend exclusive workshops, and land opportunities in tech.
                </p>
              </motion.div>

              {/* Join Card */}
              <motion.div variants={fade(0.1)} className="w-full">
                <JoinCard
                  discordHref="https://discord.gg/PRh8F2XebB"
                  benefitsHref="https://docs.google.com/forms/d/e/1FAIpQLScP9LuFwiHEx806tv9zczjCIEzqO1Zjb-FjB4XWoa6BS1NNKQ/viewform"
                />
              </motion.div>

              {/* Hackathon promo */}
              {showHackathonPromo && (
                <motion.div variants={fade(0.15)}>
                  <HackathonPromo />
                </motion.div>
              )}
            </motion.div>

            {/* ── RIGHT: Calendar ── */}
            <motion.div
              variants={fadeRight}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center lg:items-start w-full"
            >
              <CalendarContainer className="w-full" />
            </motion.div>
          </div>

          {/* ── Stats bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.6 }}
            className="mt-14 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden border"
            style={{ borderColor: "var(--theme-card-border)" }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 + i * 0.07 }}
                className="flex flex-col items-center justify-center py-6 px-4 text-center gap-1"
                style={{ background: "var(--theme-card-bg)" }}
              >
                <span
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{ color: "var(--theme-text-accent)" }}
                >
                  {stat.value}
                </span>
                <Text size="xs" variant="secondary" className="uppercase tracking-widest font-medium">
                  {stat.label}
                </Text>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
