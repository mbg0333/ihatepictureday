"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GalleryEvent } from "@/data/types";
import {
  Camera,
  CheckCircle2,
  MessageSquare,
  Phone,
  Mail,
  User,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface OptInClientProps {
  availableEvents: GalleryEvent[];
}

export function OptInClient({ availableEvents }: OptInClientProps) {
  const searchParams = useSearchParams();
  const preselectId = searchParams.get("event") || searchParams.get("id") || "";
  const [eventsList, setEventsList] = useState<GalleryEvent[]>(availableEvents);

  // Synchronize latest events from cloud API and localStorage fallback
  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (data.events && Array.isArray(data.events) && data.events.length > 0) {
          const filtered = data.events.filter(
            (e: GalleryEvent) => e.status !== "Archive" && e.optInActive !== false
          );
          setEventsList(filtered);
        }
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem('ihatepictureday_events');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setEventsList(parsed.filter((e: GalleryEvent) => e.status !== "Archive" && e.optInActive !== false));
            }
          }
        } catch {}
      });
  }, []);

  const [name, setName] = useState("");
  const [athleteName, setAthleteName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [customEventName, setCustomEventName] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [registeredData, setRegisteredData] = useState<{
    name: string;
    phone: string;
    eventName: string;
  } | null>(null);

  // Auto-select event if passed in query string or default to first
  useEffect(() => {
    if (!preselectId) {
      if (eventsList.length > 0 && !selectedEventId) {
        setSelectedEventId(eventsList[0].id);
      }
      return;
    }

    const clean = preselectId.trim().toLowerCase();
    const cleanNorm = clean.replace(/[^a-z0-9]/g, "");

    // 1. Match against id, accessCode, or name
    const match = eventsList.find((e) => {
      const eId = (e.id || "").toLowerCase();
      const eIdNorm = eId.replace(/[^a-z0-9]/g, "");
      const eCode = (e.accessCode || "").toLowerCase();
      const eCodeNorm = eCode.replace(/[^a-z0-9]/g, "");
      const eName = (e.name || "").toLowerCase();

      return (
        eId === clean ||
        eIdNorm === cleanNorm ||
        eCode === clean ||
        eCodeNorm === cleanNorm ||
        eName.includes(clean)
      );
    });

    if (match) {
      setSelectedEventId(match.id);
      return;
    }

    // 2. CRITICAL PRESERVATION: If a specific event code was passed in the URL (e.g. HYB22026),
    // NEVER fall back to Central Baseball!
    // Dynamically add it so parents are guaranteed to register for their exact requested event!
    const customEvent: GalleryEvent = {
      id: preselectId,
      name: `${preselectId.toUpperCase()} (Picture Day)`,
      status: "Live",
      accessCode: preselectId.toUpperCase(),
      link: `https://my.photoday.com/g/${preselectId.toUpperCase()}`,
      date: new Date().toISOString(),
      displayDate: "Current Season",
      samples: [],
      specials: []
    };

    setEventsList((prev) => {
      if (prev.some((e) => e.id.toLowerCase() === preselectId.toLowerCase())) {
        return prev;
      }
      return [customEvent, ...prev];
    });
    setSelectedEventId(preselectId);
  }, [preselectId, eventsList, selectedEventId]);

  // Format phone number dynamically as (XXX) XXX-XXXX
  const handlePhoneChange = (val: string) => {
    const rawDigits = val.replace(/\D/g, "").slice(0, 10);
    let formatted = rawDigits;
    if (rawDigits.length > 6) {
      formatted = `(${rawDigits.slice(0, 3)}) ${rawDigits.slice(3, 6)}-${rawDigits.slice(6)}`;
    } else if (rawDigits.length > 3) {
      formatted = `(${rawDigits.slice(0, 3)}) ${rawDigits.slice(3)}`;
    } else if (rawDigits.length > 0) {
      formatted = `(${rawDigits}`;
    }
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const rawDigits = phone.replace(/\D/g, "");
    if (rawDigits.length < 10) {
      setError("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    if (!consentAgreed) {
      setError("Please agree to the SMS notification terms to receive text alerts.");
      return;
    }

    let finalEventName = "Youth Sports Picture Day";
    if (selectedEventId === "other") {
      finalEventName = customEventName.trim() || "Other / Special Event";
    } else {
      const found = eventsList.find((e) => e.id === selectedEventId);
      if (found) finalEventName = found.name;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          athleteName,
          phone,
          email,
          eventId: selectedEventId,
          eventName: finalEventName,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
        setRegisteredData({
          name,
          phone,
          eventName: finalEventName,
        });
      } else {
        setError(data.error || "Unable to complete registration. Please try again.");
      }
    } catch (err: any) {
      setError("A network error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setAthleteName("");
    setPhone("");
    setEmail("");
    setCustomEventName("");
    setIsSuccess(false);
    setError("");
  };

  return (
    <main className="min-h-screen bg-brand-black text-white flex flex-col selection:bg-brand-red selection:text-white">
      <Navbar />

      <section className="py-12 md:py-20 relative overflow-hidden flex-1 flex items-center">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-brand-red/10 blur-[120px] pointer-events-none" />
        <div className="absolute left-0 bottom-1/4 w-96 h-96 bg-brand-red/5 blur-[120px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container mx-auto px-4 md:px-6 max-w-2xl relative z-10">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-zinc-900/90 border border-white/10 p-6 md:p-10 rounded-2xl shadow-2xl backdrop-blur-md relative overflow-hidden"
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-6">
                  <div className="inline-flex items-center gap-2 bg-brand-red/10 border border-brand-red/30 px-3 py-1 rounded-full text-brand-red text-xs font-black uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>Instant Gallery Alerts</span>
                  </div>
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-widest hidden sm:inline">
                    100% Free
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tight text-white mb-3">
                  Picture Day <span className="text-brand-red">Registration</span>
                </h1>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8">
                  Sign up to receive an instant text the minute your athlete&apos;s photos are online, view proofs first, and unlock early-bird free shipping deals.
                </p>

                {error && (
                  <div className="mb-6 bg-red-950/80 border border-brand-red/60 p-4 rounded-lg flex items-center gap-3 text-red-200 text-sm">
                    <AlertCircle className="w-5 h-5 text-brand-red shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Event Selection Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Calendar size={13} className="text-brand-red" />
                      <span>Select Your Picture Day / Event</span>
                    </label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full bg-black/80 border border-white/15 rounded-lg px-4 py-3.5 text-sm md:text-base font-bold text-white outline-none focus:border-brand-red transition-colors cursor-pointer"
                      required
                    >
                      {eventsList.map((evt) => (
                        <option key={evt.id} value={evt.id} className="bg-zinc-900 text-white">
                          {evt.name} {evt.displayDate ? `(${evt.displayDate})` : ""}
                        </option>
                      ))}
                      <option value="other" className="bg-zinc-900 text-white">
                        + Other / League Not Listed
                      </option>
                    </select>
                  </div>

                  {/* If Other selected */}
                  {selectedEventId === "other" && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                        Event / League Name
                      </label>
                      <input
                        type="text"
                        value={customEventName}
                        onChange={(e) => setCustomEventName(e.target.value)}
                        placeholder="e.g. Hudson Youth Soccer Fall 2026"
                        required
                        className="w-full bg-black/80 border border-white/15 rounded-lg px-4 py-3 text-sm font-medium text-white placeholder-gray-600 outline-none focus:border-brand-red transition-colors"
                      />
                    </div>
                  )}

                  {/* Two column: Parent Name & Athlete Name */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <User size={13} className="text-brand-red" />
                        <span>Parent / Contact Name *</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sarah Johnson"
                        required
                        className="w-full bg-black/80 border border-white/15 rounded-lg px-4 py-3 text-sm md:text-base font-medium text-white placeholder-gray-600 outline-none focus:border-brand-red transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Camera size={13} className="text-brand-red" />
                        <span>Athlete&apos;s Name (Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={athleteName}
                        onChange={(e) => setAthleteName(e.target.value)}
                        placeholder="e.g. Mason #12"
                        className="w-full bg-black/80 border border-white/15 rounded-lg px-4 py-3 text-sm md:text-base font-medium text-white placeholder-gray-600 outline-none focus:border-brand-red transition-colors"
                      />
                    </div>
                  </div>

                  {/* Two column: Cell Phone & Email */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Phone size={13} className="text-brand-red" />
                        <span>Mobile Cell Phone *</span>
                      </label>
                      <input
                        type="tel"
                        inputMode="tel"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="(936) 555-0123"
                        required
                        className="w-full bg-black/80 border border-white/15 rounded-lg px-4 py-3 text-sm md:text-base font-bold text-white placeholder-gray-600 outline-none focus:border-brand-red transition-colors tracking-wide"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Mail size={13} className="text-brand-red" />
                        <span>Email Address *</span>
                      </label>
                      <input
                        type="email"
                        inputMode="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sarah@example.com"
                        required
                        className="w-full bg-black/80 border border-white/15 rounded-lg px-4 py-3 text-sm md:text-base font-medium text-white placeholder-gray-600 outline-none focus:border-brand-red transition-colors"
                      />
                    </div>
                  </div>

                  {/* MANDATORY LEGAL & COMPLIANCE CONSENT BOX (A2P 10DLC & TCPA) */}
                  <div className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-5 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={consentAgreed}
                        onChange={(e) => setConsentAgreed(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded accent-brand-red cursor-pointer shrink-0"
                        required
                      />
                      <span className="text-xs font-bold text-gray-300 leading-snug">
                        I agree to receive automated SMS alerts for picture day schedules, photo gallery access codes, preview availability, and special launch offers from I Hate Picture Day.
                      </span>
                    </label>

                    <div className="text-[11px] text-gray-500 leading-relaxed border-t border-white/5 pt-2">
                      <span className="font-semibold text-gray-400">Compliance & Privacy Terms:</span>{" "}
                      Consent is not a condition of purchase. Message frequency varies based on your event activity. Message and data rates may apply. You may opt out at any time by replying <strong className="text-brand-red">STOP</strong> to any text message, or reply <strong className="text-white">HELP</strong> for support. No mobile information will be shared with third parties for marketing purposes. View our{" "}
                      <Link href="/privacy-policy" target="_blank" className="text-brand-red hover:underline">
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link href="/terms-of-service" target="_blank" className="text-brand-red hover:underline">
                        Terms of Service
                      </Link>.
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-red hover:bg-red-700 text-white font-black italic uppercase tracking-wider py-4 px-6 rounded-xl transition-all shadow-[0_0_30px_rgba(224,40,38,0.35)] flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Register For Picture Day</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 font-bold uppercase tracking-wider pt-2">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-brand-red" />
                      Spam-Free Guarantee
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-brand-red" />
                      Reply STOP Anytime
                    </span>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* SUCCESS CONFIRMATION SCREEN */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-900 border-2 border-brand-red p-8 md:p-12 rounded-2xl shadow-[0_0_50px_rgba(224,40,38,0.25)] text-center relative overflow-hidden"
              >
                <div className="w-20 h-20 bg-brand-red/10 border-2 border-brand-red rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(224,40,38,0.4)]">
                  <CheckCircle2 className="w-10 h-10 text-brand-red animate-pulse" />
                </div>

                <span className="text-brand-red text-xs font-black uppercase tracking-widest inline-block mb-2">
                  Registration Confirmed
                </span>
                <h2 className="text-3xl md:text-5xl font-black italic uppercase text-white mb-4">
                  You&apos;re On <span className="text-brand-red">The List!</span>
                </h2>

                <p className="text-gray-300 text-base md:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
                  Thanks <strong className="text-white">{registeredData?.name}</strong>! We have registered your mobile number{" "}
                  <strong className="text-white">{registeredData?.phone}</strong> for{" "}
                  <span className="text-brand-red font-bold">{registeredData?.eventName}</span>.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-5 max-w-md mx-auto mb-8 text-left space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-red">
                    What happens next:
                  </h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-brand-red font-bold">1.</span>
                      <span>We photograph the athletes on picture day.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-red font-bold">2.</span>
                      <span>You receive a text notification the second the online proofing gallery goes live.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-red font-bold">3.</span>
                      <span>Your text will include your direct access code and early-bird free shipping deals!</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-xs tracking-wider rounded-lg transition-colors"
                  >
                    Register Another Athlete
                  </button>
                  <Link
                    href="/gallery"
                    className="w-full sm:w-auto px-6 py-3 bg-brand-red hover:bg-red-700 text-white font-black italic uppercase text-xs tracking-wider rounded-lg transition-colors shadow-lg"
                  >
                    View Sample Photos
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </main>
  );
}
