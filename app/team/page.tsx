"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiHash } from "react-icons/fi";
import { TeamMember, teamMembers } from "../../types/team";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { TeamMemberCard } from "../components/Team/TeamMemberCard";
import { TeamMemberModal } from "../components/Team/TeamMemberModal";
import { Heading, Text } from "../components/ui";
import { useCopyUrlWithHash } from "../hooks/useCopyUrlWithHash";

interface Contributor {
  name: string;
  url: string;
  image: string;
}

const contributors: Contributor[] = [
  { name: "AwesomeJaith", url: "https://github.com/AwesomeJaith", image: "https://avatars.githubusercontent.com/AwesomeJaith" },
  { name: "anmol7470", url: "https://github.com/anmol7470", image: "https://avatars.githubusercontent.com/anmol7470" },
  { name: "icedTet", url: "https://github.com/icedTet", image: "https://avatars.githubusercontent.com/icedTet" },
  { name: "shiven01", url: "https://github.com/shiven01", image: "https://avatars.githubusercontent.com/shiven01" },
  { name: "ShoryaRaj", url: "https://github.com/X-XENDROME-X", image: "https://avatars.githubusercontent.com/X-XENDROME-X" },
];

// Group members by role category
const roleGroups = [
  {
    label: "Leadership",
    roles: ["Advisor", "President", "Vice President"],
  },
  {
    label: "Technology",
    roles: ["Technology"],
  },
  {
    label: "Operations",
    roles: ["Head of Operations", "Operations + Finance", "Operations", "Business + Finance", "Community Outreach"],
  },
  {
    label: "Ambassadors",
    roles: ["Claude Builder Ambassador", "Claude Ambassador"],
  },
];

function getGroup(position: string) {
  for (const group of roleGroups) {
    if (group.roles.includes(position)) return group.label;
  }
  return "Other";
}

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 55, damping: 22, delay },
  },
});

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

export default function TeamPage() {
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  const { copyToClipboard } = useCopyUrlWithHash();

  // Build grouped member lists preserving the existing sort order
  const grouped = roleGroups.map((group) => ({
    ...group,
    members: teamMembers.filter((m) => getGroup(m.position) === group.label),
  })).filter((g) => g.members.length > 0);

  return (
    <div className="min-h-[100dvh] max-h-[100dvh] relative overflow-y-auto">
      <Header />

      {/* Profile modal */}
      <TeamMemberModal member={activeMember} onClose={() => setActiveMember(null)} />

      <div className="font-sans relative z-10">
        {/* Glow blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-[550px] h-[550px] rounded-full opacity-20 blur-[110px]" style={{ background: 'radial-gradient(circle, var(--theme-text-accent) 0%, transparent 70%)' }} />
        <div aria-hidden className="pointer-events-none absolute top-1/2 -left-32 w-[400px] h-[400px] rounded-full opacity-12 blur-[100px]" style={{ background: 'radial-gradient(circle, var(--theme-text-accent) 0%, transparent 70%)' }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-16 w-[360px] h-[360px] rounded-full opacity-15 blur-[90px]" style={{ background: 'radial-gradient(circle, var(--theme-text-accent) 0%, transparent 70%)' }} />

        {/* ── Hero ── */}
        <div className="px-4 sm:px-8 pt-16 pb-12 max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp(0)}
          >
            <span
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full border mb-5"
              style={{
                borderColor: "var(--theme-text-accent)",
                color: "var(--theme-text-accent)",
                background: "color-mix(in oklab, var(--theme-text-accent) 8%, transparent)",
              }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "var(--theme-text-accent)" }} />
              {teamMembers.length} members
            </span>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp(0.05)}>
            <Heading level="h1" animate={false} className="mb-3">
              Meet Our Team
            </Heading>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp(0.1)}>
            <Text size="lg" variant="secondary" className="max-w-xl">
              A diverse group of students and advisors passionate about AI and its
              potential to transform education and technology.
            </Text>
          </motion.div>
        </div>

        {/* ── Role sections ── */}
        <div className="px-8 sm:px-20 pb-16 max-w-7xl mx-auto space-y-20">
          {grouped.map((group, gi) => (
            <motion.section
              key={group.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeUp(gi * 0.04)}
            >
              {/* Section label */}
              <div className="flex items-center gap-4 mb-8">
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: "var(--theme-text-accent)" }}
                >
                  {group.label}
                </span>
                <div className="flex-1 h-px" style={{ background: "var(--theme-card-border)" }} />
                <span className="text-xs" style={{ color: "var(--theme-text-primary)", opacity: 0.35 }}>
                  {group.members.length}
                </span>
              </div>

              {/* Cards grid - leadership uses larger 3-col, rest 4-col */}
              <motion.div
                variants={stagger}
                className={`grid gap-x-5 gap-y-12 ${
                  group.label === "Leadership"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                }`}
              >
                {group.members.map((member) => (
                  <motion.div
                    key={member.id}
                    variants={fadeUp()}
                    className="cursor-pointer"
                    onClick={() => setActiveMember(member)}
                  >
                    <TeamMemberCard
                      member={member}
                      activeMember={null}
                      setActiveMember={() => {}}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          ))}
        </div>

        {/* ── Open Source Contributors ── */}
        <div
          className="mx-8 sm:mx-20 mb-20 rounded-2xl border px-8 py-10 max-w-7xl xl:mx-auto"
          style={{ borderColor: "var(--theme-card-border)", background: "var(--theme-card-bg)" }}
          id="open-source-contributors"
        >
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <button
                onClick={() => copyToClipboard("open-source-contributors")}
                className="group inline-flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Heading level="h2" animate={false} className="mb-1">
                  Open Source Contributors
                </Heading>
                <FiHash
                  className="text-[var(--theme-text-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-1"
                  size={22}
                />
              </button>
              <Text size="sm" variant="secondary">
                Thanks to everyone helping build and improve this project.
              </Text>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {contributors.map((contrib) => (
              <a
                key={contrib.url}
                href={contrib.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center text-center gap-3 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                style={{ borderColor: "var(--theme-card-border)", background: "color-mix(in oklab, var(--theme-card-bg) 60%, transparent)" }}
              >
                <div
                  className="w-12 h-12 rounded-full overflow-hidden border-2"
                  style={{ borderColor: "var(--theme-card-border)" }}
                >
                  <img src={contrib.image} alt={contrib.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-semibold" style={{ color: "var(--theme-text-primary)" }}>
                  {contrib.name}
                </span>
                {/* GitHub icon */}
                <svg className="w-3.5 h-3.5" style={{ color: "var(--theme-text-accent)" }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
