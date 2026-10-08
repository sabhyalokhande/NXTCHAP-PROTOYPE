"use client";

import { useState } from "react";
import { Check, ChevronDown, Compass, Lock, Radio, Rocket, ShieldCheck, Star, UserCheck } from "lucide-react";
import { SOURCE_LABEL } from "@/lib/data";
import { useCountUp } from "@/lib/hooks";
import XPCrystal from "@/components/three/XPCrystal";
import {
  BADGES, LEVEL_TITLES, MAX_XP, QUESTS, badgesOf, completionOf, levelFor, xpOf,
  type BadgeId, type JourneyState,
} from "@/lib/journey";

const BADGE_ICON: Record<BadgeId, typeof Compass> = {
  explorer: Compass,
  profile: UserCheck,
  qualified: ShieldCheck,
  shortlister: Star,
  ready: Rocket,
};

export function XPBar({ xp, dark }: { xp: number; dark?: boolean }) {
  const pct = Math.min(100, (xp / MAX_XP) * 100);
  return (
    <div>
      <div className={`relative h-3 overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-nova-100"}`}>
        <div className="xp-shine h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
        {[25, 50, 75].map((t) => (
          <span key={t} className={`absolute top-0 h-full w-px ${dark ? "bg-white/30" : "bg-white/70"}`} style={{ left: `${t}%` }} />
        ))}
      </div>
    </div>
  );
}

export default function QuestPanel({ state }: { state: JourneyState }) {
  const [open, setOpen] = useState(false);
  const xp = xpOf(state);
  const level = levelFor(xp);
  const earned = new Set(badgesOf(state));
  const currentQuest = QUESTS.find((q) => !state.quests[q.id])?.id;
  const completion = completionOf(state);
  const shownXp = useCountUp(xp, 800);

  return (
    <aside className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
      <div className="bg-gradient-to-br from-nova-900 via-nova-800 to-nova-600 p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-widest text-nova-200">Your quest</div>
            <div className="mt-1 text-2xl font-semibold">Level {level}</div>
            <div className="text-sm text-nova-100">{LEVEL_TITLES[level - 1]}</div>
            <div className="mt-2 flex items-baseline gap-1"><span className="text-3xl font-bold leading-none">{shownXp}</span><span className="text-xs text-nova-200">/ {MAX_XP} XP</span></div>
          </div>
          <div className="-mr-3 -mt-3 shrink-0"><XPCrystal xp={xp} level={level} className="h-28 w-28" /></div>
        </div>
        <div className="mt-4"><XPBar xp={xp} dark /></div>
        <div className="mt-2 flex justify-between text-[10px] text-nova-200">
          {LEVEL_TITLES.map((t, i) => (
            <span key={t} className={level > i ? "font-semibold text-white" : ""}>{t}</span>
          ))}
        </div>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between border-b border-line px-5 py-3 text-sm font-semibold text-nova-700 lg:hidden"
      >
        Quest log &amp; badges
        <ChevronDown size={18} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      <div className={`${open ? "block" : "hidden"} lg:block`}>
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span>Profile completion</span>
            <span className="font-semibold text-nova-700">{completion}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-nova-50">
            <div className="h-full rounded-full bg-nova-500 transition-[width] duration-700" style={{ width: `${completion}%` }} />
          </div>
        </div>

        <div className="px-5 pt-5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">Quest log</div>
          <ul className="space-y-1">
            {QUESTS.map((q) => {
              const done = !!state.quests[q.id];
              const current = q.id === currentQuest;
              return (
                <li
                  key={q.id}
                  className={`flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition ${current ? "bg-nova-50 ring-1 ring-nova-100" : ""}`}
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-white transition ${
                      done ? "anim-pop border-emerald-500 bg-emerald-500" : current ? "border-nova-500" : "border-line"
                    }`}
                  >
                    {done && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className={`flex-1 ${done ? "text-muted line-through decoration-nova-200" : current ? "font-medium text-nova-800" : "text-ink"}`}>
                    {q.label}
                  </span>
                  <span className={`text-xs font-semibold ${done ? "text-emerald-600" : "text-nova-500"}`}>+{q.xp}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="px-5 pb-5 pt-5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">Badges</div>
          <div className="grid grid-cols-5 gap-2">
            {BADGES.map((b) => {
              const on = earned.has(b.id);
              const Icon = BADGE_ICON[b.id];
              return (
                <div key={b.id} className="text-center" title={`${b.label}: ${b.how}`}>
                  <div
                    className={`relative mx-auto grid h-11 w-11 place-items-center rounded-2xl transition ${
                      on ? "anim-pop bg-gradient-to-br from-gold to-amber-500 text-white shadow-md shadow-amber-500/30" : "bg-nova-50 text-nova-200"
                    }`}
                  >
                    <Icon size={20} />
                    {!on && <Lock size={10} className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 text-muted" />}
                  </div>
                  <div className={`mt-1.5 text-[10px] leading-tight ${on ? "font-semibold text-nova-800" : "text-muted"}`}>{b.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-line bg-nova-50/50 px-5 py-3 text-xs text-muted">
          <Radio size={13} className="text-nova-500" /> Entered via <span className="font-semibold text-nova-700">{SOURCE_LABEL[state.source]}</span>
        </div>
      </div>
    </aside>
  );
}
