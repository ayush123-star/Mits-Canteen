import React from 'react';
import { Flame, Clock, ShieldCheck, Sparkles, Zap, UtensilsCrossed, Tv, CheckCircle2 } from 'lucide-react';

/**
 * LiveCanteenTicker
 * Seamless infinite marquee banner highlighting live canteen highlights,
 * instant pickup speed, and pure vegetarian guarantee.
 */
export const LiveCanteenTicker = () => {
  const highlights = [
    { icon: Flame, text: 'Hot & Fresh Samosas Ready', color: 'text-amber-400' },
    { icon: Zap, text: 'Instant Counter Pickup (~3-5 mins)', color: 'text-purple-400' },
    { icon: ShieldCheck, text: '100% Pure Vegetarian Kitchen', color: 'text-emerald-400' },
    { icon: Tv, text: 'Live Token Calling TV Active at Counter', color: 'text-blue-400' },
    { icon: UtensilsCrossed, text: 'Pre-order from Classrooms & Hostels', color: 'text-pink-400' },
    { icon: Sparkles, text: 'Official MITS Gwalior Campus Portal', color: 'text-indigo-400' },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#0B1020] via-[#151C30]/90 to-[#0B1020] border-y border-purple-500/25 py-2.5 backdrop-blur-md shadow-lg z-20">
      {/* Ambient glowing radial edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#0B1020] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#0B1020] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="animate-marquee flex items-center gap-8 sm:gap-12 whitespace-nowrap">
        {[...highlights, ...highlights].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#1C263A]/60 border border-purple-500/20 text-xs font-bold text-slate-200 hover:border-purple-500/40 hover:bg-[#1C263A] transition-all cursor-default"
            >
              <Icon className={`w-3.5 h-3.5 ${item.color} animate-pulse`} />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
