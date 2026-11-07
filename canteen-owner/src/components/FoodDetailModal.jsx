import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Clock, Flame, ShieldAlert, Plus, Minus, Check, MessageSquare } from 'lucide-react';

export const FoodDetailModal = ({ food, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  if (!food) return null;

  const handleAdd = () => {
    addToCart(food, quantity, note);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[#1C263A] rounded-3xl overflow-hidden shadow-2xl border border-purple-500/30 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#0B1020]/70 hover:bg-[#0B1020] text-white flex items-center justify-center backdrop-blur-md border border-purple-500/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Image */}
        <div className="relative h-64 w-full bg-[#151C30]">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C263A] via-transparent to-black/40"></div>

          {/* Badges on image */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center border-2 border-emerald-500 bg-[#0B1020] shadow-sm"
                title="100% Pure Vegetarian"
              >
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-emerald-600/90 border border-emerald-400/30 text-white px-2.5 py-1 rounded-full">
                Pure Veg
              </span>
              <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#7955E8] to-[#526DFF] px-2.5 py-1 rounded-full shadow-md shadow-purple-500/30">
                {food.category}
              </span>
            </div>
            <span className="text-xs font-semibold bg-[#0B1020]/80 px-3 py-1 rounded-full border border-purple-500/20 text-[#AAB3C5]">
              Pickup at Counter {food.counter || 1}
            </span>
          </div>
        </div>

        {/* Details Body */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {food.name}
              </h2>
              <div className="flex items-center gap-4 text-xs font-semibold text-[#AAB3C5] mt-2">
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
            <div className="text-right">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">₹{food.price}</span>
              <p className="text-[10px] text-[#AAB3C5] font-medium">Inclusive of all taxes</p>
            </div>
          </div>

          <p className="text-xs text-[#AAB3C5] leading-relaxed mt-4">
            {food.description}
          </p>

          {/* Special Instructions Input */}
          <div className="mt-5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              Special Preparation Request (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Less spicy, no onions, extra ice, etc."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#151C30] border border-purple-500/25 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-[#7955E8]"
            />
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-4 border-t border-purple-500/20 flex items-center justify-between gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3 bg-[#151C30] rounded-2xl p-1.5 border border-purple-500/30">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-xl bg-[#1C263A] text-purple-300 hover:bg-[#7955E8] hover:text-white flex items-center justify-center font-bold transition-colors shadow-xs"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-black text-white w-6 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-xl bg-[#1C263A] text-purple-300 hover:bg-[#7955E8] hover:text-white flex items-center justify-center font-bold transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAdd}
              disabled={!food.isAvailable}
              className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
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
                <>Add to Cart • ₹{food.price * quantity}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
