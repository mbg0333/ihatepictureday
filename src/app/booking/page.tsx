"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Send, Calendar, Users, Trophy, Mail, Phone, MessageSquare, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

export default function BookingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking",
          data: {
            name: data.get("name"),
            email: data.get("email"),
            organization: data.get("organization"),
            sport: data.get("sport"),
            details: data.get("details"),
          },
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        form.reset();
      } else {
        alert("Oops! There was a problem submitting your inquiry. Please try again.");
      }
    } catch (error) {
      alert("Oops! There was a problem submitting your inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-black flex flex-col selection:bg-brand-red selection:text-white">
      <Navbar />
      
      <section className="flex-1 flex items-center py-4 md:py-6 bg-zinc-950 overflow-hidden relative border-b border-white/5">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-red/5 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Branding & Info */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h1 className="text-4xl md:text-6xl font-black italic uppercase leading-[0.75] text-stroke tracking-tighter mb-3">
                  Book The <br /><span className="text-brand-red drop-shadow-[6px_6px_0_rgba(0,0,0,1)]">Hype</span>
                </h1>
                <p className="text-gray-400 font-medium italic text-sm md:text-base max-w-sm leading-relaxed">
                  Ready to give your league a picture day they will love?
                </p>
              </div>

              <div className="space-y-4">
                <div className="group bg-zinc-900/40 p-4 border border-white/5 flex items-center space-x-4 hover:border-brand-red/50 transition-all hover:translate-x-1">
                  <div className="w-10 h-10 bg-brand-red flex items-center justify-center shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
                    <Mail className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-brand-red tracking-widest mb-0.5">Email Us</p>
                    <p className="text-base font-black tracking-tight">maxx@ihatepictureday.com</p>
                  </div>
                </div>
                <div className="group bg-zinc-900/40 p-4 border border-white/5 flex items-center space-x-4 hover:border-brand-red/50 transition-all hover:translate-x-1">
                  <div className="w-10 h-10 bg-brand-red flex items-center justify-center shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
                    <Phone className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-brand-red tracking-widest mb-0.5">Call/Text</p>
                    <p className="text-base font-black tracking-tight">936-676-8613</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/60 p-5 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-red transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />
                <p className="text-[10px] font-black uppercase text-brand-red tracking-[0.2em] mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-red animate-pulse" /> Why We Exist
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed font-medium italic">
                  "As a parent and a coach, I honestly hated picture day—it was boring, stressful, and the results were usually disappointing. We built iHatePictureDay to be quick and efficient for parents and coaches, while still creating a fun and exciting experience for the athletes. Our goal is to deliver captivating images with lots of choices so players can remember the season—and we hope to create a Picture Day you LOVE."
                </p>
              </div>

              <div className="flex items-center gap-3 text-white/40 pt-4">
                <MapPin className="text-brand-red" size={16} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Serving All of East Texas • Based in Lufkin, TX</p>
              </div>
            </div>

            {/* Right: The Form */}
            <div className="lg:col-span-7 bg-zinc-900/80 p-6 md:p-8 border border-white/10 relative shadow-[20px_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm">
              <div className="absolute -top-1 -left-1 w-12 h-12 border-t-2 border-l-2 border-brand-red" />
              <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-2 border-r-2 border-brand-red" />
              
              {submitted ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                  <Trophy size={80} className="mx-auto text-brand-red mb-6 animate-bounce" />
                  <h2 className="text-4xl font-black uppercase italic mb-2">Inquiry Sent!</h2>
                  <p className="text-gray-400 mb-8 font-medium">We'll be in touch faster than a 90mph fastball.</p>
                  <Button onClick={() => setSubmitted(false)} variant="secondary">Send Another</Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Full Name</label>
                      <input name="name" required className="w-full bg-brand-black/50 border border-white/10 px-4 py-3 text-sm focus:border-brand-red outline-none transition-all font-bold placeholder:opacity-20 focus:ring-1 focus:ring-brand-red/20" placeholder="e.g. Coach Carter" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email Address</label>
                      <input name="email" required type="email" className="w-full bg-brand-black/50 border border-white/10 px-4 py-3 text-sm focus:border-brand-red outline-none transition-all font-bold placeholder:opacity-20 focus:ring-1 focus:ring-brand-red/20" placeholder="coach@league.com" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Organization / Team</label>
                      <input name="organization" required className="w-full bg-brand-black/50 border border-white/10 px-4 py-3 text-sm focus:border-brand-red outline-none transition-all font-bold placeholder:opacity-20 focus:ring-1 focus:ring-brand-red/20" placeholder="Lufkin All-Stars" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sport</label>
                      <div className="relative">
                        <select name="sport" className="w-full bg-brand-black/50 border border-white/10 px-4 py-3 text-sm focus:border-brand-red outline-none transition-all font-bold text-white appearance-none cursor-pointer">
                          <option>Baseball</option>
                          <option>Basketball</option>
                          <option>Football</option>
                          <option>Soccer</option>
                          <option>Softball</option>
                          <option>Other</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Project Details</label>
                    <textarea name="details" rows={2} className="w-full bg-brand-black/50 border border-white/10 px-4 py-3 text-sm focus:border-brand-red outline-none transition-all font-bold placeholder:opacity-20 focus:ring-1 focus:ring-brand-red/20 resize-none" placeholder="How many athletes? Any specific dates in mind?" />
                  </div>

                  <Button disabled={submitting} type="submit" className="w-full py-4 text-base font-black uppercase tracking-widest group relative overflow-hidden shadow-[0_0_30px_rgba(224,40,38,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="relative z-10 flex items-center justify-center gap-3 transition-colors duration-300 group-hover:text-brand-red">
                      {submitting ? "Sending..." : "Send Inquiry"} {!submitting && <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                    </span>
                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mini Footer */}
      <div className="bg-brand-black py-4 px-6 border-t border-white/5 text-center">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          © {mounted ? new Date().getFullYear() : '2026'} iHatePictureDay. All Rights Reserved.
        </p>
      </div>
    </main>
  );
}
