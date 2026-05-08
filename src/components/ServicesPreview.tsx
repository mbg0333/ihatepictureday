"use client";

import { motion } from "framer-motion";
import { Camera, Layers, MapPin, Users, Zap, Image as ImageIcon, Trophy } from "lucide-react";

const services = [
  {
    title: "League Picture Day",
    description: "Full-service photography for entire youth leagues. Efficient, organized, and high-energy.",
    icon: Users,
  },
  {
    title: "Individual Portraits",
    description: "Dynamic, athletic poses that make every player look like a professional athlete.",
    icon: Camera,
  },
  {
    title: "Custom Graphics",
    description: "Professional digital posters and gameday graphics tailored to your league's brand.",
    icon: Layers,
  },
  {
    title: "Team Banners",
    description: "High-impact vinyl banners for the whole team to display at the field or gym.",
    icon: ImageIcon,
  },
  {
    title: "Dynamic Team Photos",
    description: "We create the perfect team photo from individual shots. No closed eyes, no missing late kids—just perfectly posed, pro-lit team images.",
    icon: Zap,
  },
  {
    title: "Big Head Cutouts",
    description: "Custom 2ft foam core cutouts of your athlete. The ultimate sideline flex for parents and fans.",
    icon: Trophy,
  },
];

export const ServicesPreview = () => {
  return (
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase mb-4">
              More Than <span className="text-brand-red">Photography</span>
            </h2>
            <p className="text-gray-400">
              We offer a complete suite of sports media services designed to
              elevate your team's brand and create lasting memories.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 bg-brand-black border border-white/5 hover:border-brand-red/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-brand-red transition-colors">
                <service.icon className="w-6 h-6 text-brand-red group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold uppercase mb-4 group-hover:text-brand-red transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
