"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { Heading, Text } from "../components/ui";
import { Timeline } from "../components/ui/timeline";
import { motion } from "framer-motion";
import { Calendar, Users, Trophy, Zap, BookOpen, Mic } from "lucide-react";

function EventCard({
  title,
  date,
  description,
  highlights,
  icon: Icon,
}: {
  title: string;
  date: string;
  description: string;
  highlights?: string[];
  icon: React.ElementType;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 70, damping: 18 }}
      className="rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] p-6 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--theme-text-accent)]/15 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--theme-text-accent)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="font-semibold text-[var(--theme-text-primary)] text-base leading-snug">
              {title}
            </h4>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--theme-text-accent)]/10 text-[var(--theme-text-accent)]">
              {date}
            </span>
          </div>
          <p className="text-sm text-[var(--theme-text-primary)]/70 leading-relaxed mb-3">
            {description}
          </p>
          {highlights && highlights.length > 0 && (
            <ul className="space-y-1">
              {highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-[var(--theme-text-primary)]/60"
                >
                  <span className="text-[var(--theme-text-accent)] font-bold leading-none">
                    ✓
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PastEventsPage() {
  const timelineData = [
    {
      title: "Spring 2025",
      content: (
        <div>
          <EventCard
            icon={Trophy}
            title="Spring Hackathon — Build with Claude"
            date="March 2025"
            description="Our flagship hackathon brought together over 60 students to design and prototype AI-powered applications using Anthropic's Claude API. Teams competed across three tracks: productivity tools, creative apps, and social impact."
            highlights={[
              "60+ participants across 18 teams",
              "3 themed tracks with live judging",
              "Industry mentors from Anthropic & local tech companies",
              "Best-in-show awarded $500 in API credits",
            ]}
          />
          <EventCard
            icon={Mic}
            title="Guest Talk: Responsible AI Design"
            date="February 2025"
            description="A deep-dive seminar on aligning product decisions with responsible AI principles, featuring an Anthropic engineer who walked through real case studies of Claude's Constitutional AI approach."
            highlights={[
              "45-minute talk + open Q&A",
              "Hands-on prompt engineering workshop",
            ]}
          />
        </div>
      ),
    },
    {
      title: "Fall 2024",
      content: (
        <div>
          <EventCard
            icon={Zap}
            title="Claude API Workshop Series"
            date="October–November 2024"
            description="A three-part workshop series covering everything from basic completions to advanced tool-use and multi-turn conversations. Participants built mini-projects each session and shared them with the group."
            highlights={[
              "3 workshops, 2 hours each",
              "Hands-on coding in every session",
              "Project showcase on the final night",
              "40+ members attended at least one session",
            ]}
          />
          <EventCard
            icon={Users}
            title="Club Kickoff & Welcome Night"
            date="September 2024"
            description="Our Fall semester kickoff event welcomed new and returning members to the ASU Claude Builder Club. We shared the semester roadmap, formed project teams, and ran a speed-dating style idea pitch session."
            highlights={[
              "80+ attendees",
              "12 project ideas pitched",
              "Semester roadmap unveiled",
            ]}
          />
        </div>
      ),
    },
    {
      title: "Spring 2024",
      content: (
        <div>
          <EventCard
            icon={BookOpen}
            title="AI Reading Group — Constitutional AI"
            date="April 2024"
            description="Members gathered bi-weekly to read and discuss Anthropic's published research on Constitutional AI, RLHF, and alignment. Sessions were led by rotating student facilitators."
            highlights={[
              "6 bi-weekly sessions",
              "Research papers reviewed and summarized",
              "Open to all skill levels",
            ]}
          />
          <EventCard
            icon={Calendar}
            title="Club Founding & First Meetup"
            date="January 2024"
            description="The ASU Claude Builder Club held its very first meeting, establishing the mission, vision, and collaborative culture that defines us today. We're grateful to everyone who showed up on day one."
            highlights={[
              "25 founding members",
              "Mission & core values established",
              "Discord server launched",
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />

      <main className="flex-1 relative z-10">
        {/* Hero section */}
        <div className="font-sans px-4 pt-14 pb-4 sm:px-8 md:px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 18 }}
            className="max-w-7xl mx-auto"
          >
            <Heading level="h1" animate={false} className="mb-4">
              Past Events
            </Heading>
            <Text size="lg" variant="secondary" className="max-w-2xl">
              A look back at the workshops, hackathons, talks, and meetups that
              shaped the ASU Claude Builder Club — scroll through our journey.
            </Text>
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="font-sans px-0 sm:px-4 md:px-10">
          <Timeline data={timelineData} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
