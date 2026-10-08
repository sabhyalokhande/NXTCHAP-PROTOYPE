"use client";

import dynamic from "next/dynamic";
import { useWebGL } from "@/lib/hooks";
import type { GlobeProps } from "./GlobeScene";

export function GlobeFallback() {
  return (
    <div className="grid h-full w-full place-items-center" aria-hidden>
      <div className="relative aspect-square w-[62%] max-w-[420px] rounded-full bg-[radial-gradient(circle_at_32%_28%,#8e6fc0,#43306a_55%,#150c2b)] shadow-[0_0_80px_rgba(142,111,192,.45)]">
        <div className="absolute inset-0 animate-pulse rounded-full bg-[radial-gradient(circle_at_70%_75%,rgba(245,184,61,.25),transparent_45%)]" />
      </div>
    </div>
  );
}

const GlobeScene = dynamic(() => import("./GlobeScene"), { ssr: false, loading: () => <GlobeFallback /> });

export default function Globe(props: GlobeProps) {
  const ok = useWebGL();
  return ok ? <GlobeScene {...props} /> : <GlobeFallback />;
}
