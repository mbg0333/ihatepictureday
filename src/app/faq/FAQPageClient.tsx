"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "How long does a typical League Picture Day take?",
    answer: "We are experts at high-volume photography. We can efficiently process hundreds of athletes per hour while maintaining premium quality, ensuring your league schedule stays on track."
  },
  {
    question: "Do parents need to pay on the day of photography?",
    answer: "No. We use a 100% online proofing and ordering system. Parents receive a link to their gallery where they can view photos and order exactly what they want. We also offer an optional Advance Pay credit that unlocks free shipping if purchased before picture day."
  },
  {
    question: "What sports do you photograph?",
    answer: "We focus on the big four: Baseball, Basketball, Football, and Soccer, along with Softball and other youth league sports. If it's a youth league, we have the specialized graphics to match."
  },
  {
    question: "Do you travel outside of Lufkin, TX?",
    answer: "Yes! We serve all of East Texas and are available for travel across the state for larger events and leagues."
  },
  {
    question: "How long until we get our photos?",
    answer: "Standard proofing galleries are ready within 5-7 business days. Custom graphics and banner designs usually take an additional 3-5 days for production."
  },
  {
    question: "What is Advance Pay?",
    answer: "Advance Pay works just like a gift card. You purchase a credit toward your photos before picture day, which unlocks FREE SHIPPING. Once the gallery is live and you've selected your backgrounds, poses, and packages, your credit is automatically applied at checkout. It's the best way to save and get your photos as fast as possible."
  }
];

export default function FAQPageClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-brand-black flex flex-col">
      <Navbar />
      
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-20 text-center lg:text-left">
            <h1 className="text-6xl md:text-8xl font-black italic uppercase leading-[0.8] text-stroke lg:w-1/2">
              Common <br /><span className="text-brand-red">Questions</span>
            </h1>
            <div className="lg:w-1/2 bg-zinc-900/50 p-6 border-l-4 border-brand-red italic text-gray-400 font-medium text-left shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full bg-brand-red/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-sm leading-relaxed relative z-10">
                "As a parent and a coach, I honestly hated picture day—it was boring, stressful, and the results were usually disappointing. We built iHatePictureDay to be quick and efficient for parents and coaches, while still creating a fun and exciting experience for the athletes. Our goal is to deliver captivating images with lots of choices so players can remember the season—and we hope to create a Picture Day you LOVE."
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-white/10">
                <button 
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full py-6 flex items-center justify-between text-left group"
                >
                  <span className="text-xl font-bold uppercase italic group-hover:text-brand-red transition-colors">
                    {faq.question}
                  </span>
                  {openIndex === i ? <Minus className="text-brand-red" /> : <Plus className="text-gray-600" />}
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 text-gray-400 leading-relaxed font-medium">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
