import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useSocket } from '../../context/SocketContext';
import { playNotificationSound } from '../../utils/audio';
import { sendBrowserNotification } from '../../utils/browserNotifications';
import { OrderStatusStepper } from '../../components/OrderStatusStepper';
import { SpotlightCard } from '../../components/common/SpotlightCard';
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
  Send,
  FileText
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { orders, updateOrderStatus, updateOrderPrepTime, rejectOrder, cancelOrder, feedbackList } = useData();
  const { socket, isConnected } = useSocket();

  const [searchToken, setSearchToken] = useState('');
  const [selectedCounter, setSelectedCounter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('Item Out of Stock');
  const [acceptModalOrder, setAcceptModalOrder] = useState(null);
  const [customPrepMinutes, setCustomPrepMinutes] = useState(15);
  const [verifiedTokenModal, setVerifiedTokenModal] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [orderPrepTimes, setOrderPrepTimes] = useState({});
  const [prepTimeFeedback, setPrepTimeFeedback] = useState(null);
  const prevCountRef = useRef(orders.length);

  // Instant notification when a new order arrives via state changes
  useEffect(() => {
    if (orders.length > prevCountRef.current) {
      const latest = orders[0];
      if (latest && (latest.status === 'Placed' || latest.status === 'Pending Acceptance')) {
        setNewOrderAlert(latest);
        playNotificationSound('new_order');
        sendBrowserNotification(`New Incoming Order #${latest.tokenNumber}`, {
          body: `${latest.studentName || 'Student'} placed an order (₹${latest.finalAmount || latest.totalAmount || 0})`,
          icon: '/images/mits/mits-logo.png',
        });
        setTimeout(() => setNewOrderAlert(null), 12000);
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
      sendBrowserNotification(`New Incoming Order #${ord.tokenNumber}`, {
        body: `${ord.studentName || 'Student'} placed an order (₹${ord.finalAmount || ord.totalAmount || 0})`,
        icon: '/images/mits/mits-logo.png',
      });
      setTimeout(() => setNewOrderAlert(null), 12000);
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
      const matchToken = ord.tokenNumber?.toLowerCase().includes(q);
      const matchId = ord.id?.toLowerCase().includes(q) || ord.orderNumber?.toLowerCase().includes(q) || ord.orderId?.toLowerCase().includes(q);
      const matchName = ord.studentName?.toLowerCase().includes(q);
      const matchPhone = ord.studentPhone?.includes(q);
      const matchEmail = ord.studentEmail?.toLowerCase().includes(q);
      if (!matchToken && !matchId && !matchName && !matchPhone && !matchEmail) return false;
    }

    // Counter
    if (selectedCounter !== 'ALL') {
      if (String(ord.assignedCounter) !== String(selectedCounter)) return false;
    }

    // Status tabs
    if (statusFilter === 'ACTIVE') {
      return ['Placed', 'Pending Acceptance', 'Accepted', 'Preparing', 'Ready for Pickup'].includes(ord.status);
    } else if (statusFilter === 'NEW') {
      return ['Placed', 'Pending Acceptance'].includes(ord.status);
    } else if (statusFilter === 'ACCEPTED') {
      return ord.status === 'Accepted';
    } else if (statusFilter === 'PREPARING') {
      return ['Accepted', 'Preparing'].includes(ord.status);
    } else if (statusFilter === 'READY') {
      return ord.status === 'Ready for Pickup';
    } else if (statusFilter === 'COMPLETED') {
      return ['Completed', 'Collected'].includes(ord.status);
    } else if (statusFilter === 'REJECTED') {
      return ['Rejected', 'Cancelled'].includes(ord.status);
    }

    return true; // 'ALL'
  });

  // Helper to determine if an order was placed today (1 single day)
  const isOrderFromToday = (ord) => {
    if (!ord) return false;
    const todayStr = new Date().toDateString();

    if (ord.createdAtDate) {
      return new Date(ord.createdAtDate).toDateString() === todayStr;
    }
    if (ord.createdDate) {
      return new Date(ord.createdDate).toDateString() === todayStr;
    }
    if (ord.date) {
      return new Date(ord.date).toDateString() === todayStr;
    }
    if (ord.orderDate) {
      return new Date(ord.orderDate).toDateString() === todayStr;
    }

    if (typeof ord.id === 'string' && ord.id.startsWith('ord-')) {
      const ts = parseInt(ord.id.replace('ord-', ''), 10);
      if (!isNaN(ts) && ts > 1000000000000) {
        return new Date(ts).toDateString() === todayStr;
      }
    }

    if (ord.createdAt && (ord.createdAt.includes('T') || ord.createdAt.includes('-') || ord.createdAt.includes('/'))) {
      const d = new Date(ord.createdAt);
      if (!isNaN(d.getTime())) {
        return d.toDateString() === todayStr;
      }
    }

    // Default for orders created during current session with simple time string e.g. "01:45 AM"
    if (ord.createdAt && typeof ord.createdAt === 'string' && (ord.createdAt.includes('AM') || ord.createdAt.includes('PM'))) {
      return true;
    }

    return false;
  };

  // Calculate quick metrics strictly for TODAY (1 single day) vs status pipelines
  const todayOrders = orders.filter(isOrderFromToday);
  const totalOrdersToday = todayOrders.length;
  const newOrdersCount = orders.filter((o) => ['Placed', 'Pending Acceptance'].includes(o.status)).length;
  const acceptedOrdersCount = orders.filter((o) => o.status === 'Accepted').length;
  const preparingCount = orders.filter((o) => o.status === 'Preparing').length;
  const readyCount = orders.filter((o) => o.status === 'Ready for Pickup').length;
  const completedCount = orders.filter((o) => ['Completed', 'Collected'].includes(o.status)).length;
  const rejectedCount = orders.filter((o) => ['Rejected', 'Cancelled'].includes(o.status)).length;
  const totalRevenueToday = todayOrders
    .filter((o) => !['Cancelled', 'Rejected'].includes(o.status))
    .reduce((sum, o) => sum + (o.finalAmount || o.totalAmount || 0), 0);

  const getExpectedReadyTime = (mins) => {
    const m = Math.max(1, Number(mins) || 15);
    return new Date(Date.now() + m * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSelectCardPrepTime = (order, mins) => {
    const validMins = Math.max(1, Number(mins) || 10);
    const key = order.id || order._id || order.orderId || order.tokenNumber;
    setOrderPrepTimes((prev) => ({ ...prev, [key]: validMins }));
  };

  const handleApplyPrepTimeUpdate = (order) => {
    const key = order.id || order._id || order.orderId || order.tokenNumber;
    const mins = Number(orderPrepTimes[key] || order.estimatedPrepMinutes || 15);
    const actor = user?.name || 'Canteen Owner';
    updateOrderPrepTime(key, mins, actor);
    setPrepTimeFeedback({ orderId: key, text: `Prep time updated to ~${mins} mins!` });
    setTimeout(() => setPrepTimeFeedback(null), 3000);
  };

  // Direct 1-Click Accept with Customized Preparation Time & Automated WhatsApp Notification
  const handleDirectAccept = (order, customMinutes) => {
    const actor = user?.name || 'Canteen Owner';
    const key = order.id || order._id || order.orderId || order.tokenNumber;
    const estMins = Number(customMinutes || orderPrepTimes[key] || order.estimatedPrepMinutes || 15);
    updateOrderStatus(key, 'Accepted', actor, {
      estimatedMinutes: estMins,
      note: `Order accepted. Kitchen is preparing your food (~${estMins}m)`,
    });
    // Smooth transition: if owner was on NEW filter, switch to ACTIVE so order remains visible with START PREPARING button!
    if (statusFilter === 'NEW') {
      setStatusFilter('ACTIVE');
    }
  };

  const handleAdvanceStatus = (order) => {
    const actor = user?.name || 'Canteen Owner';
    const orderId = order.id || order._id || order.orderId || order.tokenNumber;
    if (order.status === 'Placed' || order.status === 'Pending Acceptance') {
      const key = orderId;
      const estMins = Number(orderPrepTimes[key] || order.estimatedPrepMinutes || 15);
      handleDirectAccept(order, estMins);
    } else if (order.status === 'Accepted') {
      updateOrderStatus(orderId, 'Preparing', actor);
    } else if (order.status === 'Preparing') {
      updateOrderStatus(orderId, 'Ready for Pickup', actor);
    } else if (order.status === 'Ready for Pickup') {
      updateOrderStatus(orderId, 'Completed', actor);
    }
  };

  const handleConfirmAccept = () => {
    if (!acceptModalOrder) return;
    const actor = user?.name || 'Canteen Owner';
    updateOrderStatus(acceptModalOrder.id || acceptModalOrder._id, 'Accepted', actor, {
      estimatedMinutes: customPrepMinutes,
      note: `Order accepted with custom prep time: ${customPrepMinutes} mins. WhatsApp alert dispatched!`,
    });
    setAcceptModalOrder(null);
  };

  const handleConfirmReject = () => {
    if (!rejectModalOrder) return;
    rejectOrder(rejectModalOrder.id || rejectModalOrder._id, rejectReason);
    setRejectModalOrder(null);
  };

  const handleVerifyTokenSubmit = (e) => {
    e.preventDefault();
    if (!searchToken.trim()) return;
    const cleanQ = searchToken.replace('#', '').trim().toLowerCase();
    const found = orders.find(
      (o) =>
        String(o.tokenNumber || '').toLowerCase().includes(cleanQ) ||
        (Array.isArray(o.tokens) && o.tokens.some((t) => String(t || '').replace('#', '').trim().toLowerCase() === cleanQ)) ||
        (Array.isArray(o.items) && o.items.some((i) => String(i.tokenNumber || i.itemToken || '').replace('#', '').trim().toLowerCase() === cleanQ)) ||
        String(o.id || '').toLowerCase() === cleanQ ||
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
              {newOrderAlert.orderNotes && (
                <div className="mt-1.5 p-1.5 rounded-lg bg-black/40 border border-amber-400/50 text-[11px] text-amber-200 font-bold flex items-center gap-1.5">
                  <span className="text-amber-400 shrink-0">⚠️</span>
                  <span className="truncate">Kitchen: <strong className="text-white">{newOrderAlert.orderNotes}</strong></span>
                </div>
              )}
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

      {/* 2. Stat Metric Cards (6 Dedicated Cards matching exact specifications) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {/* Card 1: Today's Total Orders */}
        <SpotlightCard
          spotlightColor="rgba(255, 120, 68, 0.2)"
          className="p-3 sm:p-4 rounded-2xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-[#AAB3C5] uppercase tracking-wider truncate">Today's Orders</p>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded">1 Day</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black text-white">{totalOrdersToday}</span>
            <span className="w-7 h-7 rounded-lg bg-[#151C30] text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">
              📊
            </span>
          </div>
          <p className="text-[9px] text-[#AAB3C5] mt-1 truncate">
            Today: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        </SpotlightCard>

        {/* Card 2: Pending Orders */}
        <SpotlightCard
          spotlightColor="rgba(239, 68, 68, 0.25)"
          className="p-3 sm:p-4 rounded-2xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl cursor-pointer hover:border-purple-500/50 transition-all"
          onClick={() => setStatusFilter('NEW')}
        >
          <p className="text-[10px] font-bold text-purple-200 uppercase tracking-wider truncate">Pending Orders</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black text-purple-300">{newOrdersCount}</span>
            <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">
              🔔
            </span>
          </div>
        </SpotlightCard>

        {/* Card 3: Preparing Orders */}
        <SpotlightCard
          spotlightColor="rgba(59, 130, 246, 0.25)"
          className="p-3 sm:p-4 rounded-2xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl cursor-pointer hover:border-blue-500/50 transition-all"
          onClick={() => setStatusFilter('PREPARING')}
        >
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider truncate">Preparing Orders</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black text-blue-400">{preparingCount + acceptedOrdersCount}</span>
            <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs border border-blue-500/30">
              👨‍🍳
            </span>
          </div>
        </SpotlightCard>

        {/* Card 4: Ready for Pickup */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.25)"
          className="p-3 sm:p-4 rounded-2xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl cursor-pointer hover:border-emerald-500/50 transition-all"
          onClick={() => setStatusFilter('READY')}
        >
          <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider truncate">Ready for Pickup</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-400">{readyCount}</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">
              📦
            </span>
          </div>
        </SpotlightCard>

        {/* Card 5: Completed Orders */}
        <SpotlightCard
          spotlightColor="rgba(20, 184, 166, 0.25)"
          className="p-3 sm:p-4 rounded-2xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl cursor-pointer hover:border-teal-500/50 transition-all"
          onClick={() => setStatusFilter('COMPLETED')}
        >
          <p className="text-[10px] font-bold text-teal-200 uppercase tracking-wider truncate">Completed Orders</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black text-teal-300">{completedCount}</span>
            <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs border border-teal-500/30">
              ✅
            </span>
          </div>
        </SpotlightCard>

        {/* Card 6: Today's Revenue */}
        <SpotlightCard
          spotlightColor="rgba(168, 85, 247, 0.35)"
          className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-xl shadow-purple-500/30"
        >
          <p className="text-[10px] font-bold text-purple-200 uppercase tracking-wider truncate">Today's Revenue</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black privacy-sensitive" title="Hover to view (Protected by Privacy Shield)">₹{totalRevenueToday}</span>
            <DollarSign className="w-5 h-5 text-purple-200" />
          </div>
        </SpotlightCard>
      </div>

      {/* 3. Filters Bar (6 Dedicated Sections + All History) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1C263A]/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-purple-500/20 shadow-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 scroll-smooth -mx-1 px-1">
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
                : 'text-[#AAB3C5] hover:bg-[#151C30] hover:text-white'
            }`}
          >
            {activeOrders.length > 0 && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>}
            Active Kitchen ({activeOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter('NEW')}
            className={`whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'NEW'
                ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
                : 'text-[#AAB3C5] hover:bg-[#151C30] hover:text-white'
            }`}
          >
            {newOrdersCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>}
            1. Order Placed ({newOrdersCount})
          </button>
          <button
            onClick={() => setStatusFilter('ACCEPTED')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'ACCEPTED'
                ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
                : 'text-[#AAB3C5] hover:bg-[#151C30] hover:text-white'
            }`}
          >
            2. Accepted ({acceptedOrdersCount})
          </button>
          <button
            onClick={() => setStatusFilter('PREPARING')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'PREPARING'
                ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
                : 'text-[#AAB3C5] hover:bg-[#151C30] hover:text-white'
            }`}
          >
            3. Preparing ({preparingCount})
          </button>
          <button
            onClick={() => setStatusFilter('READY')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'READY'
                ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
                : 'text-[#AAB3C5] hover:bg-[#151C30] hover:text-white'
            }`}
          >
            {readyCount > 0 && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
            4. Ready for Pickup ({readyCount})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'COMPLETED'
                ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
                : 'text-[#AAB3C5] hover:bg-[#151C30] hover:text-white'
            }`}
          >
            5. Collected ({completedCount})
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'REJECTED'
                ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md shadow-red-500/30'
                : 'text-[#AAB3C5] hover:bg-[#151C30] hover:text-white'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#151C30] text-white border border-purple-500/30'
                : 'text-[#AAB3C5] hover:bg-[#151C30] hover:text-white'
            }`}
          >
            All Live ({orders.length})
          </button>
        </div>

        {/* Link to Full Monthly & Yearly Archive */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/orders"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-black transition-all shadow-sm shrink-0"
            title="Open Complete Month & Year Order Archive"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>All Orders Archive (Month & Year) &rarr;</span>
          </Link>

          {/* Dedicated Single Express Counter Indicator */}
          <div className="hidden sm:flex items-center gap-2 shrink-0 bg-[#151C30] border border-purple-500/30 px-3 py-1.5 rounded-xl shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[11px] sm:text-xs font-black text-slate-200">
              Pickup Counter: <span className="text-purple-300">Counter</span>
            </span>
          </div>
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
            const isPlaced = order.status === 'Placed' || order.status === 'Pending Acceptance';
            const isAccepted = order.status === 'Accepted';
            const isPreparing = order.status === 'Preparing';
            const isReady = order.status === 'Ready for Pickup';
            const isCompleted = order.status === 'Completed' || order.status === 'Collected';
            const isRejected = order.status === 'Rejected';
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
                    ? 'border-purple-500 ring-2 ring-purple-500/30'
                    : isRejected
                    ? 'border-red-500/30'
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
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-black text-white truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">{order.studentName}</h4>
                          <span className="text-[9px] font-mono text-[#AAB3C5]">#{order.orderNumber || order.orderId || order.id}</span>
                        </div>
                        <p className="text-[10px] text-[#AAB3C5] truncate mt-0.5">{order.studentEmail || 'student@mitsgwl.ac.in'}</p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-1">
                          <span className="text-[9px] sm:text-[10px] text-purple-200 font-mono font-bold bg-[#151C30] px-1.5 py-0.5 rounded border border-purple-500/30">
                            {order.studentEnrollment || order.studentRoll || 'BTET25O1039'}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-purple-300 font-bold bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30 truncate max-w-[110px] xs:max-w-[150px]">
                            {order.studentDepartment && order.studentDepartment !== 'Campus'
                              ? order.studentDepartment
                              : 'Electronics & Telecom'}
                          </span>
                          {order.studentPhone && (
                            <span className="text-[9px] font-mono text-slate-300 bg-[#151C30] px-1.5 py-0.5 rounded border border-purple-500/20">
                              {order.studentPhone}
                            </span>
                          )}
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
                            ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white animate-pulse'
                            : isRejected
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : isCancelled
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-teal-600 text-white'
                        }`}
                      >
                        {order.status}
                      </span>
                      <p className="text-[9px] sm:text-[10px] text-[#AAB3C5] mt-1 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3 text-purple-400" />
                        {order.createdAt || order.scheduledPickupTime || 'Immediate'}
                      </p>
                    </div>
                  </div>

                  {/* Real-time Order Progress Stepper (Same 5 Steps as Student My Orders) */}
                  <div className="py-1 px-2 my-2.5 rounded-xl bg-[#151C30]/60 border border-purple-500/20">
                    <OrderStatusStepper currentStatus={order.status} />
                  </div>

                  {/* Items list */}
                  <div className="py-2.5 sm:py-3 space-y-2 border-b border-purple-500/20">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-md bg-[#151C30] border border-purple-500/20 font-black text-[10px] sm:text-[11px] text-purple-300 flex items-center justify-center shrink-0">
                              {item.quantity}x
                            </span>
                            <span className="font-extrabold text-white truncate">{item.name}</span>
                            {(item.tokenNumber || item.itemToken) && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-500/25 text-purple-300 border border-purple-500/40 font-mono font-black text-[10px] shrink-0" title="Item's Permanent Unique Token">
                                #{item.tokenNumber || item.itemToken}
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-[#AAB3C5] shrink-0 ml-2">₹{(item.price || 50) * item.quantity}</span>
                        </div>
                        {item.specialInstructions && (
                          <div className="ml-7 p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-300 font-bold flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200 font-black">
                              Chef Alert
                            </span>
                            <span className="text-white leading-tight">{item.specialInstructions}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Overall Order / Tray Kitchen Preferences */}
                    {order.orderNotes && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/15 border-2 border-amber-500/40 text-xs shadow-sm">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 flex items-center gap-1.5">
                            <span>⚠️</span> Customer Kitchen Instructions:
                          </span>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-400/30">
                            High Priority
                          </span>
                        </div>
                        <p className="text-white font-black text-xs leading-snug">
                          {order.orderNotes}
                        </p>
                      </div>
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
                      {order.paymentMethod === 'UPI' ? 'UPI (PAID)' : 'CASH (Collect ₹' + (order.finalAmount || order.totalAmount) + ')'}
                    </span>
                  </div>
                </div>

                {/* Preparation Time Configuration Box (For Placed, Accepted, and Preparing Orders) */}
                {['Placed', 'Pending Acceptance', 'Accepted', 'Preparing'].includes(order.status) && (() => {
                  const orderKey = order.id || order._id || order.orderId || order.tokenNumber;
                  const selectedPrepMins = Number(orderPrepTimes[orderKey] || order.estimatedPrepMinutes || 15);
                  return (
                    <div className="mt-3 p-2.5 sm:p-3 rounded-2xl bg-[#0E1424] border border-purple-500/30 space-y-2 shadow-inner">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-purple-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          Set Preparation Time:
                        </span>
                        <span className="text-xs font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg font-mono">
                          ~{selectedPrepMins} Mins
                          <span className="text-[10px] text-slate-300 font-semibold ml-1.5">
                            (Ready ~{getExpectedReadyTime(selectedPrepMins)})
                          </span>
                        </span>
                      </div>

                      {/* Fast Preset Minutes Selector */}
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                        {[5, 8, 10, 15, 20, 25, 30].map((mins) => {
                          const isCurrent = selectedPrepMins === mins;
                          return (
                            <button
                              key={mins}
                              type="button"
                              onClick={() => handleSelectCardPrepTime(order, mins)}
                              className={`py-1 px-2 sm:px-2.5 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                                isCurrent
                                  ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white border-purple-400 shadow-md shadow-purple-500/40 scale-105'
                                  : 'bg-[#151C30] text-[#AAB3C5] border-purple-500/20 hover:text-white hover:bg-[#25334d]'
                              }`}
                            >
                              {mins}m
                            </button>
                          );
                        })}

                        {/* Custom minute input box */}
                        <div className="flex items-center gap-1 ml-auto bg-[#151C30] border border-purple-500/30 rounded-lg px-2 py-0.5">
                          <span className="text-[10px] text-slate-400 font-bold">Custom:</span>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={selectedPrepMins}
                            onChange={(e) => handleSelectCardPrepTime(order, Math.max(1, Number(e.target.value)))}
                            className="w-9 sm:w-10 text-center text-xs font-black bg-transparent text-white focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-400 font-bold">mins</span>
                        </div>
                      </div>

                      {/* If order is already Accepted or Preparing, allow instant time update with 1-click */}
                      {['Accepted', 'Preparing'].includes(order.status) && (
                        <div className="flex items-center justify-between pt-1.5 border-t border-purple-500/20">
                          <span className="text-[10px] text-[#AAB3C5]">
                            Adjust prep time for student live pass:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleApplyPrepTimeUpdate(order)}
                            className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            Update Time
                          </button>
                        </div>
                      )}

                      {prepTimeFeedback?.orderId === orderKey && (
                        <p className="text-[10px] text-emerald-400 font-bold animate-fadeIn">
                          ✓ {prepTimeFeedback.text}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Card Action Buttons (Responsive & Touch-Friendly on Phones) */}
                <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-purple-500/20 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {isPlaced && (() => {
                    const orderKey = order.id || order._id || order.orderId || order.tokenNumber;
                    const selectedPrepMins = Number(orderPrepTimes[orderKey] || order.estimatedPrepMinutes || 15);
                    return (
                      <>
                        <button
                          onClick={() => handleDirectAccept(order, selectedPrepMins)}
                          className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
                          title={`Accept order and notify student (~${selectedPrepMins} mins)`}
                        >
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">ACCEPT ORDER (~{selectedPrepMins}m)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAcceptModalOrder(order);
                            setCustomPrepMinutes(selectedPrepMins);
                          }}
                          className="p-2 sm:p-2.5 rounded-xl bg-[#151C30] hover:bg-[#25334d] text-purple-300 font-bold text-xs transition-colors cursor-pointer border border-purple-500/30 active:scale-95 flex items-center gap-1"
                          title="Fine-tune prep time & WhatsApp Preview"
                          aria-label="Fine-tune prep time & WhatsApp Preview"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[11px]">Options</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectModalOrder(order)}
                          className="py-2.5 px-3 rounded-xl bg-red-600/25 hover:bg-red-600/40 text-red-200 font-black text-xs transition-colors cursor-pointer border border-red-500/40 active:scale-95"
                        >
                          REJECT
                        </button>
                      </>
                    );
                  })()}

                  {isAccepted && (
                    <div className="w-full flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] text-purple-200 font-bold px-1">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          Step 2: Order Accepted
                        </span>
                        <span className="text-amber-300 font-mono">
                          ~{order.estimatedPrepMinutes || 15}m prep (Ready ~{order.estimatedReadyTime || getExpectedReadyTime(order.estimatedPrepMinutes || 15)})
                        </span>
                      </div>
                      <button
                        onClick={() => handleAdvanceStatus(order)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/30 transition-all active:scale-95 cursor-pointer"
                      >
                        <ChefHat className="w-4 h-4 shrink-0" />
                        <span>PREPARE ORDER</span>
                      </button>
                    </div>
                  )}

                  {isPreparing && (
                    <div className="w-full flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] text-blue-200 font-bold px-1">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                          Step 3: Food Preparing
                        </span>
                        <span className="text-amber-300 font-mono">
                          ~{order.estimatedPrepMinutes || 15}m prep (Ready ~{order.estimatedReadyTime || getExpectedReadyTime(order.estimatedPrepMinutes || 15)})
                        </span>
                      </div>
                      <button
                        onClick={() => handleAdvanceStatus(order)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                      >
                        <Bell className="w-4 h-4 shrink-0" />
                        <span>READY FOR PICKUP</span>
                      </button>
                    </div>
                  )}

                  {isReady && (
                    <div className="w-full flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] text-emerald-300 font-black px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          📢 Calling on Live TV Display
                        </span>
                        <span className="text-emerald-200 font-mono">Token #{order.tokenNumber}</span>
                      </div>
                      <button
                        onClick={() => handleAdvanceStatus(order)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 transition-all active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>COLLECTED</span>
                      </button>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="w-full py-2 text-center text-xs font-black text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/30 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Collected & Completed
                    </div>
                  )}

                  {isRejected && (
                    <div className="w-full py-2 text-center text-xs font-bold text-red-300 bg-red-500/15 rounded-xl border border-red-500/30">
                      Rejected by Canteen: {order.rejectionReason || 'Item Out of Stock'}
                    </div>
                  )}

                  {isCancelled && (
                    <div className="w-full py-2 text-center text-xs font-bold text-amber-300 bg-amber-500/15 rounded-xl border border-amber-500/30">
                      Cancelled by Student: {order.cancellationReason || 'Student request'}
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
        const prepNotesText = acceptModalOrder.orderNotes ? `\n📌 *Kitchen Instructions:* ${acceptModalOrder.orderNotes}` : '';
        const previewWhatsAppText = `🎉 *MITS Canteen Alert*\n\nHello *${acceptModalOrder.studentName || 'Student'}*!\nYour food order *#${acceptModalOrder.tokenNumber}* has been *ACCEPTED* by MITS Canteen! 👨‍🍳\n\n⏳ *Estimated Preparation Time:* ~${customPrepMinutes} Minutes\n⏰ *Expected Ready By:* ${readyTimeStr}\n📍 *Pickup Counter:* MITS Main Canteen (Counter, MITS Gwalior)\n🍽️ *Items:* ${itemsSummary}${prepNotesText}\n\nOur kitchen has started preparing your food fresh according to your preferences. You will receive another message as soon as your order is ready for pickup! 🚀`;
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

              {/* Kitchen Preparation Instructions Box */}
              {(acceptModalOrder.orderNotes || acceptModalOrder.items?.some(i => i.specialInstructions)) && (
                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <span>⚠️</span> Customer Cooking Instructions
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-500/40">
                      Check Before Cooking
                    </span>
                  </div>

                  {acceptModalOrder.orderNotes && (
                    <div className="text-xs">
                      <span className="text-[10px] font-bold text-amber-300 uppercase block">Tray Customizations:</span>
                      <p className="text-white font-black text-xs mt-0.5">{acceptModalOrder.orderNotes}</p>
                    </div>
                  )}

                  {acceptModalOrder.items?.filter(i => i.specialInstructions).map((item, idx) => (
                    <div key={idx} className="text-xs border-t border-amber-500/20 pt-1.5 mt-1.5">
                      <span className="text-[10px] font-bold text-amber-300 uppercase block">{item.name}:</span>
                      <p className="text-white font-bold mt-0.5">{item.specialInstructions}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Prep Time Selector */}
              <div>
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#AAB3C5] block mb-2">
                  Estimated Preparation Time (Minutes)
                </label>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {[5, 8, 10, 15, 20, 25, 30].map((mins) => (
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
              <option value="Item Out of Stock">Item Out of Stock</option>
              <option value="Kitchen Busy / High Wait Time">Kitchen Busy / High Wait Time</option>
              <option value="Canteen Closing Soon">Canteen Closing Soon</option>
              <option value="Ingredients temporarily unavailable">Ingredients temporarily unavailable</option>
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

            <div className="bg-[#151C30] p-3 sm:p-3.5 rounded-xl sm:rounded-2xl text-left text-xs space-y-2 border border-purple-500/20 max-h-48 overflow-y-auto">
              <span className="font-bold text-white block">Ordered Food:</span>
              {verifiedTokenModal.items.map((i, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between items-center text-[#AAB3C5]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-medium text-white">{i.quantity}x {i.name}</span>
                      {(i.tokenNumber || i.itemToken) && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/25 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-black shrink-0">
                          #{i.tokenNumber || i.itemToken}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-purple-300 shrink-0 ml-2">₹{(i.price || 50) * i.quantity}</span>
                  </div>
                  {i.specialInstructions && (
                    <p className="text-[11px] text-amber-300 font-semibold pl-3 border-l-2 border-amber-400/40">
                      ↳ {i.specialInstructions}
                    </p>
                  )}
                </div>
              ))}

              {verifiedTokenModal.orderNotes && (
                <div className="mt-2 pt-2 border-t border-purple-500/20 bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
                  <span className="text-[10px] font-black uppercase text-amber-400 block">
                    ⚠️ Verified Cooking Specs:
                  </span>
                  <span className="text-xs text-white font-extrabold block mt-0.5">
                    {verifiedTokenModal.orderNotes}
                  </span>
                </div>
              )}
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
