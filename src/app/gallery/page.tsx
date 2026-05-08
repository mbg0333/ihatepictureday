"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Loader2 } from "lucide-react";

const categories = ["All", "Baseball", "Football", "Softball", "Graphics"];

export default function GalleryPage() {
  const [filter, setFilter] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<{src: string, category: string, title: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gallery/images')
      .then(res => res.json())
      .then(data => {
        setGalleryImages(data.images || []);
        setLoading(false);
      });
  }, []);

  const filteredImages = filter === "All" 
    ? galleryImages 
    : galleryImages.filter(img => img.category.toLowerCase().includes(filter.toLowerCase()));

  return (
    <main className="min-h-screen bg-brand-black flex flex-col">
      <Navbar />
      
      {/* Header */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-6xl md:text-9xl font-black italic uppercase mb-8 leading-[0.8] text-stroke">
            The <span className="text-brand-red">Gallery</span>
          </h1>
          
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 text-sm font-black uppercase tracking-widest border-2 transition-colors ${
                  filter === cat 
                    ? "bg-brand-red border-brand-red text-white" 
                    : "border-zinc-800 text-gray-500 hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-8 pb-16 flex-1">
        <div className="container mx-auto px-4 md:px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="text-brand-red animate-spin" size={48} />
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Loading Gallery...</p>
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="text-center py-20">
               <p className="text-xl font-bold uppercase italic text-gray-600">No images found in this gallery yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode='popLayout'>
                {filteredImages.map((img, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={`${img.title}-${index}`}
                  className="relative aspect-[4/5] overflow-hidden bg-zinc-900 border border-white/5 cursor-pointer group"
                  onClick={() => setSelectedImage(img.src)}
                >
                  <img 
                    src={img.src} 
                    alt={img.title}
                    className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <span className="text-brand-red text-xs font-black uppercase tracking-widest mb-1">{img.category}</span>
                    <h3 className="text-xl font-bold uppercase italic">{img.title}</h3>
                    <div className="absolute top-4 right-4">
                      <Maximize2 size={20} className="text-white/50" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-8 right-8 text-white hover:text-brand-red transition-colors">
              <X size={40} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={selectedImage}
              className="max-w-full max-h-[85vh] object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
