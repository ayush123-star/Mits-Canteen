import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { TokenPickupPass } from '../components/TokenPickupPass';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import { MessageSquare, CheckCircle2, X, ExternalLink, Clock } from 'lucide-react';

export const StudentLayout = () => {
  const { simulatedWhatsAppAlert, setSimulatedWhatsAppAlert } = useData();
  const { setIsCartOpen } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [recentOrderPass, setRecentOrderPass] = React.useState(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1020] text-white relative selection:bg-[#7955E8]/40 selection:text-white overflow-x-hidden">
      {/* Ambient background lighting */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#7955E8]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-[500px] h-[500px] bg-[#526DFF]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <Navbar />

      {/* Simulated Automated WhatsApp Alert Toast */}
      {simulatedWhatsAppAlert && (
        <div className="fixed top-24 right-4 z-50 max-w-sm w-full bg-[#151C30]/95 backdrop-blur-xl text-white p-4 sm:p-5 rounded-3xl shadow-2xl border border-emerald-500/40 animate-slideLeft">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-white">WhatsApp Alert</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-1.5 py-0.5 rounded-full uppercase">
                    {simulatedWhatsAppAlert.type}
                  </span>
                </div>
                <p className="text-[11px] text-[#AAB3C5] font-mono">{simulatedWhatsAppAlert.phone}</p>
              </div>
            </div>
            <button
              onClick={() => setSimulatedWhatsAppAlert(null)}
              className="text-[#AAB3C5] hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 p-3 rounded-2xl bg-[#0B1020]/80 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line border border-white/5">
            {simulatedWhatsAppAlert.message.replace(/\*/g, '')}
          </div>

          {simulatedWhatsAppAlert.whatsappUrl && (
            <a
              href={simulatedWhatsAppAlert.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Live Message in WhatsApp Web
            </a>
          )}
        </div>
      )}

      {/* Main Outlet */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer onCheckoutClick={() => setIsCheckoutOpen(true)} />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={(order) => setRecentOrderPass(order)}
      />

      {/* Recent Order Pass */}
      {recentOrderPass && (
        <TokenPickupPass
          order={recentOrderPass}
          onClose={() => setRecentOrderPass(null)}
        />
      )}
    </div>
  );
};
