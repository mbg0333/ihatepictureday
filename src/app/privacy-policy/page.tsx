import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldCheck, MessageSquare, Lock, Mail, Phone } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | I Hate Picture Day",
  description: "Privacy Policy and SMS mobile messaging data protection terms for I Hate Picture Day.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-brand-black text-white flex flex-col">
      <Navbar />

      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 w-1/3 h-96 bg-brand-red/5 blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="mb-12">
            <span className="text-brand-red text-xs font-bold uppercase tracking-widest inline-block mb-3">
              Legal & Compliance
            </span>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tight text-white mb-4">
              Privacy <span className="text-brand-red">Policy</span>
            </h1>
            <p className="text-gray-400 text-sm">
              Last Updated: October 2026
            </p>
          </div>

          {/* HIGHLIGHTED SMS / MOBILE MESSAGING PRIVACY POLICY CARD (MANDATORY CARRIER COMPLIANCE) */}
          <div className="bg-zinc-900/90 border-2 border-brand-red p-6 md:p-8 rounded-xl shadow-[0_0_40px_rgba(224,40,38,0.15)] mb-12 relative overflow-hidden">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-brand-red p-2 rounded-lg text-white">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white">
                SMS / Mobile Messaging Privacy Policy
              </h2>
            </div>

            <div className="space-y-4 text-gray-200 leading-relaxed">
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                SMS Consent and Mobile Data Privacy:
              </h3>
              
              <div className="p-4 bg-black/60 border border-white/10 rounded-lg text-white font-medium text-base md:text-lg leading-relaxed">
                No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All other categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
              </div>

              <p>
                If you provide your phone number to receive photo gallery access, picture day reminders, or order updates, your mobile phone number will be used solely for communications from <strong className="text-white">I Hate Picture Day</strong>. You may opt out of receiving text messages at any time by replying <strong className="text-brand-red">STOP</strong>.
              </p>
            </div>
          </div>

          {/* GENERAL PRIVACY POLICY SECTIONS */}
          <div className="space-y-10 text-gray-300 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic text-white flex items-center gap-2">
                <ShieldCheck className="text-brand-red w-5 h-5 inline" /> 1. Introduction & Overview
              </h2>
              <p>
                At <strong>I Hate Picture Day</strong> (operated at <Link href="https://www.ihatepictureday.com" className="text-brand-red hover:underline">https://www.ihatepictureday.com</Link>), we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy describes how we collect, use, and protect your information when you use our website, register for picture days, access photo galleries, and order sports prints and digital media.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic text-white">
                2. Information We Collect
              </h2>
              <p>We may collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li><strong>Contact Information:</strong> Name, email address, phone number, and physical mailing address for order shipment.</li>
                <li><strong>Athlete & League Details:</strong> Athlete name, jersey number, team, coach, age group, or school affiliation necessary to identify photos and organize team galleries.</li>
                <li><strong>Order & Transaction Records:</strong> Products purchased, package selections, and payment confirmation (payment card information is securely processed directly by our payment processor and is not stored on our servers).</li>
                <li><strong>Photographs & Images:</strong> Images captured during picture days and sporting events for proofing and product fulfillment.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic text-white">
                3. How We Use Your Information
              </h2>
              <p>We use the information we collect strictly to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>Create, match, and provide access to your athlete&apos;s photo galleries.</li>
                <li>Send order confirmations, shipping updates, and gallery notifications via email and/or SMS (with your explicit consent).</li>
                <li>Fulfill orders for physical photo prints, banners, big heads, and digital downloads.</li>
                <li>Provide customer support and respond to inquiries.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic text-white flex items-center gap-2">
                <Lock className="text-brand-red w-5 h-5 inline" /> 4. Information Sharing & Third Parties
              </h2>
              <p>
                We do not sell, rent, or lease your personal information to any third parties. We share information only with trusted service partners strictly necessary to operate our services (e.g., professional photo printing labs, secure payment gateways, and communications providers).
              </p>
              <p className="border-l-2 border-brand-red pl-4 italic text-gray-300">
                As stated above, all mobile phone data and text messaging opt-in consent is strictly excluded from sharing; no mobile originator opt-in data will be shared with third parties or affiliates under any circumstances.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic text-white">
                5. Data Security & Storage
              </h2>
              <p>
                We implement industry-standard administrative, technical, and physical security measures to safeguard your personal data and images against unauthorized access, loss, or misuse.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic text-white">
                6. Your Rights & Opt-Out Choices
              </h2>
              <p>
                You may at any time request to review, update, or delete your contact details by contacting us. To opt out of mobile text updates, simply reply <strong>STOP</strong> to any text message from us. To opt out of emails, click the unsubscribe link in any email communication or reach out to our team.
              </p>
            </section>

            <section className="space-y-4 pt-6 border-t border-white/10">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic text-white">
                7. Contact Us
              </h2>
              <p>If you have any questions or concerns about this Privacy Policy or our practices, please contact us:</p>
              <div className="bg-zinc-900/60 p-6 rounded-lg border border-white/10 space-y-3">
                <p className="font-bold text-white text-lg">I Hate Picture Day</p>
                <p className="flex items-center gap-3 text-gray-300">
                  <Mail size={18} className="text-brand-red" />
                  <a href="mailto:maxx@ihatepictureday.com" className="hover:text-brand-red transition-colors">
                    maxx@ihatepictureday.com
                  </a>
                </p>
                <p className="flex items-center gap-3 text-gray-300">
                  <Phone size={18} className="text-brand-red" />
                  <a href="tel:936-676-8613" className="hover:text-brand-red transition-colors">
                    936-676-8613
                  </a>
                </p>
                <p className="text-gray-400 text-sm">
                  Lufkin, Texas & East Texas
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
