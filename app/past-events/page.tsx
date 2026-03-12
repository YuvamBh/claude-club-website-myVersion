"use client";

import * as React from "react";
import Header from "../components/Header";
import { Trophy, Mic, Zap, Users, BookOpen, Calendar } from "lucide-react";

// ── Event data ────────────────────────────────────────────────────
interface EventData {
  title: string;
  date: string;
  semester: string;
  description: string;
  highlights: string[];
  image: string;
  icon: React.ComponentType<any>;
}

const EVENTS: EventData[] = [
  {
    title: "Spring Hackathon - Build with Claude",
    date: "March 2025",
    semester: "Spring 2025",
    description: "60+ students prototyped AI apps with the Claude API across productivity, creative, and social-impact tracks.",
    highlights: ["60+ participants · 18 teams", "3 themed tracks + live judging", "$500 API credits for best-in-show"],
    image: "", // TODO: add event photo
    icon: Trophy,
  },
  {
    title: "Guest Talk: Responsible AI Design",
    date: "February 2025",
    semester: "Spring 2025",
    description: "An Anthropic engineer walked through Constitutional AI case studies, followed by a prompt engineering workshop.",
    highlights: ["45-min talk + open Q&A", "Hands-on prompt engineering"],
    image: "", // TODO: add event photo
    icon: Mic,
  },
];

//scroll
const SCROLL_SPEED = 0.75;
const LERP = 0.07;
const BUFFER = 3;
const MAX_VEL = 150;
const SNAP_MS = 480;
const N = EVENTS.length;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const cycleIdx = (i: number) => ((i % N) + N) % N;

//parallax
export default function PastEventsPage() {
  const [range, setRange] = React.useState({ min: -BUFFER, max: BUFFER });
  const [activeIdx, setActiveIdx] = React.useState(0);

  const s = React.useRef({
    currentY: 0,
    targetY: 0,
    isDragging: false,
    isSnapping: false,
    snap: { time: 0, from: 0, to: 0 },
    lastScroll: Date.now(),
    drag: { startClientY: 0, startScrollY: 0 },
    slideH: 0,
  });

  const bgEls = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const cardEls = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const rafRef = React.useRef<number | null>(null);
  const renderedRange = React.useRef({ min: -BUFFER, max: BUFFER });

  const applyParallax = (img: HTMLImageElement | null, scrollY: number, idx: number, h: number) => {
    if (!img) return;
    if (!img.dataset.py) img.dataset.py = "0";
    let cur = parseFloat(img.dataset.py);
    const target = (-scrollY - idx * h) * 0.15;
    cur = lerp(cur, target, 0.08);
    img.style.transform = `translateY(${cur}px) scale(1.35)`;
    img.dataset.py = String(cur);
  };

  const beginSnap = () => {
    const sc = s.current;
    const to = -Math.round(-sc.targetY / sc.slideH) * sc.slideH;
    sc.isSnapping = true;
    sc.snap = { time: Date.now(), from: sc.targetY, to };
  };

  const tickSnap = () => {
    const sc = s.current;
    const p = Math.min((Date.now() - sc.snap.time) / SNAP_MS, 1);
    const eased = 1 - (1 - p) ** 3;
    sc.targetY = sc.snap.from + (sc.snap.to - sc.snap.from) * eased;
    if (p >= 1) sc.isSnapping = false;
  };

  const applyPositions = () => {
    const sc = s.current;

    bgEls.current.forEach((el, idx) => {
      const y = idx * sc.slideH + sc.currentY;
      el.style.transform = `translateY(${y}px)`;
      applyParallax(el.querySelector("img"), sc.currentY, idx, sc.slideH);
    });

    cardEls.current.forEach((el, idx) => {
      const y = idx * sc.slideH + sc.currentY;
      el.style.transform = `translateY(${y}px)`;
    });
  };

  const loop = () => {
    const sc = s.current;
    const now = Date.now();

    if (!sc.isSnapping && !sc.isDragging && now - sc.lastScroll > 120) {
      const nearest = -Math.round(-sc.targetY / sc.slideH) * sc.slideH;
      if (Math.abs(sc.targetY - nearest) > 1) beginSnap();
    }

    if (sc.isSnapping) tickSnap();
    if (!sc.isDragging) sc.currentY += (sc.targetY - sc.currentY) * LERP;

    applyPositions();

    const current = Math.round(-sc.targetY / sc.slideH);
    const min = current - BUFFER;
    const max = current + BUFFER;

    if (min !== renderedRange.current.min || max !== renderedRange.current.max) {
      renderedRange.current = { min, max };
      setRange({ min, max });
    }

    //Update counter
    const ci = cycleIdx(current);
    setActiveIdx(ci);

    rafRef.current = requestAnimationFrame(loop);
  };

  React.useEffect(() => {
    s.current.slideH = window.innerHeight;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const sc = s.current;
      sc.isSnapping = false;
      sc.lastScroll = Date.now();
      sc.targetY -= Math.max(Math.min(e.deltaY * SCROLL_SPEED, MAX_VEL), -MAX_VEL);
    };

    const onTouchStart = (e: TouchEvent) => {
      const sc = s.current;
      sc.isDragging = true;
      sc.isSnapping = false;
      sc.drag = { startClientY: e.touches[0].clientY, startScrollY: sc.targetY };
      sc.lastScroll = Date.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      const sc = s.current;
      if (!sc.isDragging) return;
      sc.targetY = sc.drag.startScrollY + (e.touches[0].clientY - sc.drag.startClientY) * 1.5;
      sc.lastScroll = Date.now();
    };

    const onTouchEnd = () => { s.current.isDragging = false; };
    const onResize = () => { s.current.slideH = window.innerHeight; };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("resize", onResize);

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const indices: number[] = [];
  for (let i = range.min; i <= range.max; i++) indices.push(i);

  return (
    <div style={{ height: "100dvh", overflow: "hidden", position: "relative" }}>
      {/* Glow blobs */}
      <div aria-hidden style={{ pointerEvents: "none", position: "absolute", top: "-96px", right: "-96px", width: "480px", height: "480px", borderRadius: "9999px", opacity: 0.2, filter: "blur(100px)", background: "radial-gradient(circle, var(--theme-text-accent) 0%, transparent 70%)", zIndex: 0 }} />
      <div aria-hidden style={{ pointerEvents: "none", position: "absolute", bottom: "-96px", left: "-96px", width: "380px", height: "380px", borderRadius: "9999px", opacity: 0.15, filter: "blur(90px)", background: "radial-gradient(circle, var(--theme-text-accent) 0%, transparent 70%)", zIndex: 0 }} />


      {/*Sticky header*/}
      <Header />

      {/*Parallax canvas*/}
      <div
        style={{
          position: "absolute",
          inset: 0,
          top: 56, // header height (h-14 = 3.5rem = 56px)
          overflow: "hidden",
        }}
      >

        {/*Background images*/}
        {indices.map((i) => {
          const ev = EVENTS[cycleIdx(i)];
          return (
            <div
              key={`bg-${i}`}
              ref={(el) => { el ? bgEls.current.set(i, el) : bgEls.current.delete(i); }}
              style={{
                position: "absolute",
                inset: 0,
                willChange: "transform",
              }}
            >
              {/*Gradient overlay*/}
              <div style={{
                position: "absolute", inset: 0, zIndex: 1,
                background: "linear-gradient(to top, rgba(15,8,4,0.88) 0%, rgba(15,8,4,0.3) 55%, rgba(15,8,4,0.1) 100%)",
              }} />
              <div style={{
                position: "absolute", inset: 0, zIndex: 1,
                background: "linear-gradient(to right, rgba(204,120,92,0.14) 0%, transparent 55%)",
              }} />
              {ev.image ? (
                <img
                  src={ev.image}
                  alt={ev.title}
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    willChange: "transform",
                  }}
                />
              ) : (
                <div style={{ position: "absolute", inset: 0, background: "#0d0d0d" }} />
              )}
            </div>
          );
        })}

        {/*Info cards (same slide system, sit over backgrounds)*/}
        {indices.map((i) => {
          const ev = EVENTS[cycleIdx(i)];
          const Icon = ev.icon;
          const num = (cycleIdx(i) + 1).toString().padStart(2, "0");

          return (
            <div
              key={`card-${i}`}
              ref={(el) => { el ? cardEls.current.set(i, el) : cardEls.current.delete(i); }}
              style={{
                position: "absolute", inset: 0,
                zIndex: 10,
                display: "flex",
                alignItems: "flex-end",
                willChange: "transform",
                pointerEvents: "none",
              }}
            >
              {/*Card panel-bottom of screen, spanning most of the width*/}
              <div style={{
                width: "100%",
                padding: "0 clamp(1.5rem, 5vw, 4rem) clamp(2rem, 5vh, 3.5rem)",
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  gap: "2rem",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "1rem",
                  padding: "1.75rem 2.25rem",
                  boxShadow: "0 8px 48px rgba(0,0,0,0.35)",
                }}>

                  {/*Left: number + category + description*/}
                  <div>
                    <p style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "var(--theme-text-accent)", marginBottom: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                      {num} · {ev.semester}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)", marginBottom: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
                      {ev.date}
                    </p>
                    <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, maxWidth: "28ch" }}>
                      {ev.description}
                    </p>
                  </div>

                  {/*Center: thumbnail*/}
                  <div style={{
                    width: "clamp(140px, 14vw, 210px)",
                    aspectRatio: "3/4",
                    overflow: "hidden",
                    borderRadius: "0.6rem",
                    flexShrink: 0,
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}>
                    {ev.image ? (
                      <img
                        src={ev.image}
                        alt={ev.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#1c1c1c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon style={{ width: 28, height: 28, opacity: 0.3, color: "#cc785c" }} />
                      </div>
                    )}
                  </div>

                  {/*Right: title + highlights*/}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <Icon style={{ width: 16, height: 16, color: "var(--theme-text-accent)", flexShrink: 0 }} />
                    </div>
                    <h2 style={{
                      fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1.2,
                      marginBottom: "1rem",
                    }}>
                      {ev.title}
                    </h2>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "flex-end" }}>
                      {ev.highlights.map((h) => (
                        <li key={h} style={{
                          fontSize: "0.72rem",
                          color: "rgba(255,255,255,0.6)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "999px",
                          padding: "0.2rem 0.7rem",
                        }}>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            </div>
          );
        })}

        {/*Progress dots (right edge, vertical)*/}
        <div style={{
          position: "absolute", right: "1.5rem", top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          display: "flex", flexDirection: "column", gap: "0.5rem",
          pointerEvents: "none",
        }}>
          {EVENTS.map((_, i) => (
            <div key={i} style={{
              width: i === activeIdx ? 6 : 4,
              height: i === activeIdx ? 6 : 4,
              borderRadius: "50%",
              background: i === activeIdx ? "var(--theme-text-accent)" : "rgba(255,255,255,0.3)",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>

        {/*Scroll hint*/}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 5,
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem",
          opacity: 0.35,
          pointerEvents: "none",
        }}>
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.6)" }} />
        </div>

      </div>
    </div>
  );
}
