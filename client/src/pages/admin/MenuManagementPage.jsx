import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
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
  X
} from 'lucide-react';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Fast Food', 'Snacks', 'Beverages', 'Combos'];

export const MenuManagementPage = () => {
  const { user } = useAuth();
  const { menuItems, addFoodItem, updateFoodItem, deleteFoodItem, toggleFoodStock } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

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

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Food Item
        </button>
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
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#151C30] text-white">
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Food Items Table */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl overflow-hidden">
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
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
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
                    <option value="1" className="bg-[#151C30] text-white">Counter 1</option>
                    <option value="2" className="bg-[#151C30] text-white">Counter 2</option>
                    <option value="3" className="bg-[#151C30] text-white">Counter 3</option>
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
    </div>
  );
};

export default MenuManagementPage;
