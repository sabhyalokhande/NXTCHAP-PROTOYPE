import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import CounsellorApp from "@/components/counsellor/CounsellorApp";

export const metadata = { title: "Counsellor workspace | NOVA by NXT Chapter" };

export default function CounsellorPage() {
  return (
    <>
      <SiteHeader active="counsellor" />
      <Suspense
        fallback={
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
            <div className="h-[70vh] animate-pulse rounded-3xl bg-nova-50" />
          </main>
        }
      >
        <CounsellorApp />
      </Suspense>
    </>
  );
}
