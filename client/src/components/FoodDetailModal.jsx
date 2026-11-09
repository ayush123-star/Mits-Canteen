import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
  X,
  Clock,
  Flame,
  Plus,
  Minus,
  Check,
  MessageSquare,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const FoodDetailModal = ({ food, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [onionPref, setOnionPref] = useState('with-onion'); // 'with-onion' | 'no-onion'
  const [spiceLevel, setSpiceLevel] = useState('Medium'); // 'Mild' | 'Medium' | 'Spicy'
  const [selectedTags, setSelectedTags] = useState([]);
  const [note, setNote] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  if (!food) return null;

  const quickTags = ['Extra Crispy', 'Less Oil', 'Separate Chutney', 'No Mayo', 'Pack Hot'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAdd = () => {
    // Compile clean, human-readable instructions
    const parts = [];
    if (onionPref === 'no-onion') {
      parts.push('🚫 No Onion & Garlic (Jain)');
    } else {
      parts.push('🧅 With Onion');
    }

    if (spiceLevel === 'Mild') {
      parts.push('🟢 Mild (Kam Teekha)');
    } else if (spiceLevel === 'Spicy') {
      parts.push('🔥 Extra Spicy');
    } else {
      parts.push('🟡 Medium Spice');
    }

    if (selectedTags.length > 0) {
      parts.push(selectedTags.join(', '));
    }

    if (note.trim()) {
      parts.push(note.trim());
    }

    const fullInstructions = parts.join(' • ');
    addToCart(food, quantity, fullInstructions);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[#151C30] rounded-3xl overflow-hidden shadow-2xl border border-purple-500/30 text-white max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#0B1020]/80 hover:bg-[#0B1020] text-white flex items-center justify-center backdrop-blur-md border border-purple-500/30 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {/* Modal Image */}
          <div className="relative h-56 sm:h-64 w-full bg-[#0B1020] shrink-0">
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151C30] via-transparent to-black/40"></div>

            {/* Badges on image */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center border-2 border-emerald-500 bg-[#0B1020] shadow-sm"
                  title="100% Pure Vegetarian"
                >
                  <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-emerald-600/90 border border-emerald-400/30 text-white px-2.5 py-0.5 rounded-full">
                  Pure Veg
                </span>
                <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#7955E8] to-[#526DFF] px-2.5 py-0.5 rounded-full shadow-md">
                  {food.category}
                </span>
              </div>
              <span className="text-xs font-semibold bg-[#0B1020]/90 px-3 py-1 rounded-full border border-purple-500/20 text-slate-300">
                Counter {food.counter || 1}
              </span>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {food.name}
                </h2>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-purple-400" />
                    {food.preparationTime} mins preparation
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-purple-400" />
                    {food.calories} Calories
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  ₹{food.price}
                </span>
                <p className="text-[10px] text-slate-400 font-medium">Incl. all taxes</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {food.description}
            </p>

            {/* 1. ONION & GARLIC CUSTOMIZATION */}
            <div className="p-3.5 rounded-2xl bg-[#0E1424] border border-purple-500/25 space-y-2">
              <span className="text-xs font-bold text-white block">
                Onion & Garlic Preference:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOnionPref('with-onion')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    onionPref === 'with-onion'
                      ? 'bg-purple-500/20 border-purple-400 text-white shadow-xs'
                      : 'bg-[#151C30] border-purple-500/20 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🧅 With Onion & Garlic</span>
                  {onionPref === 'with-onion' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setOnionPref('no-onion')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    onionPref === 'no-onion'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-xs'
                      : 'bg-[#151C30] border-purple-500/20 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🚫 No Onion / Jain</span>
                  {onionPref === 'no-onion' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>
            </div>

            {/* 2. SPICE LEVEL SELECTION */}
            <div className="p-3.5 rounded-2xl bg-[#0E1424] border border-purple-500/25 space-y-2">
              <span className="text-xs font-bold text-white block">
                Spice Level:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Mild', label: '🟢 Mild (Kam Teekha)' },
                  { id: 'Medium', label: '🟡 Medium' },
                  { id: 'Spicy', label: '🔴 Spicy 🔥' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSpiceLevel(s.id)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border text-center cursor-pointer ${
                      spiceLevel === s.id
                        ? 'bg-purple-500/25 border-purple-400 text-white shadow-xs'
                        : 'bg-[#151C30] border-purple-500/20 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. QUICK CHEF REQUESTS */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                Quick Preparation Tags (Optional):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] border-purple-400 text-white'
                          : 'bg-[#0E1424] border-purple-500/20 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tag} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. CUSTOM INSTRUCTION INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                Additional Kitchen Note (Optional):
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Extra mint chutney, less oil, pack separately..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1424] border border-purple-500/25 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:p-5 border-t border-purple-500/20 bg-[#0E1424] flex items-center justify-between gap-4 shrink-0">
          {/* Quantity Selector */}
          <div className="flex items-center gap-3 bg-[#151C30] rounded-2xl p-1.5 border border-purple-500/30">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-xl bg-[#1C263A] text-purple-300 hover:bg-[#7955E8] hover:text-white flex items-center justify-center font-bold transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-black text-white w-6 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xl bg-[#1C263A] text-purple-300 hover:bg-[#7955E8] hover:text-white flex items-center justify-center font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            disabled={!food.isAvailable}
            className={`flex-1 py-3 px-6 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              isAdded
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white shadow-purple-500/30'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" /> Added to Tray
              </>
            ) : (
              <>Add to Tray • ₹{food.price * quantity}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
