import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Star,
  MessageSquare,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  Award,
  Sparkles,
  Utensils,
  Calendar,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export const AdminFeedbackPage = () => {
  const { user } = useAuth();
  const { feedbackList, menuItems, deleteFeedback } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('ALL');
  const [selectedDishFilter, setSelectedDishFilter] = useState('ALL');
  const [reviewedMap, setReviewedMap] = useState({});

  // Calculate metrics
  const totalReviews = feedbackList.length;
  
  const averageRating = useMemo(() => {
    if (totalReviews === 0) return 0;
    const sum = feedbackList.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
    return (sum / totalReviews).toFixed(1);
  }, [feedbackList, totalReviews]);

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbackList.forEach((fb) => {
      const r = Math.min(Math.max(Math.round(Number(fb.rating) || 5), 1), 5);
      counts[r] = (counts[r] || 0) + 1;
    });
    return counts;
  }, [feedbackList]);

  const positivePercent = useMemo(() => {
    if (totalReviews === 0) return 100;
    const positiveCount = (ratingCounts[5] || 0) + (ratingCounts[4] || 0);
    return Math.round((positiveCount / totalReviews) * 100);
  }, [totalReviews, ratingCounts]);

  const topDish = useMemo(() => {
    if (totalReviews === 0) return 'Masala Dosa';
    const dishCounts = {};
    feedbackList.forEach((fb) => {
      const name = fb.foodName || 'Special Item';
      dishCounts[name] = (dishCounts[name] || 0) + 1;
    });
    const sorted = Object.entries(dishCounts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? sorted[0][0] : 'Campus Special';
  }, [feedbackList, totalReviews]);

  // Unique dishes list for filter dropdown
  const uniqueDishes = useMemo(() => {
    const set = new Set();
    feedbackList.forEach((fb) => {
      const name = fb.foodName || fb.foodItem;
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [feedbackList]);

  // Filtered reviews
  const filteredFeedbacks = useMemo(() => {
    return feedbackList.filter((fb) => {
      const dishTitle = fb.foodName || fb.foodItem || 'Special Item';

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchStudent = fb.studentName?.toLowerCase().includes(q);
        const matchFood = dishTitle.toLowerCase().includes(q);
        const matchComment = fb.comment?.toLowerCase().includes(q);
        const matchTags = fb.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchStudent && !matchFood && !matchComment && !matchTags) return false;
      }

      // Rating Filter
      if (selectedRatingFilter !== 'ALL') {
        const targetRating = Number(selectedRatingFilter);
        if (Math.round(Number(fb.rating)) !== targetRating) return false;
      }

      // Dish Filter
      if (selectedDishFilter !== 'ALL') {
        if (dishTitle !== selectedDishFilter) return false;
      }

      return true;
    });
  }, [feedbackList, searchQuery, selectedRatingFilter, selectedDishFilter]);

  const toggleReviewed = (id) => {
    setReviewedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = (id, foodName) => {
    if (window.confirm(`Are you sure you want to remove this feedback for "${foodName}"?`)) {
      if (deleteFeedback) {
        deleteFeedback(id);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12 text-white">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Customer Feedback & Dish Reviews
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                Live Kitchen Quality Audit
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1.5">
            Live stream of student taste evaluations, star ratings, and flavor comments to monitor kitchen standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-2 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-bold text-slate-300 flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Campus Rating: <strong>{averageRating} / 5.0</strong></span>
          </span>
        </div>
      </div>

      {/* 2. Key Performance Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="p-4 sm:p-5 rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl">
          <p className="text-[10px] sm:text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Total Reviews</p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white">{totalReviews}</span>
            <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-sm font-bold border border-purple-500/30">
              💬
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Direct from campus students</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl">
          <p className="text-[10px] sm:text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Average Rating</p>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">{averageRating}</span>
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm font-bold border border-amber-500/30">
              ⭐
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 font-bold mt-1">High campus quality</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl">
          <p className="text-[10px] sm:text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Positive Sentiment</p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{positivePercent}%</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-sm font-bold border border-emerald-500/30">
              👍
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">4★ & 5★ Ratings</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#1C263A]/85 backdrop-blur-xl border border-purple-500/20 shadow-xl">
          <p className="text-[10px] sm:text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Top Reviewed Dish</p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-base sm:text-lg font-black text-purple-300 truncate max-w-[130px]">{topDish}</span>
            <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center text-sm font-bold border border-blue-500/30">
              🍲
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Student campus favorite</p>
        </div>
      </div>

      {/* 3. Star Distribution Breakdown Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#1C263A]/90 backdrop-blur-xl border border-purple-500/20 shadow-xl space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          Rating Distribution Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
          {[5, 4, 3, 2, 1].map((r) => {
            const count = ratingCounts[r] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={r} className="p-3 rounded-2xl bg-[#151C30] border border-purple-500/15 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-white flex items-center gap-1">
                    {r} <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </span>
                  <span className="font-bold text-slate-400">{count} reviews ({pct}%)</span>
                </div>
                <div className="w-full h-1.5 bg-[#0B1020] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Search and Filter Controls */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-purple-500/20 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, dish name, keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/25 text-xs font-semibold text-white placeholder-slate-400 focus:outline-none focus:border-[#7955E8] shadow-xs"
          />
        </div>

        {/* Rating Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['ALL', '5', '4', '3', '2', '1'].map((r) => {
            const isSelected = selectedRatingFilter === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRatingFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/25'
                    : 'bg-[#151C30] text-[#AAB3C5] hover:text-white border border-purple-500/20'
                }`}
              >
                {r === 'ALL' ? 'All Ratings' : `${r} ★`}
              </button>
            );
          })}

          {/* Dish Dropdown Filter */}
          <select
            value={selectedDishFilter}
            onChange={(e) => setSelectedDishFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#151C30] border border-purple-500/25 text-xs font-bold text-white focus:outline-none focus:border-[#7955E8] shrink-0"
          >
            <option value="ALL">All Dishes ({uniqueDishes.length})</option>
            {uniqueDishes.map((dish) => (
              <option key={dish} value={dish} className="bg-[#151C30] text-white">
                {dish}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. Feedback Feed List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
            Showing {filteredFeedbacks.length} of {totalReviews} Reviews
          </span>
          {filteredFeedbacks.length > 0 && (
            <span className="text-[11px] text-[#AAB3C5]">Sorted by: Newest First</span>
          )}
        </div>

        {filteredFeedbacks.length === 0 ? (
          <div className="py-20 text-center bg-[#1C263A]/85 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl space-y-3 p-6">
            <div className="w-16 h-16 rounded-2xl bg-[#151C30] text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30">
              <MessageSquare className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-black text-white">No Reviews Found</h3>
            <p className="text-xs text-[#AAB3C5] max-w-sm mx-auto">
              {searchQuery || selectedRatingFilter !== 'ALL' || selectedDishFilter !== 'ALL'
                ? 'No customer reviews match your active filter criteria. Try clearing filters to see all reviews.'
                : 'No reviews have been submitted by students yet. When students rate dishes on the feedback page, their reviews will appear here immediately.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeedbacks.map((item) => {
              const itemId = item.id || item._id;
              const isReviewed = reviewedMap[itemId];
              return (
                <div
                  key={itemId}
                  className={`p-5 rounded-3xl bg-[#1C263A]/90 backdrop-blur-xl border transition-all shadow-xl space-y-3 flex flex-col justify-between ${
                    isReviewed
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-purple-500/20 hover:border-purple-500/40'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Student + Rating */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                          {item.studentName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white">{item.studentName}</h4>
                          <p className="text-[10px] text-[#AAB3C5] flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3 h-3 text-purple-400" />
                            {item.createdAt || item.date || 'Recent'}
                            {item.studentId && <span>• ID: {item.studentId}</span>}
                          </p>
                        </div>
                      </div>

                      {/* Stars Badge */}
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30 shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-black text-amber-300">{item.rating}.0</span>
                      </div>
                    </div>

                    {/* Dish Tag */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#151C30] border border-purple-500/20 text-xs">
                      <Utensils className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-extrabold text-white">{item.foodName || item.foodItem || 'Campus Dish'}</span>
                    </div>

                    {/* Comment text */}
                    <p className="text-xs text-slate-200 leading-relaxed italic bg-[#0B1020]/40 p-3 rounded-2xl border border-purple-500/10">
                      "{item.comment}"
                    </p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-[#151C30] border border-purple-500/20 text-purple-300"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-purple-500/15 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleReviewed(itemId)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isReviewed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-[#151C30] text-slate-400 hover:text-white border border-purple-500/20'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isReviewed ? 'Reviewed by Kitchen' : 'Mark Reviewed'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(itemId, item.foodName)}
                      className="p-1.5 rounded-xl bg-[#151C30] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-purple-500/20 transition-colors cursor-pointer"
                      title="Delete this review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedbackPage;
