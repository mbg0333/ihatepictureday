import fs from 'fs';
import path from 'path';
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { WhyUs } from "@/components/WhyUs";
import { ServicesPreview } from "@/components/ServicesPreview";
import { LogoCloud } from "@/components/LogoCloud";
import { Footer } from "@/components/Footer";
import { list } from '@vercel/blob';

export default async function Home() {
  let heroImages: string[] = [];

  // 1. Try to fetch from Vercel Blob first (Production)
  try {
    const { blobs } = await list({ prefix: 'images/hero/' });
    if (blobs.length > 0) {
      heroImages = blobs.map(blob => blob.url);
    }
  } catch (e) {
    console.error("Error reading cloud hero images:", e);
  }

  // 2. If no cloud hero images, try cloud event images fallback
  if (heroImages.length === 0) {
    try {
      const { blobs } = await list({ prefix: 'images/events/' });
      if (blobs.length > 0) {
        heroImages = blobs.map(blob => blob.url);
      }
    } catch (e) {
      console.error("Error reading cloud event images fallback:", e);
    }
  }

  // 3. Last Resort: Try local filesystem (for local development or if cloud is empty)
  if (heroImages.length === 0) {
    const heroDir = path.join(process.cwd(), 'public', 'images', 'hero');
    try {
      if (fs.existsSync(heroDir)) {
        const files = fs.readdirSync(heroDir);
        heroImages = files
          .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
          .map(file => `/images/hero/${encodeURIComponent(file)}`);
      }
    } catch (e) {
      console.error("Error reading local hero images:", e);
    }

    if (heroImages.length === 0) {
      const eventsDir = path.join(process.cwd(), 'public', 'images', 'events');
      try {
        const eventFolders = fs.readdirSync(eventsDir);
        eventFolders.forEach(folder => {
          const folderPath = path.join(eventsDir, folder);
          if (fs.statSync(folderPath).isDirectory()) {
            const files = fs.readdirSync(folderPath)
              .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
              .map(file => `/images/events/${folder}/${encodeURIComponent(file)}`);
            heroImages = [...heroImages, ...files];
          }
        });
      } catch (e) {
        console.error("Error reading local event images fallback:", e);
      }
    }
  }
  
  // Shuffle images
  const shuffledImages = heroImages.sort(() => 0.5 - Math.random());

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <Hero eventImages={shuffledImages} />
      <Stats />
      
      {/* Mission Statement Section */}
      <section className="py-20 bg-zinc-950 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-32 h-32 bg-brand-red flex-shrink-0 flex items-center justify-center rotate-3 shadow-[10px_10px_0_rgba(0,0,0,1)]">
                <p className="text-white font-black italic text-4xl uppercase leading-none text-center">OUR<br/>WHY</p>
              </div>
              <div className="space-y-6">
                <p className="text-xl md:text-2xl text-gray-300 font-bold italic leading-relaxed">
                  "As a parent and a coach, I honestly hated picture day—it was boring, stressful, and the results were usually disappointing. We built iHatePictureDay to be quick and efficient for parents and coaches, while still creating a fun and exciting experience for the athletes."
                </p>
                <p className="text-lg text-gray-500 font-medium uppercase tracking-widest leading-relaxed">
                  Our goal is to deliver captivating images with lots of choices so players can remember the season—and we hope to create a Picture Day you LOVE.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LogoCloud />
      <WhyUs />
      <ServicesPreview />
      
      {/* CTA Section */}
      <section className="py-24 bg-brand-red text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 text-[20rem] font-black italic opacity-10 leading-none select-none translate-x-20">
          HYPE
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h2 className="text-5xl md:text-8xl font-black uppercase italic mb-8 leading-tight">
            Ready to Upgrade <br />Your Picture Day?
          </h2>
          <p className="text-xl md:text-2xl font-bold mb-12 opacity-90 max-w-2xl mx-auto">
            Join the hundreds of teams in East Texas that have ditched boring photography for the iHatePictureDay experience.
          </p>
          <div className="flex justify-center">
            <a href="/booking" className="bg-white text-brand-red px-10 py-5 text-xl font-black uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-2xl">
              Book Your League
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
