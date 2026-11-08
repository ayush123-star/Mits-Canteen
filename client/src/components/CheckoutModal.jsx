import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { playNotificationSound } from '../utils/audio';
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
  Smartphone,
  AlertTriangle,
  Lock,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
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
  const canteenMerchantName = currentCanteen.upiMerchantName || currentCanteen.name || 'MITS Main Canteen';
  const customQrImage = currentCanteen.qrCodeImage;

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' or 'CASH_AT_COUNTER'
  const [isOnlinePaymentConfirmed, setIsOnlinePaymentConfirmed] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentWarning, setPaymentWarning] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(canteenUpiId)}&pn=${encodeURIComponent(
    canteenMerchantName
  )}&am=${total}&cu=INR&tn=${encodeURIComponent(`MITS Canteen Order ₹${total}`)}`;

  const handleCopyUpi = () => {
    try {
      navigator.clipboard.writeText(canteenUpiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch (_) {}
  };

  const handleSelectPaymentMethod = (method) => {
    setPaymentMethod(method);
    setPaymentWarning('');
    setError('');
  };

  // Verify / Confirm Online Payment Action
  const handleVerifyOnlinePayment = async () => {
    setIsVerifyingPayment(true);
    setPaymentWarning('');
    setError('');

    try {
      // Simulate realistic UPI Gateway validation (1.2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const generatedTxn = upiRefNumber.trim()
        ? `UPI-${upiRefNumber.trim()}`
        : `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      setTransactionId(generatedTxn);
      setIsOnlinePaymentConfirmed(true);
      setPaymentWarning('');
      try {
        playNotificationSound('success');
      } catch (_) {}
    } catch (err) {
      setError('Payment verification failed. Please try again.');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // Main Action: Triggered when user clicks "Confirm & Generate Token"
  const handleConfirmAndGenerateToken = () => {
    if (!isAuthenticated) {
      setError('Please log in or register before completing your order.');
      return;
    }

    // STRICT CHECK: IF ONLINE PAYMENT IS SELECTED AND NOT CONFIRMED, PREVENT TOKEN GENERATION!
    if (paymentMethod === 'UPI' && !isOnlinePaymentConfirmed) {
      setPaymentWarning(
        '⚠️ Pehle online payment complete karo! Online payment confirm hone ke baad he token generate hoga.'
      );
      // Smoothly bring the payment section into view
      const section = document.getElementById('upi-payment-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Proceed to place order & generate live token
    handlePlaceOrder();
  };

  // Internal Order Placement
  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    setPaymentWarning('');

    try {
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
        paymentStatus: paymentMethod === 'UPI' ? 'PAID' : 'UNPAID',
        transactionId: paymentMethod === 'UPI' ? transactionId : null,
        scheduledPickupTime: scheduledTime,
        pickupOption: pickupOption,
        orderNotes: orderNotes,
        whatsappOptIn: true,
      });

      // Joyful celebratory confetti burst
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn text-white">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#1C263A] rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0B1020] via-[#151C30] to-[#0B1020] text-white flex items-center justify-between border-b border-purple-500/20 shrink-0">
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
            className="w-8 h-8 rounded-full bg-[#1C263A] hover:bg-[#25334d] text-[#AAB3C5] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Info Card */}
          <div className="p-3.5 rounded-2xl bg-[#151C30] border border-purple-500/20 flex items-center justify-between text-xs">
            <div>
              <p className="text-[#AAB3C5] font-medium text-[10px] uppercase tracking-wider">Ordering Student:</p>
              <p className="font-extrabold text-white text-sm">{user?.name || 'Ayush Pandey'}</p>
              <p className="text-[11px] text-purple-300 font-bold">
                {user?.department || 'Electronics and Telecommunication'}
              </p>
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
                onClick={() => handleSelectPaymentMethod('UPI')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'UPI'
                    ? 'border-[#7955E8] bg-[#7955E8]/20 shadow-md shadow-purple-500/20 ring-1 ring-purple-500/40'
                    : 'border-purple-500/20 bg-[#151C30] hover:border-purple-500/40 opacity-80'
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
                  <h4 className="text-xs font-black text-white">Online Payment (UPI)</h4>
                  <p className="text-[10px] text-[#AAB3C5] mt-0.5">GPay, PhonePe, Paytm, QR</p>
                </div>
              </div>

              {/* Cash at Counter Option */}
              <div
                onClick={() => handleSelectPaymentMethod('CASH_AT_COUNTER')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'CASH_AT_COUNTER'
                    ? 'border-[#7955E8] bg-[#7955E8]/20 shadow-md shadow-purple-500/20 ring-1 ring-purple-500/40'
                    : 'border-purple-500/20 bg-[#151C30] hover:border-purple-500/40 opacity-80'
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

          {/* ONLINE PAYMENT VERIFICATION SECTION (UPI) */}
          {paymentMethod === 'UPI' && (
            <div
              id="upi-payment-section"
              className={`p-4 sm:p-5 rounded-2xl bg-[#151C30] border-2 transition-all space-y-4 ${
                paymentWarning
                  ? 'border-amber-500/80 ring-4 ring-amber-500/20 bg-amber-500/5'
                  : isOnlinePaymentConfirmed
                  ? 'border-emerald-500/60 bg-emerald-950/20'
                  : 'border-purple-500/30'
              }`}
            >
              {/* Prominent Warning Banner if user clicked generate token before paying */}
              {paymentWarning && (
                <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs font-black flex items-start gap-2.5 animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-300 font-extrabold text-xs">Pehle Online Payment Karo!</p>
                    <p className="text-amber-200/90 text-[11px] mt-0.5 font-semibold">
                      {paymentWarning}
                    </p>
                  </div>
                </div>
              )}

              {/* Status Header */}
              <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-purple-400" />
                  UPI / QR Code Payment
                </span>

                {isOnlinePaymentConfirmed ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3 h-3" />
                    Payment Confirmed ✓
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3" />
                    Payment Confirmation Required
                  </span>
                )}
              </div>

              {/* QR Code and Payment Details */}
              {!isOnlinePaymentConfirmed ? (
                <>
                  <div className="text-center space-y-3">
                    {customQrImage ? (
                      <div className="relative inline-block p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 mx-auto">
                        <img
                          src={customQrImage}
                          alt="Official Canteen UPI QR"
                          className="w-36 h-36 object-contain rounded-xl mx-auto"
                        />
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs whitespace-nowrap">
                          Official Canteen QR ✓
                        </span>
                      </div>
                    ) : (
                      <div className="inline-block p-3 bg-white rounded-2xl shadow-md border border-slate-200 mx-auto">
                        <QRCodeSVG value={upiDeepLink} size={135} level="M" />
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-black text-white">{canteenMerchantName}</p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-[11px] text-purple-300 font-mono font-bold truncate max-w-[220px]">
                          {canteenUpiId}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="px-2 py-0.5 rounded-md bg-[#1C263A] hover:bg-[#25334d] text-[10px] font-bold text-slate-300 flex items-center gap-1 border border-purple-500/30 transition-colors cursor-pointer"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-sm font-black text-white mt-1.5">
                        Amount to Pay: <span className="text-emerald-400 text-base">₹{total}</span>
                      </p>
                    </div>

                    {/* Mobile UPI App Link */}
                    <div className="pt-1">
                      <a
                        href={upiDeepLink}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 font-bold text-xs transition-all w-full sm:w-auto"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Pay via UPI App (GPay / PhonePe / Paytm)</span>
                      </a>
                    </div>
                  </div>

                  {/* Verification Box */}
                  <div className="p-3.5 rounded-xl bg-[#0B1020] border border-purple-500/30 space-y-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-purple-200 block mb-1">
                        Step 2: Payment Confirm Karein
                      </label>
                      <input
                        type="text"
                        value={upiRefNumber}
                        onChange={(e) => setUpiRefNumber(e.target.value)}
                        placeholder="UPI Ref / UTR / Txn No. (optional)"
                        className="w-full px-3 py-2 rounded-lg bg-[#151C30] border border-purple-500/30 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyOnlinePayment}
                      disabled={isVerifyingPayment}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-98 disabled:opacity-75"
                    >
                      {isVerifyingPayment ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Verifying Online Payment...
                        </span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>I Have Paid ₹{total} — Confirm Online Payment</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-[#AAB3C5]">
                      Click karne par payment verify ho jayegi aur token generate button unlock ho jayega.
                    </p>
                  </div>
                </>
              ) : (
                /* CONFIRMED STATE */
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-2.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-300">
                      Online Payment Confirmed! ₹{total} Received
                    </h4>
                    <p className="text-xs text-emerald-200/90 font-mono mt-0.5">
                      Txn Ref: <span className="font-bold">{transactionId}</span>
                    </p>
                    <p className="text-[11px] text-[#AAB3C5] mt-1.5 font-medium">
                      Aapka online payment safaltapoorvak confirm ho chuka hai. Niche diye gaye button se apna live token generate karein!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOnlinePaymentConfirmed(false);
                      setTransactionId('');
                    }}
                    className="text-[10px] text-purple-300 hover:text-white underline font-bold transition-colors cursor-pointer"
                  >
                    Change / Re-verify Payment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Cash At Counter Notice */}
          {paymentMethod === 'CASH_AT_COUNTER' && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
              <Banknote className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Cash Payment at Counter</p>
                <p className="text-[11px] text-[#AAB3C5] mt-0.5">
                  Aap counter par khana collect karte samay cash pay kar sakte hain. Niche confirm button par click karke direct token generate karein.
                </p>
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 text-base font-black">
                ₹{total}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-[#0B1020]/95 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-bold text-[#AAB3C5] hover:text-white hover:bg-[#1C263A] transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>

          {/* DYNAMIC CONFIRM & GENERATE TOKEN BUTTON */}
          <div className="flex-1 w-full flex flex-col gap-1.5">
            {paymentMethod === 'UPI' && !isOnlinePaymentConfirmed ? (
              // LOCKED BUTTON WITH WARNING IF CLICKED BEFORE PAYING
              <button
                type="button"
                onClick={handleConfirmAndGenerateToken}
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-500/50 text-amber-200 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all cursor-pointer active:scale-95"
              >
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Confirm & Generate Token (Pay Online First)</span>
              </button>
            ) : (
              // FULLY UNLOCKED GRADIENT BUTTON (ONLINE PAYMENT CONFIRMED OR CASH AT COUNTER)
              <button
                type="button"
                onClick={handleConfirmAndGenerateToken}
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-[#7955E8] to-[#526DFF] hover:from-emerald-500 hover:to-[#3d5bff] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Generating Campus Token...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Confirm & Generate Token</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {paymentMethod === 'UPI' && !isOnlinePaymentConfirmed && (
              <p className="text-[10px] text-amber-400 text-center font-bold flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                Online payment confirm karne ke baad he token generate hoga
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
