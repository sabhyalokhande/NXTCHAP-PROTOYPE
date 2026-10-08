import Image from "next/image";
import Link from "next/link";

type Active = "home" | "student" | "counsellor";

export default function SiteHeader({ active, right, tone = "light" }: { active?: Active; right?: React.ReactNode; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  const nav = (id: Active, href: string, label: string) => (
    <Link
      href={href}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active === id
          ? dark ? "bg-white/15 text-white" : "bg-nova-100 text-nova-800"
          : dark ? "text-nova-100 hover:bg-white/10" : "text-nova-700 hover:bg-nova-50"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <header className={dark ? "absolute inset-x-0 top-0 z-30" : "sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur"}>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/nxt-logo.png" alt="NXT Chapter Education" width={520} height={409} priority className={`h-10 w-auto rounded-lg ${dark ? "bg-white p-0.5" : ""}`} />
          <span className={`hidden h-6 w-px sm:block ${dark ? "bg-white/25" : "bg-line"}`} />
          <span className={`hidden text-lg font-semibold tracking-tight sm:block ${dark ? "text-white" : "text-nova-700"}`}>
            NOVA <span className={`text-xs font-medium ${dark ? "text-nova-200" : "text-muted"}`}>by NXT Chapter</span>
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-1">
          {nav("student", "/journey", "Student journey")}
          {nav("counsellor", "/counsellor", "Counsellor view")}
          {right}
        </nav>
      </div>
    </header>
  );
}
