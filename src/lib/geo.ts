import * as THREE from "three";
import { feature } from "topojson-client";
import land from "world-atlas/land-110m.json";
import type { CountryId } from "./data";

export interface Place { lat: number; lng: number; label: string }

export const DEST: Record<CountryId, Place> = {
  uk: { lat: 51.5, lng: -0.12, label: "London" },
  au: { lat: -33.87, lng: 151.2, label: "Sydney" },
  ca: { lat: 43.65, lng: -79.38, label: "Toronto" },
  de: { lat: 52.52, lng: 13.4, label: "Berlin" },
  sg: { lat: 1.35, lng: 103.82, label: "Singapore" },
};

export const ORIGINS: Place[] = [
  { lat: 19.07, lng: 72.88, label: "Mumbai" },
  { lat: 6.93, lng: 79.86, label: "Colombo" },
];

/** Lat/lng (degrees) to a point on a sphere of radius r. */
export function toVec3(lat: number, lng: number, r = 1): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

let cache: Float32Array | null = null;

/** Evenly spaced dots over land, built by rasterising real coastline data. Client only. */
export function landDotPositions(stepDeg = 1.7): Float32Array {
  if (cache) return cache;
  const W = 720, H = 360;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#fff";

  type Topo = Parameters<typeof feature>[0];
  const topo = land as unknown as Topo & { objects: { land: Parameters<typeof feature>[1] } };
  const fc = feature(topo, topo.objects.land) as unknown as GeoJSON.FeatureCollection | GeoJSON.Feature;
  const features = "features" in fc ? fc.features : [fc];
  const px = (lng: number) => ((lng + 180) / 360) * W;
  const py = (lat: number) => ((90 - lat) / 180) * H;

  for (const f of features) {
    const g = f.geometry;
    if (!g) continue;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
    for (const poly of polys) {
      ctx.beginPath();
      for (const ring of poly) {
        ring.forEach(([lng, lat], i) => (i ? ctx.lineTo(px(lng), py(lat)) : ctx.moveTo(px(lng), py(lat))));
        ctx.closePath();
      }
      ctx.fill("evenodd");
    }
  }

  const data = ctx.getImageData(0, 0, W, H).data;
  const pts: number[] = [];
  for (let lat = -56; lat <= 84; lat += stepDeg) {
    const lngStep = stepDeg / Math.max(0.25, Math.cos((lat * Math.PI) / 180));
    for (let lng = -180; lng < 180; lng += lngStep) {
      const x = Math.min(W - 1, Math.floor(px(lng)));
      const y = Math.min(H - 1, Math.floor(py(lat)));
      if (data[(y * W + x) * 4 + 3] > 128) {
        const v = toVec3(lat, lng, 1);
        pts.push(v.x, v.y, v.z);
      }
    }
  }
  cache = new Float32Array(pts);
  return cache;
}

let webgl: boolean | undefined;

/** Probed once: creating a WebGL context per call would exhaust the browser's context limit. */
export function hasWebGL(): boolean {
  if (webgl !== undefined) return webgl;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    webgl = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl = false;
  }
  return webgl;
}
