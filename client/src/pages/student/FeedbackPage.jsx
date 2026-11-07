import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { playNotificationSound } from '../../utils/audio';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Award,
  Send,
  CheckCircle2,
  Sparkles,
  Utensils,
  User,
  X
} from 'lucide-react';

const POPULAR_TAGS = [
  'Crispy & Fresh',
  'Super Fast Preparation',
  'Generous Portion',
  'Authentic Taste',
  'Budget Friendly',
  'Piping Hot',
  'Perfect Spice Level',
];

export const FeedbackPage = () => {
  const { user } = useAuth();
  const { menuItems, feedbackList, submitFeedback } = useData();

  const [selectedFoodId, setSelectedFoodId] = useState(menuItems[0]?.id || 'food-1');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(['Crispy & Fresh']);
  const [comment, setComment] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [successModalData, setSuccessModalData] = useState(null);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Please add a short review comment before submitting!');
      return;
    }

    const foodObj = menuItems.find((m) => (m.id === selectedFoodId || m._id === selectedFoodId));

    submitFeedback({
      studentId: user?.id || user?.studentId || 'BTET25O1039',
      studentName: user?.name || 'Ayush Pandey',
      foodItemId: selectedFoodId,
      foodName: foodObj?.name || 'Campus Special',
      rating,
      comment,
      tags: selectedTags,
    });

    // Play sparkling chime sound effect
    playNotificationSound('feedback');

    // Celebratory confetti animation
    try {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7955E8', '#526DFF', '#F59E0B', '#10B981'],
      });
    } catch (err) {
      console.debug('Confetti effect skipped', err);
    }

    // Open detailed confirmation pop-up modal
    setSuccessModalData({
      foodName: foodObj?.name || 'Campus Special',
      rating,
      comment,
      tags: selectedTags,
    });

    setSubmittedSuccess(true);
    setComment('');
    setTimeout(() => setSubmittedSuccess(false), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-white">
      {/* 1. Header Banner */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl border border-purple-500/20">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Dish Reviews & Campus Feedback
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-2">
            Help the canteen chefs refine flavors and portion sizes by rating the food you enjoyed today.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#151C30] px-4 py-2.5 rounded-2xl border border-purple-500/20 shadow-md">
          <Award className="w-5 h-5 text-purple-400" />
          <div className="text-xs">
            <p className="text-[#AAB3C5] font-medium">Campus Food Rating</p>
            <p className="font-black text-white text-sm">4.8 / 5.0 (850+ ratings)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 2. Review Form */}
        <div className="lg:col-span-6 bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-extrabold text-white">Write Your Feedback</h2>
          </div>

          {submittedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Thank you! Your feedback has been shared with the canteen owner and kitchen team!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Food Selector */}
            <div>
              <label className="text-xs font-bold text-[#AAB3C5] block mb-1.5 uppercase tracking-wider">
                Select Dish You Ordered
              </label>
              <select
                value={selectedFoodId}
                onChange={(e) => setSelectedFoodId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-bold text-white focus:outline-none focus:border-[#7955E8]"
              >
                {menuItems.map((food) => (
                  <option key={food.id || food._id} value={food.id || food._id} className="bg-[#151C30] text-white">
                    {food.name} (₹{food.price})
                  </option>
                ))}
              </select>
            </div>

            {/* Star Rating */}
            <div>
              <label className="text-xs font-bold text-[#AAB3C5] block mb-1.5 uppercase tracking-wider">
                Your Star Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-black text-amber-400">
                  {rating === 5
                    ? 'Exceptional! 🌟'
                    : rating === 4
                    ? 'Very Good! 👍'
                    : rating === 3
                    ? 'Average / Decent 🙂'
                    : 'Needs Improvement ⚠️'}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-bold text-[#AAB3C5] block mb-1.5 uppercase tracking-wider">
                What Stood Out? (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/20'
                          : 'bg-[#151C30] text-[#AAB3C5] hover:text-white border border-purple-500/20'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-xs font-bold text-[#AAB3C5] block mb-1.5 uppercase tracking-wider">
                Review Comments
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share your experience: How was the temperature, freshness, crunch, spice level?"
                className="w-full px-4 py-3 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8] transition-all"
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-extrabold text-xs shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Submit Feedback</span>
            </button>
          </form>
        </div>

        {/* 3. Community Feedback Stream */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Recent Student Reviews
            </h2>
            <span className="text-xs text-[#AAB3C5]">
              {feedbackList.length} reviews posted
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {feedbackList.map((item) => (
              <div
                key={item.id || item._id}
                className="p-5 rounded-3xl bg-[#1C263A]/90 backdrop-blur-xl border border-purple-500/20 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7955E8] to-[#526DFF] text-white flex items-center justify-center font-bold text-xs shadow-md">
                      {item.studentName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{item.studentName}</h4>
                      <p className="text-[10px] text-[#AAB3C5]">{item.createdAt || item.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-amber-300">{item.rating}.0</span>
                  </div>
                </div>

                <div className="bg-[#151C30] p-2.5 rounded-xl flex items-center gap-2 text-xs border border-purple-500/10">
                  <Utensils className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-extrabold text-white">{item.foodName}</span>
                </div>

                <p className="text-xs text-[#AAB3C5] leading-relaxed italic">
                  "{item.comment}"
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#151C30] border border-purple-500/20 text-purple-300"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Feedback Submission Success Pop-up Modal with Sound & Confetti */}
      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#1C263A] border-2 border-purple-500/40 rounded-3xl p-6 sm:p-7 text-white shadow-2xl text-center space-y-4 animate-scaleUp overflow-hidden"
          >
            {/* Ambient decorative glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setSuccessModalData(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-[#151C30] hover:bg-[#25334d] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Trophy / Sparkles Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 ring-4 ring-amber-400/20 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>

            {/* Heading & Confirmation */}
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Feedback Recorded Live
              </span>
              <h3 className="text-xl font-black text-white pt-1">
                Thank You for Your Feedback!
              </h3>
              <p className="text-xs text-slate-400">
                Your review has been successfully submitted and delivered directly to the Canteen Owner console.
              </p>
            </div>

            {/* Review Summary Box */}
            <div className="p-4 rounded-2xl bg-[#151C30] border border-purple-500/25 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm">{successModalData.foodName}</span>
                <div className="flex items-center gap-1">
                  {[...Array(successModalData.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-300 italic">
                "{successModalData.comment}"
              </p>
              {successModalData.tags && successModalData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {successModalData.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0B1020] text-purple-300 border border-purple-500/20">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSuccessModalData(null)}
                className="flex-1 py-3 rounded-xl bg-[#151C30] hover:bg-[#25334d] border border-purple-500/30 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Write Another Review
              </button>
              <Link
                to="/menu"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-black text-xs shadow-md shadow-purple-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Menu</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
