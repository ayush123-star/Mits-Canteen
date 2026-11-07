import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Clock, Flame, Heart, Plus, Minus, Star, AlertCircle } from 'lucide-react';

export const FoodCard = ({ food, onSelect }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { user, toggleFavorite } = useAuth();

  const foodId = food._id || food.id;
  const cartEntry = cartItems.find((item) => (item.food._id || item.food.id) === foodId);
  const quantityInCart = cartEntry ? cartEntry.quantity : 0;
  const isFav = user?.favorites?.some((fav) => (fav._id || fav.id || fav) === foodId);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to save items to your favorites.');
      return;
    }
    if (toggleFavorite) {
      await toggleFavorite(foodId);
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(food)}
      className="group relative bg-[#1C263A]/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden border border-purple-500/20 shadow-xl hover:shadow-2xl hover:shadow-purple-900/30 hover:border-purple-500/40 transition-all duration-300 flex flex-col cursor-pointer card-3d"
    >
      {/* Image Container - Responsive Height */}
      <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-[#151C30]">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay & Glass Sweep Shine */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C263A] via-transparent to-black/40"></div>
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

        {/* Dietary Pure Veg Badge */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center gap-1.5">
          <span
            className="w-5 h-5 rounded-md flex items-center justify-center border-2 border-emerald-500 bg-[#0B1020]/90 backdrop-blur-sm shadow-sm"
            title="100% Pure Vegetarian"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </span>

          {food.tags && food.tags[0] && (
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-wide uppercase bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30">
              {food.tags[0]}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
            isFav
              ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
              : 'bg-black/40 text-white hover:bg-black/60'
          }`}
          title="Save to favorites"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? 'fill-white' : ''}`} />
        </button>

        {/* Counter & Prep Time Pill */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-between text-[10px] sm:text-[11px] text-white font-semibold">
          <span className="flex items-center gap-1 bg-[#0B1020]/80 backdrop-blur-md px-2 py-0.5 sm:py-1 rounded-lg border border-purple-500/20 text-purple-200">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" />
            {food.preparationTime} mins
          </span>

          <span className="bg-[#0B1020]/80 backdrop-blur-md px-2 py-0.5 sm:py-1 rounded-lg border border-white/10 text-slate-200">
            Counter {food.counter || 1}
          </span>
        </div>

        {/* Out of Stock Overlay */}
        {!food.isAvailable && (
          <div className="absolute inset-0 bg-[#0B1020]/90 backdrop-blur-xs flex flex-col items-center justify-center text-white z-10">
            <AlertCircle className="w-8 h-8 text-red-400 mb-1 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider bg-red-600 px-3 py-1 rounded-full shadow-md">
              Sold Out
            </span>
            <span className="text-[11px] text-[#AAB3C5] mt-1">Available in next batch</span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-purple-300 uppercase tracking-wider">
              {food.category}
            </span>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-200">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400" />
              <span>{food.rating || 4.8}</span>
              <span className="text-[9px] sm:text-[10px] text-[#AAB3C5]">({food.reviewCount || 42})</span>
            </div>
          </div>

          <h3 className="font-extrabold text-sm sm:text-base text-white leading-snug group-hover:text-purple-300 transition-colors line-clamp-1">
            {food.name}
          </h3>

          <p className="text-[11px] sm:text-xs text-[#AAB3C5] line-clamp-2 mt-1 sm:mt-1.5 leading-relaxed">
            {food.description}
          </p>
        </div>

        {/* Footer info: Calories + Price & Add Button */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-purple-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#AAB3C5] font-medium flex items-center gap-1">
              <Flame className="w-3 h-3 text-purple-400" />
              {food.calories} kcal
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-white">₹{food.price}</span>
            </div>
          </div>

          {/* Action Button */}
          {food.isAvailable ? (
            quantityInCart > 0 ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 bg-[#151C30] border border-purple-500/30 rounded-2xl p-1 shadow-sm"
              >
                <button
                  onClick={() => updateQuantity(foodId, quantityInCart - 1)}
                  className="w-7 h-7 rounded-xl bg-[#1C263A] text-purple-300 hover:bg-[#7955E8] hover:text-white flex items-center justify-center font-bold transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-black text-white px-1">
                  {quantityInCart}
                </span>
                <button
                  onClick={() => updateQuantity(foodId, quantityInCart + 1)}
                  className="w-7 h-7 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white hover:opacity-90 flex items-center justify-center font-bold transition-colors shadow-sm shadow-purple-500/40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(food, 1);
                }}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white text-xs font-black transition-all shadow-md shadow-purple-500/30 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            )
          ) : (
            <span className="text-xs text-[#AAB3C5] font-semibold italic">Unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
};
