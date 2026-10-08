"use client";

import dynamic from "next/dynamic";
import { useWebGL } from "@/lib/hooks";

const CrystalScene = dynamic(() => import("./CrystalScene"), { ssr: false });

/** A 3D gem that grows, spins faster and gains orbiting shards as the student earns XP. */
export default function XPCrystal({ xp, level, className = "h-24 w-24" }: { xp: number; level: number; className?: string }) {
  const ok = useWebGL();
  return (
    <div className={className} aria-hidden>
      {ok ? (
        <CrystalScene xp={xp} level={level} />
      ) : (
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#b79be0_40%,#5f4390)] opacity-80" />
      )}
    </div>
  );
}
