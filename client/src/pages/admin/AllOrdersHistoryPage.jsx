import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { SpotlightCard } from '../../components/common/SpotlightCard';
import {
  FileText,
  Calendar,
  Search,
  Filter,
  Download,
  Printer,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  DollarSign,
  UtensilsCrossed,
  Eye,
  RefreshCw,
  ArrowUpDown,
  Smartphone
} from 'lucide-react';

export const AllOrdersHistoryPage = () => {
  const { orders } = useData();

  // Filter States
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0 to 11

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState('ALL');
  const [quickPreset, setQuickPreset] = useState('ALL'); // 'ALL' | 'THIS_YEAR' | 'THIS_MONTH' | 'THIS_WEEK' | 'TODAY'
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);

  // Month Names mapping
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to extract reliable Date from order
  const getOrderDateObj = (order) => {
    if (!order) return new Date();
    if (order.createdAtDate) {
      const d = new Date(order.createdAtDate);
      if (!isNaN(d.getTime())) return d;
    }
    if (order.orderDate) {
      const d = new Date(order.orderDate);
      if (!isNaN(d.getTime())) return d;
    }
    if (order.date) {
      const d = new Date(order.date);
      if (!isNaN(d.getTime())) return d;
    }
    if (typeof order.id === 'string' && order.id.startsWith('ord-')) {
      const ts = parseInt(order.id.replace('ord-', ''), 10);
      if (!isNaN(ts) && ts > 1000000000000) return new Date(ts);
    }
    if (order.createdAt && (order.createdAt.includes('T') || order.createdAt.includes('-') || order.createdAt.includes('/'))) {
      const d = new Date(order.createdAt);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date(); // fallback to current session
  };

  // Quick Preset Click Handler
  const handleSelectPreset = (preset) => {
    setQuickPreset(preset);
    if (preset === 'ALL') {
      setSelectedYear('ALL');
      setSelectedMonth('ALL');
    } else if (preset === 'THIS_YEAR') {
      setSelectedYear(String(currentYear));
      setSelectedMonth('ALL');
    } else if (preset === 'THIS_MONTH') {
      setSelectedYear(String(currentYear));
      setSelectedMonth(String(currentMonth));
    } else if (preset === 'TODAY') {
      setSelectedYear(String(currentYear));
      setSelectedMonth(String(currentMonth));
    }
  };

  // Filtered Orders Computation
  const filteredOrders = useMemo(() => {
    const todayStr = new Date().toDateString();
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return orders.filter((order) => {
      const d = getOrderDateObj(order);
      const orderYear = d.getFullYear();
      const orderMonth = d.getMonth();

      // Quick Preset Filter
      if (quickPreset === 'THIS_YEAR' && orderYear !== currentYear) return false;
      if (quickPreset === 'THIS_MONTH' && (orderYear !== currentYear || orderMonth !== currentMonth)) return false;
      if (quickPreset === 'TODAY' && d.toDateString() !== todayStr) return false;
      if (quickPreset === 'THIS_WEEK' && d.getTime() < oneWeekAgo) return false;

      // Year Filter
      if (selectedYear !== 'ALL' && orderYear !== Number(selectedYear)) return false;

      // Month Filter
      if (selectedMonth !== 'ALL' && orderMonth !== Number(selectedMonth)) return false;

      // Status Filter
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'COMPLETED' && !['Completed', 'Collected'].includes(order.status)) return false;
        if (selectedStatus === 'ACTIVE' && !['Placed', 'Pending Acceptance', 'Accepted', 'Preparing', 'Ready for Pickup'].includes(order.status)) return false;
        if (selectedStatus === 'CANCELLED' && !['Cancelled', 'Rejected'].includes(order.status)) return false;
      }

      // Payment Method Filter
      if (selectedPayment !== 'ALL') {
        if (selectedPayment === 'UPI' && order.paymentMethod !== 'UPI') return false;
        if (selectedPayment === 'CASH' && order.paymentMethod === 'UPI') return false;
      }

      // Text Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const token = String(order.tokenNumber || '').toLowerCase();
        const student = String(order.studentName || '').toLowerCase();
        const roll = String(order.studentRoll || order.studentEnrollment || '').toLowerCase();
        const phone = String(order.studentPhone || '').toLowerCase();
        const items = (order.items || []).map((i) => i.name?.toLowerCase()).join(' ');
        const notes = String(order.orderNotes || '').toLowerCase();

        return (
          token.includes(q) ||
          student.includes(q) ||
          roll.includes(q) ||
          phone.includes(q) ||
          items.includes(q) ||
          notes.includes(q)
        );
      }

      return true;
    });
  }, [orders, selectedYear, selectedMonth, selectedStatus, selectedPayment, quickPreset, searchQuery, currentYear, currentMonth]);

  // Aggregate Metrics
  const totalCount = filteredOrders.length;
  const totalRevenue = filteredOrders
    .filter((o) => !['Cancelled', 'Rejected'].includes(o.status))
    .reduce((sum, o) => sum + (o.finalAmount || o.totalAmount || 0), 0);
  const completedCount = filteredOrders.filter((o) => ['Completed', 'Collected'].includes(o.status)).length;
  const upiCount = filteredOrders.filter((o) => o.paymentMethod === 'UPI').length;
  const cashCount = totalCount - upiCount;

  // Monthly Breakdown Map for Visualization
  const monthlySummary = useMemo(() => {
    const summary = {};
    orders.forEach((o) => {
      const d = getOrderDateObj(o);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!summary[key]) {
        summary[key] = { label: key, year: d.getFullYear(), month: d.getMonth(), count: 0, revenue: 0 };
      }
      summary[key].count += 1;
      if (!['Cancelled', 'Rejected'].includes(o.status)) {
        summary[key].revenue += (o.finalAmount || o.totalAmount || 0);
      }
    });
    return Object.values(summary).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [orders]);

  // CSV Export Function
  const exportToCSV = () => {
    const headers = [
      'Token Number',
      'Order ID',
      'Date & Time',
      'Student Name',
      'Roll Number',
      'Phone',
      'Department',
      'Items',
      'Kitchen Instructions',
      'Total Amount (INR)',
      'Payment Method',
      'Payment Status',
      'Order Status'
    ];

    const rows = filteredOrders.map((o) => {
      const d = getOrderDateObj(o);
      const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const itemsList = (o.items || []).map((i) => `${i.quantity}x ${i.name}`).join('; ');
      const prepNotes = o.orderNotes || '';

      return [
        `#${o.tokenNumber}`,
        o.orderNumber || o.orderId || o.id,
        dateStr,
        `"${(o.studentName || 'Student').replace(/"/g, '""')}"`,
        o.studentRoll || o.studentEnrollment || '',
        o.studentPhone || '',
        `"${(o.studentDepartment || 'Campus').replace(/"/g, '""')}"`,
        `"${itemsList.replace(/"/g, '""')}"`,
        `"${prepNotes.replace(/"/g, '""')}"`,
        o.finalAmount || o.totalAmount || 0,
        o.paymentMethod || 'UPI',
        o.paymentStatus || 'PAID',
        o.status || 'Placed'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mits-canteen-orders-${selectedYear}-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-white">
      {/* 1. Header with Breadcrumb and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span className="text-xs font-black uppercase tracking-wider text-purple-300">
              Master Order Log &bull; Records Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            All Orders Archive (Monthly & Yearly)
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
            Complete database of student food orders across all months and years with kitchen instructions and payments.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
            title="Download Excel / CSV of filtered orders"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-[#151C30] hover:bg-[#25334d] border border-purple-500/30 text-purple-300 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Log</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Metric Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Orders Card */}
        <SpotlightCard
          spotlightColor="rgba(121, 85, 232, 0.25)"
          className="p-4 rounded-2xl bg-[#1C263A]/85 border border-purple-500/20 shadow-xl"
        >
          <p className="text-[10px] sm:text-xs font-bold text-[#AAB3C5] uppercase tracking-wider">Filtered Orders</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-white">{totalCount}</span>
            <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm border border-purple-500/30">
              📋
            </span>
          </div>
          <p className="text-[10px] text-purple-300 font-semibold mt-1">
            All-Time Registered: {orders.length}
          </p>
        </SpotlightCard>

        {/* Total Revenue Card */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.25)"
          className="p-4 rounded-2xl bg-[#1C263A]/85 border border-purple-500/20 shadow-xl"
        >
          <p className="text-[10px] sm:text-xs font-bold text-[#AAB3C5] uppercase tracking-wider">Total Sales Volume</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">₹{totalRevenue.toLocaleString('en-IN')}</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
              ₹
            </span>
          </div>
          <p className="text-[10px] text-emerald-300/80 font-semibold mt-1">
            Valid processed orders
          </p>
        </SpotlightCard>

        {/* Completed Food Deliveries */}
        <SpotlightCard
          spotlightColor="rgba(59, 130, 246, 0.25)"
          className="p-4 rounded-2xl bg-[#1C263A]/85 border border-purple-500/20 shadow-xl"
        >
          <p className="text-[10px] sm:text-xs font-bold text-[#AAB3C5] uppercase tracking-wider">Completed / Handed Over</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-blue-400">{completedCount}</span>
            <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-sm border border-blue-500/30">
              ✓
            </span>
          </div>
          <p className="text-[10px] text-blue-300 font-semibold mt-1">
            Success Rate: {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100}%
          </p>
        </SpotlightCard>

        {/* Payment Channels */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.25)"
          className="p-4 rounded-2xl bg-[#1C263A]/85 border border-purple-500/20 shadow-xl"
        >
          <p className="text-[10px] sm:text-xs font-bold text-[#AAB3C5] uppercase tracking-wider">Payment Breakdown</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl sm:text-2xl font-black text-amber-300">{upiCount} UPI</span>
            <span className="text-xs font-bold text-slate-300">{cashCount} Cash</span>
          </div>
          <p className="text-[10px] text-[#AAB3C5] mt-1">
            {totalCount > 0 ? Math.round((upiCount / totalCount) * 100) : 0}% Digital Payments
          </p>
        </SpotlightCard>
      </div>

      {/* 3. Monthly Archive Summary Carousel / Pills */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#1C263A]/80 border border-purple-500/25 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-400" />
            Orders by Month (माह अनुसार रिकॉर्ड):
          </span>
          <span className="text-[11px] text-[#AAB3C5] font-semibold">
            Click any month to filter instantly
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {monthlySummary.map((m) => {
            const isSelected = selectedYear === String(m.year) && selectedMonth === String(m.month);
            return (
              <button
                key={`${m.year}-${m.month}`}
                onClick={() => {
                  setQuickPreset('CUSTOM');
                  setSelectedYear(String(m.year));
                  setSelectedMonth(String(m.month));
                }}
                className={`py-2 px-3.5 rounded-2xl text-left border transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] border-purple-400 text-white shadow-md shadow-purple-500/40 scale-105'
                    : 'bg-[#151C30] border-purple-500/20 hover:border-purple-500/40 hover:bg-[#25334d] text-[#AAB3C5]'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-xs font-black text-white">
                  <span>{m.label}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-black/40 text-[10px] text-purple-200">
                    {m.count} Orders
                  </span>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 font-bold mt-1">
                  ₹{m.revenue.toLocaleString('en-IN')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Filter Toolbar: Year, Month, Status, Payment, Search */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#151C30]/90 border border-purple-500/25 space-y-4 shadow-xl">
        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap pb-3 border-b border-purple-500/20">
          <span className="text-xs font-bold text-[#AAB3C5] flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            Quick Range:
          </span>
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'THIS_YEAR', label: `Year ${currentYear}` },
            { id: 'THIS_MONTH', label: `${monthNames[currentMonth]} ${currentYear}` },
            { id: 'THIS_WEEK', label: 'Past 7 Days' },
            { id: 'TODAY', label: 'Today Only' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                quickPreset === preset.id
                  ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white border-transparent shadow-md shadow-purple-500/30'
                  : 'bg-[#0B1020] text-[#AAB3C5] border-purple-500/20 hover:text-white hover:bg-[#1C263A]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Dropdowns & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AAB3C5]" />
            <input
              type="text"
              placeholder="Search by student, token #, roll, phone, or dish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1020] border border-purple-500/30 text-xs text-white placeholder-[#AAB3C5] focus:outline-none focus:border-purple-400 font-medium"
            />
          </div>

          {/* Year Dropdown */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setQuickPreset('CUSTOM');
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0B1020] border border-purple-500/30 text-xs font-bold text-white focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              <option value="ALL">📅 All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Month Dropdown */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setQuickPreset('CUSTOM');
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0B1020] border border-purple-500/30 text-xs font-bold text-white focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              <option value="ALL">🗓️ All Months</option>
              {monthNames.map((name, idx) => (
                <option key={idx} value={String(idx)}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0B1020] border border-purple-500/30 text-xs font-bold text-white focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              <option value="ALL">⚡ All Statuses</option>
              <option value="COMPLETED">✓ Completed & Collected</option>
              <option value="ACTIVE">⏳ Active / Preparing</option>
              <option value="CANCELLED">✗ Cancelled / Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Master Order History Table & Cards */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black text-white">
              Showing {filteredOrders.length} of {orders.length} Total Records
            </span>
            {searchQuery && (
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                Matches "{searchQuery}"
              </span>
            )}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto text-2xl border border-purple-500/30">
              📂
            </div>
            <h3 className="text-base font-extrabold text-white">No Orders Found</h3>
            <p className="text-xs text-[#AAB3C5] max-w-sm mx-auto">
              No food orders match your selected filters. Try choosing a different month, year, or clearing the search bar.
            </p>
            <button
              onClick={() => handleSelectPreset('ALL')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white text-xs font-black shadow-md shadow-purple-500/30 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#151C30]/80 text-[#AAB3C5] border-b border-purple-500/20 text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold">
                  <th className="py-3 px-4">Token & ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Student Diner</th>
                  <th className="py-3 px-4">Dishes & Kitchen Instructions</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {filteredOrders.map((order) => {
                  const d = getOrderDateObj(order);
                  const dateFormatted = d.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  const timeFormatted = d.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const isPaid = order.paymentStatus === 'PAID';
                  const isCompleted = ['Completed', 'Collected'].includes(order.status);
                  const isRejected = ['Rejected', 'Cancelled'].includes(order.status);

                  return (
                    <tr
                      key={order.id || order._id}
                      className="hover:bg-[#151C30]/50 transition-colors group"
                    >
                      {/* Token & Order Number */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-purple-300 bg-[#0B1020] px-2 py-0.5 rounded-lg border border-purple-500/30">
                            #{order.tokenNumber}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#AAB3C5] block mt-0.5">
                          {order.orderNumber || order.orderId || order.id}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-white block">{dateFormatted}</span>
                        <span className="text-[10px] text-purple-300 flex items-center gap-1 mt-0.5 font-mono">
                          <Clock className="w-3 h-3 text-purple-400" />
                          {timeFormatted}
                        </span>
                      </td>

                      {/* Student Details */}
                      <td className="py-3 px-4">
                        <span className="font-black text-white block truncate max-w-[150px]">
                          {order.studentName || 'Student Diner'}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#AAB3C5] mt-0.5">
                          <span className="font-mono font-bold text-purple-300">
                            {order.studentRoll || order.studentEnrollment || 'BTET25O1039'}
                          </span>
                        </div>
                        {order.studentPhone && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {order.studentPhone}
                          </span>
                        )}
                      </td>

                      {/* Dishes & Kitchen Instructions */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="space-y-1">
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="font-extrabold text-white">
                                {item.quantity}x {item.name}
                              </span>
                              {item.specialInstructions && (
                                <span className="text-[10px] text-amber-300 font-semibold block pl-2 border-l border-amber-500/40">
                                  ↳ {item.specialInstructions}
                                </span>
                              )}
                            </div>
                          ))}

                          {/* Overall Tray Notes */}
                          {order.orderNotes && (
                            <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-200 font-bold mt-1">
                              ⚠️ <span className="text-white font-extrabold">{order.orderNotes}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-sm font-black text-white block">
                          ₹{order.finalAmount || order.totalAmount || 0}
                        </span>
                        {order.discountAmount > 0 && (
                          <span className="text-[10px] text-emerald-400 block">
                            -₹{order.discountAmount} Off
                          </span>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {order.paymentMethod === 'UPI' ? 'UPI Online' : 'Cash'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isRejected
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-purple-600 text-white'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrderModal(order)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#0B1020] hover:bg-purple-600 hover:text-white text-purple-300 border border-purple-500/30 text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Detail View Modal */}
      {selectedOrderModal && (() => {
        const d = getOrderDateObj(selectedOrderModal);
        const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) + ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn text-white overflow-y-auto">
            <div className="bg-[#1C263A] rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-purple-500/30 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-black text-lg border border-purple-500/30">
                    #{selectedOrderModal.tokenNumber}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Order Details Archive</h3>
                    <p className="text-xs text-[#AAB3C5] font-mono">{selectedOrderModal.orderNumber || selectedOrderModal.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrderModal(null)}
                  className="p-1.5 rounded-lg text-[#AAB3C5] hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Timestamp & Status */}
              <div className="p-3 rounded-xl bg-[#151C30] border border-purple-500/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#AAB3C5] block">Order Timestamp:</span>
                  <span className="font-bold text-white">{dateStr}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-600 text-white">
                  {selectedOrderModal.status}
                </span>
              </div>

              {/* Customer Info */}
              <div className="p-3.5 rounded-xl bg-[#151C30] border border-purple-500/20 text-xs space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#AAB3C5] block">Customer Credentials:</span>
                <p className="text-sm font-black text-white">{selectedOrderModal.studentName}</p>
                <div className="grid grid-cols-2 gap-2 text-[#AAB3C5] text-[11px] pt-1">
                  <div>Roll: <strong className="text-white">{selectedOrderModal.studentRoll || selectedOrderModal.studentEnrollment || 'N/A'}</strong></div>
                  <div>Phone: <strong className="text-white">{selectedOrderModal.studentPhone || 'N/A'}</strong></div>
                  <div className="col-span-2">Email: <strong className="text-white">{selectedOrderModal.studentEmail || 'campus@mitsgwl.ac.in'}</strong></div>
                </div>
              </div>

              {/* Kitchen Instructions if any */}
              {selectedOrderModal.orderNotes && (
                <div className="p-3 rounded-xl bg-amber-500/15 border-2 border-amber-500/40 text-xs">
                  <span className="text-[10px] uppercase font-black text-amber-400 block">⚠️ Kitchen Cooking Instructions:</span>
                  <p className="text-white font-extrabold mt-0.5">{selectedOrderModal.orderNotes}</p>
                </div>
              )}

              {/* Items List */}
              <div className="p-3.5 rounded-xl bg-[#151C30] border border-purple-500/20 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-[#AAB3C5] block">Items Ordered:</span>
                {selectedOrderModal.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between border-b border-purple-500/10 pb-1.5 last:border-none">
                    <div>
                      <span className="font-bold text-white">{it.quantity}x {it.name}</span>
                      {it.specialInstructions && (
                        <p className="text-[10px] text-amber-300 font-semibold pl-2">↳ {it.specialInstructions}</p>
                      )}
                    </div>
                    <span className="font-bold text-white">₹{(it.price || 50) * it.quantity}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between text-sm font-black text-emerald-400 border-t border-purple-500/20">
                  <span>Total Final Amount:</span>
                  <span>₹{selectedOrderModal.finalAmount || selectedOrderModal.totalAmount}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedOrderModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#151C30] hover:bg-[#25334d] text-white text-xs font-bold border border-purple-500/30 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white text-xs font-black shadow-md shadow-purple-500/30 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AllOrdersHistoryPage;
