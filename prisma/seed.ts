/**
 * Seed script — creates the initial HackASU hackathon with tracks, rules, FAQ, and judging criteria.
 * Run with: pnpm exec tsx prisma/seed.ts
 *
 * After running, copy the printed hackathon ID into NEXT_PUBLIC_HACKATHON_ID in .env
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🌱 Seeding HackASU platform...\n");

  // ─── Hackathon ────────────────────────────────────────────────────────────
  const hackathon = await prisma.hackathon.upsert({
    where: { slug: "hackasu-2025" },
    update: {},
    create: {
      name: "HackASU 2025",
      slug: "hackasu-2025",
      tagline: "Build the future in 24 hours.",
      description:
        "HackASU is ASU Claude Builder Club's inaugural hackathon — a 24-hour sprint where students build AI-powered projects across multiple tracks. Open to all ASU students.",
      startDate: new Date("2025-11-08T11:00:00-07:00"),
      endDate: new Date("2025-11-09T11:00:00-07:00"),
      applicationDeadline: new Date("2025-11-01T23:59:00-07:00"),
      submissionDeadline: new Date("2025-11-09T09:00:00-07:00"),
      isActive: true,
      isPublished: true,
    },
  });

  console.log(`✅ Hackathon: ${hackathon.name} (id: ${hackathon.id})`);

  // ─── Tracks ───────────────────────────────────────────────────────────────
  const tracks = [
    {
      name: "AI / Machine Learning",
      description: "Build models, pipelines, or AI-native apps using LLMs, CV, or data science.",
      icon: "🤖",
      color: "#ff9b7a",
    },
    {
      name: "Web & Mobile",
      description: "Full-stack web apps, mobile experiences, or developer tools.",
      icon: "🌐",
      color: "#7ab8ff",
    },
    {
      name: "Social Good",
      description: "Technology that creates positive impact in communities or the environment.",
      icon: "🌱",
      color: "#7affb8",
    },
    {
      name: "Open Track",
      description: "No constraints — build whatever excites you.",
      icon: "⚡",
      color: "#d4a7ff",
    },
  ];

  for (const [i, track] of tracks.entries()) {
    const created = await prisma.track.upsert({
      where: { id: `track_${hackathon.id}_${i}` },
      update: {},
      create: { id: `track_${hackathon.id}_${i}`, hackathonId: hackathon.id, ...track },
    });
    console.log(`  Track: ${created.name}`);
  }

  // ─── Rules ────────────────────────────────────────────────────────────────
  const rules = [
    {
      title: "Eligibility",
      content: "Open to all currently enrolled ASU students. Teams of 1–4 members.",
    },
    {
      title: "Original Work",
      content:
        "Projects must be built during the hackathon. You may use open-source libraries, APIs, and pre-trained models, but the core project must be original.",
    },
    {
      title: "Team Size",
      content: "Teams may have 1–4 members. Solo participants are welcome.",
    },
    {
      title: "Submission",
      content:
        "A GitHub repo link is required. Demo video and presentation slides are strongly recommended.",
    },
    {
      title: "Code of Conduct",
      content:
        "All participants must adhere to ASU's academic integrity policies and treat all attendees with respect.",
    },
  ];

  for (const [i, rule] of rules.entries()) {
    await prisma.rule.upsert({
      where: { id: `rule_${hackathon.id}_${i}` },
      update: {},
      create: {
        id: `rule_${hackathon.id}_${i}`,
        hackathonId: hackathon.id,
        ...rule,
        order: i,
      },
    });
  }
  console.log(`  ${rules.length} rules created`);

  // ─── FAQ ──────────────────────────────────────────────────────────────────
  const faqs = [
    {
      question: "Do I need to be an experienced programmer?",
      answer:
        "No! We welcome all skill levels. Beginners are encouraged to apply — there will be mentors available.",
    },
    {
      question: "Can I start coding before the event?",
      answer:
        "No pre-existing code. You may plan, design, and set up boilerplate, but the core implementation must happen during the hackathon.",
    },
    {
      question: "Is there a cost to participate?",
      answer: "No, HackASU is completely free to attend.",
    },
    {
      question: "What should I bring?",
      answer:
        "Laptop, charger, student ID, and enthusiasm. Food will be provided.",
    },
    {
      question: "How are projects judged?",
      answer:
        "Projects are judged on innovation, technical execution, impact, and presentation quality.",
    },
  ];

  for (const [i, faq] of faqs.entries()) {
    await prisma.fAQ.upsert({
      where: { id: `faq_${hackathon.id}_${i}` },
      update: {},
      create: {
        id: `faq_${hackathon.id}_${i}`,
        hackathonId: hackathon.id,
        ...faq,
        order: i,
      },
    });
  }
  console.log(`  ${faqs.length} FAQs created`);

  // ─── Judging Criteria ─────────────────────────────────────────────────────
  const criteria = [
    { name: "Innovation", description: "How novel or creative is the idea?", weight: 3, maxScore: 10 },
    { name: "Technical Execution", description: "How well-built and functional is the project?", weight: 3, maxScore: 10 },
    { name: "Impact", description: "Does it solve a real problem or create value?", weight: 2, maxScore: 10 },
    { name: "Presentation", description: "How clearly is the project communicated?", weight: 2, maxScore: 10 },
  ];

  for (const [i, c] of criteria.entries()) {
    await prisma.judgingCriteria.upsert({
      where: { id: `jc_${hackathon.id}_${i}` },
      update: {},
      create: {
        id: `jc_${hackathon.id}_${i}`,
        hackathonId: hackathon.id,
        ...c,
        order: i,
      },
    });
  }
  console.log(`  ${criteria.length} judging criteria created`);

  // ─── Welcome Announcement ─────────────────────────────────────────────────
  await prisma.announcement.upsert({
    where: { id: `ann_${hackathon.id}_welcome` },
    update: {},
    create: {
      id: `ann_${hackathon.id}_welcome`,
      hackathonId: hackathon.id,
      title: "Welcome to HackASU 2025!",
      content:
        "Applications are now open. Complete your application and form your team before the deadline. Questions? Reach out on Discord.",
      isPinned: true,
      publishedAt: new Date(),
    },
  });
  console.log("  Welcome announcement created");

  console.log("\n─────────────────────────────────────────────");
  console.log("✅ Seed complete!\n");
  console.log("👉 Add this to your .env file:");
  console.log(`   NEXT_PUBLIC_HACKATHON_ID=${hackathon.id}\n`);
  console.log("👉 To set yourself as admin, run this SQL in your Neon console:");
  console.log(
    "   UPDATE hackathon_users SET role = 'ADMIN' WHERE email = 'your@asu.edu';\n"
  );
  console.log(
    "   (You must sign in to the platform once first so the row is created.)"
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
