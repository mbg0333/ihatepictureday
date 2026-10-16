"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  AlertCircle,
  Camera,
  ChevronRight,
  ShieldCheck,
  Send
} from "lucide-react";
import { LookupMatch } from "@/lib/lookupEngine";

interface PlayerLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEventId?: string;
  initialEventName?: string;
}

export function PlayerLookupModal({
  isOpen,
  onClose,
  initialEventId = "",
  initialEventName = ""
}: PlayerLookupModalProps) {
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [matches, setMatches] = useState<LookupMatch[]>([]);
  const [error, setError] = useState("");

  // Claim phone state per match
  const [phoneInputs, setPhoneInputs] = useState<Record<string, string>>({});
  const [claimStatus, setClaimStatus] = useState<Record<string, { loading: boolean; success: boolean; msg: string }>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (initialEventId) setSelectedEventId(initialEventId);
  }, [initialEventId]);

  // Load available events
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/lookup")
      .then((res) => res.json())
      .then((data) => {
        if (data.events && Array.isArray(data.events)) {
          setEvents(data.events);
          if (!selectedEventId && data.events.length > 0) {
            setSelectedEventId(data.events[0].id);
          }
        }
      })
      .catch((err) => console.error("Failed to load events for lookup:", err));
  }, [isOpen]);

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
    } catch (err: any) {
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
          [code]: { loading: false, success: true, msg: "Link sent! We'll also text you future gallery updates." }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-zinc-950 border border-brand-red/40 shadow-2xl p-6 md:p-8 my-8 text-white max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 transition-colors"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-brand-red flex items-center justify-center">
            <Search className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tight">
              Player / Subject <span className="text-brand-red">Lookup</span>
            </h2>
            <p className="text-xs text-gray-400">
              Find your athlete's private gallery and GotPhoto access code in seconds.
            </p>
          </div>
        </div>

        {/* Lookup Form */}
        <form onSubmit={handleSearch} className="space-y-4 my-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Select Event / League
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Athlete First Name
              </label>
              <input
                type="text"
                placeholder="e.g. Lucas, Mike, Sophia"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 px-4 py-3 text-sm font-medium text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Athlete Last Name
              </label>
              <input
                type="text"
                placeholder="e.g. Jenkins, Chang, Miller"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 px-4 py-3 text-sm font-medium text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-gray-500 italic">
              ⚡ Flexible search handles nicknames (Mike / Michael) and minor spelling typos.
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-brand-red hover:bg-white hover:text-brand-red text-white font-black uppercase italic tracking-wider text-sm transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <span>Searching...</span>
              ) : (
                <>
                  <span>Find Gallery</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center space-x-2 mb-4">
            <AlertCircle size={16} className="text-brand-red shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && !loading && (
          <div className="mt-6 border-t border-white/10 pt-6 space-y-4">
            {matches.length === 0 ? (
              <div className="text-center py-8 bg-zinc-900/60 border border-white/5 p-6">
                <p className="text-lg font-black uppercase text-gray-300 mb-1">No Matches Found</p>
                <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
                  We couldn't find an athlete matching &ldquo;{firstName} {lastName}&rdquo; in this event.
                  Try searching with just the first name or last name, or check for typos.
                </p>
                <a
                  href="/booking"
                  className="inline-block text-xs font-bold text-brand-red uppercase tracking-wider hover:underline"
                >
                  Need Help? Contact Maxx Directly &rarr;
                </a>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-green-400 mb-3 flex items-center space-x-1.5">
                  <Sparkles size={14} />
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
                        className="bg-zinc-900 p-5 border border-white/10 hover:border-brand-red/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-black uppercase tracking-tight text-white">
                                {match.studentName || `${match.firstName} ${match.lastName}`}
                              </h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-red/20 text-brand-red border border-brand-red/30 uppercase tracking-widest">
                                {match.confidence}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                              {match.groupName && <span>Team: <strong className="text-gray-200">{match.groupName}</strong></span>}
                              {match.identifier && <span>ID: <strong className="text-gray-200">{match.identifier}</strong></span>}
                              {match.eventName && <span>Event: <strong className="text-gray-200">{match.eventName}</strong></span>}
                            </div>
                            {match.matchReason && (
                              <p className="text-[11px] text-gray-500 italic mt-1">
                                {match.matchReason}
                              </p>
                            )}
                          </div>

                          {/* Access Code Box */}
                          <div className="flex items-center space-x-2 bg-black px-3 py-2 border border-white/10 shrink-0">
                            <span className="text-[10px] font-bold uppercase text-gray-400">Code:</span>
                            <span className="font-mono font-black text-sm text-brand-red tracking-wider">
                              {code}
                            </span>
                            <button
                              onClick={() => handleCopyCode(code)}
                              className="text-gray-400 hover:text-white transition-colors ml-1 p-1"
                              title="Copy Access Code"
                            >
                              {copiedCode === code ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          {/* 1-Click Direct Gallery Login Button */}
                          <a
                            href={directUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3 bg-brand-red hover:bg-white hover:text-brand-red text-white font-black uppercase italic tracking-wider text-xs transition-all"
                          >
                            <span>Open My Gallery Now</span>
                            <ExternalLink size={14} />
                          </a>

                          {/* Text Me This Link Drawer Trigger */}
                          <div className="flex items-center gap-2 flex-1">
                            <div className="relative flex-1">
                              <Smartphone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                              <input
                                type="tel"
                                placeholder="Text link to cell phone"
                                value={phoneInputs[code] || ""}
                                onChange={(e) =>
                                  setPhoneInputs({ ...phoneInputs, [code]: e.target.value })
                                }
                                className="w-full bg-black border border-white/10 pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-colors"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleClaimPhone(match)}
                              disabled={claimInfo?.loading || !phoneInputs[code]}
                              className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-xs tracking-wider transition-colors disabled:opacity-40 shrink-0"
                            >
                              {claimInfo?.loading ? "Sending..." : "Send"}
                            </button>
                          </div>
                        </div>

                        {/* Claim Feedback */}
                        {claimInfo && (
                          <div
                            className={`mt-2 text-xs p-2 ${
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
      </motion.div>
    </div>
  );
}
