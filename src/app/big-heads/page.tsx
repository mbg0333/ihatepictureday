"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Truck, CheckCircle2, Zap, Trophy } from "lucide-react";
import Link from "next/link";


import { useState, useEffect } from "react";
import Image from "next/image";

export default function BigHeadsLandingPage() {
  const [mounted, setMounted] = useState(false);
  const [samples, setSamples] = useState<{id: number, title: string, image: string}[]>([]);

  useEffect(() => {
    setMounted(true);
    fetch('/api/bigheads/samples')
      .then(res => res.json())
      .then(data => setSamples(data.samples || []));
  }, []);

  return (
    <main className="min-h-screen lg:h-screen bg-brand-black flex flex-col lg:overflow-hidden selection:bg-brand-red selection:text-white">
      <Navbar />
      
      {/* Hero Landing - Zero Scroll Fit */}
      <section className="flex-1 flex items-center bg-zinc-950 relative border-b border-white/5 overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 relative z-10 py-6 md:py-0">
          <div className="w-full space-y-6 md:space-y-12">
            <div className="space-y-6 md:space-y-8 z-20">
              <div className="space-y-4">
                <div className="flex flex-col gap-2 w-full">
                  <span className="w-fit bg-brand-red text-white text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1 skew-x-[-12deg]">
                    Custom 2ft Cutouts
                  </span>
                  <span className="text-white/40 text-[10px] font-black uppercase flex items-center gap-2">
                    <Truck size={12} className="text-brand-red" /> Free Overnight Shipping Included
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-8xl lg:text-[100px] font-black italic uppercase leading-[1.1] text-stroke tracking-tight relative break-words w-full">
                  Big Head <br />
                  <span className="text-brand-red drop-shadow-[8px_8px_0_rgba(0,0,0,1)] text-5xl md:text-8xl lg:text-[100px]">Builder</span>
                </h1>
              </div>

              {/* Mobile Only Samples Carousel */}
              <div className="lg:hidden w-full overflow-x-auto no-scrollbar py-2">
                <div className="flex gap-4 w-max pr-10">
                  {samples.map((s, idx) => (
                    <div key={s.id} className={`w-28 aspect-[3/4] bg-zinc-900 border border-white/10 p-1 shadow-xl relative overflow-hidden flex-shrink-0 ${idx % 2 === 0 ? 'rotate-2' : '-rotate-2'}`}>
                      <Image src={s.image} alt={s.title} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-sm md:text-xl text-gray-300 max-w-lg font-medium leading-relaxed italic break-words w-full">
                The ultimate sideline flex. <span className="text-white font-bold not-italic">High-impact, durable 2ft cutouts</span> designed to turn every head in the stands.
              </p>

              {/* Fundraising Callout */}
              <div className="bg-zinc-900/40 border border-white/5 p-5 relative overflow-hidden group max-w-full lg:max-w-lg transition-colors hover:bg-zinc-900/60 break-words">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-red transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-red flex items-center justify-center shrink-0 shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
                    <Trophy className="text-white" size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-white font-black uppercase text-sm tracking-widest italic">Fundraising Opportunity</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                      Great for leagues, schools, and booster clubs. Organizers collect money and pictures—the more sold, the better the price per unit.
                    </p>
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-brand-red font-black text-lg italic leading-none">30-50%</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Average Profit Margin</span>
                      </div>
                      <Link href="/booking?type=fundraiser">
                        <Button size="sm" className="h-8 px-4 text-[10px] font-black uppercase italic tracking-widest group/btn relative overflow-hidden">
                          <span className="relative z-10 group-hover/btn:text-brand-red transition-colors duration-300">Start Fundraiser</span>
                          <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8 pt-4">
                <Link href="/big-heads/builder" className="w-full sm:w-auto">
                  <Button className="w-full px-8 py-6 text-lg font-black uppercase italic tracking-wider group relative overflow-hidden shadow-[4px_4px_0_rgba(224,40,38,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                    <span className="relative z-10 flex items-center gap-3 group-hover:text-brand-red transition-colors duration-300">
                      Start Your Order <Zap size={18} className="fill-white group-hover:fill-brand-red transition-colors duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Button>
                </Link>
                
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start space-x-2 text-[10px] font-black uppercase tracking-widest text-brand-red">
                    <div className="w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse" />
                    <span>24+ Pack: only $18 each</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2 text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                    <span>Overnight Shipping Included</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Samples - Desktop Only Grid (Hidden on mobile) */}
            <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/2 z-10">
              <div className="grid grid-cols-2 gap-3 transform rotate-1 transition-transform duration-500 max-w-lg ml-auto">
                {samples.slice(0, 4).map(s => (
                  <div key={s.id} className="aspect-[3/4] bg-zinc-900 border border-white/5 p-1.5 grayscale hover:grayscale-0 transition-all duration-500 shadow-2xl relative overflow-hidden group/item">
                    <Image 
                      src={s.image} 
                      alt={s.title} 
                      fill
                      sizes="25vw"
                      className="w-full h-full object-cover transform group-hover/item:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-brand-red/10 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
              
              <div className="absolute -bottom-2 -left-2 w-16 h-16 border-b-2 border-l-2 border-brand-red opacity-30" />
              <div className="absolute -top-2 -right-2 w-16 h-16 border-t-2 border-r-2 border-brand-red opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* Mini Footer to keep it zero-scroll */}
      <div className="bg-brand-black py-4 px-6 border-t border-white/5 text-center">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          © {mounted ? new Date().getFullYear() : '2026'} iHatePictureDay. All Rights Reserved.
        </p>
      </div>
    </main>
  );
}
