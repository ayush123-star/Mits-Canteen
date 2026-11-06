import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const CartDrawer = ({ onCheckoutClick }) => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    total,
    couponCode,
    couponError,
    applyCoupon,
    removeCoupon,
    pickupOption,
    setPickupOption,
    scheduledTime,
    setScheduledTime,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const ok = applyCoupon(inputCoupon);
    if (ok) {
      setCouponSuccessMsg(`Code applied successfully! Saved ₹${discountAmount}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fadeIn"
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#151C30] border-l border-purple-500/30 text-white shadow-2xl flex flex-col justify-between animate-slideLeft">
          
          {/* Header */}
          <div className="p-5 border-b border-purple-500/20 flex items-center justify-between bg-[#0B1020]/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Your Campus Tray</h3>
                <p className="text-xs text-[#AAB3C5]">{cartItems.length} unique item(s)</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-[#AAB3C5] hover:text-red-400 font-medium transition-colors"
                  title="Clear Tray"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#1C263A] text-[#AAB3C5] hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {cartItems.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#1C263A] text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
                  <ShoppingBag className="w-10 h-10 opacity-70" />
                </div>
                <h4 className="font-bold text-lg text-white">Your Tray is Empty</h4>
                <p className="text-xs text-[#AAB3C5] max-w-xs mx-auto">
                  Hungry? Explore delicious campus snacks, hot meals, burgers and refreshing cold beverages!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white text-xs font-bold transition-all shadow-md shadow-purple-500/30"
                >
                  Explore Food Menu
                </button>
              </div>
            ) : (
              <>
                {/* Item List */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.food._id || item.food.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#1C263A]/90 border border-purple-500/20 shadow-sm"
                    >
                      <img
                        src={item.food.image}
                        alt={item.food.name}
                        className="w-14 h-14 rounded-xl object-cover bg-[#0B1020] shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-xs flex items-center justify-center border border-emerald-500 bg-[#0B1020]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          </span>
                          <h4 className="text-xs font-bold text-white truncate">
                            {item.food.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-purple-300 font-extrabold mt-0.5">
                          ₹{item.food.price} each
                        </p>
                        {item.specialInstructions && (
                          <p className="text-[10px] text-[#AAB3C5] truncate italic mt-0.5">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-[#151C30] border border-purple-500/30 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.food._id || item.food.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg text-slate-300 hover:bg-[#1C263A] flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-extrabold text-white w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.food._id || item.food.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg text-purple-300 hover:bg-[#1C263A] flex items-center justify-center font-bold transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-white">
                          ₹{item.food.price * item.quantity}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.food._id || item.food.id)}
                          className="block text-[#AAB3C5] hover:text-red-400 mt-1 transition-colors ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pre-order Before College Breaks */}
                <div className="p-4 rounded-2xl bg-[#1C263A]/80 border border-purple-500/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      College Break Pre-Order
                    </span>
                    <span className="text-[10px] uppercase font-extrabold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full">
                      Zero Queue
                    </span>
                  </div>

                  <p className="text-[11px] text-[#AAB3C5]">
                    Order now and collect during your exact campus lecture break:
                  </p>

                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-[#151C30] border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  >
                    <option value="ASAP (Immediate)">⚡ ASAP (Prepare Immediately ~ 8-12m)</option>
                    <option value="11:15 AM - Morning Break">🔔 11:15 AM - Morning Recess Break</option>
                    <option value="1:00 PM - Lunch Break">🍱 1:00 PM - Afternoon Lunch Break</option>
                    <option value="3:30 PM - Tea & Snack Break">☕ 3:30 PM - Evening Tea Break</option>
                    <option value="5:15 PM - End of Day Break">🎒 5:15 PM - End of Lectures</option>
                  </select>
                </div>

                {/* Coupon Code Section */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-purple-400" /> Campus Coupon
                  </span>

                  {couponCode ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                      <div>
                        <span className="font-extrabold">{couponCode}</span> applied! Saved ₹{discountAmount}
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs font-bold text-emerald-300 hover:text-red-400 ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value)}
                        placeholder="Try CAMPUS50 or STUDENT10"
                        className="flex-1 uppercase text-xs px-3 py-2 rounded-xl bg-[#1C263A] border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-90 text-white text-xs font-bold transition-opacity shadow-sm"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {couponError && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {couponError}
                    </p>
                  )}
                </div>

                {/* Bill Details */}
                <div className="border-t border-purple-500/20 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-[#AAB3C5]">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-white">₹{subtotal}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Campus Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#AAB3C5]">
                    <span>Campus Canteen Convenience Fee</span>
                    <span className="text-emerald-400 font-semibold">FREE (₹0)</span>
                  </div>

                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-purple-500/20">
                    <span>Total Amount to Pay</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-black">₹{total}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Checkout CTA */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-purple-500/20 bg-[#0B1020]/90 space-y-3">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckoutClick();
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-500/30 transition-all transform active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <span>•</span>
                <span>₹{total}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <p className="text-[10px] text-center text-[#AAB3C5] flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Guaranteed Instant Token Generation on Order Confirmation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
