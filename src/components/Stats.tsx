"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Teams Photographed" },
  { value: "15k+", label: "Athletes Captured" },
  { value: "100%", label: "Chance you love Picture Day" },
];

export const Stats = () => {
  return (
    <section className="py-20 bg-brand-black border-y border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl md:text-6xl font-black text-brand-red mb-2 uppercase italic">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-500">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
