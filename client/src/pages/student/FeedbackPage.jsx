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
  const { menuItems, submitFeedback } = useData();

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn text-white">
      {/* 1. Header Banner */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl border border-purple-500/20 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Rate Dishes & Student Feedback
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-2 max-w-xl">
            Help the canteen chefs refine flavors, portion sizes, and prep speed by sharing your dining experience.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 bg-[#151C30] px-4 py-2.5 rounded-2xl border border-purple-500/20 shadow-md shrink-0">
          <Award className="w-5 h-5 text-purple-400 shrink-0" />
          <div className="text-xs text-left">
            <p className="text-[#AAB3C5] font-medium text-[11px]">Campus Food Rating</p>
            <p className="font-black text-white text-sm">4.8 / 5.0 (Campus Kitchen)</p>
          </div>
        </div>
      </div>

      {/* 2. Write Your Feedback Form (Focused Centered Section) */}
      <div className="max-w-2xl mx-auto bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-2xl p-6 sm:p-10 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-purple-500/15">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#7955E8] to-[#526DFF] text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/30 shrink-0">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Write Your Feedback</h2>
            <p className="text-xs text-[#AAB3C5]">Submit your dish review directly to the Canteen Owner console.</p>
          </div>
        </div>

        {submittedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Thank you! Your feedback has been received and sent to the Canteen Owner section.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Food Selector */}
          <div>
            <label className="text-xs font-bold text-[#AAB3C5] block mb-1.5 uppercase tracking-wider">
              Select Dish You Ordered
            </label>
            <select
              value={selectedFoodId}
              onChange={(e) => setSelectedFoodId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#151C30] border border-purple-500/25 text-xs font-bold text-white focus:outline-none focus:border-[#7955E8] shadow-xs"
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
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  title={`${star} Star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs font-black text-amber-400">
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

          {/* Stand-Out Tags */}
          <div>
            <label className="text-xs font-bold text-[#AAB3C5] block mb-1.5 uppercase tracking-wider">
              What Stood Out? (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {POPULAR_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

          {/* Review Comment */}
          <div>
            <label className="text-xs font-bold text-[#AAB3C5] block mb-1.5 uppercase tracking-wider">
              Review Comments
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share your experience: How was the temperature, freshness, crunch, spice level, or portion size?"
              className="w-full px-4 py-3 rounded-2xl bg-[#151C30] border border-purple-500/25 text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8] transition-all"
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-extrabold text-sm shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>Submit Feedback</span>
          </button>
        </form>
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
