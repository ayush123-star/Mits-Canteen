import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  X,
  Flame,
  Calendar,
  Percent,
  Sparkles,
  Check,
  Search,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  Tag,
  Clock,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed,
  Layers
} from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const HomepageCravingsModal = ({ isOpen, onClose }) => {
  const { menuItems, homepageConfig, updateHomepageConfig, getTodayDiscount } = useData();
  const todayDiscount = getTodayDiscount ? getTodayDiscount() : { day: 'Today', percent: 15, title: 'Campus Special Offer' };

  const [activeTab, setActiveTab] = useState('cravings');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [cravingsTitle, setCravingsTitle] = useState(homepageConfig?.cravingsTitle || 'Popular Campus Cravings');
  const [cravingsSubtitle, setCravingsSubtitle] = useState(
    homepageConfig?.cravingsSubtitle || 'Top rated and most ordered items across campus this week.'
  );
  const [selectedIds, setSelectedIds] = useState(homepageConfig?.featuredCravingsIds || []);

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

  if (!isOpen) return null;

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
    updateHomepageConfig({
      cravingsTitle,
      cravingsSubtitle,
      featuredCravingsIds: selectedIds,
      dailyDiscounts,
      specialOfferBanner: bannerConfig,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto text-white">
      <div className="relative w-full max-w-4xl bg-[#1C263A] border-2 border-purple-500/40 rounded-3xl p-5 sm:p-7 text-white shadow-2xl space-y-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7955E8] to-[#526DFF] text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/30">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Canteen Owner: Homepage & Offers Editor
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Owner Portal
                </span>
              </div>
              <p className="text-xs text-[#AAB3C5]">
                Control which food items appear in "Popular Cravings" & schedule day-wise discount percentages.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#151C30] hover:bg-[#25334d] text-[#AAB3C5] hover:text-white transition-colors cursor-pointer border border-purple-500/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#151C30] border border-purple-500/20 shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('cravings')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'cravings'
                ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
                : 'text-[#AAB3C5] hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Popular Cravings Dishes ({selectedIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discounts')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'discounts'
                ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
                : 'text-[#AAB3C5] hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Day-wise Discount % ({todayDiscount.day}: {todayDiscount.percent}%)</span>
          </button>
        </div>

        {/* Tab 1: Popular Campus Cravings Dishes Selector */}
        {activeTab === 'cravings' && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-thin">
            {/* Title & Subtitle Customizer */}
            <div className="p-4 rounded-2xl bg-[#151C30] border border-purple-500/20 space-y-3">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                Section Heading & Text
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#AAB3C5] font-bold block mb-1">
                    Section Heading:
                  </label>
                  <input
                    type="text"
                    value={cravingsTitle}
                    onChange={(e) => setCravingsTitle(e.target.value)}
                    placeholder="Popular Campus Cravings"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B1020] border border-purple-500/30 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#AAB3C5] font-bold block mb-1">
                    Section Subtitle:
                  </label>
                  <input
                    type="text"
                    value={cravingsSubtitle}
                    onChange={(e) => setCravingsSubtitle(e.target.value)}
                    placeholder="Top rated and most ordered items across campus this week."
                    className="w-full px-3 py-2 rounded-xl bg-[#0B1020] border border-purple-500/30 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search dishes (Samosa, Burger...)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#151C30] border border-purple-500/30 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleAutoSelectTop}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-[11px] font-bold text-purple-200 transition-all cursor-pointer"
                >
                  ⚡ Auto Top 4 Rated
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 rounded-xl bg-[#151C30] hover:bg-[#25334d] text-[11px] font-bold text-[#AAB3C5] transition-all cursor-pointer border border-purple-500/20"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-xs'
                      : 'bg-[#151C30] text-[#AAB3C5] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Food Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredFood.map((food) => {
                const foodId = food._id || food.id;
                const isSelected = selectedIds.includes(foodId);

                return (
                  <div
                    key={foodId}
                    onClick={() => handleToggleFoodItem(foodId)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 relative select-none ${
                      isSelected
                        ? 'bg-purple-500/20 border-[#7955E8] shadow-md shadow-purple-500/20'
                        : 'bg-[#151C30]/80 border-purple-500/20 hover:bg-[#151C30] hover:border-purple-500/40'
                    }`}
                  >
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-purple-500/20"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120';
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-400" title="Pure Veg" />
                        <h4 className="text-xs font-black text-white truncate">{food.name}</h4>
                      </div>
                      <p className="text-[10px] text-[#AAB3C5] capitalize">{food.category}</p>
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className="font-extrabold text-purple-300">₹{food.price}</span>
                        <span className="text-[10px] font-bold text-amber-300">★ {food.rating || 4.8}</span>
                      </div>
                    </div>

                    {/* Checkbox indicator */}
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] border-transparent text-white'
                          : 'border-slate-600 bg-[#0B1020] text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Day-wise Percentage Discount Scheduler */}
        {activeTab === 'discounts' && (
          <div className="space-y-5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
            {/* Promo Code & Min Order Setting */}
            <div className="p-4 rounded-2xl bg-[#151C30] border border-purple-500/20 space-y-3">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                Promo Code & Checkout Settings
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#AAB3C5] font-bold block mb-1">
                    Promo Code for Students:
                  </label>
                  <input
                    type="text"
                    value={bannerConfig.promoCode || 'CAMPUSDAY'}
                    onChange={(e) =>
                      setBannerConfig({ ...bannerConfig, promoCode: e.target.value.toUpperCase().replace(/\s/g, '') })
                    }
                    placeholder="CAMPUSDAY"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B1020] border border-purple-500/30 text-xs font-mono font-bold text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                  />
                  <p className="text-[10px] text-[#AAB3C5] mt-1">
                    Student checkout par yeh code daalkar discount paayenge.
                  </p>
                </div>
                <div>
                  <label className="text-[11px] text-[#AAB3C5] font-bold block mb-1">
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
                    className="w-full px-3 py-2 rounded-xl bg-[#0B1020] border border-purple-500/30 text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[10px] text-[#AAB3C5] mt-1">
                    Itne amount se upar ke orders par he offer apply hoga.
                  </p>
                </div>
              </div>
            </div>

            {/* 7 Days of the Week Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-purple-400" />
                  Schedule Discount % for Each Day (Monday – Sunday)
                </span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Today is {todayDiscount.day}
                </span>
              </div>

              <div className="space-y-2.5">
                {DAYS_OF_WEEK.map((day) => {
                  const conf = dailyDiscounts[day] || { percent: 10, title: '', active: true };
                  const isCurrentDay = todayDiscount.day === day;

                  return (
                    <div
                      key={day}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCurrentDay
                          ? 'bg-purple-500/15 border-purple-500 shadow-md'
                          : 'bg-[#151C30]/70 border-purple-500/20 hover:bg-[#151C30]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Day Name & Badge */}
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
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-xs">
                                  Active Today
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#AAB3C5]">
                              {conf.active !== false ? `${conf.percent}% Discount On` : 'Disabled'}
                            </span>
                          </div>
                        </div>

                        {/* Title and Percentage input */}
                        <div className="flex flex-wrap items-center gap-3 flex-1 sm:justify-end">
                          <input
                            type="text"
                            value={conf.title || ''}
                            onChange={(e) => handleDayDiscountChange(day, 'title', e.target.value)}
                            placeholder={`${day} Special Offer Title`}
                            className="px-3 py-1.5 rounded-xl bg-[#0B1020] border border-purple-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-56"
                          />

                          {/* Quick Percentage Selector Chips */}
                          <div className="flex items-center gap-1">
                            {[10, 15, 20, 25].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => handleDayDiscountChange(day, 'percent', pct)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                  conf.percent === pct
                                    ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-xs'
                                    : 'bg-[#0B1020] hover:bg-[#151C30] text-[#AAB3C5]'
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>

                          {/* Custom Number Input */}
                          <div className="flex items-center gap-1 bg-[#0B1020] border border-purple-500/30 rounded-xl px-2 py-1">
                            <input
                              type="number"
                              min={0}
                              max={60}
                              value={conf.percent}
                              onChange={(e) =>
                                handleDayDiscountChange(day, 'percent', Math.max(0, Math.min(60, Number(e.target.value) || 0)))
                              }
                              className="w-10 bg-transparent text-xs font-mono font-black text-purple-300 text-center focus:outline-none"
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

        {/* Success Alert Banner */}
        {saveSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Homepage Cravings & Day-wise Discounts Updated Successfully!</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between shrink-0">
          <div className="text-xs text-[#AAB3C5] hidden sm:block">
            Changes will immediately reflect on the Homepage for all students.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-[#151C30] hover:bg-[#25334d] text-white font-bold text-xs transition-colors cursor-pointer border border-purple-500/20"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-black text-xs shadow-lg shadow-purple-500/30 flex items-center gap-1.5 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save & Apply to Homepage</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
