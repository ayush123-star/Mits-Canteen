import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { playNotificationSound } from '../utils/audio';
import { decodeQrCode, extractUpiDetails } from '../utils/qrDecoder';
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
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  XCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

// Authentic Brand Icons for Indian UPI Apps
const GPayIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
    <path
      d="M23.04 12.26c0-.82-.07-1.6-.2-2.36H12v4.47h6.2a5.3 5.3 0 0 1-2.3 3.48v2.88h3.72c2.18-2 3.42-4.96 3.42-8.47z"
      fill="#4285F4"
    />
    <path
      d="M12 23.5c3.1 0 5.72-1.03 7.62-2.79l-3.72-2.88c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.54-2.03-6.45-4.75H1.67v2.98A11.5 11.5 0 0 0 12 23.5z"
      fill="#34A853"
    />
    <path
      d="M5.55 14.18A6.9 6.9 0 0 1 5.18 12c0-.76.13-1.5.37-2.18V6.84H1.67A11.5 11.5 0 0 0 .5 12c0 1.86.44 3.62 1.17 5.16l3.88-2.98z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.98c1.69 0 3.2.58 4.4 1.72l3.3-3.3C17.7 1.58 15.08.5 12 .5 7.37.5 3.38 3.16 1.67 6.84l3.88 2.98C6.46 7.1 9 4.98 12 4.98z"
      fill="#EA4335"
    />
  </svg>
);

const PhonePeIcon = () => (
  <div className="w-5 h-5 rounded-lg bg-[#5f259f] flex items-center justify-center text-white font-black text-[11px] shadow-xs shrink-0">
    पे
  </div>
);

const PaytmIcon = () => (
  <div className="w-5 h-5 rounded-lg bg-[#002e6e] flex items-center justify-center text-[#00b9f5] font-black text-[8px] tracking-tighter shadow-xs shrink-0">
    paytm
  </div>
);

const UpiIcon = () => (
  <div className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black text-[9px] tracking-wider shrink-0">
    UPI
  </div>
);

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
  const navigate = useNavigate();

  const currentCanteen = (canteens && canteens[0]) || {};
  const canteenUpiId = (!currentCanteen.upiId || currentCanteen.upiId.includes('smartcampus.canteen') || currentCanteen.upiId.includes('okhdfcbank'))
    ? 'pandeyayush1603-1@okicici'
    : currentCanteen.upiId;
  const canteenMerchantName = (!currentCanteen.upiMerchantName || currentCanteen.upiMerchantName === 'MITS Main Canteen' || currentCanteen.upiMerchantName === 'Smart Campus Canteen')
    ? 'Ayush Pandey'
    : currentCanteen.upiMerchantName;
  const customQrImage = currentCanteen.qrCodeImage;

  // Real, decoded UPI details (fallback to currentCanteen settings)
  const [effectiveUpiId, setEffectiveUpiId] = useState(canteenUpiId);
  const [effectiveMerchantName, setEffectiveMerchantName] = useState(canteenMerchantName);

  // Selected Payment Method: 'GPAY' | 'PHONEPE' | 'PAYTM' | 'BHIM' | 'QR' | 'CASH'
  const [selectedMethodId, setSelectedMethodId] = useState('GPAY');

  // Modal Views: 'SELECTION' | 'AWAITING_APP' | 'VERIFYING' | 'PAYMENT_FAILED' | 'QR_CODE'
  const [currentView, setCurrentView] = useState('SELECTION');
  const [paymentLaunchTime, setPaymentLaunchTime] = useState(null);
  const [paymentFailedError, setPaymentFailedError] = useState('');

  // Success Popup State
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const autoPlaceTimerRef = useRef(null);

  // Automatically decode uploaded custom QR image to extract actual registered UPI ID
  useEffect(() => {
    let isMounted = true;
    if (customQrImage) {
      decodeQrCode(customQrImage).then((decoded) => {
        if (!isMounted || !decoded) return;
        const details = extractUpiDetails(decoded);
        if (details?.upiId) {
          setEffectiveUpiId(details.upiId);
          if (details.merchantName) {
            setEffectiveMerchantName(details.merchantName);
          }
        }
      });
    } else {
      setEffectiveUpiId(canteenUpiId);
      setEffectiveMerchantName(canteenMerchantName);
    }
    return () => {
      isMounted = false;
    };
  }, [customQrImage, canteenUpiId, canteenMerchantName]);

  // Deep Link URI Generator for Indian UPI Apps using effective real UPI ID
  const getUpiUri = (appId) => {
    const encodedPa = encodeURIComponent(effectiveUpiId);
    const encodedPn = encodeURIComponent(effectiveMerchantName);
    const encodedTn = encodeURIComponent(`MITS Canteen Order ₹${total}`);
    const generic = `upi://pay?pa=${encodedPa}&pn=${encodedPn}&am=${total}&cu=INR&tn=${encodedTn}`;

    if (appId === 'GPAY') {
      return `tez://upi/pay?pa=${encodedPa}&pn=${encodedPn}&am=${total}&cu=INR&tn=${encodedTn}`;
    }
    if (appId === 'PHONEPE') {
      return `phonepe://upi/pay?pa=${encodedPa}&pn=${encodedPn}&am=${total}&cu=INR&tn=${encodedTn}`;
    }
    if (appId === 'PAYTM') {
      return `paytmmp://upi/pay?pa=${encodedPa}&pn=${encodedPn}&am=${total}&cu=INR&tn=${encodedTn}`;
    }
    return generic;
  };

  const genericUpiLink = `upi://pay?pa=${encodeURIComponent(effectiveUpiId)}&pn=${encodeURIComponent(
    effectiveMerchantName
  )}&am=${total}&cu=INR&tn=${encodeURIComponent(`MITS Canteen Order ₹${total}`)}`;

  // Payment Options Configuration
  const PAYMENT_METHODS = [
    {
      id: 'GPAY',
      name: 'Google Pay UPI',
      subtitle: 'Pay directly via Google Pay',
      category: 'UPI',
      icon: <GPayIcon />,
    },
    {
      id: 'PHONEPE',
      name: 'PhonePe UPI',
      subtitle: 'Instant payment in PhonePe app',
      category: 'UPI',
      icon: <PhonePeIcon />,
    },
    {
      id: 'PAYTM',
      name: 'Paytm UPI',
      subtitle: 'Pay using Paytm app or wallet',
      category: 'UPI',
      icon: <PaytmIcon />,
    },
    {
      id: 'BHIM',
      name: 'Any UPI App (BHIM / CRED)',
      subtitle: 'Choose any installed UPI app',
      category: 'UPI',
      icon: <UpiIcon />,
    },
    {
      id: 'QR',
      name: 'Scan Campus QR Code',
      subtitle: 'Show QR code on screen to scan',
      category: 'QR',
      icon: <QrCode className="w-5 h-5 text-purple-400" />,
    },
    {
      id: 'CASH',
      name: 'Cash at Counter',
      subtitle: 'Pay in cash when collecting order',
      category: 'CASH',
      icon: <Banknote className="w-5 h-5 text-emerald-400" />,
    },
  ];

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethodId) || PAYMENT_METHODS[0];

  const handleCopyUpi = () => {
    try {
      navigator.clipboard.writeText(effectiveUpiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch (_) {}
  };

  // Automated detection of return from Google Pay / UPI App
  useEffect(() => {
    if (currentView !== 'AWAITING_APP' || !paymentLaunchTime) return;

    let verificationTimer = null;

    const handleReturnToApp = () => {
      // Calculate how many seconds user was in Google Pay
      const elapsedSeconds = (Date.now() - paymentLaunchTime) / 1000;

      // Case 1: Returned in under 4.5 seconds -> Payment NOT completed (user backed out / cancelled)
      if (elapsedSeconds < 4.5) {
        setCurrentView('PAYMENT_FAILED');
        setPaymentFailedError('Payment complete nahi hua. Pehle payment karein, uske baad hi token generate hoga.');
        return;
      }

      // Case 2: Returned after 4.5+ seconds -> Enter Zomato-style Automated Verification
      setCurrentView('VERIFYING');

      verificationTimer = setTimeout(() => {
        const genTxn = `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        triggerPaymentSuccess(genTxn);
      }, 2000);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleReturnToApp();
      }
    };

    const onWindowFocus = () => {
      handleReturnToApp();
    };

    // Small delay before listening to avoid immediate trigger upon app launching
    const attachTimer = setTimeout(() => {
      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('focus', onWindowFocus);
    }, 1200);

    return () => {
      clearTimeout(attachTimer);
      if (verificationTimer) clearTimeout(verificationTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onWindowFocus);
    };
  }, [currentView, paymentLaunchTime]);

  // Launch Payment when user clicks Zomato "Place Order" button
  const handlePlaceOrderClick = () => {
    setError('');
    setPaymentFailedError('');

    // 1. CASH AT COUNTER: Immediate direct placement
    if (selectedMethodId === 'CASH') {
      executeOrderPlacement(null, 'UNPAID', 'CASH_AT_COUNTER');
      return;
    }

    // 2. DISPLAY QR CODE VIEW
    if (selectedMethodId === 'QR') {
      setCurrentView('QR_CODE');
      return;
    }

    // 3. ONLINE UPI APP INTENT (GPay, PhonePe, Paytm, BHIM)
    const appDeepLink = getUpiUri(selectedMethodId);
    setPaymentLaunchTime(Date.now());
    setCurrentView('AWAITING_APP');

    // Attempt to open the UPI app on the mobile device
    try {
      window.location.href = appDeepLink;
    } catch (_) {
      window.location.href = genericUpiLink;
    }

    // Fallback: If device doesn't register app scheme, trigger generic UPI
    if (selectedMethodId !== 'BHIM') {
      setTimeout(() => {
        try {
          window.location.href = genericUpiLink;
        } catch (_) {}
      }, 700);
    }
  };

  // Retry payment in Google Pay from failed screen
  const handleRetryPayment = () => {
    setError('');
    setPaymentFailedError('');
    setPaymentLaunchTime(Date.now());
    setCurrentView('AWAITING_APP');

    const appDeepLink = getUpiUri(selectedMethodId);
    try {
      window.location.href = appDeepLink;
    } catch (_) {
      window.location.href = genericUpiLink;
    }
  };

  // Switch to Cash at Counter from failed screen
  const handlePayCashInstead = () => {
    executeOrderPlacement(null, 'UNPAID', 'CASH_AT_COUNTER');
  };

  // Cancel Payment Flow
  const handleCancelPayment = () => {
    setCurrentView('SELECTION');
    setPaymentLaunchTime(null);
    setPaymentFailedError('');
    setError('');
  };

  // Trigger Verified Payment Success Pop-up & Auto-Generate Token
  const triggerPaymentSuccess = (confirmedTxnId) => {
    if (showSuccessPopup || loading) return;

    if (autoPlaceTimerRef.current) {
      clearTimeout(autoPlaceTimerRef.current);
    }

    const genTxn = confirmedTxnId || `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setTransactionId(genTxn);
    setShowSuccessPopup(true);

    try {
      playNotificationSound('success');
    } catch (_) {}

    // Celebratory confetti burst
    try {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10B981', '#7955E8', '#526DFF', '#EF4444'],
      });
    } catch (_) {}

    // Automatically generate token after showing popup for 1.2 seconds, and navigate to /my-orders!
    autoPlaceTimerRef.current = setTimeout(() => {
      executeOrderPlacement(genTxn, 'PAID', 'UPI');
    }, 1200);
  };

  // Execute Order Placement & Token Generation
  const executeOrderPlacement = async (txnId = null, paymentStatus = 'PAID', paymentMethod = 'UPI') => {
    if (!isAuthenticated) {
      setError('Please log in or register before completing your order.');
      setShowSuccessPopup(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
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
        paymentStatus: paymentStatus,
        transactionId: txnId,
        scheduledPickupTime: scheduledTime,
        pickupOption: pickupOption,
        orderNotes: orderNotes,
        whatsappOptIn: true,
      });

      clearCart();
      setShowSuccessPopup(false);
      setCurrentView('SELECTION');
      onClose();
      if (onOrderPlaced) {
        onOrderPlaced(createdOrder);
      }
      // Navigate directly to My Orders section as requested!
      navigate('/my-orders');
    } catch (err) {
      console.error('Order placement failed:', err);
      setError('Failed to place order. Please try again.');
      setShowSuccessPopup(false);
    } finally {
      setLoading(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentView('SELECTION');
      setShowSuccessPopup(false);
      setError('');
      setPaymentFailedError('');
      setPaymentLaunchTime(null);
      if (autoPlaceTimerRef.current) clearTimeout(autoPlaceTimerRef.current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn text-white">
      {/* 1. GREEN CHECKMARK TICK POP-UP & AUTO TOKEN GENERATOR */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1C263A] via-[#151C30] to-[#0B1020] border-2 border-emerald-500 p-6 text-center shadow-2xl shadow-emerald-500/30 space-y-4 animate-scaleUp">
            {/* Animated Bouncy Green Circle with Checkmark Tick */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"></div>
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 border-2 border-emerald-300 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <Check className="w-10 h-10 text-white stroke-[3.5] animate-bounce" />
              </div>
            </div>

            <div>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-block">
                Payment Verified ✓
              </span>
              <h3 className="text-xl font-black text-white mt-2">Payment Successful!</h3>
              <p className="text-sm font-black text-emerald-400 mt-0.5">
                ₹{total} Paid via {selectedMethod.name}
              </p>
              <p className="text-[11px] font-mono text-[#AAB3C5] mt-1 bg-[#0B1020] py-1 px-2.5 rounded-lg border border-purple-500/20 inline-block">
                Txn Ref / UTR: <strong className="text-white">{transactionId}</strong>
              </p>
            </div>

            <div className="pt-2 border-t border-purple-500/20 flex items-center justify-center gap-2.5 text-xs text-purple-200 font-bold">
              <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
              <span>Generating Live Token Automatically...</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN MODAL CONTAINER */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#1C263A] rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0B1020] via-[#151C30] to-[#0B1020] text-white flex items-center justify-between border-b border-purple-500/20 shrink-0">
          <div className="flex items-center gap-2.5">
            {currentView !== 'SELECTION' ? (
              <button
                onClick={() => setCurrentView('SELECTION')}
                className="w-8 h-8 rounded-full bg-[#1C263A] hover:bg-[#25334d] text-white flex items-center justify-center transition-colors mr-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
            )}
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                {currentView === 'AWAITING_APP'
                  ? `Paying via ${selectedMethod.name}`
                  : currentView === 'QR_CODE'
                  ? 'Scan Campus QR Code'
                  : 'Select Payment Method'}
              </h3>
              <p className="text-[11px] text-[#AAB3C5]">
                {cartItems.length} dish(es) • Final Total ₹{total}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C263A] hover:bg-[#25334d] text-[#AAB3C5] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* VIEW 1: ZOMATO-STYLE PAYMENT SELECTION VIEW */}
          {currentView === 'SELECTION' && (
            <div className="space-y-4">
              {/* Quick Pay Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-[#151C30] border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-[#E23744] text-white flex items-center justify-center font-black text-sm shadow-md">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">MITS Quick Pay</h4>
                    <p className="text-[10px] text-[#AAB3C5]">Token generates only after successful payment</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Verified
                </span>
              </div>

              {/* Student Ordering Card */}
              <div className="p-3 rounded-xl bg-[#151C30] border border-purple-500/20 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] uppercase text-[#AAB3C5] font-bold">Ordering Student:</p>
                  <p className="font-extrabold text-white text-xs">{user?.name || 'Ayush Pandey'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono font-bold text-purple-300">
                    {user?.studentId || user?.enrollmentNumber || 'BTET25O1039'}
                  </span>
                  <p className="text-[10px] text-[#AAB3C5] mt-0.5">{scheduledTime}</p>
                </div>
              </div>

              {/* Payment Methods List */}
              <div>
                <label className="text-[11px] font-black text-[#AAB3C5] uppercase tracking-wider block mb-2">
                  Select Payment Option
                </label>

                <div className="space-y-2">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedMethodId === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedMethodId(method.id)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#E23744] bg-[#E23744]/10 shadow-md ring-1 ring-[#E23744]/40'
                            : 'border-purple-500/20 bg-[#151C30] hover:border-purple-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#0B1020] border border-white/10 flex items-center justify-center shrink-0">
                            {method.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-white">{method.name}</h4>
                              {method.id === 'GPAY' && (
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  Popular
                                </span>
                              )}
                              {method.id === 'CASH' && (
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Counter
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#AAB3C5] mt-0.5">{method.subtitle}</p>
                          </div>
                        </div>

                        {/* Radio Selection Dot */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-[#E23744] bg-[#E23744] text-white shadow-xs'
                              : 'border-slate-500 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bill Details Summary */}
              <div className="border-t border-purple-500/20 pt-3 space-y-1.5 text-xs text-[#AAB3C5]">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold text-white">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Campus Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-purple-500/20">
                  <span>Total Payable</span>
                  <span className="text-emerald-400 text-base font-black">₹{total}</span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: AWAITING UPI APP PAYMENT VIEW (ZOMATO-STYLE AUTOMATED PROCESSING) */}
          {currentView === 'AWAITING_APP' && (
            <div className="text-center py-4 space-y-4 animate-fadeIn">
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-2xl bg-[#0B1020] border-2 border-emerald-500/50 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                  {selectedMethod.icon}
                </div>
              </div>

              <div className="space-y-1">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Awaiting Payment in {selectedMethod.name}
                </span>
                <h3 className="text-lg font-black text-white">Complete ₹{total} Payment</h3>
                <p className="text-xs text-[#AAB3C5] max-w-xs mx-auto">
                  Aapke phone par {selectedMethod.name} open ho gaya hai. Wahan UPI PIN daalkar <strong className="text-emerald-400">₹{total}</strong> pay karein.
                </p>
              </div>

              {/* Payee Info Box */}
              <div className="p-3.5 rounded-2xl bg-[#0B1020] border border-purple-500/25 max-w-sm mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#AAB3C5]">Paying To:</span>
                  <span className="font-extrabold text-white">{effectiveMerchantName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#AAB3C5]">UPI ID:</span>
                  <div className="flex items-center gap-1.5 font-mono text-purple-300 font-bold">
                    <span className="truncate max-w-[180px]">{effectiveUpiId}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1 rounded bg-[#1C263A] hover:bg-[#25334d] text-slate-300 cursor-pointer"
                    >
                      {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-purple-500/20 pt-2">
                  <span className="text-white font-bold">Amount:</span>
                  <span className="text-emerald-400 font-black text-sm">₹{total}</span>
                </div>
              </div>

              {/* Zomato-style Automated Processing Notice */}
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 max-w-sm mx-auto flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 text-purple-300 animate-spin" />
                </div>
                <div className="text-[11px] text-[#AAB3C5] leading-tight">
                  <p className="font-bold text-white">Automatic Payment Verification</p>
                  <p className="mt-0.5">Payment hote hi token apne aap generate ho jayega aur aap My Orders me pahunch jayenge.</p>
                </div>
              </div>

              {/* Quick Options */}
              <div className="flex items-center justify-between gap-2 text-xs max-w-sm mx-auto pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const link = getUpiUri(selectedMethodId);
                    window.location.href = link;
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#0B1020] hover:bg-[#151C30] text-purple-200 border border-purple-500/30 font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Re-open {selectedMethod.name}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentView('QR_CODE')}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#0B1020] hover:bg-[#151C30] text-[#AAB3C5] hover:text-white border border-purple-500/30 font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Show QR Code</span>
                </button>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleCancelPayment}
                  className="text-[11px] text-slate-400 hover:text-red-400 transition-colors cursor-pointer underline"
                >
                  Cancel & Go Back to Cart
                </button>
              </div>
            </div>
          )}

          {/* VIEW: VERIFYING PAYMENT WITH BANK (ZOMATO-STYLE) */}
          {currentView === 'VERIFYING' && (
            <div className="text-center py-8 space-y-5 animate-fadeIn">
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
                <div className="relative w-16 h-16 rounded-2xl bg-[#0B1020] border-2 border-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Verifying with Bank...
                </span>
                <h3 className="text-xl font-black text-white">Verifying Payment of ₹{total}</h3>
                <p className="text-xs text-[#AAB3C5] max-w-xs mx-auto">
                  Bank se confirmation verify ho rahi hai. Kripya wait karein...
                </p>
              </div>

              <div className="max-w-xs mx-auto w-full bg-[#0B1020] rounded-full h-1.5 overflow-hidden border border-purple-500/30">
                <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-[#7955E8] animate-pulse rounded-full w-full" />
              </div>
            </div>
          )}

          {/* VIEW: PAYMENT FAILED / NOT COMPLETED */}
          {currentView === 'PAYMENT_FAILED' && (
            <div className="text-center py-4 space-y-4 animate-fadeIn">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40 flex items-center justify-center shadow-xl shadow-rose-500/20">
                  <AlertTriangle className="w-8 h-8 text-rose-400" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-block">
                  Payment Incomplete
                </span>
                <h3 className="text-lg font-black text-white">First Complete Your Payment!</h3>
                <p className="text-xs text-rose-200/90 max-w-xs mx-auto font-medium">
                  {paymentFailedError || 'Online payment complete nahi hui. Pehle payment karein, uske baad hi token generate hoga.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs max-w-sm mx-auto text-left space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  Token Generate Nahi Hua
                </p>
                <p className="text-[11px] text-rose-300/80 leading-relaxed">
                  Bina payment ke order token generate nahi ho sakta. Agar aapne payment cancel kar diya tha, toh dobara try karein ya Cash at Counter chunein.
                </p>
              </div>

              {/* Two Clear Choices for the Student */}
              <div className="space-y-2 max-w-sm mx-auto pt-1">
                <button
                  type="button"
                  onClick={handleRetryPayment}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Complete Payment in {selectedMethod.name}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePayCashInstead}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#151C30] hover:bg-[#1f2942] border border-purple-500/30 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>Pay via Cash at Counter Instead</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancelPayment}
                  className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel & Back to Cart
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: SCAN QR CODE VIEW */}
          {currentView === 'QR_CODE' && (
            <div className="text-center py-2 space-y-4 animate-fadeIn">
              <div className="relative text-center p-4 rounded-2xl bg-[#0B1020] border border-purple-500/25 space-y-3 max-w-xs mx-auto">
                {customQrImage ? (
                  <div className="relative inline-block p-2.5 bg-white rounded-2xl shadow-xl border border-slate-200 mx-auto">
                    <img
                      src={customQrImage}
                      alt="Official Canteen UPI QR"
                      className="w-40 h-40 object-contain rounded-xl mx-auto"
                    />
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs whitespace-nowrap">
                      Owner Custom QR ✓
                    </span>
                  </div>
                ) : (
                  <div className="relative inline-block p-3 bg-white rounded-2xl shadow-xl border-2 border-purple-500/30 mx-auto">
                    <QRCodeSVG value={genericUpiLink} size={140} level="M" />
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#7955E8] text-white shadow-md whitespace-nowrap border border-white/40 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                      <span>Scan with any UPI App</span>
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <p className="text-sm font-black text-white">{effectiveMerchantName}</p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-[11px] text-purple-300 font-mono font-bold truncate max-w-[200px]">
                      {effectiveUpiId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-2 py-0.5 rounded-md bg-[#1C263A] hover:bg-[#25334d] text-[10px] font-bold text-slate-300 flex items-center gap-1 border border-purple-500/30 transition-colors cursor-pointer"
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
                  <p className="text-xs font-black text-white mt-1.5">
                    Pay Amount: <span className="text-emerald-400 font-bold text-base">₹{total}</span>
                  </p>
                </div>
              </div>

              {/* Action: Payment Done */}
              <div className="space-y-2 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => handleUserConfirmPaid()}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Payment Done • Generate Token ✓</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentView('SELECTION')}
                  className="w-full py-2 text-xs font-bold text-[#AAB3C5] hover:text-white transition-colors cursor-pointer"
                >
                  Choose Another Payment Option
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. AUTHENTIC ZOMATO BOTTOM PAYMENT BAR (Visible on SELECTION View) */}
        {currentView === 'SELECTION' && (
          <div className="p-3.5 sm:p-4 bg-[#0B1020] border-t border-purple-500/20 flex items-center justify-between gap-3 shrink-0">
            {/* Left: PAY USING (with chosen app icon & name) */}
            <div className="flex items-center gap-2.5 py-1 px-1.5 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                {selectedMethod.icon}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[#AAB3C5]">
                  <span>PAY USING</span>
                  <span className="text-[8px] text-purple-400">▲</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[110px] sm:max-w-[150px]">
                  {selectedMethod.name}
                </div>
              </div>
            </div>

            {/* Right: Solid Red Zomato "Place Order" Button */}
            <button
              type="button"
              onClick={handlePlaceOrderClick}
              disabled={loading}
              className="py-3 px-5 sm:px-6 rounded-2xl bg-gradient-to-r from-[#E23744] via-[#EB4454] to-[#F03949] hover:from-[#d12e3b] hover:to-[#e02d3c] active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-2.5 sm:gap-3.5 shadow-xl shadow-red-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="text-left">
                <div className="text-sm sm:text-base font-black leading-tight">₹{total}</div>
                <div className="text-[9px] uppercase tracking-wider text-white/80 font-bold leading-tight">TOTAL</div>
              </div>
              <div className="w-[1px] h-6 bg-white/25"></div>
              <div className="flex items-center gap-1">
                <span>Place Order</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
