"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  AlertCircle,
  Camera,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Send,
  HelpCircle,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { LookupMatch } from "@/lib/lookupEngine";

export default function FindPageClient() {
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [matches, setMatches] = useState<LookupMatch[]>([]);
  const [error, setError] = useState("");

  const [phoneInputs, setPhoneInputs] = useState<Record<string, string>>({});
  const [claimStatus, setClaimStatus] = useState<Record<string, { loading: boolean; success: boolean; msg: string }>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Missing athlete recovery form states
  const [missingAthleteName, setMissingAthleteName] = useState("");
  const [missingTeamName, setMissingTeamName] = useState("");
  const [missingAge, setMissingAge] = useState("");
  const [missingParentName, setMissingParentName] = useState("");
  const [missingParentEmail, setMissingParentEmail] = useState("");
  const [missingParentPhone, setMissingParentPhone] = useState("");
  const [missingNotes, setMissingNotes] = useState("");
  const [missingSubmitting, setMissingSubmitting] = useState(false);
  const [missingSubmitted, setMissingSubmitted] = useState(false);
  const [missingError, setMissingError] = useState("");

  useEffect(() => {
    fetch("/api/lookup")
      .then((res) => res.json())
      .then((data) => {
        if (data.events && Array.isArray(data.events)) {
          setEvents(data.events);
          if (data.events.length > 0) {
            setSelectedEventId(data.events[0].id);
          }
        }
      })
      .catch((err) => console.error("Failed to load events:", err));
  }, []);

  const getSelectedEventName = () => {
    if (!selectedEventId || selectedEventId === "all") return "Youth Sports Picture Day";
    const found = events.find((e) => String(e.id) === String(selectedEventId));
    return found ? found.name : "Youth Sports Picture Day";
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!firstName.trim() && !lastName.trim()) {
      setError("Please enter a first name or last name.");
      return;
    }

    setError("");
    setLoading(true);
    setHasSearched(true);
    setMatches([]);
    setMissingSubmitted(false);
    setMissingError("");
    setMissingAthleteName(`${firstName.trim()} ${lastName.trim()}`.trim());

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId || "all",
          firstName: firstName.trim(),
          lastName: lastName.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setMatches(data.matches || []);
      } else {
        setError(data.error || "Lookup failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleClaimPhone = async (match: LookupMatch) => {
    const code = match.accessCode;
    const phone = phoneInputs[code] || "";
    if (!phone.trim()) return;

    setClaimStatus((prev) => ({
      ...prev,
      [code]: { loading: true, success: false, msg: "" }
    }));

    try {
      const res = await fetch("/api/lookup/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessCode: match.accessCode,
          galleryUrl: match.galleryUrl,
          athleteName: match.studentName || `${match.firstName} ${match.lastName}`.trim(),
          eventName: match.eventName || selectedEventId,
          phone: phone.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setClaimStatus((prev) => ({
          ...prev,
          [code]: { loading: false, success: true, msg: "Link sent to your phone! You're now registered for gallery updates." }
        }));
      } else {
        setClaimStatus((prev) => ({
          ...prev,
          [code]: { loading: false, success: false, msg: data.error || "Failed to send text." }
        }));
      }
    } catch {
      setClaimStatus((prev) => ({
        ...prev,
        [code]: { loading: false, success: false, msg: "Network error sending text." }
      }));
    }
  };

  const handleMissingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missingParentPhone.trim() || !missingParentEmail.trim()) {
      setMissingError("Please provide your phone number and email address.");
      return;
    }
    if (!missingTeamName.trim() || !missingAge.trim()) {
      setMissingError("Please provide your athlete's team name and age/division.");
      return;
    }

    setMissingSubmitting(true);
    setMissingError("");

    try {
      const res = await fetch("/api/lookup/missing-athlete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteName: missingAthleteName.trim() || `${firstName.trim()} ${lastName.trim()}`,
          eventName: getSelectedEventName(),
          teamName: missingTeamName.trim(),
          age: missingAge.trim(),
          parentName: missingParentName.trim(),
          parentEmail: missingParentEmail.trim(),
          parentPhone: missingParentPhone.trim(),
          notes: missingNotes.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setMissingSubmitted(true);
      } else {
        setMissingError(data.error || "Failed to submit request. Please try again.");
      }
    } catch {
      setMissingError("Network error. Please try again.");
    } finally {
      setMissingSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-black flex flex-col text-white">
      <Navbar />

      <section className="py-12 md:py-16 flex-1">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-widest mb-4">
              <Camera size={14} />
              <span>Instant Gallery Finder</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tight mb-4">
              Find My <span className="text-brand-red">Athlete</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-medium">
              Didn&apos;t pre-register or lost your access code? Enter your child&apos;s name below to get your direct 1-click private gallery link.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-zinc-950 border border-brand-red/40 p-6 md:p-10 shadow-2xl mb-12">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Select Event / Organization
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-brand-red transition-colors"
                >
                  <option value="all">Search All Events</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Athlete First Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lucas, Mike, Emma"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 px-4 py-3.5 text-sm font-medium text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Athlete Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jenkins, Chang, Miller"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 px-4 py-3.5 text-sm font-medium text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <p className="text-xs text-gray-500 italic">
                  ⚡ Smart search recognizes common nicknames (e.g. Mike &rarr; Michael) and minor spelling typos.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-brand-red hover:bg-white hover:text-brand-red text-white font-black uppercase italic tracking-wider text-sm transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Searching...</span>
                  ) : (
                    <>
                      <span>Find My Gallery</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center space-x-2">
                <AlertCircle size={16} className="text-brand-red shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Results */}
            {hasSearched && !loading && (
              <div className="mt-8 border-t border-white/10 pt-8 space-y-4">
                {matches.length === 0 ? (
                  /* INLINE MISSING ATHLETE ASSISTANCE FORM */
                  <div className="bg-zinc-900/90 border border-brand-red/40 p-6 md:p-8">
                    {!missingSubmitted ? (
                      <div>
                        <div className="flex items-start space-x-3 mb-4">
                          <div className="w-9 h-9 bg-brand-red/20 border border-brand-red/40 flex items-center justify-center shrink-0 mt-0.5">
                            <HelpCircle className="text-brand-red" size={20} />
                          </div>
                          <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tight text-white">
                              Can&apos;t Find Your Athlete? Let&apos;s Locate Your Gallery!
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                              We couldn&apos;t find an athlete matching &ldquo;{firstName} {lastName}&rdquo; in {getSelectedEventName()}. Fill out these details below and Maxx will find your photos and text/email your private GotPhoto link directly to you!
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleMissingSubmit} className="space-y-4 mt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                                Athlete Name <span className="text-brand-red">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={missingAthleteName}
                                onChange={(e) => setMissingAthleteName(e.target.value)}
                                placeholder="Full athlete name"
                                className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-red transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                                Event / League
                              </label>
                              <input
                                type="text"
                                readOnly
                                value={getSelectedEventName()}
                                className="w-full bg-zinc-950 border border-white/5 px-3.5 py-2.5 text-xs text-gray-400 cursor-not-allowed"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                                Team Name <span className="text-brand-red">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={missingTeamName}
                                onChange={(e) => setMissingTeamName(e.target.value)}
                                placeholder="e.g. 8U Red Sox, Tigers, Varsity"
                                className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                                Age / Division <span className="text-brand-red">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={missingAge}
                                onChange={(e) => setMissingAge(e.target.value)}
                                placeholder="e.g. 8U, 10U, 7th Grade, High School"
                                className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-colors"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                                Parent Name
                              </label>
                              <input
                                type="text"
                                value={missingParentName}
                                onChange={(e) => setMissingParentName(e.target.value)}
                                placeholder="Your name"
                                className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                                Parent Email <span className="text-brand-red">*</span>
                              </label>
                              <input
                                type="email"
                                required
                                value={missingParentEmail}
                                onChange={(e) => setMissingParentEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                                Parent Cell Phone <span className="text-brand-red">*</span>
                              </label>
                              <input
                                type="tel"
                                required
                                value={missingParentPhone}
                                onChange={(e) => setMissingParentPhone(e.target.value)}
                                placeholder="(936) 555-0142"
                                className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-colors"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                              Jersey # or Helpful Notes (Optional)
                            </label>
                            <input
                              type="text"
                              value={missingNotes}
                              onChange={(e) => setMissingNotes(e.target.value)}
                              placeholder="e.g. Jersey #12, missed main photo day / shot during makeup"
                              className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-colors"
                            />
                          </div>

                          {missingError && (
                            <div className="p-3 bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center space-x-2">
                              <AlertCircle size={14} className="text-brand-red shrink-0" />
                              <span>{missingError}</span>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={missingSubmitting}
                            className="w-full py-4 bg-brand-red hover:bg-white hover:text-brand-red text-white font-black uppercase italic tracking-wider text-sm transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 cursor-pointer"
                          >
                            {missingSubmitting ? (
                              <span>Submitting Request...</span>
                            ) : (
                              <>
                                <span>Submit Request to Locate Gallery</span>
                                <Send size={16} />
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    ) : (
                      /* SUCCESS STATE */
                      <div className="text-center py-6">
                        <div className="w-14 h-14 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 size={32} className="text-green-400" />
                        </div>
                        <h3 className="text-2xl font-black italic uppercase text-white mb-2">
                          Request Received!
                        </h3>
                        <p className="text-sm text-gray-300 max-w-lg mx-auto mb-4">
                          Thanks {missingParentName || "for submitting"}! Maxx has been notified and will locate <strong>{missingAthleteName}</strong>&apos;s photos from <strong>{getSelectedEventName()}</strong>.
                        </p>
                        <p className="text-xs text-brand-red font-bold uppercase tracking-wider">
                          We will text your 1-click private gallery link to {missingParentPhone} and email {missingParentEmail}!
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-green-400 mb-4 flex items-center space-x-2">
                      <Sparkles size={16} />
                      <span>Found {matches.length} matching {matches.length === 1 ? "athlete" : "athletes"}:</span>
                    </p>

                    <div className="space-y-4">
                      {matches.map((match, idx) => {
                        const code = match.accessCode;
                        const directUrl =
                          match.galleryUrl ||
                          `https://orders.ihatepictureday.com/login?access_code=${code}`;
                        const claimInfo = claimStatus[code];

                        return (
                          <div
                            key={idx}
                            className="bg-zinc-900 p-6 border border-white/10 hover:border-brand-red/50 transition-colors"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center space-x-3">
                                  <h3 className="text-xl font-black uppercase tracking-tight text-white">
                                    {match.studentName || `${match.firstName} ${match.lastName}`}
                                  </h3>
                                  <span className="text-[10px] font-black px-2.5 py-0.5 bg-brand-red/20 text-brand-red border border-brand-red/40 uppercase tracking-widest">
                                    {match.confidence}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1.5">
                                  {match.groupName && <span>Team: <strong className="text-gray-200">{match.groupName}</strong></span>}
                                  {match.identifier && <span>ID: <strong className="text-gray-200">{match.identifier}</strong></span>}
                                  {match.eventName && <span>Event: <strong className="text-gray-200">{match.eventName}</strong></span>}
                                </div>
                                {match.matchReason && (
                                  <p className="text-[11px] text-gray-500 italic mt-1.5">
                                    {match.matchReason}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center space-x-3 bg-black px-4 py-2.5 border border-white/10 shrink-0">
                                <span className="text-xs font-bold uppercase text-gray-400">Access Code:</span>
                                <span className="font-mono font-black text-base text-brand-red tracking-wider">
                                  {code}
                                </span>
                                <button
                                  onClick={() => handleCopyCode(code)}
                                  className="text-gray-400 hover:text-white transition-colors p-1"
                                  title="Copy Code"
                                >
                                  {copiedCode === code ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                </button>
                              </div>
                            </div>

                            <div className="mt-5 pt-5 border-t border-white/5 flex flex-col md:flex-row items-stretch md:items-center gap-4">
                              <a
                                href={directUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 inline-flex items-center justify-center space-x-3 px-6 py-3.5 bg-brand-red hover:bg-white hover:text-brand-red text-white font-black uppercase italic tracking-wider text-sm transition-all"
                              >
                                <span>Open Private Gallery</span>
                                <ExternalLink size={16} />
                              </a>

                              <div className="flex items-center gap-2 flex-1">
                                <div className="relative flex-1">
                                  <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                  <input
                                    type="tel"
                                    placeholder="Enter cell phone for SMS"
                                    value={phoneInputs[code] || ""}
                                    onChange={(e) =>
                                      setPhoneInputs({ ...phoneInputs, [code]: e.target.value })
                                    }
                                    className="w-full bg-black border border-white/10 pl-10 pr-3 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-colors"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleClaimPhone(match)}
                                  disabled={claimInfo?.loading || !phoneInputs[code]}
                                  className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-xs tracking-wider transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
                                >
                                  {claimInfo?.loading ? "Sending..." : "Text Me Link"}
                                </button>
                              </div>
                            </div>

                            {claimInfo && (
                              <div
                                className={`mt-3 text-xs p-3 ${
                                  claimInfo.success
                                    ? "bg-green-950/60 border border-green-500/50 text-green-200"
                                    : "bg-red-950/60 border border-red-500/50 text-red-200"
                                }`}
                              >
                                {claimInfo.msg}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
