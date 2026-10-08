const NODES: [string, number][] = [
  ["Destination", 10], ["Level & intake", 10], ["Profile", 10], ["Contact", 5],
  ["Documents", 30], ["Matches", 5], ["Shortlist", 10], ["Counsellor", 20],
];
const PTS: [number, number][] = NODES.map((_, i) => [70 + i * 137, i % 2 ? 90 : 170]);

function smooth(p: [number, number][]) {
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}
const D = smooth(PTS);

export default function QuestMap() {
  return (
    <div className="overflow-x-auto pb-2 [scrollbar-width:thin]">
      <svg viewBox="0 0 1100 260" className="mx-auto min-w-[760px] max-w-5xl" role="img" aria-label="The eight milestones of the NOVA quest, worth 100 XP in total">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <linearGradient id="trail" x1="0" x2="1"><stop offset="0" stopColor="#b79be0" /><stop offset="1" stopColor="#f5b83d" /></linearGradient>
        </defs>
        <path d={D} fill="none" stroke="#5f4390" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
        <path d={D} fill="none" stroke="url(#trail)" strokeWidth="4" strokeLinecap="round" pathLength={1} className="draw-path" filter="url(#glow)" />
        {PTS.map(([x, y], i) => {
          const up = y < 130;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="20" fill="#241a3b" stroke="#5f4390" strokeWidth="2" />
              <g style={{ animation: "node-on 10s linear infinite", animationDelay: `${i * 1.2}s` }}>
                <circle cx={x} cy={y} r="20" fill="#43306a" stroke="#f5b83d" strokeWidth="2.5" filter="url(#glow)" />
              </g>
              <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">{i + 1}</text>
              <text x={x} y={up ? y - 34 : y + 46} textAnchor="middle" fontSize="15" fontWeight="600" fill="#fff">{NODES[i][0]}</text>
              <text x={x} y={up ? y - 52 : y + 64} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#f5b83d">+{NODES[i][1]} XP</text>
            </g>
          );
        })}
        <g filter="url(#glow)">
          <circle r="16" fill="#f5b83d" opacity=".25" />
          <circle r="7" fill="#f5b83d" />
          <animateMotion dur="10s" repeatCount="indefinite" path={D} />
        </g>
      </svg>
    </div>
  );
}
