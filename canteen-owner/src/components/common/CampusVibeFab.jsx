import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Flame } from 'lucide-react';

/**
 * CampusVibeFab
 * Floating interactive button in the corner that triggers campus confetti bursts,
 * cheerful campus quotes, and celebratory vibes.
 */
export const CampusVibeFab = () => {
  const [activeQuote, setActiveQuote] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const campusQuotes = [
    '🎓 MITS Gwalior runs on hot samosas & pure genius!',
    '⚡ Zero Queues • More Time for Coding & Campus Life!',
    '🏛️ Heritage since 1957 • Innovation in 2026!',
    '🍔 Fresh food delivered right to MITS Main Canteen Counter!',
    '☕ Cold Coffee + Friends = Best MITS Moments!',
    '🚀 Smart Campus Dining built by Ayush Pandey!',
  ];

  const handleCheerClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // Dual-burst confetti
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 70,
      origin: { x, y },
      colors: ['#7955E8', '#526DFF', '#10B981', '#F472B6', '#FBBF24'],
      disableForReducedMotion: true,
    });

    confetti({
      particleCount: 50,
      angle: 120,
      spread: 70,
      origin: { x, y },
      colors: ['#7955E8', '#526DFF', '#10B981', '#F472B6', '#FBBF24'],
      disableForReducedMotion: true,
    });

    const randomQuote = campusQuotes[Math.floor(Math.random() * campusQuotes.length)];
    setActiveQuote(randomQuote);

    setTimeout(() => {
      setActiveQuote(null);
    }, 4500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Dynamic Pop-up Quote Toast */}
      {activeQuote && (
        <div className="max-w-xs sm:max-w-sm px-4 py-3 rounded-2xl bg-[#151C30]/95 border border-purple-500/40 text-white text-xs font-bold shadow-2xl backdrop-blur-xl animate-bounce flex items-center gap-2.5">
          <span className="text-xl shrink-0">✨</span>
          <p className="leading-snug">{activeQuote}</p>
        </div>
      )}

      {/* Floating Magic Cheer Pill */}
      <button
        onClick={handleCheerClick}
        className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#7955E8] via-[#526DFF] to-[#10B981] text-white font-black text-xs shadow-xl shadow-purple-500/40 hover:shadow-purple-500/70 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
        title="Tap for Campus Magic & Confetti! 🎉"
      >
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 opacity-60 blur-sm group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
        <Sparkles className="w-4 h-4 text-amber-300 animate-spin relative z-10" style={{ animationDuration: '6s' }} />
        <span className="relative z-10 tracking-wide font-extrabold">Campus Vibe ✨</span>
      </button>
    </div>
  );
};
