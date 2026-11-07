import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSocket } from '../context/SocketContext';
import { OrderStatusStepper } from '../components/OrderStatusStepper';
import { TokenPickupPass } from '../components/TokenPickupPass';
import { FoodCard } from '../components/FoodCard';
import {
  User,
  GraduationCap,
  Clock,
  Sparkles,
  ShoppingBag,
  Heart,
  RotateCcw,
  QrCode,
  MapPin,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const { socket } = useSocket();

  const [activeOrders, setActiveOrders] = useState([]);
  const [favoriteFoods, setFavoriteFoods] = useState([]);
  const [selectedPassOrder, setSelectedPassOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveOrders = async () => {
    try {
      const res = await axios.get('/api/orders/active');
      if (res.data.success) {
        setActiveOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching active orders:', err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data.success && res.data.user.favorites) {
        setFavoriteFoods(res.data.user.favorites);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchActiveOrders(), fetchFavorites()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Listen for socket order status updates
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (data) => {
      setActiveOrders((prev) =>
        prev.map((ord) => (ord._id === data.orderId ? { ...ord, status: data.status } : ord))
      );
      fetchActiveOrders();
    };

    socket.on('order:status_updated', handleStatusUpdate);

    return () => {
      socket.off('order:status_updated', handleStatusUpdate);
    };
  }, [socket]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. WELCOME BANNER */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

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
                <h1 className="text-2xl font-black text-white">{user?.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-500 text-white">
                  Student
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                <span>{user?.department || 'College Campus'}</span>
                <span>•</span>
                <span className="text-orange-400 font-mono font-bold">{user?.studentId || 'STU-DEMO'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/menu"
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md shadow-orange-500/25"
            >
              <ShoppingBag className="w-4 h-4" /> Order Food Now
            </Link>
            <Link
              to="/my-orders"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700"
            >
              Order History
            </Link>
          </div>
        </div>
      </div>

      {/* 2. LIVE ACTIVE ORDERS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Live In-Progress Orders
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {activeOrders.length} Active Token(s)
          </span>
        </div>

        {activeOrders.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800">No Orders in Preparation Right Now</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You don't have any active tokens waiting in the kitchen. Ready to grab a snack or lunch?
            </p>
            <Link
              to="/menu"
              className="inline-block px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors"
            >
              Browse Campus Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeOrders.map((order) => {
              const isReady = order.status === 'Ready for Pickup';
              return (
                <div
                  key={order._id}
                  className={`p-6 rounded-3xl bg-white border-2 transition-all shadow-md relative overflow-hidden ${
                    isReady
                      ? 'border-emerald-500 shadow-emerald-500/10 ring-4 ring-emerald-50'
                      : 'border-slate-200 hover:border-orange-200'
                  }`}
                >
                  {/* Top Bar with Token & Counter */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Token Number
                      </span>
                      <div className="text-3xl font-black text-slate-900 font-mono">
                        #{order.tokenNumber}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-700">
                        <MapPin className="w-3.5 h-3.5" /> Counter {order.assignedCounter || 1}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Pickup: {order.scheduledPickupTime || 'ASAP'}
                      </p>
                    </div>
                  </div>

                  {/* Visual Stepper */}
                  <div className="my-3">
                    <OrderStatusStepper currentStatus={order.status} />
                  </div>

                  {/* Ready alert badge */}
                  {isReady && (
                    <div className="my-2 p-3 rounded-2xl bg-emerald-500 text-white flex items-center justify-between animate-pulse">
                      <span className="text-xs font-black">
                        🔔 Food is Ready for Collection at Counter {order.assignedCounter || 1}!
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full">
                        Collect Now
                      </span>
                    </div>
                  )}

                  {/* Items summary */}
                  <div className="text-xs text-slate-500 space-y-1 py-2">
                    {order.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {it.quantity}x {it.name}
                        </span>
                        <span className="font-semibold text-slate-700">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pass trigger footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Total Paid:</span>
                      <span className="text-sm font-black text-slate-900 ml-1">₹{order.finalAmount}</span>
                    </div>

                    <button
                      onClick={() => setSelectedPassOrder(order)}
                      className="px-4 py-2 rounded-xl bg-[#0B132B] hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      View Pickup Pass & QR
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. FAVORITE FOOD ITEMS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              My Saved Favorites
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            Explore More &rarr;
          </Link>
        </div>

        {favoriteFoods.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 text-center space-y-2">
            <p className="text-xs text-slate-400">
              You haven't bookmarked any favorite dishes yet. Click the heart icon on any food item to save it for quick re-ordering!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteFoods.map((item) => (
              <FoodCard key={item._id} food={item} />
            ))}
          </div>
        )}
      </div>

      {/* Token Pass Modal if opened */}
      {selectedPassOrder && (
        <TokenPickupPass
          order={selectedPassOrder}
          onClose={() => setSelectedPassOrder(null)}
        />
      )}
    </div>
  );
};
