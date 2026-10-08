import { countryName, fieldLabel, levelLabel, type CountryId, type FieldId, type LevelId, type Source } from "./data";
import { QUALIFY_THRESHOLD, bestScore, fmtScore, getMatches, type EnglishTest, type Match, type MatchInput } from "./match";

export type StepId =
  | "name" | "country" | "level" | "interest" | "academic" | "contact"
  | "documents" | "matches" | "handoff" | "done" | "nurture";

export type QuestId =
  | "country" | "level" | "interest" | "academic" | "contact"
  | "transcript" | "english" | "matches" | "shortlist" | "handoff";

export const QUESTS: { id: QuestId; label: string; xp: number }[] = [
  { id: "country", label: "Choose your destination", xp: 10 },
  { id: "level", label: "Select your study level", xp: 5 },
  { id: "interest", label: "Pick your intake and field", xp: 5 },
  { id: "academic", label: "Share your academic profile", xp: 10 },
  { id: "contact", label: "Secure your profile", xp: 5 },
  { id: "transcript", label: "Verify your transcript", xp: 15 },
  { id: "english", label: "Verify your English score", xp: 15 },
  { id: "matches", label: "Unlock your university matches", xp: 5 },
  { id: "shortlist", label: "Shortlist 3 universities", xp: 10 },
  { id: "handoff", label: "Meet your counsellor", xp: 20 },
];
export const MAX_XP = QUESTS.reduce((n, q) => n + q.xp, 0); // 100

export type BadgeId = "explorer" | "profile" | "qualified" | "shortlister" | "ready";
export const BADGES: { id: BadgeId; label: string; how: string; needs: QuestId[] }[] = [
  { id: "explorer", label: "Explorer", how: "Choose a destination", needs: ["country"] },
  { id: "profile", label: "Profile Complete", how: "Finish your profile", needs: ["country", "level", "interest", "academic", "contact"] },
  { id: "qualified", label: "Qualification Ready", how: "Verify both documents", needs: ["transcript", "english"] },
  { id: "shortlister", label: "Shortlister", how: "Shortlist 3 universities", needs: ["shortlist"] },
  { id: "ready", label: "Ready to Apply", how: "Meet your counsellor", needs: ["handoff"] },
];

export const LEVEL_TITLES = ["Newcomer", "Explorer", "Achiever", "Scholar", "Ready"];
export const levelFor = (xp: number) => Math.min(5, Math.floor(xp / 25) + 1);

export interface Profile {
  name: string;
  country?: CountryId;
  level?: LevelId;
  intake?: string;
  field?: FieldId;
  qualification: string;
  gpa: number;
  englishTest: EnglishTest;
  englishScore: number;
  workYears: number;
  budget: number;
  phoneCode: string;
  phone: string;
  email: string;
  consent: boolean;
  contactPref: "WhatsApp" | "Phone call" | "Email";
  contactTime: "Morning" | "Afternoon" | "Evening";
}

export interface DocResult {
  fileName: string;
  at: number;
  fields: [string, string][];
  gpa?: number;
  test?: EnglishTest;
  score?: number;
}

export interface Msg { id: string; role: "nova" | "user"; text: string }

export interface JourneyState {
  v: 1;
  id: string;
  startedAt: number;
  source: Source;
  step: StepId;
  introduced: StepId | null;
  messages: Msg[];
  profile: Profile;
  docs: { transcript?: DocResult; english?: DocResult };
  quests: Partial<Record<QuestId, number>>;
  shortlist: string[];
  baseline: Record<string, number>;
  submittedAt?: number;
}

export const DEFAULT_PROFILE: Profile = {
  name: "",
  qualification: "Bachelor's degree",
  gpa: 3.4,
  englishTest: "ielts",
  englishScore: 6.5,
  workYears: 1,
  budget: 30000,
  phoneCode: "+91",
  phone: "",
  email: "",
  consent: false,
  contactPref: "WhatsApp",
  contactTime: "Evening",
};

export function newJourney(source: Source = "website"): JourneyState {
  return {
    v: 1,
    id: `stu_${Math.random().toString(36).slice(2, 8)}`,
    startedAt: Date.now(),
    source,
    step: "name",
    introduced: null,
    messages: [],
    profile: { ...DEFAULT_PROFILE },
    docs: {},
    quests: {},
    shortlist: [],
    baseline: {},
  };
}

export const xpOf = (s: JourneyState) => QUESTS.reduce((n, q) => n + (s.quests[q.id] ? q.xp : 0), 0);
export const badgesOf = (s: JourneyState): BadgeId[] =>
  BADGES.filter((b) => b.needs.every((q) => s.quests[q])).map((b) => b.id);

export const PROFILE_PARTS: QuestId[] = ["country", "level", "interest", "academic", "contact", "transcript", "english", "matches"];
export const completionOf = (s: JourneyState) =>
  Math.round((PROFILE_PARTS.filter((q) => s.quests[q]).length / PROFILE_PARTS.length) * 100);

/** Declared profile, overridden by verified document values once available. */
export function effectiveInput(s: JourneyState): MatchInput {
  const p = s.profile;
  return {
    country: p.country,
    level: p.level,
    field: p.field,
    budget: p.budget,
    gpa: s.docs.transcript?.gpa ?? p.gpa,
    englishTest: s.docs.english?.test ?? p.englishTest,
    englishScore: s.docs.english?.score ?? p.englishScore,
  };
}
export const declaredInput = (s: JourneyState): MatchInput => ({
  country: s.profile.country, level: s.profile.level, field: s.profile.field, budget: s.profile.budget,
  gpa: s.profile.gpa, englishTest: s.profile.englishTest, englishScore: s.profile.englishScore,
});

export const matchesOf = (s: JourneyState): Match[] => getMatches(effectiveInput(s), 6);
export const docsVerified = (s: JourneyState) => !!(s.docs.transcript && s.docs.english);
export const isQualified = (s: JourneyState) => docsVerified(s) && bestScore(effectiveInput(s)) >= QUALIFY_THRESHOLD;

/* ---------- Simulated document verification (prototype) ---------- */
const SAMPLE_VERIFIED: Record<EnglishTest, number> = { ielts: 7.0, toefl: 98, pte: 68, duolingo: 125 };

export function simulateTranscript(p: Profile, fileName: string): DocResult {
  return {
    fileName, at: Date.now(), gpa: 3.6,
    fields: [
      ["Institution", "Sample University (demo)"],
      ["Qualification", p.qualification],
      ["Cumulative GPA", "3.6 / 4.0"],
      ["Graduation year", "2025"],
      ["Authenticity check", "Passed"],
    ],
  };
}
export function simulateEnglish(p: Profile, fileName: string): DocResult {
  const score = SAMPLE_VERIFIED[p.englishTest];
  const label = { ielts: "IELTS Academic", toefl: "TOEFL iBT", pte: "PTE Academic", duolingo: "Duolingo English Test" }[p.englishTest];
  return {
    fileName, at: Date.now(), test: p.englishTest, score,
    fields: [
      ["Test", label],
      ["Overall score", fmtScore(p.englishTest, score)],
      ["Valid until", "March 2028"],
      ["Authenticity check", "Passed"],
    ],
  };
}

/* ---------- Nova's script ---------- */
const first = (n: string) => n.trim().split(/\s+/)[0] || "there";

export function introLines(step: StepId, s: JourneyState): string[] {
  const name = first(s.profile.name);
  const country = countryName(s.profile.country);
  switch (step) {
    case "name":
      return ["Hi! I'm Nova, your NXT Chapter guide. 👋", "Let's find the right university for you, and earn some XP along the way. What should I call you?"];
    case "country":
      return [`Nice to meet you, ${name}! 🎉`, "Which country are you most interested in studying in?"];
    case "level":
      return [`${country}, great pick. You just earned your first badge: Explorer.`, "What level of study are you looking for?"];
    case "interest":
      return [`${levelLabel(s.profile.level)} it is. When do you want to start, and what do you want to study?`];
    case "academic":
      return ["Now a few details about your background. This gives me an estimate of your fit. Your documents will confirm it in a moment."];
    case "contact":
      return ["Almost there! Where can your counsellor reach you once you're matched?", "Your details stay private and are only shared with your NXT Chapter counsellor."];
    case "documents":
      return ["Time to verify. Upload your academic transcript and English test result. I'll check them instantly.", "Each verified document earns XP and sharpens your match scores."];
    case "matches": {
      const n = matchesOf(s).length;
      return [`Verified ✅ I found ${n} programme${n === 1 ? "" : "s"} in ${country} that fit you.`, "Shortlist at least 3 to meet your counsellor."];
    }
    case "handoff":
      return [`Great shortlist, ${name}! Your counsellor will receive your whole profile, so you never repeat yourself.`, "How would you like to be contacted?"];
    case "nurture":
      return [`Thanks ${name}. Your best match is under our ${QUALIFY_THRESHOLD}% threshold, so you're on our nurture track for now.`, "We'll keep your profile and share pathway options. You can also adjust your details."];
    case "done":
      return [`You're all set, ${name}! 🎓`];
  }
}

/** Text shown in the chat as the student's own reply. */
export const fmt = { country: countryName, level: levelLabel, field: fieldLabel };

/* ---------- Reducer ---------- */
export type Action =
  | { type: "hydrate"; state: JourneyState }
  | { type: "reset"; source: Source }
  | { type: "messages"; msgs: Msg[] }
  | { type: "introduced"; step: StepId }
  | { type: "answer"; patch?: Partial<Profile>; user?: string; next: StepId; quest?: QuestId; at: number }
  | { type: "doc"; kind: "transcript" | "english"; doc: DocResult; at: number }
  | { type: "baseline"; baseline: Record<string, number> }
  | { type: "shortlist"; id: string; at: number }
  | { type: "revise" }
  | { type: "submit"; at: number; patch?: Partial<Profile> };

export function reducer(s: JourneyState, a: Action): JourneyState {
  switch (a.type) {
    case "hydrate": return a.state;
    case "reset": return newJourney(a.source);
    case "messages": {
      const have = new Set(s.messages.map((m) => m.id));
      return { ...s, messages: [...s.messages, ...a.msgs.filter((m) => !have.has(m.id))] };
    }
    case "introduced": return { ...s, introduced: a.step };
    case "answer": {
      const msgs = a.user ? [...s.messages, { id: `u:${s.messages.length}:${a.next}`, role: "user" as const, text: a.user }] : s.messages;
      const quests = a.quest && !s.quests[a.quest] ? { ...s.quests, [a.quest]: a.at } : s.quests;
      return { ...s, profile: { ...s.profile, ...a.patch }, messages: msgs, quests, step: a.next };
    }
    case "doc": {
      const quests = s.quests[a.kind] ? s.quests : { ...s.quests, [a.kind]: a.at };
      return { ...s, docs: { ...s.docs, [a.kind]: a.doc }, quests };
    }
    case "baseline": return { ...s, baseline: a.baseline };
    case "shortlist": {
      const has = s.shortlist.includes(a.id);
      const shortlist = has ? s.shortlist.filter((x) => x !== a.id) : [...s.shortlist, a.id];
      const quests = { ...s.quests };
      if (shortlist.length >= 3 && !quests.shortlist) quests.shortlist = a.at;
      return { ...s, shortlist, quests };
    }
    case "revise": {
      const quests = { ...s.quests };
      for (const q of ["academic", "transcript", "english", "matches", "shortlist", "handoff"] as QuestId[]) delete quests[q];
      return { ...s, step: "academic", introduced: null, docs: {}, quests, shortlist: [], baseline: {}, submittedAt: undefined };
    }
    case "submit": {
      const quests = { ...s.quests, handoff: a.at };
      return { ...s, profile: { ...s.profile, ...a.patch }, quests, submittedAt: a.at, step: "done" };
    }
  }
}

export const STAGES = ["Started", "Country chosen", "Profile complete", "Contact captured", "Documents verified", "Matches unlocked", "Handed off"] as const;
export function stageReached(s: Pick<JourneyState, "quests">): number {
  const q = s.quests;
  let n = 0;
  if (q.country) n = 1;
  if (q.country && q.level && q.interest && q.academic) n = 2;
  if (n === 2 && q.contact) n = 3;
  if (n === 3 && q.transcript && q.english) n = 4;
  if (n === 4 && q.matches) n = 5;
  if (n === 5 && q.handoff) n = 6;
  return n; // index into STAGES (0 = started)
}
