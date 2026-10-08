"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, FileText, Loader2, ShieldCheck, Upload, Sparkles } from "lucide-react";
import { COUNTRIES, FIELDS, INTAKES, LEVELS, QUALIFICATIONS, fieldLabel, type CountryId, type FieldId, type LevelId } from "@/lib/data";
import {
  declaredInput, simulateEnglish, simulateTranscript, type DocResult, type JourneyState, type Profile, type StepId, type QuestId,
} from "@/lib/journey";
import { ENGLISH_TESTS, getMatches, type EnglishTest } from "@/lib/match";
import Globe from "@/components/three/Globe";

export type Answer = (a: { patch?: Partial<Profile>; user?: string; next: StepId; quest?: QuestId }) => void;

const btn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-nova-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-nova-600/25 transition hover:bg-nova-700 active:scale-[.98] disabled:cursor-not-allowed disabled:bg-nova-100 disabled:text-nova-300 disabled:shadow-none";
const chip = (on: boolean) =>
  `rounded-full border px-4 py-2 text-sm font-medium transition active:scale-[.97] ${
    on ? "border-nova-600 bg-nova-600 text-white shadow-md shadow-nova-600/25" : "border-nova-100 bg-white text-nova-800 hover:border-nova-300 hover:bg-nova-50"
  }`;
const field = "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-nova-400 focus:ring-4 focus:ring-nova-100";
const label = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted";

export const Primary = ({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...p} className={`${btn} ${p.className ?? ""}`}>{children}</button>
);

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`anim-fade-up rounded-2xl border border-nova-100 bg-white p-4 shadow-sm sm:p-5 ${className}`}>{children}</div>;
}

/* ---------------- 1. name ---------------- */
export function NameWidget({ answer }: { answer: Answer }) {
  const [v, setV] = useState("");
  const go = () => v.trim() && answer({ patch: { name: v.trim() }, user: v.trim(), next: "country" });
  return (
    <Panel>
      <form onSubmit={(e) => { e.preventDefault(); go(); }} className="flex gap-2">
        <input autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder="Your first name" className={field} aria-label="Your name" maxLength={40} />
        <Primary type="submit" disabled={!v.trim()}>Continue <ArrowRight size={16} /></Primary>
      </form>
    </Panel>
  );
}

/* ---------------- 2. country (3D globe picker) ---------------- */
export function CountryWidget({ answer }: { answer: Answer }) {
  const [pinHot, setPinHot] = useState<CountryId | null>(null);
  const [cardHot, setCardHot] = useState<CountryId | null>(null);
  const [pick, setPick] = useState<CountryId | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const choose = (id: CountryId) => {
    if (pick) return;
    setPick(id);
    const c = COUNTRIES.find((x) => x.id === id)!;
    timer.current = setTimeout(() => answer({ patch: { country: id }, user: c.name, next: "level", quest: "country" }), 950);
  };

  return (
    <div className="anim-fade-up space-y-3">
      <div className="relative h-[340px] overflow-hidden rounded-3xl bg-gradient-to-b from-nova-900 via-[#2b1d4d] to-nova-900 shadow-xl shadow-nova-900/25 ring-1 ring-white/10 sm:h-[400px]">
        <div className="aurora aurora-a -left-10 top-0 h-56 w-56 bg-nova-600/40" />
        <div className="aurora aurora-b -right-10 bottom-0 h-56 w-56 bg-fuchsia-500/20" />
        <div className="absolute inset-0">
          <Globe selected={pick} hovered={pick ?? cardHot ?? pinHot} focus={pick ?? cardHot} onSelect={choose} onHover={setPinHot} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs font-medium text-nova-200">
          {pick ? "Locking in your destination…" : "Drag to spin · tap a pin or a card to choose"}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {COUNTRIES.map((c) => (
          <button
            key={c.id}
            onMouseEnter={() => setCardHot(c.id)}
            onMouseLeave={() => setCardHot(null)}
            onClick={() => choose(c.id)}
            disabled={!!pick && pick !== c.id}
            className={`group flex items-center gap-3 rounded-2xl border bg-white p-3.5 text-left transition hover:-translate-y-0.5 hover:border-nova-300 hover:shadow-lg hover:shadow-nova-600/10 disabled:opacity-40 ${pick === c.id ? "border-gold ring-4 ring-gold/25" : "border-nova-100"}`}
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-nova-50 text-sm font-bold text-nova-600 transition group-hover:bg-nova-600 group-hover:text-white">{c.code}</span>
            <span>
              <span className="block text-sm font-semibold text-nova-900">{c.name}</span>
              <span className="block text-xs text-muted">{c.blurb}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 3. level ---------------- */
export function LevelWidget({ answer }: { answer: Answer }) {
  return (
    <div className="anim-fade-up grid grid-cols-2 gap-2.5">
      {LEVELS.map((l) => (
        <button
          key={l.id}
          onClick={() => answer({ patch: { level: l.id as LevelId }, user: l.label, next: "interest", quest: "level" })}
          className="rounded-2xl border border-nova-100 bg-white p-3.5 text-left transition hover:-translate-y-0.5 hover:border-nova-300 hover:shadow-lg hover:shadow-nova-600/10"
        >
          <span className="block text-sm font-semibold text-nova-900">{l.label}</span>
          <span className="block text-xs text-muted">{l.hint}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- 4. intake + field ---------------- */
export function InterestWidget({ answer }: { answer: Answer }) {
  const [intake, setIntake] = useState<string>();
  const [fieldId, setFieldId] = useState<FieldId>();
  return (
    <Panel className="space-y-4">
      <div>
        <span className={label}>Preferred intake</span>
        <div className="flex flex-wrap gap-2">{INTAKES.map((i) => <button key={i} className={chip(intake === i)} onClick={() => setIntake(i)}>{i}</button>)}</div>
      </div>
      <div>
        <span className={label}>What do you want to study?</span>
        <div className="flex flex-wrap gap-2">{FIELDS.map((f) => <button key={f.id} className={chip(fieldId === f.id)} onClick={() => setFieldId(f.id)}>{f.label}</button>)}</div>
      </div>
      <Primary
        disabled={!intake || !fieldId}
        onClick={() => answer({ patch: { intake, field: fieldId }, user: `${intake} · ${fieldLabel(fieldId)}`, next: "academic", quest: "interest" })}
      >
        Continue <ArrowRight size={16} />
      </Primary>
    </Panel>
  );
}

/* ---------------- 5. academic ---------------- */
function Slider({ id, text, value, min, max, step, onChange, fmtV }: { id: string; text: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; fmtV: (n: number) => string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label htmlFor={id} className={label + " !mb-0"}>{text}</label>
        <span className="text-sm font-semibold text-nova-700">{fmtV(value)}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-2 w-full cursor-pointer" />
    </div>
  );
}

export function AcademicWidget({ state, answer }: { state: JourneyState; answer: Answer }) {
  const p = state.profile;
  const [qualification, setQ] = useState(p.qualification);
  const [gpa, setGpa] = useState(p.gpa);
  const [test, setTest] = useState<EnglishTest>(p.englishTest);
  const [score, setScore] = useState(p.englishScore);
  const [work, setWork] = useState(p.workYears);
  const [budget, setBudget] = useState(p.budget);
  const t = ENGLISH_TESTS.find((x) => x.id === test)!;

  return (
    <Panel className="space-y-5">
      <div>
        <label htmlFor="qual" className={label}>Highest qualification</label>
        <select id="qual" value={qualification} onChange={(e) => setQ(e.target.value)} className={field}>
          {QUALIFICATIONS.map((q) => <option key={q}>{q}</option>)}
        </select>
      </div>
      <Slider id="gpa" text="GPA (4.0 scale)" value={gpa} min={2} max={4} step={0.1} onChange={setGpa} fmtV={(n) => n.toFixed(1)} />
      <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
        <div>
          <label htmlFor="test" className={label}>English test</label>
          <select id="test" value={test} onChange={(e) => { const nt = e.target.value as EnglishTest; setTest(nt); setScore(ENGLISH_TESTS.find((x) => x.id === nt)!.def); }} className={field}>
            {ENGLISH_TESTS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </div>
        <Slider id="score" text="Your score" value={score} min={t.min} max={t.max} step={t.step} onChange={setScore} fmtV={(n) => (t.step < 1 ? n.toFixed(1) : String(n))} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Slider id="work" text="Work experience" value={work} min={0} max={10} step={1} onChange={setWork} fmtV={(n) => `${n} yr${n === 1 ? "" : "s"}`} />
        <Slider id="budget" text="Tuition budget / year" value={budget} min={10000} max={60000} step={1000} onChange={setBudget} fmtV={(n) => `S$${(n / 1000).toFixed(0)}k`} />
      </div>
      <Primary
        onClick={() =>
          answer({
            patch: { qualification, gpa, englishTest: test, englishScore: score, workYears: work, budget },
            user: `GPA ${gpa.toFixed(1)} · ${t.label} ${t.step < 1 ? score.toFixed(1) : score} · ${work} yr${work === 1 ? "" : "s"} experience · S$${(budget / 1000).toFixed(0)}k budget`,
            next: "contact",
            quest: "academic",
          })
        }
      >
        Continue <ArrowRight size={16} />
      </Primary>
    </Panel>
  );
}

/* ---------------- 6. contact ---------------- */
const CODES = [["+91", "India"], ["+94", "Sri Lanka"], ["+65", "Singapore"], ["+60", "Malaysia"], ["+61", "Australia"], ["+44", "UK"]];

export function ContactWidget({ state, answer }: { state: JourneyState; answer: Answer }) {
  const p = state.profile;
  const [code, setCode] = useState(p.phoneCode);
  const [phone, setPhone] = useState(p.phone);
  const [email, setEmail] = useState(p.email);
  const [consent, setConsent] = useState(p.consent);
  const valid = phone.replace(/\D/g, "").length >= 7 && /^\S+@\S+\.\S+$/.test(email) && consent;
  return (
    <Panel className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
        <div>
          <label htmlFor="code" className={label}>Country code</label>
          <select id="code" value={code} onChange={(e) => setCode(e.target.value)} className={field}>
            {CODES.map(([c, n]) => <option key={c} value={c}>{c} {n}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="phone" className={label}>Mobile / WhatsApp</label>
          <input id="phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" className={field} />
        </div>
      </div>
      <div>
        <label htmlFor="email" className={label}>Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={field} />
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-nova-600" />
        <span>I agree that NXT Chapter may store my details and contact me about my university options (PDPA consent).</span>
      </label>
      <Primary disabled={!valid} onClick={() => answer({ patch: { phoneCode: code, phone, email, consent }, user: "Contact details shared", next: "documents", quest: "contact" })}>
        Continue <ArrowRight size={16} />
      </Primary>
    </Panel>
  );
}

/* ---------------- 7. documents ---------------- */
const SCAN_STEPS = ["Uploading securely", "Reading document", "Extracting details", "Checking authenticity"];

function DocCard({ kind, title, hint, xp, done, onVerified, profile }: {
  kind: "transcript" | "english"; title: string; hint: string; xp: number; done?: DocResult;
  onVerified: (d: DocResult) => void; profile: Profile;
}) {
  const [scan, setScan] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = (fileName: string) => {
    setErr("");
    setScan(0);
    SCAN_STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setScan(i + 1), 420 * (i + 1)));
    });
    timers.current.push(setTimeout(() => {
      setScan(null);
      onVerified(kind === "transcript" ? simulateTranscript(profile, fileName) : simulateEnglish(profile, fileName));
    }, 420 * SCAN_STEPS.length + 250));
  };
  const take = (f?: File) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return setErr("File is over 10 MB. Please choose a smaller file.");
    if (!/pdf|image\//.test(f.type)) return setErr("Please upload a PDF, JPG or PNG.");
    run(f.name);
  };

  if (done)
    return (
      <div className="anim-pop rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500 text-white"><ShieldCheck size={18} /></span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-emerald-900">{title} verified</div>
            <div className="truncate text-xs text-emerald-700">{done.fileName}</div>
          </div>
          <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">+{xp} XP</span>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-xl bg-white/80 p-3 text-xs">
          {done.fields.map(([k, v]) => (
            <div key={k}><dt className="text-muted">{k}</dt><dd className="font-semibold text-ink">{v}</dd></div>
          ))}
        </dl>
      </div>
    );

  if (scan !== null)
    return (
      <div className="relative overflow-hidden rounded-2xl border border-nova-200 bg-nova-50/60 p-4">
        <span className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-nova-500 to-transparent" style={{ animation: "scan 1.1s ease-in-out infinite alternate" }} />
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-nova-600" />
          <div className="text-sm font-semibold text-nova-800">Checking your {title.toLowerCase()}…</div>
        </div>
        <ul className="mt-3 space-y-1.5 text-xs">
          {SCAN_STEPS.map((s, i) => (
            <li key={s} className={`flex items-center gap-2 ${i < scan ? "text-emerald-700" : i === scan ? "font-semibold text-nova-700" : "text-muted"}`}>
              {i < scan ? <Check size={13} strokeWidth={3} /> : <span className="h-[13px] w-[13px]" />} {s}
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files?.[0]); }}
      className={`rounded-2xl border-2 border-dashed p-4 text-center transition ${drag ? "border-nova-500 bg-nova-50" : "border-nova-200 bg-white"}`}
    >
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-nova-50 text-nova-600"><FileText size={22} /></span>
      <div className="mt-2 text-sm font-semibold text-nova-900">{title} <span className="text-nova-500">+{xp} XP</span></div>
      <div className="text-xs text-muted">{hint}</div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button onClick={() => input.current?.click()} className="inline-flex items-center gap-1.5 rounded-full bg-nova-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-nova-700">
          <Upload size={14} /> Choose file
        </button>
        <button onClick={() => run(kind === "transcript" ? "sample-transcript.pdf" : "sample-english-score.pdf")} className="inline-flex items-center gap-1.5 rounded-full border border-nova-200 px-4 py-2 text-xs font-semibold text-nova-700 transition hover:bg-nova-50">
          <Sparkles size={14} /> Use sample
        </button>
      </div>
      <input ref={input} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => { take(e.target.files?.[0]); e.target.value = ""; }} />
      {err && <div className="mt-2 text-xs font-medium text-rose-600">{err}</div>}
    </div>
  );
}

export function DocumentsWidget({ state, onDoc, onBaseline, answer }: {
  state: JourneyState;
  onDoc: (kind: "transcript" | "english", d: DocResult) => void;
  onBaseline: (b: Record<string, number>) => void;
  answer: Answer;
}) {
  const { transcript, english } = state.docs;
  const hasBaseline = Object.keys(state.baseline).length > 0;
  const declared = useMemo(() => declaredInput(state), [state]);
  useEffect(() => {
    if (hasBaseline || transcript || english) return;
    onBaseline(Object.fromEntries(getMatches(declared, 50).map((m) => [m.programme.id, m.total])));
  }, [hasBaseline, transcript, english, declared, onBaseline]);

  return (
    <Panel className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <DocCard kind="transcript" title="Academic transcript" hint="PDF, JPG or PNG · max 10 MB" xp={15} done={transcript} profile={state.profile} onVerified={(d) => onDoc("transcript", d)} />
        <DocCard kind="english" title="English test result" hint="IELTS, TOEFL, PTE or Duolingo" xp={15} done={english} profile={state.profile} onVerified={(d) => onDoc("english", d)} />
      </div>
      {transcript && english && (
        <Primary className="w-full" onClick={() => answer({ user: "Show my matches", next: "matches", quest: "matches" })}>
          Unlock my university matches <ArrowRight size={16} />
        </Primary>
      )}
      <p className="text-center text-[11px] text-muted">Prototype: document reading is simulated with sample data.</p>
    </Panel>
  );
}

