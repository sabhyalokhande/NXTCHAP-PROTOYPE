/** Soft drifting colour behind the app screens. */
export default function Ambient() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="aurora aurora-a -left-24 top-10 h-[26rem] w-[26rem] bg-nova-200/55" />
      <div className="aurora aurora-b -right-20 top-1/3 h-[30rem] w-[30rem] bg-fuchsia-200/40" />
      <div className="aurora aurora-a bottom-0 left-1/3 h-80 w-80 bg-amber-100/50" />
    </div>
  );
}
