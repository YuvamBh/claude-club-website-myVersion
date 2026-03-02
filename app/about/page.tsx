"use client";

import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import TextBlockAnimation from "../components/ui/text-block-animation";

const fade = (delay = 0) => ({
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 55, damping: 22, delay },
  },
});

const features = [
  {
    title: "AI Innovation",
    body: "Explore the latest developments in AI and build innovative applications using Claude's advanced capabilities.",
  },
  {
    title: "Community Learning",
    body: "A vibrant community of students passionate about AI, sharing knowledge and collaborating on exciting projects.",
  },
  {
    title: "Hands-on Projects",
    body: "Work on real-world projects that showcase the power of Claude AI and contribute to meaningful solutions.",
  },
  {
    title: "Future-Ready Skills",
    body: "Develop essential skills for the AI-driven future, preparing for careers in technology and artificial intelligence.",
  },
];

export default function About() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />

      <main className="flex-1 font-sans relative z-10">

        {/*Hero*/}
        <section className="px-6 flex flex-col items-center justify-center min-h-[70vh] max-w-4xl mx-auto text-center">
          <div className="mb-4">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--theme-text-accent)" }}
            >
              About Us
            </span>
          </div>

          <div className="w-full">
            <TextBlockAnimation
              blockColor="var(--theme-text-accent)"
              animateOnScroll={false}
              delay={0.1}
              duration={0.8}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight mb-8" style={{ color: "var(--theme-text-primary)" }}>
                About Anthropic @ ASU
              </h1>
            </TextBlockAnimation>
          </div>

          <div className="w-full max-w-3xl">
            <TextBlockAnimation blockColor="var(--theme-card-border)" stagger={0.03} delay={0.6}>
              <p className="text-lg md:text-2xl leading-relaxed" style={{ color: "var(--theme-text-primary)", opacity: 0.8 }}>
                The Arizona State University Claude Builder Club is a student-run
                organization dedicated to exploring the cutting-edge capabilities of
                Anthropic's Claude AI. We foster innovation, collaboration, and
                learning in the rapidly evolving field of artificial intelligence.
              </p>
            </TextBlockAnimation>
          </div>
        </section>

        {/*Image + Features grid*/}
        <section className="px-6 sm:px-10 md:px-20 pb-24 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.18 }}
            className="mb-12 flex justify-center"
          >
            <Image
              src="/claude-image.svg"
              alt="Claude AI illustration"
              width={320}
              height={320}
              className="w-52 h-52 sm:w-64 sm:h-64 object-contain claude-image-dark-mode opacity-80"
            />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                animate="visible"
                variants={fade(0.2 + i * 0.08)}
                className="rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderColor: "var(--theme-card-border)",
                  background: "var(--theme-card-bg)",
                }}
              >
                <h3
                  className="text-base font-semibold mb-2"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--theme-text-primary)", opacity: 0.65 }}
                >
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
