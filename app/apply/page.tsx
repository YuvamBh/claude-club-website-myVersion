"use client";

import { ArrowRight } from "lucide-react";
import { useState, Suspense, lazy } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
);

export default function ApplyLandingPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col justify-between">
        {/* Hero dithering card */}
        <section className="py-12 w-full flex justify-center items-center px-4 md:px-6 flex-1">
          <div
            className="w-full max-w-7xl relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative overflow-hidden rounded-[48px] border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] shadow-sm min-h-[600px] md:min-h-[600px] flex flex-col items-center justify-center duration-500">
              {/* Dithering shader background */}
              <Suspense fallback={<div className="absolute inset-0 bg-[var(--theme-gradient-accent)]" />}>
                <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen">
                  <Dithering
                    colorBack="#00000000"
                    colorFront="#ff9b7a"
                    shape="warp"
                    type="4x4"
                    speed={isHovered ? 0.6 : 0.2}
                    className="size-full"
                    minPixelRatio={1}
                  />
                </div>
              </Suspense>

              {/* Content */}
              <div className="relative z-10 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
                {/* Badge */}
                <div
                  className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
                  style={{
                    borderColor: "var(--theme-text-accent)",
                    color: "var(--theme-text-accent)",
                    background: "var(--theme-gradient-accent)",
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ background: "var(--theme-text-accent)" }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ background: "var(--theme-text-accent)" }}
                    />
                  </span>
                  Now Accepting Applications
                </div>

                {/* Headline */}
                <h1
                  className="font-sans text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.05]"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Shape the future<br />
                  <span style={{ color: "var(--theme-text-primary)", opacity: 0.65 }}>
                    of AI at ASU.
                  </span>
                </h1>

                {/* Description */}
                <p
                  className="text-lg md:text-xl max-w-2xl mb-12 leading-relaxed"
                  style={{ color: "var(--theme-text-primary)", opacity: 0.6 }}
                >
                  Join the ASU Claude Builder Club officer team. We&apos;re looking for passionate
                  students across Business, Technology, Industry, Operations, and Hackathon to
                  help drive our mission forward.
                </p>

                {/* CTA button */}
                <Link
                  href="/apply/form"
                  className="group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full px-12 text-base font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: "var(--theme-button-bg)",
                    color: "var(--theme-button-text)",
                  }}
                >
                  <span className="relative z-10">Apply Now</span>
                  <ArrowRight className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
