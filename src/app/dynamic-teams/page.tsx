import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DynamicTeamDemo } from "@/components/DynamicTeamDemo";
import { motion } from "framer-motion";
import { Users, EyeOff, CalendarX, Zap, CheckCircle2, Star, ShieldCheck } from "lucide-react";

export default function DynamicTeamsPage() {
  const benefits = [
    {
      icon: EyeOff,
      title: "No More Closed Eyes",
      description: "In a traditional team photo, the odds of all 15 kids having their eyes open simultaneously are basically zero. We take individual portraits and hand-pick the perfect, smiling shot for every single player."
    },
    {
      icon: CalendarX,
      title: "No Missing Players",
      description: "If a player is sick or out of town on Picture Day, they don't have to miss out. We can photograph them on a makeup day and seamlessly drop them into their exact spot on the team composite."
    },
    {
      icon: Users,
      title: "Zero Coach Stress",
      description: "Coaches hate wrangling 12 distracted kids into a perfect line while the sun is in their eyes. We handle every player individually in seconds, letting coaches get back to coaching."
    },
    {
      icon: Zap,
      title: "Perfect Lighting & Backgrounds",
      description: "We control the lighting on every single subject. Rain or shine, day or night, the final team photo features dramatic, professional lighting and epic stadium backgrounds."
    }
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-brand-red selection:text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-red/10 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            {/* Text Side (Left) */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-zinc-900 border border-brand-red/30 px-4 py-2 rounded-full text-brand-red font-bold uppercase tracking-wider text-sm mb-6 shadow-[0_0_20px_rgba(224,40,38,0.2)]">
                <Star size={16} /> The Future of Team Photography
              </div>
              <h1 className="text-5xl md:text-7xl font-black italic uppercase mb-6 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Dynamic</span>
                <br />
                <span className="text-brand-red drop-shadow-[0_0_30px_rgba(224,40,38,0.5)]">Team Building</span>
              </h1>
              <p className="text-xl text-gray-400 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Stop settling for mediocre team photos with closed eyes, missing kids, and terrible lighting. We build perfect team composites from individual studio-quality portraits.
              </p>
            </div>

            {/* Demo Side (Right) */}
            <div className="flex-1 w-full w-full max-w-3xl xl:max-w-4xl relative">
               <div className="absolute -inset-10 bg-brand-red/10 blur-3xl rounded-full" />
               <div className="relative rotate-1 hover:rotate-0 transition-transform duration-500 shadow-[20px_20px_0_rgba(0,0,0,0.5)] z-10">
                  <DynamicTeamDemo />
               </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* The Benefits Grid */}
      <section className="py-16 lg:py-24 bg-zinc-950 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 max-w-7xl mx-auto">
            
            {/* The 4 Boxes (Left Side on Desktop) */}
            <div className="flex-[1.2] w-full order-2 lg:order-1">
              <div className="flex flex-col gap-4 md:gap-6">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex flex-col sm:flex-row items-start gap-4 md:gap-6 bg-zinc-900 border border-white/5 p-6 rounded-2xl hover:border-brand-red/30 transition-colors group shadow-lg"
                  >
                    <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-black border border-white/10 flex items-center justify-center rounded-xl group-hover:bg-brand-red group-hover:border-brand-red transition-colors">
                      <benefit.icon size={24} className="text-white md:w-8 md:h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black italic uppercase text-white mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm md:text-base text-gray-400 leading-relaxed font-medium">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The Text (Right Side on Desktop) */}
            <div className="flex-1 w-full text-center lg:text-left order-1 lg:order-2 lg:pl-12">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black italic uppercase text-white mb-6 leading-tight">
                Why Dynamic <span className="text-brand-red block">Wins</span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Traditional team photos are outdated. Dynamic compositing solves every single problem associated with Picture Day, guaranteeing a flawless result every time.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* The Quality Assurance */}
      <section className="py-12 md:py-16 bg-brand-red text-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <ShieldCheck size={48} className="mx-auto mb-4 text-white" />
          <h2 className="text-3xl md:text-5xl font-black italic uppercase mb-4 shadow-black drop-shadow-lg">
            The Dynamic Advantage
          </h2>
          <p className="text-lg md:text-xl font-medium opacity-90 mb-8 leading-relaxed">
            Our specialized compositing process helps ensure that every parent receives a team photo where their child looks their absolute best, avoiding the chaos and unpredictability of traditional group shots.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full font-bold">
              <CheckCircle2 size={20} /> Everyone Smiling
            </div>
            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full font-bold">
              <CheckCircle2 size={20} /> Everyone Present
            </div>
            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full font-bold">
              <CheckCircle2 size={20} /> Perfect Lighting
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
