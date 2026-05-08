"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink, Play, Sparkles, Tag, ChevronRight, Camera } from "lucide-react";
import { useState, useEffect } from "react";

import { activeGalleries } from "@/data/events";

const samplePhotos = [
  "/images/football.png",
  "/images/softball.png",
  "/images/hero.png",
  "/images/banner.png"
];

const GalleryStack = ({ eventId, initialSamples = [] }: { eventId: string, initialSamples?: string[] }) => {
  const [samples, setSamples] = useState<string[]>(initialSamples || []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/galleries/${eventId}/images`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSamples(data.map((img: any) => img.url));
        }
      } catch (err) {
        console.error("Failed to fetch gallery images:", err);
      }
    };
    fetchImages();
  }, [eventId]);

  useEffect(() => {
    if (samples.length === 0) return;
    
    // Randomized interval between 3-5 seconds
    const cycleInterval = 3000 + Math.random() * 2000;
    // Initial random delay so they don't all start at once
    const initialDelay = Math.random() * 2000;

    let intervalId: NodeJS.Timeout;
    
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setIndex((prev) => (prev + 1) % samples.length);
      }, cycleInterval);
    }, initialDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [samples.length]);

  return (
    <div className="flex flex-col gap-8 shrink-0 w-40">
      {/* Animated Stacked Image Preview */}
      <div className="relative w-40 h-48 shrink-0">
        {samples.length === 0 ? (
          <div className="absolute inset-0 bg-white border border-white/5 flex items-center justify-center">
            <img src="/images/logo.jpg" alt="Logo" className="w-full h-full object-contain p-2" />
          </div>
        ) : (
          samples.map((img, idx) => {
            const relIdx = (idx - index + samples.length) % samples.length;
            const isActive = relIdx === 0;
            
            return (
              <motion.div 
                key={idx}
                animate={{
                  zIndex: samples.length - relIdx,
                  scale: isActive ? 1.05 : 1,
                  rotate: isActive ? 0 : -(relIdx * 4),
                  x: isActive ? 0 : -(relIdx * 8),
                  y: isActive ? 0 : (relIdx * 4),
                  opacity: isActive ? 1 : 0.6
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 border-4 border-zinc-900 shadow-2xl bg-zinc-950"
              >
                <img 
                  src={img} 
                  alt="" 
                  className={`w-full h-full object-cover transition-all duration-700 ${isActive ? 'grayscale-0' : 'grayscale'}`} 
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </motion.div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default function GalleriesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-brand-black flex flex-col">
      <Navbar />
      
      <section className="pb-16 pt-4 md:pt-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Left Column: Active Galleries */}
            <div className="lg:col-span-2 space-y-12">
              <div className="flex items-center space-x-4 mb-6 mt-4 lg:mt-0">
                <div className="w-10 h-10 bg-brand-red flex items-center justify-center">
                  <Camera className="text-white" size={20} />
                </div>
                <h2 className="text-3xl font-black italic uppercase">Active Events</h2>
              </div>
              
              <div className="grid gap-8">
                {activeGalleries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((gallery) => (
                  <motion.div
                    key={gallery.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-8 bg-zinc-900/50 border border-white/5 hover:border-brand-red/50 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 tracking-widest ${gallery.status === 'Live' ? 'bg-green-500' : 'bg-zinc-700'}`}>
                        {gallery.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-16">
                      {/* Animated Stacked Image Preview */}
                      <GalleryStack eventId={gallery.id} initialSamples={gallery.samples} />

                      <div className="flex-1">
                        <p className="text-brand-red font-bold uppercase text-sm mb-1">{gallery.displayDate}</p>
                        <h3 className="text-2xl font-black uppercase mb-4 group-hover:text-brand-red transition-colors leading-tight">
                          {gallery.name}
                        </h3>
                        
                        {/* Per-Event Specials */}
                        <div className="flex flex-wrap gap-3 mb-6">
                          {gallery.specials.map((special, i) => (
                            <div key={i} className="flex items-center space-x-2 bg-brand-red/10 border border-brand-red/20 px-3 py-1">
                              <Tag size={12} className="text-brand-red" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-brand-red">{special.label}</span>
                              <span className="text-[10px] font-bold text-gray-500 uppercase">{special.detail}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center space-x-3 text-gray-500 font-bold uppercase text-[10px] tracking-widest my-6">
                          <span>Access Code:</span>
                          <span className="bg-brand-black px-2 py-1 border border-white/10 text-white tracking-widest">
                            {gallery.accessCode}
                          </span>
                        </div>
                        
                        <a 
                          href={gallery.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`inline-flex items-center justify-center space-x-3 px-8 py-4 font-black uppercase italic tracking-wider transition-all ${gallery.status === 'Live' ? 'bg-brand-red text-white hover:bg-white hover:text-brand-red' : 'bg-zinc-800 text-gray-500 cursor-not-allowed'}`}
                        >
                          <span>View Gallery</span>
                          <ExternalLink size={18} />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column: Title, Video & Specials */}
            <div className="space-y-12">
              {/* Moved Header Info */}
              <div className="text-center lg:text-left">
                <h1 className="text-6xl md:text-8xl font-black italic uppercase mb-4 leading-[0.85] text-stroke">
                  View My <br /><span className="text-brand-red">Photos</span>
                </h1>
                <p className="text-gray-400 font-medium">
                  Find your league, enter your access code, and see your athlete look like a pro.
                </p>
              </div>

              {/* How to Order Video */}
              <div className="bg-zinc-900 p-8 border border-white/5">
                <h3 className="text-xl font-black uppercase italic mb-6 flex items-center space-x-3">
                  <Play className="text-brand-red" size={20} />
                  <span>How to Order</span>
                </h3>
                <div className="aspect-video relative bg-brand-black border border-white/10 overflow-hidden mb-6 group cursor-pointer">
                  <video 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    src="https://media.photoday.io/videos/Ordering_Photos_How_To.mp4"
                    controls
                  />
                </div>
                <p className="text-sm text-gray-500 font-medium italic leading-relaxed">
                  First time using PhotoDay? This quick video walks you through finding your athlete, selecting poses, and completing your order.
                </p>
              </div>

              <div className="p-8 border border-white/5 bg-zinc-950 text-center italic">
                <p className="text-gray-500 mb-4 font-medium">Missing your access code?</p>
                <Link href="/booking">
                  <span className="text-brand-red font-black uppercase tracking-widest text-sm hover:underline cursor-pointer">
                    Contact Us
                  </span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
