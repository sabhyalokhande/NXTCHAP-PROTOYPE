import Link from "next/link";
import { ArrowRight, Camera, CheckCircle2, FileCheck2, Gamepad2, Globe, LineChart, MessageCircle, QrCode, Share2, ShieldCheck, UserRound } from "lucide-react";
import HeroSection from "@/components/landing/HeroSection";
import QuestMap from "@/components/landing/QuestMap";
import QrMock from "@/components/landing/QrMock";
import Reveal from "@/components/Reveal";
import Tilt from "@/components/Tilt";
import { Ring } from "@/components/journey/finale";

const STEPS = [
  { icon: Gamepad2, title: "Play through your goals", text: "Pick your country, level and field. Every step earns XP and unlocks the next one.", tone: "from-nova-500 to-nova-700" },
  { icon: FileCheck2, title: "Verify documents instantly", text: "Upload your transcript and English score. Nova checks them in seconds, no waiting.", tone: "from-emerald-400 to-emerald-600" },
  { icon: LineChart, title: "See exactly why you match", text: "Weighted scores across GPA, English, course, budget and visa strength, all explained.", tone: "from-amber-400 to-orange-500" },
  { icon: UserRound, title: "Meet a counsellor, fully briefed", text: "Your counsellor receives a qualified, documented profile. You never repeat yourself.", tone: "from-fuchsia-400 to-fuchsia-600" },
];

const ENTRIES = [
  { src: "qr", label: "QR code", icon: QrCode },
  { src: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { src: "referral", label: "Referral link", icon: Share2 },
  { src: "instagram", label: "Instagram", icon: Camera },
  { src: "website", label: "Website", icon: Globe },
];

export default function Home() {
  return (
    <>
      <HeroSection />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-nova-50 via-white to-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <Reveal>
              <span className="text-xs font-bold uppercase tracking-[.25em] text-nova-500">How it works</span>
              <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-nova-900 sm:text-4xl">
                From first question to counsellor call in four moves.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <Reveal key={s.title} delay={i * 110}>
                  <Tilt className="h-full rounded-3xl">
                    <div className="relative h-full overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-sm transition hover:shadow-2xl hover:shadow-nova-600/15">
                      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${s.tone}`} />
                      <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${s.tone} text-white shadow-lg [transform:translateZ(30px)]`}><s.icon size={23} /></span>
                      <div className="mt-5 text-xs font-bold text-nova-300">STEP {i + 1}</div>
                      <div className="mt-1 text-lg font-semibold leading-snug text-nova-900">{s.title}</div>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
                    </div>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="grain relative isolate overflow-hidden bg-nova-900 py-20 text-white">
          <div className="aurora aurora-b -left-20 top-0 h-80 w-80 bg-nova-600/40" />
          <div className="aurora aurora-a right-0 bottom-0 h-80 w-80 bg-gold/10" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <span className="text-xs font-bold uppercase tracking-[.25em] text-gold">The quest</span>
              <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                100 XP, eight milestones, five badges. Finishing feels like winning.
              </h2>
              <p className="mt-3 max-w-2xl text-nova-100/80">
                Gamification is what stops students abandoning half-way. Every milestone pays out XP, and the last one hands you to a human counsellor.
              </p>
            </Reveal>
            <Reveal delay={150} className="mt-10"><QuestMap /></Reveal>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[.25em] text-nova-500">Enter from anywhere</span>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-nova-900 sm:text-4xl">One journey. Every channel. Every student tagged.</h2>
            <p className="mt-4 max-w-lg text-ink">
              Students arrive through QR codes, WhatsApp, referral links, social campaigns or the website. Each entry point is tagged, so the counsellor view shows exactly where every student came from. Try one:
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {ENTRIES.map((e) => (
                <Link key={e.src} href={`/journey?src=${e.src}`} className="group inline-flex items-center gap-2 rounded-full border border-nova-200 bg-white px-4 py-2.5 text-sm font-semibold text-nova-700 transition hover:-translate-y-0.5 hover:border-nova-500 hover:bg-nova-600 hover:text-white hover:shadow-lg hover:shadow-nova-600/25">
                  <e.icon size={16} /> {e.label}
                </Link>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="relative mx-auto grid max-w-md grid-cols-2 items-center gap-5 rounded-[2rem] bg-gradient-to-br from-nova-100 via-nova-50 to-white p-6">
              <QrMock />
              <div className="float-b space-y-2">
                <div className="rounded-2xl rounded-bl-md bg-white p-3 text-xs leading-relaxed text-ink shadow-lg">
                  <b className="mb-1 block text-[11px] text-emerald-600">WhatsApp</b>
                  Hi! Ready to find your perfect university? Start your quest 👇
                </div>
                <div className="rounded-2xl rounded-br-md bg-nova-600 px-3 py-2 text-xs font-semibold text-white shadow-lg">Start my quest →</div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="bg-gradient-to-b from-white to-nova-50">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
            <Reveal>
              <span className="text-xs font-bold uppercase tracking-[.25em] text-nova-500">For counsellors</span>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-nova-900 sm:text-4xl">Qualified, documented leads. Never a cold enquiry.</h2>
              <ul className="mt-6 space-y-3">
                {["Profile, verified documents and match scores in one place", "A talking-points brief written from the student's own answers", "Full journey history, so no repeated questions", "Admin insights: channels, funnel and where students drop off"].map((t) => (
                  <li key={t} className="flex gap-3 text-ink"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={20} /> {t}</li>
                ))}
              </ul>
              <Link href="/counsellor" className="group mt-8 inline-flex items-center gap-2 rounded-full bg-nova-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-nova-600/30 transition hover:bg-nova-700">
                Open the counsellor view <ArrowRight size={17} className="transition group-hover:translate-x-1" />
              </Link>
            </Reveal>
            <Reveal delay={150}>
              <Tilt max={6} className="mx-auto max-w-lg rounded-3xl">
                <div className="rounded-3xl border border-line bg-white p-5 shadow-2xl shadow-nova-600/15">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-nova-500 font-bold text-white">AS</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-semibold text-nova-900">Aarav Sharma <span className="anim-glow rounded-full bg-rose-500 px-1.5 py-px text-[10px] font-bold text-white">LIVE</span></div>
                      <div className="text-xs text-muted">Australia · Master&apos;s · Business · via WhatsApp</div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700"><ShieldCheck size={12} /> Qualified</span>
                  </div>
                  <div className="mt-4 flex items-center gap-4 rounded-2xl bg-nova-50 p-3">
                    <Ring value={90} size={64} />
                    <div className="text-sm"><b className="text-nova-900">Best fit: UTS, Master of Business</b><div className="text-xs text-muted">High likelihood · GPA, English and budget verified</div></div>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-ink">
                    <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-nova-500" /> Budget is tight for 2 of the top 3. UTS offers scholarships up to S$5,000.</li>
                    <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-nova-500" /> 3 years of work experience strengthens a Master&apos;s application.</li>
                    <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-nova-500" /> Prefers WhatsApp in the evening.</li>
                  </ul>
                </div>
              </Tilt>
            </Reveal>
          </div>
        </section>

        <section className="grain relative isolate overflow-hidden bg-gradient-to-br from-nova-900 via-nova-800 to-nova-600 py-20 text-center text-white">
          <div className="aurora aurora-a left-1/4 top-0 h-72 w-72 bg-fuchsia-500/25" />
          <Reveal className="relative mx-auto max-w-2xl px-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Ready to start your quest?</h2>
            <p className="mt-4 text-nova-100/90">It takes about thirty seconds to see your first matches.</p>
            <Link href="/journey?src=website" className="btn-shine group mt-8 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-gold to-amber-400 px-9 py-4 text-sm font-bold text-nova-900 shadow-[0_10px_40px_-8px_rgba(245,184,61,.65)] transition hover:-translate-y-0.5">
              Start my quest <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </section>
      </main>
      <footer className="bg-nova-900 py-6 text-center text-xs text-nova-200/70">
        NXT Chapter Education · NOVA prototype · illustrative data, simulated document checks
      </footer>
    </>
  );
}
