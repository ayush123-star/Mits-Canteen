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
  FileText,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const InventoryPage = () => {
  const { user } = useAuth();
  const {
    inventoryItems,
    addStock,
    adjustStock,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const [selectedItemForAction, setSelectedItemForAction] = useState(null);

  // Add Item Form
  const [addForm, setAddForm] = useState({
    name: '',
    category: 'Dairy',
    currentQuantity: '',
    unit: 'kg',
    minimumStockLevel: '5',
    reorderQuantity: '20',
    supplier: 'Campus Wholesale Mart',
  });

  // Edit Item Form
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    category: 'Dairy',
    currentQuantity: '',
    unit: 'kg',
    minimumStockLevel: '5',
    reorderQuantity: '20',
    supplier: 'Campus Wholesale Mart',
  });

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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const lowStockItems = inventoryItems.filter(
    (i) => i.currentQuantity <= i.minimumStockLevel
  );

  const categories = ['ALL', ...new Set(inventoryItems.map((i) => i.category || 'General'))];

  const filteredItems = inventoryItems.filter((item) => {
    if (filterLowStockOnly && item.currentQuantity > item.minimumStockLevel) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      if (!item.name.toLowerCase().includes(q) && !(item.category || '').toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Handle Add Item Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      alert('Please enter a raw material name');
      return;
    }
    try {
      await addInventoryItem({
        name: addForm.name.trim(),
        category: addForm.category.trim(),
        currentQuantity: Number(addForm.currentQuantity) || 0,
        unit: addForm.unit.trim(),
        minimumStockLevel: Number(addForm.minimumStockLevel) || 5,
        reorderQuantity: Number(addForm.reorderQuantity) || 20,
        supplier: addForm.supplier.trim() || 'Campus Wholesale Mart',
      });
      showToast(`Added material "${addForm.name.trim()}" to stock!`);
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        category: 'Dairy',
        currentQuantity: '',
        unit: 'kg',
        minimumStockLevel: '5',
        reorderQuantity: '20',
        supplier: 'Campus Wholesale Mart',
      });
    } catch (err) {
      alert('Failed to add material: ' + err.message);
    }
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setSelectedItemForAction(item);
    setEditForm({
      id: item.id || item._id,
      name: item.name,
      category: item.category || 'Dairy',
      currentQuantity: item.currentQuantity,
      unit: item.unit || 'kg',
      minimumStockLevel: item.minimumStockLevel,
      reorderQuantity: item.reorderQuantity || 20,
      supplier: item.supplier || 'Campus Wholesale Mart',
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      alert('Please enter a raw material name');
      return;
    }
    try {
      await updateInventoryItem(editForm.id, {
        name: editForm.name.trim(),
        category: editForm.category.trim(),
        currentQuantity: Number(editForm.currentQuantity) || 0,
        unit: editForm.unit.trim(),
        minimumStockLevel: Number(editForm.minimumStockLevel) || 5,
        reorderQuantity: Number(editForm.reorderQuantity) || 20,
        supplier: editForm.supplier.trim() || 'Campus Wholesale Mart',
      });
      showToast(`Updated material "${editForm.name.trim()}" successfully!`);
      setIsEditModalOpen(false);
      setSelectedItemForAction(null);
    } catch (err) {
      alert('Failed to update material: ' + err.message);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (item) => {
    setSelectedItemForAction(item);
    setIsDeleteModalOpen(true);
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!selectedItemForAction) return;
    try {
      const targetId = selectedItemForAction.id || selectedItemForAction._id;
      const targetName = selectedItemForAction.name;
      await deleteInventoryItem(targetId);
      showToast(`Removed "${targetName}" from stock inventory.`);
      setIsDeleteModalOpen(false);
      setSelectedItemForAction(null);
    } catch (err) {
      alert('Failed to delete material: ' + err.message);
    }
  };

  // Handle Stock In Submit
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
    showToast(`Restocked +${stockInForm.quantity} units successfully!`);
    setIsStockInModalOpen(false);
    setStockInForm({
      inventoryId: inventoryItems[0]?.id || '',
      quantity: '',
      supplier: 'Metro Cash & Carry Wholesale',
      price: '',
      notes: '',
    });
  };

  // Handle Adjust Submit
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
    showToast(`Stock calibration adjusted successfully!`);
    setIsAdjustModalOpen(false);
  };

  const openQuickStockIn = (item) => {
    setStockInForm({
      inventoryId: item.id || item._id,
      quantity: '',
      supplier: item.supplier || 'Campus Wholesale Mart',
      price: '',
      notes: `Quick restock for ${item.name}`,
    });
    setIsStockInModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-600/90 text-white font-bold text-xs shadow-2xl border border-emerald-400/40 flex items-center gap-2 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

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

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Raw Material</span>
          </button>
          <button
            onClick={() => setIsStockInModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-purple-500/30 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Inward Stock (Restock)
          </button>
          <button
            onClick={() => setIsAdjustModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-[#1C263A] border border-purple-500/20 hover:bg-[#151C30] text-[#AAB3C5] hover:text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            Audit
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
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black self-start sm:self-auto shrink-0 transition-colors shadow-md cursor-pointer"
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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

      {/* 4. Responsive Inventory Presentation (Mobile Cards + Desktop Ledger Table) */}
      
      {/* 4A. Mobile View: Responsive Material Stock Cards (Visible on Phones) */}
      <div className="block sm:hidden space-y-3">
        {filteredItems.map((item) => {
          const isLow = item.currentQuantity <= item.minimumStockLevel;
          const ratio = Math.min(100, Math.round((item.currentQuantity / (item.minimumStockLevel * 2.5 || 1)) * 100));

          return (
            <div
              key={item.id || item._id}
              className="bg-[#1C263A]/95 rounded-2xl border border-purple-500/20 p-4 shadow-lg space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                      isLow ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-[#151C30] text-purple-300 border border-purple-500/20'
                    }`}
                  >
                    📦
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm leading-tight">{item.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-[#AAB3C5] font-mono">ID: {item.id || item._id}</span>
                      <span className="text-[9px] px-2 py-0.2 rounded-full font-bold bg-[#151C30] border border-purple-500/20 text-[#AAB3C5]">
                        {item.category || 'General'}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${
                    isLow
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isLow ? 'Low Stock' : 'Optimal'}
                </span>
              </div>

              {/* Stock Numbers & Threshold */}
              <div className="grid grid-cols-2 gap-2 bg-[#151C30]/80 p-2.5 rounded-xl border border-purple-500/10 text-xs">
                <div>
                  <span className="text-[10px] text-[#AAB3C5] uppercase font-bold block">Current Stock</span>
                  <span className="font-mono font-black text-white text-base">
                    {item.currentQuantity} <span className="text-xs font-sans text-purple-300">{item.unit || 'kg'}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#AAB3C5] uppercase font-bold block">Min. Threshold</span>
                  <span className="font-mono font-bold text-[#AAB3C5]">
                    {item.minimumStockLevel} {item.unit || 'kg'}
                  </span>
                </div>
              </div>

              {/* Stock Health Bar */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                  <span className="text-[#AAB3C5]">Stock Health:</span>
                  <span className={isLow ? 'text-amber-400 font-black' : 'text-emerald-400 font-black'}>
                    {ratio}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#151C30] rounded-full overflow-hidden border border-purple-500/10">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isLow ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-[#526DFF]'
                    }`}
                    style={{ width: `${ratio}%` }}
                  />
                </div>
              </div>

              {/* Supplier & Action Buttons */}
              <div className="pt-2 border-t border-purple-500/10 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#AAB3C5] truncate max-w-[110px]" title={item.supplier}>
                  🚚 {item.supplier || 'Campus Mart'}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openQuickStockIn(item)}
                    className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-extrabold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Restock
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 font-bold transition-colors inline-flex items-center cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(item)}
                    className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold transition-colors inline-flex items-center cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="py-10 px-4 rounded-3xl bg-[#1C263A]/90 border border-purple-500/20 text-center text-[#AAB3C5] space-y-2">
            <Package className="w-8 h-8 mx-auto text-purple-400 opacity-60" />
            <p className="font-bold text-white text-sm">No raw material items found</p>
            <p className="text-xs text-slate-400">Click "+ Add Raw Material" above to register a new stock SKU.</p>
          </div>
        )}
      </div>

      {/* 4B. Desktop View: Comprehensive Stock Ledger Table (Visible on Tablets & Laptops) */}
      <div className="hidden sm:block bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl overflow-hidden">
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
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {filteredItems.map((item) => {
                const isLow = item.currentQuantity <= item.minimumStockLevel;
                const ratio = Math.min(100, Math.round((item.currentQuantity / (item.minimumStockLevel * 2.5 || 1)) * 100));

                return (
                  <tr key={item.id || item._id} className="hover:bg-[#151C30]/60 transition-colors">
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
                          <span className="text-[10px] text-[#AAB3C5] font-mono">ID: {item.id || item._id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#151C30] border border-purple-500/20 text-[#AAB3C5]">
                        {item.category || 'General'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-black text-white text-sm">
                      {item.currentQuantity} <span className="text-xs font-sans text-[#AAB3C5]">{item.unit || 'kg'}</span>
                    </td>

                    <td className="py-3.5 px-4 text-[#AAB3C5] font-mono">
                      {item.minimumStockLevel} {item.unit || 'kg'}
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

                    {/* Actions: Quick Restock, Edit, Delete */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openQuickStockIn(item)}
                          title="Restock this material"
                          className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-extrabold text-[11px] transition-colors inline-flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          Restock
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit material details"
                          className="p-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 font-bold transition-colors inline-flex items-center cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(item)}
                          title="Delete material from stock"
                          className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold transition-colors inline-flex items-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#AAB3C5]">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-bold">No raw material items found</p>
                    <p className="text-[11px] mt-1 text-slate-500">Click "+ Add Raw Material" above to register a new stock SKU.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ADD RAW MATERIAL MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1C263A] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-purple-500/20 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Add New Raw Material to Stock
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151C30] hover:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-[#AAB3C5] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Material Name *
                </label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Amul Butter, Fresh Paneer, Burger Buns..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    placeholder="Dairy, Bakery, Veggies, Spices..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Unit of Measurement
                  </label>
                  <select
                    value={addForm.unit}
                    onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-bold focus:outline-none focus:border-[#7955E8]"
                  >
                    <option value="kg" className="bg-[#151C30] text-white">kg (Kilograms)</option>
                    <option value="L" className="bg-[#151C30] text-white">L (Litres)</option>
                    <option value="pcs" className="bg-[#151C30] text-white">pcs (Pieces)</option>
                    <option value="packets" className="bg-[#151C30] text-white">packets (Packets)</option>
                    <option value="cans" className="bg-[#151C30] text-white">cans (Cans)</option>
                    <option value="boxes" className="bg-[#151C30] text-white">boxes (Boxes)</option>
                    <option value="bottles" className="bg-[#151C30] text-white">bottles (Bottles)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={addForm.currentQuantity}
                    onChange={(e) => setAddForm({ ...addForm, currentQuantity: e.target.value })}
                    placeholder="e.g. 25"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Min Threshold
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={addForm.minimumStockLevel}
                    onChange={(e) => setAddForm({ ...addForm, minimumStockLevel: e.target.value })}
                    placeholder="e.g. 5"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Reorder Qty
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={addForm.reorderQuantity}
                    onChange={(e) => setAddForm({ ...addForm, reorderQuantity: e.target.value })}
                    placeholder="e.g. 20"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Default Supplier / Vendor
                </label>
                <input
                  type="text"
                  value={addForm.supplier}
                  onChange={(e) => setAddForm({ ...addForm, supplier: e.target.value })}
                  placeholder="e.g. Metro Wholesale, Campus Mart..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                />
              </div>

              <div className="pt-3 border-t border-purple-500/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-[#AAB3C5] hover:text-white hover:bg-[#151C30] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black shadow-md shadow-emerald-500/30 transition-all cursor-pointer"
                >
                  Create & Save to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT RAW MATERIAL MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1C263A] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-purple-500/20 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                Edit Raw Material: {editForm.name}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151C30] hover:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-[#AAB3C5] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Material Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Unit of Measurement
                  </label>
                  <select
                    value={editForm.unit}
                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-bold focus:outline-none focus:border-[#7955E8]"
                  >
                    <option value="kg" className="bg-[#151C30] text-white">kg (Kilograms)</option>
                    <option value="L" className="bg-[#151C30] text-white">L (Litres)</option>
                    <option value="pcs" className="bg-[#151C30] text-white">pcs (Pieces)</option>
                    <option value="packets" className="bg-[#151C30] text-white">packets (Packets)</option>
                    <option value="cans" className="bg-[#151C30] text-white">cans (Cans)</option>
                    <option value="boxes" className="bg-[#151C30] text-white">boxes (Boxes)</option>
                    <option value="bottles" className="bg-[#151C30] text-white">bottles (Bottles)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editForm.currentQuantity}
                    onChange={(e) => setEditForm({ ...editForm, currentQuantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Min Threshold
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editForm.minimumStockLevel}
                    onChange={(e) => setEditForm({ ...editForm, minimumStockLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Reorder Qty
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={editForm.reorderQuantity}
                    onChange={(e) => setEditForm({ ...editForm, reorderQuantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Default Supplier / Vendor
                </label>
                <input
                  type="text"
                  value={editForm.supplier}
                  onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                />
              </div>

              <div className="pt-3 border-t border-purple-500/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-[#AAB3C5] hover:text-white hover:bg-[#151C30] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black shadow-md shadow-blue-500/30 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedItemForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1C263A] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-500/30 space-y-4 text-white">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-white">Delete Raw Material?</h3>
              <p className="text-xs text-[#AAB3C5] leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-white underline">{selectedItemForAction.name}</strong> from stock inventory?
              </p>
              <p className="text-[11px] text-rose-400 font-semibold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                ⚠️ This item will be removed from the stock ledger and won't be available for recipes.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedItemForAction(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#151C30] hover:bg-[#25334d] text-[#AAB3C5] hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Yes, Delete Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Inward Stock (Stock In) Modal */}
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
                className="w-8 h-8 rounded-full bg-[#151C30] hover:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-[#AAB3C5] hover:text-white transition-colors cursor-pointer"
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
                    <option key={item.id || item._id} value={item.id || item._id} className="bg-[#151C30] text-white">
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
                  className="px-4 py-2 rounded-xl font-bold text-[#AAB3C5] hover:text-white hover:bg-[#151C30] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-black shadow-md shadow-purple-500/30 transition-all cursor-pointer"
                >
                  Confirm Inward Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Stock Adjustment Modal */}
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
                className="w-8 h-8 rounded-full bg-[#151C30] hover:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-[#AAB3C5] hover:text-white transition-colors cursor-pointer"
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
                    <option key={item.id || item._id} value={item.id || item._id} className="bg-[#151C30] text-white">
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
                  className="px-4 py-2 rounded-xl font-bold text-[#AAB3C5] hover:text-white hover:bg-[#151C30] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-black shadow-md shadow-purple-500/30 transition-all cursor-pointer"
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
