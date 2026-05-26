import FAQPageClient from "./FAQPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports Photography FAQ | I Hate Picture Day",
  description: "Got questions about youth sports picture day? Find answers about online proofing, photo packages, home delivery, custom graphic products, and travel ball photography in East Texas.",
  keywords: ["sports photography faq", "how does online proofing work", "what is advance pay sports photography", "East Texas league photography", "picture day help"],
  openGraph: {
    title: "Sports Photography FAQ | I Hate Picture Day",
    description: "Got questions about youth sports picture day? Learn about online proofing, delivery, packages, and custom athletic graphics.",
    type: "website",
  },
};

export default function FAQPage() {
  return <FAQPageClient />;
}
