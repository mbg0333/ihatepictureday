import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "I Hate Picture Day | Modern Youth Sports Media & Photography",
  description: "Boring picture days are over. iHatePictureDay delivers high-end sports photography and custom graphics for youth leagues, schools, and teams in East Texas.",
  keywords: ["youth sports photography", "East Texas sports photography", "league photography", "baseball picture day", "football picture day", "soccer picture day", "basketball picture day", "sports graphics"],
  openGraph: {
    title: "I Hate Picture Day | Modern Youth Sports Media",
    description: "Modern sports pictures kids actually get excited about.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-brand-black text-brand-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
