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

        {/*reveal wave image*/}
        <section className="relative w-full" style={{ height: "calc(100dvh - 56px)" }}>
          <RevealWaveImage
            src="/assets/Claud02.png"
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

        {/*Mission Statement*/}
        <section className="px-6 sm:px-12 md:px-24 py-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: "spring", stiffness: 50, damping: 22 }}
            className="max-w-5xl mx-auto"
          >
            {/*Label*/}
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-6"
              style={{ color: "var(--theme-text-accent)" }}
            >
              ASU × Anthropic
            </p>

            {/*Big statement*/}
            <h2
              className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.07] tracking-tight text-balance mb-6"
              style={{ color: "var(--theme-text-primary)" }}
            >
              Not a lecture. Not a club fair table.{" "}
              <span
                style={{
                  background: "linear-gradient(120deg, var(--theme-text-accent) 0%, color-mix(in oklab, var(--theme-text-accent) 55%, white) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                A place where AI gets built.
              </span>
            </h2>
            <p
              className="text-base sm:text-lg leading-relaxed max-w-2xl mb-16"
              style={{ color: "var(--theme-text-primary)", opacity: 0.55 }}
            >
              ASU's official Anthropic student club. We do workshops,
              build sessions, and a 24-hour hackathon, all centred around shipping
              real things with Claude.
            </p>

            {/*Three value pillars*/}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden border" style={{ borderColor: "var(--theme-card-border)" }}>
              {[
                {
                  num: "01",
                  title: "Anthropic-backed.",
                  body: "API credits, Claude Pro access, and direct ties to Anthropic's team. You build on the same model used by companies at scale.",
                },
                {
                  num: "02",
                  title: "Open to everyone.",
                  body: "CS, design, business, if you're curious about AI and want to build things that matter, you belong here.",
                },
                {
                  num: "03",
                  title: "Everyone ships.",
                  body: "No passive observers. Every member leaves each session having pushed something real — an app, an agent, a feature.",
                },
              ].map((p, i) => (
                <motion.div
                  key={p.num}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 55, damping: 22 }}
                  className="flex flex-col gap-4 px-7 py-8"
                  style={{ background: "var(--theme-card-bg)" }}
                >
                  <span
                    className="text-xs font-mono tracking-widest"
                    style={{ color: "var(--theme-text-accent)", opacity: 0.7 }}
                  >
                    {p.num}
                  </span>
                  <h3
                    className="text-lg font-bold"
                    style={{ color: "var(--theme-text-primary)" }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--theme-text-primary)", opacity: 0.55 }}
                  >
                    {p.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/*Event Gallery*/}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 50, damping: 22, delay: 0.22 }}
          className="pb-6 hidden sm:block"
        >
          <ExpandOnHover />
        </motion.section>

        {/*Stats inline strip*/}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="px-6 sm:px-12 md:px-24 pb-16 max-w-5xl mx-auto w-full"
        >
          <div className="h-px w-full mb-10" style={{ background: "var(--theme-card-border)" }} />
          <div className="flex flex-wrap gap-x-12 gap-y-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums" style={{ color: "var(--theme-text-accent)" }}>{stat.value}</span>
                <span className="text-xs uppercase tracking-widest" style={{ color: "var(--theme-text-primary)", opacity: 0.4 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/*Calendar section*/}
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
                CBC Calendar
              </span>
              <div className="flex-1 h-px" style={{ background: "var(--theme-card-border)" }} />
            </div>
            <CalendarContainer className="w-full" />
          </div>
        </motion.section>

        {/*Join CTA strip*/}
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
