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
  Building2,
  Wallet,
  ChevronRight,
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

  // Primary payment type: 'ONLINE' or 'CASH_AT_COUNTER' (Zomato/Swiggy style)
  const [paymentType, setPaymentType] = useState('ONLINE'); // 'ONLINE' | 'CASH_AT_COUNTER'

  // Online sub-categories: 'UPI' | 'CARDS' | 'NETBANKING_WALLETS'
  const [onlineCategory, setOnlineCategory] = useState('UPI');

  // Specific selections
  const [selectedUpiApp, setSelectedUpiApp] = useState('GPAY'); // 'GPAY', 'PHONEPE', 'PAYTM', 'CRED', 'QR'
  const [selectedBank, setSelectedBank] = useState('HDFC'); // 'HDFC', 'SBI', 'ICICI', 'AXIS', 'PAYTM_WALLET', 'AMAZON_PAY'
  const [cardForm, setCardForm] = useState({
    number: '4532 •••• •••• 8821',
    name: user?.name || 'Ayush Pandey',
    expiry: '09/28',
    cvv: '•••',
  });

  // Online Verification States
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

  const handleSelectPrimaryType = (type) => {
    setPaymentType(type);
    setPaymentWarning('');
    setError('');
  };

  // Simulated gateway verification for online payment
  const handleVerifyOnlinePayment = async (methodLabel = 'UPI') => {
    setIsVerifyingPayment(true);
    setPaymentWarning('');
    setError('');

    try {
      // Simulate real-time RBI/NPCI-compliant gateway handshake (1.2s)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const generatedTxn = upiRefNumber.trim()
        ? `${methodLabel}-${upiRefNumber.trim()}`
        : `${methodLabel}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      setTransactionId(generatedTxn);
      setIsOnlinePaymentConfirmed(true);
      setPaymentWarning('');
      try {
        playNotificationSound('success');
      } catch (_) {}
    } catch (err) {
      setError('Payment verification timed out. Please try again.');
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

    // STRICT ZOMATO/SWIGGY CHECK: If ONLINE payment selected, it MUST be confirmed before generating token!
    if (paymentType === 'ONLINE' && !isOnlinePaymentConfirmed) {
      setPaymentWarning(
        '⚠️ Pehle online payment complete karo! Online payment confirm hone ke baad he token generate hoga.'
      );
      const section = document.getElementById('online-payment-section');
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

      const isOnline = paymentType === 'ONLINE';
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
        paymentMethod: isOnline ? (onlineCategory === 'CARDS' ? 'CARD' : 'UPI') : 'CASH_AT_COUNTER',
        paymentStatus: isOnline ? 'PAID' : 'UNPAID',
        transactionId: isOnline ? transactionId : null,
        scheduledPickupTime: scheduledTime,
        pickupOption: pickupOption,
        orderNotes: orderNotes,
        whatsappOptIn: true,
      });

      // Joyful celebratory confetti burst
      confetti({
        particleCount: 110,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn text-white">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#1C263A] rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0B1020] via-[#151C30] to-[#0B1020] text-white flex items-center justify-between border-b border-purple-500/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">Payment & Live Token Generation</h3>
              <p className="text-[11px] text-[#AAB3C5]">Select your payment method (Zomato / Swiggy Style)</p>
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
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
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

          {/* 1. TOP-LEVEL PAYMENT METHOD SELECTOR (ONLINE vs CASH) */}
          <div>
            <label className="text-xs font-black text-slate-200 uppercase tracking-wider block mb-2">
              Payment Options
            </label>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* Online Option */}
              <div
                onClick={() => handleSelectPrimaryType('ONLINE')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentType === 'ONLINE'
                    ? 'border-[#7955E8] bg-gradient-to-b from-[#7955E8]/25 to-[#1C263A] shadow-md shadow-purple-500/20 ring-1 ring-purple-500/40'
                    : 'border-purple-500/20 bg-[#151C30] hover:border-purple-500/40 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  {paymentType === 'ONLINE' && (
                    <span className="w-5 h-5 rounded-full bg-[#7955E8] text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </div>
                <div className="mt-2.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-white">Pay Online</h4>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Instant
                    </span>
                  </div>
                  <p className="text-[10px] text-[#AAB3C5] mt-0.5">UPI, GPay, Cards, Wallets</p>
                </div>
              </div>

              {/* Cash on Pickup Option */}
              <div
                onClick={() => handleSelectPrimaryType('CASH_AT_COUNTER')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentType === 'CASH_AT_COUNTER'
                    ? 'border-[#7955E8] bg-gradient-to-b from-[#7955E8]/25 to-[#1C263A] shadow-md shadow-purple-500/20 ring-1 ring-purple-500/40'
                    : 'border-purple-500/20 bg-[#151C30] hover:border-purple-500/40 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                    <Banknote className="w-4 h-4" />
                  </div>
                  {paymentType === 'CASH_AT_COUNTER' && (
                    <span className="w-5 h-5 rounded-full bg-[#7955E8] text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </div>
                <div className="mt-2.5">
                  <h4 className="text-xs font-black text-white">Cash at Counter</h4>
                  <p className="text-[10px] text-[#AAB3C5] mt-0.5">Pay in cash upon pickup</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. ONLINE PAYMENT GATEWAY HUB (UPI, CARDS, NETBANKING) */}
          {paymentType === 'ONLINE' && (
            <div
              id="online-payment-section"
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
                    <p className="text-amber-300 font-extrabold text-xs">Online Payment Required!</p>
                    <p className="text-amber-200/90 text-[11px] mt-0.5 font-semibold">
                      {paymentWarning}
                    </p>
                  </div>
                </div>
              )}

              {/* Status Header */}
              <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Secure Online Gateway (RBI Compliant)
                </span>

                {isOnlinePaymentConfirmed ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3 h-3" />
                    Payment Confirmed ✓
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                    <Lock className="w-3 h-3" />
                    Pay to Unlock Token
                  </span>
                )}
              </div>

              {!isOnlinePaymentConfirmed ? (
                <>
                  {/* Zomato/Swiggy Category Sub-Tabs */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#0B1020] border border-purple-500/20">
                    <button
                      type="button"
                      onClick={() => setOnlineCategory('UPI')}
                      className={`py-2 px-2 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        onlineCategory === 'UPI'
                          ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md'
                          : 'text-[#AAB3C5] hover:text-white'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>UPI & QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOnlineCategory('CARDS')}
                      className={`py-2 px-2 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        onlineCategory === 'CARDS'
                          ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md'
                          : 'text-[#AAB3C5] hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Cards</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOnlineCategory('NETBANKING_WALLETS')}
                      className={`py-2 px-2 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        onlineCategory === 'NETBANKING_WALLETS'
                          ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md'
                          : 'text-[#AAB3C5] hover:text-white'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>NetBanking</span>
                    </button>
                  </div>

                  {/* SUB-VIEW 1: UPI & QR CODE */}
                  {onlineCategory === 'UPI' && (
                    <div className="space-y-3.5 pt-1">
                      {/* Popular UPI Apps Pill Selector */}
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#AAB3C5] mb-1.5">Choose UPI App:</p>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: 'GPAY', name: 'Google Pay', icon: '🟢' },
                            { id: 'PHONEPE', name: 'PhonePe', icon: '🟣' },
                            { id: 'PAYTM', name: 'Paytm UPI', icon: '🔵' },
                            { id: 'CRED', name: 'CRED / BHIM', icon: '⚡' },
                          ].map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => setSelectedUpiApp(app.id)}
                              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                selectedUpiApp === app.id
                                  ? 'border-[#7955E8] bg-[#7955E8]/20 ring-1 ring-purple-400 text-white'
                                  : 'border-purple-500/20 bg-[#0B1020] text-slate-300 hover:border-purple-400/40'
                              }`}
                            >
                              <span className="text-sm block">{app.icon}</span>
                              <span className="text-[10px] font-black block mt-0.5 truncate">{app.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Official QR Code Box */}
                      <div className="text-center p-3.5 rounded-2xl bg-[#0B1020] border border-purple-500/25 space-y-2.5">
                        {customQrImage ? (
                          <div className="relative inline-block p-2 bg-white rounded-xl shadow-md border border-slate-200 mx-auto">
                            <img
                              src={customQrImage}
                              alt="Official Canteen UPI QR"
                              className="w-32 h-32 object-contain rounded-lg mx-auto"
                            />
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs whitespace-nowrap">
                              Official QR ✓
                            </span>
                          </div>
                        ) : (
                          <div className="inline-block p-2.5 bg-white rounded-xl shadow-md border border-slate-200 mx-auto">
                            <QRCodeSVG value={upiDeepLink} size={120} level="M" />
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-black text-white">{canteenMerchantName}</p>
                          <div className="flex items-center justify-center gap-2 mt-0.5">
                            <span className="text-[11px] text-purple-300 font-mono font-bold truncate max-w-[210px]">
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
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs font-black text-white mt-1">
                            Amount: <span className="text-emerald-400 font-bold text-sm">₹{total}</span>
                          </p>
                        </div>

                        {/* Pay via UPI App Deep Link */}
                        <a
                          href={upiDeepLink}
                          className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 font-bold text-xs transition-all w-full"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Pay via UPI App (GPay / PhonePe / Paytm)</span>
                        </a>
                      </div>

                      {/* Verify Action Button */}
                      <button
                        type="button"
                        onClick={() => handleVerifyOnlinePayment('UPI')}
                        disabled={isVerifyingPayment}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-98 disabled:opacity-75"
                      >
                        {isVerifyingPayment ? (
                          <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Connecting to UPI Gateway...
                          </span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                            <span>I Have Paid ₹{total} — Confirm Online Payment</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* SUB-VIEW 2: CREDIT / DEBIT CARDS */}
                  {onlineCategory === 'CARDS' && (
                    <div className="space-y-3 pt-1">
                      {/* Visual Card Card */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 border border-purple-400/40 shadow-lg space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[10px] text-purple-200 tracking-wider">CAMPUS DINING CARD</span>
                          <span className="font-bold text-amber-300 text-xs">RuPay / Visa</span>
                        </div>
                        <p className="font-mono text-base font-bold tracking-widest text-white">
                          {cardForm.number}
                        </p>
                        <div className="flex items-center justify-between text-[11px] font-mono text-purple-200">
                          <span>{cardForm.name}</span>
                          <span>EXP: {cardForm.expiry}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-[#AAB3C5] block mb-0.5">Card Number</label>
                          <input
                            type="text"
                            value={cardForm.number}
                            onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-[#0B1020] border border-purple-500/30 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                            placeholder="Card Number"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-[#AAB3C5] block mb-0.5">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              value={cardForm.expiry}
                              onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-[#0B1020] border border-purple-500/30 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#AAB3C5] block mb-0.5">CVV</label>
                            <input
                              type="password"
                              value={cardForm.cvv}
                              maxLength={4}
                              onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-[#0B1020] border border-purple-500/30 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pay via Card Button */}
                      <button
                        type="button"
                        onClick={() => handleVerifyOnlinePayment('CARD')}
                        disabled={isVerifyingPayment}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-98 disabled:opacity-75"
                      >
                        {isVerifyingPayment ? (
                          <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Authorizing Card Payment ₹{total}...
                          </span>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 text-emerald-200" />
                            <span>Pay ₹{total} via Card & Confirm</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* SUB-VIEW 3: NETBANKING & WALLETS */}
                  {onlineCategory === 'NETBANKING_WALLETS' && (
                    <div className="space-y-3 pt-1">
                      <p className="text-[10px] uppercase font-bold text-[#AAB3C5]">Select Popular Bank / Wallet:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'HDFC', name: 'HDFC Bank', icon: '🏦' },
                          { id: 'SBI', name: 'State Bank of India', icon: '🏛️' },
                          { id: 'ICICI', name: 'ICICI Bank', icon: '🏢' },
                          { id: 'AXIS', name: 'Axis Bank', icon: '💼' },
                          { id: 'PAYTM_WALLET', name: 'Paytm Wallet', icon: '👛' },
                          { id: 'AMAZON_PAY', name: 'Amazon Pay', icon: '📦' },
                        ].map((bank) => (
                          <button
                            key={bank.id}
                            type="button"
                            onClick={() => setSelectedBank(bank.id)}
                            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              selectedBank === bank.id
                                ? 'border-[#7955E8] bg-[#7955E8]/20 ring-1 ring-purple-400 text-white'
                                : 'border-purple-500/20 bg-[#0B1020] text-slate-300 hover:border-purple-400/40'
                            }`}
                          >
                            <span className="text-base">{bank.icon}</span>
                            <span className="text-[11px] font-black truncate">{bank.name}</span>
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleVerifyOnlinePayment('NETBANKING')}
                        disabled={isVerifyingPayment}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-98 disabled:opacity-75"
                      >
                        {isVerifyingPayment ? (
                          <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Connecting to Bank Gateway...
                          </span>
                        ) : (
                          <>
                            <Building2 className="w-4 h-4 text-emerald-200" />
                            <span>Pay ₹{total} via {selectedBank}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* 3. VERIFIED STATE (CONFIRMED BADGE) */
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
                    <p className="text-[11px] text-[#AAB3C5] mt-1 font-medium">
                      Aapka payment safaltapoorvak confirm ho gaya hai! Niche diye gaye button se apna token generate karein.
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
          {paymentType === 'CASH_AT_COUNTER' && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
              <Banknote className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-xs sm:text-sm">Pay Cash at Counter 1</p>
                <p className="text-[11px] text-[#AAB3C5] mt-0.5">
                  Aap counter par khana lete samay ₹{total} cash pay kar sakte hain. Niche confirm button par click karke direct apna token generate karein.
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
        <div className="p-4 sm:p-5 bg-[#0B1020]/95 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-bold text-[#AAB3C5] hover:text-white hover:bg-[#1C263A] transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>

          {/* DYNAMIC CONFIRM & GENERATE TOKEN BUTTON */}
          <div className="flex-1 w-full flex flex-col gap-1.5">
            {paymentType === 'ONLINE' && !isOnlinePaymentConfirmed ? (
              // LOCKED BUTTON WITH PROMINENT WARNING IF CLICKED BEFORE PAYING
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
                    <span>
                      Confirm & Generate Token {paymentType === 'CASH_AT_COUNTER' ? '(Cash at Counter)' : ''}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {paymentType === 'ONLINE' && !isOnlinePaymentConfirmed && (
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
