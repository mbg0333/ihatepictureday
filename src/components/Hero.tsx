"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const Hero = ({ eventImages = [] }: { eventImages?: string[] }) => {
  return (
    <section className="relative flex-1 min-h-[calc(100vh-73px)] flex items-center overflow-hidden">
      {/* Background Image/Grid */}
      <div className="absolute inset-0 z-0 bg-brand-black">
        {eventImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-50 scale-105">
            {eventImages.slice(0, 16).map((src, i) => (
              <div key={i} className="aspect-[4/5] relative overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                <Image 
                  src={src} 
                  alt="Event Photo" 
                  fill 
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover object-top" 
                />
              </div>
            ))}
          </div>
        ) : (
          <Image
            src="/images/hero.png"
            alt="Sports Photography"
            fill
            sizes="100vw"
            className="object-cover object-center opacity-60 scale-105"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/30 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block bg-brand-red text-white text-xs md:text-sm font-black uppercase tracking-[0.3em] px-3 py-1 mb-6">
              East Texas Youth Sports Photography
            </span>
            <h1 className="text-5xl md:text-8xl font-black leading-[0.9] mb-6 italic uppercase">
              Sports Pictures <br />
              <span className="text-brand-red">Kids Actually</span> <br />
              Get Excited About
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
              No boring poses. No rushed lines. High-end sports graphics for 
              youth leagues that parents actually want to hang on their walls.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/booking">
                <Button size="lg" className="w-full sm:w-auto flex items-center gap-2">
                  Book Your League <ChevronRight size={20} />
                </Button>
              </Link>
              <Link href="/gallery">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  View Gallery
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute bottom-10 right-10 hidden lg:block">
        <div className="flex items-center space-x-4">
          <div className="h-[1px] w-20 bg-brand-red" />
          <span className="text-xs font-bold uppercase tracking-widest text-brand-red">
            Scroll to explore
          </span>
        </div>
      </div>
    </section>
  );
};
