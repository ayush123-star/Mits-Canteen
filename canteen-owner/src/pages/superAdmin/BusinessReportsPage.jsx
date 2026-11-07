import React from 'react';
import { useData } from '../../context/DataContext';
import {
  BarChart3,
  Building2,
  TrendingUp,
  Star,
  ShieldCheck,
  AlertTriangle,
  Award,
  DollarSign,
  Layers,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

export const BusinessReportsPage = () => {
  const { canteens, orders } = useData();

  const totalCampusRevenue = canteens.reduce((sum, c) => sum + (c.todayRevenue || 0), 0);
  const totalMonthlyRunRate = canteens.reduce((sum, c) => sum + (c.totalMonthlyRevenue || 0), 0);
  const avgWastage = (
    canteens.reduce((sum, c) => sum + (c.wastagePercentage || 0), 0) / (canteens.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-white">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Multi-Canteen Business & Operational Performance
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
            Compare campus food court revenues, wastage ratios, and student satisfaction ratings across all college branches.
          </p>
        </div>
      </div>

      {/* 2. Strict Privacy Guard Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#1C263A]/90 backdrop-blur-xl text-white border border-purple-500/20 shadow-xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h3 className="font-extrabold text-white text-sm">
            Institutional Privacy & Commercial Isolation Protocol
          </h3>
          <p className="text-[#AAB3C5] leading-relaxed">
            As mandated by university governance rules, the Super Admin console displays high-level business velocity (sales, order throughput, average customer review scores, and raw material wastage). <strong>Canteen owners' personal communications, private bank credentials, personal files, and individual passwords are cryptographically shielded and never accessible.</strong>
          </p>
        </div>
      </div>

      {/* 3. Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1C263A]/90 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl">
          <p className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Today Total Campus GMV</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white">₹{totalCampusRevenue}</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-[#AAB3C5] mt-2">Aggregated across all campus locations</p>
        </div>

        <div className="bg-[#1C263A]/90 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl">
          <p className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Monthly Campus Sales Run-Rate</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-300">₹{totalMonthlyRunRate.toLocaleString()}</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Healthy campus commercial index
          </p>
        </div>

        <div className="bg-[#1C263A]/90 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl">
          <p className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Average Campus Food Wastage</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{avgWastage}%</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-emerald-400 font-bold mt-2">Below 3.0% green sustainability target</p>
        </div>
      </div>

      {/* 4. Comparative Canteens Table */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl overflow-hidden">
        <div className="p-4 bg-[#151C30]/80 border-b border-purple-500/20 flex items-center justify-between">
          <span className="text-xs font-black text-white uppercase tracking-wider">
            Canteen Operations & Commercial Benchmark Table
          </span>
          <span className="text-xs text-[#AAB3C5]">{canteens.length} Branches</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151C30]/80 text-[#AAB3C5] font-extrabold uppercase tracking-wider border-b border-purple-500/20">
              <tr>
                <th className="py-4 px-5">Canteen Branch</th>
                <th className="py-4 px-4">Location</th>
                <th className="py-4 px-4">Today Revenue</th>
                <th className="py-4 px-4">Today Orders</th>
                <th className="py-4 px-4">Monthly Total</th>
                <th className="py-4 px-4">Student Rating</th>
                <th className="py-4 px-5 text-right">Wastage %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10 font-medium">
              {canteens.map((c) => (
                <tr key={c.id} className="hover:bg-[#151C30]/60 transition-colors">
                  <td className="py-4 px-5">
                    <div>
                      <h4 className="font-black text-white">{c.name}</h4>
                      <span className="text-[10px] font-mono text-purple-400">{c.code} • Mgr: {c.managerName}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-slate-300">
                    {c.location}
                  </td>

                  <td className="py-4 px-4 font-mono font-black text-white text-sm">
                    ₹{c.todayRevenue}
                  </td>

                  <td className="py-4 px-4 font-mono font-bold text-purple-400">
                    {c.todayOrdersCount} orders
                  </td>

                  <td className="py-4 px-4 font-mono font-semibold text-slate-300">
                    ₹{c.totalMonthlyRevenue.toLocaleString()}
                  </td>

                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {c.rating} ({c.reviewCount})
                    </span>
                  </td>

                  <td className="py-4 px-5 text-right font-mono font-black text-emerald-400">
                    {c.wastagePercentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BusinessReportsPage;
