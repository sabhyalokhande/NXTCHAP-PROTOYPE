// Illustrative demo catalogue. In the full product this data is maintained by the
// NXT Chapter team through the admin panel (university + programme records).

export type CountryId = "uk" | "au" | "ca" | "de" | "sg";
export type LevelId = "diploma" | "bachelor" | "master" | "phd";
export type FieldId = "business" | "cs" | "eng" | "health" | "hospitality" | "design";
export type Source = "website" | "qr" | "whatsapp" | "referral" | "instagram";

export const COUNTRIES: { id: CountryId; name: string; code: string; visa: number; blurb: string }[] = [
  { id: "uk", name: "United Kingdom", code: "UK", visa: 72, blurb: "1-year Master's, Graduate Route work visa" },
  { id: "au", name: "Australia", code: "AU", visa: 66, blurb: "Post-study work rights, strong industry links" },
  { id: "ca", name: "Canada", code: "CA", visa: 64, blurb: "Co-op programmes, PR-friendly pathways" },
  { id: "de", name: "Germany", code: "DE", visa: 80, blurb: "Very low tuition, strong engineering and CS" },
  { id: "sg", name: "Singapore", code: "SG", visa: 76, blurb: "Asia's education hub, close to home" },
];

export const LEVELS: { id: LevelId; label: string; hint: string }[] = [
  { id: "diploma", label: "Diploma / Foundation", hint: "Pathway into a degree" },
  { id: "bachelor", label: "Bachelor's", hint: "Undergraduate degree" },
  { id: "master", label: "Master's", hint: "Postgraduate degree" },
  { id: "phd", label: "PhD", hint: "Research doctorate" },
];

export const FIELDS: { id: FieldId; label: string }[] = [
  { id: "business", label: "Business & Management" },
  { id: "cs", label: "Computer Science & AI" },
  { id: "eng", label: "Engineering" },
  { id: "health", label: "Health & Nursing" },
  { id: "hospitality", label: "Hospitality & Tourism" },
  { id: "design", label: "Design & Creative Arts" },
];

export const INTAKES = ["Jan 2027", "Apr 2027", "Jul 2027", "Sep 2027"];
export const QUALIFICATIONS = ["High school / A-levels", "Diploma", "Bachelor's degree", "Master's degree"];

export const countryName = (id?: CountryId) => COUNTRIES.find((c) => c.id === id)?.name ?? "";
export const levelLabel = (id?: LevelId) => LEVELS.find((l) => l.id === id)?.label ?? "";
export const fieldLabel = (id?: FieldId) => FIELDS.find((f) => f.id === id)?.label ?? "";

export const SOURCE_LABEL: Record<Source, string> = {
  website: "Website",
  qr: "QR code",
  whatsapp: "WhatsApp",
  referral: "Referral link",
  instagram: "Instagram",
};

export interface Programme {
  id: string;
  institution: string;
  city: string;
  country: CountryId;
  level: LevelId;
  field: FieldId;
  name: string;
  tuition: number; // S$ per year, indicative
  minGpa: number; // 4.0 scale
  minIelts: number; // IELTS-equivalent
  intakes: string[];
  scholarship?: number; // S$ up to
}

type Tier = 1 | 2 | 3;
interface Inst {
  id: string;
  name: string;
  city: string;
  country: CountryId;
  tier: Tier;
  levels: LevelId[];
  fields: FieldId[];
  intakes: string[];
  scholarship?: number;
}

const D: LevelId = "diploma", B: LevelId = "bachelor", M: LevelId = "master", P: LevelId = "phd";

const INSTITUTIONS: Inst[] = [
  // United Kingdom
  { id: "uom", name: "University of Manchester", city: "Manchester", country: "uk", tier: 1, levels: [B, M, P], fields: ["business", "cs", "eng", "health"], intakes: ["Sep 2027", "Jan 2027"], scholarship: 5000 },
  { id: "leeds", name: "University of Leeds", city: "Leeds", country: "uk", tier: 1, levels: [B, M, P], fields: ["business", "cs", "eng", "design", "health"], intakes: ["Sep 2027"] },
  { id: "surrey", name: "University of Surrey", city: "Guildford", country: "uk", tier: 2, levels: [B, M, P], fields: ["hospitality", "business", "cs", "eng"], intakes: ["Sep 2027", "Jan 2027"], scholarship: 4000 },
  { id: "coventry", name: "Coventry University", city: "Coventry", country: "uk", tier: 3, levels: [B, M], fields: ["business", "cs", "eng", "hospitality", "health", "design"], intakes: ["Sep 2027", "Jan 2027", "May 2027"], scholarship: 3000 },
  { id: "brookes", name: "Oxford Brookes University", city: "Oxford", country: "uk", tier: 2, levels: [B, M], fields: ["hospitality", "business", "design", "health"], intakes: ["Sep 2027"] },
  { id: "napier", name: "Edinburgh Napier University", city: "Edinburgh", country: "uk", tier: 2, levels: [B, M], fields: ["business", "cs", "hospitality", "health", "design"], intakes: ["Sep 2027", "Jan 2027"], scholarship: 3500 },
  { id: "kic", name: "Kaplan International College London", city: "London", country: "uk", tier: 3, levels: [D], fields: ["business", "cs", "hospitality", "design"], intakes: ["Jan 2027", "Apr 2027", "Sep 2027"] },
  { id: "into", name: "INTO University of Exeter", city: "Exeter", country: "uk", tier: 3, levels: [D], fields: ["business", "cs", "eng", "health"], intakes: ["Jan 2027", "Sep 2027"] },
  // Australia
  { id: "uts", name: "University of Technology Sydney", city: "Sydney", country: "au", tier: 2, levels: [B, M, P], fields: ["business", "cs", "eng", "design", "health"], intakes: ["Jul 2027", "Feb 2027"], scholarship: 5000 },
  { id: "unimelb", name: "University of Melbourne", city: "Melbourne", country: "au", tier: 1, levels: [B, M, P], fields: ["business", "cs", "eng", "health", "design"], intakes: ["Feb 2027", "Jul 2027"] },
  { id: "rmit", name: "RMIT University", city: "Melbourne", country: "au", tier: 2, levels: [B, M, P], fields: ["business", "cs", "eng", "design", "hospitality"], intakes: ["Feb 2027", "Jul 2027"], scholarship: 4500 },
  { id: "scu", name: "Southern Cross University", city: "Gold Coast", country: "au", tier: 3, levels: [B, M], fields: ["business", "cs", "health", "hospitality"], intakes: ["Mar 2027", "Jul 2027", "Nov 2027"], scholarship: 3000 },
  { id: "torrens", name: "Torrens University Australia", city: "Sydney", country: "au", tier: 3, levels: [D, B, M], fields: ["business", "hospitality", "health", "design", "cs"], intakes: ["Jan 2027", "May 2027", "Sep 2027"] },
  { id: "aac", name: "Academies Australasia College", city: "Sydney", country: "au", tier: 3, levels: [D, B], fields: ["business", "hospitality", "cs", "health"], intakes: ["Jan 2027", "Apr 2027", "Jul 2027", "Oct 2027"] },
  // Canada
  { id: "uoft", name: "University of Toronto", city: "Toronto", country: "ca", tier: 1, levels: [B, M, P], fields: ["business", "cs", "eng", "health", "design"], intakes: ["Sep 2027"] },
  { id: "ubc", name: "University of British Columbia", city: "Vancouver", country: "ca", tier: 1, levels: [B, M, P], fields: ["business", "cs", "eng", "health"], intakes: ["Sep 2027", "Jan 2027"] },
  { id: "mcmaster", name: "McMaster University", city: "Hamilton", country: "ca", tier: 2, levels: [B, M, P], fields: ["business", "eng", "health", "cs"], intakes: ["Sep 2027"], scholarship: 5000 },
  { id: "sfu", name: "Simon Fraser University", city: "Burnaby", country: "ca", tier: 2, levels: [B, M, P], fields: ["business", "cs", "eng", "design", "health"], intakes: ["Sep 2027", "Jan 2027"] },
  { id: "seneca", name: "Seneca Polytechnic", city: "Toronto", country: "ca", tier: 3, levels: [D, B], fields: ["business", "cs", "eng", "hospitality", "health", "design"], intakes: ["Jan 2027", "May 2027", "Sep 2027"] },
  { id: "humber", name: "Humber Polytechnic", city: "Toronto", country: "ca", tier: 3, levels: [D, B], fields: ["business", "hospitality", "health", "design", "cs", "eng"], intakes: ["Jan 2027", "May 2027", "Sep 2027"], scholarship: 2500 },
  { id: "conestoga", name: "Conestoga College", city: "Kitchener", country: "ca", tier: 3, levels: [D, B], fields: ["business", "cs", "eng", "hospitality", "health"], intakes: ["Jan 2027", "May 2027", "Sep 2027"] },
  // Germany
  { id: "tum", name: "Technical University of Munich", city: "Munich", country: "de", tier: 1, levels: [B, M, P], fields: ["cs", "eng", "business"], intakes: ["Oct 2027", "Apr 2027"] },
  { id: "rwth", name: "RWTH Aachen University", city: "Aachen", country: "de", tier: 1, levels: [B, M, P], fields: ["eng", "cs", "business"], intakes: ["Oct 2027", "Apr 2027"] },
  { id: "mannheim", name: "University of Mannheim", city: "Mannheim", country: "de", tier: 1, levels: [B, M, P], fields: ["business", "cs"], intakes: ["Sep 2027"] },
  { id: "tuberlin", name: "Technische Universität Berlin", city: "Berlin", country: "de", tier: 2, levels: [B, M, P], fields: ["eng", "cs", "design", "business"], intakes: ["Oct 2027", "Apr 2027"] },
  { id: "iu", name: "IU International University", city: "Berlin", country: "de", tier: 3, levels: [D, B, M], fields: ["business", "cs", "health", "hospitality", "design"], intakes: ["Jan 2027", "Apr 2027", "Jul 2027", "Oct 2027"], scholarship: 2000 },
  { id: "fresenius", name: "Hochschule Fresenius", city: "Cologne", country: "de", tier: 3, levels: [D, B, M], fields: ["business", "health", "design"], intakes: ["Sep 2027", "Mar 2027"] },
  // Singapore
  { id: "nus", name: "National University of Singapore", city: "Singapore", country: "sg", tier: 1, levels: [B, M, P], fields: ["business", "cs", "eng", "health", "design"], intakes: ["Aug 2027", "Jan 2027"], scholarship: 6000 },
  { id: "ntu", name: "Nanyang Technological University", city: "Singapore", country: "sg", tier: 1, levels: [B, M, P], fields: ["eng", "cs", "business", "design"], intakes: ["Aug 2027", "Jan 2027"], scholarship: 6000 },
  { id: "smu", name: "Singapore Management University", city: "Singapore", country: "sg", tier: 2, levels: [B, M, P], fields: ["business", "cs"], intakes: ["Aug 2027", "Jan 2027"], scholarship: 4000 },
  { id: "sit", name: "Singapore Institute of Technology", city: "Singapore", country: "sg", tier: 2, levels: [B], fields: ["cs", "eng", "hospitality", "health"], intakes: ["Sep 2027"] },
  { id: "kaplansg", name: "Kaplan Singapore", city: "Singapore", country: "sg", tier: 3, levels: [D, B], fields: ["business", "hospitality", "design", "cs"], intakes: ["Jan 2027", "Apr 2027", "Jul 2027", "Oct 2027"] },
  { id: "psb", name: "PSB Academy", city: "Singapore", country: "sg", tier: 3, levels: [D, B, M], fields: ["business", "cs", "hospitality", "design"], intakes: ["Jan 2027", "Apr 2027", "Jul 2027", "Oct 2027"] },
];

// Indicative bachelor-level tuition in S$ per year, by country and tier.
const BASE_TUITION: Record<CountryId, Record<Tier, number>> = {
  uk: { 1: 44000, 2: 34000, 3: 24000 },
  au: { 1: 40000, 2: 32000, 3: 22000 },
  ca: { 1: 36000, 2: 28000, 3: 20000 },
  de: { 1: 3000, 2: 2000, 3: 9500 },
  sg: { 1: 29000, 2: 25000, 3: 15000 },
};
const LEVEL_TUITION: Record<LevelId, number> = { diploma: 0.55, bachelor: 1, master: 1.1, phd: 0.7 };
const FIELD_TUITION: Record<FieldId, number> = { business: 1, cs: 1.08, eng: 1.1, health: 1.2, hospitality: 0.95, design: 0.98 };
const TIER_GPA: Record<Tier, number> = { 1: 3.5, 2: 3.0, 3: 2.5 };
const TIER_IELTS: Record<Tier, number> = { 1: 7.0, 2: 6.5, 3: 6.0 };
const LEVEL_GPA: Record<LevelId, number> = { diploma: -0.4, bachelor: 0, master: 0.15, phd: 0.3 };
const LEVEL_IELTS: Record<LevelId, number> = { diploma: -0.5, bachelor: 0, master: 0, phd: 0.5 };

const NAMES: Record<LevelId, Record<FieldId, string>> = {
  diploma: {
    business: "Diploma in Business Management",
    cs: "Diploma in Information Technology",
    eng: "Diploma in Engineering Studies",
    health: "Diploma in Health Sciences",
    hospitality: "Diploma in Hospitality Management",
    design: "Diploma in Design",
  },
  bachelor: {
    business: "Bachelor of Business",
    cs: "Bachelor of Computer Science",
    eng: "Bachelor of Engineering",
    health: "Bachelor of Health Sciences",
    hospitality: "Bachelor of Hospitality & Tourism",
    design: "Bachelor of Design",
  },
  master: {
    business: "Master of Business Administration",
    cs: "Master of Data Science & AI",
    eng: "Master of Engineering",
    health: "Master of Public Health",
    hospitality: "Master of Hospitality & Tourism",
    design: "Master of Design",
  },
  phd: {
    business: "PhD in Business",
    cs: "PhD in Computer Science",
    eng: "PhD in Engineering",
    health: "PhD in Health Sciences",
    hospitality: "PhD in Hospitality & Tourism",
    design: "PhD in Design",
  },
};

const round50 = (n: number) => Math.round(n / 50) * 50;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export const PROGRAMMES: Programme[] = INSTITUTIONS.flatMap((inst) =>
  inst.levels.flatMap((level) =>
    inst.fields.map((field) => ({
      id: `${inst.id}-${level}-${field}`,
      institution: inst.name,
      city: inst.city,
      country: inst.country,
      level,
      field,
      name: NAMES[level][field],
      tuition: round50(BASE_TUITION[inst.country][inst.tier] * LEVEL_TUITION[level] * FIELD_TUITION[field]),
      minGpa: Math.round(clamp(TIER_GPA[inst.tier] + LEVEL_GPA[level], 2.0, 3.8) * 10) / 10,
      minIelts: clamp(TIER_IELTS[inst.tier] + LEVEL_IELTS[level], 5.0, 7.5),
      intakes: inst.intakes,
      scholarship: inst.scholarship,
    })),
  ),
);

export const programmeById = (id: string) => PROGRAMMES.find((p) => p.id === id);
