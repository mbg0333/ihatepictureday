import BookingPageClient from "./BookingPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Your Sports Picture Day | I Hate Picture Day",
  description: "Upgrade your youth sports league's photography! Contact us today to book dynamic team photos, professional athlete portraits, and custom graphics in Lufkin and all of East Texas.",
  keywords: ["book sports photography", "youth league booking Lufkin", "baseball team photos Lufkin", "East Texas sports media", "schedule picture day"],
  openGraph: {
    title: "Book Your Sports Picture Day | I Hate Picture Day",
    description: "Upgrade your youth sports league's photography. Book high-energy portraits, dynamic team composites, and custom graphic services.",
    type: "website",
  },
};

export default function BookingPage() {
  return <BookingPageClient />;
}
