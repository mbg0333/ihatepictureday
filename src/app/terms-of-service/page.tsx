import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, MessageSquare, AlertCircle, Mail, Phone } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | I Hate Picture Day",
  description: "Terms of Service and SMS messaging terms and conditions for I Hate Picture Day.",
};

export default function TermsOfServicePage() {
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
              Terms of <span className="text-brand-red">Service</span>
            </h1>
            <p className="text-gray-400 text-sm">
              Last Updated: October 2026
            </p>
          </div>

          {/* HIGHLIGHTED SMS TERMS & CONDITIONS (MANDATORY CARRIER COMPLIANCE) */}
          <div className="bg-zinc-900/90 border-2 border-brand-red p-6 md:p-8 rounded-xl shadow-[0_0_40px_rgba(224,40,38,0.15)] mb-12 relative overflow-hidden">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-brand-red p-2 rounded-lg text-white">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white">
                SMS Terms & Conditions
              </h2>
            </div>

            <div className="space-y-5 text-gray-200 leading-relaxed">
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                SMS Messaging Terms & Conditions:
              </h3>

              <div className="bg-black/60 border border-white/10 rounded-lg p-5 space-y-4 text-sm md:text-base">
                <p>
                  <strong className="text-white">1. Program Description:</strong> When you opt in, <strong>I Hate Picture Day</strong> will send SMS text messages regarding picture day schedules, photo gallery access codes, preview availability, order deadlines, and customer service updates.
                </p>
                <p>
                  <strong className="text-white">2. Opt-Out Instructions:</strong> You can cancel the SMS service at any time. Simply reply <strong className="text-brand-red">STOP</strong> to any text message. Upon sending STOP, we will confirm your unsubscribe request, and you will receive no further SMS messages unless you re-subscribe.
                </p>
                <p>
                  <strong className="text-white">3. Help & Support:</strong> If you experience issues with our messaging service, reply with the keyword <strong className="text-brand-red">HELP</strong> for assistance, or contact our support team directly at{" "}
                  <a href="mailto:maxx@ihatepictureday.com" className="text-brand-red underline hover:text-white transition-colors">
                    maxx@ihatepictureday.com
                  </a>{" "}
                  or{" "}
                  <a href="tel:936-676-8613" className="text-brand-red underline hover:text-white transition-colors">
                    936-676-8613
                  </a>.
                </p>
                <p>
                  <strong className="text-white">4. Rates & Frequency:</strong> Message frequency varies based on your photo gallery activity. Message and data rates may apply for any messages sent to you from us and to us from you.
                </p>
                <p>
                  <strong className="text-white">5. Carrier Liability:</strong> Mobile carriers are not liable for delayed or undelivered messages.
                </p>
                <p>
                  <strong className="text-white">6. Privacy:</strong> View our full Privacy Policy at{" "}
                  <Link href="/privacy-policy" className="text-brand-red underline hover:text-white transition-colors">
                    https://www.ihatepictureday.com/privacy-policy
                  </Link>.
                </p>
              </div>
            </div>
          </div>

          {/* GENERAL TERMS OF SERVICE */}
          <div className="space-y-10 text-gray-300 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic text-white flex items-center gap-2">
                <FileText className="text-brand-red w-5 h-5 inline" /> 1. Agreement to Terms
              </h2>
              <p>
                These Terms of Service constitute a legally binding agreement between you and <strong>I Hate Picture Day</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), governing your access to and use of <Link href="https://www.ihatepictureday.com" className="text-brand-red hover:underline">https://www.ihatepictureday.com</Link>, our online photo galleries, ordering platform, and SMS communications. By accessing our website or placing an order, you agree to be bound by these Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic text-white">
                2. Photography Services & Picture Days
              </h2>
              <p>
                I Hate Picture Day provides sports photography, custom graphic composites (dynamic team composites, custom player cards, banners, big heads), and proofing services for youth sports leagues, travel teams, schools, and organizations.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>Athletes are photographed individually to create individual portraits and composite team graphics.</li>
                <li>Session schedules, gallery release timelines, and product fulfillment dates are estimated and subject to event schedules and production capacity.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic text-white">
                3. Photo Proofing, Orders & Delivery
              </h2>
              <p>
                Photos are made available for proofing and ordering through our online gallery system. 
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li><strong>Advance Pay Credits:</strong> Advance Pay credits purchased prior to picture day are non-refundable and apply toward photo package orders once the gallery opens. Free shipping perks associated with Advance Pay apply only when ordered within specified deadlines.</li>
                <li><strong>Custom Graphics & Prints:</strong> All physical prints, custom cutout graphics (&quot;big heads&quot;), banners, and specialty merchandise are custom manufactured upon order placement.</li>
                <li><strong>Digital Downloads:</strong> Digital image files are licensed for personal, non-commercial use by parents and athletes upon completed purchase.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic text-white">
                4. Intellectual Property & Image Rights
              </h2>
              <p>
                All photographs, composite graphics, logos, and materials created by I Hate Picture Day remain the intellectual property of I Hate Picture Day and are protected by United States copyright laws. Customers purchasing photos or digital products receive a personal, non-exclusive license to view, share, and print images for personal, non-commercial use.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic text-white">
                5. Refunds, Reprints & Corrections
              </h2>
              <p>
                Because our photographic prints and graphics are custom-produced for each athlete, all sales are final once an order enters production. If an item arrives damaged or contains a printing defect or clerical error attributable to our lab, please contact our support team within 14 days of delivery with photos of the issue for a replacement reprint.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic text-white flex items-center gap-2">
                <AlertCircle className="text-brand-red w-5 h-5 inline" /> 6. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, I Hate Picture Day shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services, website, or SMS notifications. Our total liability for any claim arising out of your order shall not exceed the total amount paid by you for the order in dispute.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic text-white">
                7. Governing Law
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law principles.
              </p>
            </section>

            <section className="space-y-4 pt-6 border-t border-white/10">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic text-white">
                8. Contact & Customer Support
              </h2>
              <p>For questions regarding these Terms or support with an order or messaging program:</p>
              <div className="bg-zinc-900/60 p-6 rounded-lg border border-white/10 space-y-3">
                <p className="font-bold text-white text-lg">I Hate Picture Day Support</p>
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
