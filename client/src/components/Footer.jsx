import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Clock, MapPin, Phone, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative bg-[#070B16] text-[#AAB3C5] border-t border-purple-500/20 pt-16 pb-12 overflow-hidden">
      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7955E8]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#526DFF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg shadow-purple-500/20 border-2 border-purple-500/40 shrink-0">
                <img
                  src="/assets/campus/mits-logo.png"
                  alt="MITS Gwalior Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.src = '/images/mits/mits-logo.png'; }}
                />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  MITS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7955E8] to-[#526DFF]">CANTEEN</span>
                </span>
                <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Estd. 1957 &bull; Gwalior</p>
              </div>
            </div>
            <p className="text-xs text-[#AAB3C5] leading-relaxed">
              Madhav Institute of Technology & Science (MITS), Gwalior. Official smart campus dining and live digital token tracking system.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4" /> 100% Pure Veg &bull; Express Counter 1
            </div>
          </div>

          {/* Timings Col */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" /> Canteen Timings
            </h4>
            <ul className="text-xs space-y-2 text-[#AAB3C5]">
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Breakfast:</span>
                <span className="text-white font-medium">8:00 AM – 11:30 AM</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Lunch Hours:</span>
                <span className="text-white font-medium">12:00 PM – 3:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Evening Snacks:</span>
                <span className="text-white font-medium">3:30 PM – 6:30 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Beverages & Shakes:</span>
                <span className="text-white font-medium">All Day until 7:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Pickup Counter */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" /> Pickup Counter & Address
            </h4>
            <div className="space-y-2 text-xs text-[#AAB3C5]">
              <div className="bg-[#151C30]/80 p-3 rounded-2xl border border-purple-500/20">
                <div className="flex items-center gap-2 text-purple-300 font-extrabold mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  MITS Main Canteen • Counter 1 (Express Pickup)
                </div>
                <p className="text-[11px] text-[#AAB3C5] leading-relaxed">
                  Address: MITS Main Canteen, MITS Campus, Race Course Road, Gola Ka Mandir, Gwalior (M.P.) - 474005.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links & Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-purple-400" /> Need Assistance?
            </h4>
            <p className="text-xs text-[#AAB3C5]">
              MITS Canteen Supervisory Desk: MITS Main Canteen, MITS Campus, Gwalior (M.P.).
            </p>
            <div className="text-xs space-y-1.5 text-slate-300">
              <p>📞 Phone: +91 98112 23344</p>
              <p>✉️ Email: canteen@mitsgwalior.in</p>
            </div>
            <div className="pt-2">
              <Link
                to="/live-tokens"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1C263A] text-purple-300 border border-purple-500/30 hover:bg-[#25334d] hover:text-white transition-all shadow-sm"
              >
                Open TV Token Display Board &rarr;
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-purple-500/20 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#AAB3C5] gap-4">
          <p>© {new Date().getFullYear()} MITS Canteen — Madhav Institute of Technology & Science, Gwalior. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            Crafted for MITSians with <Heart className="w-3.5 h-3.5 text-purple-400 fill-purple-400 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
