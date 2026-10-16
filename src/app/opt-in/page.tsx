import type { Metadata } from "next";
import { Suspense } from "react";
import { getEvents } from "@/lib/events";
import { OptInClient } from "./OptInClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Picture Day Registration & SMS Gallery Access | I Hate Picture Day",
  description: "Register for your sports league picture day. Get instant SMS alerts the second photo galleries go live, access codes, and exclusive launch deals.",
  keywords: ["picture day registration", "sports photography alerts", "youth sports photo gallery", "East Texas picture day"],
};

export default async function OptInPage() {
  const allEvents = await getEvents();
  const availableEvents = allEvents.filter(
    (e) => e.status !== "Archive" && e.optInActive !== false
  );

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-black flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OptInClient availableEvents={availableEvents} />
    </Suspense>
  );
}
