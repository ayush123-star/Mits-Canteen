import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  X,
  Package
} from 'lucide-react';

export const RecipeManagementPage = () => {
  const { user } = useAuth();
  const { recipes, menuItems, inventoryItems, saveRecipe, deleteRecipe } = useData();

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Form State for Recipe Studio
  const [formData, setFormData] = useState({
    menuItemId: menuItems[0]?.id || '',
    ingredients: [
      { inventoryId: inventoryItems[0]?.id || '', quantity: 1, unit: 'pcs' },
    ],
  });

  // Calculate remaining servings can be prepared for each recipe
  const calculateAvailableServings = (recipe) => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) return 0;

    let minServings = Infinity;

    recipe.ingredients.forEach((ing) => {
      const invItem = inventoryItems.find((i) => i.id === ing.inventoryId);
      if (!invItem || ing.quantity <= 0) {
        minServings = 0;
      } else {
        const canMake = Math.floor(invItem.currentQuantity / ing.quantity);
        if (canMake < minServings) {
          minServings = canMake;
        }
      }
    });

    return minServings === Infinity ? 0 : minServings;
  };

  const handleOpenAdd = () => {
    setFormData({
      menuItemId: menuItems[0]?.id || '',
      ingredients: [
        { inventoryId: inventoryItems[0]?.id || '', quantity: 1, unit: 'pcs' },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (recipe) => {
    setFormData({
      menuItemId: recipe.menuItemId,
      ingredients: recipe.ingredients.map((ing) => ({ ...ing })),
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (recipe) => {
    setRecipeToDelete(recipe);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return;
    try {
      await deleteRecipe(recipeToDelete.menuItemId || recipeToDelete.id);
      showToast(`Recipe formula for "${recipeToDelete.menuItemName}" deleted!`);
      setIsDeleteModalOpen(false);
      setRecipeToDelete(null);
    } catch (err) {
      alert('Failed to delete recipe: ' + err.message);
    }
  };

  const handleAddIngredientRow = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { inventoryId: inventoryItems[0]?.id || '', quantity: 0.1, unit: 'kg' },
      ],
    });
  };

  const handleRemoveIngredientRow = (index) => {
    const updated = formData.ingredients.filter((_, idx) => idx !== index);
    setFormData({ ...formData, ingredients: updated });
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...formData.ingredients];
    if (field === 'inventoryId') {
      const inv = inventoryItems.find((i) => i.id === value);
      updated[index] = {
        ...updated[index],
        inventoryId: value,
        unit: inv ? inv.unit : 'kg',
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setFormData({ ...formData, ingredients: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dish = menuItems.find((m) => (m.id === formData.menuItemId || m._id === formData.menuItemId));
    const payload = {
      menuItemId: formData.menuItemId,
      menuItemName: dish?.name || 'Dish Formula',
      ingredients: formData.ingredients.map((ing) => ({
        ...ing,
        quantity: Number(ing.quantity),
      })),
    };

    saveRecipe(payload, user?.name || 'Recipe Chef');
    setIsModalOpen(false);
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
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            Recipe Studio & Auto-Deduction Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
            Define ingredient formulas per serving. The system automatically depletes raw materials in real-time as kitchen prepares student orders.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Configure New Dish Recipe
        </button>
      </div>

      {/* 2. Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => {
          const dish = menuItems.find(
            (m) => m.id === recipe.menuItemId || m._id === recipe.menuItemId
          );
          const availableServings = calculateAvailableServings(recipe);
          const isCritical = availableServings <= 10;

          return (
            <div
              key={recipe.id}
              className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl hover:border-purple-500/40 transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Dish Header */}
                <div className="flex items-center justify-between pb-3 border-b border-purple-500/10">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        dish?.image ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={recipe.menuItemName}
                      className="w-12 h-12 rounded-2xl object-cover bg-[#151C30] border border-purple-500/20 shrink-0"
                    />
                    <div>
                      <h3 className="font-black text-sm text-white leading-snug">
                        {recipe.menuItemName}
                      </h3>
                      <p className="text-[11px] text-purple-400 font-extrabold">
                        ₹{dish?.price || 70} • Counter {dish?.counter || 1}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(recipe)}
                      className="p-2 rounded-xl text-[#AAB3C5] hover:text-[#7955E8] hover:bg-purple-500/10 transition-colors cursor-pointer"
                      title="Edit Formula"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(recipe)}
                      className="p-2 rounded-xl text-[#AAB3C5] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Formula"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Remaining Servings Metric */}
                <div
                  className={`mt-3 p-3 rounded-2xl flex items-center justify-between text-xs ${
                    isCritical
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                      : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 shrink-0 text-purple-300" />
                    <div>
                      <span className="font-bold text-[10px] uppercase tracking-wider block text-[#AAB3C5]">
                        Stock Capacity
                      </span>
                      <strong className="text-sm font-black text-white">
                        ~{availableServings} Servings Available
                      </strong>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                      isCritical ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isCritical ? 'Restock Soon' : 'Optimal'}
                  </span>
                </div>

                {/* Ingredient Ingredients List */}
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#AAB3C5] block">
                    Formula Consumption per 1 Serving:
                  </span>
                  <div className="divide-y divide-purple-500/10">
                    {recipe.ingredients.map((ing, idx) => {
                      const invItem = inventoryItems.find((i) => i.id === ing.inventoryId);
                      return (
                        <div
                          key={idx}
                          className="py-1.5 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-slate-300">
                            {invItem ? invItem.name : ing.inventoryId}
                          </span>
                          <span className="font-mono font-bold text-white">
                            {ing.quantity} {ing.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer Timestamp */}
              <div className="pt-2 border-t border-purple-500/10 text-[10px] text-[#AAB3C5] flex justify-between">
                <span>Active recipe link</span>
                <span className="text-purple-400">Auto-deducts on "Preparing"</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Configure / Edit Recipe Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1C263A] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-purple-500/20 max-h-[90vh] overflow-y-auto space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-purple-400" />
                Configure Dish Recipe Formula
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151C30] hover:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-[#AAB3C5] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Select Food Dish
                </label>
                <select
                  value={formData.menuItemId}
                  onChange={(e) => setFormData({ ...formData, menuItemId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-white font-bold focus:outline-none focus:border-[#7955E8]"
                >
                  {menuItems.map((m) => (
                    <option key={m.id || m._id} value={m.id || m._id} className="bg-[#151C30] text-white">
                      {m.name} (₹{m.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Ingredient Rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider">
                    Raw Material Ingredients
                  </label>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="text-[#7955E8] font-extrabold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Ingredient
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.ingredients.map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20"
                    >
                      <select
                        value={row.inventoryId}
                        onChange={(e) =>
                          handleIngredientChange(idx, 'inventoryId', e.target.value)
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-xl bg-[#1C263A] border border-purple-500/20 font-bold text-white text-xs focus:outline-none focus:border-[#7955E8]"
                      >
                        {inventoryItems.map((inv) => (
                          <option key={inv.id} value={inv.id} className="bg-[#1C263A] text-white">
                            {inv.name} ({inv.unit})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        required
                        value={row.quantity}
                        onChange={(e) =>
                          handleIngredientChange(idx, 'quantity', e.target.value)
                        }
                        placeholder="Qty"
                        className="w-20 px-2 py-1.5 rounded-xl bg-[#1C263A] border border-purple-500/20 font-mono font-bold text-center text-white text-xs focus:outline-none focus:border-[#7955E8]"
                      />

                      <span className="font-mono text-[#AAB3C5] w-10 text-center">
                        {row.unit}
                      </span>

                      {formData.ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredientRow(idx)}
                          className="p-1.5 text-[#AAB3C5] hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-purple-500/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-[#AAB3C5] hover:text-white hover:bg-[#151C30] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-black shadow-md shadow-purple-500/30 transition-all"
                >
                  Save Recipe Formula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 4. Delete Confirmation Modal */}
      {isDeleteModalOpen && recipeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1C263A] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-500/30 space-y-4 text-white">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-white">Delete Recipe Formula?</h3>
              <p className="text-xs text-[#AAB3C5] leading-relaxed">
                Are you sure you want to remove the ingredient formula for <strong className="text-white underline">{recipeToDelete.menuItemName}</strong>?
              </p>
              <p className="text-[11px] text-rose-400 font-semibold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                ⚠️ Automatic stock deduction for this dish will stop when orders are prepared.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setRecipeToDelete(null);
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
                Yes, Delete Recipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeManagementPage;
