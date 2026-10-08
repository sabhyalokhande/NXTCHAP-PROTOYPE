"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight, Award, BarChart3, Bookmark, Download, FileCheck2, Inbox, Mail, MessageCircle, Phone, Search, ShieldCheck, Trash2, TrendingDown,
} from "lucide-react";
import { SOURCE_LABEL, countryName, fieldLabel, levelLabel, type Source } from "@/lib/data";
import { BADGES, MAX_XP, STAGES, badgesOf, stageReached, xpOf, type JourneyState } from "@/lib/journey";
import {
  K_JOURNEY, K_LEADS, K_META, SEED_CHANNELS, SEED_FUNNEL, STATUSES, counsellorBrief, leadMatches, removeKey, seedLeads, timeline, useStored, writeJSON,
  type Lead, type LeadMeta, type LeadStatus,
} from "@/lib/leads";
import { ENGLISH_TESTS, fmtScore } from "@/lib/match";
import { Breakdown, Ring } from "@/components/journey/finale";
import Ambient from "@/components/Ambient";
import { useCountUp } from "@/lib/hooks";

const useMounted = () => useSyncExternalStore(() => () => {}, () => true, () => false);

const STATUS_STYLE: Record<LeadStatus, string> = {
  New: "bg-nova-100 text-nova-800",
  Contacted: "bg-sky-100 text-sky-800",
  "In discussion": "bg-amber-100 text-amber-800",
  Converted: "bg-emerald-100 text-emerald-800",
  Lost: "bg-slate-200 text-slate-700",
};
const LIKE: Record<string, string> = { High: "bg-emerald-50 text-emerald-700", Medium: "bg-amber-50 text-amber-700", Low: "bg-rose-50 text-rose-700" };
const AVATARS = ["bg-nova-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-rose-400", "bg-indigo-500"];

const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const colorFor = (n: string) => AVATARS[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATARS.length];
function ago(t: number, now: number) {
  const m = Math.max(1, Math.round((now - t) / 60000));
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}
const clock = (t: number) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function CountStat({ label, value, suffix = "", sub, delay }: { label: string; value: number; suffix?: string; sub: string; delay: number }) {
  const n = useCountUp(value, 1000);
  return (
    <div className="anim-fade-up rounded-2xl border border-line bg-white/90 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-nova-600/10" style={{ animationDelay: `${delay}ms` }}>
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="mt-1 text-3xl font-bold tracking-tight text-nova-800">{n}{suffix}</div>
      <div className="text-xs text-muted">{sub}</div>
    </div>
  );
}

function Card({ title, icon, children, className = "" }: { title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-line bg-white p-5 shadow-sm ${className}`}>
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted">{icon}{title}</h3>
      {children}
    </section>
  );
}

export default function CounsellorApp() {
  const mounted = useMounted();
  const params = useSearchParams();
  const liveLeads = useStored<Lead[]>(K_LEADS);
  const meta = useStored<Record<string, LeadMeta>>(K_META);
  const journey = useStored<JourneyState>(K_JOURNEY);
  const [seeds] = useState(() => seedLeads());
  const [now] = useState(() => Date.now());

  const [tab, setTab] = useState<"leads" | "insights">("leads");
  const [filter, setFilter] = useState<LeadStatus | "All">("All");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);

  const leads = useMemo(() => {
    const live = liveLeads ?? [];
    const liveIds = new Set(live.map((l) => l.id));
    return [...live, ...seeds.filter((s) => !liveIds.has(s.id))]
      .map((l) => ({ ...l, status: meta?.[l.id]?.status ?? l.status }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [liveLeads, seeds, meta]);

  if (!mounted) return <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6"><div className="h-[70vh] animate-pulse rounded-3xl bg-nova-50" /></main>;

  const wanted = sel ?? params.get("lead");
  const selected = leads.find((l) => l.id === wanted) ?? leads[0];
  const shown = leads.filter((l) => (filter === "All" || l.status === filter) && (!q || l.name.toLowerCase().includes(q.toLowerCase())));

  const bestOf = (l: Lead) => leadMatches(l)[0]?.total ?? 0;
  const avgMatch = Math.round(leads.reduce((n, l) => n + bestOf(l), 0) / leads.length);
  const avgMins = Math.round(leads.reduce((n, l) => n + ((l.quests.handoff ?? l.createdAt) - l.createdAt) / 60000, 0) / leads.length);
  const setMeta = (id: string, patch: LeadMeta) => writeJSON(K_META, { ...meta, [id]: { ...meta?.[id], ...patch } });

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6">
      <Ambient />
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-nova-100 bg-nova-50/70 px-4 py-3 text-sm text-nova-800">
        <span className="flex-1">
          <b>Demo workspace.</b> {seeds.length} sample students plus anyone who completes the journey live on this device appears here.
        </span>
        <Link href="/journey" className="inline-flex items-center gap-1.5 font-semibold text-nova-700 hover:underline">Open student journey <ArrowRight size={15} /></Link>
        <button
          onClick={() => { removeKey(K_LEADS); removeKey(K_META); removeKey(K_JOURNEY); setSel(null); }}
          className="inline-flex items-center gap-1.5 rounded-full border border-nova-200 bg-white px-3 py-1.5 text-xs font-semibold text-nova-700 hover:bg-nova-50"
        >
          <Trash2 size={13} /> Clear demo data
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <CountStat label="Qualified leads" value={leads.length} sub="all documents verified" delay={0} />
        <CountStat label="New" value={leads.filter((l) => l.status === "New").length} sub="waiting for first contact" delay={80} />
        <CountStat label="Average best match" value={avgMatch} suffix="%" sub="across qualified leads" delay={160} />
        <CountStat label="Time to qualify" value={avgMins} suffix=" min" sub="first click to handoff" delay={240} />
      </div>

      <div className="mb-4 inline-flex rounded-full bg-nova-50 p-1">
        {([["leads", "Lead inbox", Inbox], ["insights", "Insights", BarChart3]] as const).map(([id, text, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === id ? "bg-white text-nova-800 shadow-sm" : "text-nova-600"}`}>
            <Icon size={15} /> {text}
          </button>
        ))}
      </div>

      {tab === "insights" ? (
        <Insights leads={leads} journey={journey} />
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[340px_1fr]">
          <div className="min-w-0 rounded-2xl border border-line bg-white shadow-sm lg:sticky lg:top-20">
            <div className="space-y-3 border-b border-line p-3">
              <label className="relative block">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students" className="w-full rounded-xl border border-line py-2 pl-9 pr-3 text-sm outline-none focus:border-nova-400 focus:ring-4 focus:ring-nova-100" />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(["All", ...STATUSES] as const).map((s) => (
                  <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${filter === s ? "bg-nova-600 text-white" : "bg-nova-50 text-nova-700 hover:bg-nova-100"}`}>{s}</button>
                ))}
              </div>
            </div>
            <ul className="scroll-thin max-h-[62vh] divide-y divide-line overflow-y-auto">
              {shown.map((l) => (
                <li key={l.id}>
                  <button onClick={() => setSel(l.id)} className={`flex w-full items-center gap-3 px-3.5 py-3 text-left transition ${selected?.id === l.id ? "bg-nova-50" : "hover:bg-nova-50/50"}`}>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white ${colorFor(l.name)}`}>{initials(l.name)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-nova-900">{l.name}</span>
                        {l.live && <span className="anim-glow rounded-full bg-rose-500 px-1.5 py-px text-[10px] font-bold text-white">LIVE</span>}
                      </span>
                      <span className="block truncate text-xs text-muted">{countryName(l.profile.country)} · {levelLabel(l.profile.level)} · {fieldLabel(l.profile.field)}</span>
                      <span className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                        <span className={`rounded-full px-2 py-px font-semibold ${STATUS_STYLE[l.status]}`}>{l.status}</span>
                        {SOURCE_LABEL[l.source]} · {ago(l.createdAt, now)}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-nova-700">{bestOf(l)}%</span>
                  </button>
                </li>
              ))}
              {!shown.length && <li className="p-6 text-center text-sm text-muted">No students match.</li>}
            </ul>
          </div>

          {selected && <Detail key={selected.id} lead={selected} now={now} note={meta?.[selected.id]?.notes ?? ""} onStatus={(s) => setMeta(selected.id, { status: s })} onNote={(n) => setMeta(selected.id, { notes: n })} />}
        </div>
      )}
    </main>
  );
}

function Detail({ lead, now, note, onStatus, onNote }: { lead: Lead & { status: LeadStatus }; now: number; note: string; onStatus: (s: LeadStatus) => void; onNote: (n: string) => void }) {
  const matches = leadMatches(lead);
  const brief = counsellorBrief(lead);
  const events = timeline(lead);
  const earned = new Set(badgesOf({ quests: lead.quests } as JourneyState));
  const xp = xpOf({ quests: lead.quests } as JourneyState);
  const p = lead.profile;
  const test = ENGLISH_TESTS.find((t) => t.id === lead.input.englishTest)?.label;
  const dl = (k: string, v: string) => (
    <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="text-sm font-semibold text-ink">{v}</dd></div>
  );

  return (
    <div className="anim-fade-up min-w-0 space-y-4">
      <section className={`rounded-2xl border bg-white p-5 shadow-sm ${lead.live ? "border-rose-200 ring-4 ring-rose-50" : "border-line"}`}>
        <div className="flex flex-wrap items-center gap-4">
          <span className={`grid h-14 w-14 place-items-center rounded-full text-lg font-bold text-white ${colorFor(lead.name)}`}>{initials(lead.name)}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-xl font-semibold text-nova-900">{lead.name}</h2>
              {lead.live && <span className="anim-glow rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">LIVE</span>}
              {lead.qualified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"><ShieldCheck size={12} /> Qualified</span>}
            </div>
            <div className="mt-0.5 text-sm text-muted">Entered via {SOURCE_LABEL[lead.source]} · {ago(lead.createdAt, now)} · assigned to {lead.assignedTo}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 rounded-full bg-nova-50 px-3 py-1.5 font-semibold text-nova-700 hover:bg-nova-100"><Phone size={13} /> {lead.phone}</a>
              <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 rounded-full bg-nova-50 px-3 py-1.5 font-semibold text-nova-700 hover:bg-nova-100"><Mail size={13} /> {lead.email}</a>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-nova-50 px-3 py-1.5 font-semibold text-nova-700"><MessageCircle size={13} /> Prefers {p.contactPref}, {p.contactTime.toLowerCase()}</span>
            </div>
          </div>
          <label className="text-xs font-semibold text-muted">
            Status
            <select value={lead.status} onChange={(e) => onStatus(e.target.value as LeadStatus)} className={`mt-1 block rounded-xl border-0 px-3 py-2 text-sm font-semibold outline-none ring-1 ring-line focus:ring-2 focus:ring-nova-400 ${STATUS_STYLE[lead.status]}`}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Counsellor brief" className="bg-gradient-to-br from-nova-50 to-white xl:col-span-2">
          <ul className="grid gap-2 sm:grid-cols-2">
            {brief.map((b) => <li key={b} className="flex gap-2 text-sm leading-relaxed text-ink"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-nova-500" />{b}</li>)}
          </ul>
        </Card>

        <Card title="Profile">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            {dl("Destination", countryName(p.country))}
            {dl("Study level", levelLabel(p.level))}
            {dl("Field", fieldLabel(p.field))}
            {dl("Intake", p.intake ?? "-")}
            {dl("Qualification", p.qualification)}
            {dl("Verified GPA", `${lead.input.gpa.toFixed(1)} / 4.0`)}
            {dl("English", `${test} ${fmtScore(lead.input.englishTest, lead.input.englishScore)}`)}
            {dl("Work experience", `${p.workYears} yr${p.workYears === 1 ? "" : "s"}`)}
            {dl("Tuition budget", `S$${p.budget.toLocaleString()} / yr`)}
            {dl("Consent (PDPA)", p.consent ? "Given" : "Missing")}
          </dl>
        </Card>

        <Card title="Verified documents" icon={<FileCheck2 size={14} />}>
          <div className="space-y-2.5">
            {(["transcript", "english"] as const).map((k) => {
              const d = lead.docs[k];
              return d ? (
                <div key={k} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                    <ShieldCheck size={16} className="text-emerald-600" /> {k === "transcript" ? "Academic transcript" : "English test result"}
                    <span className="ml-auto truncate text-xs font-normal text-emerald-700">{d.fileName}</span>
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    {d.fields.map(([a, b]) => <div key={a}><dt className="text-muted">{a}</dt><dd className="font-semibold text-ink">{b}</dd></div>)}
                  </dl>
                </div>
              ) : null;
            })}
            <button disabled title="Prototype: download is not wired up" className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-nova-200 px-3 py-2 text-xs font-semibold text-nova-600 opacity-70">
              <Download size={14} /> Download all documents (.zip)
            </button>
          </div>
        </Card>

        <Card title="Match results" icon={<Bookmark size={14} />} className="xl:col-span-2">
          <div className="space-y-2">
            {matches.map((m, i) => (
              <details key={m.programme.id} className="group rounded-xl border border-line px-3 py-2.5 open:bg-nova-50/40">
                <summary className="flex cursor-pointer list-none items-center gap-3">
                  <Ring value={m.total} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-nova-900">{i + 1}. {m.programme.institution}</span>
                    <span className="block truncate text-xs text-muted">{m.programme.name} · S${m.programme.tuition.toLocaleString()}/yr</span>
                  </span>
                  {lead.shortlist.includes(m.programme.id) && <span className="hidden items-center gap-1 rounded-full bg-nova-600 px-2 py-0.5 text-[11px] font-semibold text-white sm:inline-flex"><Bookmark size={11} /> Shortlisted</span>}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${LIKE[m.likelihood]}`}>{m.likelihood}</span>
                </summary>
                <div className="mt-3 border-t border-line pt-3">
                  <Breakdown m={m} />
                  {m.pathway && <div className="mt-2 text-xs font-medium text-nova-700">Pathway: {m.pathway}</div>}
                </div>
              </details>
            ))}
          </div>
        </Card>

        <Card title="Journey history">
          <ol className="relative space-y-3 border-l border-nova-100 pl-5">
            {events.map((e, i) => (
              <li key={i} className="relative text-sm">
                <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white bg-nova-500 ring-2 ring-nova-100" />
                <div className="text-ink">{e.label}{e.xp ? <span className="ml-1.5 text-xs font-semibold text-emerald-600">+{e.xp} XP</span> : null}</div>
                <div className="text-xs text-muted">{clock(e.t)}</div>
              </li>
            ))}
          </ol>
        </Card>

        <div className="space-y-4">
          <Card title="Progress">
            <div className="flex items-center justify-between text-sm"><span className="text-muted">XP earned</span><span className="font-bold text-nova-800">{xp} / {MAX_XP}</span></div>
            <div className="mt-3 flex gap-2">
              {BADGES.map((b) => (
                <span key={b.id} title={b.label} className={`grid h-9 w-9 place-items-center rounded-xl ${earned.has(b.id) ? "bg-gradient-to-br from-gold to-amber-500 text-white" : "bg-nova-50 text-nova-200"}`}><Award size={17} /></span>
              ))}
            </div>
          </Card>
          <Card title="Counsellor notes">
            <textarea value={note} onChange={(e) => onNote(e.target.value)} rows={5} placeholder="Add notes for the parent call, next steps…" className="w-full resize-none rounded-xl border border-line p-3 text-sm outline-none focus:border-nova-400 focus:ring-4 focus:ring-nova-100" />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Insights({ leads, journey }: { leads: Lead[]; journey: JourneyState | null }) {
  const liveIds = new Set(leads.filter((l) => l.live).map((l) => l.id));
  const inProgress = journey && !journey.submittedAt && !liveIds.has(journey.id) ? journey : null;

  const channels = { ...SEED_CHANNELS } as Record<Source, number>;
  leads.filter((l) => l.live).forEach((l) => { channels[l.source]++; });
  if (inProgress) channels[inProgress.source]++;
  const chTotal = Object.values(channels).reduce((a, b) => a + b, 0);
  const chMax = Math.max(...Object.values(channels));

  const funnel = [...SEED_FUNNEL];
  leads.filter((l) => l.live).forEach(() => funnel.forEach((_, i) => { funnel[i]++; }));
  if (inProgress) { const r = stageReached(inProgress); funnel.forEach((_, i) => { if (i <= r) funnel[i]++; }); }

  let worst = 1, worstDrop = 0;
  for (let i = 1; i < funnel.length; i++) {
    const drop = funnel[i - 1] ? 1 - funnel[i] / funnel[i - 1] : 0;
    if (drop > worstDrop) { worstDrop = drop; worst = i; }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Where students come from" icon={<Inbox size={14} />}>
        <div className="space-y-3">
          {(Object.entries(channels) as [Source, number][]).sort((a, b) => b[1] - a[1]).map(([s, n]) => (
            <div key={s} className="grid grid-cols-[110px_1fr_70px] items-center gap-3 text-sm">
              <span className="text-ink">{SOURCE_LABEL[s]}</span>
              <span className="h-3 overflow-hidden rounded-full bg-nova-50"><span className="block h-full rounded-full bg-gradient-to-r from-nova-400 to-nova-600" style={{ width: `${(n / chMax) * 100}%` }} /></span>
              <span className="text-right text-xs text-muted"><b className="text-nova-800">{n}</b> · {Math.round((n / chTotal) * 100)}%</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">Every QR code, WhatsApp link, referral and campaign link is tagged at entry.</p>
      </Card>

      <Card title="Journey funnel and drop-off" icon={<TrendingDown size={14} />}>
        <div className="space-y-2.5">
          {STAGES.map((s, i) => (
            <div key={s} className="grid grid-cols-[130px_1fr_92px] items-center gap-3 text-sm">
              <span className="text-ink">{s}</span>
              <span className="h-5 overflow-hidden rounded-md bg-nova-50"><span className="block h-full rounded-md bg-nova-500/85" style={{ width: `${(funnel[i] / funnel[0]) * 100}%`, opacity: 1 - i * 0.08 }} /></span>
              <span className="text-right text-xs text-muted"><b className="text-nova-800">{funnel[i]}</b>{i > 0 && funnel[i - 1] ? ` · -${Math.round((1 - funnel[i] / funnel[i - 1]) * 100)}%` : ""}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Biggest drop-off: <b>{STAGES[worst - 1]} to {STAGES[worst]}</b> (-{Math.round(worstDrop * 100)}%). Partial students stay hidden from counsellors; only qualified leads are handed over.
        </p>
      </Card>
      <p className="text-xs text-muted lg:col-span-2">Seeded demo aggregates plus any live activity from this device.</p>
    </div>
  );
}
