"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export const DynamicTeamDemo = () => {
  const [stage, setStage] = useState<"individual" | "assembling" | "complete">("individual");

  useEffect(() => {
    const timer = setInterval(() => {
      setStage(prev => {
        if (prev === "individual") return "assembling";
        if (prev === "assembling") return "complete";
        return "individual";
      });
    }, 4500); // 4.5 seconds per stage gives a good look
    return () => clearInterval(timer);
  }, []);

  // Real PNG athlete pulls correctly mapped to their exact positions in the final master photo.
  // Using percentages (left/bottom) makes the animation perfectly scalable on any screen size.
  const athletes = [
    // Back Row (z-index 10) - Lifted higher and spread slightly wider
    { id: 1, src: "/images/teamdemo/Elijah-LeeKennidy-6U-Dodgers_002.png", left: "12%", bottom: "25%", delay: 0.1, zIndex: 10, scale: 1.15 },
    { id: 2, src: "/images/teamdemo/Walker-Scott-6U-Dodgers_002.png", left: "37%", bottom: "30%", delay: 0.2, zIndex: 10, scale: 1.15 },
    { id: 3, src: "/images/teamdemo/Weston-ShaneWhitley-6U-Dodgers_002.png", left: "63%", bottom: "30%", delay: 0.3, zIndex: 10, scale: 1.15 },
    { id: 4, src: "/images/teamdemo/Kolton-LeeSearfoss-6U-Dodgers_002.png", left: "88%", bottom: "25%", delay: 0.4, zIndex: 10, scale: 1.15 },

    // Front Row (z-index 20) - Pulled slightly lower to reveal the back row better
    { id: 5, src: "/images/teamdemo/Will-Gandy-6U-Dodgers_001.png", left: "22%", bottom: "2%", delay: 0.5, zIndex: 20, scale: 1.45 },
    { id: 6, src: "/images/teamdemo/Easton-KalaniMelim-6U-Dodgers_002.png", left: "41%", bottom: "-2%", delay: 0.6, zIndex: 20, scale: 1.45 },
    { id: 7, src: "/images/teamdemo/Weston-LynnPowell-6U-Dodgers_001.png", left: "59%", bottom: "-2%", delay: 0.7, zIndex: 20, scale: 1.45 },
    { id: 8, src: "/images/teamdemo/Jaxon-LeeNetherton-6U-Dodgers_003.png", left: "78%", bottom: "2%", delay: 0.8, zIndex: 20, scale: 1.45 },
  ];

  const masterImage = "/images/teamdemo/6U DODGERS.jpg"; // The final completed team photo

  return (
    <div className="relative w-full max-w-none mx-auto aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Background Stadium Backdrop (blurred version of master image for context) */}
      <div className="absolute inset-0 opacity-20 grayscale">
        <img src={masterImage} alt="Background" className="w-full h-full object-cover blur-xl scale-110" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 pb-12">
        <AnimatePresence mode="wait">
          {stage === "individual" ? (
            <motion.div 
              key="individual"
              className="grid grid-cols-4 gap-2 md:gap-4 lg:gap-6 w-full h-full items-center max-w-4xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
            >
              {athletes.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ scale: 0, y: 50, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.4, delay: a.id * 0.1 }}
                  className="relative flex items-center justify-center bg-gradient-to-t from-zinc-900 to-zinc-800/80 border border-white/10 rounded-xl overflow-hidden aspect-[3/4] shadow-2xl w-full"
                >
                  <img 
                    src={a.src} 
                    className="w-full h-full object-contain p-1 md:p-2 drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]" 
                    alt={`Athlete ${a.id}`}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="group"
              className="relative w-full h-full flex items-center justify-center"
              initial={{ opacity: 1 }}
            >
              {/* Individual Athlete Pulls flying into perfectly responsive positions */}
              {athletes.map((a) => (
                <motion.div
                  key={a.id}
                  className="absolute w-[25%] md:w-[22%] h-[65%] md:h-[75%] flex items-end justify-center origin-bottom"
                  style={{ zIndex: a.zIndex }}
                  initial={{ 
                    left: "50%",
                    bottom: "50%",
                    x: "-50%",
                    y: "50%",
                    rotate: (Math.random() - 0.5) * 45,
                    opacity: 0,
                    scale: 0.2
                  }}
                  animate={stage === "complete" ? { 
                    left: a.left,
                    bottom: a.bottom,
                    x: "-50%",
                    y: 0,
                    rotate: 0,
                    opacity: 0, 
                    scale: a.scale
                  } : {
                    left: a.left,
                    bottom: a.bottom,
                    x: "-50%",
                    y: 0,
                    rotate: 0,
                    opacity: 1,
                    scale: a.scale
                  }}
                  transition={{ 
                    duration: 1.2, 
                    delay: a.delay,
                    type: "spring",
                    bounce: 0.2
                  }}
                >
                  <img 
                    src={a.src} 
                    className="max-h-full max-w-full object-contain drop-shadow-2xl" 
                    alt="Athlete Pull"
                  />
                </motion.div>
              ))}

              {/* The Master Team Photo reveal */}
              <motion.div
                className="absolute inset-0 z-10 flex items-center justify-center"
                initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                animate={stage === "complete" ? { opacity: 1, filter: "blur(0px)", scale: 1 } : { opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              >
                <div className="relative w-full h-full flex items-center justify-center group">
                  <img src={masterImage} alt="Final Team Photo" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-30">
        <div className={`w-16 h-1 rounded-full ${stage === 'individual' ? 'bg-brand-red shadow-[0_0_10px_rgba(224,40,38,0.8)]' : 'bg-white/20'} transition-all duration-500`} />
        <div className={`w-16 h-1 rounded-full ${stage === 'assembling' ? 'bg-brand-red shadow-[0_0_10px_rgba(224,40,38,0.8)]' : 'bg-white/20'} transition-all duration-500`} />
        <div className={`w-16 h-1 rounded-full ${stage === 'complete' ? 'bg-brand-red shadow-[0_0_10px_rgba(224,40,38,0.8)]' : 'bg-white/20'} transition-all duration-500`} />
      </div>
    </div>
  );
};
