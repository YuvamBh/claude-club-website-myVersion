"use client";

import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CalendarContainer from "./components/calendar/CalendarContainer";
import { Text } from "./components/ui";
import { ExpandOnHover } from "./components/ui/expand-cards";
import { motion } from "framer-motion";
import { RevealWaveImage } from "./components/ui/reveal-wave-image";


import { useState, useEffect, useRef } from "react";

const fade = (delay = 0) => ({
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 55, damping: 22, delay },
  },
});

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, target]);

  return (
    <span
      ref={ref}
      className="text-4xl font-black tabular-nums leading-none"
      style={{
        background: "linear-gradient(135deg, var(--theme-text-accent) 0%, color-mix(in oklab, var(--theme-text-accent) 60%, white) 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {count}{suffix}
    </span>
  );
}


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
        <section className="relative px-4 sm:px-8 md:px-16 py-24 w-full overflow-hidden">
          {/*Ambient glow blobs*/}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-16 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
            style={{ background: 'radial-gradient(circle, var(--theme-text-accent) 0%, transparent 70%)' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 bottom-0 w-[360px] h-[360px] rounded-full opacity-15 blur-3xl"
            style={{ background: 'radial-gradient(circle, var(--theme-text-accent) 0%, transparent 70%)' }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: "spring", stiffness: 50, damping: 22 }}
            className="max-w-7xl mx-auto"
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

        {/*Why Come section*/}
        <section className="relative px-4 sm:px-8 md:px-16 pt-16 pb-10 w-full">
          {/* Section label + headline */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 50, damping: 22 }}
            className="max-w-7xl mx-auto mb-10"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: "var(--theme-text-accent)" }}>
              Why Show Up
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight max-w-xl" style={{ color: "var(--theme-text-primary)" }}>
              Every event is a chance to{" "}
              <span style={{
                background: "linear-gradient(120deg, var(--theme-text-accent) 0%, color-mix(in oklab, var(--theme-text-accent) 55%, white) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                build something real.
              </span>
            </h2>
          </motion.div>

          {/* Benefit cards */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                emoji: "🧠",
                title: "Learn by doing",
                body: "No slides, no theory. Every session ends with something shipped — an app, an agent, or a working prototype using Claude.",
              },
              {
                emoji: "🤝",
                title: "Meet your people",
                body: "Find engineers, designers, and founders who are as obsessed with AI as you are. Your next collaborator is in the room.",
              },
              {
                emoji: "🚀",
                title: "Access Anthropic resources",
                body: "Free API credits, Claude Pro access, and direct lines to Anthropic's team — perks that only exist because you showed up.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 55, damping: 22, delay: i * 0.08 }}
                className="relative flex flex-col gap-3 rounded-2xl p-6 border overflow-hidden group"
                style={{
                  background: "color-mix(in oklab, var(--theme-card-bg) 75%, transparent)",
                  borderColor: "var(--theme-card-border)",
                }}
              >
                {/* Accent line */}
                <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: "linear-gradient(90deg, var(--theme-text-accent), transparent)" }} />
                {/* Hover glow */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ background: "radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--theme-text-accent) 6%, transparent), transparent 70%)" }} />

                <span className="text-3xl">{item.emoji}</span>
                <h3 className="text-base font-bold" style={{ color: "var(--theme-text-primary)" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--theme-text-primary)", opacity: 0.55 }}>{item.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/*Stats section — premium cards*/}
        <section className="relative px-4 sm:px-8 md:px-16 pb-20 w-full">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: 200, suffix: "+", label: "Active Members", sub: "Students building with Claude" },
              { value: 15,  suffix: "+", label: "Events Hosted",  sub: "Workshops, talks & build nights" },
              { value: 6,   suffix: "+", label: "Sponsors",       sub: "Industry partners & supporters" },
              { value: 24,  suffix: "h", label: "Hackathon",      sub: "24 hours of building & shipping" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ type: "spring", stiffness: 55, damping: 22, delay: i * 0.07 }}
                className="relative flex flex-col gap-2 rounded-2xl p-6 border overflow-hidden"
                style={{
                  background: "color-mix(in oklab, var(--theme-card-bg) 80%, transparent)",
                  borderColor: "var(--theme-card-border)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {/*Accent top bar*/}
                <div
                  className="absolute inset-x-0 top-0 h-[2px]"
                  style={{ background: "linear-gradient(90deg, var(--theme-text-accent), transparent)" }}
                />
                {/*Corner glow*/}
                <div
                  className="pointer-events-none absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-30 blur-2xl"
                  style={{ background: "var(--theme-text-accent)" }}
                />
                {/*Large animated number*/}
                <CountUp target={s.value} suffix={s.suffix} />
                {/*Label + sub*/}
                <p className="text-sm font-semibold leading-tight" style={{ color: "var(--theme-text-primary)" }}>
                  {s.label}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--theme-text-primary)", opacity: 0.45 }}>
                  {s.sub}
                </p>
              </motion.div>
            ))}
          </div>
        </section>


        {/*Calendar section*/}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="relative px-4 sm:px-8 md:px-16 pb-28 pt-8 overflow-hidden"
        >
          {/*Ambient glow blobs*/}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-0 w-[480px] h-[480px] rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, var(--theme-text-accent) 0%, transparent 70%)' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 bottom-0 w-[360px] h-[360px] rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, var(--theme-text-accent) 0%, transparent 70%)' }}
          />

          <div className="relative max-w-7xl mx-auto">

            {/*Section header*/}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ type: "spring", stiffness: 50, damping: 22 }}
              className="mb-12"
            >
              {/*Label row*/}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--theme-text-accent)' }}
                />
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.25em]"
                  style={{ color: 'var(--theme-text-accent)' }}
                >
                  CBC Calendar
                </span>
                <div className="flex-1 h-px" style={{ background: 'var(--theme-card-border)' }} />
              </div>

              {/*Big headline*/}
              <h2
                className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08] mb-4"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                Never miss{" "}
                <span
                  style={{
                    background: "linear-gradient(120deg, var(--theme-text-accent) 0%, color-mix(in oklab, var(--theme-text-accent) 55%, white) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  an event.
                </span>
              </h2>
              <p
                className="text-sm leading-relaxed max-w-md"
                style={{ color: 'var(--theme-text-primary)', opacity: 0.5 }}
              >
                Workshops, build sessions, and hackathons, all in one place! Subscribe to stay in the loop.
              </p>
            </motion.div>

            {/*Calendar*/}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ type: "spring", stiffness: 45, damping: 22, delay: 0.15 }}
            >
              <CalendarContainer className="w-full" />
            </motion.div>

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
