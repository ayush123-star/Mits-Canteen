import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  INITIAL_USERS,
  INITIAL_CANTEENS,
  INITIAL_MENU_ITEMS,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_RECIPES,
  INITIAL_STOCK_TRANSACTIONS,
  INITIAL_ORDERS,
  INITIAL_OWNER_INVITATIONS,
  INITIAL_FEEDBACK,
  INITIAL_AUDIT_LOGS,
} from '../mock/mockData';
import { playNotificationSound } from '../utils/audio';
import {
  publishOrderEvent,
  subscribeToOrderEvents,
  fetchRecentCloudEvents,
  generateUniqueToken,
  mergeOrders,
  normalizeOrder,
} from '../services/realtimeSync';

export const DEFAULT_HOMEPAGE_CONFIG = {
  cravingsTitle: 'Popular Campus Cravings',
  cravingsSubtitle: 'Top rated and most ordered items across campus this week.',
  featuredCravingsIds: [], // If empty, auto-displays top rated items
  dailyDiscounts: {
    Monday: { percent: 10, title: 'Monday Kickstart', active: true },
    Tuesday: { percent: 15, title: 'Tasty Tuesday Feast', active: true },
    Wednesday: { percent: 10, title: 'Mid-Week Hunger Buster', active: true },
    Thursday: { percent: 20, title: 'Thursday Campus Special', active: true },
    Friday: { percent: 15, title: 'Friday Weekend Prep', active: true },
    Saturday: { percent: 25, title: 'Super Saturday Mega Saver', active: true },
    Sunday: { percent: 20, title: 'Sunday Campus Brunch', active: true },
  },
  specialOfferBanner: {
    badge: 'Campus Exclusive Daily Offers',
    heading: 'Get Flat Day Discount On Campus Cravings!',
    subtitle: 'Canteen owner daily offer active! Use promo code below for instant savings at checkout.',
    promoCode: 'CAMPUSDAY',
    minOrderValue: 99,
  },
};

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // 1. Core Reactive States initialized from localStorage or mockData
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('smart_canteen_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [canteens, setCanteens] = useState(() => {
    const saved = localStorage.getItem('smart_canteen_canteens');
    return saved ? JSON.parse(saved) : INITIAL_CANTEENS;
  });

  const [menuItems, setMenuItems] = useState(() => {
    const saved = localStorage.getItem('smart_canteen_menu');
    const list = saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
    return list.map((item) => ({ ...item, _id: item._id || item.id, id: item.id || item._id }));
  });

  const [inventoryItems, setInventoryItems] = useState(() => {
    const saved = localStorage.getItem('smart_canteen_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY_ITEMS;
  });

  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem('smart_canteen_recipes');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [stockTransactions, setStockTransactions] = useState(() => {
    const saved = localStorage.getItem('smart_canteen_transactions');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_TRANSACTIONS;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('smart_canteen_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [ownerInvitations, setOwnerInvitations] = useState(() => {
    const saved = localStorage.getItem('smart_canteen_invitations');
    return saved ? JSON.parse(saved) : INITIAL_OWNER_INVITATIONS;
  });

  const [feedbackList, setFeedbackList] = useState(() => {
    const saved = localStorage.getItem('smart_canteen_feedback');
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACK;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('smart_canteen_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Canteen Owner Controlled Homepage Cravings & Daily Discount Configuration
  const [homepageConfig, setHomepageConfig] = useState(() => {
    const saved = localStorage.getItem('smart_canteen_homepage_config');
    if (!saved) return DEFAULT_HOMEPAGE_CONFIG;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_HOMEPAGE_CONFIG,
        ...parsed,
        dailyDiscounts: {
          ...DEFAULT_HOMEPAGE_CONFIG.dailyDiscounts,
          ...(parsed.dailyDiscounts || {}),
        },
        specialOfferBanner: {
          ...DEFAULT_HOMEPAGE_CONFIG.specialOfferBanner,
          ...(parsed.specialOfferBanner || {}),
        },
      };
    } catch {
      return DEFAULT_HOMEPAGE_CONFIG;
    }
  });

  const updateHomepageConfig = (newConfig) => {
    setHomepageConfig((prev) => {
      const updated = {
        ...prev,
        ...newConfig,
        dailyDiscounts: {
          ...prev.dailyDiscounts,
          ...(newConfig.dailyDiscounts || {}),
        },
        specialOfferBanner: {
          ...prev.specialOfferBanner,
          ...(newConfig.specialOfferBanner || {}),
        },
      };
      localStorage.setItem('smart_canteen_homepage_config', JSON.stringify(updated));
      return updated;
    });
  };

  const getTodayDiscount = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];
    const dayConfig = homepageConfig.dailyDiscounts?.[currentDay] || { percent: 15, title: 'Campus Special Offer', active: true };
    return {
      day: currentDay,
      percent: dayConfig.percent || 15,
      title: dayConfig.title || `${currentDay} Campus Delight`,
      active: dayConfig.active !== false,
      promoCode: homepageConfig.specialOfferBanner?.promoCode || 'CAMPUSDAY',
      minOrderValue: homepageConfig.specialOfferBanner?.minOrderValue || 99,
    };
  };

  const [simulatedWhatsAppAlert, setSimulatedWhatsAppAlert] = useState(null);

  // Live Backend Database Synchronization (when Node.js server & MongoDB are online)
  useEffect(() => {
    const syncBackendData = async () => {
      try {
        const [canteenRes, foodRes, invRes, recRes, inviRes, feedRes, auditRes] =
          await Promise.allSettled([
            axios.get('/api/canteens'),
            axios.get('/api/food'),
            axios.get('/api/inventory'),
            axios.get('/api/recipes'),
            axios.get('/api/invitations'),
            axios.get('/api/feedback'),
            axios.get('/api/audit-logs'),
          ]);

        if (canteenRes.status === 'fulfilled' && canteenRes.value.data?.success && canteenRes.value.data.data?.length > 0) {
          setCanteens(canteenRes.value.data.data);
        }
        if (foodRes.status === 'fulfilled' && foodRes.value.data?.success && foodRes.value.data.data?.length > 0) {
          const fetchedMenu = foodRes.value.data.data.map((item) => ({
            ...item,
            id: item._id || item.id,
            _id: item._id || item.id,
          }));
          setMenuItems(fetchedMenu);
        }
        if (invRes.status === 'fulfilled' && invRes.value.data?.success && invRes.value.data.data?.length > 0) {
          const fetchedInv = invRes.value.data.data.map((item) => ({
            ...item,
            id: item._id || item.id,
          }));
          setInventoryItems(fetchedInv);
        }
        if (recRes.status === 'fulfilled' && recRes.value.data?.success && recRes.value.data.data?.length > 0) {
          setRecipes(recRes.value.data.data);
        }
        if (inviRes.status === 'fulfilled' && inviRes.value.data?.success && inviRes.value.data.data?.length > 0) {
          setOwnerInvitations(inviRes.value.data.data);
        }
        if (feedRes.status === 'fulfilled' && feedRes.value.data?.success && feedRes.value.data.data?.length > 0) {
          setFeedbackList(feedRes.value.data.data);
        }
        if (auditRes.status === 'fulfilled' && auditRes.value.data?.success && auditRes.value.data.data?.length > 0) {
          setAuditLogs(auditRes.value.data.data);
        }
      } catch (err) {
        console.debug('Backend offline, running on local store:', err.message);
      }
    };

    syncBackendData();
  }, []);

  // Real-time Automated WhatsApp & Status Update listener from Socket.IO
  useEffect(() => {
    const handleWhatsAppAlert = (e) => {
      const data = e.detail;
      if (data) {
        setSimulatedWhatsAppAlert({
          type: data.type || 'ACCEPTED',
          phone: data.phone,
          token: data.tokenNumber,
          studentName: data.studentName,
          counter: data.counter,
          message: data.message,
          estimatedMinutes: data.estimatedMinutes,
          readyTime: data.readyTime,
          whatsappUrl: data.whatsappUrl,
          time: data.timestamp || new Date().toLocaleTimeString(),
        });
        setTimeout(() => setSimulatedWhatsAppAlert(null), 14000);
      }
    };

    const handleOrderStatusUpdated = (e) => {
      const data = e.detail;
      if (data && data.orderId) {
        setOrders((prev) =>
          prev.map((ord) => {
            if (ord.id === data.orderId || ord._id === data.orderId) {
              return {
                ...ord,
                status: data.status,
                assignedCounter: data.assignedCounter || ord.assignedCounter,
                estimatedPrepMinutes: data.estimatedPrepMinutes || ord.estimatedPrepMinutes,
                estimatedReadyTime: data.estimatedReadyTime || ord.estimatedReadyTime,
              };
            }
            return ord;
          })
        );
      }
    };

    window.addEventListener('smartcanteen:whatsapp_alert', handleWhatsAppAlert);
    window.addEventListener('smartcanteen:order_status_updated', handleOrderStatusUpdated);

    return () => {
      window.removeEventListener('smartcanteen:whatsapp_alert', handleWhatsAppAlert);
      window.removeEventListener('smartcanteen:order_status_updated', handleOrderStatusUpdated);
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('smart_canteen_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('smart_canteen_canteens', JSON.stringify(canteens));
  }, [canteens]);

  useEffect(() => {
    localStorage.setItem('smart_canteen_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('smart_canteen_inventory', JSON.stringify(inventoryItems));
  }, [inventoryItems]);

  useEffect(() => {
    localStorage.setItem('smart_canteen_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('smart_canteen_transactions', JSON.stringify(stockTransactions));
  }, [stockTransactions]);

  // 1. Cross-Tab & Cross-Device Instant Real-time Orders Synchronization Channel
  const ordersBroadcastRef = useRef(null);

  const persistAndBroadcastOrders = (nextOrders, eventType = 'SYNC', meta = {}) => {
    setOrders(nextOrders);
    try {
      localStorage.setItem('smart_canteen_orders', JSON.stringify(nextOrders));
    } catch (e) {
      console.debug('Failed to write orders to localStorage:', e);
    }

    // A. Local BroadcastChannel for zero-latency multi-tab sync
    if (ordersBroadcastRef.current) {
      try {
        ordersBroadcastRef.current.postMessage({
          type: eventType,
          orders: nextOrders,
          timestamp: Date.now(),
          ...meta,
        });
      } catch (err) {
        console.debug('BroadcastChannel postMessage error:', err);
      }
    }

    // B. Local DOM event for current window components
    window.dispatchEvent(
      new CustomEvent('smartcanteen:orders_sync', {
        detail: { orders: nextOrders, type: eventType, ...meta },
      })
    );

    // C. Cross-Device Cloud Realtime Broadcast (sub-100ms delivery to Phones, Laptops, TV Displays)
    publishOrderEvent({
      type: eventType,
      ...meta,
    });
  };

  useEffect(() => {
    // A. BroadcastChannel for zero-latency multi-tab sync on same machine
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('smart_canteen_orders_channel');
      ordersBroadcastRef.current = channel;

      channel.onmessage = (event) => {
        const { type, orders: incomingOrders, newOrder } = event.data || {};
        if (incomingOrders && Array.isArray(incomingOrders)) {
          setOrders((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(incomingOrders)) return prev;
            return incomingOrders;
          });
        }
        if (type === 'NEW_ORDER' && newOrder) {
          playNotificationSound('new_order');
        }
      };
    }

    // B. Window Storage event listener (across browser tabs)
    const handleStorage = (e) => {
      if (e.key === 'smart_canteen_orders' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setOrders((prev) => {
              if (JSON.stringify(prev) === JSON.stringify(parsed)) return prev;
              return parsed;
            });
          }
        } catch (err) {
          console.debug('Storage sync error:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    // C. Real-Time Cloud SSE Stream for Cross-Device Synchronization
    const unsubscribeCloud = subscribeToOrderEvents((cloudEvent) => {
      const { type, orders: incomingOrders, newOrder, orderId, newStatus, updatedOrder } = cloudEvent || {};

      if (type === 'NEW_ORDER' && newOrder) {
        setOrders((prev) => {
          const exists = prev.some(
            (o) =>
              (o.id && o.id === newOrder.id) ||
              (o.tokenNumber && o.tokenNumber === newOrder.tokenNumber)
          );
          if (exists) return prev;
          const updated = [newOrder, ...prev];
          try {
            localStorage.setItem('smart_canteen_orders', JSON.stringify(updated));
          } catch (_) {}
          playNotificationSound('new_order');
          window.dispatchEvent(
            new CustomEvent('smartcanteen:orders_sync', {
              detail: { orders: updated, type: 'NEW_ORDER', newOrder },
            })
          );
          return updated;
        });
      } else if (type === 'STATUS_UPDATED') {
        setOrders((prev) => {
          const nextList = prev.map((o) => {
            if (
              (orderId && o.id === orderId) ||
              (updatedOrder && (o.id === updatedOrder.id || o.tokenNumber === updatedOrder.tokenNumber))
            ) {
              const statusToSet = newStatus || updatedOrder?.status || o.status;
              if (statusToSet === 'Ready for Pickup') {
                playNotificationSound('ready');
              }
              return { ...o, ...(updatedOrder || {}), status: statusToSet };
            }
            return o;
          });
          try {
            localStorage.setItem('smart_canteen_orders', JSON.stringify(nextList));
          } catch (_) {}
          window.dispatchEvent(
            new CustomEvent('smartcanteen:orders_sync', {
              detail: { orders: nextList, type: 'STATUS_UPDATED', orderId, newStatus, updatedOrder },
            })
          );
          return nextList;
        });
      } else if (incomingOrders && Array.isArray(incomingOrders)) {
        setOrders((prev) => {
          const merged = mergeOrders(prev, incomingOrders);
          try {
            localStorage.setItem('smart_canteen_orders', JSON.stringify(merged));
          } catch (_) {}
          return merged;
        });
      }
    });

    // D. Cloud Catch-up: Replay recent cloud order events on mount/open
    fetchRecentCloudEvents().then((events) => {
      if (events && events.length > 0) {
        setOrders((prev) => {
          let currentList = [...prev];
          for (const ev of events) {
            if (ev.type === 'NEW_ORDER' && ev.newOrder) {
              if (!currentList.some((o) => o.id === ev.newOrder.id || o.tokenNumber === ev.newOrder.tokenNumber)) {
                currentList = [ev.newOrder, ...currentList];
              }
            } else if (ev.type === 'STATUS_UPDATED') {
              currentList = currentList.map((o) => {
                if (
                  (ev.orderId && o.id === ev.orderId) ||
                  (ev.updatedOrder && (o.id === ev.updatedOrder.id || o.tokenNumber === ev.updatedOrder.tokenNumber))
                ) {
                  return {
                    ...o,
                    ...(ev.updatedOrder || {}),
                    status: ev.newStatus || ev.updatedOrder?.status || o.status,
                  };
                }
                return o;
              });
            } else if (ev.orders && Array.isArray(ev.orders)) {
              currentList = mergeOrders(currentList, ev.orders);
            }
          }
          try {
            localStorage.setItem('smart_canteen_orders', JSON.stringify(currentList));
          } catch (_) {}
          return currentList;
        });
      }
    });

    // E. Socket.IO Events
    const handleSocketOrderNew = (e) => {
      const incoming = normalizeOrder(e.detail);
      if (!incoming) return;
      setOrders((prev) => {
        const exists = prev.some(
          (o) =>
            (o.id && o.id === incoming.id) ||
            (o.tokenNumber && o.tokenNumber === incoming.tokenNumber)
        );
        if (exists) return prev;
        const updated = [incoming, ...prev];
        persistAndBroadcastOrders(updated, 'NEW_ORDER', { newOrder: incoming });
        return updated;
      });
      playNotificationSound('new_order');
    };

    const handleSocketStatusUpdated = (e) => {
      const updated = normalizeOrder(e.detail);
      if (!updated) return;
      setOrders((prev) => {
        const nextList = prev.map((o) =>
          (o.id && o.id === updated.id) ||
          (o.tokenNumber && o.tokenNumber === updated.tokenNumber)
            ? { ...o, ...updated }
            : o
        );
        persistAndBroadcastOrders(nextList, 'STATUS_UPDATED', { updatedOrder: updated });
        return nextList;
      });
    };

    window.addEventListener('smartcanteen:order_new', handleSocketOrderNew);
    window.addEventListener('smartcanteen:order_status_updated', handleSocketStatusUpdated);

    // F. Periodic Server Fetch (Every 3 seconds to sync backend when online)
    let isMounted = true;
    const syncWithServer = async () => {
      try {
        const res = await axios.get('/api/orders', { timeout: 3000 });
        if (isMounted && res.data?.orders && Array.isArray(res.data.orders)) {
          const serverOrders = res.data.orders;
          setOrders((prev) => {
            const merged = mergeOrders(prev, serverOrders);
            if (JSON.stringify(prev) !== JSON.stringify(merged)) {
              try {
                localStorage.setItem('smart_canteen_orders', JSON.stringify(merged));
              } catch (e) {}
              return merged;
            }
            return prev;
          });
        }
      } catch (err) {
        // Mock / offline fallback
      }
    };

    syncWithServer();
    const interval = setInterval(syncWithServer, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('smartcanteen:order_new', handleSocketOrderNew);
      window.removeEventListener('smartcanteen:order_status_updated', handleSocketStatusUpdated);
      if (unsubscribeCloud) unsubscribeCloud();
      if (ordersBroadcastRef.current) {
        ordersBroadcastRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('smart_canteen_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('smart_canteen_invitations', JSON.stringify(ownerInvitations));
  }, [ownerInvitations]);

  useEffect(() => {
    localStorage.setItem('smart_canteen_feedback', JSON.stringify(feedbackList));
  }, [feedbackList]);

  useEffect(() => {
    localStorage.setItem('smart_canteen_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Helper to log audit activity
  const logActivity = (actor, action, module, details) => {
    const newLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      actor,
      action,
      module,
      details,
      ip: '192.168.1.' + Math.floor(10 + Math.random() * 80),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    axios.post('/api/audit-logs', newLog).catch(() => {});
  };

  // ==========================================
  // ORDER ACTIONS & AUTO-RECIPE DEDUCTION
  // ==========================================
  const placeOrder = (orderData) => {
    const { tokenNumber, orderNumber, sequence } = generateUniqueToken(orders);

    const newOrder = {
      id: 'ord-' + Date.now(),
      orderId: orderNumber,
      tokenNumber,
      orderNumber,
      sequence,
      studentId: orderData.studentId || 'user-stu-1',
      studentName: orderData.studentName || 'Student Diner',
      studentEmail: orderData.studentEmail || 'ayushpandey1603@gmail.com',
      studentRoll: orderData.studentRoll || orderData.studentEnrollment || '0901CS221045',
      studentEnrollment: orderData.studentEnrollment || orderData.studentRoll || '0901CS221045',
      studentDepartment: orderData.studentDepartment || 'Computer Science & Engineering',
      studentPhone: orderData.studentPhone || '+91 98765 43210',
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      discountAmount: orderData.discountAmount || 0,
      finalAmount: orderData.finalAmount,
      couponCode: orderData.couponCode || '',
      paymentMethod: orderData.paymentMethod || 'UPI',
      paymentStatus: orderData.paymentMethod === 'UPI' ? 'PAID' : 'UNPAID',
      status: 'Placed',
      assignedCounter: 1, // Single Express Counter (MITS Canteen)
      scheduledPickupTime: orderData.scheduledPickupTime || 'ASAP (Immediate ~8m)',
      estimatedPrepMinutes: 8,
      whatsappOptIn: orderData.whatsappOptIn !== undefined ? orderData.whatsappOptIn : true,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stockDeducted: false,
    };

    const nextOrders = [newOrder, ...orders];
    persistAndBroadcastOrders(nextOrders, 'NEW_ORDER', { newOrder });
    playNotificationSound('new_order');
    logActivity(newOrder.studentName, 'ORDER_PLACED', 'ORDERS', `Placed order #${tokenNumber} for ₹${newOrder.finalAmount}`);

    // Trigger Automated WhatsApp Alert: Order Placed (if opted in)
    if (newOrder.whatsappOptIn !== false) {
      const itemsSummary = (newOrder.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ');
      const placedMsg = `🎉 *MITS Canteen — Order Placed!*\n\nHello *${newOrder.studentName || 'Student'}*!\nYour order has been placed successfully!\n\n🎫 *Token Number:* #${newOrder.tokenNumber}\n🍽️ *Items:* ${itemsSummary}\n💰 *Total Amount:* ₹${newOrder.finalAmount}\n⏳ *Estimated Wait:* ~8 Minutes\n📍 *Pickup Counter:* MITS Main Canteen (Counter, MITS Gwalior)\n\nThank you! 🚀`;
      const cleanPhone = String(newOrder.studentPhone || '9876543210').replace(/\D/g, '');
      const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(placedMsg)}`;

      setSimulatedWhatsAppAlert({
        type: 'PLACED',
        phone: newOrder.studentPhone || '+91 98765 43210',
        token: newOrder.tokenNumber,
        message: placedMsg,
        time: new Date().toLocaleTimeString(),
        whatsappUrl,
      });
      setTimeout(() => setSimulatedWhatsAppAlert(null), 12000);
    }

    // Asynchronously dispatch to real backend if online
    axios
      .post('/api/orders', {
        orderId: orderNumber,
        tokenNumber,
        studentId: orderData.studentId,
        studentName: orderData.studentName,
        studentEmail: orderData.studentEmail || 'ayushpandey1603@gmail.com',
        studentPhone: orderData.studentPhone,
        studentRoll: orderData.studentRoll || orderData.studentEnrollment,
        studentDepartment: orderData.studentDepartment,
        items: (orderData.items || []).map((i) => ({
          foodItemId: i.foodId || i._id || i.foodItem,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          isVeg: i.isVeg,
          counter: i.counter || 1,
          specialInstructions: i.specialInstructions || '',
        })),
        totalAmount: orderData.totalAmount,
        discountAmount: orderData.discountAmount || 0,
        finalAmount: orderData.finalAmount,
        paymentMethod: orderData.paymentMethod || 'UPI',
        scheduledPickupTime: orderData.scheduledPickupTime,
        pickupOption: orderData.pickupOption || 'ASAP',
        couponCode: orderData.couponCode,
        orderNotes: orderData.orderNotes,
        whatsappOptIn: true,
      })
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          const backendOrder = normalizeOrder(res.data.data);
          setOrders((prev) => {
            return prev.map((o) =>
              o.tokenNumber === tokenNumber || o.id === newOrder.id ? { ...o, ...backendOrder } : o
            );
          });
        }
      })
      .catch((e) => console.debug('Backend order sync:', e.message));

    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus, actorName = 'Kitchen Supervisor', extraOptions = {}) => {
    let targetUpdatedOrder = null;
    const nextOrders = orders.map((ord) => {
        if (ord.id !== orderId) return ord;

        const updated = { ...ord, status: newStatus };

        // 1. AUTO-DEDUCT RAW MATERIALS FROM RECIPE when moving to 'Preparing'
        if (newStatus === 'Preparing' && !ord.stockDeducted) {
          updated.stockDeducted = true;
          deductRecipeStockForOrder(ord);
        }

        // 2. DISPATCH AUTOMATED WHATSAPP ALERT when moving to 'Accepted'
        if (newStatus === 'Accepted' && ord.whatsappOptIn !== false) {
          playNotificationSound('whatsapp');
          const prepMins = Number(extraOptions.estimatedMinutes) || ord.estimatedPrepMinutes || 15;
          const readyTime = new Date(Date.now() + prepMins * 60 * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          updated.estimatedPrepMinutes = prepMins;
          updated.estimatedReadyTime = readyTime;

          const itemsSummary = (ord.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ');
          const alertMsg = `🎉 *MITS Canteen Alert*\n\nHello *${ord.studentName || 'Student'}*!\nYour food order *#${ord.tokenNumber}* has been *ACCEPTED* by MITS Canteen! 👨‍🍳\n\n⏳ *Estimated Preparation Time:* ~${prepMins} Minutes\n⏰ *Expected Ready By:* ${readyTime}\n📍 *Pickup Counter:* MITS Main Canteen (Counter, MITS Gwalior)\n🍽️ *Items:* ${itemsSummary}\n\nOur kitchen has started preparing your food fresh. You will receive another message as soon as your order is ready for pickup! 🚀`;

          const cleanPhone = String(ord.studentPhone || '9876543210').replace(/\D/g, '');
          const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
          const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(alertMsg)}`;

          setSimulatedWhatsAppAlert({
            type: 'ACCEPTED',
            phone: ord.studentPhone || '+91 98765 43210',
            token: ord.tokenNumber,
            message: alertMsg,
            time: new Date().toLocaleTimeString(),
            estimatedMinutes: prepMins,
            readyTime,
            whatsappUrl,
          });

          // Auto-clear alert toast after 12 seconds
          setTimeout(() => setSimulatedWhatsAppAlert(null), 12000);
        }

        // 3. DISPATCH AUTOMATED WHATSAPP ALERT when moving to 'Preparing'
        if (newStatus === 'Preparing' && ord.whatsappOptIn !== false) {
          playNotificationSound('preparing');
          const alertMsg = `🔥 *MITS Canteen — Food Being Prepared!*\n\nHello *${ord.studentName || 'Student'}*!\nYour food is being prepared.\n\n🎫 *Token Number:* #${ord.tokenNumber}\n📍 *Pickup Counter:* MITS Main Canteen (Counter, MITS Gwalior)\n\nAlmost ready! We will notify you the moment it is ready for collection. ⏳`;
          const cleanPhone = String(ord.studentPhone || '9876543210').replace(/\D/g, '');
          const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
          const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(alertMsg)}`;

          setSimulatedWhatsAppAlert({
            type: 'PREPARING',
            phone: ord.studentPhone || '+91 98765 43210',
            token: ord.tokenNumber,
            message: alertMsg,
            time: new Date().toLocaleTimeString(),
            whatsappUrl,
          });
          setTimeout(() => setSimulatedWhatsAppAlert(null), 12000);
        }

        // 4. DISPATCH AUTOMATED WHATSAPP ALERT when moving to 'Ready for Pickup'
        if (newStatus === 'Ready for Pickup' && ord.whatsappOptIn !== false) {
          playNotificationSound('ready');
          const alertMsg = `🔔 *MITS Canteen — Order Ready for Pickup!*\n\nHello *${ord.studentName || 'Student'}*!\nYour order is ready! Please collect it from the canteen.\n\n🎫 *Token Number:* #${ord.tokenNumber}\n📍 *Pickup Counter:* MITS Main Canteen (Counter, MITS Gwalior)\n\nPlease show your QR Pass for contactless collection! 😋`;

          const cleanPhone = String(ord.studentPhone || '9876543210').replace(/\D/g, '');
          const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
          const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(alertMsg)}`;

          setSimulatedWhatsAppAlert({
            type: 'READY',
            phone: ord.studentPhone || '+91 98765 43210',
            token: ord.tokenNumber,
            message: alertMsg,
            time: new Date().toLocaleTimeString(),
            whatsappUrl,
          });

          // Auto-clear alert toast after 12 seconds
          setTimeout(() => setSimulatedWhatsAppAlert(null), 12000);
        }

        // 5. DISPATCH AUTOMATED WHATSAPP ALERT when moving to 'Completed'
        if (newStatus === 'Completed' && ord.whatsappOptIn !== false) {
          playNotificationSound('completed');
          const alertMsg = `✅ *MITS Canteen — Order Completed!*\n\nHello *${ord.studentName || 'Student'}*!\nYour order has been completed. Thank you!\n\n🎫 *Token Number:* #${ord.tokenNumber}\n💰 *Amount:* ₹${ord.finalAmount}\n📍 *Counter:* MITS Main Canteen (Counter, MITS Gwalior)\n\nWe hope you enjoyed your meal! Have a great day! 🌟`;
          const cleanPhone = String(ord.studentPhone || '9876543210').replace(/\D/g, '');
          const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
          const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(alertMsg)}`;

          setSimulatedWhatsAppAlert({
            type: 'COMPLETED',
            phone: ord.studentPhone || '+91 98765 43210',
            token: ord.tokenNumber,
            message: alertMsg,
            time: new Date().toLocaleTimeString(),
            whatsappUrl,
          });
          setTimeout(() => setSimulatedWhatsAppAlert(null), 12000);
        }

        // 6. DISPATCH AUTOMATED WHATSAPP ALERT when moving to 'Cancelled'
        if (newStatus === 'Cancelled' && ord.whatsappOptIn !== false) {
          playNotificationSound('cancelled');
          const cancelReason = extraOptions.note || ord.orderNotes || 'Cancelled by canteen administration';
          const alertMsg = `❌ *MITS Canteen — Order Cancelled*\n\nHello *${ord.studentName || 'Student'}*!\nYour order has been cancelled.\n\n🎫 *Token Number:* #${ord.tokenNumber}\n⚠️ *Reason:* ${cancelReason}\n💰 *Amount:* ₹${ord.finalAmount}\n\nFor help, please visit MITS Main Canteen. We apologize for the inconvenience! 🙏`;
          const cleanPhone = String(ord.studentPhone || '9876543210').replace(/\D/g, '');
          const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
          const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(alertMsg)}`;

          setSimulatedWhatsAppAlert({
            type: 'CANCELLED',
            phone: ord.studentPhone || '+91 98765 43210',
            token: ord.tokenNumber,
            message: alertMsg,
            time: new Date().toLocaleTimeString(),
            whatsappUrl,
          });
          setTimeout(() => setSimulatedWhatsAppAlert(null), 12000);
        }

        // If completed and cash order, mark payment collected
        if (newStatus === 'Completed' && ord.paymentMethod === 'CASH_AT_COUNTER') {
          updated.paymentStatus = 'PAID';
        }

        targetUpdatedOrder = updated;
        logActivity(actorName, 'ORDER_STATUS_UPDATE', 'ORDERS', `Updated order #${ord.tokenNumber} status to ${newStatus}`);
        return updated;
      });

    persistAndBroadcastOrders(nextOrders, 'STATUS_UPDATED', {
      orderId,
      tokenNumber: targetUpdatedOrder?.tokenNumber,
      newStatus,
      updatedOrder: targetUpdatedOrder,
    });

    // Sync status & notify backend
    axios
      .patch(`/api/orders/${orderId}/status`, {
        orderId,
        tokenNumber: targetUpdatedOrder?.tokenNumber,
        status: newStatus,
        note: extraOptions.note,
        estimatedPrepMinutes: extraOptions.estimatedMinutes,
        updatedOrder: targetUpdatedOrder,
      })
      .catch(() => {});
  };

  // Recipe deduction engine: automatically calculates ingredient requirements & updates inventory
  const deductRecipeStockForOrder = (order) => {
    const deductions = [];

    setInventoryItems((prevInv) => {
      let updatedInv = [...prevInv];

      order.items.forEach((item) => {
        const recipe = recipes.find((r) => r.menuItemId === item.foodId);
        if (recipe && recipe.ingredients) {
          recipe.ingredients.forEach((ing) => {
            const totalRequired = ing.quantity * item.quantity;
            const invIndex = updatedInv.findIndex((i) => i.id === ing.inventoryId);

            if (invIndex > -1) {
              const current = updatedInv[invIndex].currentQuantity;
              const newQty = Math.max(0, Number((current - totalRequired).toFixed(3)));
              const status = newQty <= updatedInv[invIndex].minimumStockLevel ? 'Low Stock' : 'Optimal';

              updatedInv[invIndex] = {
                ...updatedInv[invIndex],
                currentQuantity: newQty,
                status,
              };

              deductions.push({
                inventoryItem: updatedInv[invIndex].name,
                deducted: totalRequired,
                unit: ing.unit,
                balance: newQty,
                foodName: item.name,
              });
            }
          });
        }
      });

      return updatedInv;
    });

    // Append to stock transaction ledger
    if (deductions.length > 0) {
      const newTxEntries = deductions.map((d, index) => ({
        id: `tx-deduct-${Date.now()}-${index}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        inventoryItem: d.inventoryItem,
        type: 'RECIPE_DEDUCTION',
        quantity: -d.deducted,
        unit: d.unit,
        balanceAfter: d.balance,
        reference: `Order #${order.tokenNumber} (${d.foodName})`,
        actor: 'Recipe Engine Auto-Deduction',
      }));

      setStockTransactions((prev) => [...newTxEntries, ...prev]);
    }
  };

  const rejectOrder = (orderId, reason = 'Ingredients or kitchen capacity temporarily unavailable') => {
    let targetUpdatedOrder = null;
    const nextOrders = orders.map((ord) => {
      if (ord.id === orderId || ord._id === orderId || ord.tokenNumber === orderId) {
        logActivity('Canteen Owner', 'ORDER_REJECTED', 'ORDERS', `Rejected order #${ord.tokenNumber}: ${reason}`);
        targetUpdatedOrder = { ...ord, status: 'Rejected', rejectionReason: reason };
        return targetUpdatedOrder;
      }
      return ord;
    });

    persistAndBroadcastOrders(nextOrders, 'STATUS_UPDATED', {
      orderId,
      tokenNumber: targetUpdatedOrder?.tokenNumber,
      newStatus: 'Rejected',
      updatedOrder: targetUpdatedOrder,
      reason,
    });

    axios
      .patch(`/api/orders/${orderId}/status`, {
        orderId,
        tokenNumber: targetUpdatedOrder?.tokenNumber,
        status: 'Rejected',
        reason,
        updatedOrder: targetUpdatedOrder,
      })
      .catch(() => {});
  };

  const cancelOrder = (orderId, reason = 'Student requested cancellation') => {
    let targetUpdatedOrder = null;
    const nextOrders = orders.map((ord) => {
      if (ord.id === orderId || ord._id === orderId || ord.tokenNumber === orderId) {
        logActivity(ord.studentName, 'ORDER_CANCELLED', 'ORDERS', `Cancelled order #${ord.tokenNumber}: ${reason}`);
        targetUpdatedOrder = { ...ord, status: 'Cancelled', cancellationReason: reason };
        return targetUpdatedOrder;
      }
      return ord;
    });

    persistAndBroadcastOrders(nextOrders, 'STATUS_UPDATED', {
      orderId,
      tokenNumber: targetUpdatedOrder?.tokenNumber,
      newStatus: 'Cancelled',
      updatedOrder: targetUpdatedOrder,
      reason,
    });

    axios
      .patch(`/api/orders/${orderId}/status`, {
        orderId,
        tokenNumber: targetUpdatedOrder?.tokenNumber,
        status: 'Cancelled',
        reason,
        updatedOrder: targetUpdatedOrder,
      })
      .catch(() => {});
  };

  const markCashPaymentCollected = (orderId, adminName) => {
    const nextOrders = orders.map((ord) => (ord.id === orderId ? { ...ord, paymentStatus: 'PAID' } : ord));
    persistAndBroadcastOrders(nextOrders, 'PAYMENT_COLLECTED', { orderId });
    logActivity(adminName, 'CASH_PAYMENT_COLLECTED', 'PAYMENTS', `Collected cash for order`);
  };

  // ==========================================
  // INVENTORY & STOCK MANAGEMENT
  // ==========================================
  const addStock = (inventoryId, quantity, supplier, price, notes = '') => {
    const qtyNum = Number(quantity);
    let itemRef = null;

    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === inventoryId) {
          const newQty = item.currentQuantity + qtyNum;
          const status = newQty > item.minimumStockLevel ? 'Optimal' : 'Low Stock';
          itemRef = { ...item, currentQuantity: newQty, status };
          return itemRef;
        }
        return item;
      })
    );

    if (itemRef) {
      const tx = {
        id: 'tx-' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        inventoryItem: itemRef.name,
        type: 'STOCK_IN',
        quantity: qtyNum,
        unit: itemRef.unit,
        balanceAfter: itemRef.currentQuantity,
        reference: supplier ? `Purchase from ${supplier}` : 'Stock In Entry',
        actor: 'Canteen Admin',
      };
      setStockTransactions((prev) => [tx, ...prev]);
      logActivity('Canteen Admin', 'STOCK_ADDED', 'INVENTORY', `Added +${qtyNum} ${itemRef.unit} of ${itemRef.name}`);
    }
  };

  const adjustStock = (inventoryId, newQuantity, reason) => {
    const newQty = Number(newQuantity);
    let itemRef = null;
    let delta = 0;

    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === inventoryId) {
          delta = newQty - item.currentQuantity;
          const status = newQty > item.minimumStockLevel ? 'Optimal' : 'Low Stock';
          itemRef = { ...item, currentQuantity: newQty, status };
          return itemRef;
        }
        return item;
      })
    );

    if (itemRef) {
      const tx = {
        id: 'tx-adj-' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        inventoryItem: itemRef.name,
        type: 'MANUAL_ADJUSTMENT',
        quantity: delta,
        unit: itemRef.unit,
        balanceAfter: newQty,
        reference: `Adjustment: ${reason}`,
        actor: 'Canteen Admin',
      };
      setStockTransactions((prev) => [tx, ...prev]);
      logActivity('Canteen Admin', 'STOCK_ADJUSTED', 'INVENTORY', `Adjusted ${itemRef.name} to ${newQty} ${itemRef.unit} (${reason})`);
    }
  };

  // ==========================================
  // MENU MANAGEMENT
  // ==========================================
  const addFoodItem = (foodData) => {
    const newItem = {
      ...foodData,
      id: 'food-' + Date.now(),
      rating: 5.0,
      reviewCount: 0,
      isAvailable: true,
    };
    setMenuItems((prev) => [newItem, ...prev]);
    logActivity('Canteen Admin', 'FOOD_ADDED', 'MENU', `Added new dish: ${newItem.name} (₹${newItem.price})`);
    return newItem;
  };

  const updateFoodItem = (foodId, updatedData) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === foodId ? { ...item, ...updatedData } : item))
    );
    logActivity('Canteen Admin', 'FOOD_UPDATED', 'MENU', `Updated dish: ${updatedData.name}`);
  };

  const deleteFoodItem = (foodId) => {
    const item = menuItems.find((i) => i.id === foodId);
    setMenuItems((prev) => prev.filter((i) => i.id !== foodId));
    logActivity('Canteen Admin', 'FOOD_DELETED', 'MENU', `Removed dish: ${item?.name || foodId}`);
  };

  const toggleFoodStock = (foodId) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === foodId) {
          const nextState = !item.isAvailable;
          logActivity('Canteen Admin', 'STOCK_TOGGLE', 'MENU', `Toggled ${item.name} to ${nextState ? 'In Stock' : 'Sold Out'}`);
          return { ...item, isAvailable: nextState };
        }
        return item;
      })
    );
  };

  // ==========================================
  // RECIPE MANAGEMENT
  // ==========================================
  const saveRecipe = (menuItemId, ingredients, instructions, prepTime) => {
    const menuItem = menuItems.find((m) => m.id === menuItemId);
    const existingIndex = recipes.findIndex((r) => r.menuItemId === menuItemId);

    // Calculate approximate cost per plate
    let cost = 0;
    ingredients.forEach((ing) => {
      const inv = inventoryItems.find((i) => i.id === ing.inventoryId);
      if (inv && inv.purchasePrice) {
        cost += ing.quantity * inv.purchasePrice;
      }
    });

    const newRecipe = {
      menuItemId,
      menuItemName: menuItem?.name || 'Dish',
      ingredients,
      instructions: instructions || 'Standard preparation standard.',
      preparationTime: Number(prepTime) || 8,
      estimatedCost: Number(cost.toFixed(2)),
    };

    if (existingIndex > -1) {
      setRecipes((prev) => prev.map((r) => (r.menuItemId === menuItemId ? newRecipe : r)));
    } else {
      setRecipes((prev) => [...prev, newRecipe]);
    }

    logActivity('Canteen Admin', 'RECIPE_SAVED', 'RECIPES', `Configured ingredient recipe formula for ${newRecipe.menuItemName}`);
  };

  // ==========================================
  // SUPER ADMIN: CANTEEN OWNER MANAGEMENT & 24H INVITATIONS
  // ==========================================
  const createOwnerManually = (ownerData) => {
    const newOwner = {
      id: 'user-owner-' + Date.now(),
      name: ownerData.name,
      email: ownerData.email,
      password: ownerData.tempPassword || 'temp123',
      role: 'canteen_admin',
      staffId: 'STAFF-MGR-' + Math.floor(10 + Math.random() * 90),
      canteenId: ownerData.canteenId || 'canteen-1',
      canteenName: ownerData.canteenName || 'Main Campus Food Court',
      department: 'Campus Hospitality',
      phone: ownerData.phone || '+91 98000 00000',
      isActive: true,
      requiresPasswordChange: true, // Requires first-login password update!
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [...prev, newOwner]);
    logActivity('Campus Directorate', 'OWNER_CREATED_MANUALLY', 'OWNER_MANAGEMENT', `Created Canteen Owner account for ${newOwner.name} (${newOwner.canteenName})`);
    return newOwner;
  };

  const sendOwnerInvitation = (inviteData) => {
    const now = Date.now();
    const newInvite = {
      id: 'inv-invite-' + Date.now(),
      name: inviteData.name,
      email: inviteData.email,
      phone: inviteData.phone,
      canteenAssigned: inviteData.canteenAssigned || 'Campus Canteen Branch',
      sentBy: 'Campus Directorate',
      sentAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 24 * 3600 * 1000).toISOString(), // Exact 24-hour onboarding window!
      status: 'PENDING',
      tempPassword: 'TEMP-' + Math.floor(100000 + Math.random() * 900000),
    };

    setOwnerInvitations((prev) => [newInvite, ...prev]);
    logActivity('Campus Directorate', 'INVITATION_SENT', 'OWNER_MANAGEMENT', `Sent 24h onboarding invite to ${newInvite.email} for ${newInvite.canteenAssigned}`);
    return newInvite;
  };

  const resendInvitation = (inviteId) => {
    const now = Date.now();
    setOwnerInvitations((prev) =>
      prev.map((inv) => {
        if (inv.id === inviteId) {
          logActivity('Campus Directorate', 'INVITATION_RESENT', 'OWNER_MANAGEMENT', `Reset 24h onboarding deadline for ${inv.email}`);
          return {
            ...inv,
            sentAt: new Date(now).toISOString(),
            expiresAt: new Date(now + 24 * 3600 * 1000).toISOString(), // 24 hours from right now!
            status: 'PENDING',
          };
        }
        return inv;
      })
    );
  };

  const revokeInvitation = (inviteId) => {
    setOwnerInvitations((prev) =>
      prev.map((inv) => {
        if (inv.id === inviteId) {
          logActivity('Campus Directorate', 'INVITATION_REVOKED', 'OWNER_MANAGEMENT', `Revoked onboarding invitation for ${inv.email}`);
          return { ...inv, status: 'REVOKED' };
        }
        return inv;
      })
    );
  };

  const toggleOwnerStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextActive = !u.isActive;
          logActivity('Campus Directorate', 'OWNER_STATUS_TOGGLED', 'OWNER_MANAGEMENT', `${nextActive ? 'Activated' : 'Deactivated'} Canteen Owner account for ${u.name}`);
          return { ...u, isActive: nextActive };
        }
        return u;
      })
    );
  };

  const toggleStudentStatus = (studentId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === studentId) {
          const nextActive = !u.isActive;
          logActivity('Campus Directorate', 'STUDENT_STATUS_TOGGLED', 'STUDENT_MANAGEMENT', `${nextActive ? 'Re-activated' : 'Suspended'} student account for ${u.name}`);
          return { ...u, isActive: nextActive };
        }
        return u;
      })
    );
  };

  const toggleCanteenStatus = (canteenId) => {
    setCanteens((prev) =>
      prev.map((c) => {
        if (c.id === canteenId) {
          const nextOpen = !c.isOpen;
          logActivity('Admin', 'CANTEEN_STATUS_TOGGLE', 'CANTEEN_OPERATIONS', `Turned ${c.name} ${nextOpen ? 'OPEN' : 'CLOSED'}`);
          return { ...c, isOpen: nextOpen, status: nextOpen ? 'Operational' : 'Closed' };
        }
        return c;
      })
    );
  };

  // Canteen Owner Only: Upload or update custom payment QR code & UPI VPA
  const updateCanteenPaymentQR = (canteenId, qrPayload, actor = 'Canteen Owner') => {
    setCanteens((prev) =>
      prev.map((c) => {
        if (c.id === canteenId || c._id === canteenId) {
          return {
            ...c,
            qrCodeImage: qrPayload.qrCodeImage !== undefined ? qrPayload.qrCodeImage : c.qrCodeImage,
            upiId: qrPayload.upiId || c.upiId || 'smartcampus.canteen@okhdfcbank',
            upiMerchantName: qrPayload.upiMerchantName || c.upiMerchantName || c.name,
          };
        }
        return c;
      })
    );

    logActivity(actor, 'PAYMENT_QR_UPDATED', 'CANTEEN_OPERATIONS', `Uploaded / updated custom Canteen UPI payment QR`);
    axios.patch(`/api/canteens/${canteenId}/payment-qr`, qrPayload).catch((e) => console.debug('Backend QR sync offline'));
  };

  const changeUserPassword = (userId, newPassword) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          logActivity(u.name, 'PASSWORD_CHANGED', 'SECURITY', `Completed required initial password setup`);
          return { ...u, password: newPassword, requiresPasswordChange: false };
        }
        return u;
      })
    );
  };

  const submitFeedback = (fbData) => {
    const newFb = {
      ...fbData,
      id: 'fb-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setFeedbackList((prev) => [newFb, ...prev]);
    logActivity(fbData.studentName, 'FEEDBACK_SUBMITTED', 'STUDENT_FEEDBACK', `Reviewed ${fbData.foodName || fbData.foodItem || 'Dish'} (${fbData.rating} Stars)`);
    axios.post('/api/feedback', fbData).catch(() => {});
    return newFb;
  };

  const deleteFeedback = (feedbackId) => {
    setFeedbackList((prev) => prev.filter((f) => (f.id !== feedbackId && f._id !== feedbackId)));
    axios.delete(`/api/feedback/${feedbackId}`).catch(() => {});
  };

  return (
    <DataContext.Provider
      value={{
        users,
        canteens,
        menuItems,
        inventoryItems,
        recipes,
        stockTransactions,
        orders,
        ownerInvitations,
        feedbackList,
        auditLogs,
        simulatedWhatsAppAlert,
        setSimulatedWhatsAppAlert,
        placeOrder,
        updateOrderStatus,
        rejectOrder,
        cancelOrder,
        markCashPaymentCollected,
        addFoodItem,
        updateFoodItem,
        deleteFoodItem,
        toggleFoodStock,
        addStock,
        adjustStock,
        saveRecipe,
        createOwnerManually,
        sendOwnerInvitation,
        resendInvitation,
        revokeInvitation,
        toggleOwnerStatus,
        toggleStudentStatus,
        toggleCanteenStatus,
        updateCanteenPaymentQR,
        changeUserPassword,
        submitFeedback,
        deleteFeedback,
        logActivity,
        homepageConfig,
        updateHomepageConfig,
        getTodayDiscount,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
