import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { SpotlightCard } from '../../components/common/SpotlightCard';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Leaf,
  Clock,
  Sparkles,
  AlertCircle,
  DollarSign,
  X,
  FolderPlus,
  Settings2,
} from 'lucide-react';

export const MenuManagementPage = () => {
  const { user } = useAuth();
  const {
    menuItems,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
    toggleFoodStock,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [isManageCatModalOpen, setIsManageCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [catSuccessMsg, setCatSuccessMsg] = useState('');

  const handleStartEditCat = (cat) => {
    setEditingCatId(cat.id || cat._id || cat.name);
    setEditingCatName(typeof cat === 'string' ? cat : cat.name);
  };

  const handleSaveEditCat = async (cat) => {
    const targetId = cat.id || cat._id;
    if (!editingCatName.trim()) return;
    if (targetId) {
      await updateCategory(targetId, { name: editingCatName.trim() });
    }
    setEditingCatId(null);
  };

  const handleDeleteCat = async (cat) => {
    const catName = typeof cat === 'string' ? cat : cat.name;
    const targetId = cat.id || cat._id || catName;
    if (window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      await deleteCategory(targetId);
      if (selectedCategory === catName) {
        setSelectedCategory('All');
      }
    }
  };

  // Dynamically computed categories from CMS database
  const allCategoryNames = useMemo(() => {
    const defaultList = ['Breakfast', 'Lunch', 'Fast Food', 'Snacks', 'Beverages', 'Combos'];
    const fromState = (categories || []).map((c) => (typeof c === 'string' ? c : c.name)).filter(Boolean);
    return ['All', ...new Set([...defaultList, ...fromState])];
  }, [categories]);

  // Form State
  const initialForm = {
    name: '',
    description: '',
    price: '',
    category: 'Fast Food',
    isVeg: true,
    isAvailable: true,
    preparationTime: 8,
    calories: 350,
    counter: 1,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    tags: 'Popular, Campus Pick',
  };
  const [formData, setFormData] = useState(initialForm);

  // Filtered menu items (100% Pure Veg)
  const filteredFoods = menuItems.filter((food) => {
    if (selectedCategory !== 'All' && food.category !== selectedCategory) return false;
    if (food.isVeg === false) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = food.name?.toLowerCase().includes(q);
      const matchDesc = food.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setEditingFood(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description || '',
      price: food.price,
      category: food.category,
      isVeg: food.isVeg,
      isAvailable: food.isAvailable,
      preparationTime: food.preparationTime || 8,
      calories: food.calories || 300,
      counter: food.counter || 1,
      image: food.image,
      tags: food.tags ? food.tags.join(', ') : '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      isVeg: true,
      price: Number(formData.price),
      preparationTime: Number(formData.preparationTime),
      calories: Number(formData.calories),
      counter: Number(formData.counter),
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    if (editingFood) {
      updateFoodItem(editingFood.id || editingFood._id, payload, user?.name || 'Admin');
    } else {
      addFoodItem(payload, user?.name || 'Admin');
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (food) => {
    if (window.confirm(`Are you sure you want to remove "${food.name}" from the menu catalog?`)) {
      deleteFoodItem(food.id || food._id, user?.name || 'Admin');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-white">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            Menu Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
            Add new food creations, tweak pricing, assign preparation counters, and toggle instantaneous stock availability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setNewCatName('');
              setCatSuccessMsg('');
              setIsAddCatModalOpen(true);
            }}
            className="px-4 py-3 rounded-2xl bg-[#151C30] hover:bg-[#25334d] border border-purple-500/30 text-purple-200 font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-purple-400" />
            + Add Category
          </button>

          <button
            type="button"
            onClick={() => setIsManageCatModalOpen(true)}
            className="px-4 py-3 rounded-2xl bg-[#151C30] hover:bg-[#25334d] border border-purple-500/30 text-purple-200 font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-purple-400" />
            Manage Categories
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Food Item
          </button>
        </div>
      </div>

      {/* 2. Search & Category Filters */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl p-4 rounded-3xl border border-purple-500/20 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#AAB3C5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-2xl shrink-0">
            <span className="w-4 h-4 rounded-xs border border-emerald-500 flex items-center justify-center bg-white shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            </span>
            <span className="text-xs font-black text-emerald-400 tracking-wide">
              100% Pure Veg Menu
            </span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-bold text-white focus:outline-none focus:border-[#7955E8] shrink-0"
          >
            {allCategoryNames.map((c) => (
              <option key={c} value={c} className="bg-[#151C30] text-white">
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3A. Mobile Food Cards View (Phones & Small Tablets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
        {filteredFoods.map((food) => {
          const foodId = food.id || food._id;
          return (
            <SpotlightCard
              key={foodId}
              spotlightColor="rgba(255, 120, 68, 0.2)"
              className="bg-[#141724]/90 backdrop-blur-2xl rounded-2xl p-4 border border-purple-500/25 shadow-xl flex flex-col justify-between gap-3"
            >
              <div className="flex gap-3">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#151C30] border border-purple-500/20 shrink-0">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 left-1 w-3.5 h-3.5 rounded-xs flex items-center justify-center border border-emerald-500 bg-white/90 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-black text-white text-sm truncate">{food.name}</h4>
                    <span className="text-sm font-black text-white shrink-0">₹{food.price}</span>
                  </div>
                  <p className="text-[11px] text-[#AAB3C5] line-clamp-2 mt-0.5 leading-snug">
                    {food.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#151C30] border border-purple-500/20 text-purple-300">
                      {food.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#151C30] text-[#AAB3C5]">
                      {food.preparationTime || 7}m prep
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-[#7955E8] bg-purple-500/10 border border-purple-500/25">
                      C{food.counter || 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Quick In-Stock Switch + Action Buttons */}
              <div className="flex items-center justify-between pt-2.5 border-t border-purple-500/15">
                <button
                  type="button"
                  onClick={() => toggleFoodStock(foodId, user?.name || 'Admin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    food.isAvailable
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                  title="Toggle stock availability"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      food.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                    }`}
                  ></span>
                  {food.isAvailable ? 'In Stock' : 'Sold Out'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(food)}
                    className="p-2 rounded-xl text-[#AAB3C5] hover:text-[#7955E8] bg-[#151C30] hover:bg-purple-500/15 border border-purple-500/20 transition-colors"
                    title="Edit Item"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(food)}
                    className="p-2 rounded-xl text-[#AAB3C5] hover:text-red-400 bg-[#151C30] hover:bg-red-500/15 border border-purple-500/20 transition-colors"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>

      {/* 3B. Desktop Food Items Table */}
      <div className="hidden md:block bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151C30]/80 text-[#AAB3C5] font-extrabold uppercase tracking-wider border-b border-purple-500/20">
              <tr>
                <th className="py-4 px-5">Dish</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Prep Time</th>
                <th className="py-4 px-4">Counter</th>
                <th className="py-4 px-4">Availability</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {filteredFoods.map((food) => {
                const foodId = food.id || food._id;
                return (
                  <tr key={foodId} className="hover:bg-[#151C30]/60 transition-colors">
                    {/* Dish Info */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-12 h-12 rounded-2xl object-cover bg-[#151C30] border border-purple-500/20 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded-xs flex items-center justify-center border border-emerald-500 bg-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            </span>
                            <span className="font-black text-white">{food.name}</span>
                          </div>
                          <p className="text-[11px] text-[#AAB3C5] truncate max-w-xs mt-0.5">
                            {food.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#151C30] border border-purple-500/20 text-[#AAB3C5]">
                        {food.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-black text-white text-sm">
                      ₹{food.price}
                    </td>

                    {/* Prep Time */}
                    <td className="py-3.5 px-4 font-semibold text-[#AAB3C5]">
                      {food.preparationTime || 7} mins
                    </td>

                    {/* Counter */}
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-[#7955E8] bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/30">
                        Counter {food.counter || 1}
                      </span>
                    </td>

                    {/* In Stock Toggle Switch */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleFoodStock(foodId, user?.name || 'Admin')}
                        className={`px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 transition-all ${
                          food.isAvailable
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                        }`}
                        title="Click to toggle stock state"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            food.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                          }`}
                        ></span>
                        {food.isAvailable ? 'In Stock' : 'Sold Out'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(food)}
                          className="p-2 rounded-xl text-[#AAB3C5] hover:text-[#7955E8] hover:bg-purple-500/10 transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(food)}
                          className="p-2 rounded-xl text-[#AAB3C5] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Add / Edit Food Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1C263A] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-purple-500/20 max-h-[90vh] overflow-y-auto space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="text-base font-extrabold text-white">
                {editingFood ? 'Edit Food Item' : 'Add New Food Creation'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151C30] hover:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-[#AAB3C5] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Dish Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Schezwan Paneer Kathi Roll"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="5"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="80"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-bold focus:outline-none focus:border-[#7955E8]"
                  >
                    {allCategoryNames.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c} className="bg-[#151C30] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Prep Time (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Pickup Counter
                  </label>
                  <select
                    value={formData.counter}
                    onChange={(e) => setFormData({ ...formData, counter: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-bold focus:outline-none focus:border-[#7955E8]"
                  >
                    <option value="1" className="bg-[#151C30] text-white">Counter</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-semibold focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Food Image URL (Unsplash or CDN)
                </label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-mono text-[11px] focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                />
              </div>

              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredients and taste highlights..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-medium focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                />
              </div>

              {/* Pure Veg Indicator & In-Stock Checkbox */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <span className="w-4 h-4 rounded-xs border border-emerald-500 flex items-center justify-center bg-white shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  </span>
                  <span className="font-bold text-xs text-emerald-400">
                    100% Pure Vegetarian Dish (Campus Rule)
                  </span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-[#7955E8] rounded-sm bg-[#151C30] border-purple-500/30 focus:ring-purple-500"
                  />
                  <span className="font-bold text-white text-xs">Currently In Stock</span>
                </label>
              </div>

              <div className="pt-3 border-t border-purple-500/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-[#AAB3C5] hover:text-white hover:bg-[#151C30] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-extrabold shadow-md shadow-purple-500/30 transition-all"
                >
                  {editingFood ? 'Update Food Dish' : 'Create & Publish Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 5. Add Category Modal */}
      {isAddCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-[#1C263A] rounded-3xl border border-purple-500/30 p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Add New Food Category</h3>
                  <p className="text-[11px] text-[#AAB3C5]">Real-time synchronization across User & Owner websites</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCatModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151C30] hover:bg-[#25334d] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {catSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{catSuccessMsg}</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newCatName.trim()) return;
                await addCategory({ name: newCatName.trim() });
                setCatSuccessMsg(`Category "${newCatName.trim()}" published live!`);
                setTimeout(() => {
                  setCatSuccessMsg('');
                  setNewCatName('');
                  setIsAddCatModalOpen(false);
                }, 1200);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. South Indian, Chinese, Shakes, Desserts..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#151C30] border border-purple-500/30 text-white font-bold focus:outline-none focus:border-[#7955E8]"
                  autoFocus
                />
              </div>

              <div className="pt-2 border-t border-purple-500/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCatModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-[#AAB3C5] hover:text-white hover:bg-[#151C30] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-extrabold shadow-md shadow-purple-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Publish Category Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 6. Manage Categories Modal (Edit / Rename & Delete Categories) */}
      {isManageCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#1C263A] rounded-3xl border border-purple-500/30 p-6 shadow-2xl space-y-4 animate-scaleUp max-h-[85vh] overflow-y-auto text-white">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <Settings2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Manage Food Categories</h3>
                  <p className="text-[11px] text-[#AAB3C5]">Edit names or remove categories live across campus</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManageCatModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151C30] hover:bg-[#25334d] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {(categories || []).map((cat) => {
                const catName = typeof cat === 'string' ? cat : cat.name;
                const catId = cat.id || cat._id || catName;
                const dishCount = menuItems.filter((m) => m.category === catName).length;
                const isEditing = editingCatId === catId;

                return (
                  <div
                    key={catId}
                    className="p-3.5 rounded-2xl bg-[#151C30] border border-purple-500/20 flex items-center justify-between gap-3 hover:border-purple-500/40 transition-colors"
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-[#1C263A] border border-purple-500/40 text-white text-xs font-bold focus:outline-none focus:border-[#7955E8]"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditCat(cat)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="px-2 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                          <span className="font-extrabold text-white text-xs sm:text-sm">{catName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                            {dishCount} dish(es)
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditCat(cat)}
                            title="Rename Category"
                            className="p-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCat(cat)}
                            title="Delete Category"
                            className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsManageCatModalOpen(false);
                  setIsAddCatModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-purple-400" />
                + Add Another Category
              </button>
              <button
                type="button"
                onClick={() => setIsManageCatModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#151C30] hover:bg-[#25334d] text-[#AAB3C5] hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagementPage;
