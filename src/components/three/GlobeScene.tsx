"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls, Stars } from "@react-three/drei";
import { COUNTRIES, type CountryId } from "@/lib/data";
import { DEST, ORIGINS, landDotPositions, toVec3, type Place } from "@/lib/geo";
import { useReducedMotion } from "@/lib/hooks";

export interface GlobeProps {
  selected?: CountryId | null;
  hovered?: CountryId | null;
  /** Country the camera flies to. Defaults to the selection. */
  focus?: CountryId | null;
  onSelect?: (id: CountryId) => void;
  onHover?: (id: CountryId | null) => void;
  autoRotate?: boolean;
  stars?: boolean;
  /** Pins respond to clicks. */
  interactive?: boolean;
}

const LAVENDER = "#b79be0";
const GOLD = "#f5b83d";

const DOT_VERT = `
  uniform float uTime; uniform float uScale; attribute float aSeed; varying float vA; varying float vHot;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vec3 n = normalize(normalMatrix * position);
    float f = clamp(dot(n, normalize(-mv.xyz)), 0.0, 1.0);
    float tw = 0.72 + 0.28 * sin(uTime * 1.7 + aSeed * 60.0);
    vHot = step(0.93, aSeed) * (0.5 + 0.5 * sin(uTime * 2.4 + aSeed * 90.0));
    vA = (0.18 + 0.82 * pow(f, 0.55)) * tw;
    gl_PointSize = 0.021 * uScale / -mv.z * (0.65 + 0.55 * f) * (1.0 + vHot * 0.7);
  }`;
const DOT_FRAG = `
  uniform vec3 uColor; uniform vec3 uHot; varying float vA; varying float vHot;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.12, d) * vA;
    gl_FragColor = vec4(mix(uColor, uHot, vHot), a);
  }`;

function LandDots() {
  const positions = useMemo(() => landDotPositions(1.65), []);
  const seeds = useMemo(() => Float32Array.from({ length: positions.length / 3 }, (_, i) => (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1), [positions]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScale: { value: 900 }, uColor: { value: new THREE.Color(LAVENDER) }, uHot: { value: new THREE.Color("#ffffff") } }), []);
  const mat = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock, size, camera, viewport }) => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uTime.value = clock.elapsedTime;
    m.uniforms.uScale.value = (size.height / (2 * Math.tan(((camera as THREE.PerspectiveCamera).fov * Math.PI) / 360))) * viewport.dpr;
  });
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial ref={mat} transparent depthWrite={false} uniforms={uniforms} vertexShader={DOT_VERT} fragmentShader={DOT_FRAG} />
    </points>
  );
}

function Core() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
        fragmentShader:
          "varying vec3 vN; varying vec3 vV; void main(){ float r = pow(1.0 - clamp(dot(vN, vV), 0.0, 1.0), 2.2); vec3 base = mix(vec3(0.075,0.045,0.17), vec3(0.17,0.10,0.34), clamp(dot(vN, normalize(vec3(-0.5,0.6,0.7))) * 0.5 + 0.5, 0.0, 1.0)); gl_FragColor = vec4(base + vec3(0.30,0.20,0.62) * r * 0.75, 1.0); }",
      }),
    [],
  );
  return (
    <mesh material={material}>
      <sphereGeometry args={[0.992, 64, 64]} />
    </mesh>
  );
}

function Graticule() {
  const geo = useMemo(() => {
    const pts: number[] = [];
    const seg = (a: THREE.Vector3, b: THREE.Vector3) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    for (let lat = -60; lat <= 60; lat += 30)
      for (let lng = -180; lng < 180; lng += 6) seg(toVec3(lat, lng, 1.003), toVec3(lat, lng + 6, 1.003));
    for (let lng = -180; lng < 180; lng += 30)
      for (let lat = -84; lat < 84; lat += 6) seg(toVec3(lat, lng, 1.003), toVec3(lat + 6, lng, 1.003));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#8e6fc0" transparent opacity={0.16} />
    </lineSegments>
  );
}

function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexShader: "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader:
          "varying vec3 vN; void main(){ float i = pow(0.74 - dot(vN, vec3(0.0,0.0,1.0)), 4.0); gl_FragColor = vec4(0.62,0.46,0.92,1.0) * i * 1.05; }",
      }),
    [],
  );
  return (
    <mesh scale={1.15} material={material}>
      <sphereGeometry args={[1, 64, 64]} />
    </mesh>
  );
}

function Arc({ from, to, active, speed, offset, still }: { from: Place; to: Place; active: boolean; speed: number; offset: number; still: boolean }) {
  const curve = useMemo(() => {
    const a = toVec3(from.lat, from.lng, 1.004);
    const b = toVec3(to.lat, to.lng, 1.004);
    const mid = a.clone().add(b).normalize().multiplyScalar(1 + a.distanceTo(b) * 0.24);
    return new THREE.CatmullRomCurve3([a, mid, b], false, "catmullrom", 0.5);
  }, [from, to]);
  const points = useMemo(() => curve.getPoints(72), [curve]);
  const trail = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = trail.current;
    if (!g) return;
    const base = still ? 0.5 : (clock.elapsedTime * speed + offset) % 1;
    g.children.forEach((m, i) => m.position.copy(curve.getPoint(Math.max(0, base - i * 0.016))));
  });
  return (
    <>
      <Line points={points} color={active ? GOLD : LAVENDER} lineWidth={active ? 1.8 : 0.9} transparent opacity={active ? 0.9 : 0.3} />
      <group ref={trail}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} scale={1 - i * 0.13}>
            <sphereGeometry args={[0.014, 10, 10]} />
            <meshBasicMaterial color={active ? GOLD : "#e6d9fb"} transparent opacity={1 - i * 0.16} />
          </mesh>
        ))}
      </group>
    </>
  );
}

function Pin({ id, active, hot, interactive, onSelect, onHover }: {
  id: CountryId; active: boolean; hot: boolean; interactive: boolean;
  onSelect?: (id: CountryId) => void; onHover?: (id: CountryId | null) => void;
}) {
  const place = DEST[id];
  const normal = useMemo(() => toVec3(place.lat, place.lng, 1).normalize(), [place]);
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal), [normal]);
  const ring = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const p = (clock.elapsedTime * (active ? 1.3 : 0.8)) % 1;
    if (!ring.current) return;
    ring.current.scale.setScalar(1 + p * (active ? 3.4 : 2.2));
    (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - p) * (active ? 0.95 : 0.6);
  });

  const hit = {
    onClick: (e: { stopPropagation: () => void }) => { e.stopPropagation(); onSelect?.(id); },
    onPointerOver: (e: { stopPropagation: () => void }) => { e.stopPropagation(); onHover?.(id); document.body.style.cursor = "pointer"; },
    onPointerOut: () => { onHover?.(null); document.body.style.cursor = ""; },
  };

  return (
    <group position={normal.clone().multiplyScalar(1.005)} quaternion={quat}>
      <mesh ref={ring}>
        <ringGeometry args={[0.028, 0.036, 40]} />
        <meshBasicMaterial color={active ? GOLD : "#d9c8f7"} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh scale={active || hot ? 1.45 : 1}>
        <sphereGeometry args={[0.024, 20, 20]} />
        <meshBasicMaterial color={active ? GOLD : "#ffffff"} />
      </mesh>
      {interactive && (
        <mesh {...hit}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

/** Projects each pin to screen space and positions its DOM label (no portals, no extra React roots). */
function LabelProjector({ interactive }: { interactive: boolean }) {
  const normals = useMemo(() => COUNTRIES.map((c) => ({ id: c.id, n: toVec3(DEST[c.id].lat, DEST[c.id].lng, 1).normalize() })), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const cam = useMemo(() => new THREE.Vector3(), []);
  const els = useRef<Record<string, HTMLElement | null>>({});
  useFrame(({ camera, size }) => {
    cam.copy(camera.position).normalize();
    for (const { id, n } of normals) {
      const el = (els.current[id] ??= document.querySelector<HTMLElement>(`[data-pin="${id}"]`));
      if (!el) continue;
      v.copy(n).multiplyScalar(1.07).project(camera);
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      const facing = n.dot(cam);
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
      el.style.opacity = facing > 0.14 ? "1" : "0";
      el.style.pointerEvents = facing > 0.14 && interactive ? "auto" : "none";
    }
  });
  return null;
}

/** Flies the camera around the globe (never through it) to face the focused country. */
function Rig({ focus }: { focus: CountryId | null }) {
  const goal = useRef<{ dir: THREE.Vector3; t: number } | null>(null);
  const tmp = useMemo(() => ({ cur: new THREE.Vector3(), q: new THREE.Quaternion(), step: new THREE.Quaternion(), id: new THREE.Quaternion() }), []);
  useEffect(() => {
    goal.current = focus ? { dir: toVec3(DEST[focus].lat - 8, DEST[focus].lng, 1).normalize(), t: 0 } : null;
  }, [focus]);
  useFrame((state, dt) => {
    const g = goal.current;
    if (!g) return;
    g.t += dt;
    const pos = state.camera.position;
    const dist = pos.length();
    tmp.cur.copy(pos).normalize();
    const angle = tmp.cur.angleTo(g.dir);
    if (angle < 0.012 || g.t > 2.2) { goal.current = null; return; }
    tmp.q.setFromUnitVectors(tmp.cur, g.dir);
    tmp.step.copy(tmp.id.identity()).slerp(tmp.q, Math.min(1, dt * 5));
    tmp.cur.applyQuaternion(tmp.step);
    pos.copy(tmp.cur.multiplyScalar(THREE.MathUtils.lerp(dist, 2.75, Math.min(1, dt * 4))));
  });
  return null;
}

export default function GlobeScene({ selected = null, hovered = null, focus: focusProp, onSelect, onHover, autoRotate = true, stars = true, interactive = true }: GlobeProps) {
  const reduced = useReducedMotion();
  const focus = focusProp === undefined ? selected : focusProp;
  return (
    <div className="relative h-full w-full">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.5, 3.45], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ touchAction: "pan-y" }}
      >
        {stars && <Stars radius={30} depth={40} count={1400} factor={3.2} saturation={0} fade speed={reduced ? 0 : 0.7} />}
        <group>
          <Core />
          <Graticule />
          <LandDots />
          <Atmosphere />
          {ORIGINS.flatMap((o, oi) =>
            COUNTRIES.filter((c) => oi === 0 || c.id !== "de").map((c, i) => (
              <Arc key={`${o.label}-${c.id}`} from={o} to={DEST[c.id]} active={selected === c.id || (!selected && hovered === c.id)} speed={0.16 + (i % 3) * 0.03} offset={(oi * 0.4 + i * 0.19) % 1} still={reduced} />
            )),
          )}
          {ORIGINS.map((o) => (
            <mesh key={o.label} position={toVec3(o.lat, o.lng, 1.006)}>
              <sphereGeometry args={[0.02, 14, 14]} />
              <meshBasicMaterial color={GOLD} />
            </mesh>
          ))}
          {COUNTRIES.map((c) => (
            <Pin key={c.id} id={c.id} active={selected === c.id} hot={hovered === c.id} interactive={interactive} onSelect={onSelect} onHover={onHover} />
          ))}
        </group>
        <OrbitControls makeDefault autoRotate={autoRotate && !reduced && !focus} enablePan={false} enableZoom={false} enableDamping dampingFactor={0.08} rotateSpeed={0.55} autoRotateSpeed={0.7} minPolarAngle={Math.PI * 0.12} maxPolarAngle={Math.PI * 0.88} />
        <Rig focus={focus} />
        <LabelProjector interactive={interactive} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {COUNTRIES.map((c) => {
          const on = selected === c.id;
          const hot = hovered === c.id;
          return (
            <button
              key={c.id}
              data-pin={c.id}
              type="button"
              tabIndex={interactive ? 0 : -1}
              onClick={() => interactive && onSelect?.(c.id)}
              onMouseEnter={() => onHover?.(c.id)}
              onMouseLeave={() => onHover?.(null)}
              style={{ opacity: 0, transition: "opacity .25s" }}
              className="absolute left-0 top-0 will-change-transform"
            >
              <span
                className={`mb-3 flex select-none items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md transition duration-200 ${
                  on ? "scale-110 border-gold bg-gold/95 text-nova-900 shadow-lg shadow-gold/40" : hot ? "scale-105 border-white/60 bg-nova-700/80 text-white" : "border-white/25 bg-nova-900/60 text-white"
                } ${interactive ? "cursor-pointer" : ""}`}
              >
                <span className="opacity-70">{c.code}</span> {c.name.replace("United Kingdom", "UK")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
