import { COUNTRIES, PROGRAMMES, type CountryId, type FieldId, type LevelId, type Programme } from "./data";

export type EnglishTest = "ielts" | "toefl" | "pte" | "duolingo";

export interface MatchInput {
  country?: CountryId;
  level?: LevelId;
  field?: FieldId;
  gpa: number;
  englishTest: EnglishTest;
  englishScore: number;
  budget: number; // S$ tuition per year
}

// Weights from the client's sample (editable by admin in the full product).
export const WEIGHTS = { gpa: 0.3, english: 0.2, course: 0.2, budget: 0.15, visa: 0.15 } as const;
export const QUALIFY_THRESHOLD = 60;

export const ENGLISH_TESTS: { id: EnglishTest; label: string; min: number; max: number; step: number; def: number }[] = [
  { id: "ielts", label: "IELTS", min: 4.5, max: 9, step: 0.5, def: 6.5 },
  { id: "toefl", label: "TOEFL iBT", min: 40, max: 120, step: 1, def: 85 },
  { id: "pte", label: "PTE Academic", min: 30, max: 90, step: 1, def: 60 },
  { id: "duolingo", label: "Duolingo", min: 70, max: 160, step: 5, def: 110 },
];

// Approximate conversion to an IELTS-equivalent band.
export function toIelts(test: EnglishTest, score: number): number {
  const table: Record<EnglishTest, [number, number][]> = {
    ielts: [],
    toefl: [[110, 8], [102, 7.5], [94, 7], [79, 6.5], [60, 6], [46, 5.5], [0, 5]],
    pte: [[79, 8], [73, 7.5], [65, 7], [58, 6.5], [50, 6], [43, 5.5], [0, 5]],
    duolingo: [[140, 8], [130, 7.5], [120, 7], [110, 6.5], [100, 6], [90, 5.5], [0, 5]],
  };
  if (test === "ielts") return score;
  for (const [min, band] of table[test]) if (score >= min) return band;
  return 5;
}

const RELATED: Partial<Record<FieldId, Partial<Record<FieldId, number>>>> = {
  business: { hospitality: 0.6, design: 0.35, cs: 0.3 },
  hospitality: { business: 0.6, design: 0.3 },
  cs: { eng: 0.65, business: 0.3, design: 0.3 },
  eng: { cs: 0.65 },
  health: {},
  design: { business: 0.35, cs: 0.3, hospitality: 0.3 },
};

const gpaFit = (gpa: number, min: number) =>
  gpa >= min ? Math.min(1, 0.75 + ((gpa - min) / 0.8) * 0.25) : Math.max(0, 0.75 - (min - gpa) * 1.1);
const englishFit = (ielts: number, min: number) =>
  ielts >= min ? Math.min(1, 0.8 + (ielts - min) * 0.2) : Math.max(0, 0.8 - (min - ielts) * 0.9);
const courseFit = (want: FieldId | undefined, has: FieldId) =>
  !want ? 0.5 : want === has ? 1 : (RELATED[want]?.[has] ?? 0.15);
const budgetFit = (budget: number, tuition: number) =>
  tuition <= budget ? 1 : Math.max(0, 1 - ((tuition - budget) / Math.max(budget, 1)) * 1.5);

export type Likelihood = "High" | "Medium" | "Low";
export const likelihood = (total: number): Likelihood => (total >= 75 ? "High" : total >= 55 ? "Medium" : "Low");

export interface Match {
  programme: Programme;
  total: number;
  parts: { gpa: number; english: number; course: number; budget: number; visa: number }; // each 0-100
  likelihood: Likelihood;
  pathway?: string;
}

export function scoreProgramme(input: MatchInput, p: Programme): Match {
  const ielts = toIelts(input.englishTest, input.englishScore);
  const visa = (COUNTRIES.find((c) => c.id === p.country)?.visa ?? 60) / 100;
  const g = gpaFit(input.gpa, p.minGpa);
  const e = englishFit(ielts, p.minIelts);
  const c = courseFit(input.field, p.field);
  const b = budgetFit(input.budget, p.tuition);
  const total = Math.round(100 * (WEIGHTS.gpa * g + WEIGHTS.english * e + WEIGHTS.course * c + WEIGHTS.budget * b + WEIGHTS.visa * visa));
  const parts = {
    gpa: Math.round(g * 100),
    english: Math.round(e * 100),
    course: Math.round(c * 100),
    budget: Math.round(b * 100),
    visa: Math.round(visa * 100),
  };
  let pathway: string | undefined;
  if (g < 0.5 || e < 0.5) {
    pathway =
      p.level === "bachelor" ? "Entry via Diploma / Foundation year"
      : p.level === "master" ? "Entry via Graduate Diploma pathway"
      : p.level === "phd" ? "Entry via Research Master's"
      : "Pre-sessional English + diploma entry";
  }
  return { programme: p, total, parts, likelihood: likelihood(total), pathway };
}

/** Matches for the chosen country + level, best first. Anything under 40% is hidden. */
export function getMatches(input: MatchInput, limit = 6): Match[] {
  if (!input.country || !input.level) return [];
  const scored = PROGRAMMES.filter((p) => p.country === input.country && p.level === input.level)
    .map((p) => scoreProgramme(input, p))
    .sort((a, b) => b.total - a.total);
  const shown = scored.filter((m) => m.total >= 40);
  // Prefer on-field programmes when there are enough of them; related fields only fill gaps.
  const exact = shown.filter((m) => m.parts.course >= 90);
  const pool = exact.length >= 4 ? exact : shown;
  return (pool.length >= 3 ? pool : scored.slice(0, 3)).slice(0, limit);
}

export const fmtScore = (test: EnglishTest, score: number) => (test === "ielts" ? score.toFixed(1) : String(score));

export const bestScore = (input: MatchInput) => getMatches(input, 1)[0]?.total ?? 0;
