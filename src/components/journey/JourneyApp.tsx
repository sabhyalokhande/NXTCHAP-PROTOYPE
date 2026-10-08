"use client";

import { useCallback, useEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import type { Source } from "@/lib/data";
import {
  BADGES, LEVEL_TITLES, badgesOf, introLines, levelFor, newJourney, reducer, xpOf,
  type Action, type DocResult, type JourneyState, type Profile,
} from "@/lib/journey";
import { K_JOURNEY, K_LEADS, leadFromJourney, readJSON, writeJSON, type Lead } from "@/lib/leads";
import { Confetti, Toasts, type ConfettiHandle, type Toast } from "@/components/fx";
import Ambient from "@/components/Ambient";
import QuestPanel from "./QuestPanel";
import {
  AcademicWidget, CountryWidget, ContactWidget, DocumentsWidget, InterestWidget, LevelWidget, NameWidget, type Answer,
} from "./widgets";
import { DoneWidget, HandoffWidget, MatchesWidget, NurtureWidget } from "./finale";

const SOURCES: Source[] = ["website", "qr", "whatsapp", "referral", "instagram"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const useMounted = () => useSyncExternalStore(() => () => {}, () => true, () => false);

function init(srcParam: string | null): JourneyState {
  const source = SOURCES.includes(srcParam as Source) ? (srcParam as Source) : undefined;
  const saved = typeof window !== "undefined" ? readJSON<JourneyState>(K_JOURNEY) : null;
  const untouched = saved && Object.keys(saved.quests).length === 0 && !saved.submittedAt;
  if (saved && saved.v === 1 && !(source && untouched)) return saved;
  return newJourney(source ?? saved?.source ?? "website");
}

function Bubble({ role, text }: { role: "nova" | "user"; text: string }) {
  if (role === "user")
    return (
      <div className="anim-fade-up flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-nova-600 px-4 py-2.5 text-sm text-white shadow-md shadow-nova-600/20">{text}</div>
      </div>
    );
  return (
    <div className="anim-fade-up flex items-end gap-2.5">
      <Avatar />
      <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-nova-100 bg-white px-4 py-2.5 text-sm leading-relaxed text-ink shadow-sm">{text}</div>
    </div>
  );
}

const Avatar = ({ active }: { active?: boolean }) => (
  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-nova-400 to-nova-700 text-xs font-bold text-white ${active ? "anim-glow" : ""}`}>N</span>
);

function Typing() {
  return (
    <div className="flex items-end gap-2.5">
      <Avatar active />
      <div className="flex gap-1 rounded-2xl rounded-bl-md border border-nova-100 bg-white px-4 py-3.5 shadow-sm">
        {[0, 1, 2].map((i) => <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-nova-400" style={{ animationDelay: `${i * 0.15}s` }} />)}
      </div>
    </div>
  );
}

export default function JourneyApp() {
  const params = useSearchParams();
  const mounted = useMounted();
  const [state, dispatch] = useReducer(reducer, params.get("src"), init);
  const [typing, setTyping] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const confetti = useRef<ConfettiHandle>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const prev = useRef<{ xp: number; badges: string[]; level: number } | null>(null);
  const toastId = useRef(0);

  useEffect(() => { stateRef.current = state; });

  // persist
  useEffect(() => { if (mounted) writeJSON(K_JOURNEY, state); }, [state, mounted]);

  // XP / badge / level feedback
  useEffect(() => {
    if (!mounted) return;
    const xp = xpOf(state);
    const badges = badgesOf(state);
    const level = levelFor(xp);
    const p = prev.current;
    prev.current = { xp, badges, level };
    if (!p) return;
    const add: Toast[] = [];
    const push = (t: Omit<Toast, "id">) => add.push({ ...t, id: ++toastId.current });
    if (xp > p.xp) push({ kind: "xp", text: `+${xp - p.xp} XP` });
    for (const b of badges) if (!p.badges.includes(b)) push({ kind: "badge", text: BADGES.find((x) => x.id === b)!.label });
    if (level > p.level) push({ kind: "level", text: `Level ${level} · ${LEVEL_TITLES[level - 1]}` });
    if (!add.length) return;
    if (add.some((t) => t.kind !== "xp")) confetti.current?.fire(add.some((t) => t.kind === "badge") ? 1 : 0.6);
    setToasts((cur) => [...cur, ...add]);
    const ids = add.map((t) => t.id);
    setTimeout(() => setToasts((cur) => cur.filter((t) => !ids.includes(t.id))), 2800);
  }, [state, mounted]);

  // Nova speaks when a step begins
  useEffect(() => {
    if (!mounted || state.introduced === state.step) return;
    const step = state.step;
    let cancelled = false;
    (async () => {
      const lines = introLines(step, stateRef.current);
      for (let i = 0; i < lines.length; i++) {
        setTyping(true);
        await sleep(i === 0 && stateRef.current.messages.length === 0 ? 450 : 600);
        if (cancelled) return;
        dispatch({ type: "messages", msgs: [{ id: `n:${step}:${i}`, role: "nova", text: lines[i] }] });
        setTyping(false);
        await sleep(140);
        if (cancelled) return;
      }
      dispatch({ type: "introduced", step });
    })();
    return () => { cancelled = true; setTyping(false); };
  }, [mounted, state.step, state.introduced]);

  const ready = state.introduced === state.step && !typing;
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [state.messages.length, typing, ready, state.shortlist.length]);

  const answer: Answer = useCallback((a) => dispatch({ type: "answer", ...a, at: Date.now() } as Action), []);
  const onDoc = useCallback((kind: "transcript" | "english", doc: DocResult) => dispatch({ type: "doc", kind, doc, at: Date.now() }), []);
  const onBaseline = useCallback((baseline: Record<string, number>) => dispatch({ type: "baseline", baseline }), []);
  const reset = () => dispatch({ type: "reset", source: state.source });

  const submit = (patch: Partial<Profile>) => {
    const at = Date.now();
    const next = reducer(state, { type: "submit", at, patch });
    const leads = readJSON<Lead[]>(K_LEADS) ?? [];
    writeJSON(K_LEADS, [leadFromJourney(next), ...leads.filter((l) => l.id !== next.id)]);
    dispatch({ type: "submit", at, patch });
    confetti.current?.fire(1.8);
  };

  if (!mounted)
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="h-[70vh] animate-pulse rounded-3xl bg-nova-50" />
      </main>
    );

  const widget = () => {
    switch (state.step) {
      case "name": return <NameWidget answer={answer} />;
      case "country": return <CountryWidget answer={answer} />;
      case "level": return <LevelWidget answer={answer} />;
      case "interest": return <InterestWidget answer={answer} />;
      case "academic": return <AcademicWidget state={state} answer={answer} />;
      case "contact": return <ContactWidget state={state} answer={answer} />;
      case "documents": return <DocumentsWidget state={state} onDoc={onDoc} onBaseline={onBaseline} answer={answer} />;
      case "matches": return <MatchesWidget state={state} onToggle={(id) => dispatch({ type: "shortlist", id, at: Date.now() })} answer={answer} />;
      case "handoff": return <HandoffWidget state={state} onSubmit={submit} />;
      case "nurture": return <NurtureWidget onRevise={() => dispatch({ type: "revise" })} onReset={reset} />;
      case "done": return <DoneWidget state={state} onReset={reset} />;
    }
  };

  return (
    <main className="mx-auto grid w-full max-w-7xl flex-1 items-start gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_360px]">
      <Ambient />
      <Toasts items={toasts} />
      <Confetti ref={confetti} />

      <div className="order-2 min-w-0 lg:order-1">
        <section className="overflow-hidden rounded-3xl border border-line bg-white/90 shadow-xl shadow-nova-600/5 backdrop-blur">
          <div className="flex items-center gap-3 border-b border-line bg-gradient-to-r from-nova-900 to-nova-700 px-5 py-3.5 text-white">
            <span className="anim-glow grid h-9 w-9 place-items-center rounded-full bg-white/15 text-sm font-bold">N</span>
            <div className="flex-1">
              <div className="text-sm font-semibold">Nova</div>
              <div className="flex items-center gap-1.5 text-xs text-nova-100"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Your NXT Chapter guide · online 24/7</div>
            </div>
            <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium transition hover:bg-white/20" title="Restart the demo journey">
              <RotateCcw size={13} /> Restart
            </button>
          </div>
          <div className="space-y-3 bg-gradient-to-b from-nova-50/60 to-white p-4 sm:p-5">
            {state.messages.map((m) => <Bubble key={m.id} role={m.role} text={m.text} />)}
            {typing && <Typing />}
            {ready && <div className="pl-0 sm:pl-10">{widget()}</div>}
            <div ref={endRef} />
          </div>
        </section>
        <p className="mt-3 text-center text-xs text-muted">Prototype · illustrative university catalogue · document checks are simulated</p>
      </div>

      <div className="scroll-thin order-1 rounded-3xl lg:sticky lg:top-20 lg:order-2 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"><QuestPanel state={state} /></div>
    </main>
  );
}
