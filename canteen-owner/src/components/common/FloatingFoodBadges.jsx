import React from 'react';
import confetti from 'canvas-confetti';

/**
 * FloatingFoodBadges
 * Interactive floating glassmorphism food orbs with gentle harmonic physics
 * and celebratory sparkle/confetti on tap!
 */
export const FloatingFoodBadges = () => {
  const triggerConfetti = (e, emoji) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: ['#7955E8', '#526DFF', '#10B981', '#F472B6', '#FBBF24'],
      disableForReducedMotion: true,
      scalar: 0.9,
    });
  };

  return (
    <>
      {/* 1. Floating Paneer Pizza Badge - Upper Left */}
      <div
        onClick={(e) => triggerConfetti(e, '🍕')}
        className="hidden xl:flex absolute -top-8 -left-12 z-30 animate-float-gentle cursor-pointer group"
        title="Click for Campus Magic! ✨"
      >
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#151C30]/90 border border-purple-500/40 backdrop-blur-xl shadow-xl shadow-purple-950/40 group-hover:scale-110 group-hover:border-purple-400 transition-all duration-300">
          <span className="text-2xl group-hover:rotate-12 transition-transform">🍕</span>
          <div>
            <p className="text-[10px] uppercase font-black tracking-wider text-purple-300">Fresh Baked</p>
            <p className="text-xs font-black text-white">Paneer Pizza</p>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-500/30">
            ₹120
          </span>
        </div>
      </div>

      {/* 2. Floating Cold Coffee Badge - Lower Right */}
      <div
        onClick={(e) => triggerConfetti(e, '☕')}
        className="hidden xl:flex absolute -bottom-8 -right-8 z-30 animate-float-reverse cursor-pointer group"
        title="Click for Campus Magic! ✨"
      >
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#151C30]/90 border border-blue-500/40 backdrop-blur-xl shadow-xl shadow-blue-950/40 group-hover:scale-110 group-hover:border-blue-400 transition-all duration-300">
          <span className="text-2xl group-hover:rotate-12 transition-transform">☕</span>
          <div>
            <p className="text-[10px] uppercase font-black tracking-wider text-blue-300">Campus Hit</p>
            <p className="text-xs font-black text-white">Cold Coffee</p>
          </div>
          <span className="text-[10px] bg-purple-500/20 text-purple-300 font-extrabold px-1.5 py-0.5 rounded-md border border-purple-500/30">
            ₹40
          </span>
        </div>
      </div>

      {/* 3. Floating Masala Burger - Mid Left on larger screens */}
      <div
        onClick={(e) => triggerConfetti(e, '🍔')}
        className="hidden 2xl:flex absolute top-1/2 -left-16 z-30 animate-float-slow cursor-pointer group"
        title="Click for Campus Magic! ✨"
      >
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#151C30]/85 border border-amber-500/40 backdrop-blur-xl shadow-lg shadow-amber-950/30 group-hover:scale-110 group-hover:border-amber-400 transition-all duration-300">
          <span className="text-xl group-hover:rotate-12 transition-transform">🍔</span>
          <div>
            <p className="text-[9px] uppercase font-black tracking-wider text-amber-300">Crispy Patty</p>
            <p className="text-xs font-black text-white">Aloo Tikki Burger</p>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.5 rounded-md border border-amber-500/30">
            ₹50
          </span>
        </div>
      </div>
    </>
  );
};
