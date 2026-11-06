import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FoodCard } from '../components/FoodCard';
import { FoodDetailModal } from '../components/FoodDetailModal';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { MitsCampusHeroVideo } from '../components/common/MitsCampusHeroVideo';
import { HomepageCravingsModal } from '../components/admin/HomepageCravingsModal';
import { LiveCanteenTicker } from '../components/common/LiveCanteenTicker';
import { TextRotator } from '../components/common/TextRotator';
import { FloatingFoodBadges } from '../components/common/FloatingFoodBadges';
import { TiltCard } from '../components/common/TiltCard';
import { BorderBeam } from '../components/common/BorderBeam';
import { CampusVibeFab } from '../components/common/CampusVibeFab';
import {
  UtensilsCrossed,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  QrCode,
  Tv,
  Star,
  Users,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award,
  Compass,
  MapPin,
  SlidersHorizontal,
  Settings,
  Percent
} from 'lucide-react';

export const HomePage = () => {
  const { menuItems, homepageConfig, getTodayDiscount } = useData();
  const { user, isAdmin } = useAuth();
  const [selectedFood, setSelectedFood] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const todayDiscount = getTodayDiscount ? getTodayDiscount() : { day: 'Today', percent: 15, title: 'Campus Special Offer', promoCode: 'CAMPUSDAY' };

  // Dynamic Popular Items: Owner selected dishes or fallback to top rated items
  const popularItems = useMemo(() => {
    if (homepageConfig?.featuredCravingsIds && homepageConfig.featuredCravingsIds.length > 0) {
      const selected = homepageConfig.featuredCravingsIds
        .map((id) => (menuItems || []).find((m) => (m._id || m.id) === id))
        .filter(Boolean);
      if (selected.length > 0) return selected;
    }
    return (menuItems || []).filter((item) => item.rating >= 4.7).slice(0, 4);
  }, [menuItems, homepageConfig?.featuredCravingsIds]);

  return (
    <div className="space-y-16 sm:space-y-20 pb-20 overflow-x-hidden text-white">
      
      {/* 1. HERO SECTION WITH FULL-SCREEN MITS GWALIOR BACKGROUND VIDEO */}
      <section className="relative overflow-hidden bg-[#0B1020] text-white">
        <MitsCampusHeroVideo
          videoSrc="/assets/videos/mits-campus-tour.mp4"
          posterSrc="/assets/videos/mits-campus-tour-poster.jpg"
          overlayClass="bg-gradient-to-t from-[#0B1020] via-[#0B1020]/80 to-[#0B1020]/60"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[85vh] lg:min-h-[90vh] flex items-center py-12 lg:py-20 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
              
              {/* Left Column: Headlines & CTA */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                {/* Official College Badge */}
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#151C30]/90 border border-purple-500/30 text-white text-[11px] sm:text-xs font-black tracking-wide shadow-2xl backdrop-blur-md max-w-full">
                  <img
                    src="/assets/campus/mits-logo.png"
                    alt="MITS Gwalior"
                    className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0"
                    onError={(e) => { e.target.src = '/images/mits/mits-logo.png'; }}
                  />
                  <span className="text-purple-300 shrink-0">MITS GWALIOR</span>
                  <span className="text-slate-500 shrink-0">&bull;</span>
                  <span className="text-[#AAB3C5] truncate">Main Canteen Counter</span>
                </div>

                {/* HEADING */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.1] text-white">
                  Your Campus, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400">
                    Your Canteen,
                  </span> <br />
                  <span className="text-white drop-shadow-md">
                    Your Convenience.
                  </span>
                </h1>

                {/* SUBTITLE WITH 3D TEXT ROTATOR */}
                <div className="text-lg sm:text-xl lg:text-2xl text-purple-200/95 font-extrabold max-w-xl mx-auto lg:mx-0 tracking-tight drop-shadow flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                  <span>Smart Campus Dining with</span>
                  <TextRotator />
                </div>

                <p className="text-sm sm:text-base text-[#AAB3C5] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Designed exclusively for MITSians! Pre-order hot breakfast, fresh lunch thalis, samosas, and cold coffee right from lecture halls, and collect directly at MITS Main Canteen Counter.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    to="/menu"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-black text-sm sm:text-base shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 hover:shadow-purple-500/50 active:translate-y-0"
                  >
                    <UtensilsCrossed className="w-5 h-5" />
                    <span>Order Food Online</span>
                  </Link>

                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#1C263A]/80 hover:bg-[#25334d] backdrop-blur-md border border-purple-500/30 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-md"
                  >
                    <span>Open Food Tray</span>
                    <ArrowRight className="w-4 h-4 text-purple-400" />
                  </button>
                </div>

                {/* Campus Trust Badges - 1 Express Counter */}
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-purple-500/20 max-w-lg mx-auto lg:mx-0">
                  <div className="text-center lg:text-left">
                    <p className="text-2xl font-black text-white">~5 Min</p>
                    <p className="text-[11px] text-[#AAB3C5] font-medium">Avg. Wait Time</p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-2xl font-black text-white">100%</p>
                    <p className="text-[11px] text-[#AAB3C5] font-medium">Queue Elimination</p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-2xl font-black text-purple-300">Main Canteen</p>
                    <p className="text-[11px] text-[#AAB3C5] font-medium">Express Counter</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual Card with Real MITS Campus Architecture & 3D Tilt */}
              <div className="lg:col-span-5 relative perspective-1000">
                {/* 3D Floating Interactive Food Badges with confetti on tap! */}
                <FloatingFoodBadges />

                <TiltCard className="mx-auto max-w-md" maxTilt={8}>
                  <div className="relative mx-auto max-w-md bg-gradient-to-tr from-[#1C263A]/90 via-[#151C30]/90 to-[#1C263A]/90 p-4 rounded-3xl border border-purple-500/30 shadow-2xl card-3d transform-style-3d backdrop-blur-xl overflow-hidden">
                    {/* Glowing animated border beam */}
                    <BorderBeam size={220} duration={5} colorFrom="#7955E8" colorTo="#526DFF" />

                    {/* 3D Floating Live Token Preview Badge */}
                    <div className="absolute -top-4 left-2 sm:-left-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl shadow-emerald-900/40 flex items-center gap-2 border border-emerald-300/40 animate-float-slow z-20">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                      <div className="text-left">
                        <p className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-emerald-200">
                          Now Serving &bull; Counter
                        </p>
                        <p className="text-xs sm:text-sm font-black font-mono">TOKEN #TK-101</p>
                      </div>
                    </div>

                    {/* 3D Floating MITS Verified Badge Bottom Right */}
                    <div className="absolute -bottom-3 right-2 sm:-right-3 bg-[#0B1020]/95 text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-purple-500/40 backdrop-blur-md z-20">
                      <Flame className="w-4 h-4 text-purple-400" />
                      <span className="text-[11px] sm:text-xs font-bold text-slate-200">MITS Main Canteen</span>
                    </div>

                    {/* Real MITS Main Canteen Dining Hall & Counter Photo */}
                    <div className="relative h-80 rounded-2xl overflow-hidden shadow-inner bg-[#0B1020]">
                      <img
                        src="/assets/campus/mits-main-canteen.jpg"
                        alt="MITS Gwalior Main Canteen"
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        onError={(e) => { e.target.src = '/images/mits/mits-main-canteen.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020]/95 via-[#0B1020]/30 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#7955E8] to-[#526DFF] shadow-sm">
                          MITS Main Canteen
                        </span>
                        <h4 className="text-lg font-black mt-1">MITS Main Canteen</h4>
                        <p className="text-xs text-[#AAB3C5]">Campus Dining Hall & Live Token Counter</p>
                      </div>
                    </div>

                    {/* Floating TV Kiosk Teaser Pill */}
                    <Link
                      to="/live-tokens"
                      className="mt-3 w-full bg-[#151C30]/90 hover:bg-[#7955E8] text-white p-3 rounded-xl border border-purple-500/30 flex items-center justify-between text-xs font-bold transition-all shadow-md group"
                    >
                      <span className="flex items-center gap-2 text-purple-300 group-hover:text-white">
                        <Tv className="w-4 h-4" /> Live TV Token Calling Screen
                      </span>
                      <span className="text-[#AAB3C5] group-hover:text-white text-[11px] flex items-center">
                        Open TV Display &rarr;
                      </span>
                    </Link>
                  </div>
                </TiltCard>
              </div>

            </div>
          </div>
        </MitsCampusHeroVideo>
      </section>

      {/* 1.5 INFINITE SMOOTH LIVE MARQUEE TICKER */}
      <LiveCanteenTicker />

      {/* 2. LIVE ORDER STATUS TICKER BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-purple-500/25 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-300 flex items-center justify-center font-bold shrink-0 border border-purple-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">Zero Wait in Queues</h4>
              <p className="text-xs text-[#AAB3C5]">Order from classrooms or library before break begins.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-300 flex items-center justify-center font-bold shrink-0 border border-blue-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">Digital Token & QR Pickup</h4>
              <p className="text-xs text-[#AAB3C5]">Instant unique token pass generated on checkout.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center font-bold shrink-0 border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">UPI & Cash Supported</h4>
              <p className="text-xs text-[#AAB3C5]">Pay seamlessly via UPI apps or pay cash at the counter.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR FOOD ITEMS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Canteen Owner Only Quick Live Toolbar */}
        {isAdmin && (
          <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-purple-900/30 border-2 border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white flex items-center justify-center font-black shadow-xs shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                    Canteen Owner Controls
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Visible Only To Canteen Owner
                  </span>
                </div>
                <p className="text-[11px] text-[#AAB3C5]">
                  Select which food items appear in "Popular Cravings" & schedule day-wise discount % for students.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Link
                to="/admin/homepage-manager"
                className="px-3.5 py-2 rounded-xl bg-[#1C263A] hover:bg-[#25334d] border border-purple-500/30 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>Full Admin Panel</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-black text-xs shadow-md shadow-purple-500/30 flex items-center gap-1.5 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Edit Cravings & Day Offers</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">
              <Flame className="w-4 h-4 text-purple-400 fill-purple-400" />
              Student Favorites
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {homepageConfig?.cravingsTitle || 'Popular Campus Cravings'}
            </h2>
            <p className="text-xs text-[#AAB3C5] mt-1">
              {homepageConfig?.cravingsSubtitle || 'Top rated and most ordered items across campus this week.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-300 hover:text-white bg-[#1C263A] border border-purple-500/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Edit Items</span>
              </button>
            )}
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-300 hover:text-white transition-colors group"
            >
              <span>View Complete Menu</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Popular Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {popularItems.map((food) => (
            <FoodCard
              key={food._id || food.id}
              food={food}
              onSelect={(item) => setSelectedFood(item)}
            />
          ))}
        </div>
      </section>

      {/* 4. SPECIAL OFFERS SECTION (DYNAMIC CANTEEN OWNER SCHEDULED OFFERS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#1C263A] via-[#151C30] to-[#1C263A] border-2 border-purple-500/30 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-br from-[#7955E8]/20 to-[#526DFF]/20 rounded-full blur-2xl"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-purple-500/30">
                  {todayDiscount.day} Campus Special &bull; {todayDiscount.percent}% OFF Active Today!
                </span>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-2.5 py-0.5 rounded-full bg-[#0B1020]/70 hover:bg-[#0B1020] text-purple-200 border border-purple-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Edit Discount %</span>
                  </button>
                )}
              </div>

              <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                {todayDiscount.title || `${todayDiscount.day} Special Saver: Flat ${todayDiscount.percent}% OFF!`}
              </h3>
              <p className="text-sm text-[#AAB3C5] max-w-xl">
                Canteen Owner Scheduled Offer: Use promo code{' '}
                <span className="font-mono font-extrabold bg-[#0B1020] border border-purple-500/40 px-2 py-0.5 rounded-lg text-purple-300">
                  {todayDiscount.promoCode || 'CAMPUSDAY'}
                </span>{' '}
                at checkout on orders above ₹{todayDiscount.minOrderValue || 99} for instant {todayDiscount.percent}% student savings!
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/menu"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-extrabold text-xs shadow-lg shadow-purple-500/30 transition-transform hover:scale-102"
                >
                  Order With {todayDiscount.percent}% OFF &rarr;
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <TiltCard maxTilt={10} className="w-full max-w-sm">
                <div className="relative p-6 bg-[#151C30]/95 backdrop-blur-md rounded-3xl border border-purple-500/40 text-center space-y-2 shadow-xl overflow-hidden">
                  <BorderBeam size={160} duration={4} colorFrom="#10B981" colorTo="#7955E8" />
                  <Award className="w-12 h-12 text-purple-300 mx-auto animate-bounce" />
                  <h4 className="text-base font-black text-white">Today's {todayDiscount.day} Special Saver</h4>
                  <p className="text-xs text-[#AAB3C5]">Burger + Peri Fries + Cold Coffee</p>
                  <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                    Only ₹{Math.round(210 * (1 - todayDiscount.percent / 100))}
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full inline-block">
                    Save {todayDiscount.percent}% Flat
                  </span>
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold text-purple-400 uppercase tracking-widest">
            Campus Dining Simplified
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight mt-1">
            How MITS Canteen Works
          </h2>
          <p className="text-xs text-[#AAB3C5] mt-2">
            Eliminating long queues in 4 effortless digital steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            {
              step: '01',
              title: 'Browse & Customize',
              tag: '📱 In-App Menu & Add to Tray',
              desc: 'Select from hot breakfast, lunch thalis, samosas, burgers, and shakes with pure veg dietary filters.',
              icon: UtensilsCrossed,
              image: '/assets/steps/step1-browse-customize.jpg',
              fallback: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
              badge: '100+ Campus Items',
              badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            },
            {
              step: '02',
              title: 'Select Pickup Time',
              tag: '⏰ Break Slot Scheduling',
              desc: 'Choose ASAP immediate prep (~8m) or schedule precisely for your upcoming college lecture break.',
              icon: Clock,
              image: '/assets/steps/step2-pickup-time.jpg',
              fallback: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
              badge: 'Zero Queue Wait',
              badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            },
            {
              step: '03',
              title: 'Get Unique Token',
              tag: '🎫 Contactless QR Pass',
              desc: 'Pay seamlessly via UPI or Cash at counter to instantly receive your digital Token # and scannable QR Pass.',
              icon: QrCode,
              image: '/assets/steps/step3-unique-token.jpg',
              fallback: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80',
              badge: 'Instant QR & Token',
              badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            },
            {
              step: '04',
              title: 'Collect at Counter',
              tag: '🍱 Fresh Food Handoff',
              desc: 'Watch the live TV screen or get automated WhatsApp alerts. Walk straight to the Counter when ready!',
              icon: CheckCircle2,
              image: '/assets/steps/step4-collect-counter.jpg',
              fallback: '/assets/campus/mits-main-canteen.jpg',
              badge: 'Express Counter Pickup',
              badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="relative bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-purple-500/25 shadow-xl hover:shadow-2xl hover:shadow-purple-900/30 hover:border-purple-500/40 transition-all duration-300 card-3d group flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Photo Container According to Step Role */}
                  <div className="relative h-44 sm:h-48 w-full rounded-2xl overflow-hidden bg-[#151C30] mb-4 shadow-inner">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                      onError={(e) => { e.target.src = card.fallback; }}
                    />
                    {/* Dark gradient & hover shine sweep */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C263A] via-[#1C263A]/20 to-black/30" />
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

                    {/* Step Number Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-[#0B1020]/90 backdrop-blur-md border border-purple-500/40 text-xs font-black font-mono text-purple-300 shadow-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                      STEP {card.step}
                    </div>

                    {/* Step Icon Badge */}
                    <div className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] text-white flex items-center justify-center shadow-lg group-hover:rotate-6 group-hover:scale-105 transition-all">
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Role Tag Pill */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg bg-[#0B1020]/90 backdrop-blur-md border border-white/10 text-[10px] font-bold text-slate-200">
                        {card.tag}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h4 className="font-extrabold text-base text-white group-hover:text-purple-300 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs text-[#AAB3C5] mt-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                {/* Bottom Feature Highlight Badge */}
                <div className="mt-5 pt-3.5 border-t border-purple-500/20 flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                  <span className="text-[11px] font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. STUDENT & FACULTY TESTIMONIALS */}
      <section className="bg-[#151C30]/50 py-16 border-y border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
              Campus Praise
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              What MITSians Are Saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Rohan Deshmukh',
                branch: 'B.Tech CSE - 3rd Year, MITS Gwalior',
                comment: 'The break is only 15 minutes. Before this system, 12 minutes was wasted standing in line. Now I pre-order from class and just collect my Masala Dosa!',
                rating: 5,
              },
              {
                name: 'Ananya Sen',
                branch: 'IT Department - 2nd Year, MITS Gwalior',
                comment: 'The live token screen in the canteen is super clear. You immediately know when the Counter calls your number and the WhatsApp alert tells you exact prep time. Game changer!',
                rating: 5,
              },
              {
                name: 'Prof. S. K. Nair',
                branch: 'Faculty of Engineering, MITS',
                comment: 'Faculty members can also pre-order tea and thali without squeezing into crowded student counters. The Counter makes pickup instantaneous.',
                rating: 5,
              },
            ].map((review, i) => (
              <div
                key={i}
                className="bg-[#1C263A]/85 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20 shadow-xl card-3d flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 mb-3">
                    {[...Array(review.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-[#AAB3C5] leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-purple-500/20">
                  <h4 className="text-xs font-black text-white">{review.name}</h4>
                  <p className="text-[10px] text-purple-300">{review.branch}</p>
                </div>
              </div>
            ))}
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

      {/* Canteen Owner Homepage Cravings & Daily Discount Editor Modal */}
      {isAdmin && (
        <HomepageCravingsModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Floating Interactive Campus Cheer & Confetti Magic FAB */}
      <CampusVibeFab />
    </div>
  );
};
