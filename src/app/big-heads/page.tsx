"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Truck, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";

const samples = [
  { id: 1, title: "Standard Big Head", image: "/images/bigheads/sample1.png" },
  { id: 2, title: "Head Only Cutout", image: "/images/bigheads/sample2.png" },
  { id: 3, title: "Half Body Style", image: "/images/bigheads/sample1.png" },
  { id: 4, title: "Half Body w/ Name", image: "/images/bigheads/sample2.png" },
];

import { useState, useEffect } from "react";

export default function BigHeadsLandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="h-screen bg-brand-black flex flex-col overflow-hidden selection:bg-brand-red selection:text-white">
      <Navbar />
      
      {/* Hero Landing - Zero Scroll Fit */}
      <section className="flex-1 flex items-center bg-zinc-950 overflow-hidden relative border-b border-white/5">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-red text-white text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 skew-x-[-12deg]">
                    Custom 2ft Cutouts
                  </span>
                  <span className="text-white/40 text-[9px] font-black uppercase tracking-widest border-l border-white/10 pl-3 flex items-center gap-1">
                    <Truck size={10} className="text-brand-red" /> Free Overnight Shipping Included
                  </span>
                </div>
                
                <h1 className="text-6xl md:text-8xl lg:text-[100px] font-black italic uppercase leading-[0.75] text-stroke tracking-tighter relative">
                  Big Head <br />
                  <span className="text-brand-red drop-shadow-[10px_10px_0_rgba(0,0,0,1)]">Builder</span>
                </h1>
              </div>
              
              <p className="text-lg md:text-xl text-gray-400 max-w-lg font-medium leading-relaxed italic">
                The ultimate sideline flex. <span className="text-white font-bold not-italic">High-impact, durable 2ft cutouts</span> designed to turn every head in the stands.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-8 pt-4">
                <Link href="/big-heads/builder">
                  <Button className="px-10 py-8 text-xl font-black uppercase italic tracking-wider group relative overflow-hidden shadow-[6px_6px_0_rgba(224,40,38,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                    <span className="relative z-10 flex items-center gap-3 group-hover:text-brand-red transition-colors duration-300">
                      Start Your Order <Zap size={20} className="fill-white group-hover:fill-brand-red transition-colors duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Button>
                </Link>
                
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-brand-red">
                    <div className="w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse" />
                    <span>24+ Pack: only $18 each</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                    <span>Overnight Shipping after production</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group ml-auto max-w-md lg:max-w-lg">
              <div className="grid grid-cols-2 gap-3 relative py-4 transform hover:rotate-1 transition-transform duration-500">
                {samples.map(s => (
                  <div key={s.id} className="aspect-[3/4] bg-zinc-900 border border-white/5 p-1.5 grayscale hover:grayscale-0 transition-all duration-500 shadow-xl relative overflow-hidden group/item">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover transform group-hover/item:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-brand-red/10 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
              
              {/* Corner Accent */}
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
