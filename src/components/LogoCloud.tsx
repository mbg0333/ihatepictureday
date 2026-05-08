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
    <section className="py-12 bg-brand-black/50 border-t border-white/5 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <p className="text-center text-xs font-bold uppercase tracking-[0.4em] text-gray-600">
          Trusted by top East Texas teams & leagues
        </p>
      </div>
      
      <div className="flex space-x-12 animate-marquee whitespace-nowrap">
        <div className="flex items-center space-x-12 shrink-0">
          {[...logos, ...logos].map((logo, i) => (
            <span
              key={i}
              className="text-2xl md:text-4xl font-black text-zinc-800 uppercase italic tracking-tighter"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </section>
  );
};
