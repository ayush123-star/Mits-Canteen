import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useSocket } from '../../context/SocketContext';
import { playNotificationSound } from '../../utils/audio';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Search,
  Bell,
  Volume2,
  VolumeX,
  AlertTriangle,
  QrCode,
  Flame,
  Check,
  DollarSign,
  Filter,
  Smartphone,
  Phone,
  ArrowRight,
  Sparkles,
  MapPin,
  RefreshCw,
  MessageSquare,
  ExternalLink,
  Send
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { orders, updateOrderStatus, cancelOrder, feedbackList } = useData();
  const { socket, isConnected } = useSocket();

  const [searchToken, setSearchToken] = useState('');
  const [selectedCounter, setSelectedCounter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('Ingredients temporarily unavailable');
  const [acceptModalOrder, setAcceptModalOrder] = useState(null);
  const [customPrepMinutes, setCustomPrepMinutes] = useState(15);
  const [verifiedTokenModal, setVerifiedTokenModal] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const prevCountRef = useRef(orders.length);

  // Instant notification when a new order arrives via state changes
  useEffect(() => {
    if (orders.length > prevCountRef.current) {
      const latest = orders[0];
      if (latest && latest.status === 'Placed') {
        setNewOrderAlert(latest);
        playNotificationSound('new_order');
        setTimeout(() => setNewOrderAlert(null), 10000);
      }
    }
    prevCountRef.current = orders.length;
  }, [orders]);

  // Real-time order listeners via Socket.IO, cross-tab events & cloud sync
  useEffect(() => {
    const handleIncomingOrder = (rawOrder) => {
      const ord = rawOrder?.order || rawOrder;
      if (!ord) return;
      setNewOrderAlert(ord);
      playNotificationSound('new_order');
      setTimeout(() => setNewOrderAlert(null), 10000);
    };

    // Socket.IO backend event subscription
    if (socket) {
      socket.on('order:created', handleIncomingOrder);
      socket.on('order:new', handleIncomingOrder);
    }

    // Window events from BroadcastChannel, cloud SSE & local tabs
    const handleSync = (e) => {
      const { type, newOrder } = e.detail || {};
      if ((type === 'NEW_ORDER' || type === 'ORDER_PLACED') && newOrder) {
        handleIncomingOrder(newOrder);
      }
    };

    const handleDirectEvent = (e) => {
      if (e.detail) {
        handleIncomingOrder(e.detail);
      }
    };

    window.addEventListener('smartcanteen:orders_sync', handleSync);
    window.addEventListener('smartcanteen:order_new', handleDirectEvent);

    return () => {
      if (socket) {
        socket.off('order:created', handleIncomingOrder);
        socket.off('order:new', handleIncomingOrder);
      }
      window.removeEventListener('smartcanteen:orders_sync', handleSync);
      window.removeEventListener('smartcanteen:order_new', handleDirectEvent);
    };
  }, [socket]);

  // Active kitchen orders
  const activeOrders = orders.filter((o) =>
    ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup'].includes(o.status)
  );

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    // Search
    if (searchToken.trim()) {
      const q = searchToken.toLowerCase().trim();
      const matchToken = ord.tokenNumber.toLowerCase().includes(q);
      const matchName = ord.studentName?.toLowerCase().includes(q);
      const matchPhone = ord.studentPhone?.includes(q);
      if (!matchToken && !matchName && !matchPhone) return false;
    }

    // Counter
    if (selectedCounter !== 'ALL') {
      if (String(ord.assignedCounter) !== String(selectedCounter)) return false;
    }

    // Status
    if (statusFilter === 'ACTIVE') {
      return ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup'].includes(ord.status);
    } else if (statusFilter !== 'ALL') {
      return ord.status === statusFilter;
    }

    return true;
  });

  // Calculate quick metrics
  const totalOrdersToday = orders.length;
  const preparingCount = orders.filter((o) => o.status === 'Preparing').length;
  const readyCount = orders.filter((o) => o.status === 'Ready for Pickup').length;
  const placedCount = orders.filter((o) => o.status === 'Placed').length;
  const totalRevenueToday = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

  // Direct 1-Click Accept with Automated WhatsApp Notification
  const handleDirectAccept = (order) => {
    const actor = user?.name || 'Canteen Owner';
    const estMins = order.estimatedPrepMinutes || 12;
    updateOrderStatus(order.id, 'Accepted', actor, {
      estimatedMinutes: estMins,
      note: `Order accepted. Automatic WhatsApp alert sent (~${estMins}m)`,
    });
  };

  const handleAdvanceStatus = (order) => {
    const actor = user?.name || 'Kitchen Manager';
    if (order.status === 'Placed') {
      handleDirectAccept(order);
    } else if (order.status === 'Accepted') {
      updateOrderStatus(order.id, 'Preparing', actor);
    } else if (order.status === 'Preparing') {
      updateOrderStatus(order.id, 'Ready for Pickup', actor);
    } else if (order.status === 'Ready for Pickup') {
      updateOrderStatus(order.id, 'Completed', actor);
    }
  };

  const handleConfirmAccept = () => {
    if (!acceptModalOrder) return;
    const actor = user?.name || 'Canteen Owner';
    updateOrderStatus(acceptModalOrder.id, 'Accepted', actor, {
      estimatedMinutes: customPrepMinutes,
      note: `Order accepted with custom prep time: ${customPrepMinutes} mins. WhatsApp alert dispatched!`,
    });
    setAcceptModalOrder(null);
  };

  const handleConfirmReject = () => {
    if (!rejectModalOrder) return;
    cancelOrder(rejectModalOrder.id, `Rejected by canteen: ${rejectReason}`);
    setRejectModalOrder(null);
  };

  const handleVerifyTokenSubmit = (e) => {
    e.preventDefault();
    if (!searchToken.trim()) return;
    const cleanQ = searchToken.replace('#', '').trim().toLowerCase();
    const found = orders.find(
      (o) =>
        o.tokenNumber.toLowerCase() === cleanQ ||
        o.tokenNumber.toLowerCase() === `#${cleanQ}` ||
        o.id.toLowerCase() === cleanQ ||
        (o.studentEnrollment && o.studentEnrollment.toLowerCase().includes(cleanQ)) ||
        (o.studentRoll && o.studentRoll.toLowerCase().includes(cleanQ))
    );

    if (found) {
      setVerifiedTokenModal(found);
    } else {
      alert(`No active order found matching "${searchToken}".`);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-white">
      {/* Real-time New Incoming Order Alert Banner */}
      {newOrderAlert && (
        <div className="fixed top-16 right-4 z-50 max-w-md p-4 rounded-2xl bg-gradient-to-r from-red-600 via-purple-700 to-indigo-800 text-white shadow-2xl border-2 border-white/30 animate-bounce flex items-start justify-between gap-3 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-xl border border-white/30 animate-pulse">
              <Bell className="w-5 h-5 text-amber-300" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-purple-900">
                  New Order Received
                </span>
                <span className="text-[10px] font-mono text-purple-200">
                  #{newOrderAlert.tokenNumber}
                </span>
              </div>
              <p className="text-sm font-black text-white">
                {newOrderAlert.studentName || 'Student Diner'} • <span className="font-mono text-emerald-300">₹{newOrderAlert.finalAmount || newOrderAlert.totalAmount || 0}</span>
              </p>
              <p className="text-[11px] text-purple-100 line-clamp-2">
                {(newOrderAlert.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ') || '1x Campus Food Item'}
              </p>
              <div className="flex items-center gap-2 pt-1 text-[10px]">
                <span className={`px-2 py-0.5 rounded-md font-bold ${
                  newOrderAlert.paymentStatus === 'PAID' || newOrderAlert.paymentStatus === 'Completed' || newOrderAlert.paymentMethod === 'UPI'
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40'
                    : 'bg-amber-500/30 text-amber-200 border border-amber-500/40'
                }`}>
                  {newOrderAlert.paymentMethod === 'UPI' ? 'Paid via UPI' : 'Cash at Counter'}
                </span>
                <span className="text-purple-300">
                  Counter #{newOrderAlert.assignedCounter || 1}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setNewOrderAlert(null)}
            className="p-1.5 rounded-xl bg-white/20 hover:bg-white/40 text-white text-xs font-bold transition-all cursor-pointer"
            title="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Header Toolbar (Mobile-Adaptive Layout) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Live Kitchen Calling & Orders Queue
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
            Real-time live queue management with automated recipe inventory deductions and WhatsApp readiness alerts.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Quick Token Call / Scanner Box */}
          <form onSubmit={handleVerifyTokenSubmit} className="flex items-center gap-2 flex-1 md:w-auto">
            <div className="relative flex-1 md:w-56">
              <QrCode className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                placeholder="Verify Token (e.g. TK-101)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl sm:rounded-2xl bg-[#151C30] border border-purple-500/30 text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:border-[#7955E8] shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white text-xs font-black shadow-md shadow-purple-500/30 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              Verify
            </button>
          </form>

          {/* Quick Shortcut to Customer Feedback */}
          <Link
            to="/admin/feedback"
            className="px-3 py-2.5 rounded-xl sm:rounded-2xl bg-[#1C263A] hover:bg-[#25334d] border border-purple-500/30 text-purple-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
            title="View Student Reviews & Feedback"
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Feedback</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
              {feedbackList?.length || 0}
            </span>
          </Link>
        </div>
      </div>

      {/* 2. Stat Metric Cards (Phone-Responsive Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl">
          <p className="text-[10px] sm:text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider truncate">New Incoming</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl sm:text-3xl font-black text-purple-300">{placedCount}</span>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">
              🔔
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl">
          <p className="text-[10px] sm:text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider truncate">In Preparation</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl sm:text-3xl font-black text-blue-400">{preparingCount}</span>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs border border-blue-500/30">
              👨‍🍳
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl">
          <p className="text-[10px] sm:text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider truncate">Ready at Counters</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl sm:text-3xl font-black text-emerald-400">{readyCount}</span>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">
              📦
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl">
          <p className="text-[10px] sm:text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider truncate">Total Orders Today</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl sm:text-3xl font-black text-white">{totalOrdersToday}</span>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#151C30] text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">
              📊
            </span>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-xl shadow-purple-500/30">
          <p className="text-[10px] sm:text-[11px] font-bold text-purple-200 uppercase tracking-wider truncate">Today's Revenue</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl sm:text-3xl font-black privacy-sensitive" title="Hover to view (Protected by Privacy Shield)">₹{totalRevenueToday}</span>
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-200" />
          </div>
        </div>
      </div>

      {/* 3. Filters Bar (Horizontally scrollable with smooth finger swipe) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1C263A]/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-purple-500/20 shadow-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 scroll-smooth -mx-1 px-1">
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
                : 'text-[#AAB3C5] hover:bg-[#151C30] hover:text-white'
            }`}
          >
            Active ({activeOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter('Placed')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'Placed'
                ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
                : 'text-[#AAB3C5] hover:bg-[#151C30] hover:text-white'
            }`}
          >
            New ({placedCount})
          </button>
          <button
            onClick={() => setStatusFilter('Preparing')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'Preparing'
                ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
                : 'text-[#AAB3C5] hover:bg-[#151C30] hover:text-white'
            }`}
          >
            Preparing ({preparingCount})
          </button>
          <button
            onClick={() => setStatusFilter('Ready for Pickup')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'Ready for Pickup'
                ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
                : 'text-[#AAB3C5] hover:bg-[#151C30] hover:text-white'
            }`}
          >
            Ready ({readyCount})
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'ALL'
                ? 'bg-[#151C30] text-white border border-purple-500/30'
                : 'text-[#AAB3C5] hover:bg-[#151C30] hover:text-white'
            }`}
          >
            All History
          </button>
        </div>

        {/* Dedicated Single Express Counter Indicator */}
        <div className="flex items-center gap-2 shrink-0 bg-[#151C30] border border-purple-500/30 px-3 py-1.5 rounded-xl shadow-xs self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-[11px] sm:text-xs font-black text-slate-200">
            Pickup Counter: <span className="text-purple-300">Counter</span>
          </span>
        </div>
      </div>

      {/* 4. Orders Grid (Phone-Optimized Responsive Cards) */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 sm:py-20 text-center bg-[#1C263A]/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-purple-500/20 shadow-xl space-y-2 px-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#151C30] text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-white">Kitchen Queue Is Clear!</h3>
          <p className="text-xs text-[#AAB3C5]">All current orders have been processed and collected.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-5">
          {filteredOrders.map((order) => {
            const isPlaced = order.status === 'Placed';
            const isAccepted = order.status === 'Accepted';
            const isPreparing = order.status === 'Preparing';
            const isReady = order.status === 'Ready for Pickup';
            const isCompleted = order.status === 'Completed';
            const isCancelled = order.status === 'Cancelled';

            return (
              <div
                key={order.id || order._id}
                className={`rounded-2xl sm:rounded-3xl border-2 bg-[#1C263A]/90 backdrop-blur-xl p-4 sm:p-5 shadow-xl flex flex-col justify-between transition-all hover:border-purple-500/50 ${
                  isReady
                    ? 'border-emerald-500 shadow-emerald-500/20'
                    : isPreparing
                    ? 'border-blue-500'
                    : isPlaced
                    ? 'border-purple-500 animate-pulse'
                    : 'border-purple-500/20'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 gap-2">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#151C30] border border-purple-500/30 text-purple-300 flex flex-col items-center justify-center font-mono shrink-0">
                        <span className="text-[7px] sm:text-[8px] font-black uppercase text-[#AAB3C5]">TOKEN</span>
                        <span className="text-[11px] sm:text-xs font-black text-white">{order.tokenNumber}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-white truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">{order.studentName}</h4>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-0.5">
                          <span className="text-[9px] sm:text-[10px] text-purple-200 font-mono font-bold bg-[#151C30] px-1.5 py-0.5 rounded border border-purple-500/30">
                            {order.studentEnrollment || order.studentRoll || 'BTET25O1039'}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-purple-300 font-bold bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30 truncate max-w-[110px] xs:max-w-[150px]">
                            {order.studentDepartment && order.studentDepartment !== 'Campus'
                              ? order.studentDepartment
                              : 'Electronics & Telecom'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${
                          isReady
                            ? 'bg-emerald-500 text-white animate-pulse'
                            : isPreparing
                            ? 'bg-blue-600 text-white'
                            : isAccepted
                            ? 'bg-[#7955E8] text-white'
                            : isPlaced
                            ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white'
                            : isCancelled
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {order.status}
                      </span>
                      <p className="text-[9px] sm:text-[10px] text-[#AAB3C5] mt-1 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3 text-purple-400" />
                        {order.scheduledPickupTime || 'Immediate'}
                      </p>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="py-2.5 sm:py-3 space-y-1.5 border-b border-purple-500/20">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-[#151C30] border border-purple-500/20 font-black text-[10px] sm:text-[11px] text-purple-300 flex items-center justify-center shrink-0">
                            {item.quantity}x
                          </span>
                          <span className="font-extrabold text-white truncate">{item.name}</span>
                        </div>
                        <span className="font-bold text-[#AAB3C5] shrink-0 ml-2">₹{(item.price || 50) * item.quantity}</span>
                      </div>
                    ))}
                    {order.orderNotes && (
                      <p className="text-[10px] sm:text-[11px] text-purple-200 bg-[#151C30] p-1.5 rounded-lg italic border border-purple-500/20">
                        Note: {order.orderNotes}
                      </p>
                    )}
                  </div>

                  {/* Payment & Counter info */}
                  <div className="pt-2 flex items-center justify-between text-[10px] sm:text-[11px]">
                    <span className="text-[#AAB3C5]">
                      Pickup: <strong className="text-white">Counter</strong>
                    </span>
                    <span
                      className={`font-black ${
                        order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {order.paymentMethod === 'UPI' ? 'UPI (PAID)' : 'CASH (Collect ₹' + order.finalAmount + ')'}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons (Responsive & Touch-Friendly on Phones) */}
                <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-purple-500/20 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {isPlaced && (
                    <>
                      <button
                        onClick={() => handleDirectAccept(order)}
                        className="flex-1 min-w-[130px] py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
                        title="1-Click: Accept order and automatically send WhatsApp preparation time notification"
                      >
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Accept & WhatsApp</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAcceptModalOrder(order);
                          setCustomPrepMinutes(order.estimatedPrepMinutes || 15);
                        }}
                        className="p-2 sm:p-2.5 rounded-xl bg-[#151C30] hover:bg-[#25334d] text-purple-300 font-bold text-xs transition-colors cursor-pointer border border-purple-500/30 active:scale-95"
                        title="Set custom preparation minutes if needed"
                        aria-label="Custom Prep Time"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectModalOrder(order)}
                        className="py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs transition-colors cursor-pointer border border-red-500/30 active:scale-95"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {isAccepted && (
                    <button
                      onClick={() => handleAdvanceStatus(order)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/30 transition-all active:scale-95 cursor-pointer"
                    >
                      <ChefHat className="w-4 h-4 shrink-0" />
                      <span>Start Preparing (Deduct Stock)</span>
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      onClick={() => handleAdvanceStatus(order)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 shrink-0" />
                      <span>Mark Ready (WhatsApp Alert)</span>
                    </button>
                  )}

                  {isReady && (
                    <button
                      onClick={() => handleAdvanceStatus(order)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 transition-all active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Hand Over & Complete</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="w-full py-2 text-center text-xs font-bold text-[#AAB3C5] bg-[#151C30] rounded-xl border border-purple-500/20">
                      Order Picked Up & Completed
                    </div>
                  )}

                  {isCancelled && (
                    <div className="w-full py-2 text-center text-xs font-bold text-red-400 bg-red-500/15 rounded-xl border border-red-500/30">
                      Cancelled / Rejected
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4b. Accept Order & Send WhatsApp Time Alert Modal */}
      {acceptModalOrder && (() => {
        const cleanPhone = String(acceptModalOrder.studentPhone || '9876543210').replace(/\D/g, '');
        const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        const readyTimeObj = new Date(Date.now() + customPrepMinutes * 60 * 1000);
        const readyTimeStr = readyTimeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const itemsSummary = (acceptModalOrder.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ');
        const previewWhatsAppText = `🎉 *MITS Canteen Alert*\n\nHello *${acceptModalOrder.studentName || 'Student'}*!\nYour food order *#${acceptModalOrder.tokenNumber}* has been *ACCEPTED* by MITS Canteen! 👨‍🍳\n\n⏳ *Estimated Preparation Time:* ~${customPrepMinutes} Minutes\n⏰ *Expected Ready By:* ${readyTimeStr}\n📍 *Pickup Counter:* MITS Main Canteen (Counter, MITS Gwalior)\n🍽️ *Items:* ${itemsSummary}\n\nOur kitchen has started preparing your food fresh. You will receive another message as soon as your order is ready for pickup! 🚀`;
        const whatsappWebLink = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(previewWhatsAppText)}`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn text-white overflow-y-auto">
            <div className="bg-[#1C263A] rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-lg w-full shadow-2xl border border-purple-500/30 space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-lg font-black text-white tracking-tight truncate">
                      Accept Order & WhatsApp Alert
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#AAB3C5] truncate">
                      Token: <strong className="text-white font-mono">#{acceptModalOrder.tokenNumber}</strong> • {acceptModalOrder.studentName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAcceptModalOrder(null)}
                  className="text-[#AAB3C5] hover:text-white p-1.5 rounded-lg shrink-0 cursor-pointer"
                  aria-label="Close"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Prep Time Selector */}
              <div>
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#AAB3C5] block mb-2">
                  Estimated Preparation Time (Minutes)
                </label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[8, 12, 15, 20, 25].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setCustomPrepMinutes(mins)}
                      className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        customPrepMinutes === mins
                          ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white border-transparent shadow-md shadow-purple-500/30'
                          : 'bg-[#151C30] text-[#AAB3C5] border-purple-500/20 hover:bg-[#25334d] hover:text-white'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 bg-[#151C30] border border-purple-500/25 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-xs">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Custom:</span>
                    <input
                      type="number"
                      min="2"
                      max="90"
                      value={customPrepMinutes}
                      onChange={(e) => setCustomPrepMinutes(Math.max(1, Number(e.target.value)))}
                      className="w-16 px-2 py-1 rounded-lg border border-purple-500/30 text-xs font-black text-center bg-[#0B1020] text-white"
                    />
                    <span>mins</span>
                  </div>
                  <span className="text-[11px] font-black text-purple-300">
                    Ready by ~{readyTimeStr}
                  </span>
                </div>
              </div>

              {/* WhatsApp Message Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#AAB3C5] truncate">
                    WhatsApp Message Preview ({acceptModalOrder.studentPhone})
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                    Auto-Dispatched
                  </span>
                </div>
                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#0B1020] border border-purple-500/20 text-[11px] sm:text-xs text-slate-200 font-mono space-y-1.5 whitespace-pre-line leading-relaxed max-h-32 sm:max-h-40 overflow-y-auto">
                  {previewWhatsAppText.replace(/\*/g, '')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  onClick={() => setAcceptModalOrder(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-[#AAB3C5] hover:text-white hover:bg-[#151C30] cursor-pointer"
                >
                  Cancel
                </button>
                <a
                  href={whatsappWebLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-purple-500/30 bg-[#151C30] hover:bg-[#25334d] text-purple-300 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  WhatsApp Web
                </a>
                <button
                  onClick={handleConfirmAccept}
                  className="flex-1 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Accept & Send WhatsApp Alert
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 5. Reject Order Modal (Phone-Optimized) */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn text-white overflow-y-auto">
          <div className="bg-[#1C263A] rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-purple-500/30 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Reject Order #{rejectModalOrder.tokenNumber}
              </h3>
            </div>
            <p className="text-xs text-[#AAB3C5]">
              Select the reason why the kitchen cannot fulfill this order. The student will be notified immediately.
            </p>

            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-[#151C30] border border-purple-500/30 text-xs font-bold text-white focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="Ingredients temporarily unavailable">Ingredients temporarily unavailable</option>
              <option value="Counter closed for rush break">Counter closed for rush break</option>
              <option value="Duplicate or test order">Duplicate or test order</option>
              <option value="Kitchen deep cleaning in progress">Kitchen deep cleaning in progress</option>
            </select>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#AAB3C5] hover:text-white hover:bg-[#151C30] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md shadow-red-600/30 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Verified Token Modal (Phone-Optimized) */}
      {verifiedTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn text-white overflow-y-auto">
          <div className="bg-[#1C263A] rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-purple-500/30 space-y-4 text-center my-auto max-h-[92vh] overflow-y-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto font-black text-xl">
              ✓
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#AAB3C5]">
                VERIFIED TOKEN PASS
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                #{verifiedTokenModal.tokenNumber}
              </h3>
              <p className="text-xs font-extrabold text-purple-300 mt-1 leading-snug">
                Student: {verifiedTokenModal.studentName} • Enroll: {verifiedTokenModal.studentEnrollment || verifiedTokenModal.studentRoll} • {verifiedTokenModal.studentDepartment && verifiedTokenModal.studentDepartment !== 'Campus' ? verifiedTokenModal.studentDepartment : 'Electronics & Telecom'}
              </p>
            </div>

            <div className="bg-[#151C30] p-3 rounded-xl sm:rounded-2xl text-left text-xs space-y-1 border border-purple-500/20 max-h-36 overflow-y-auto">
              <span className="font-bold text-white block">Ordered Food:</span>
              {verifiedTokenModal.items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-[#AAB3C5]">
                  <span>{i.quantity}x {i.name}</span>
                  <span className="font-bold text-white">₹{(i.price || 50) * i.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setVerifiedTokenModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#151C30] hover:bg-[#25334d] text-white text-xs font-bold border border-purple-500/30 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  updateOrderStatus(verifiedTokenModal.id, 'Completed', user?.name || 'Counter Operator');
                  setVerifiedTokenModal(null);
                  alert(`Order #${verifiedTokenModal.tokenNumber} marked as completed and handed over!`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                Hand Over Food
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
