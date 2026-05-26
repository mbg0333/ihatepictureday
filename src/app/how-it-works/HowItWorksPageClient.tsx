"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import { Camera, Layers, Bell, Eye, Truck, ArrowRight, Trophy, QrCode } from "lucide-react";
import { useState, useEffect } from "react";
import { DynamicTeamDemo } from "@/components/DynamicTeamDemo";

const steps = [
  {
    id: "01",
    title: "Register & Connect",
    description: "Scan the on-site QR code or text our league code. This registers your athlete and ensures you're the first to know when photos are ready.",
    icon: QrCode,
    color: "bg-blue-500"
  },
  {
    id: "02",
    title: "Advance Pay (Optional)",
    description: "Think of it like a gift card. Purchase a credit before picture day to secure free shipping. Your credit is then applied to your final order after you've chosen your favorite poses, backgrounds, and packages.",
    icon: Trophy,
    color: "bg-orange-500"
  },
  {
    id: "03",
    title: "Fast-Track Shooting",
    description: "Athletes can take their pictures as soon as they arrive for their scheduled time. No waiting on the whole team to show up. We focus on getting perfect, high-energy individual poses.",
    icon: Camera,
    color: "bg-brand-red"
  },
  {
    id: "04",
    title: "Dynamic Team Build",
    description: "We use those individual shots to build a perfect team composite. No closed eyes, no missing kids, and no stress for coaches.",
    icon: Layers,
    color: "bg-orange-500"
  },
  {
    id: "05",
    title: "Instant Notification",
    description: "Once photos are individually edited and applied to multiple graphics, you will receive a text or email with a direct link to your athlete's private proofing gallery.",
    icon: Bell,
    color: "bg-green-500"
  },
  {
    id: "06",
    title: "Proof & Personalize",
    description: "See every shot before you spend a dime. Choose your favorite poses, custom backgrounds, and premium product packages.",
    icon: Eye,
    color: "bg-purple-500"
  },
  {
    id: "07",
    title: "Direct Home Delivery",
    description: "Orders are shipped directly to your doorstep. No more digging through boxes at the field or waiting weeks for distribution.",
    icon: Truck,
    color: "bg-brand-red"
  }
];

export default function HowItWorksPageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-brand-black selection:bg-brand-red selection:text-white">
      <Navbar />
      
      {/* Hero Header */}
      <section className="py-12 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h1 className="text-6xl md:text-9xl font-black italic uppercase mb-6 leading-[0.8] text-stroke">
            The <span className="text-brand-red">Process</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium italic">
            Ditch the chaos. We've redesigned picture day from the ground up to be fast for coaches and exciting for parents.
          </p>
        </div>
      </section>

      {/* Steps Vertical Timeline */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto relative">
            {/* Center Line (Desktop) */}
            <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-white/10 hidden lg:block" />
            
            <div className="space-y-24">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`flex flex-col ${step.id === '04' ? 'lg:flex-col gap-12 items-center' : `lg:flex-row items-center gap-12 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}`}
                >
                  {/* Text Side (Rendered first for Step 04) */}
                  {step.id === '04' && (
                    <div className="w-full text-center max-w-3xl mx-auto">
                      <div className="inline-block bg-brand-red text-white font-black italic px-4 py-1 shadow-lg text-xl mb-4">
                        {step.id}
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black italic uppercase mb-6 text-brand-red leading-none">
                        {step.title}
                      </h2>
                      <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed italic">
                        {step.description}
                      </p>
                    </div>
                  )}

                  {/* Media / Icon Side */}
                  <div className={`${step.id === '04' ? 'w-full flex justify-center' : `flex-1 flex justify-center ${index % 2 !== 0 ? 'lg:justify-start lg:pl-12' : 'lg:justify-end lg:pr-12'} group`}`}>
                    {step.id === "04" ? (
                      <div className="w-full max-w-5xl mx-auto">
                        <div className="relative rotate-1 hover:rotate-0 transition-transform duration-500 shadow-[20px_20px_0_rgba(0,0,0,0.5)] z-10">
                           <DynamicTeamDemo />
                        </div>
                      </div>
                    ) : (
                      <div className={`w-32 h-32 md:w-48 md:h-48 ${step.id === '02' || step.id === '06' ? 'bg-brand-red' : 'bg-zinc-900'} flex items-center justify-center relative rotate-3 group-hover:rotate-6 transition-transform shadow-[10px_10px_0_rgba(0,0,0,0.5)]`}>
                        <step.icon size={64} className="text-white md:size-80" />
                        <div className="absolute -top-4 -left-4 bg-brand-red text-white font-black italic px-4 py-1 shadow-lg text-xl">
                          {step.id}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Spacer for Line (Desktop) */}
                  {step.id !== '04' && <div className="w-4 hidden lg:block" />}

                  {/* Text Side (For normal steps) */}
                  {step.id !== '04' && (
                    <div className="flex-1 text-center lg:text-left lg:pl-12">
                      <h2 className="text-3xl md:text-5xl font-black italic uppercase mb-6 text-brand-red leading-none">
                        {step.title}
                      </h2>
                      <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed italic">
                        {step.description}
                      </p>
                      {index < steps.length - 1 && (
                        <div className="mt-8 flex justify-center lg:justify-start">
                          <ArrowRight className="text-white/10 lg:rotate-0 rotate-90" size={32} />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Arrow below Step 04 */}
                  {step.id === '04' && (
                     <div className="mt-8 flex justify-center w-full">
                       <ArrowRight className="text-white/10 rotate-90" size={32} />
                     </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase mb-8">
            Ready for a <span className="text-brand-red">Better Experience?</span>
          </h2>
          <Link href="/booking">
            <button className="bg-brand-red text-white px-12 py-6 text-2xl font-black uppercase italic tracking-wider hover:bg-white hover:text-brand-red transition-all shadow-[8px_8px_0_rgba(224,40,38,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
              Book Your League Now
            </button>
          </Link>
        </div>
      </section>

      <Footer />
      
      {/* Hydration fix for copyright */}
      <div className="hidden">
        {mounted ? new Date().getFullYear() : '2026'}
      </div>
    </main>
  );
}
