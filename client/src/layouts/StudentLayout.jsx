import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { TokenPickupPass } from '../components/TokenPickupPass';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
export const StudentLayout = () => {
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
