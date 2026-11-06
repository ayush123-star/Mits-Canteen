import React from 'react';
import { useData } from '../../context/DataContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Award,
  Users,
  DollarSign,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Flame,
  CheckCircle2
} from 'lucide-react';

export const AdminReportsPage = () => {
  const { orders, menuItems } = useData();

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

  // Top Selling Dishes
  const itemCounts = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const key = item.name;
      itemCounts[key] = (itemCounts[key] || 0) + item.quantity;
    });
  });

  const topDishes = Object.entries(itemCounts)
    .map(([name, count]) => {
      const menuItem = menuItems.find((m) => m.name === name);
      return {
        name,
        count,
        price: menuItem?.price || 60,
        totalSales: count * (menuItem?.price || 60),
        image: menuItem?.image,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Hourly rush estimates
  const hourlyRush = [
    { slot: '08:00 AM - 09:30 AM', label: 'Morning Breakfast Rush', pct: 65, orders: 38 },
    { slot: '10:15 AM - 10:45 AM', label: '10:30 AM Short Recess Break', pct: 95, orders: 74 },
    { slot: '12:45 PM - 01:45 PM', label: 'Lunch Break Peak Surge', pct: 100, orders: 112 },
    { slot: '03:15 PM - 03:45 PM', label: 'Afternoon Tea Break', pct: 70, orders: 49 },
    { slot: '04:30 PM - 06:30 PM', label: 'Evening Hostellers Snack', pct: 55, orders: 32 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-white">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Canteen Sales Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
            Real-time insights on campus break rush volumes, revenue performance, and high-velocity food items.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-black flex items-center gap-1.5 shadow-md">
            <Calendar className="w-3.5 h-3.5" />
            Today's Live Window
          </span>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1C263A]/90 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl">
          <p className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Gross Revenue</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white privacy-sensitive" title="Protected by Privacy Shield">₹{totalRevenue}</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +18.4% compared to yesterday
          </p>
        </div>

        <div className="bg-[#1C263A]/90 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl">
          <p className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Orders Dispatched</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{orders.length}</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-[#AAB3C5] mt-2">98.2% on-time pickup rate</p>
        </div>

        <div className="bg-[#1C263A]/90 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl">
          <p className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Average Prep Time</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white">7.2 mins</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-emerald-400 font-bold mt-2">Under 8 min SLA benchmark</p>
        </div>

        <div className="bg-[#1C263A]/90 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl">
          <p className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Queue Time Saved</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {Math.round((orders.length * 14) / 60)} hrs
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-[#AAB3C5] mt-2">Campus productivity gained</p>
        </div>
      </div>

      {/* 3. Two-Column Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Hourly Rush Breakdown */}
        <div className="lg:col-span-7 bg-[#1C263A]/90 backdrop-blur-xl p-6 rounded-3xl border border-purple-500/20 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Peak Campus Break Rush Distribution
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#151C30] border border-purple-500/20 text-[#AAB3C5] px-2.5 py-1 rounded-full">
              Class Schedule Synced
            </span>
          </div>

          <div className="space-y-4">
            {hourlyRush.map((slot, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-white">{slot.label} ({slot.slot})</span>
                  <span className="font-mono text-purple-400">{slot.orders} orders</span>
                </div>
                <div className="h-3 w-full bg-[#151C30] rounded-full overflow-hidden border border-purple-500/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      slot.pct >= 90
                        ? 'bg-gradient-to-r from-red-500 via-purple-500 to-[#526DFF]'
                        : slot.pct >= 70
                        ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF]'
                        : 'bg-purple-600/70'
                    }`}
                    style={{ width: `${slot.pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Leaderboard */}
        <div className="lg:col-span-5 bg-[#1C263A]/90 backdrop-blur-xl p-6 rounded-3xl border border-purple-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-purple-400" />
              Top Velocity Dishes
            </h2>
            <span className="text-xs font-bold text-[#AAB3C5]">Ranked by volume</span>
          </div>

          <div className="divide-y divide-purple-500/10">
            {topDishes.map((dish, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#7955E8] to-[#526DFF] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-white">{dish.name}</h4>
                    <p className="text-[11px] text-[#AAB3C5]">{dish.count} ordered today</p>
                  </div>
                </div>
                <span className="font-mono font-black text-white">₹{dish.totalSales}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
