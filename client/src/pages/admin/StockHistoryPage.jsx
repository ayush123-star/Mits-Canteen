import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  History,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  Calendar,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export const StockHistoryPage = () => {
  const { stockTransactions } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const filteredTransactions = stockTransactions.filter((tx) => {
    if (selectedType !== 'ALL' && tx.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchItem = tx.inventoryItem?.toLowerCase().includes(q);
      const matchRef = tx.reference?.toLowerCase().includes(q);
      const matchActor = tx.actor?.toLowerCase().includes(q);
      if (!matchItem && !matchRef && !matchActor) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-white">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            Stock History & Consumption Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
            Complete immutable ledger of raw material movements: wholesale inward restocks, recipe-based automatic deductions, and damage calibrations.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting Stock History Ledger CSV to Downloads...')}
          className="px-4 py-2.5 rounded-2xl bg-[#1C263A] border border-purple-500/20 hover:bg-[#151C30] text-[#AAB3C5] hover:text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          Export Audit CSV
        </button>
      </div>

      {/* 2. Filters & Search */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl p-4 rounded-3xl border border-purple-500/20 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#AAB3C5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search material name, order token #TK-101 or actor..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedType === 'ALL'
                ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/20'
                : 'bg-[#151C30] text-[#AAB3C5] hover:text-white border border-purple-500/20'
            }`}
          >
            All Movements
          </button>
          <button
            onClick={() => setSelectedType('STOCK_IN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedType === 'STOCK_IN'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-[#151C30] text-[#AAB3C5] hover:text-white border border-purple-500/20'
            }`}
          >
            Inward Restock
          </button>
          <button
            onClick={() => setSelectedType('RECIPE_DEDUCTION')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedType === 'RECIPE_DEDUCTION'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-[#151C30] text-[#AAB3C5] hover:text-white border border-purple-500/20'
            }`}
          >
            Recipe Deductions
          </button>
          <button
            onClick={() => setSelectedType('MANUAL_ADJUSTMENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedType === 'MANUAL_ADJUSTMENT'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-[#151C30] text-[#AAB3C5] hover:text-white border border-purple-500/20'
            }`}
          >
            Adjustments
          </button>
        </div>
      </div>

      {/* 3. Transactions Table */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151C30]/80 text-[#AAB3C5] font-extrabold uppercase tracking-wider border-b border-purple-500/20">
              <tr>
                <th className="py-4 px-5">Time</th>
                <th className="py-4 px-4">Raw Material</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Delta Qty</th>
                <th className="py-4 px-4">Balance After</th>
                <th className="py-4 px-4">Reference</th>
                <th className="py-4 px-5 text-right">Initiated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#AAB3C5]">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isAdd = tx.type === 'STOCK_IN' || tx.quantity > 0;

                  return (
                    <tr key={tx.id} className="hover:bg-[#151C30]/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-[#AAB3C5] text-[11px]">
                        {tx.timestamp}
                      </td>

                      <td className="py-3.5 px-4 font-black text-white">
                        {tx.inventoryItem}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            tx.type === 'STOCK_IN'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : tx.type === 'RECIPE_DEDUCTION'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>

                      <td
                        className={`py-3.5 px-4 font-mono font-black text-sm ${
                          isAdd ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity} {tx.unit}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                        {tx.balanceAfter} {tx.unit}
                      </td>

                      <td className="py-3.5 px-4 text-[#AAB3C5] truncate max-w-[200px]">
                        {tx.reference || 'N/A'}
                      </td>

                      <td className="py-3.5 px-5 text-right font-semibold text-[#AAB3C5] text-[11px]">
                        {tx.actor}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockHistoryPage;
