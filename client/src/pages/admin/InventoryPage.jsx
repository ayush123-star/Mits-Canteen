import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Plus,
  AlertTriangle,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  Package,
  Layers,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';

export const InventoryPage = () => {
  const { user } = useAuth();
  const { inventoryItems, addStock, adjustStock } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Modals
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState(null);

  // Stock In Form
  const [stockInForm, setStockInForm] = useState({
    inventoryId: inventoryItems[0]?.id || '',
    quantity: '',
    supplier: 'Metro Cash & Carry Wholesale',
    price: '',
    notes: '',
  });

  // Stock Adjust Form
  const [adjustForm, setAdjustForm] = useState({
    inventoryId: inventoryItems[0]?.id || '',
    quantity: '',
    reason: 'Wastage / Shelf Spoilage',
    notes: '',
  });

  const lowStockItems = inventoryItems.filter(
    (i) => i.currentQuantity <= i.minimumStockLevel
  );

  const categories = ['ALL', ...new Set(inventoryItems.map((i) => i.category))];

  const filteredItems = inventoryItems.filter((item) => {
    if (filterLowStockOnly && item.currentQuantity > item.minimumStockLevel) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      if (!item.name.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleStockInSubmit = (e) => {
    e.preventDefault();
    if (!stockInForm.quantity || Number(stockInForm.quantity) <= 0) {
      alert('Please enter a valid positive quantity');
      return;
    }
    addStock(
      stockInForm.inventoryId,
      Number(stockInForm.quantity),
      stockInForm.supplier,
      Number(stockInForm.price || 0),
      stockInForm.notes
    );
    setIsStockInModalOpen(false);
    setStockInForm({
      inventoryId: inventoryItems[0]?.id || '',
      quantity: '',
      supplier: 'Metro Cash & Carry Wholesale',
      price: '',
      notes: '',
    });
  };

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    if (!adjustForm.quantity || Number(adjustForm.quantity) === 0) {
      alert('Please enter a non-zero adjustment quantity');
      return;
    }
    adjustStock(
      adjustForm.inventoryId,
      Number(adjustForm.quantity),
      adjustForm.reason,
      adjustForm.notes,
      user?.name || 'Inventory Admin'
    );
    setIsAdjustModalOpen(false);
  };

  const openQuickStockIn = (item) => {
    setStockInForm({
      inventoryId: item.id,
      quantity: '',
      supplier: item.supplier || 'Campus Wholesale Mart',
      price: '',
      notes: `Quick restock for ${item.name}`,
    });
    setIsStockInModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-white">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            Raw Material Inventory & Stock Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
            Track flour, paneer, dairy, fresh veggies, and packaging. Automatically deducted by recipe formulas when kitchen prepares food.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAdjustModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#1C263A] border border-purple-500/20 hover:bg-[#151C30] text-[#AAB3C5] hover:text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            Audit Adjustment
          </button>
          <button
            onClick={() => setIsStockInModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Inward Stock (Restock)
          </button>
        </div>
      </div>

      {/* 2. Low-Stock Warning Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white">
                {lowStockItems.length} Raw Material(s) Running Below Critical Safety Levels!
              </h3>
              <p className="text-[11px] text-amber-300/80">
                Materials like <strong className="underline text-amber-200">{lowStockItems.map((i) => i.name).join(', ')}</strong> need restocking to avoid dish unavailability.
              </p>
            </div>
          </div>

          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black self-start sm:self-auto shrink-0 transition-colors shadow-md"
          >
            {filterLowStockOnly ? 'Show All Materials' : 'Filter Low Stock SKUs'}
          </button>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl p-4 rounded-3xl border border-purple-500/20 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#AAB3C5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search raw material name, category or supplier..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-[#AAB3C5] shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/20'
                  : 'bg-[#151C30] text-[#AAB3C5] hover:text-white border border-purple-500/20 hover:border-purple-500/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Inventory Table */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151C30]/80 text-[#AAB3C5] font-extrabold uppercase tracking-wider border-b border-purple-500/20">
              <tr>
                <th className="py-4 px-5">Material Item</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Current Stock</th>
                <th className="py-4 px-4">Min. Threshold</th>
                <th className="py-4 px-4">Stock Health</th>
                <th className="py-4 px-4">Supplier</th>
                <th className="py-4 px-5 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {filteredItems.map((item) => {
                const isLow = item.currentQuantity <= item.minimumStockLevel;
                const ratio = Math.min(100, Math.round((item.currentQuantity / (item.minimumStockLevel * 2.5)) * 100));

                return (
                  <tr key={item.id} className="hover:bg-[#151C30]/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isLow ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-[#151C30] text-purple-300 border border-purple-500/20'
                          }`}
                        >
                          📦
                        </div>
                        <div>
                          <h4 className="font-black text-white">{item.name}</h4>
                          <span className="text-[10px] text-[#AAB3C5] font-mono">ID: {item.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#151C30] border border-purple-500/20 text-[#AAB3C5]">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-black text-white text-sm">
                      {item.currentQuantity} <span className="text-xs font-sans text-[#AAB3C5]">{item.unit}</span>
                    </td>

                    <td className="py-3.5 px-4 text-[#AAB3C5] font-mono">
                      {item.minimumStockLevel} {item.unit}
                    </td>

                    {/* Stock Health Bar & Badge */}
                    <td className="py-3.5 px-4">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                          <span className={isLow ? 'text-amber-400' : 'text-emerald-400'}>
                            {isLow ? 'Low Stock' : 'Optimal'}
                          </span>
                          <span className="text-[#AAB3C5]">{ratio}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#151C30] rounded-full overflow-hidden border border-purple-500/10">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isLow ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-[#526DFF]'
                            }`}
                            style={{ width: `${ratio}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[#AAB3C5] truncate max-w-[140px]">
                      {item.supplier || 'Campus Mart'}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => openQuickStockIn(item)}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-extrabold text-[11px] transition-colors inline-flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                        Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Inward Stock (Stock In) Modal */}
      {isStockInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1C263A] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-500/20 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                Inward Stock (Restock Entry)
              </h3>
              <button
                onClick={() => setIsStockInModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151C30] hover:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-[#AAB3C5] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStockInSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Select Raw Material Item
                </label>
                <select
                  value={stockInForm.inventoryId}
                  onChange={(e) => setStockInForm({ ...stockInForm, inventoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-bold focus:outline-none focus:border-[#7955E8]"
                >
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id} className="bg-[#151C30] text-white">
                      {item.name} (Current: {item.currentQuantity} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Quantity Added
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="0.1"
                    value={stockInForm.quantity}
                    onChange={(e) => setStockInForm({ ...stockInForm, quantity: e.target.value })}
                    placeholder="e.g. 15"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Total Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={stockInForm.price}
                    onChange={(e) => setStockInForm({ ...stockInForm, price: e.target.value })}
                    placeholder="e.g. 750"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Supplier / Vendor Name
                </label>
                <input
                  type="text"
                  value={stockInForm.supplier}
                  onChange={(e) => setStockInForm({ ...stockInForm, supplier: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                />
              </div>

              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Notes / Batch Ref
                </label>
                <input
                  type="text"
                  value={stockInForm.notes}
                  onChange={(e) => setStockInForm({ ...stockInForm, notes: e.target.value })}
                  placeholder="Morning wholesale delivery..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-medium focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                />
              </div>

              <div className="pt-3 border-t border-purple-500/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockInModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-[#AAB3C5] hover:text-white hover:bg-[#151C30] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-black shadow-md shadow-purple-500/30 transition-all"
                >
                  Confirm Inward Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Stock Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1C263A] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-500/20 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-purple-400" />
                Audit Stock Calibration
              </h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151C30] hover:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-[#AAB3C5] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Item to Calibrate
                </label>
                <select
                  value={adjustForm.inventoryId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, inventoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-bold focus:outline-none focus:border-[#7955E8]"
                >
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id} className="bg-[#151C30] text-white">
                      {item.name} ({item.currentQuantity} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Adjustment Delta (use negative for spoilage e.g. -2)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                  placeholder="-1.5 or +2"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                />
              </div>

              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Reason for Adjustment
                </label>
                <select
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-bold focus:outline-none focus:border-[#7955E8]"
                >
                  <option value="Wastage / Shelf Spoilage" className="bg-[#151C30] text-white">Wastage / Shelf Spoilage</option>
                  <option value="Damaged packaging" className="bg-[#151C30] text-white">Damaged packaging</option>
                  <option value="Physical count discrepancy calibration" className="bg-[#151C30] text-white">Physical count discrepancy calibration</option>
                  <option value="Complimentary kitchen sampling" className="bg-[#151C30] text-white">Complimentary kitchen sampling</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                  placeholder="Audit verified by chef..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-medium focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                />
              </div>

              <div className="pt-3 border-t border-purple-500/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-[#AAB3C5] hover:text-white hover:bg-[#151C30] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-black shadow-md shadow-purple-500/30 transition-all"
                >
                  Apply Audit Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
