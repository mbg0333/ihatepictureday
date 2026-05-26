import HowItWorksPageClient from "./HowItWorksPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Picture Day Process | I Hate Picture Day",
  description: "Ditch the chaos. See how we've redesigned the youth sports picture day experience to be fast for coaches, stress-free for parents, and fun for athletes in East Texas.",
  keywords: ["youth sports photography process", "online photo ordering", "how picture day works", "stress free picture day", "sports composites", "Lufkin photo delivery"],
  openGraph: {
    title: "Our Picture Day Process | I Hate Picture Day",
    description: "Discover our optimized 7-step process: online proofing, no paper forms, dynamic team builds, and direct home shipping.",
    type: "website",
  },
};

export default function HowItWorksPage() {
  return <HowItWorksPageClient />;
}
