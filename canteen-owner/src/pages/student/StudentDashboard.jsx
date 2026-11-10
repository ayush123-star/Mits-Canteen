import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useCart } from '../../context/CartContext';
import { isOrderOwnedByUser } from '../../services/realtimeSync';
import { OrderStatusStepper } from '../../components/OrderStatusStepper';
import { TokenPickupPass } from '../../components/TokenPickupPass';
import { FoodCard } from '../../components/FoodCard';
import { FoodDetailModal } from '../../components/FoodDetailModal';
import {
  Clock,
  Sparkles,
  ShoppingBag,
  Heart,
  QrCode,
  MapPin,
  ChevronRight,
  Zap,
  Coffee,
  CheckCircle2,
  Calendar,
  Star
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { orders, menuItems } = useData();
  const { setIsCartOpen } = useCart();
  const [selectedPassOrder, setSelectedPassOrder] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);

  // Student's active orders (strictly for current user)
  const activeOrders = orders.filter(
    (o) => isOrderOwnedByUser(o, user) && ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup'].includes(o.status)
  );

  // Recommended dishes
  const recommendedDishes = menuItems.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-white">
      
      {/* 1. WELCOME BANNER WITH CAMPUS STATS */}
      <div className="bg-gradient-to-r from-[#1C263A] via-[#151C30] to-[#1C263A] border border-purple-500/25 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#7955E8]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-purple-400 shadow-lg shadow-purple-500/30 ring-2 ring-purple-500/20 shrink-0 bg-slate-800">
              <img
                src={user?.avatar || '/assets/developer/ayush_pandey.jpg'}
                alt={user?.name || 'Ayush Pandey'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/campus/ayush_pandey.jpg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">Hello, {user?.name || 'Ayush Pandey'}!</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-sm">
                  Student Diner
                </span>
              </div>
              <p className="text-xs text-[#AAB3C5] mt-0.5 flex items-center gap-2">
                <span>{user?.department || 'Electronics and Telecommunication'}</span>
                <span>•</span>
                <span className="text-purple-300 font-mono font-bold">{user?.studentId || 'BTET25O1039'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/menu"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md shadow-purple-500/30"
            >
              <ShoppingBag className="w-4 h-4" /> Order Food Now
            </Link>
            <Link
              to="/my-orders"
              className="px-5 py-2.5 rounded-xl bg-[#151C30] hover:bg-[#25334d] text-white text-xs font-bold transition-all border border-purple-500/30"
            >
              My Orders
            </Link>
          </div>
        </div>

        {/* Break-Time Quick Shortcuts */}
        <div className="mt-6 pt-5 border-t border-purple-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Link
            to="/menu"
            className="p-3 rounded-2xl bg-[#0B1020]/70 hover:bg-[#151C30] border border-purple-500/20 transition-all flex items-center gap-2.5"
          >
            <Zap className="w-4 h-4 text-purple-300 shrink-0" />
            <div>
              <p className="font-bold text-white">11:15 AM Recess</p>
              <p className="text-[10px] text-[#AAB3C5]">Pre-order tea & snacks</p>
            </div>
          </Link>

          <Link
            to="/menu"
            className="p-3 rounded-2xl bg-[#0B1020]/70 hover:bg-[#151C30] border border-purple-500/20 transition-all flex items-center gap-2.5"
          >
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white">1:00 PM Lunch</p>
              <p className="text-[10px] text-[#AAB3C5]">Thali & Biryani bowls</p>
            </div>
          </Link>

          <Link
            to="/menu"
            className="p-3 rounded-2xl bg-[#0B1020]/70 hover:bg-[#151C30] border border-purple-500/20 transition-all flex items-center gap-2.5"
          >
            <Coffee className="w-4 h-4 text-cyan-300 shrink-0" />
            <div>
              <p className="font-bold text-white">3:30 PM Tea Break</p>
              <p className="text-[10px] text-[#AAB3C5]">Cold coffee & fries</p>
            </div>
          </Link>

          <Link
            to="/feedback"
            className="p-3 rounded-2xl bg-[#0B1020]/70 hover:bg-[#151C30] border border-purple-500/20 transition-all flex items-center gap-2.5"
          >
            <Star className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <p className="font-bold text-white">Rate Food</p>
              <p className="text-[10px] text-[#AAB3C5]">Submit Canteen Review</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 2. LIVE ACTIVE ORDER TRACKING (ZERO-QUEUE ENGINE) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Live In-Progress Orders ({activeOrders.length})
            </h2>
          </div>
          <span className="text-xs font-bold text-purple-300">
            Real-time Status Updates
          </span>
        </div>

        {activeOrders.length === 0 ? (
          <div className="p-8 sm:p-10 rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 text-center space-y-3.5 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-[#151C30] text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30 shadow-xs">
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-lg text-white">
                Place an Order to Generate Your Live Token! 🍔
              </h3>
              <p className="text-xs text-[#AAB3C5] max-w-md mx-auto leading-relaxed">
                You do not have any active orders right now. Order your favorite food from the campus menu to instantly generate your kitchen pickup token!
              </p>
            </div>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white text-xs font-black shadow-md shadow-purple-500/30 transition-all mt-1"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Menu & Place Order</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeOrders.map((order) => {
              const isReady = order.status === 'Ready for Pickup';
              return (
                <div
                  key={order.id || order._id}
                  className={`p-6 rounded-3xl bg-[#1C263A]/90 backdrop-blur-xl border-2 transition-all shadow-xl relative overflow-hidden ${
                    isReady
                      ? 'border-emerald-500 shadow-emerald-500/20 ring-4 ring-emerald-500/20'
                      : 'border-purple-500/30 hover:border-purple-500/60'
                  }`}
                >
                  {/* Top Bar with Token & Counter */}
                  <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#AAB3C5]">
                        Token Number
                      </span>
                      <div className="text-3xl font-black text-white font-mono">
                        #{order.tokenNumber}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 border border-purple-500/30 text-purple-300">
                        <MapPin className="w-3.5 h-3.5" /> Counter
                      </span>
                      <p className="text-[11px] text-[#AAB3C5] mt-1">
                        Pickup: {order.scheduledPickupTime || 'ASAP'}
                      </p>
                    </div>
                  </div>

                  {/* Visual Stepper */}
                  <div className="my-3">
                    <OrderStatusStepper currentStatus={order.status} />
                  </div>

                  {/* Accepted with estimated prep time alert */}
                  {['Accepted', 'Preparing'].includes(order.status) && (
                    <div className="my-2 p-3 rounded-2xl bg-[#151C30] border border-purple-500/30 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                        <div>
                          <span className="text-xs font-black block">Order Accepted by Canteen Owner</span>
                          <span className="text-[11px] text-[#AAB3C5]">
                            Estimated Prep Time: <strong className="font-extrabold text-purple-300">~{order.estimatedPrepMinutes || 15} mins</strong>
                            {order.estimatedReadyTime ? ` (Ready by ${order.estimatedReadyTime})` : ''}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        WhatsApp Sent
                      </span>
                    </div>
                  )}

                  {/* Ready alert badge */}
                  {isReady && (
                    <div className="my-2 p-3 rounded-2xl bg-emerald-600 text-white flex items-center justify-between animate-pulse">
                      <span className="text-xs font-black">
                        🔔 Food is Ready for Collection at MITS Main Canteen (Counter)!
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full">
                        Collect Now
                      </span>
                    </div>
                  )}

                  {/* Items summary */}
                  <div className="text-xs text-[#AAB3C5] space-y-1 py-2">
                    {order.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {it.quantity}x {it.name}
                        </span>
                        <span className="font-semibold text-white">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pass trigger footer */}
                  <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#AAB3C5]">Total Paid:</span>
                      <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 ml-1">₹{order.finalAmount}</span>
                    </div>

                    <button
                      onClick={() => setSelectedPassOrder(order)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-500/25"
                    >
                      <QrCode className="w-3.5 h-3.5 text-white" />
                      View Pickup Pass & QR
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. RECOMMENDED CAMPUS CRAVINGS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Recommended for You
            </h2>
            <p className="text-xs text-[#AAB3C5] mt-0.5">Most ordered dishes by your batchmates this week</p>
          </div>
          <Link to="/menu" className="text-xs font-bold text-purple-300 hover:text-white transition-colors">
            View All Dishes &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedDishes.map((food) => (
            <FoodCard
              key={food._id || food.id}
              food={food}
              onSelect={(item) => setSelectedFood(item)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedPassOrder && (
        <TokenPickupPass
          order={selectedPassOrder}
          onClose={() => setSelectedPassOrder(null)}
        />
      )}

      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  );
};
