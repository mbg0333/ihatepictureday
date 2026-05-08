"use client";

import { motion } from "framer-motion";

const logos = [
  "LPAR Basketball",
  "Central Youth Baseball and Softball",
  "Lufkin Little League",
  "Crockett Youth Baseball",
  "LPAR Soccer",
  "Hudson Youth Basketball",
  "Lufkin All-Stars",
  "Hudson All-Stars"
];

export const LogoCloud = () => {
  return (
    <section className="py-16 bg-zinc-950/50 border-y border-white/5 overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <p className="text-center text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-white/60 mb-3">
          Trusted by top <span className="text-brand-red bg-brand-red/10 px-2 py-0.5">East Texas</span> teams & leagues
        </p>
        <div className="h-0.5 w-16 bg-brand-red mx-auto" />
      </div>

      <div className="relative flex overflow-x-hidden group">
        <div className="animate-marquee whitespace-nowrap flex items-center py-4">
          {[...logos, ...logos, ...logos].map((team, i) => (
            <span 
              key={i} 
              className="mx-16 text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white/40 group-hover:text-white/60 transition-all duration-700 select-none"
            >
              {team}
            </span>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
