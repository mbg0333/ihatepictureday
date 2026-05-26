import GalleriesPageClient from "./GalleriesPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Active Youth Sports Galleries | I Hate Picture Day",
  description: "Access your athlete's private sports gallery! Enter your league access code to proof poses, choose custom backgrounds, view limited-time promos, and order premium prints online.",
  keywords: ["view sports photos Lufkin", "sports gallery access code", "order youth sports pictures", "baseball team galleries", "soccer photo proofing"],
  openGraph: {
    title: "Active Youth Sports Galleries | I Hate Picture Day",
    description: "Proof poses, view custom backgrounds, find specials, and order premium athlete photos from active East Texas youth sports leagues.",
    type: "website",
  },
};

export default function GalleriesPage() {
  return <GalleriesPageClient />;
}
