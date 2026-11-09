import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FoodCard } from '../components/FoodCard';
import { FoodDetailModal } from '../components/FoodDetailModal';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AestheticHeroBackground } from '../components/common/AestheticHeroBackground';
import { HomepageCravingsModal } from '../components/admin/HomepageCravingsModal';
import { LiveCanteenTicker } from '../components/common/LiveCanteenTicker';
import {
  UtensilsCrossed,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  QrCode,
  Tv,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award,
  MapPin,
  SlidersHorizontal,
  Copy,
  Check,
  Search,
  Coffee,
  Sandwich,
  Phone,
  Sparkles,
  Info
} from 'lucide-react';

export const HomePage = () => {
  const { menuItems, homepageConfig, getTodayDiscount } = useData();
  const { user, isAdmin } = useAuth();
  const [selectedFood, setSelectedFood] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const handleCopyPromo = (code) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    } catch (_) {}
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/menu');
    }
  };

  const todayDiscount = getTodayDiscount
    ? getTodayDiscount()
    : { day: 'Today', percent: 15, title: 'Campus Special Offer', promoCode: 'CAMPUSDAY' };

  // Dynamic Popular Items: Strictly ONLY the dishes selected by Canteen Owner in Cravings
  const popularItems = useMemo(() => {
    const all = Array.isArray(menuItems) ? menuItems : [];

    if (!homepageConfig?.featuredCravingsIds || !Array.isArray(homepageConfig.featuredCravingsIds) || homepageConfig.featuredCravingsIds.length === 0) {
      return [];
    }

    return homepageConfig.featuredCravingsIds
      .map((id) => all.find((m) => m && (m._id === id || m.id === id || String(m._id || m.id) === String(id))))
      .filter(Boolean);
  }, [menuItems, homepageConfig?.featuredCravingsIds]);

  return (
    <div className="space-y-14 sm:space-y-16 pb-20 overflow-x-hidden text-white">

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#08090D] text-white">
        <AestheticHeroBackground>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[80vh] lg:min-h-[85vh] flex items-center py-12 lg:py-16 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center w-full">

              {/* Left Column: Authentic College Branding & Search Discovery */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                
                {/* Official College Badge */}
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#151C30] border border-purple-500/30 text-white text-[11px] sm:text-xs font-bold tracking-wide shadow-lg backdrop-blur-md">
                  <div className="w-5 h-5 rounded-md bg-white p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                    <img
                      src="/assets/campus/mits-logo.png"
                      alt="MITS Gwalior"
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.src = '/images/mits/mits-logo.png'; }}
                    />
                  </div>
                  <span className="text-purple-300 font-extrabold">MITS GWALIOR</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-slate-300">Central Campus Canteen</span>
                </div>

                {/* HEADING */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
                  Order Fresh Campus Meals. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400">
                    Skip the Break Queue.
                  </span>
                </h1>

                {/* SUBTITLE */}
                <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  The official online food ordering portal for MITS Gwalior. Pre-order breakfast, lunch thalis, hot snacks, and cold beverages from your lecture hall or hostel. Collect fresh at Counter 1 or 2 when your token is called.
                </p>

                {/* REAL CAMPUS UTILITY: INTEGRATED SEARCH BAR */}
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative max-w-xl mx-auto lg:mx-0 bg-[#151C30]/90 border border-purple-500/30 rounded-2xl p-1.5 flex items-center shadow-xl backdrop-blur-md focus-within:border-purple-400 transition-colors"
                >
                  <div className="pl-3 text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search samosa, masala dosa, thali, coffee, burgers..."
                    className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-bold text-xs sm:text-sm shrink-0 transition-all cursor-pointer shadow-md"
                  >
                    Find Dishes
                  </button>
                </form>

                {/* QUICK CATEGORY SHORTCUTS */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
                  <span className="text-slate-400 text-[11px] font-semibold">Quick links:</span>
                  {[
                    { label: 'All Dishes', to: '/menu' },
                    { label: 'Breakfast & Dosa', to: '/menu?category=Breakfast' },
                    { label: 'Lunch & Thali', to: '/menu?category=Lunch' },
                    { label: 'Snacks & Samosa', to: '/menu?category=Snacks' },
                    { label: 'Beverages', to: '/menu?category=Beverages' },
                  ].map((cat, idx) => (
                    <Link
                      key={idx}
                      to={cat.to}
                      className="px-2.5 py-1 rounded-lg bg-[#151C30] hover:bg-[#1C263A] border border-purple-500/20 hover:border-purple-400/50 text-slate-300 hover:text-white transition-colors text-[11px] font-medium"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>

                {/* STATUS STRIP */}
                <div className="pt-4 grid grid-cols-3 gap-4 border-t border-purple-500/20 max-w-lg mx-auto lg:mx-0">
                  <div className="text-center lg:text-left">
                    <p className="text-xl sm:text-2xl font-black text-white">~5–8 Min</p>
                    <p className="text-[11px] text-slate-400 font-medium">Avg. Prep Time</p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center justify-center lg:justify-start gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Open Now
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">08:00 AM – 07:30 PM</p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-xl sm:text-2xl font-black text-purple-300">Counter 1 & 2</p>
                    <p className="text-[11px] text-slate-400 font-medium">Active Counters</p>
                  </div>
                </div>

              </div>

              {/* Right Column: Campus Canteen Live Showcase & TV Screen Preview */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md bg-[#111625] rounded-3xl border border-purple-500/25 p-4 sm:p-5 shadow-2xl">
                  
                  {/* Photo of MITS Main Canteen Dining Hall */}
                  <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-[#0B1020] shadow-inner">
                    <img
                      src="/assets/campus/mits-main-canteen.jpg"
                      alt="MITS Gwalior Main Canteen"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => { e.target.src = '/images/mits/mits-main-canteen.jpg'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-transparent to-black/30"></div>
                    
                    {/* Live Counter Calling Pill Top Left */}
                    <div className="absolute top-3 left-3 bg-[#0B1020]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Now Serving: Token #TK-104</span>
                    </div>

                    {/* Bottom Caption */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="bg-[#0B1020]/90 backdrop-blur-md p-3 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-purple-400" /> Ground Floor, MITS Campus
                          </span>
                          <span className="text-[10px] text-purple-300 font-semibold">100% Pure Veg</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Counter 1 (Snacks & Drinks) &bull; Counter 2 (Meals & Thalis)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Direct Link to Live TV Token Calling Board */}
                  <div className="mt-4 pt-3 border-t border-purple-500/20">
                    <Link
                      to="/live-tokens"
                      className="w-full py-3 px-4 rounded-xl bg-[#151C30] hover:bg-[#1C263A] text-white border border-purple-500/30 flex items-center justify-between text-xs font-bold transition-all group shadow-sm"
                    >
                      <span className="flex items-center gap-2 text-purple-300 group-hover:text-white">
                        <Tv className="w-4 h-4 text-purple-400" />
                        <span>Dining Hall Live TV Calling Display</span>
                      </span>
                      <span className="text-slate-400 group-hover:text-white text-[11px] flex items-center gap-1">
                        Open Screen <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </Link>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </AestheticHeroBackground>
      </section>

      {/* 2. LIVE MARQUEE ANNOUNCEMENT TICKER */}
      <LiveCanteenTicker />

      {/* 3. CORE SERVICE HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#111625] rounded-3xl p-6 sm:p-8 border border-purple-500/25 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-purple-500/20 shadow-xl">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Pre-Order from Classroom</h4>
              <p className="text-xs text-slate-400 mt-0.5">Order before lecture break ends and walk straight to the counter when ready.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-300 flex items-center justify-center shrink-0 border border-blue-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Digital Token & QR Receipt</h4>
              <p className="text-xs text-slate-400 mt-0.5">Instant unique token pass generated on checkout for contactless handoff.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">UPI & Cash Payments</h4>
              <p className="text-xs text-slate-400 mt-0.5">Pay seamlessly with any UPI app or pay cash directly at the counter.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. POPULAR FOOD ITEMS (Strictly owner-chosen cravings) */}
      {(popularItems.length > 0 || isAdmin) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Canteen Owner Only Quick Edit Bar (Clean & Professional) */}
          {isAdmin && (
            <div className="mb-6 p-3.5 rounded-2xl bg-[#151C30] border border-purple-500/40 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Canteen Management:</span>
                <span className="text-xs text-purple-300 font-medium">
                  {popularItems.length} Featured Item(s) Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer"
                >
                  Edit Cravings
                </button>
              </div>
            </div>
          )}

          {popularItems.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">
                    <Flame className="w-4 h-4 text-purple-400 fill-purple-400" />
                    Campus Favorites
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {homepageConfig?.cravingsTitle || 'Popular Campus Cravings'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {homepageConfig?.cravingsSubtitle || 'Top rated and most ordered dishes at MITS Canteen today.'}
                  </p>
                </div>

                <Link
                  to="/menu"
                  className="inline-flex items-center gap-1 text-xs font-bold text-purple-300 hover:text-white transition-colors group"
                >
                  <span>View Complete Menu</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {popularItems.map((food) => (
                  <FoodCard
                    key={food._id || food.id}
                    food={food}
                    onSelect={(item) => setSelectedFood(item)}
                  />
                ))}
              </div>
            </>
          ) : (
            isAdmin && (
              <div className="p-8 rounded-2xl bg-[#151C30]/50 border border-dashed border-purple-500/30 text-center space-y-3">
                <p className="text-sm font-semibold text-white">No dishes currently featured in Cravings.</p>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#7955E8] text-white font-bold text-xs"
                >
                  Select Dishes for Cravings
                </button>
              </div>
            )
          )}
        </section>
      )}

      {/* 5. DAILY CAMPUS SAVER PROMOTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#111625] border border-purple-500/25 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-3 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                  {todayDiscount.day} Special Saver &bull; {todayDiscount.percent}% OFF
                </span>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-2.5 py-1 rounded-full bg-slate-800 text-purple-200 border border-purple-500/30 text-[11px] font-bold"
                  >
                    Edit Discount
                  </button>
                )}
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {todayDiscount.title || `${todayDiscount.day} Student Saver: Flat ${todayDiscount.percent}% OFF!`}
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Apply coupon code{' '}
                <button
                  type="button"
                  onClick={() => handleCopyPromo(todayDiscount.promoCode || 'CAMPUSDAY')}
                  className="font-mono font-bold bg-[#0B0D14] hover:bg-[#151926] border border-purple-500/40 px-2.5 py-0.5 rounded-lg text-purple-300 hover:text-white transition-all inline-flex items-center gap-1 cursor-pointer"
                  title="Click to copy coupon"
                >
                  <span>{todayDiscount.promoCode || 'CAMPUSDAY'}</span>
                  {copiedCode ? (
                    <span className="text-emerald-400 text-[10px] font-sans font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3 h-3 text-purple-400" />
                  )}
                </button>{' '}
                at checkout on orders above ₹{todayDiscount.minOrderValue || 99}.
              </p>

              <div className="pt-2">
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-bold text-xs sm:text-sm shadow-md transition-transform hover:-translate-y-0.5"
                >
                  <span>Order with Discount</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="p-5 rounded-2xl bg-[#151C30] border border-purple-500/30 text-center space-y-2 w-full max-w-xs shadow-md">
                <Award className="w-10 h-10 text-purple-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Daily Meal Saver</h4>
                <p className="text-xs text-slate-400">Burger + Peri Peri Fries + Cold Coffee</p>
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  ₹{Math.round(210 * (1 - todayDiscount.percent / 100))}
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full inline-block border border-emerald-500/30">
                  Save {todayDiscount.percent}% Flat
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (AUTHENTIC PROCESS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
            Simple Digital Flow
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            How Token Pickup Works
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Four easy steps from classroom ordering to food collection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              step: '01',
              title: 'Select Dishes',
              desc: 'Browse breakfast, fresh thalis, hot snacks, or cold drinks with pure veg dietary filters.',
              icon: UtensilsCrossed,
              counter: 'Menu Catalog',
            },
            {
              step: '02',
              title: 'Set Pickup Slot',
              desc: 'Choose immediate kitchen prep (~5-8m) or schedule specifically for your upcoming break.',
              icon: Clock,
              counter: 'Break Scheduling',
            },
            {
              step: '03',
              title: 'Get Digital Token',
              desc: 'Pay via UPI or select Cash at Counter to receive your digital Token Number & QR Code.',
              icon: QrCode,
              counter: 'Contactless Pass',
            },
            {
              step: '04',
              title: 'Collect at Counter',
              desc: 'Watch the dining hall TV calling board or check your phone pass. Collect tray when ready.',
              icon: CheckCircle2,
              counter: 'Counter 1 or 2',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#111625] rounded-2xl p-5 border border-purple-500/25 flex flex-col justify-between hover:border-purple-400/50 transition-colors shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-black text-purple-400 bg-purple-500/15 px-2.5 py-1 rounded-lg border border-purple-500/30">
                      STEP {item.step}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1.5">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-purple-500/20 text-[11px] font-semibold text-purple-300">
                  {item.counter}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. AUTHENTIC CAMPUS CANTEEN INFORMATION & COUNTER GUIDE (REPLACING FAKE AI REVIEWS) */}
      <section className="bg-[#0C111F] py-14 border-y border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
              Campus Facilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              MITS Canteen & Counter Guide
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Everything you need to know about dining hours, counters, and campus facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Counter 1 Guide */}
            <div className="bg-[#111625] rounded-2xl p-6 border border-purple-500/25 space-y-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Counter 1: Express Snacks & Drinks</h4>
                  <p className="text-[11px] text-purple-300">Fast Grab & Go Service</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated to quick 10-15 minute lecture break orders: hot samosas, kachoris, patties, vegetable sandwiches, tea, filter coffee, and cold beverages.
              </p>
              <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-slate-300 font-medium">
                <span>Avg. wait time:</span>
                <span className="text-emerald-400 font-bold">2 – 4 mins</span>
              </div>
            </div>

            {/* Counter 2 Guide */}
            <div className="bg-[#111625] rounded-2xl p-6 border border-purple-500/25 space-y-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-500/30">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Counter 2: Hot Kitchen & Meals</h4>
                  <p className="text-[11px] text-blue-300">Fresh Made-to-Order Dishes</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                South Indian Masala Dosa, Idli-Vada, North Indian Lunch Thali, Paneer Parathas, Chowmein, and Maggi. Cooked freshly upon online confirmation.
              </p>
              <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-slate-300 font-medium">
                <span>Avg. wait time:</span>
                <span className="text-purple-300 font-bold">6 – 9 mins</span>
              </div>
            </div>

            {/* Timings & Helpdesk */}
            <div className="bg-[#111625] rounded-2xl p-6 border border-purple-500/25 space-y-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Canteen Hours & Helpdesk</h4>
                  <p className="text-[11px] text-emerald-300">Monday to Saturday</p>
                </div>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
                <li>&bull; <strong className="text-slate-200">Breakfast:</strong> 08:00 AM – 11:30 AM</li>
                <li>&bull; <strong className="text-slate-200">Lunch Hours:</strong> 12:00 PM – 03:00 PM</li>
                <li>&bull; <strong className="text-slate-200">Evening Snacks:</strong> 03:30 PM – 07:30 PM</li>
              </ul>
              <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-slate-300 font-medium">
                <span>Supervisory Desk:</span>
                <span className="text-white font-bold">+91 98112 23344</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Food Detail Modal */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}

      {/* Canteen Owner Cravings & Discount Modal */}
      {isAdmin && (
        <HomepageCravingsModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

    </div>
  );
};
