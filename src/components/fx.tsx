"use client";

import { useEffect, useImperativeHandle, useRef } from "react";
import { Award, Sparkles, TrendingUp } from "lucide-react";

export type Toast = { id: number; kind: "xp" | "badge" | "level"; text: string; sub?: string };

export function Toasts({ items }: { items: Toast[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
      {items.map((t) =>
        t.kind === "xp" ? (
          <div key={t.id} className="anim-toast flex items-center gap-1.5 rounded-full bg-nova-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-nova-600/30">
            <Sparkles size={15} /> {t.text}
          </div>
        ) : (
          <div key={t.id} className="anim-toast flex items-center gap-3 rounded-2xl border border-nova-100 bg-white px-4 py-3 shadow-xl shadow-nova-900/10">
            <span className={`grid h-10 w-10 place-items-center rounded-full text-white ${t.kind === "badge" ? "bg-gradient-to-br from-gold to-amber-500" : "bg-gradient-to-br from-nova-400 to-nova-700"}`}>
              {t.kind === "badge" ? <Award size={20} /> : <TrendingUp size={20} />}
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{t.kind === "badge" ? "Badge unlocked" : "Level up"}</div>
              <div className="text-sm font-semibold text-nova-800">{t.text}</div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

export type ConfettiHandle = { fire: (power?: number) => void };

const COLORS = ["#8e6fc0", "#b79be0", "#f5b83d", "#dcccf2", "#5f4390", "#34d399"];

export function Confetti({ ref }: { ref: React.Ref<ConfettiHandle> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  useImperativeHandle(ref, () => ({
    fire(power = 1) {
      const c = canvas.current;
      if (!c || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const dpr = window.devicePixelRatio || 1;
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      const ctx = c.getContext("2d")!;
      ctx.scale(dpr, dpr);
      const n = Math.round(90 * power);
      const parts = Array.from({ length: n }, () => ({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
        y: window.innerHeight * 0.35,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 11 - 3,
        s: Math.random() * 7 + 4,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
      const start = performance.now();
      cancelAnimationFrame(raf.current);
      const tick = (now: number) => {
        const t = now - start;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        for (const p of parts) {
          p.vy += 0.28; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx *= 0.99;
          ctx.save();
          ctx.translate(p.x, p.y); ctx.rotate(p.r);
          ctx.globalAlpha = Math.max(0, 1 - t / 2200);
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.6);
          ctx.restore();
        }
        if (t < 2200) raf.current = requestAnimationFrame(tick);
        else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      };
      raf.current = requestAnimationFrame(tick);
    },
  }), []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-[60] h-full w-full" aria-hidden />;
}
