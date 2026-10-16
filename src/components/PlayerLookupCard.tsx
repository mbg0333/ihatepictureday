"use client";

import { useState } from "react";
import { Search, ChevronRight, Sparkles, User, Camera } from "lucide-react";
import { PlayerLookupModal } from "./PlayerLookupModal";

interface PlayerLookupCardProps {
  defaultEventId?: string;
  defaultEventName?: string;
}

export function PlayerLookupCard({ defaultEventId = "", defaultEventName = "" }: PlayerLookupCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="p-6 md:p-8 bg-zinc-900 border border-brand-red/30 hover:border-brand-red/70 transition-all shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 -mr-8 -mt-8 rounded-full pointer-events-none group-hover:scale-125 transition-transform" />
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-brand-red flex items-center justify-center shrink-0">
            <Search className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tight text-white">
              Can&apos;t Find Your <span className="text-brand-red">Gallery?</span>
            </h3>
            <p className="text-xs text-gray-400">
              Missed pre-registration or lost your code? Search by your athlete&apos;s name.
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed mb-6">
          Our smart player lookup instantly locates your child&apos;s GotPhoto private gallery link and access code—even if you misspell a letter or use a nickname.
        </p>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full py-4 bg-brand-red hover:bg-white hover:text-brand-red text-white font-black uppercase italic tracking-wider text-sm transition-all flex items-center justify-center space-x-2 shadow-lg"
        >
          <span>Find Athlete&apos;s Gallery</span>
          <ChevronRight size={18} />
        </button>

        <div className="mt-4 flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          <span>1-Click Direct Login</span>
          <span>&bull;</span>
          <span>Free SMS Delivery</span>
          <span>&bull;</span>
          <span>Instant Access</span>
        </div>
      </div>

      <PlayerLookupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialEventId={defaultEventId}
        initialEventName={defaultEventName}
      />
    </>
  );
}
