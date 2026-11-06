import React from 'react';
import { Flame, Clock, ShieldCheck, Sparkles, Zap, UtensilsCrossed, Tv, CheckCircle2 } from 'lucide-react';

/**
 * LiveCanteenTicker
 * Seamless infinite marquee banner highlighting live canteen highlights,
 * instant pickup speed, and pure vegetarian guarantee.
 */
export const LiveCanteenTicker = () => {
  const highlights = [
    { icon: Flame, text: 'Hot & Fresh Samosas Ready', color: 'text-amber-500 dark:text-amber-400' },
    { icon: Zap, text: 'Instant Counter Pickup (~3-5 mins)', color: 'text-purple-600 dark:text-purple-400' },
    { icon: ShieldCheck, text: '100% Pure Vegetarian Kitchen', color: 'text-emerald-600 dark:text-emerald-400' },
    { icon: Tv, text: 'Live TV Token Calling Active at Counter', color: 'text-blue-600 dark:text-blue-400' },
    { icon: UtensilsCrossed, text: 'Pre-order from Classrooms & Hostels', color: 'text-pink-600 dark:text-pink-400' },
    { icon: Sparkles, text: 'Official MITS Gwalior Campus Portal', color: 'text-indigo-600 dark:text-indigo-400' },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-slate-100/90 dark:bg-gradient-to-r dark:from-[#0B1020] dark:via-[#151C30]/90 dark:to-[#0B1020] border-y border-purple-500/20 py-2.5 backdrop-blur-md shadow-xs dark:shadow-lg z-20 transition-colors">
      {/* Ambient edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-slate-100 dark:from-[#0B1020] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-slate-100 dark:from-[#0B1020] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="animate-marquee flex items-center gap-8 sm:gap-12 whitespace-nowrap">
        {[...highlights, ...highlights].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1C263A]/80 border border-purple-500/25 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-purple-500/50 shadow-xs transition-all cursor-default"
            >
              <Icon className={`w-3.5 h-3.5 ${item.color} animate-pulse shrink-0`} />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
