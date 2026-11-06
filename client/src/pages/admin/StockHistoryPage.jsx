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
  FileSpreadsheet,
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  ListOrdered,
  ChefHat,
  Boxes
} from 'lucide-react';

export const StockHistoryPage = () => {
  const { stockTransactions = [], inventoryItems = [] } = useData();

  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'ledger'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedMaterialFilter, setSelectedMaterialFilter] = useState('ALL');

  // Compute Item-by-Item Statistics: Used vs Remaining
  const materialStats = inventoryItems.map((inv) => {
    const itemTxs = stockTransactions.filter((tx) =>
      tx.inventoryItem?.toLowerCase().trim() === inv.name?.toLowerCase().trim()
    );

    const totalDeducted = itemTxs
      .filter((tx) => tx.type === 'RECIPE_DEDUCTION' || tx.quantity < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.quantity || 0), 0);

    const totalAdded = itemTxs
      .filter((tx) => tx.type === 'STOCK_IN' || (tx.type !== 'RECIPE_DEDUCTION' && tx.quantity > 0))
      .reduce((sum, tx) => sum + Math.abs(tx.quantity || 0), 0);

    const currentLeft = Number(inv.currentQuantity || 0);
    const minLevel = Number(inv.minimumStockLevel || 0);
    const isLow = currentLeft <= minLevel;

    // Approximate total base for visual progress
    const totalBase = Math.max(currentLeft + totalDeducted, minLevel * 2, 1);
    const percentLeft = Math.min(100, Math.max(0, Math.round((currentLeft / totalBase) * 100)));

    return {
      ...inv,
      totalDeducted: Number(totalDeducted.toFixed(3)),
      totalAdded: Number(totalAdded.toFixed(3)),
      currentLeft: Number(currentLeft.toFixed(3)),
      isLow,
      percentLeft,
      txCount: itemTxs.length,
    };
  });

  // Filtered transactions for the Audit Ledger
  const filteredTransactions = stockTransactions.filter((tx) => {
    if (selectedType !== 'ALL' && tx.type !== selectedType) return false;
    if (
      selectedMaterialFilter !== 'ALL' &&
      tx.inventoryItem?.toLowerCase().trim() !== selectedMaterialFilter.toLowerCase().trim()
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchItem = tx.inventoryItem?.toLowerCase().includes(q);
      const matchRef = tx.reference?.toLowerCase().includes(q);
      const matchActor = tx.actor?.toLowerCase().includes(q);
      if (!matchItem && !matchRef && !matchActor) return false;
    }
    return true;
  });

  // Filtered materials for the Summary View
  const filteredMaterialStats = materialStats.filter((mat) => {
    if (
      selectedMaterialFilter !== 'ALL' &&
      mat.name.toLowerCase().trim() !== selectedMaterialFilter.toLowerCase().trim()
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        mat.name.toLowerCase().includes(q) ||
        (mat.category && mat.category.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // High-level Metrics
  const totalRecipeDeductionsCount = stockTransactions.filter((tx) => tx.type === 'RECIPE_DEDUCTION').length;
  const totalRestocksCount = stockTransactions.filter((tx) => tx.type === 'STOCK_IN').length;
  const lowStockCount = inventoryItems.filter((i) => i.currentQuantity <= i.minimumStockLevel).length;

  // Real CSV Export Function
  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'Raw Material',
      'Movement Type',
      'Used or Added (Delta Qty)',
      'Remaining Balance After',
      'Unit',
      'Reference / Order',
      'Initiated By',
    ];
    const rows = filteredTransactions.map((tx) => [
      `"${tx.timestamp}"`,
      `"${tx.inventoryItem}"`,
      `"${tx.type}"`,
      tx.quantity,
      tx.balanceAfter,
      `"${tx.unit}"`,
      `"${tx.reference || 'N/A'}"`,
      `"${tx.actor || 'System'}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `mits_canteen_stock_audit_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 text-white">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center shrink-0">
              <History className="w-5 h-5 text-white" />
            </div>
            <span>Stock History & Audit Trail</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
            Track exact raw material usage in orders, automatic recipe deductions, and remaining live balances.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#1C263A] border border-purple-500/20 hover:bg-[#151C30] text-[#AAB3C5] hover:text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* 2. Top Summary Metric Cards (Quick Answer to "Kitna Use Hua & Kitna Bacha") */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Tracked Items */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Pantry Items</p>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-3xl font-black text-white">{inventoryItems.length}</span>
            <span className="text-xs text-[#AAB3C5] ml-1.5 font-semibold">raw materials</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-emerald-400 font-bold mt-1">Live tracking active</p>
        </div>

        {/* Card 2: Consumed in Kitchen (Use Hua) */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-wider">Used in Orders</p>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs border border-amber-500/30">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-3xl font-black text-amber-300">{totalRecipeDeductionsCount}</span>
            <span className="text-xs text-[#AAB3C5] ml-1.5 font-semibold">order deductions</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#AAB3C5] font-semibold mt-1">Auto-deducted per plate</p>
        </div>

        {/* Card 3: Inward Wholesale Restocked */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Restocked In</p>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-3xl font-black text-emerald-400">{totalRestocksCount}</span>
            <span className="text-xs text-[#AAB3C5] ml-1.5 font-semibold">supplier batches</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#AAB3C5] font-semibold mt-1">Wholesale inward stock</p>
        </div>

        {/* Card 4: Low Stock Warnings */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-[11px] font-bold text-purple-300 uppercase tracking-wider">Low Stock Alert</p>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-red-500/20 text-red-300 flex items-center justify-center font-bold text-xs border border-red-500/30">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-1">
            <span className={`text-xl sm:text-3xl font-black ${lowStockCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {lowStockCount}
            </span>
            <span className="text-xs text-[#AAB3C5] ml-1.5 font-semibold">items to reorder</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#AAB3C5] font-semibold mt-1">
            {lowStockCount > 0 ? 'Near critical threshold' : 'All stocks optimal'}
          </p>
        </div>
      </div>

      {/* 3. Main Navigation Tab Switcher */}
      <div className="flex items-center gap-2 p-1 bg-[#151C30] border border-purple-500/20 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
              : 'text-[#AAB3C5] hover:text-white'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Usage & Balance Tracker</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
              : 'text-[#AAB3C5] hover:text-white'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Movement Audit Trail ({filteredTransactions.length})</span>
        </button>
      </div>

      {/* 4. Filters & Search Toolbar */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-purple-500/20 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#AAB3C5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search raw material name, order token #TK-101 or actor..."
            className="w-full pl-10 pr-4 py-2 rounded-xl sm:rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0 scroll-smooth -mx-1 px-1">
          {activeTab === 'ledger' && (
            <>
              <button
                onClick={() => setSelectedType('ALL')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedType === 'ALL'
                    ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md'
                    : 'bg-[#151C30] text-[#AAB3C5] hover:text-white border border-purple-500/20'
                }`}
              >
                All Movements
              </button>
              <button
                onClick={() => setSelectedType('RECIPE_DEDUCTION')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedType === 'RECIPE_DEDUCTION'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-[#151C30] text-[#AAB3C5] hover:text-white border border-purple-500/20'
                }`}
              >
                Recipe Deductions (Used)
              </button>
              <button
                onClick={() => setSelectedType('STOCK_IN')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedType === 'STOCK_IN'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-[#151C30] text-[#AAB3C5] hover:text-white border border-purple-500/20'
                }`}
              >
                Inward Restock (Added)
              </button>
              <button
                onClick={() => setSelectedType('MANUAL_ADJUSTMENT')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedType === 'MANUAL_ADJUSTMENT'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-[#151C30] text-[#AAB3C5] hover:text-white border border-purple-500/20'
                }`}
              >
                Adjustments
              </button>
            </>
          )}

          {/* Quick Raw Material Selector Dropdown */}
          <select
            value={selectedMaterialFilter}
            onChange={(e) => setSelectedMaterialFilter(e.target.value)}
            className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold bg-[#151C30] text-[#AAB3C5] hover:text-white border border-purple-500/20 focus:outline-none focus:border-[#7955E8] cursor-pointer"
          >
            <option value="ALL">All Raw Materials ({inventoryItems.length})</option>
            {inventoryItems.map((inv) => (
              <option key={inv.id} value={inv.name}>
                {inv.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. TAB 1: Item-Wise Stock & Consumption Summary (HOW MUCH WAS USED vs HOW MUCH IS LEFT) */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#AAB3C5] px-1">
            <span className="font-bold uppercase tracking-wider text-[11px] text-purple-300">
              Raw Material Consumption vs Live Balance Matrix
            </span>
            <span>Showing {filteredMaterialStats.length} materials</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredMaterialStats.map((item) => {
              const isLow = item.isLow;
              const hasUsed = item.totalDeducted > 0;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl sm:rounded-3xl bg-[#1C263A]/90 backdrop-blur-xl p-4 sm:p-5 border shadow-xl transition-all hover:border-purple-500/50 flex flex-col justify-between ${
                    isLow
                      ? 'border-red-500/40 shadow-red-500/10'
                      : 'border-purple-500/20'
                  }`}
                >
                  <div>
                    {/* Item Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-purple-500/20 gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                          {item.category || 'Raw Material'}
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-white mt-1 truncate">
                          {item.name}
                        </h3>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                          isLow
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isLow ? 'Low Stock' : 'Optimal'}
                      </span>
                    </div>

                    {/* TWO PRIMARY METRIC BOXES: USED vs LEFT */}
                    <div className="grid grid-cols-2 gap-2.5 py-3">
                      {/* Box 1: Kitna Use Hua (Consumed) */}
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3 text-amber-400" />
                          <span>Use Hua (Orders)</span>
                        </span>
                        <p className="text-lg font-black text-amber-300 mt-0.5">
                          {hasUsed ? `-${item.totalDeducted}` : '0'}{' '}
                          <span className="text-xs font-bold text-amber-400/80">{item.unit}</span>
                        </p>
                        <span className="text-[9px] text-[#AAB3C5] block mt-0.5 truncate">
                          Auto-deducted
                        </span>
                      </div>

                      {/* Box 2: Kitna Bacha Hai (Remaining Balance) */}
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                          <Package className="w-3 h-3 text-emerald-400" />
                          <span>Abhi Bacha Hai</span>
                        </span>
                        <p className="text-lg font-black text-emerald-300 mt-0.5">
                          {item.currentLeft}{' '}
                          <span className="text-xs font-bold text-emerald-400/80">{item.unit}</span>
                        </p>
                        <span className="text-[9px] text-[#AAB3C5] block mt-0.5 truncate">
                          Available balance
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar of Stock Health */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#AAB3C5] font-semibold">Stock Health Level:</span>
                        <span className={`font-black ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                          {item.percentLeft}% Left
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#151C30] overflow-hidden border border-purple-500/20">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isLow
                              ? 'bg-gradient-to-r from-red-600 to-red-400'
                              : 'bg-gradient-to-r from-[#7955E8] to-emerald-400'
                          }`}
                          style={{ width: `${Math.max(5, item.percentLeft)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Details */}
                  <div className="pt-3 mt-3 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-[#AAB3C5]">
                    <span>
                      Min Alert: <strong className="text-white">{item.minimumStockLevel} {item.unit}</strong>
                    </span>
                    <span>
                      Restocked: <strong className="text-emerald-300">+{item.totalAdded} {item.unit}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. TAB 2: Immutable Movement Audit Ledger (EVERY ORDER TRANSACTION) */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#AAB3C5] px-1">
            <span className="font-bold uppercase tracking-wider text-[11px] text-purple-300">
              Transaction History (Order Deductions & Restocks)
            </span>
            <span>{filteredTransactions.length} movements recorded</span>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="py-16 text-center bg-[#1C263A]/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-purple-500/20 shadow-xl space-y-2 px-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-base font-extrabold text-white">No Transactions Found</h3>
              <p className="text-xs text-[#AAB3C5]">No stock movements match current search criteria.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View (Hidden on mobile phones) */}
              <div className="hidden md:block bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#151C30]/80 text-[#AAB3C5] font-extrabold uppercase tracking-wider border-b border-purple-500/20">
                      <tr>
                        <th className="py-4 px-5">Time</th>
                        <th className="py-4 px-4">Raw Material</th>
                        <th className="py-4 px-4">Action Type</th>
                        <th className="py-4 px-4">Kitna Use / Add Hua</th>
                        <th className="py-4 px-4">Balance Bacha</th>
                        <th className="py-4 px-4">Order / Reference</th>
                        <th className="py-4 px-5 text-right">Initiated By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10 font-medium">
                      {filteredTransactions.map((tx) => {
                        const isAdd = tx.type === 'STOCK_IN' || tx.quantity > 0;
                        const isRecipe = tx.type === 'RECIPE_DEDUCTION';

                        return (
                          <tr key={tx.id} className="hover:bg-[#151C30]/60 transition-colors">
                            <td className="py-3.5 px-5 font-mono text-[#AAB3C5] text-[11px] whitespace-nowrap">
                              {tx.timestamp}
                            </td>

                            <td className="py-3.5 px-4 font-black text-white">
                              {tx.inventoryItem}
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  isAdd
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : isRecipe
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                }`}
                              >
                                {isRecipe ? '🔻 RECIPE USE' : isAdd ? '📥 STOCK IN' : '⚙️ ADJUSTMENT'}
                              </span>
                            </td>

                            <td
                              className={`py-3.5 px-4 font-mono font-black text-sm whitespace-nowrap ${
                                isAdd ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity} {tx.unit}
                            </td>

                            <td className="py-3.5 px-4 font-mono font-black text-sm text-white whitespace-nowrap">
                              {tx.balanceAfter} <span className="text-xs text-[#AAB3C5] font-normal">{tx.unit}</span>
                            </td>

                            <td className="py-3.5 px-4 text-purple-200 truncate max-w-[220px]">
                              {tx.reference || 'N/A'}
                            </td>

                            <td className="py-3.5 px-5 text-right font-semibold text-[#AAB3C5] text-[11px] whitespace-nowrap">
                              {tx.actor}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Phone Card View (Optimized for small screens) */}
              <div className="block md:hidden space-y-3">
                {filteredTransactions.map((tx) => {
                  const isAdd = tx.type === 'STOCK_IN' || tx.quantity > 0;
                  const isRecipe = tx.type === 'RECIPE_DEDUCTION';

                  return (
                    <div
                      key={tx.id}
                      className="rounded-2xl bg-[#1C263A]/90 backdrop-blur-xl p-4 border border-purple-500/20 shadow-md space-y-2.5"
                    >
                      {/* Top: Material + Time */}
                      <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                        <div>
                          <h4 className="text-sm font-black text-white">{tx.inventoryItem}</h4>
                          <span className="text-[10px] text-[#AAB3C5] font-mono">{tx.timestamp}</span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isAdd
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isRecipe
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {isRecipe ? '🔻 RECIPE' : isAdd ? '📥 STOCK IN' : '⚙️ ADJUST'}
                        </span>
                      </div>

                      {/* Middle: Delta Qty (Used) vs Balance After (Bacha) */}
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-[#151C30] border border-purple-500/20">
                          <span className="text-[10px] text-[#AAB3C5] block font-semibold">
                            {isAdd ? 'Maal Aaya (+)' : 'Kharch Hua (-)'}
                          </span>
                          <span
                            className={`text-sm font-black font-mono ${
                              isAdd ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity} {tx.unit}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-[#151C30] border border-purple-500/20">
                          <span className="text-[10px] text-[#AAB3C5] block font-semibold">
                            Abhi Bacha Hai
                          </span>
                          <span className="text-sm font-black font-mono text-white">
                            {tx.balanceAfter} {tx.unit}
                          </span>
                        </div>
                      </div>

                      {/* Bottom: Reference & Initiator */}
                      <div className="text-[11px] text-[#AAB3C5] flex items-center justify-between pt-1">
                        <span className="text-purple-300 truncate max-w-[180px]">
                          {tx.reference || 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {tx.actor}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StockHistoryPage;
