"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useReducedMotion } from "@/lib/hooks";

const PALETTE = ["#b79be0", "#8e6fc0", "#c26fd8", "#f59e3d", "#f5c63d"];

function Gem({ xp, level }: { xp: number; level: number }) {
  const body = useRef<THREE.Group>(null);
  const boost = useRef(0);
  const prev = useRef(xp);
  const reduced = useReducedMotion();
  const color = PALETTE[Math.min(4, level - 1)];

  useEffect(() => {
    if (xp > prev.current) boost.current = 1;
    prev.current = xp;
  }, [xp]);

  useFrame((state, dt) => {
    const g = body.current;
    if (!g) return;
    boost.current = Math.max(0, boost.current - dt * 1.3);
    const want = (0.55 + 0.45 * (xp / 100)) * (1 + 0.28 * Math.sin(boost.current * Math.PI));
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x || want, want, 0.16));
    if (!reduced) g.rotation.y += dt * (0.55 + boost.current * 5);
  });

  return (
    <Float speed={reduced ? 0 : 2} rotationIntensity={0.25} floatIntensity={0.5}>
      <group ref={body}>
        <mesh>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} metalness={0.35} roughness={0.18} flatShading />
        </mesh>
        <mesh scale={1.14}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.28} />
        </mesh>
        {Array.from({ length: level }).map((_, i) => (
          <OrbitGem key={i} i={i} n={level} color={color} />
        ))}
      </group>
    </Float>
  );
}

function OrbitGem({ i, n, color }: { i: number; n: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const reduced = useReducedMotion();
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const a = (reduced ? 0 : clock.elapsedTime * 0.9) + (i / n) * Math.PI * 2;
    m.position.set(Math.cos(a) * 1.65, Math.sin(a * 1.3) * 0.35, Math.sin(a) * 1.65);
  });
  return (
    <mesh ref={ref} scale={0.13}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={color === PALETTE[0] ? "#ffffff" : "#ffe9a8"} />
    </mesh>
  );
}

export default function CrystalScene({ xp, level }: { xp: number; level: number }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4.4], fov: 36 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.9} />
      <pointLight position={[3, 3, 4]} intensity={55} color="#ffffff" />
      <pointLight position={[-3, -2, 2]} intensity={35} color="#8e6fc0" />
      <Gem xp={xp} level={level} />
    </Canvas>
  );
}
