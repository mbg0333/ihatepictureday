"use client";

import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

const comparison = {
  traditional: [
    "Slow Chaotic Unorganized Process",
    "Pictures look like they were taken with an ancient smartphone",
    "Spend Money Blindly",
    "Parents and Coaches frustrated",
  ],
  ihatepictureday: [
    "Quick - Fast - Efficient",
    "No Paper Order Forms",
    "See before you buy with Online Proofing",
    "Multiple Poses and Background Choices",
    "No Team Photo Required - we make the team photo from individual pictures",
  ],
};

export const WhyUs = () => {
  return (
    <section className="py-24 bg-brand-black relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase mb-4">
            Why <span className="text-brand-red">iHatePictureDay?</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We're not just taking pictures. We're creating sports media that
            makes every athlete feel like a pro.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Traditional */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900/50 p-8 border border-white/5"
          >
            <h3 className="text-2xl font-bold uppercase mb-6 text-gray-500">
              The "Other" Guys
            </h3>
            <ul className="space-y-4">
              {comparison.traditional.map((item, i) => (
                <li key={i} className="flex items-start space-x-3 text-gray-500">
                  <X className="w-5 h-5 text-gray-700 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* iHatePictureDay */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-brand-red p-8 shadow-[0_0_40px_rgba(224,40,38,0.2)]"
          >
            <h3 className="text-2xl font-bold uppercase mb-6 text-white">
              The iHatePictureDay Way
            </h3>
            <ul className="space-y-4">
              {comparison.ihatepictureday.map((item, i) => (
                <li key={i} className="flex items-start space-x-3 text-white">
                  <Check className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <span className="font-bold">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
