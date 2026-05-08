"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/Button";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Book Now", href: "/booking" },
  { name: "Sample Gallery", href: "/gallery" },
  { name: "Services", href: "/services" },
  { name: "How it Works", href: "/how-it-works" },
  { name: "Big Heads", href: "/big-heads" },
  { name: "FAQ", href: "/faq" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled ? "glass-morphism py-2 border-brand-red/80 shadow-lg" : "bg-brand-black py-4 border-brand-red/30"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-brand-red p-1.5 group-hover:rotate-12 transition-transform">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">
              I <span className="text-brand-red">Hate</span> Picture <span className="text-brand-red">Day</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-bold uppercase tracking-widest hover:text-brand-red transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link href="/galleries">
              <Button size="sm">View My Photos</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-black border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-bold uppercase tracking-widest"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link href="/galleries" onClick={() => setIsOpen(false)}>
                <Button className="w-full">View My Photos</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
