import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Smartphone
} from 'lucide-react';

export const CheckoutModal = ({ isOpen, onClose, onOrderPlaced }) => {
  const {
    cartItems,
    subtotal,
    discountAmount,
    total,
    couponCode,
    pickupOption,
    scheduledTime,
    orderNotes,
    clearCart,
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { placeOrder, canteens } = useData();

  const currentCanteen = (canteens && canteens[0]) || {};
  const canteenUpiId = currentCanteen.upiId || 'smartcampus.canteen@okhdfcbank';
  const canteenMerchantName = currentCanteen.upiMerchantName || currentCanteen.name || 'Smart Campus Canteen';
  const customQrImage = currentCanteen.qrCodeImage;

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [upiPaymentInitiated, setUpiPaymentInitiated] = useState(false);

  if (!isOpen) return null;

  // Handle Order Placement
  const handlePlaceOrder = async (isSimulatedUpiSuccess = false) => {
    if (!isAuthenticated) {
      setError('Please log in or register before completing your order.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate minor network delay for realistic experience
      await new Promise((resolve) => setTimeout(resolve, 600));

      const createdOrder = placeOrder({
        studentId: user?.id || user?._id || 'user-stu-1',
        studentName: user?.name || 'Ayush Pandey',
        studentEmail: user?.email || 'ayushpandey1603@gmail.com',
        studentRoll: user?.studentId || user?.enrollmentNumber || user?.rollNumber || 'BTET25O1039',
        studentEnrollment: user?.studentId || user?.enrollmentNumber || user?.rollNumber || 'BTET25O1039',
        studentDepartment: user?.department || 'Electronics and Telecommunication',
        studentPhone: user?.phone || '+91 98765 43210',
        items: cartItems.map((item) => ({
          foodId: item.food._id || item.food.id,
          name: item.food.name,
          price: item.food.price,
          quantity: item.quantity,
          isVeg: item.food.isVeg,
          specialInstructions: item.specialInstructions || '',
          counter: item.food.counter || 1,
        })),
        totalAmount: subtotal,
        discountAmount: discountAmount,
        finalAmount: total,
        couponCode: couponCode,
        paymentMethod: paymentMethod,
        scheduledPickupTime: scheduledTime,
        pickupOption: pickupOption,
        orderNotes: orderNotes,
        whatsappOptIn: true,
      });

      // Confetti burst for joyful zero-queue experience
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7955E8', '#526DFF', '#10B981'],
      });

      clearCart();
      onClose();
      if (onOrderPlaced) {
        onOrderPlaced(createdOrder);
      }
    } catch (err) {
      console.error('Order placement failed:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn text-white">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#1C263A] rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0B1020] via-[#151C30] to-[#0B1020] text-white flex items-center justify-between border-b border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Confirm Campus Order</h3>
              <p className="text-xs text-[#AAB3C5]">Fast Token Generation & Queue-Free Pickup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C263A] hover:bg-[#25334d] text-[#AAB3C5] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Student Info Box */}
          <div className="p-3.5 rounded-2xl bg-[#151C30] border border-purple-500/20 flex items-center justify-between text-xs">
            <div>
              <p className="text-[#AAB3C5] font-medium text-[10px] uppercase tracking-wider">Ordering Student:</p>
              <p className="font-extrabold text-white text-sm">{user?.name || 'Ayush Pandey'}</p>
              <p className="text-[11px] text-purple-300 font-bold">{user?.department || 'Electronics and Telecommunication'}</p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-lg bg-[#0B1020] text-purple-200 font-mono font-black text-xs border border-purple-500/30 shadow-xs inline-block">
                Enroll: {user?.studentId || user?.enrollmentNumber || 'BTET25O1039'}
              </span>
              <p className="text-[10px] text-[#AAB3C5] mt-1 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-purple-400" />
                {scheduledTime}
              </p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-2.5">
              Select Payment Method
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* UPI Option */}
              <div
                onClick={() => {
                  setPaymentMethod('UPI');
                  setUpiPaymentInitiated(false);
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'UPI'
                    ? 'border-[#7955E8] bg-[#7955E8]/15 shadow-md shadow-purple-500/20'
                    : 'border-purple-500/20 bg-[#151C30] hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  {paymentMethod === 'UPI' && (
                    <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-black text-white">UPI / QR Payment</h4>
                  <p className="text-[10px] text-[#AAB3C5] mt-0.5">GPay, PhonePe, Paytm, BHIM</p>
                </div>
              </div>

              {/* Cash at Counter Option */}
              <div
                onClick={() => {
                  setPaymentMethod('CASH_AT_COUNTER');
                  setUpiPaymentInitiated(false);
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'CASH_AT_COUNTER'
                    ? 'border-[#7955E8] bg-[#7955E8]/15 shadow-md shadow-purple-500/20'
                    : 'border-purple-500/20 bg-[#151C30] hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                    <Banknote className="w-4 h-4" />
                  </div>
                  {paymentMethod === 'CASH_AT_COUNTER' && (
                    <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-black text-white">Cash at Counter</h4>
                  <p className="text-[10px] text-[#AAB3C5] mt-0.5">Pay when collecting food</p>
                </div>
              </div>
            </div>
          </div>

          {/* UPI Live QR Screen if UPI is chosen */}
          {paymentMethod === 'UPI' && (
            <div className="p-4 rounded-2xl bg-[#151C30] border border-purple-500/30 text-center space-y-3">
              {customQrImage ? (
                <div className="relative inline-block p-2.5 bg-white rounded-2xl shadow-sm border border-slate-200 mx-auto">
                  <img
                    src={customQrImage}
                    alt="Official Canteen UPI QR"
                    className="w-36 h-36 object-contain rounded-xl mx-auto"
                  />
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs whitespace-nowrap">
                    Official Canteen QR ✓
                  </span>
                </div>
              ) : (
                <div className="inline-block p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                  <QRCodeSVG
                    value={`upi://pay?pa=${canteenUpiId}&pn=${encodeURIComponent(canteenMerchantName)}&am=${total}&cu=INR`}
                    size={140}
                    level="M"
                  />
                </div>
              )}

              <div>
                <p className="text-xs font-black text-white">{canteenMerchantName}</p>
                <p className="text-[11px] text-purple-300 font-mono font-bold mt-0.5 truncate">
                  UPI ID: {canteenUpiId}
                </p>
                <p className="text-xs font-extrabold text-white mt-1">Payable Amount: ₹{total}</p>
              </div>

              <div className="bg-[#1C263A] border border-purple-500/25 text-purple-200 p-2.5 rounded-xl text-[11px]">
                📱 Testing on campus laptop? Click below to complete UPI verification directly:
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="border-t border-purple-500/20 pt-3 space-y-1.5 text-xs text-[#AAB3C5]">
            <div className="flex justify-between">
              <span>Items Total ({cartItems.length} items)</span>
              <span className="font-semibold text-white">₹{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Campus Promo Discount</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-purple-500/20">
              <span>Final Payable Amount</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 text-base font-black">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-[#0B1020]/90 border-t border-purple-500/20 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl text-xs font-bold text-[#AAB3C5] hover:text-white hover:bg-[#1C263A] transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => handlePlaceOrder(true)}
            disabled={loading}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Generating Campus Token...
              </span>
            ) : (
              <>
                <span>Confirm & Generate Token</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
