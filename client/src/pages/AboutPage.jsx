import React from 'react';
import { UtensilsCrossed, ShieldCheck, Zap, Heart, Award, Clock, MapPin, Users, Phone, Mail, Building2, Landmark, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="space-y-16 py-8 pb-20 text-white">
      
      {/* 1. HERO SECTION WITH SUBTLE MITS CAMPUS PANORAMA BACKGROUND */}
      <section className="relative overflow-hidden bg-[#0B1020] text-white py-16 sm:py-24">
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/assets/campus/mits-heritage-building.jpg"
            alt="MITS Gwalior Heritage Architecture"
            className="w-full h-full object-cover filter brightness-[0.35] contrast-[1.1] scale-105"
            onError={(e) => { e.target.src = '/images/mits/mits-heritage-building.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-[#0B1020]/75 to-[#0B1020]/85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(121,85,232,0.18),transparent_75%)]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151C30]/80 border border-purple-500/30 text-white text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-xl">
            <Landmark className="w-4 h-4 text-purple-300" />
            <span>Madhav Institute of Technology & Science &bull; Gwalior</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            MITS CANTEEN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400">
              Zero Queue Campus Dining
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#AAB3C5] max-w-2xl mx-auto leading-relaxed font-normal">
            Engineered exclusively for MITSians across the 44.6-acre campus. Order fresh breakfast, student thalis, and refreshments right from your departments, and pick up without standing in 20-minute break lines at MITS Main Canteen Counter 1.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/menu"
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-black text-sm shadow-xl shadow-purple-500/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Explore Food Menu</span>
            </Link>
            <Link
              to="/live-tokens"
              className="px-7 py-3.5 rounded-2xl bg-[#1C263A] hover:bg-[#25334d] backdrop-blur-md border border-purple-500/30 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md"
            >
              <span>Live Token TV Display</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. THREE CORE PILLARS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl card-3d space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold border border-purple-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white">Zero Wait Time</h3>
            <p className="text-xs text-[#AAB3C5] leading-relaxed font-normal">
              Eliminates chaotic physical queues through live automated digital tokens synced between the kitchen, TV calling screens, and WhatsApp alerts.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl card-3d space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white">Hygiene & Quality Assured</h3>
            <p className="text-xs text-[#AAB3C5] leading-relaxed font-normal">
              Fresh vegetables, dairy, and spices sourced daily. Prepared in a monitored stainless-steel kitchen facility adhering to national food safety standards.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl card-3d space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold border border-blue-500/30">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white">Student Budget Friendly</h3>
            <p className="text-xs text-[#AAB3C5] leading-relaxed font-normal">
              Nutritious meals, heavy thalis, and quick snacks priced fairly for students, with special break-time combos and exam season discount coupons.
            </p>
          </div>
        </div>
      </section>

      {/* 3. MITS HERITAGE & ARCHITECTURE STORY */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-purple-500/25 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider border border-purple-500/30">
              Heritage Since 1957 &bull; Gwalior
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Six Decades of Engineering & Innovation at MITS
            </h2>
            <p className="text-xs sm:text-sm text-[#AAB3C5] leading-relaxed">
              Founded in 1957 by His Highness Sir Jiwaji Rao Scindia, Maharaja of Gwalior, and foundation stone laid by the First President of India, Dr. Rajendra Prasad, MITS is one of central India's most venerated technical institutions.
            </p>
            <p className="text-xs sm:text-sm text-[#AAB3C5] leading-relaxed">
              Spanning 44.6 lush acres on Race Course Road, the campus unites premier engineering laboratories, architecture studios, sports complexes, and student life. MITS Main Canteen brings modern digital efficiency to match our university's proud technology legacy.
            </p>
            <div className="pt-2 grid grid-cols-3 gap-4 border-t border-purple-500/20">
              <div>
                <p className="text-2xl font-black text-white">1957</p>
                <p className="text-[10px] text-[#AAB3C5] font-semibold uppercase">Foundation Year</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">44.6 Acres</p>
                <p className="text-[10px] text-[#AAB3C5] font-semibold uppercase">Green Campus</p>
              </div>
              <div>
                <p className="text-2xl font-black text-purple-300">Counter 1</p>
                <p className="text-[10px] text-[#AAB3C5] font-semibold uppercase">Main Canteen Hub</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-500/30 card-3d">
              <img
                src="/assets/campus/mits-main-gate.jpg"
                alt="MITS Gwalior Main Gate"
                className="w-full h-80 object-cover"
                onError={(e) => { e.target.src = '/images/mits/mits-main-gate.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020]/85 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-xs">
                  Main Campus Gate
                </span>
                <p className="font-black text-sm text-white mt-1">Race Course Road &bull; Gola Ka Mandir</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CAMPUS DINING & MAIN CANTEEN COUNTER ARCHITECTURE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1C263A] rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-8 relative overflow-hidden border border-purple-500/25">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              MITS Campus Infrastructure
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Consolidated Express Pickup Counter 1
            </h2>
            <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1 max-w-2xl">
              All student orders are routed to a single streamlined counter at MITS Main Canteen for maximum clarity and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#151C30] border border-purple-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white">
                  Counter 1 &bull; Express Station
                </span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Active
                </span>
              </div>
              <h4 className="text-base font-bold text-white">
                MITS Main Canteen &bull; Campus Core
              </h4>
              <p className="text-xs text-[#AAB3C5] leading-relaxed font-normal">
                Serving freshly pressed Veg Burgers, Grilled Sandwiches, Campus Thalis, South Indian Masala Dosas, Samosas, Chai, Chilled Cold Coffees and Shakes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#151C30] border border-purple-500/20 space-y-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-400" /> Canteen Supervisory & Help Desk
              </h4>
              <p className="text-xs text-[#AAB3C5] leading-relaxed">
                Got a custom faculty order or special campus club gathering? Reach our canteen management desk directly:
              </p>
              <div className="text-xs text-slate-300 space-y-1.5 pt-1">
                <p>📍 Location: MITS Main Canteen, MITS Campus, Gwalior</p>
                <p>📞 Phone: +91 98112 23344</p>
                <p>✉️ Email: canteen@mitsgwalior.in</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
