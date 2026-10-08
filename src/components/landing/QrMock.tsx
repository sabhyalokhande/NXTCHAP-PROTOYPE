const N = 25;
function cells() {
  let s = 20261013;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const finder = (r: number, c: number) =>
    [[0, 0], [0, N - 7], [N - 7, 0]].some(([fr, fc]) => r >= fr && r < fr + 7 && c >= fc && c < fc + 7);
  const out: [number, number][] = [];
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (finder(r, c)) {
        const [fr, fc] = [[0, 0], [0, N - 7], [N - 7, 0]].find(([a, b]) => r >= a && r < a + 7 && c >= b && c < b + 7)!;
        const lr = r - fr, lc = c - fc;
        const ring = lr === 0 || lr === 6 || lc === 0 || lc === 6;
        const core = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        if (ring || core) out.push([r, c]);
      } else if (rnd() > 0.52) out.push([r, c]);
    }
  return out;
}
const CELLS = cells();

export default function QrMock() {
  return (
    <div className="relative mx-auto w-52 rounded-3xl bg-white p-4 shadow-2xl shadow-nova-600/30">
      <svg viewBox={`0 0 ${N} ${N}`} className="w-full" shapeRendering="crispEdges" aria-hidden>
        {CELLS.map(([r, c]) => <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#241a3b" />)}
      </svg>
      <span className="laser absolute inset-x-3 h-0.5 rounded-full bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent shadow-[0_0_14px_3px_rgba(192,38,211,.55)]" />
      <div className="mt-2 text-center text-[11px] font-semibold uppercase tracking-widest text-nova-600">Scan to start</div>
    </div>
  );
}
