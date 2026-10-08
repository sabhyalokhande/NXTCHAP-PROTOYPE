"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Gem, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import Globe from "@/components/three/Globe";
import SiteHeader from "@/components/SiteHeader";

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <section
      ref={ref}
      onPointerMove={move}
      className="grain relative isolate overflow-hidden bg-nova-900 text-white"
      style={{ "--mx": "70%", "--my": "30%" } as React.CSSProperties}
    >
      <SiteHeader tone="dark" active="home" />
      <div className="aurora aurora-a -left-40 top-0 h-[520px] w-[520px] bg-nova-600/45" />
      <div className="aurora aurora-b -right-32 top-1/4 h-[560px] w-[560px] bg-fuchsia-500/20" />
      <div className="aurora aurora-a bottom-0 left-1/3 h-[360px] w-[360px] bg-gold/10" />
      <div className="grid-lines absolute inset-0" />
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(560px circle at var(--mx) var(--my), rgba(183,155,224,.22), transparent 60%)" }} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-4 px-4 pb-20 pt-28 sm:px-6 lg:min-h-[100svh] lg:grid-cols-[0.95fr_1.05fr] lg:pb-16 lg:pt-20">
        <div className="relative z-10">
          <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-nova-100">
            <span className="relative grid h-2 w-2 place-items-center"><span className="ping-soft absolute h-2 w-2 rounded-full bg-emerald-400" /><span className="h-2 w-2 rounded-full bg-emerald-400" /></span>
            Nova is online · 24/7 pre-counselling
          </span>
          <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.04] tracking-tight sm:text-6xl">
            Study abroad,<br />without the <span className="text-shimmer">overwhelm.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-nova-100/90 sm:text-lg">
            Play through your goals, verify your documents in seconds and watch your best-fit universities light up. Then meet a human counsellor who already knows your story.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/journey?src=website" className="btn-shine group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-gold to-amber-400 px-8 py-4 text-sm font-bold text-nova-900 shadow-[0_10px_40px_-8px_rgba(245,184,61,.65)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-8px_rgba(245,184,61,.8)] active:scale-[.98]">
              Start my quest <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
            <Link href="/counsellor" className="glass inline-flex items-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/15">
              See the counsellor view
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-nova-100">
            {["Verified documents", "Transparent match scores", "Human counsellor handover"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5"><BadgeCheck size={17} className="text-emerald-400" /> {t}</span>
            ))}
          </div>
        </div>

        <div className="relative h-[430px] sm:h-[560px] lg:h-[680px]">
          <div className="absolute -inset-x-6 inset-y-0 lg:-right-16"><Globe interactive={false} /></div>

          <div className="glass float-a absolute left-0 top-6 z-10 flex max-w-[210px] items-start gap-2.5 rounded-2xl p-3 text-xs shadow-xl shadow-black/20 sm:left-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-nova-300 to-nova-600 font-bold">N</span>
            <span><b className="block text-[11px] text-nova-200">Nova</b>Which country are you most interested in?</span>
          </div>
          <div className="glass float-b absolute right-0 top-[22%] z-10 flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-xs shadow-xl shadow-black/20 sm:right-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500"><ShieldCheck size={16} /></span>
            <span><b className="block text-sm">Transcript verified</b><span className="text-emerald-300">+15 XP</span></span>
          </div>
          <div className="glass float-a absolute bottom-[18%] left-0 z-10 flex items-center gap-3 rounded-2xl px-3.5 py-3 text-xs shadow-xl shadow-black/20 sm:left-2" style={{ animationDelay: "-2s" }}>
            <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-emerald-400 text-sm font-bold">91%</span>
            <span><b className="block text-sm">Best match</b><span className="text-nova-200">High likelihood</span></span>
          </div>
          <div className="glass float-b absolute bottom-6 right-2 z-10 hidden items-center gap-2.5 rounded-2xl px-3.5 py-3 text-xs shadow-xl shadow-black/20 sm:flex" style={{ animationDelay: "-3s" }}>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-gold to-amber-500 text-nova-900"><Gem size={16} /></span>
            <span><b className="block text-sm">Level 5 · Ready</b><span className="text-nova-200">Handed to a counsellor</span></span>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-1.5 text-[11px] font-medium text-nova-200/80 sm:flex">
            <Sparkles size={12} /> Drag the globe to explore
          </div>
        </div>
      </div>

      <div className="relative border-y border-white/10 bg-nova-900/60 py-3.5 backdrop-blur">
        <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <div className="marquee gap-10 text-sm font-medium text-nova-100/80">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={k === 1}>
                {["24/7 pre-counselling", "Instant document checks", "Weighted match scores", "XP quests and badges", "QR · WhatsApp · referral entry", "Qualified leads, not cold enquiries", "Human counsellor handover"].map((t) => (
                  <span key={t + k} className="inline-flex items-center gap-2.5 whitespace-nowrap"><Gauge size={14} className="text-gold" /> {t}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
