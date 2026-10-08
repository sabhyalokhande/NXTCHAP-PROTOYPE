"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { hasWebGL } from "./geo";

const noop = () => () => {};

export const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

/** false on the server and during hydration, then true/false once WebGL is probed. */
export const useWebGL = () => useSyncExternalStore(noop, hasWebGL, () => false);

export const useReducedMotion = () =>
  useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

/** Smoothly counts toward `target` whenever it changes. */
export function useCountUp(target: number, ms = 900) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const f0 = from.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const val = f0 + (target - f0) * (1 - Math.pow(1 - p, 3));
      from.current = val;
      setV(val);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return Math.round(v);
}
