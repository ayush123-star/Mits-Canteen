import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useCart } from '../../context/CartContext';
import { OrderStatusStepper } from '../../components/OrderStatusStepper';
import { TokenPickupPass } from '../../components/TokenPickupPass';
import { playNotificationSound } from '../../utils/audio';
import { sendBrowserNotification } from '../../utils/browserNotifications';
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
  MessageSquare,
  ChefHat,
  Bell,
  Check
} from 'lucide-react';

const getCustomerStatusInfo = (status, rejectionReason, cancellationReason) => {
  switch (status) {
    case 'Placed':
    case 'Pending Acceptance':
      return {
        badge: 'Waiting for Confirmation',
        color: 'from-amber-500/20 via-orange-500/10 to-amber-500/20 text-amber-200 border-amber-500/30',
        icon: '⏳',
        message: 'Your order has been successfully placed. Waiting for canteen confirmation.',
      };
    case 'Accepted':
      return {
        badge: 'Order Accepted',
        color: 'from-purple-500/20 via-indigo-500/15 to-purple-500/20 text-purple-200 border-purple-500/30',
        icon: '👨‍🍳',
        message: 'Your order has been accepted by MITS Main Canteen! Our kitchen is preparing your food.',
      };
    case 'Preparing':
      return {
        badge: 'Freshly Preparing',
        color: 'from-blue-500/20 via-indigo-500/15 to-cyan-500/20 text-blue-200 border-blue-500/30',
        icon: '🔥',
        message: 'Your order is now being freshly prepared by our kitchen.',
      };
    case 'Ready for Pickup':
      return {
        badge: 'Ready for Pickup',
        color: 'from-emerald-500/25 via-teal-500/20 to-emerald-500/25 text-emerald-300 border-emerald-500/40 animate-pulse',
        icon: '🔔',
        message: 'Great news! Your MITS Canteen order is READY FOR PICKUP. Please visit your assigned counter with your token.',
      };
    case 'Completed':
    case 'Collected':
      return {
        badge: 'Order Collected',
        color: 'from-teal-500/20 via-emerald-500/15 to-teal-500/20 text-teal-200 border-teal-500/30',
        icon: '✅',
        message: 'Your order has been collected. Thank you for dining with MITS Canteen!',
      };
    case 'Rejected':
      return {
        badge: 'Order Rejected',
        color: 'from-red-500/20 via-rose-500/15 to-red-500/20 text-red-300 border-red-500/30',
        icon: '❌',
        message: `Sorry! Your order could not be accepted by MITS Main Canteen.${rejectionReason ? ` (Reason: ${rejectionReason})` : ''}`,
      };
    case 'Cancelled':
      return {
        badge: 'Order Cancelled',
        color: 'from-slate-500/20 to-gray-500/20 text-slate-300 border-slate-500/30',
        icon: '🚫',
        message: `Your order has been cancelled.${cancellationReason ? ` (Reason: ${cancellationReason})` : ''}`,
      };
    default:
      return {
        badge: status,
        color: 'from-purple-500/20 to-indigo-500/20 text-purple-200 border-purple-500/30',
        icon: '📦',
        message: `Order status: ${status}`,
      };
  }
};

export const MyOrdersPage = () => {
  const { user } = useAuth();
  const { orders, cancelOrder, menuItems } = useData();
  const { addToCart, setIsCartOpen } = useCart();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'ACTIVE', 'PAST'
  const [selectedPassOrder, setSelectedPassOrder] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  // Real-time notification & auto-refresh listener for student's orders
  useEffect(() => {
    const handleStatusUpdate = (e) => {
      setRefreshTick((t) => t + 1);
      const data = e?.detail;
      if (!data) return;
      const targetToken = data.tokenNumber || data.updatedOrder?.tokenNumber;
      const newStatus = data.newStatus || data.status || data.updatedOrder?.status;
      if (!newStatus) return;

      try {
        if (newStatus === 'Accepted') {
          playNotificationSound('accepted');
          sendBrowserNotification(
            `Order #${targetToken} Accepted!`,
            'Your order has been accepted by MITS Main Canteen! Our kitchen is preparing your food.'
          );
        } else if (newStatus === 'Preparing') {
          playNotificationSound('preparing');
          sendBrowserNotification(
            `Order #${targetToken} Preparing!`,
            'Your order is now being freshly prepared by our kitchen.'
          );
        } else if (newStatus === 'Ready for Pickup') {
          playNotificationSound('ready');
          sendBrowserNotification(
            `Order #${targetToken} is READY!`,
            'Great news! Your MITS Canteen order is READY FOR PICKUP at the counter.'
          );
        } else if (newStatus === 'Completed' || newStatus === 'Collected') {
          playNotificationSound('completed');
          sendBrowserNotification(
            `Order #${targetToken} Collected!`,
            'Your order has been collected. Thank you for dining with MITS Canteen!'
          );
        }
      } catch (_) {}
    };

    const handleRefreshOnly = () => {
      setRefreshTick((t) => t + 1);
    };

    window.addEventListener('smartcanteen:order_status_updated', handleStatusUpdate);
    window.addEventListener('smartcanteen:orders_sync', handleRefreshOnly);
    window.addEventListener('smartcanteen:tokens_refresh', handleRefreshOnly);
    window.addEventListener('storage', handleRefreshOnly);

    return () => {
      window.removeEventListener('smartcanteen:order_status_updated', handleStatusUpdate);
      window.removeEventListener('smartcanteen:orders_sync', handleRefreshOnly);
      window.removeEventListener('smartcanteen:tokens_refresh', handleRefreshOnly);
      window.removeEventListener('storage', handleRefreshOnly);
    };
  }, []);

  // Live responsive orders source: uses reactive DataContext orders as authoritative source
  const currentOrders = React.useMemo(() => {
    if (Array.isArray(orders) && orders.length > 0) {
      return orders.filter((o) => o && typeof o === 'object');
    }
    try {
      const stored = localStorage.getItem('smart_canteen_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((o) => o && typeof o === 'object');
        }
      }
    } catch (_) {}
    return [];
  }, [orders, refreshTick]);

  // Filter orders for current student (fallback to all student orders if demo)
  const studentOrders = currentOrders.filter((o) => {
    if (!o) return false;
    if (!user) return true;
    return o.studentId === user.id || o.studentRoll === user.studentId || true;
  });

  const activeOrders = studentOrders.filter((o) =>
    o && ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup'].includes(o.status)
  );

  const pastOrders = studentOrders.filter((o) =>
    o && ['Completed', 'Collected', 'Cancelled', 'Rejected'].includes(o.status)
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
                ? 'Place an Order to Generate Your Live Token! 🍔'
                : 'No Orders Found in History'}
            </h3>
            <p className="text-xs text-[#AAB3C5] max-w-md mx-auto leading-relaxed">
              {activeTab === 'ACTIVE'
                ? 'You do not have any active orders right now. Browse the canteen menu and place an order to get your instant live token!'
                : 'You have not placed any canteen orders yet.'}
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
            const isActive = [
              'Placed',
              'Pending Acceptance',
              'Accepted',
              'Preparing',
              'Ready for Pickup',
            ].includes(order.status);
            const canCancel = order.status === 'Placed' || order.status === 'Pending Acceptance';
            const statusInfo = getCustomerStatusInfo(
              order.status,
              order.rejectionReason,
              order.cancellationReason
            );

            return (
              <div
                key={order.id || order._id}
                className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl hover:border-purple-500/40 transition-all p-5 sm:p-7 space-y-5"
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
                          Order #{order.orderNumber || order.orderId || order.id}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.status === 'Ready for Pickup'
                              ? 'bg-emerald-500 text-white animate-pulse'
                              : order.status === 'Preparing'
                              ? 'bg-blue-600 text-white'
                              : order.status === 'Accepted'
                              ? 'bg-[#7955E8] text-white'
                              : order.status === 'Completed' || order.status === 'Collected'
                              ? 'bg-teal-700 text-white'
                              : order.status === 'Cancelled'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : order.status === 'Rejected'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
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
                      className="px-3.5 py-2 rounded-xl bg-[#151C30] hover:bg-[#25334d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-purple-500/30 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-purple-400" />
                      View QR Pass
                    </button>

                    {/* Reorder Button */}
                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reorder
                    </button>

                    {/* Cancel button if just placed */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(order.id || order._id, order.tokenNumber)}
                        className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Cancel this order before preparation begins"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Zomato/Swiggy Live Customer Notification Card */}
                <div
                  className={`p-4 rounded-2xl bg-gradient-to-r ${statusInfo.color} border flex items-start sm:items-center gap-3.5 shadow-md`}
                >
                  <span className="text-2xl shrink-0">{statusInfo.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 border border-white/20">
                        {statusInfo.badge}
                      </span>
                      {order.estimatedPrepMinutes && ['Accepted', 'Preparing'].includes(order.status) && (
                        <span className="text-[11px] font-bold text-purple-200">
                          ~{order.estimatedPrepMinutes} Mins Prep Time
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-white mt-1 leading-snug">
                      {statusInfo.message}
                    </p>
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
                  </div>
                )}

                {/* Items Summary */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#AAB3C5] block">
                    Ordered Dishes
                  </span>
                  <div className="divide-y divide-purple-500/10">
                    {(order.items || []).map((item, idx) => (
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
