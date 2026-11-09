import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { OrderStatusStepper } from './OrderStatusStepper';
import {
  X,
  Clock,
  MapPin,
  CheckCircle,
  Sparkles,
  QrCode,
  ShieldCheck,
  UtensilsCrossed,
  Printer
} from 'lucide-react';

export const TokenPickupPass = ({ order, onClose }) => {
  if (!order) return null;

  const isReady = order.status === 'Ready for Pickup';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn text-white">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#1C263A] rounded-3xl shadow-2xl overflow-hidden border border-purple-500/30 max-h-[92vh] flex flex-col"
      >
        {/* Pass Top Banner */}
        <div
          className={`p-5 sm:p-6 text-white text-center relative overflow-hidden shrink-0 ${
            isReady
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 animate-pulse-glow'
              : 'bg-gradient-to-r from-[#0B1020] via-[#151C30] to-[#0B1020] border-b border-purple-500/20'
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-[#1C263A] hover:bg-[#25334d] text-[#AAB3C5] hover:text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest bg-gradient-to-r from-[#7955E8]/30 to-[#526DFF]/30 border border-purple-500/30 text-purple-200 mb-1.5">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-300" />
            Official Campus Pickup Pass
          </span>

          <p className="text-xs text-[#AAB3C5] font-medium">Your Zero-Queue Token</p>
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-white my-1 font-mono drop-shadow-md">
            #{order.tokenNumber}
          </div>

          <div className="flex items-center justify-center gap-2 mt-2">
            <span
              className={`px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider ${
                isReady
                  ? 'bg-emerald-400 text-emerald-950 font-black'
                  : 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30'
              }`}
            >
              {order.status}
            </span>
            <span className="px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#151C30] border border-purple-500/30 text-purple-200 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              Counter (Main Canteen)
            </span>
          </div>
        </div>

        {/* Stepper Inside Pass */}
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 bg-[#151C30] border-b border-purple-500/20 shrink-0">
          <OrderStatusStepper currentStatus={order.status} />
        </div>

        {/* Scrollable Content Section */}
        <div className="p-4 sm:p-6 text-center space-y-3.5 overflow-y-auto flex-1">
          {/* Scannable Verification QR Code Section */}
          <div className="inline-block p-3 sm:p-4 bg-white rounded-3xl shadow-md border-2 border-dashed border-purple-300">
            <QRCodeSVG
              value={order.qrCodeData || JSON.stringify({ token: order.tokenNumber, orderId: order._id })}
              size={135}
              level="H"
              includeMargin={true}
            />
          </div>

          <div>
            <p className="text-xs font-extrabold text-white">
              Show QR at Counter (MITS Main Canteen)
            </p>
            <p className="text-[11px] text-[#AAB3C5] font-medium mt-0.5">
              Pickup address: Central Campus Quad, MITS Gwalior
            </p>
          </div>

          {/* Timing details */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#151C30] border border-purple-500/20 flex items-center justify-around text-xs">
            <div>
              <span className="text-[10px] text-[#AAB3C5] block">Scheduled Pickup:</span>
              <span className="font-bold text-white">{order.scheduledPickupTime || 'ASAP'}</span>
            </div>
            <div className="h-6 w-px bg-purple-500/30"></div>
            <div>
              <span className="text-[10px] text-[#AAB3C5] block">Est. Prep Time:</span>
              <span className="font-bold text-purple-300">~{order.estimatedPrepMinutes || 8} mins</span>
            </div>
          </div>

          {/* Items breakdown summary */}
          <div className="text-left bg-[#151C30] p-3 sm:p-3.5 rounded-2xl border border-purple-500/20 text-xs space-y-2">
            <div className="flex justify-between font-bold text-white pb-1 border-b border-purple-500/20">
              <span>Items Ordered:</span>
              <span className="text-purple-300">Total: ₹{order.finalAmount}</span>
            </div>
            {order.items?.map((it, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between text-[#AAB3C5] text-[11px]">
                  <span>
                    {it.quantity}x {it.name}
                  </span>
                  <span className="font-bold text-white">₹{it.price * it.quantity}</span>
                </div>
                {it.specialInstructions && (
                  <p className="text-[10px] text-amber-300 font-semibold pl-2 border-l-2 border-amber-400/40">
                    Prep: {it.specialInstructions}
                  </p>
                )}
              </div>
            ))}
            {order.orderNotes && (
              <div className="pt-1.5 border-t border-purple-500/20 text-[11px] text-amber-300">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">Kitchen Instructions:</span>
                <span className="text-white font-bold">{order.orderNotes}</span>
              </div>
            )}
          </div>

          {/* Print / Save Trigger */}
          <div className="pt-1 flex gap-2.5">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 rounded-xl border border-purple-500/30 hover:bg-[#25334d] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-purple-400" /> Print Pass
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white text-xs font-bold transition-all shadow-md shadow-purple-500/30 cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
