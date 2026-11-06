import React, { useState, useMemo } from 'react';
import { FoodCard } from '../../components/FoodCard';
import { FoodDetailModal } from '../../components/FoodDetailModal';
import { useData } from '../../context/DataContext';
import { useCart } from '../../context/CartContext';
import {
  Search,
  SlidersHorizontal,
  Flame,
  Clock,
  Sparkles,
  Leaf,
  Utensils,
  X,
  Star,
  CheckCircle2,
  Coffee,
  Sandwich
} from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Items', icon: Utensils },
  { id: 'Breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'Lunch', label: 'Lunch Meals', icon: Utensils },
  { id: 'Fast Food', label: 'Fast Food', icon: Flame },
  { id: 'Snacks', label: 'Snacks', icon: Sandwich },
  { id: 'Beverages', label: 'Beverages', icon: Coffee },
  { id: 'Combos', label: 'Combos', icon: Sparkles },
];

export const MenuPage = () => {
  const { menuItems, canteens } = useData();
  const { setIsCartOpen, totalItemCount, total } = useCart();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedFood, setSelectedFood] = useState(null);

  const activeCanteen = canteens[0] || { name: 'Main Campus Food Court', isOpen: true };

  // Filter & Sort logic
  const filteredFoods = useMemo(() => {
    let items = [...(menuItems || [])];

    // Category
    if (selectedCategory !== 'All') {
      items = items.filter((f) => f.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          (f.tags && f.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // 100% Pure Vegetarian Kitchen
    items = items.filter((f) => f.isVeg !== false);

    // Sort
    if (sortBy === 'price_asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'fastest') {
      items.sort((a, b) => a.preparationTime - b.preparationTime);
    } else if (sortBy === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: popular
      items.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    return items;
  }, [menuItems, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-white">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1C263A] via-[#151C30] to-[#1C263A] text-white p-6 sm:p-10 overflow-hidden shadow-2xl border border-purple-500/25">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7955E8]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#7955E8]/20 to-[#526DFF]/20 text-purple-300 border border-purple-500/30 text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Zero-Queue Campus Dining
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Explore Campus Menu & Order Ahead
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB3C5] leading-relaxed">
            Freshly prepared dishes from <strong className="text-purple-300">{activeCanteen.name}</strong>. Choose your favorite food, pick your delivery slot, and skip the physical queue!
          </p>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 border border-purple-500/20 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search burgers, dosas, thali, cold coffee, momos..."
              className="w-full pl-12 pr-10 py-3 rounded-2xl bg-[#151C30] border border-purple-500/30 text-sm font-medium text-white placeholder-slate-400 focus:outline-none focus:border-[#7955E8] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 100% Pure Veg Campus Kitchen Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-emerald-500/30 text-emerald-300 text-xs font-black shadow-xs shrink-0 select-none">
            <span className="w-4 h-4 rounded-xs border-2 border-emerald-500 flex items-center justify-center bg-[#0B1020] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </span>
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Pure Vegetarian Kitchen</span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/30 text-xs font-bold text-white focus:outline-none focus:border-[#7955E8]"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated (Stars)</option>
              <option value="fastest">Fastest Prep Time (~5m)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-purple-500/20">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
                    : 'bg-[#151C30] text-[#AAB3C5] hover:bg-[#25334d] hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-purple-300'}`} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Items Status & Counter */}
      <div className="flex items-center justify-between text-xs text-[#AAB3C5] px-1">
        <p>
          Showing <strong className="text-white">{filteredFoods.length}</strong> delicious items
          {selectedCategory !== 'All' && <span> in <strong className="text-purple-300">{selectedCategory}</strong></span>}
          {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
        </p>

        <span className="flex items-center gap-1.5 font-bold text-emerald-300 bg-[#151C30] px-3 py-1 rounded-full border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Kitchen Live & Accepting Pre-Orders
        </span>
      </div>

      {/* 4. Food Cards Grid */}
      {filteredFoods.length === 0 ? (
        <div className="py-20 text-center bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#151C30] text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-white">No Food Items Match Your Filters</h3>
          <p className="text-xs text-[#AAB3C5] max-w-sm mx-auto">
            Try clearing the search query or changing the category filter to see available options.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md shadow-purple-500/25"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredFoods.map((food) => (
            <FoodCard
              key={food._id || food.id}
              food={food}
              onSelect={(item) => setSelectedFood(item)}
            />
          ))}
        </div>
      )}

      {/* 5. Food Detail Modal */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}

      {/* 6. Sticky Floating Mobile Cart CTA Bar (Appears when items are in cart) */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden animate-slideUp">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white font-extrabold text-sm flex items-center justify-between shadow-2xl shadow-purple-950/80 border border-white/20 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-white text-[#7955E8] flex items-center justify-center text-xs font-black shadow-xs">
                {totalItemCount}
              </span>
              <span className="tracking-wide">View Campus Tray</span>
            </div>
            <div className="flex items-center gap-1.5 font-black text-white">
              <span>₹{total}</span>
              <span className="text-base">&rarr;</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
