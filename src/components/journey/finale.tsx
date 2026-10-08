"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, Bookmark, BookmarkCheck, CheckCircle2, ChevronDown, MapPin, RotateCcw, Tag } from "lucide-react";
import { countryName } from "@/lib/data";
import { WEIGHTS, QUALIFY_THRESHOLD, type Match } from "@/lib/match";
import { BADGES, badgesOf, docsVerified, isQualified, matchesOf, type JourneyState, type Profile } from "@/lib/journey";
import { COUNSELLOR } from "@/lib/leads";
import { Primary, type Answer } from "./widgets";
import Tilt from "@/components/Tilt";
import XPCrystal from "@/components/three/XPCrystal";
import { useCountUp } from "@/lib/hooks";

const LIKE: Record<Match["likelihood"], string> = {
  High: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Medium: "bg-amber-50 text-amber-700 ring-amber-200",
  Low: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function Ring({ value, size = 58 }: { value: number; size?: number }) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  const color = value >= 75 ? "#10b981" : value >= 55 ? "#f59e0b" : "#f43f5e";
  const shown = useCountUp(value, 1000);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f4eefb" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: "stroke-dashoffset .9s ease" }} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-bold text-nova-900">{shown}%</span>
    </div>
  );
}

export function Breakdown({ m }: { m: Match }) {
  const rows: [string, number, number][] = [
    ["GPA fit", m.parts.gpa, WEIGHTS.gpa], ["English fit", m.parts.english, WEIGHTS.english], ["Course fit", m.parts.course, WEIGHTS.course],
    ["Budget fit", m.parts.budget, WEIGHTS.budget], ["Visa strength", m.parts.visa, WEIGHTS.visa],
  ];
  return (
    <div className="space-y-2">
      {rows.map(([k, v, w]) => (
        <div key={k} className="grid grid-cols-[92px_1fr_40px] items-center gap-2 text-xs">
          <span className="text-muted">{k} <span className="text-nova-300">{Math.round(w * 100)}%</span></span>
          <span className="h-1.5 overflow-hidden rounded-full bg-nova-50"><span className="block h-full rounded-full bg-nova-500" style={{ width: `${v}%` }} /></span>
          <span className="text-right font-semibold text-nova-800">{v}%</span>
        </div>
      ))}
    </div>
  );
}

function MatchCard({ m, rank, on, onToggle, delta, intake }: { m: Match; rank: number; on: boolean; onToggle: () => void; delta?: number; intake?: string }) {
  const [open, setOpen] = useState(false);
  const p = m.programme;
  return (
    <Tilt max={3.5} className="rounded-2xl"><div className={`anim-fade-up rounded-2xl border bg-white p-4 transition ${on ? "border-nova-400 shadow-lg shadow-nova-600/10" : "border-nova-100 hover:shadow-lg hover:shadow-nova-600/10"}`} style={{ animationDelay: `${rank * 70}ms` }}>
      <div className="flex gap-3">
        <Ring value={m.total} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-nova-400">#{rank + 1}</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${LIKE[m.likelihood]}`}>{m.likelihood} likelihood</span>
            {delta ? (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${delta > 0 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"}`}>
                {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}% after verification
              </span>
            ) : null}
          </div>
          <div className="mt-0.5 text-sm font-semibold leading-snug text-nova-900">{p.institution}</div>
          <div className="text-sm text-ink">{p.name}</div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1"><MapPin size={12} /> {p.city}</span>
            <span>S${p.tuition.toLocaleString()}/yr</span>
            <span>{intake && p.intakes.includes(intake) ? `${intake} intake ✓` : `Next intake ${p.intakes[0]}`}</span>
            {p.scholarship ? <span className="inline-flex items-center gap-1 text-emerald-700"><Tag size={12} /> Scholarship up to S${p.scholarship.toLocaleString()}</span> : null}
          </div>
          {m.pathway && <div className="mt-1.5 inline-block rounded-lg bg-nova-50 px-2 py-1 text-xs font-medium text-nova-700">Pathway: {m.pathway}</div>}
        </div>
        <button
          onClick={onToggle}
          aria-pressed={on}
          aria-label={on ? "Remove from shortlist" : "Add to shortlist"}
          className={`h-10 w-10 shrink-0 rounded-xl border transition active:scale-95 ${on ? "border-nova-600 bg-nova-600 text-white" : "border-nova-100 text-nova-500 hover:bg-nova-50"}`}
        >
          {on ? <BookmarkCheck size={18} className="mx-auto" /> : <Bookmark size={18} className="mx-auto" />}
        </button>
      </div>
      <button onClick={() => setOpen((o) => !o)} className="mt-3 flex items-center gap-1 text-xs font-semibold text-nova-600">
        Why this match? <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="anim-fade-up mt-3 border-t border-line pt-3"><Breakdown m={m} /></div>}
    </div></Tilt>
  );
}

export function MatchesWidget({ state, onToggle, answer }: { state: JourneyState; onToggle: (id: string) => void; answer: Answer }) {
  const matches = matchesOf(state);
  const qualified = isQualified(state);
  const best = matches[0]?.total ?? 0;
  const n = state.shortlist.length;
  return (
    <div className="space-y-3">
      <div className={`anim-fade-up flex items-center gap-3 rounded-2xl p-3.5 text-sm ${qualified ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
        <CheckCircle2 size={20} className={qualified ? "text-emerald-600" : "text-amber-600"} />
        <span>
          <b>{qualified ? "Qualified" : "Not yet qualified"}</b>: best match {best}% · threshold {QUALIFY_THRESHOLD}% · documents {docsVerified(state) ? "verified" : "pending"}
        </span>
      </div>
      {matches.map((m, i) => (
        <MatchCard
          key={m.programme.id} m={m} rank={i} on={state.shortlist.includes(m.programme.id)} onToggle={() => onToggle(m.programme.id)}
          delta={state.baseline[m.programme.id] !== undefined ? m.total - state.baseline[m.programme.id] : undefined} intake={state.profile.intake}
        />
      ))}
      <div className="sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-2xl border border-nova-100 bg-white/95 p-3 shadow-lg backdrop-blur">
        <span className="text-sm font-medium text-nova-800">{n} / 3 shortlisted</span>
        <Primary
          disabled={n < 3}
          onClick={() => answer({ user: "Meet my counsellor", next: qualified ? "handoff" : "nurture" })}
        >
          Meet my counsellor <ArrowRight size={16} />
        </Primary>
      </div>
    </div>
  );
}

export function HandoffWidget({ state, onSubmit }: { state: JourneyState; onSubmit: (patch: Partial<Profile>) => void }) {
  const [pref, setPref] = useState<Profile["contactPref"]>(state.profile.contactPref);
  const [time, setTime] = useState<Profile["contactTime"]>(state.profile.contactTime);
  const best = matchesOf(state)[0]?.total ?? 0;
  const items = [
    `Profile: ${countryName(state.profile.country)} · GPA ${(state.docs.transcript?.gpa ?? state.profile.gpa).toFixed(1)} · budget S$${(state.profile.budget / 1000).toFixed(0)}k`,
    "Transcript and English score, verified",
    `Shortlist of ${state.shortlist.length} universities with match scores (best ${best}%)`,
    "Your full journey history, so you never repeat yourself",
  ];
  const chip = (on: boolean) => `rounded-full border px-4 py-2 text-sm font-medium transition ${on ? "border-nova-600 bg-nova-600 text-white" : "border-nova-100 bg-white text-nova-800 hover:bg-nova-50"}`;
  return (
    <div className="anim-fade-up space-y-4 rounded-2xl border border-nova-100 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Your counsellor will receive</div>
        <ul className="space-y-2">
          {items.map((t) => (
            <li key={t} className="flex items-start gap-2.5 text-sm text-ink"><CheckCircle2 size={18} className="mt-px shrink-0 text-emerald-500" /> {t}</li>
          ))}
        </ul>
      </div>
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Contact me via</div>
        <div className="flex flex-wrap gap-2">{(["WhatsApp", "Phone call", "Email"] as const).map((o) => <button key={o} className={chip(pref === o)} onClick={() => setPref(o)}>{o}</button>)}</div>
      </div>
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Best time</div>
        <div className="flex flex-wrap gap-2">{(["Morning", "Afternoon", "Evening"] as const).map((o) => <button key={o} className={chip(time === o)} onClick={() => setTime(o)}>{o}</button>)}</div>
      </div>
      <Primary className="w-full" onClick={() => onSubmit({ contactPref: pref, contactTime: time })}>Send to my counsellor <ArrowRight size={16} /></Primary>
    </div>
  );
}

export function NurtureWidget({ onRevise, onReset }: { onRevise: () => void; onReset: () => void }) {
  return (
    <div className="anim-fade-up flex flex-wrap gap-2.5">
      <Primary onClick={onRevise}>Adjust my details</Primary>
      <button onClick={onReset} className="inline-flex items-center gap-2 rounded-full border border-nova-200 px-5 py-3 text-sm font-semibold text-nova-700 hover:bg-nova-50"><RotateCcw size={15} /> Start over</button>
    </div>
  );
}

export function DoneWidget({ state, onReset }: { state: JourneyState; onReset: () => void }) {
  const earned = new Set(badgesOf(state));
  return (
    <div className="anim-pop overflow-hidden rounded-3xl border border-nova-100 bg-white shadow-xl shadow-nova-600/10">
      <div className="bg-gradient-to-br from-nova-900 via-nova-700 to-nova-500 p-6 text-center text-white">
        <div className="mx-auto -mb-2 -mt-3 h-40 w-40"><XPCrystal xp={100} level={5} className="h-40 w-40" /></div>
        <div className="mt-3 text-xl font-semibold">Handed off to your counsellor</div>
        <div className="mt-1 text-sm text-nova-100">100 / 100 XP · Level 5 · all badges earned</div>
        <div className="mt-3 flex justify-center gap-1.5">
          {BADGES.map((b) => <Award key={b.id} size={22} className={earned.has(b.id) ? "text-gold" : "text-white/30"} />)}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-3 rounded-2xl bg-nova-50 p-3.5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-nova-600 text-sm font-bold text-white">PM</span>
          <div>
            <div className="text-sm font-semibold text-nova-900">{COUNSELLOR}</div>
            <div className="text-xs text-muted">Senior counsellor (demo). Will reach you on {state.profile.contactPref}, {state.profile.contactTime.toLowerCase()}.</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href={`/counsellor?lead=${state.id}`} className="inline-flex items-center gap-2 rounded-full bg-nova-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-nova-600/25 transition hover:bg-nova-700">
            See what your counsellor sees <ArrowRight size={16} />
          </Link>
          <button onClick={onReset} className="inline-flex items-center gap-2 rounded-full border border-nova-200 px-5 py-3 text-sm font-semibold text-nova-700 hover:bg-nova-50"><RotateCcw size={15} /> Start over</button>
        </div>
      </div>
    </div>
  );
}
