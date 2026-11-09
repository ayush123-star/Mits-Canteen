import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { decodeQrCode, extractUpiDetails, compressQrImage } from '../../utils/qrDecoder';
import {
  getOwnerWhatsAppNumber,
  setOwnerWhatsAppNumber
} from '../../utils/whatsappHelper';
import {
  Settings,
  Power,
  Flame,
  Clock,
  Smartphone,
  Phone,
  Building,
  Save,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Upload,
  Trash2,
  Sparkles,
  CreditCard,
  Check,
  SlidersHorizontal,
  MessageSquare
} from 'lucide-react';

export const CanteenSettingsPage = () => {
  const { user } = useAuth();
  const { canteens, toggleCanteenStatus, updateCanteenPaymentQR, updateCanteenSettings } = useData();

  const currentCanteen = canteens[0] || {
    id: 'canteen-1',
    name: 'MITS Main Canteen',
    isOpen: true,
    openingTime: '08:00 AM',
    closingTime: '07:30 PM',
    activeCounters: 1,
    managerPhone: '+91 98112 23344',
    ownerWhatsApp: '919839567623',
    rushHourMode: false,
    qrCodeImage: '',
    upiId: 'pandeyayush1603-1@okicici',
    upiMerchantName: 'Ayush Pandey',
  };

  const [canteenName, setCanteenName] = useState(currentCanteen.name || 'MITS Main Canteen');
  const [openingTime, setOpeningTime] = useState(currentCanteen.openingTime || '08:00 AM');
  const [closingTime, setClosingTime] = useState(currentCanteen.closingTime || '07:30 PM');
  const [activeCounters, setActiveCounters] = useState(currentCanteen.activeCounters !== undefined ? currentCanteen.activeCounters : 1);
  const [managerPhone, setManagerPhone] = useState(currentCanteen.managerPhone || '+91 98112 23344');
  const [ownerWhatsApp, setOwnerWhatsApp] = useState(currentCanteen.ownerWhatsApp || getOwnerWhatsAppNumber());
  const [rushHourMode, setRushHourMode] = useState(Boolean(currentCanteen.rushHourMode));
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // QR Code & Payment States
  const [qrCodeImage, setQrCodeImage] = useState(currentCanteen.qrCodeImage || '');
  const [upiId, setUpiId] = useState(
    currentCanteen.upiId && !currentCanteen.upiId.includes('smartcampus.canteen') && !currentCanteen.upiId.includes('okhdfcbank')
      ? currentCanteen.upiId
      : 'pandeyayush1603-1@okicici'
  );
  const [upiMerchantName, setUpiMerchantName] = useState(
    currentCanteen.upiMerchantName && currentCanteen.upiMerchantName !== 'MITS Main Canteen' && currentCanteen.upiMerchantName !== 'Main Campus Food Court'
      ? currentCanteen.upiMerchantName
      : 'Ayush Pandey'
  );

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [qrSuccess, setQrSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Keep form in sync when latest canteen config arrives via MQTT or Cloud API
  useEffect(() => {
    if (currentCanteen) {
      if (currentCanteen.name) setCanteenName(currentCanteen.name);
      if (currentCanteen.openingTime) setOpeningTime(currentCanteen.openingTime);
      if (currentCanteen.closingTime) setClosingTime(currentCanteen.closingTime);
      if (currentCanteen.activeCounters !== undefined) setActiveCounters(Number(currentCanteen.activeCounters));
      if (currentCanteen.managerPhone) setManagerPhone(currentCanteen.managerPhone);
      if (currentCanteen.ownerWhatsApp) setOwnerWhatsApp(currentCanteen.ownerWhatsApp);
      if (currentCanteen.rushHourMode !== undefined) setRushHourMode(Boolean(currentCanteen.rushHourMode));
      if (currentCanteen.qrCodeImage !== undefined) setQrCodeImage(currentCanteen.qrCodeImage);
      if (currentCanteen.upiId) setUpiId(currentCanteen.upiId);
      if (currentCanteen.upiMerchantName) setUpiMerchantName(currentCanteen.upiMerchantName);
    }
  }, [
    currentCanteen?.name,
    currentCanteen?.openingTime,
    currentCanteen?.closingTime,
    currentCanteen?.activeCounters,
    currentCanteen?.managerPhone,
    currentCanteen?.ownerWhatsApp,
    currentCanteen?.rushHourMode,
    currentCanteen?.qrCodeImage,
    currentCanteen?.upiId,
    currentCanteen?.upiMerchantName,
  ]);

  const handleToggleOpen = () => {
    toggleCanteenStatus(currentCanteen.id, !currentCanteen.isOpen, user?.name || 'Canteen Owner');
  };

  // QR Image File Upload Handler
  const handleQrFileUpload = (e) => {
    setUploadError('');
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file (PNG, JPG, JPEG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size is too large. Please upload an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target.result;
      const dataUrl = await compressQrImage(rawDataUrl, 450);
      setQrCodeImage(dataUrl);
      try {
        const decoded = await decodeQrCode(dataUrl);
        if (decoded) {
          const details = extractUpiDetails(decoded);
          if (details?.upiId) {
            setUpiId(details.upiId);
            if (details.merchantName) setUpiMerchantName(details.merchantName);
          }
        }
      } catch (err) { console.warn(err); }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQrImage = () => {
    setQrCodeImage('');
  };

  // Save QR Payment settings
  const handleSavePaymentQR = (e) => {
    e.preventDefault();
    if (!upiId.trim()) {
      setUploadError('Please provide a valid UPI ID (e.g., yourname@okicici)');
      return;
    }

    updateCanteenPaymentQR(
      currentCanteen.id,
      {
        qrCodeImage,
        upiId: upiId.trim(),
        upiMerchantName: upiMerchantName.trim() || canteenName,
      },
      user?.name || 'Canteen Owner'
    );

    setQrSuccess(true);
    setTimeout(() => setQrSuccess(false), 4000);
  };

  // Save General Operating Settings
  const handleToggleRushHour = () => {
    const nextMode = !rushHourMode;
    setRushHourMode(nextMode);
    if (updateCanteenSettings) {
      updateCanteenSettings(currentCanteen.id || 'canteen-1', { rushHourMode: nextMode }, user?.name || 'Canteen Owner');
    }
  };

  // Save General Operating Settings
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    try {
      const cleanPhone = ownerWhatsApp ? ownerWhatsApp.trim() : '';
      if (cleanPhone) {
        setOwnerWhatsAppNumber(cleanPhone);
      }
      const newSettings = {
        name: canteenName.trim() || 'MITS Main Canteen',
        openingTime: openingTime.trim() || '08:00 AM',
        closingTime: closingTime.trim() || '07:30 PM',
        activeCounters: Number(activeCounters) || 1,
        managerPhone: managerPhone.trim() || '+91 98112 23344',
        ownerWhatsApp: cleanPhone || '919839567623',
        rushHourMode: Boolean(rushHourMode),
        isOpen: currentCanteen.isOpen !== undefined ? currentCanteen.isOpen : true,
        status: currentCanteen.status || 'Operational',
      };

      if (updateCanteenSettings) {
        await updateCanteenSettings(currentCanteen.id || 'canteen-1', newSettings, user?.name || 'Canteen Owner');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('[CanteenSettings] Save failed:', err);
    } finally {
      setIsSavingGeneral(false);
    }
  };
  const _unusedOldSave = () => {};
  const _ignore = (e = {}) => {
    e.preventDefault();
    if (ownerWhatsApp) {
      // done
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fadeIn pb-12 text-white">
      {/* 1. Header Bar */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          Canteen Operations & Payment Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
          Exclusive Canteen Owner controls: upload your canteen payment QR code, manage UPI payouts, operating hours, and active counters.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          Operational schedule updated successfully!
        </div>
      )}

      {/* Cravings & Day Offers Manager Callout Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7955E8] to-[#526DFF] text-white flex items-center justify-center font-black shadow-lg shadow-purple-500/30 shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">
              Homepage "Popular Campus Cravings" & Daily Discount %
            </h3>
            <p className="text-xs text-[#AAB3C5] mt-0.5">
              Choose which food items appear on the homepage and schedule special discount % for each day (Monday – Sunday).
            </p>
          </div>
        </div>
        <Link
          to="/admin/homepage-manager"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-black text-xs flex items-center gap-2 transition-all shrink-0 shadow-lg shadow-purple-500/30"
        >
          <SlidersHorizontal className="w-4 h-4 text-white" />
          <span>Open Cravings & Offers Editor &rarr;</span>
        </Link>
      </div>

      {/* 2. CANTEEN OWNER ONLY: PAYMENT QR CODE UPLOAD CARD */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7955E8] to-[#526DFF] text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">
                  Canteen Payment QR Code & Merchant Account
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Canteen Owner Exclusive
                </span>
              </div>
              <p className="text-xs text-[#AAB3C5] mt-0.5">
                Upload your Paytm / PhonePe / Google Pay QR code image. Students will scan this during checkout!
              </p>
            </div>
          </div>
        </div>

        {qrSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            Payment QR code published! Students will now see and scan this QR code directly during checkout.
          </div>
        )}

        {uploadError && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {uploadError}
          </div>
        )}

        <form onSubmit={handleSavePaymentQR} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Upload Box */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1.5">
                  Upload Official Canteen QR Code (Image File)
                </label>
                <div className="border-2 border-dashed border-purple-500/30 hover:border-purple-400 rounded-3xl p-6 text-center bg-[#151C30]/80 hover:bg-[#151C30] transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-extrabold text-white">
                    Click or Drag & Drop Canteen QR Code Image
                  </p>
                  <p className="text-[11px] text-[#AAB3C5] mt-1">
                    Supports PNG, JPG, JPEG, WebP (Max 5MB)
                  </p>
                </div>
              </div>

              {/* UPI ID Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Canteen UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. pandeyayush1603-1@okicici"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Payee / Shop Name
                  </label>
                  <input
                    type="text"
                    value={upiMerchantName}
                    onChange={(e) => setUpiMerchantName(e.target.value)}
                    placeholder="e.g. Main Campus Food Court"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-bold text-white focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Direct Student Payments:</strong> Payments sent by students via this QR code will deposit straight into your registered canteen bank account.
                </p>
              </div>
            </div>

            {/* Right: Live Preview of Checkout Screen */}
            <div className="md:col-span-5 bg-[#151C30]/80 border border-purple-500/20 rounded-3xl p-5 text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#AAB3C5] block">
                Student Checkout Live Preview
              </span>

              <div className="p-3 bg-white rounded-2xl border border-purple-500/30 shadow-lg inline-block mx-auto">
                {qrCodeImage ? (
                  <div className="relative">
                    <img
                      src={qrCodeImage}
                      alt="Uploaded Canteen QR Code"
                      className="w-36 h-36 object-contain rounded-xl mx-auto"
                    />
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs whitespace-nowrap">
                      Owner Custom QR ✓
                    </span>
                  </div>
                ) : (
                  <div>
                    <QRCodeSVG
                      value={`upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiMerchantName)}&cu=INR`}
                      size={135}
                      level="M"
                    />
                    <span className="text-[10px] text-slate-700 font-bold block mt-1">
                      Auto Dynamic QR
                    </span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-black text-white">{upiMerchantName || 'Canteen Food Court'}</p>
                <p className="text-[11px] text-purple-400 font-mono font-bold mt-0.5 truncate">
                  {upiId}
                </p>
                <p className="text-[10px] text-[#AAB3C5] mt-1">
                  {qrCodeImage ? 'Uploaded QR Image Active' : 'Default Dynamic QR Active'}
                </p>
              </div>

              {qrCodeImage && (
                <button
                  type="button"
                  onClick={handleRemoveQrImage}
                  className="px-3 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold transition-colors inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove Custom QR
                </button>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-purple-500/20 flex justify-end">
            <button
              type="submit"
              disabled={isSavingGeneral}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-black text-xs shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save & Publish Canteen QR Code
            </button>
          </div>
        </form>
      </div>

      {/* 3. Master Operational Switches Card */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl p-6 sm:p-7 space-y-6">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#AAB3C5]">
          Live Operational Controls
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Open / Close Switch */}
          <div
            onClick={handleToggleOpen}
            className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${
              currentCanteen.isOpen
                ? 'border-emerald-500/40 bg-emerald-500/10'
                : 'border-red-500/40 bg-red-500/10'
            }`}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#AAB3C5]">
                Canteen Order Acceptance
              </span>
              <h3 className="text-base font-black text-white">
                {currentCanteen.isOpen ? 'Canteen Is OPEN (Live)' : 'Canteen Is PAUSED (Closed)'}
              </h3>
              <p className="text-xs text-[#AAB3C5]">
                {currentCanteen.isOpen
                  ? 'Students can browse and order food normally.'
                  : 'Student orders are temporarily halted.'}
              </p>
            </div>

            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${
                currentCanteen.isOpen ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-red-500 shadow-red-500/30'
              }`}
            >
              <Power className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. General Branch Profile & Schedule Form */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl p-6 sm:p-7 space-y-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#AAB3C5]">
          Branch Profile & Operating Schedule
        </h2>

        <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
              Canteen Display Name
            </label>
            <input
              type="text"
              required
              value={canteenName}
              onChange={(e) => setCanteenName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-bold text-white focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                Daily Opening Time
              </label>
              <input
                type="text"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                placeholder="08:00 AM"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-semibold text-white focus:outline-none focus:border-[#7955E8]"
              />
            </div>

            <div>
              <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                Daily Closing Time
              </label>
              <input
                type="text"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                placeholder="07:30 PM"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-semibold text-white focus:outline-none focus:border-[#7955E8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                Active Kitchen Counters
              </label>
              <select
                value={activeCounters}
                onChange={(e) => setActiveCounters(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-bold text-white focus:outline-none focus:border-[#7955E8]"
              >
                <option value="1" className="bg-[#151C30] text-white">1 Counter (Single Operator)</option>
                <option value="2" className="bg-[#151C30] text-white">2 Counters (Fast Food + Meals)</option>
                <option value="3" className="bg-[#151C30] text-white">3 Counters (Full Triple Station)</option>
                <option value="4" className="bg-[#151C30] text-white">4 Counters (Mega Food Court)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                Manager Helpline Phone
              </label>
              <input
                type="text"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-semibold text-white focus:outline-none focus:border-[#7955E8]"
              />
            </div>
          </div>

          {/* Dedicated WhatsApp Destination Phone for Live Orders */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <label className="font-extrabold text-xs text-emerald-300 uppercase tracking-wider">
                Canteen Owner Live WhatsApp Order Alert Number
              </label>
            </div>
            <p className="text-[11px] text-[#AAB3C5]">
              Every new student order receipt will be sent directly to this WhatsApp number upon checkout.
            </p>
            <input
              type="tel"
              required
              value={ownerWhatsApp}
              onChange={(e) => setOwnerWhatsApp(e.target.value)}
              placeholder="e.g. 9876543210 (10-digit mobile number)"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-emerald-500/40 font-mono font-bold text-white text-xs focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="pt-3 border-t border-purple-500/20 flex justify-end">
            <button
              type="submit"
              disabled={isSavingGeneral}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-black text-xs shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSavingGeneral ? 'Saving Operational Schedule...' : saveSuccess ? 'Saved 100% Successfully!' : 'Save Operational Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CanteenSettingsPage;
