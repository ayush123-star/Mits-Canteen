/**
 * WhatsApp Order Alert Helper for MITS Canteen
 * Dispatches live order details straight to the Owner's WhatsApp
 */

export const DEFAULT_OWNER_PHONE = '919839567623';

export const cleanPhoneNumber = (raw) => {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
};

export const getOwnerWhatsAppNumber = () => {
  const saved = localStorage.getItem('mits_canteen_owner_whatsapp');
  if (saved && saved.trim()) {
    return cleanPhoneNumber(saved);
  }
  return DEFAULT_OWNER_PHONE;
};

export const setOwnerWhatsAppNumber = (rawPhone) => {
  const cleaned = cleanPhoneNumber(rawPhone);
  if (cleaned) {
    localStorage.setItem('mits_canteen_owner_whatsapp', cleaned);
    return cleaned;
  }
  return getOwnerWhatsAppNumber();
};

export const formatOrderWhatsAppMessage = (order) => {
  if (!order) return '';

  const itemsList = (order.items || [])
    .map((item, idx) => {
      let line = `  ${idx + 1}. *${item.quantity}x ${item.name}* (₹${(item.price || 0) * (item.quantity || 1)})`;
      if (item.specialInstructions) {
        line += `\n     ↳ ⚠️ _Prep:_ ${item.specialInstructions}`;
      }
      return line;
    })
    .join('\n');

  const customerName = order.studentName || 'Student';
  const customerPhone = order.studentPhone || 'Not provided';
  const customerRoll = order.studentRoll || order.studentEnrollment || 'BTET25O1039';
  const customerDept = order.studentDepartment || 'Electronics and Telecommunication';
  const token = order.tokenNumber || 'TK-101';
  const amount = order.finalAmount || order.totalAmount || 0;
  const payment = order.paymentMethod || 'UPI';
  const paymentStatus = order.paymentStatus || 'PAID';
  const slot = order.scheduledPickupTime || 'ASAP (Immediate)';

  const kitchenNotesSection = order.orderNotes
    ? `\n⚠️ *KITCHEN INSTRUCTIONS / TRAY NOTES:*\n👉 *${order.orderNotes}*\n`
    : '';

  return (
    `🛎️ *MITS CANTEEN — NEW ORDER RECEIVED!* 🛎️\n\n` +
    `🎫 *Token Number:* *#${token}*\n` +
    `👤 *Customer:* ${customerName}\n` +
    `📞 *Customer Phone:* ${customerPhone}\n` +
    `🏫 *Dept / ID:* ${customerDept} (${customerRoll})\n\n` +
    `🍽️ *Items Ordered:*\n${itemsList || '  • Food item'}\n` +
    kitchenNotesSection +
    `\n💰 *Total Amount:* *₹${amount}*\n` +
    `💳 *Payment Method:* ${payment} (${paymentStatus})\n` +
    `⏰ *Pickup Slot:* ${slot}\n` +
    `📍 *Pickup Counter:* MITS Main Canteen (Counter)\n\n` +
    `_Sent via MITS Smart Canteen Portal_ 🚀`
  );
};

export const generateWhatsAppUrl = (phone, message) => {
  const cleanPhone = cleanPhoneNumber(phone) || getOwnerWhatsAppNumber();
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
};

export const openOrderInWhatsApp = (order, customPhone = null) => {
  const phone = customPhone || getOwnerWhatsAppNumber();
  const message = formatOrderWhatsAppMessage(order);
  const url = generateWhatsAppUrl(phone, message);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (isMobile) {
    window.location.href = url;
  } else {
    window.open(url, '_blank');
  }
};
