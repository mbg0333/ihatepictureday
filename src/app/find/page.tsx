import { Metadata } from "next";
import FindPageClient from "./FindPageClient";

export const metadata: Metadata = {
  title: "Find Your Athlete's Photos | iHatePictureDay",
  description: "Can't find your access code or missed registration? Search your player's first and last name to instantly open your GotPhoto gallery.",
};

export default function FindPage() {
  return <FindPageClient />;
}
