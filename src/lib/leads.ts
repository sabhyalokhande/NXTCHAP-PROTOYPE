import { useMemo, useSyncExternalStore } from "react";
import { countryName, fieldLabel, levelLabel, SOURCE_LABEL, type CountryId, type FieldId, type LevelId, type Source } from "./data";
import {
  QUESTS, effectiveInput, isQualified, type DocResult, type JourneyState, type Profile, type QuestId,
} from "./journey";
import { ENGLISH_TESTS, fmtScore, getMatches, toIelts, type EnglishTest, type Match, type MatchInput } from "./match";

/* ---------- tiny localStorage store with cross-tab sync ---------- */
export const K_JOURNEY = "nova.journey.v1";
export const K_LEADS = "nova.leads.v1";
export const K_META = "nova.leadmeta.v1";

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => { if (!e.key || e.key.startsWith("nova.")) cb(); };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(cb); window.removeEventListener("storage", onStorage); };
};
const notify = () => listeners.forEach((l) => l());

export function readJSON<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : null; } catch { return null; }
}
export function writeJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
  notify();
}
export function removeKey(key: string) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
  notify();
}

/** Re-renders when the key changes (any tab). Returns null on the server / first paint. */
export function useStored<T>(key: string): T | null {
  const raw = useSyncExternalStore(
    subscribe,
    () => { try { return localStorage.getItem(key); } catch { return null; } },
    () => null,
  );
  return useMemo(() => { try { return raw ? (JSON.parse(raw) as T) : null; } catch { return null; } }, [raw]);
}

/* ---------- leads ---------- */
export type LeadStatus = "New" | "Contacted" | "In discussion" | "Converted" | "Lost";
export const STATUSES: LeadStatus[] = ["New", "Contacted", "In discussion", "Converted", "Lost"];

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: Source;
  createdAt: number;
  profile: Profile;
  input: MatchInput; // effective (verified) values
  docs: { transcript?: DocResult; english?: DocResult };
  quests: Partial<Record<QuestId, number>>;
  shortlist: string[];
  assignedTo: string;
  status: LeadStatus;
  qualified: boolean;
  live?: boolean;
}
export interface LeadMeta { status?: LeadStatus; notes?: string }

export const COUNSELLOR = "Priya Menon";

export function leadFromJourney(s: JourneyState): Lead {
  return {
    id: s.id,
    name: s.profile.name || "New student",
    email: s.profile.email,
    phone: `${s.profile.phoneCode} ${s.profile.phone}`.trim(),
    source: s.source,
    createdAt: s.startedAt,
    profile: s.profile,
    input: effectiveInput(s),
    docs: s.docs,
    quests: s.quests,
    shortlist: s.shortlist,
    assignedTo: COUNSELLOR,
    status: "New",
    qualified: isQualified(s),
    live: true,
  };
}

export const leadMatches = (l: Lead): Match[] => getMatches(l.input, 6);

/* ---------- seeded demo students ---------- */
const NOW = () => Date.now();
const H = 3600_000;

interface SeedSpec {
  id: string; name: string; phoneCode: string; source: Source; hoursAgo: number; status: LeadStatus;
  country: CountryId; level: LevelId; field: FieldId; intake: string; qualification: string;
  gpa: number; test: EnglishTest; score: number; work: number; budget: number;
  pref: Profile["contactPref"]; time: Profile["contactTime"];
}

const SEEDS: SeedSpec[] = [
  { id: "seed1", name: "Aarav Sharma", phoneCode: "+91", source: "whatsapp", hoursAgo: 0.6, status: "New", country: "au", level: "master", field: "business", intake: "Jul 2027", qualification: "Bachelor's degree", gpa: 3.2, test: "ielts", score: 6.5, work: 3, budget: 26000, pref: "WhatsApp", time: "Evening" },
  { id: "seed2", name: "Dinuka Perera", phoneCode: "+94", source: "qr", hoursAgo: 5, status: "Contacted", country: "uk", level: "master", field: "cs", intake: "Sep 2027", qualification: "Bachelor's degree", gpa: 3.6, test: "ielts", score: 7.5, work: 2, budget: 45000, pref: "Phone call", time: "Morning" },
  { id: "seed3", name: "Ananya Iyer", phoneCode: "+91", source: "instagram", hoursAgo: 26, status: "In discussion", country: "ca", level: "bachelor", field: "health", intake: "Sep 2027", qualification: "High school / A-levels", gpa: 2.9, test: "ielts", score: 6.0, work: 0, budget: 20000, pref: "WhatsApp", time: "Afternoon" },
  { id: "seed4", name: "Kavindu Silva", phoneCode: "+94", source: "referral", hoursAgo: 2.2, status: "New", country: "sg", level: "bachelor", field: "cs", intake: "Sep 2027", qualification: "High school / A-levels", gpa: 3.0, test: "ielts", score: 6.5, work: 0, budget: 18000, pref: "Email", time: "Evening" },
  { id: "seed5", name: "Rohan Mehta", phoneCode: "+91", source: "website", hoursAgo: 74, status: "Converted", country: "de", level: "master", field: "eng", intake: "Oct 2027", qualification: "Bachelor's degree", gpa: 3.4, test: "toefl", score: 98, work: 2, budget: 15000, pref: "Phone call", time: "Morning" },
  { id: "seed6", name: "Nethmi Fernando", phoneCode: "+94", source: "whatsapp", hoursAgo: 30, status: "Contacted", country: "au", level: "diploma", field: "hospitality", intake: "Jan 2027", qualification: "High school / A-levels", gpa: 2.5, test: "ielts", score: 5.5, work: 0, budget: 16000, pref: "WhatsApp", time: "Evening" },
  { id: "seed7", name: "Ishaan Kapoor", phoneCode: "+91", source: "qr", hoursAgo: 50, status: "In discussion", country: "uk", level: "bachelor", field: "business", intake: "Sep 2027", qualification: "High school / A-levels", gpa: 2.8, test: "ielts", score: 6.0, work: 0, budget: 22000, pref: "WhatsApp", time: "Afternoon" },
  { id: "seed8", name: "Tharushi Jayasinghe", phoneCode: "+94", source: "referral", hoursAgo: 0.3, status: "New", country: "ca", level: "master", field: "business", intake: "Sep 2027", qualification: "Bachelor's degree", gpa: 3.6, test: "ielts", score: 7.0, work: 4, budget: 38000, pref: "Phone call", time: "Morning" },
];

function seedLead(sp: SeedSpec): Lead {
  const t0 = NOW() - sp.hoursAgo * H;
  const min = (m: number) => t0 + m * 60_000;
  const testLabel = ENGLISH_TESTS.find((t) => t.id === sp.test)!.label;
  const profile: Profile = {
    name: sp.name, country: sp.country, level: sp.level, intake: sp.intake, field: sp.field,
    qualification: sp.qualification, gpa: sp.gpa, englishTest: sp.test, englishScore: sp.score,
    workYears: sp.work, budget: sp.budget, phoneCode: sp.phoneCode, phone: "90000 0000" + sp.id.slice(-1),
    email: `${sp.name.toLowerCase().replace(/\s+/g, ".")}@example.com`, consent: true,
    contactPref: sp.pref, contactTime: sp.time,
  };
  const input: MatchInput = { country: sp.country, level: sp.level, field: sp.field, budget: sp.budget, gpa: sp.gpa, englishTest: sp.test, englishScore: sp.score };
  const matches = getMatches(input, 6);
  return {
    id: sp.id, name: sp.name, email: profile.email, phone: `${profile.phoneCode} ${profile.phone}`,
    source: sp.source, createdAt: t0, profile, input,
    docs: {
      transcript: { fileName: "transcript.pdf", at: min(6), gpa: sp.gpa, fields: [["Institution", "Sample University (demo)"], ["Qualification", sp.qualification], ["Cumulative GPA", `${sp.gpa.toFixed(1)} / 4.0`], ["Graduation year", "2025"], ["Authenticity check", "Passed"]] },
      english: { fileName: "english-score.pdf", at: min(8), test: sp.test, score: sp.score, fields: [["Test", testLabel], ["Overall score", fmtScore(sp.test, sp.score)], ["Valid until", "March 2028"], ["Authenticity check", "Passed"]] },
    },
    quests: { country: min(1), level: min(2), interest: min(3), academic: min(5), contact: min(6), transcript: min(7), english: min(8), matches: min(9), shortlist: min(11), handoff: min(13) },
    shortlist: matches.slice(0, 3).map((m) => m.programme.id),
    assignedTo: COUNSELLOR, status: sp.status, qualified: true,
  };
}

export const seedLeads = (): Lead[] => SEEDS.map(seedLead);

/* Seeded funnel for students who started but did not finish (demo aggregate).
   Index matches STAGES; the 8 handed-off leads above make up the last bucket. */
export const SEED_FUNNEL = [40, 34, 27, 22, 14, 11, 8];
export const SEED_CHANNELS: Record<Source, number> = { website: 14, whatsapp: 11, qr: 6, instagram: 5, referral: 4 };

/* ---------- counsellor helpers ---------- */
export function timeline(l: Lead): { t: number; label: string; xp?: number }[] {
  const p = l.profile;
  const label: Record<QuestId, string> = {
    country: `Chose ${countryName(p.country)}`,
    level: `Selected ${levelLabel(p.level)}`,
    interest: `Picked ${p.intake} intake, ${fieldLabel(p.field)}`,
    academic: "Shared academic profile (GPA, English, work experience)",
    contact: "Gave contact details and consent",
    transcript: `Transcript verified, GPA ${l.docs.transcript?.gpa?.toFixed(1) ?? "-"}`,
    english: `English score verified, ${ENGLISH_TESTS.find((t) => t.id === l.docs.english?.test)?.label ?? ""} ${l.docs.english?.test && l.docs.english.score !== undefined ? fmtScore(l.docs.english.test, l.docs.english.score) : ""}`,
    matches: "Unlocked university matches",
    shortlist: "Shortlisted 3 universities",
    handoff: "Handed off to counsellor",
  };
  const items = QUESTS.filter((q) => l.quests[q.id]).map((q) => ({ t: l.quests[q.id]!, label: label[q.id], xp: q.xp }));
  return [{ t: l.createdAt, label: `Entered via ${SOURCE_LABEL[l.source]}` }, ...items].sort((a, b) => a.t - b.t);
}

export function counsellorBrief(l: Lead): string[] {
  const out: string[] = [];
  const ms = leadMatches(l);
  const top = ms[0];
  if (top) out.push(`Best fit is ${top.programme.institution}, ${top.programme.name} at ${top.total}% (${top.likelihood.toLowerCase()} likelihood).`);
  const pricey = ms.slice(0, 3).filter((m) => m.parts.budget < 80);
  if (pricey.length) {
    const sch = pricey.map((m) => m.programme).find((p) => p.scholarship);
    out.push(`Budget of S$${l.profile.budget.toLocaleString()} is tight for ${pricey.length} of the top 3. ${sch ? `${sch.institution} offers scholarships up to S$${sch.scholarship!.toLocaleString()}.` : "Discuss scholarships or lower-cost options."}`);
  }
  const ielts = toIelts(l.input.englishTest, l.input.englishScore);
  if (ielts < 6.5) out.push(`English is around IELTS ${ielts.toFixed(1)}. Discuss a retake or pre-sessional course.`);
  if (l.profile.workYears >= 2 && l.profile.level === "master") out.push(`${l.profile.workYears} years of work experience strengthens a Master's application.`);
  out.push(`Prefers ${l.profile.contactPref} in the ${l.profile.contactTime.toLowerCase()}. Prepare a cost summary for the parent discussion.`);
  return out.slice(0, 4);
}
