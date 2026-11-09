import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Flame,
  Calendar,
  Percent,
  Check,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  UtensilsCrossed,
  Tag,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const HomepageManagerPage = () => {
  const { menuItems, homepageConfig, updateHomepageConfig, getTodayDiscount } = useData();
  const todayDiscount = getTodayDiscount ? getTodayDiscount() : { day: 'Today', percent: 15, title: 'Campus Special Offer' };

  const [activeTab, setActiveTab] = useState('cravings');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [cravingsTitle, setCravingsTitle] = useState(homepageConfig?.cravingsTitle || 'Popular Campus Cravings');
  const [cravingsSubtitle, setCravingsSubtitle] = useState(
    homepageConfig?.cravingsSubtitle || 'Top rated and most ordered items across campus this week.'
  );
  const [selectedIds, setSelectedIds] = useState(
    Array.isArray(homepageConfig?.featuredCravingsIds) ? homepageConfig.featuredCravingsIds : []
  );

  const lastSavedVersionRef = React.useRef(Number(homepageConfig?.configVersion || homepageConfig?.updatedAt || 0));

  React.useEffect(() => {
    if (homepageConfig) {
      const incomingVer = Number(homepageConfig.configVersion || homepageConfig.updatedAt || 0);
      if (incomingVer >= lastSavedVersionRef.current) {
        lastSavedVersionRef.current = incomingVer;
        if (homepageConfig.cravingsTitle) setCravingsTitle(homepageConfig.cravingsTitle);
        if (homepageConfig.cravingsSubtitle) setCravingsSubtitle(homepageConfig.cravingsSubtitle);
        if (Array.isArray(homepageConfig.featuredCravingsIds)) setSelectedIds(homepageConfig.featuredCravingsIds);
        if (homepageConfig.dailyDiscounts) setDailyDiscounts(homepageConfig.dailyDiscounts);
        if (homepageConfig.specialOfferBanner) setBannerConfig(homepageConfig.specialOfferBanner);
      }
    }
  }, [homepageConfig]);

  const [dailyDiscounts, setDailyDiscounts] = useState(
    homepageConfig?.dailyDiscounts || {
      Monday: { percent: 10, title: 'Monday Kickstart', active: true },
      Tuesday: { percent: 15, title: 'Tasty Tuesday Feast', active: true },
      Wednesday: { percent: 10, title: 'Mid-Week Hunger Buster', active: true },
      Thursday: { percent: 20, title: 'Thursday Campus Special', active: true },
      Friday: { percent: 15, title: 'Friday Weekend Prep', active: true },
      Saturday: { percent: 25, title: 'Super Saturday Mega Saver', active: true },
      Sunday: { percent: 20, title: 'Sunday Campus Brunch', active: true },
    }
  );

  const [bannerConfig, setBannerConfig] = useState(
    homepageConfig?.specialOfferBanner || {
      badge: 'Campus Exclusive Daily Offers',
      heading: 'Get Flat Day Discount On Campus Cravings!',
      subtitle: 'Canteen owner daily offer active! Use promo code below for instant savings at checkout.',
      promoCode: 'CAMPUSDAY',
      minOrderValue: 99,
    }
  );

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggleFoodItem = (foodId) => {
    setSelectedIds((prev) => {
      if (prev.includes(foodId)) {
        return prev.filter((id) => id !== foodId);
      } else {
        return [...prev, foodId];
      }
    });
  };

  const handleAutoSelectTop = () => {
    const topFour = [...(menuItems || [])]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4)
      .map((item) => item._id || item.id);
    setSelectedIds(topFour);
  };

  const handleDayDiscountChange = (day, field, value) => {
    setDailyDiscounts((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || { percent: 10, title: '', active: true }),
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    const now = Date.now();
    lastSavedVersionRef.current = now;
    updateHomepageConfig({
      cravingsTitle,
      cravingsSubtitle,
      featuredCravingsIds: selectedIds,
      dailyDiscounts,
      specialOfferBanner: bannerConfig,
      configVersion: now,
      updatedAt: now,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const categories = ['all', ...new Set((menuItems || []).map((m) => m.category).filter(Boolean))];

  const filteredFood = (menuItems || []).filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl text-white">
      {/* 1. Header & Live Homepage Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <SlidersHorizontal className="w-6 h-6 text-purple-400" />
              Homepage Cravings & Day Offers Manager
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
            Canteen Owner Controls: Select which dishes appear on the student landing page and set day-wise percentage discounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            to="/"
            target="_blank"
            className="px-4 py-2.5 rounded-2xl bg-[#151C30] hover:bg-[#25334d] text-purple-300 border border-purple-500/30 text-xs font-black flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Preview Live Homepage</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white text-xs font-black shadow-lg shadow-purple-500/30 flex items-center gap-1.5 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Homepage Cravings & Day Offers Saved Successfully! Live website updated.</span>
        </div>
      )}

      {/* 2. Tab Navigation */}
      <div className="grid grid-cols-2 p-1.5 rounded-3xl bg-[#1C263A]/90 border border-purple-500/20 shadow-xl gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('cravings')}
          className={`py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'cravings'
              ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
              : 'text-[#AAB3C5] hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4 text-purple-300" />
          <span>Popular Campus Cravings ({selectedIds.length} Dishes Selected)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('discounts')}
          className={`py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'discounts'
              ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
              : 'text-[#AAB3C5] hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-purple-300" />
          <span>Day-wise Discount Scheduler ({todayDiscount.day}: {todayDiscount.percent}% OFF)</span>
        </button>
      </div>

      {/* Tab 1: Cravings Dishes Manager */}
      {activeTab === 'cravings' && (
        <div className="space-y-6">
          {/* Section Heading & Subtitle Customizer */}
          <div className="p-5 rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Customize Homepage Section Heading
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#AAB3C5] font-bold block mb-1">
                  Section Main Heading:
                </label>
                <input
                  type="text"
                  value={cravingsTitle}
                  onChange={(e) => setCravingsTitle(e.target.value)}
                  placeholder="Popular Campus Cravings"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/30 text-xs font-bold text-white focus:outline-none focus:border-[#7955E8]"
                />
              </div>
              <div>
                <label className="text-xs text-[#AAB3C5] font-bold block mb-1">
                  Section Subtitle:
                </label>
                <input
                  type="text"
                  value={cravingsSubtitle}
                  onChange={(e) => setCravingsSubtitle(e.target.value)}
                  placeholder="Top rated and most ordered items across campus this week."
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/30 text-xs text-white focus:outline-none focus:border-[#7955E8]"
                />
              </div>
            </div>
          </div>

          {/* Quick Filter & Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1C263A]/85 backdrop-blur-xl p-4 rounded-3xl border border-purple-500/20 shadow-xl">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search menu items..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#151C30] border border-purple-500/30 text-xs font-semibold text-white placeholder-slate-400 focus:outline-none focus:border-[#7955E8]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleAutoSelectTop}
                className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-xs font-bold text-purple-200 transition-all cursor-pointer"
              >
                ⚡ Auto Select Top 4 Rated
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-3.5 py-2 rounded-xl bg-[#151C30] hover:bg-[#25334d] text-xs font-bold text-[#AAB3C5] transition-all cursor-pointer border border-purple-500/20"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-xs'
                    : 'bg-[#151C30] text-[#AAB3C5] hover:text-white border border-purple-500/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Food Items Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFood.map((food) => {
              const foodId = food._id || food.id;
              const isSelected = selectedIds.includes(foodId);

              return (
                <div
                  key={foodId}
                  onClick={() => handleToggleFoodItem(foodId)}
                  className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                    isSelected
                      ? 'bg-purple-500/15 border-[#7955E8] shadow-lg shadow-purple-500/20'
                      : 'bg-[#1C263A]/85 border-purple-500/20 hover:border-purple-500/40'
                  }`}
                >
                  <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-[#151C30] mb-3">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                      }}
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[#0B1020]/90 px-2 py-0.5 rounded-full text-white">
                        {food.category}
                      </span>
                    </div>

                    <div
                      className={`absolute top-2 right-2 w-7 h-7 rounded-xl flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] border-transparent text-white shadow-md'
                          : 'border-slate-500 bg-[#0B1020]/80 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-white truncate">{food.name}</h4>
                    <p className="text-xs text-[#AAB3C5] line-clamp-1 mt-0.5">{food.description}</p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-purple-500/20">
                      <span className="font-black text-base text-purple-300">₹{food.price}</span>
                      <span className="text-xs font-bold text-amber-300">★ {food.rating || 4.8}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Day-wise Percentage Discount Scheduler */}
      {activeTab === 'discounts' && (
        <div className="space-y-6">
          {/* Promo code & Minimum order setting */}
          <div className="p-6 rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              Promo Code & Student Checkout Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#AAB3C5] font-bold block mb-1">
                  Active Promo Code for Students:
                </label>
                <input
                  type="text"
                  value={bannerConfig.promoCode || 'CAMPUSDAY'}
                  onChange={(e) =>
                    setBannerConfig({ ...bannerConfig, promoCode: e.target.value.toUpperCase().replace(/\s/g, '') })
                  }
                  placeholder="CAMPUSDAY"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/30 text-xs font-mono font-bold text-purple-300 focus:outline-none focus:border-[#7955E8] uppercase"
                />
                <p className="text-[11px] text-[#AAB3C5] mt-1">
                  Students will enter this promo code during checkout tray to get today's percentage savings.
                </p>
              </div>

              <div>
                <label className="text-xs text-[#AAB3C5] font-bold block mb-1">
                  Minimum Order Value (₹):
                </label>
                <input
                  type="number"
                  min={0}
                  value={bannerConfig.minOrderValue || 99}
                  onChange={(e) =>
                    setBannerConfig({ ...bannerConfig, minOrderValue: Number(e.target.value) || 0 })
                  }
                  placeholder="99"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/30 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#7955E8]"
                />
                <p className="text-[11px] text-[#AAB3C5] mt-1">
                  Discount will only trigger if tray total is greater than or equal to this amount.
                </p>
              </div>
            </div>
          </div>

          {/* Day-Wise Percentage Grid */}
          <div className="p-6 rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-purple-400" />
                Schedule Day-wise Percentage OFF (Monday – Sunday)
              </h3>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Today is {todayDiscount.day} ({todayDiscount.percent}% OFF Active)
              </span>
            </div>

            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day) => {
                const conf = dailyDiscounts[day] || { percent: 10, title: '', active: true };
                const isCurrentDay = todayDiscount.day === day;

                return (
                  <div
                    key={day}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrentDay
                        ? 'bg-purple-500/15 border-purple-500 shadow-md'
                        : 'bg-[#151C30]/70 border-purple-500/20 hover:bg-[#151C30]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Day Name */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={conf.active !== false}
                          onChange={(e) => handleDayDiscountChange(day, 'active', e.target.checked)}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer accent-[#7955E8]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">{day}</span>
                            {isCurrentDay && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-xs">
                                Live Today
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#AAB3C5]">
                            {conf.active !== false ? `Active Offer: ${conf.percent}% OFF` : 'Disabled for this day'}
                          </span>
                        </div>
                      </div>

                      {/* Offer Title & Percentage Chips */}
                      <div className="flex flex-wrap items-center gap-3 flex-1 sm:justify-end">
                        <input
                          type="text"
                          value={conf.title || ''}
                          onChange={(e) => handleDayDiscountChange(day, 'title', e.target.value)}
                          placeholder={`${day} Special Title`}
                          className="px-3.5 py-2 rounded-xl bg-[#0B1020] border border-purple-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7955E8] w-full sm:w-60"
                        />

                        {/* Quick Chips */}
                        <div className="flex items-center gap-1.5">
                          {[10, 15, 20, 25, 30].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => handleDayDiscountChange(day, 'percent', pct)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                conf.percent === pct
                                  ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-xs'
                                  : 'bg-[#0B1020] hover:bg-[#151C30] text-[#AAB3C5]'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>

                        {/* Custom Percentage Input */}
                        <div className="flex items-center gap-1 bg-[#0B1020] border border-purple-500/30 rounded-xl px-2.5 py-1.5">
                          <input
                            type="number"
                            min={0}
                            max={60}
                            value={conf.percent}
                            onChange={(e) =>
                              handleDayDiscountChange(day, 'percent', Math.max(0, Math.min(60, Number(e.target.value) || 0)))
                            }
                            className="w-12 bg-transparent text-xs font-mono font-black text-purple-300 text-center focus:outline-none"
                          />
                          <span className="text-xs text-[#AAB3C5] font-bold">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomepageManagerPage;
