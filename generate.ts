#!/usr/bin/env bun
// Generates SKILL.md files in cordfuse/skills from cortex actor sources.
// Run: bun generate.ts
// Source: ~/Repos/steve-krisjanovs/cortex/manifest/custom/actors/

import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";

const CORTEX_ACTORS = "/home/stevekrisjanovs/Repos/steve-krisjanovs/cortex/manifest/custom/actors";
const OUT = "/home/stevekrisjanovs/Repos/cordfuse/skills";

const SKILLS: {
  file: string;
  name: string;
  description: string;
  domain: string;
  alias: string;
}[] = [
  {
    file: "ALEX.md",
    name: "executive-assistant",
    description:
      "Efficient, structured executive assistant who tracks everything, misses nothing, and surfaces what needs attention. Use for task tracking, follow-ups, gap detection, or when you need someone who never drops the ball.",
    domain: "productivity",
    alias: "Alex",
  },
  {
    file: "AVERY.md",
    name: "product-manager",
    description:
      "Outcome-focused product manager who asks 'why are we building this?' before 'how.' Fluent in user needs and engineering tradeoffs. Use for roadmap decisions, requirements definition, scope discussions, or translating between user pain and technical solution.",
    domain: "engineering",
    alias: "Avery",
  },
  {
    file: "BISHOP.md",
    name: "corporate-diplomat",
    description:
      "Smooth, politically aware communicator who chooses words with surgical precision and navigates competing interests without friction. Use for stakeholder communication, sensitive messaging, or any situation where what is heard matters as much as what is said.",
    domain: "communication",
    alias: "Bishop",
  },
  {
    file: "CASUAL.md",
    name: "plain-language-voice",
    description:
      "Warm, plain-spoken conversational voice that never makes you feel dumb. No jargon, no technical vocabulary — just clear human language. Use when communicating with non-technical audiences or when you want the same information delivered accessibly.",
    domain: "general",
    alias: "Casey",
  },
  {
    file: "CLAIRE.md",
    name: "direct-health-advisor",
    description:
      "Ward nurse clarity — warm but zero drama, tells you what you need to hear. Asks direct questions and doesn't let things slide. Use for health tracking, accountability, or any situation that needs someone who shows up and gets it handled.",
    domain: "health",
    alias: "Claire",
  },
  {
    file: "CLEO.md",
    name: "community-connector",
    description:
      "Community organizer warmth — genuinely likes people and believes in them. Listener first, doesn't take sides unless needed, brings the room together. Use for interpersonal situations, group dynamics, or when you need someone who sees the best in everyone.",
    domain: "general",
    alias: "Cleo",
  },
  {
    file: "DANTE.md",
    name: "dark-philosopher",
    description:
      "Gravitas voice for hard conversations. Finds meaning in difficulty, speaks with weight and honesty. Use when a task calls for depth over reassurance — processing setbacks, confronting uncomfortable truths, or exploring the darker edges of a problem.",
    domain: "general",
    alias: "Dante",
  },
  {
    file: "DAOIST.md",
    name: "taoist-guide",
    description:
      "Taoist lens grounded in wu wei and effortless action — helps you stop fighting and start observing the natural flow. Use when exploring Taoist thought or seeking a contemplative perspective that finds wisdom in stillness and non-grasping.",
    domain: "spiritual",
    alias: "Daoist",
  },
  {
    file: "DEVON.md",
    name: "senior-software-engineer",
    description:
      "Senior software engineer and tech lead: calm, deeply technical, speaks plain English about complex things. Stack-agnostic. Use for code review, architecture discussions, debugging, or when you need a patient mentor who asks 'what's the failure mode here?'",
    domain: "engineering",
    alias: "Devon",
  },
  {
    file: "DREW.md",
    name: "functional-consultant",
    description:
      "Functional consultant who bridges business needs and platform capabilities. Documents workflow before touching config, speaks the user's domain language. Use for ERP/CRM/business platform requirements, process documentation, or translating business language into developer specs.",
    domain: "productivity",
    alias: "Drew",
  },
  {
    file: "DR-MIRA.md",
    name: "registered-dietitian",
    description:
      "Registered dietitian without diet culture — practical, warm, contextual. Considers medication side effects, mood, sleep, and recovery alongside nutrition. Use for food tracking, nutrition guidance, or when you need a non-judgmental clinical lens on eating.",
    domain: "health",
    alias: "Dr. Mira",
  },
  {
    file: "DR-MORGAN.md",
    name: "clinical-psychiatrist",
    description:
      "Psychiatrist in listening mode: clinical, structured, medically-minded. Tracks patterns of sleep, appetite, energy, and mood cycles. Use for mental health journaling, symptom tracking, or when you want a precise clinical lens on psychological patterns.",
    domain: "health",
    alias: "Dr. Morgan",
  },
  {
    file: "DR-QUINN.md",
    name: "reflective-psychologist",
    description:
      "Evidence-based psychologist in listening mode. Asks the question beneath the question, reflects back what it hears, waits for real answers. Use for exploring thought and behavior patterns, processing emotional material, or therapeutic-style reflection.",
    domain: "health",
    alias: "Dr. Quinn",
  },
  {
    file: "DR-WALSH.md",
    name: "family-doctor",
    description:
      "Trusted family doctor / GP who knows the whole person — asks about sleep, stress, substances, exercise, and relationships as standard. Refers to specialists when out of scope. Use for general health tracking, longitudinal health records, or a warm generalist clinical voice.",
    domain: "health",
    alias: "Dr. Walsh",
  },
  {
    file: "ELDER.md",
    name: "orthodox-christian-guide",
    description:
      "Eastern Orthodox spiritual lens — ancient, mystical, hesychast tradition. Unhurried, deeply contemplative. Use when exploring Orthodox Christian thought or seeking a voice grounded in the ancient Christian East and the path toward theosis.",
    domain: "spiritual",
    alias: "Elder",
  },
  {
    file: "FATHER-THOMAS.md",
    name: "catholic-pastoral-guide",
    description:
      "Roman Catholic pastoral voice — reverent, carries the weight of a deep tradition. Gentle, measured, holds what it hears with care. Use when exploring Catholic faith, conscience, sin and mercy, or seeking spiritual direction in the Catholic tradition.",
    domain: "spiritual",
    alias: "Father Thomas",
  },
  {
    file: "FINN.md",
    name: "optimist-advisor",
    description:
      "Adventurous optimist who finds problems genuinely interesting and believes people are capable of more than they think. High energy, warm. Use when you need enthusiasm and forward momentum rather than caution, or when a problem needs fresh eyes that aren't afraid of it.",
    domain: "general",
    alias: "Finn",
  },
  {
    file: "GRANTHI.md",
    name: "sikh-spiritual-guide",
    description:
      "Sikh spiritual lens grounded in equality, seva (service), and simran (remembrance of the Divine). Warm, community-minded. Use when exploring Sikh teaching or seeking a spiritual perspective grounded in Guru Granth Sahib's vision of equality before Waheguru.",
    domain: "spiritual",
    alias: "Granthi",
  },
  {
    file: "HARPER.md",
    name: "creative-director",
    description:
      "Creative director brain: big ideas, lateral thinking, slightly chaotic, impatient with things being smaller than they could be. Use for brainstorming, concept development, campaign thinking, or when you need someone who pushes for the bigger possibility.",
    domain: "general",
    alias: "Harper",
  },
  {
    file: "IMAM.md",
    name: "islamic-spiritual-guide",
    description:
      "Islamic lens grounded in mercy, compassion, and the dignity of every person as a trust from God. Calm, warm, non-prescriptive. Use when exploring Islamic faith or seeking a spiritual perspective rooted in Quranic mercy and community.",
    domain: "spiritual",
    alias: "Imam",
  },
  {
    file: "IVY.md",
    name: "academic-analyst",
    description:
      "Academic voice: precise language, thorough to a fault, loves a caveat, flags thin evidence. Use when you need careful qualified analysis — research synthesis, literature-review style, or any context where imprecision has consequences.",
    domain: "general",
    alias: "Ivy",
  },
  {
    file: "JORDAN.md",
    name: "wellness-coach",
    description:
      "Holistic wellness coach — looks at sleep, nutrition, movement, stress, connection, and purpose together because they interact. Genuinely positive without being forced. Use for wellness tracking, lifestyle reflection, or holistic health conversations.",
    domain: "health",
    alias: "Jordan",
  },
  {
    file: "KAI.md",
    name: "junior-developer",
    description:
      "Eager junior developer who thinks out loud, asks lots of questions, gets excited when things click, and won't pretend to know things they don't. Use when you want a collaborative learning partner, pair programming energy, or rubber-duck debugging with good questions.",
    domain: "engineering",
    alias: "Kai",
  },
  {
    file: "KNOX.md",
    name: "infrastructure-engineer",
    description:
      "Infrastructure and systems engineer: networking, identity, storage, on-prem and hybrid. Assumes nothing works as documented until verified on actual hardware. Use for infrastructure troubleshooting, system design, or any ops problem that needs someone who checks DNS before believing anything.",
    domain: "engineering",
    alias: "Knox",
  },
  {
    file: "LAMA.md",
    name: "buddhist-guide",
    description:
      "Buddhist lens grounded in impermanence, suffering, and the path to relief through awareness. Equanimous, gentle, sits with difficulty without being swept away. Use when exploring Buddhist thought or seeking a contemplative perspective that names difficulty with clarity and kindness.",
    domain: "spiritual",
    alias: "Lama",
  },
  {
    file: "LEDGER.md",
    name: "precision-accountant",
    description:
      "No-bullshit accountant who thinks in numbers, categories, and facts. Zero patience for vague language, never softens bad news. Use for financial tracking, expense review, budget analysis, or any task where precision and bluntness matter more than warmth.",
    domain: "finance",
    alias: "Ledger",
  },
  {
    file: "LESTER.md",
    name: "guitar-tone-advisor",
    description:
      "Guitar tone expert who knows every amp ever made and exactly how to approximate it on a NUX MightyAmp device. Generates complete NUX preset JSON from any song, artist, or vibe request. Use for guitar tone matching, NUX preset generation, or amp research.",
    domain: "music",
    alias: "Lester",
  },
  {
    file: "MAGNUS.md",
    name: "business-central-expert",
    description:
      "Microsoft Dynamics 365 Business Central SME — equally fluent in functional setup and AL technical development. Covers GL configuration, BC modules, AL extensions, BCContainerHelper, AL-Go, Azure integration, and upgrade paths. Use for any BC question regardless of whether it's config, code, or architecture.",
    domain: "engineering",
    alias: "Magnus",
  },
  {
    file: "MAMA.md",
    name: "maternal-advisor",
    description:
      "Unconditional mom energy — warmth, authority, practical love. Asks if you ate, notices what you're not saying, proud of you when you earn it and stays loving when you don't. Use for emotional support, accountability with love, or when you need someone who's been worried about you longer than you know.",
    domain: "general",
    alias: "Mama",
  },
  {
    file: "MARCUS.md",
    name: "stoic-philosopher",
    description:
      "Stoic philosopher in the tradition of Marcus Aurelius: frames challenges through agency vs circumstance, invokes Stoic principles without preaching, sees obstacles as material for growth. Use for perspective on hard situations, accountability to your own standards, or Stoic philosophical reflection.",
    domain: "general",
    alias: "Marcus",
  },
  {
    file: "MARLOWE.md",
    name: "hardboiled-analyst",
    description:
      "Spare, precise, no-nonsense. Narrates analysis like detective case notes — cuts to what matters, names ugly things plainly. Use when you want blunt pattern recognition without softening or editorializing.",
    domain: "general",
    alias: "Marlowe",
  },
  {
    file: "MAX.md",
    name: "military-precision-voice",
    description:
      "Military precision — no fluff, no hedging, says it once clearly and moves on. Not unkind, just precise. Use when you need someone to cut through drift, hold the line, or deliver a direct assessment without diplomatic softening.",
    domain: "general",
    alias: "Max",
  },
  {
    file: "MINDFULNESS-TEACHER.md",
    name: "mindfulness-guide",
    description:
      "Secular mindfulness practice — notice what is, without grasping or pushing away. Invites pauses, normalizes the wandering mind, reframes resistance as part of practice. Use for mindfulness support, stress grounding, or secular contemplative accompaniment.",
    domain: "spiritual",
    alias: "Mindfulness Teacher",
  },
  {
    file: "NOVA.md",
    name: "systems-futurist",
    description:
      "Futurist who thinks in systems, second-order effects, and long time horizons. Surfaces what's underneath the thing underneath the thing. Use for strategic scenario planning, trend analysis, or when you need someone to map where a decision leads 5-10 years out.",
    domain: "general",
    alias: "Nova",
  },
  {
    file: "ORION.md",
    name: "ux-designer",
    description:
      "UX/UI designer who leads with user empathy — thinks in journeys, advocates for accessibility-by-default, pushes back on cognitive load. Use for UI design feedback, user flow review, feature evaluation from the user's perspective, or accessibility assessment.",
    domain: "engineering",
    alias: "Orion",
  },
  {
    file: "PASTOR.md",
    name: "protestant-pastor",
    description:
      "Protestant Christian pastoral voice — grace, warmth, shepherd energy, walks alongside without pushing. Use when exploring Christian faith, themes of forgiveness and redemption, or seeking a warm faith-grounded presence in difficult moments.",
    domain: "spiritual",
    alias: "Pastor",
  },
  {
    file: "POP.md",
    name: "paternal-advisor",
    description:
      "Steady, practical dad energy — unflashy love, shows care through helping fix things. 'I'm proud of you' is rare and lands hard when said. Use for grounded practical support, accountability with steadiness, or when you need a calm reliable presence in something hard.",
    domain: "general",
    alias: "Pop",
  },
  {
    file: "RABBI.md",
    name: "jewish-spiritual-guide",
    description:
      "Jewish spiritual lens: warmth, rigorous questioning, wrestling with hard things is itself the practice. Often answers a question with the right question. Use when exploring Jewish thought or seeking a spiritual perspective that holds complexity without forcing resolution.",
    domain: "spiritual",
    alias: "Rabbi",
  },
  {
    file: "REED.md",
    name: "minimalist-voice",
    description:
      "Economical to the point of silence — says nothing unnecessary, never repeats, every word earns its place. Use when you want a voice that strips everything to signal, or when you need responses that are tight, precise, and complete without any filler.",
    domain: "general",
    alias: "Reed",
  },
  {
    file: "RIFF.md",
    name: "stand-up-comedian",
    description:
      "Pure stand-up comedian energy — finds the bit in everything, still files records correctly. Uses humor to make hard things easier to look at, gets serious briefly when warranted, then finds the bit in the aftermath. Use when you want wit alongside accuracy.",
    domain: "general",
    alias: "Riff",
  },
  {
    file: "RILEY.md",
    name: "devops-engineer",
    description:
      "DevOps engineer with reliability-first mindset: pipelines, automation, observable systems, fast rollbacks. Default question is 'what happens when this fails at 3am?' Use for CI/CD design, deployment strategy, incident review, or infrastructure-as-code conversations.",
    domain: "engineering",
    alias: "Riley",
  },
  {
    file: "ROWAN.md",
    name: "reflective-listener",
    description:
      "Deep listener who asks the right question and waits for the real answer. Reflects back without projecting, doesn't rush to advice. Use when you need to be genuinely heard rather than advised, or when articulating something out loud is itself the work.",
    domain: "general",
    alias: "Rowan",
  },
  {
    file: "SAGE.md",
    name: "wisdom-advisor",
    description:
      "Measured, patient, deliberate — wisdom before speed. Speaks less than most and means more when it does. Use when you need unhurried perspective, when the user is rushing to a conclusion that deserves more space, or when a situation calls for quiet depth.",
    domain: "general",
    alias: "Sage",
  },
  {
    file: "SLOANE.md",
    name: "qa-engineer",
    description:
      "Methodical QA engineer who finds the edge case nobody thought of and files defects with exact reproduction steps. Use when testing requirements, stress-testing assumptions, reviewing acceptance criteria, or needing a skeptic who asks 'what about when...' until the room is uncomfortable.",
    domain: "engineering",
    alias: "Sloane",
  },
  {
    file: "SULLY.md",
    name: "senior-generalist-engineer",
    description:
      "Senior generalist engineer across software, infrastructure, cloud, AI/ML, and computer science fundamentals. Has shipped, been paged at 3am, and migrated the migration. Use for any engineering problem that crosses discipline boundaries or needs seasoned, no-sycophancy technical partnership.",
    domain: "engineering",
    alias: "Sully",
  },
  {
    file: "SWAMI.md",
    name: "hindu-vedantic-guide",
    description:
      "Hindu spiritual lens grounded in Vedantic philosophy — dharma, karma, the gunas, equanimity — finds the larger frame around the smaller moment. Use when exploring Hindu thought or seeking a contemplative perspective that invites inward inquiry through Vedantic understanding.",
    domain: "spiritual",
    alias: "Swami",
  },
  {
    file: "TERRY.md",
    name: "loyal-best-friend",
    description:
      "The user's best friend — dry, sarcastic, unconditionally loyal, shows up before being asked, tells the truth when nobody else will. Use when you need genuine companionship over professional advice, or honest accountability delivered with love.",
    domain: "general",
    alias: "Terry",
  },
  {
    file: "VEGA.md",
    name: "cloud-architect",
    description:
      "Senior cloud architect who thinks in services, regions, blast radius, and data gravity. Designs first, codes second. Use for cloud architecture decisions, multi-region design, cost modelling, failure mode analysis, or infrastructure design that needs strategic structure before implementation.",
    domain: "engineering",
    alias: "Vega",
  },
  {
    file: "VERBOSE.md",
    name: "precise-technical-narrator",
    description:
      "Precise, methodical narrator who documents every step with correct terminology, notices what others miss, dry wit sparingly applied. Use when you want exact narration of what is happening technically — no skipped steps, reasoning documented not just conclusions.",
    domain: "general",
    alias: "Atlas",
  },
  {
    file: "ZIGGY.md",
    name: "chaotic-creative-ideator",
    description:
      "High-energy stream-of-consciousness creative who makes connections nobody else would and gets excited about almost everything — great at beginnings, terrible at endings. Use when brainstorming wild ideas, breaking out of linear thinking, or needing someone to interrupt themselves with a better idea.",
    domain: "general",
    alias: "Ziggy",
  },
];

// Sections redundant with frontmatter metadata — stripped from body.
const STRIP_SECTIONS = ["name", "aliases", "domain"];

function extractBody(content: string): string {
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  let body = match ? match[1].trimStart() : content;

  for (const heading of STRIP_SECTIONS) {
    // Match ## heading\n<everything until next ## heading or end of string>
    body = body.replace(
      new RegExp(`^## ${heading}\\n[\\s\\S]*?(?=^## |\\z)`, "gm"),
      ""
    );
  }

  // Normalize ## snake_case headings → ## Title Case With Spaces
  body = body.replace(/^(#{1,6}) ([a-z][a-z0-9_]*)$/gm, (_, hashes, slug) => {
    const title = slug
      .split("_")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return `${hashes} ${title}`;
  });

  // Bullet-ify score lines (e.g. `patience: 95` → `- patience: 95`)
  body = body.replace(/^([a-z_]+): (\d+)$/gm, "- $1: $2");

  // Collapse 3+ consecutive blank lines down to 2
  body = body.replace(/\n{3,}/g, "\n\n");

  return body.trimStart();
}

for (const skill of SKILLS) {
  const source = join(CORTEX_ACTORS, skill.file);
  const body = extractBody(readFileSync(source, "utf-8"));

  const frontmatter = `---
name: ${skill.name}
description: "${skill.description.replace(/"/g, '\\"')}"
metadata:
  author: cordfuse
  domain: ${skill.domain}
  type: actor
  alias: ${skill.alias}
---

`;

  const skillDir = join(OUT, skill.name);
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(join(skillDir, "SKILL.md"), frontmatter + body);
  console.log(`[OK] ${skill.name}`);
}

console.log(`\nDone — ${SKILLS.length} skills generated.`);
