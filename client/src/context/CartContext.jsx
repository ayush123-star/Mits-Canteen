import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('canteen_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [pickupOption, setPickupOption] = useState('ASAP');
  const [scheduledTime, setScheduledTime] = useState('ASAP (Immediate)');
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('canteen_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (food, quantity = 1, specialInstructions = '') => {
    const foodKey = food._id || food.id;
    const normalizedFood = { ...food, _id: foodKey, id: foodKey };

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => (item.food._id || item.food.id) === foodKey
      );
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        if (specialInstructions) {
          updated[existingIndex].specialInstructions = specialInstructions;
        }
        return updated;
      } else {
        return [...prevItems, { food: normalizedFood, quantity, specialInstructions }];
      }
    });
  };

  const updateQuantity = (foodId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(foodId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        (item.food._id || item.food.id) === foodId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (foodId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => (item.food._id || item.food.id) !== foodId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode('');
    setDiscountAmount(0);
    setCouponError('');
    setOrderNotes('');
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.food.price * item.quantity,
    0
  );

  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    setCouponError('');
    if (!clean) return;

    // Helper to get canteen owner's scheduled day-wise discount
    const getActiveDayDiscount = () => {
      try {
        const saved = localStorage.getItem('smart_canteen_homepage_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const today = days[new Date().getDay()];
          const dayConf = parsed.dailyDiscounts?.[today];
          const promo = (parsed.specialOfferBanner?.promoCode || 'CAMPUSDAY').toUpperCase();
          const minVal = parsed.specialOfferBanner?.minOrderValue || 99;
          return {
            today,
            promo,
            minVal,
            percent: dayConf?.percent || 15,
            active: dayConf?.active !== false,
          };
        }
      } catch (e) {}
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return {
        today: days[new Date().getDay()],
        promo: 'CAMPUSDAY',
        minVal: 99,
        percent: 15,
        active: true,
      };
    };

    const dayDisc = getActiveDayDiscount();

    // 1. Canteen Owner Scheduled Daily Discount (e.g. CAMPUSDAY, DAYOFFER, etc.)
    if (
      clean === dayDisc.promo ||
      clean === 'CAMPUSDAY' ||
      clean === 'DAYOFFER' ||
      clean === `${dayDisc.today.toUpperCase()}OFF`
    ) {
      if (subtotal < dayDisc.minVal) {
        setCouponError(`Minimum order value of ₹${dayDisc.minVal} required for ${dayDisc.today}'s offer`);
        return false;
      }
      const disc = Math.round(subtotal * (dayDisc.percent / 100));
      setDiscountAmount(disc);
      setCouponCode(clean);
      return true;
    } else if (clean === 'CAMPUS50') {
      if (subtotal < 150) {
        setCouponError('Minimum order value of ₹150 required for CAMPUS50');
        return false;
      }
      const disc = Math.min(50, Math.round(subtotal * 0.25));
      setDiscountAmount(disc);
      setCouponCode('CAMPUS50');
      return true;
    } else if (clean === 'STUDENT10' || clean === 'FIRSTBITE') {
      const disc = Math.round(subtotal * 0.1);
      setDiscountAmount(disc);
      setCouponCode(clean);
      return true;
    } else {
      setCouponError(`Invalid coupon code. Try ${dayDisc.promo}, CAMPUS50 or STUDENT10`);
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountAmount(0);
    setCouponError('');
  };

  // Re-calculate discount when subtotal changes
  useEffect(() => {
    if (couponCode) {
      applyCoupon(couponCode);
    }
  }, [subtotal]);

  const total = Math.max(0, subtotal - discountAmount);
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemCount,
        subtotal,
        discountAmount,
        total,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        couponCode,
        couponError,
        applyCoupon,
        removeCoupon,
        pickupOption,
        setPickupOption,
        scheduledTime,
        setScheduledTime,
        orderNotes,
        setOrderNotes,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
