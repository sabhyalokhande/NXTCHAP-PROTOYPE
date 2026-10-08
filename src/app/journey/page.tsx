import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import JourneyApp from "@/components/journey/JourneyApp";

export const metadata = { title: "Your quest | NOVA by NXT Chapter" };

export default function JourneyPage() {
  return (
    <>
      <SiteHeader active="student" />
      <Suspense
        fallback={
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
            <div className="h-[70vh] animate-pulse rounded-3xl bg-nova-50" />
          </main>
        }
      >
        <JourneyApp />
      </Suspense>
    </>
  );
}
