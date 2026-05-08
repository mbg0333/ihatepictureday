"use client";

import Link from "next/link";
import { Camera, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-brand-black border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6 group">
              <div className="bg-brand-red p-1.5 group-hover:rotate-12 transition-transform">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter italic">
                I <span className="text-brand-red">Hate</span> Picture <span className="text-brand-red">Day</span>
              </span>
            </Link>
            <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
              We're changing the game for youth sports photography in East Texas. 
              Modern graphics, high-energy picture days, and photos kids actually love.
            </p>

          </div>

          <div>
            <h4 className="text-lg font-bold uppercase mb-6">Quick Links</h4>
            <ul className="space-y-4 text-gray-500 font-medium">
              <li><Link href="/" className="hover:text-brand-red transition-colors">Home</Link></li>
              <li><Link href="/galleries" className="hover:text-brand-red transition-colors">View My Photos</Link></li>
              <li><Link href="/gallery" className="hover:text-brand-red transition-colors">Sample Gallery</Link></li>
              <li><Link href="/services" className="hover:text-brand-red transition-colors">Services</Link></li>
              <li><Link href="/how-it-works" className="hover:text-brand-red transition-colors">How it Works</Link></li>
              <li><Link href="/booking" className="hover:text-brand-red transition-colors">Book Now</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold uppercase mb-6">Contact</h4>
            <ul className="space-y-4 text-gray-500">
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-brand-red" />
                <span>maxx@ihatepictureday.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-brand-red" />
                <span>936-676-8613</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin size={18} className="text-brand-red" />
                <span>Lufkin, Texas & Beyond</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-700">
          <p>© {new Date().getFullYear()} I HATE PICTURE DAY. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-8">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
