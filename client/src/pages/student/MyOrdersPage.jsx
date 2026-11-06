import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useCart } from '../../context/CartContext';
import { OrderStatusStepper } from '../../components/OrderStatusStepper';
import { TokenPickupPass } from '../../components/TokenPickupPass';
import {
  ClipboardList,
  Clock,
  RotateCcw,
  QrCode,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  XCircle,
  ArrowRight,
  Sparkles,
  Phone,
  MessageSquare
} from 'lucide-react';

export const MyOrdersPage = () => {
  const { user } = useAuth();
  const { orders, cancelOrder, menuItems } = useData();
  const { addToCart, setIsCartOpen } = useCart();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'ACTIVE', 'PAST'
  const [selectedPassOrder, setSelectedPassOrder] = useState(null);

  // Filter orders for current student (fallback to all student orders if demo)
  const studentOrders = orders.filter((o) => {
    if (!user) return true;
    return o.studentId === user.id || o.studentRoll === user.studentId || true;
  });

  const activeOrders = studentOrders.filter((o) =>
    ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup'].includes(o.status)
  );

  const pastOrders = studentOrders.filter((o) =>
    ['Completed', 'Cancelled', 'Rejected'].includes(o.status)
  );

  const displayedOrders =
    activeTab === 'ACTIVE'
      ? activeOrders
      : activeTab === 'PAST'
      ? pastOrders
      : studentOrders;

  const handleReorder = (order) => {
    order.items.forEach((item) => {
      const foodItem =
        menuItems.find((m) => (m.id === item.foodId || m._id === item.foodId || m.name === item.name)) ||
        {
          _id: item.foodId || 'food-custom',
          id: item.foodId || 'food-custom',
          name: item.name,
          price: item.price || 50,
          isVeg: item.isVeg ?? true,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
        };
      addToCart(foodItem, item.quantity);
    });
    setIsCartOpen(true);
  };

  const handleCancel = (orderId, tokenNumber) => {
    if (window.confirm(`Are you sure you want to cancel order #${tokenNumber}?`)) {
      cancelOrder(orderId, 'Cancelled by student before kitchen preparation');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-white">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#1C263A] via-[#151C30] to-[#1C263A] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl border border-purple-500/25">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold border border-purple-500/30">
              <ClipboardList className="w-5 h-5 text-purple-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              My Orders & Live Tokens
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-2">
            Track real-time kitchen progress, present your contactless QR pass, or re-order campus favorites.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/menu"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-extrabold text-xs shadow-md shadow-purple-500/30 flex items-center gap-2 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Order More Food
          </Link>
          <Link
            to="/live-tokens"
            className="px-4 py-2.5 rounded-2xl bg-[#151C30] hover:bg-[#25334d] text-slate-200 font-extrabold text-xs border border-purple-500/30 flex items-center gap-2 transition-all"
          >
            <Clock className="w-4 h-4 text-purple-400" />
            Live Kiosk TV
          </Link>
        </div>
      </div>

      {/* 2. Tabs */}
      <div className="flex items-center gap-3 border-b border-purple-500/20 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'ALL'
              ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
              : 'bg-[#151C30] text-[#AAB3C5] hover:bg-[#1C263A] hover:text-white'
          }`}
        >
          All Orders ({studentOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'ACTIVE'
              ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
              : 'bg-[#151C30] text-[#AAB3C5] hover:bg-[#1C263A] hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Active Live Queue ({activeOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('PAST')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'PAST'
              ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
              : 'bg-[#151C30] text-[#AAB3C5] hover:bg-[#1C263A] hover:text-white'
          }`}
        >
          Order History ({pastOrders.length})
        </button>
      </div>

      {/* 3. Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="py-20 text-center bg-[#1C263A]/85 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl space-y-3.5 p-6">
          <div className="w-16 h-16 rounded-2xl bg-[#151C30] text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto shadow-xs">
            <ClipboardList className="w-8 h-8 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-white">
              {activeTab === 'ACTIVE'
                ? 'Pehle Order Karo, Uske Baad Token Generate Hoga! 🍔'
                : 'No Orders Found in History'}
            </h3>
            <p className="text-xs text-[#AAB3C5] max-w-md mx-auto leading-relaxed">
              {activeTab === 'ACTIVE'
                ? 'Aapne abhi koi food order nahi lagaya hai. Live token pane ke liye canteen menu se apna favorite food order karein!'
                : 'Aapne abhi tak canteen se koi order place nahi kiya hai.'}
            </p>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white text-xs font-black shadow-md shadow-purple-500/30 transition-all mt-2"
          >
            <span>Explore Menu & Place Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedOrders.map((order) => {
            const isActive = ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup'].includes(
              order.status
            );
            const canCancel = order.status === 'Placed';

            return (
              <div
                key={order.id || order._id}
                className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl hover:border-purple-500/40 transition-all p-5 sm:p-7 space-y-6"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#151C30] border border-purple-500/30 text-purple-300 flex flex-col items-center justify-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#AAB3C5]">
                        TOKEN
                      </span>
                      <span className="text-sm font-black font-mono text-white">
                        {order.tokenNumber}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white">
                          Order #{order.orderNumber || order.id}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.status === 'Ready for Pickup'
                              ? 'bg-emerald-500 text-white animate-pulse'
                              : order.status === 'Preparing'
                              ? 'bg-blue-600 text-white'
                              : order.status === 'Accepted'
                              ? 'bg-[#7955E8] text-white'
                              : order.status === 'Completed'
                              ? 'bg-slate-700 text-slate-200'
                              : order.status === 'Cancelled'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#AAB3C5] mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-purple-400" />
                          {order.createdAt || 'Today'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-purple-300">
                          <MapPin className="w-3 h-3 text-purple-400" />
                          Counter {order.assignedCounter || 1}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[#AAB3C5]">
                          {order.paymentMethod === 'UPI' ? 'UPI (Paid)' : 'Cash at Counter'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* View Pickup Pass */}
                    <button
                      onClick={() => setSelectedPassOrder(order)}
                      className="px-3.5 py-2 rounded-xl bg-[#151C30] hover:bg-[#25334d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-purple-500/30"
                    >
                      <QrCode className="w-3.5 h-3.5 text-purple-400" />
                      View QR Pass
                    </button>

                    {/* Reorder Button */}
                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reorder
                    </button>

                    {/* Cancel button if just placed */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(order.id || order._id, order.tokenNumber)}
                        className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Cancel this order before preparation begins"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Progress Stepper for Active Orders */}
                {isActive && (
                  <div className="py-2 bg-[#151C30] p-4 rounded-2xl border border-purple-500/20">
                    <div className="flex items-center justify-between text-xs font-extrabold text-white mb-3 px-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        Live Kitchen Progress Tracker
                      </span>
                      <span className="text-[11px] font-semibold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full">
                        Pickup: {order.scheduledPickupTime || 'Immediate ASAP'}
                      </span>
                    </div>
                    <OrderStatusStepper currentStatus={order.status} />

                    {/* WhatsApp Accepted & Estimated Prep Time Banner */}
                    {['Accepted', 'Preparing'].includes(order.status) && (
                      <div className="mt-3.5 p-3 rounded-2xl bg-[#0B1020] border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-white block">
                              Order Accepted by Canteen Owner!
                            </span>
                            <p className="text-[11px] text-[#AAB3C5]">
                              Estimated Preparation Time: <strong className="font-extrabold text-purple-300">~{order.estimatedPrepMinutes || 15} Minutes</strong>
                              {order.estimatedReadyTime ? ` • Ready by ${order.estimatedReadyTime}` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full self-start sm:self-auto flex items-center gap-1 border border-emerald-500/30">
                          <MessageSquare className="w-3 h-3 text-emerald-400" />
                          <span>WhatsApp Alert Dispatched</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Items Summary */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#AAB3C5] block">
                    Ordered Dishes
                  </span>
                  <div className="divide-y divide-purple-500/10">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-2 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-[#151C30] text-purple-300 border border-purple-500/20 font-extrabold flex items-center justify-center text-[11px]">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-white">{item.name}</span>
                          {item.specialInstructions && (
                            <span className="text-[11px] text-[#AAB3C5] italic">
                              ({item.specialInstructions})
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-white">
                          ₹{(item.price || 50) * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Total */}
                <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs">
                  <div className="text-[#AAB3C5] flex items-center gap-2">
                    <span>
                      Payment: <strong className="text-white">{order.paymentMethod}</strong>
                    </span>
                    <span>•</span>
                    <span
                      className={`font-black ${
                        order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      Status: {order.paymentStatus || 'PAID'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#AAB3C5]">Final Bill:</span>
                    <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                      ₹{order.finalAmount || order.totalAmount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Digital Pickup Pass Modal */}
      {selectedPassOrder && (
        <TokenPickupPass
          order={selectedPassOrder}
          onClose={() => setSelectedPassOrder(null)}
        />
      )}
    </div>
  );
};

export default MyOrdersPage;
