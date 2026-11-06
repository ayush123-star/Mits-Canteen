const axios = require('axios');
const NotificationLog = require('../models/NotificationLog');

/**
 * Meta WhatsApp Cloud API Service
 * 
 * Implements automated customer notifications for MITS Canteen via the
 * official Meta WhatsApp Business Cloud API using Axios.
 * 
 * Supports:
 * - Order Placed
 * - Order Accepted
 * - Preparing
 * - Order Ready
 * - Order Completed
 * - Order Cancelled
 * - Duplicate prevention (idempotency checks)
 * - Customer consent check (whatsappOptIn)
 * - Webhook delivery status tracking (SENT, DELIVERED, READ, FAILED)
 */

// Environment Configurations
const getMetaConfig = () => {
  return {
    accessToken: process.env.META_WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
    templates: {
      Placed: process.env.WHATSAPP_TEMPLATE_ORDER_PLACED || '',
      Accepted: process.env.WHATSAPP_TEMPLATE_ORDER_ACCEPTED || '',
      Preparing: process.env.WHATSAPP_TEMPLATE_ORDER_PREPARING || '',
      'Ready for Pickup': process.env.WHATSAPP_TEMPLATE_ORDER_READY || '',
      Completed: process.env.WHATSAPP_TEMPLATE_ORDER_COMPLETED || '',
      Cancelled: process.env.WHATSAPP_TEMPLATE_ORDER_CANCELLED || '',
    },
  };
};

/**
 * Format phone number to international E.164 without leading '+' (Meta Cloud API standard)
 * Example: '9876543210' -> '919876543210'
 */
const formatPhoneNumber = (rawPhone) => {
  if (!rawPhone) return '';
  const clean = String(rawPhone).replace(/\D/g, '');
  if (!clean) return '';
  
  // If 10 digits (Standard Indian Mobile), prepend 91
  if (clean.length === 10) {
    return `91${clean}`;
  }
  // If 11 digits starting with 0, replace 0 with 91
  if (clean.length === 11 && clean.startsWith('0')) {
    return `91${clean.slice(1)}`;
  }
  // If already international (e.g. 12 digits starting with 91 or other country code)
  return clean;
};

/**
 * Check if the customer has consented to receive WhatsApp notifications
 */
const hasCustomerConsent = (order, student) => {
  if (order && order.whatsappOptIn === false) return false;
  if (student && student.whatsappOptIn === false) return false;
  return true;
};

/**
 * Check for duplicate notifications to prevent spamming on rapid status triggers
 */
const checkDuplicate = async (orderId, orderStatus) => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const existing = await NotificationLog.findOne({
      order: orderId,
      orderStatus,
      deliveryStatus: { $in: ['QUEUED', 'SENT', 'DELIVERED', 'READ'] },
      createdAt: { $gte: fifteenMinutesAgo },
    });
    return existing;
  } catch (err) {
    console.warn('[WhatsApp Service] Duplicate check error:', err.message);
    return null;
  }
};

/**
 * Low-level Meta WhatsApp Cloud API dispatcher using Axios
 */
const sendMetaWhatsAppMessage = async ({ toPhone, messageText, templateName, templateComponents }) => {
  const { accessToken, phoneNumberId, apiVersion } = getMetaConfig();

  if (!accessToken || !phoneNumberId) {
    console.warn('[WhatsApp Service] Meta WhatsApp Cloud API credentials missing in .env (META_WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID)');
    return {
      success: false,
      configured: false,
      error: 'Meta WhatsApp credentials missing in backend environment variables (.env)',
    };
  }

  const endpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  // Payload: If an approved template is configured, use template payload; otherwise use formatted text payload
  let payload;
  if (templateName) {
    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components: templateComponents || [],
      },
    };
  } else {
    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: messageText,
      },
    };
  }

  try {
    const response = await axios.post(endpoint, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    const waMessageId = response.data?.messages?.[0]?.id || null;
    return {
      success: true,
      configured: true,
      waMessageId,
      responseData: response.data,
    };
  } catch (axiosErr) {
    const errData = axiosErr.response?.data?.error || {};
    const errorMsg = errData.message || axiosErr.message || 'Meta API Request Failed';
    console.error('[WhatsApp Service] Meta WhatsApp Cloud API Error:', {
      status: axiosErr.response?.status,
      code: errData.code,
      subcode: errData.error_subcode,
      message: errorMsg,
    });

    // If template failed, attempt a text message fallback if outside template constraints
    if (templateName) {
      console.log('[WhatsApp Service] Template delivery failed. Attempting fallback text message...');
      return sendMetaWhatsAppMessage({ toPhone, messageText, templateName: null });
    }

    // If text message failed because 24h session is closed (code 131047), fallback to Meta default 'hello_world' template
    if (errData.code === 131047) {
      console.log('[WhatsApp Service] 24-hr session closed (Code 131047). Attempting Meta default "hello_world" template fallback...');
      try {
        const fallbackRes = await axios.post(
          endpoint,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: toPhone,
            type: 'template',
            template: {
              name: 'hello_world',
              language: { code: 'en_US' },
            },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );
        const waMessageId = fallbackRes.data?.messages?.[0]?.id || null;
        console.log(`[WhatsApp Service] Successfully sent fallback "hello_world" template (wamid: ${waMessageId})`);
        return {
          success: true,
          configured: true,
          waMessageId,
          responseData: fallbackRes.data,
        };
      } catch (fbErr) {
        console.warn('[WhatsApp Service] Fallback template failed:', fbErr.response?.data?.error?.message || fbErr.message);
      }
    }

    return {
      success: false,
      configured: true,
      error: errorMsg,
      errorDetails: errData,
    };
  }
};

/**
 * 1. Order Placed Notification
 * "Your order has been placed successfully!"
 */
const sendOrderPlacedNotification = async (order, student, io) => {
  return sendOrderStatusNotification(order, 'Placed', {}, io, student);
};

/**
 * 2. Order Accepted Notification
 * "Your order has been accepted by the canteen."
 */
const sendOrderAcceptedNotification = async (order, student, io, estimatedMinutes = 15) => {
  return sendOrderStatusNotification(order, 'Accepted', { estimatedPrepMinutes: estimatedMinutes }, io, student);
};

/**
 * 3. Preparing Notification
 * "Your food is being prepared."
 */
const sendOrderPreparingNotification = async (order, student, io) => {
  return sendOrderStatusNotification(order, 'Preparing', {}, io, student);
};

/**
 * 4. Order Ready Notification
 * "Your order is ready! Please collect it from the canteen."
 */
const sendOrderReadyNotification = async (order, student, io) => {
  return sendOrderStatusNotification(order, 'Ready for Pickup', {}, io, student);
};

/**
 * 5. Order Completed Notification
 * "Your order has been completed. Thank you!"
 */
const sendOrderCompletedNotification = async (order, student, io) => {
  return sendOrderStatusNotification(order, 'Completed', {}, io, student);
};

/**
 * 6. Order Cancelled Notification
 * "Your order has been cancelled."
 */
const sendOrderCancelledNotification = async (order, student, io, reason = '') => {
  return sendOrderStatusNotification(order, 'Cancelled', { note: reason }, io, student);
};

/**
 * Unified WhatsApp Notification Dispatcher
 * Automatically builds the message according to order status, checks consent,
 * prevents duplicates, dispatches via Meta Cloud API, logs to DB and emits socket updates.
 */
const sendOrderStatusNotification = async (order, newStatus, options = {}, io = null, studentObj = null) => {
  try {
    if (!order) {
      console.warn('[WhatsApp Service] No order object provided');
      return null;
    }

    const student = studentObj || order.user || {};
    const studentName = student?.name || order.studentName || 'Student';
    const rawPhone = student?.phone || order.studentPhone || '';
    const tokenNumber = order.tokenNumber || 'TK-000';
    const counter = order.assignedCounter || 1;
    const finalAmount = order.finalAmount || order.totalAmount || 0;
    const paymentMethod = order.paymentMethod === 'CASH_AT_COUNTER' ? 'Cash at Counter' : 'UPI Online';

    // Check Consent
    if (!hasCustomerConsent(order, student)) {
      console.log(`[WhatsApp Service] Customer ${studentName} (${rawPhone}) has opted out of WhatsApp notifications. Skipping.`);
      return { skipped: true, reason: 'CUSTOMER_OPTED_OUT' };
    }

    // Format target phone
    const targetPhone = formatPhoneNumber(rawPhone);
    if (!targetPhone) {
      console.warn(`[WhatsApp Service] Order #${tokenNumber} has no valid phone number. Skipping notification.`);
      return { skipped: true, reason: 'NO_PHONE_NUMBER' };
    }

    // Check for duplicate notification
    const existingDuplicate = await checkDuplicate(order._id, newStatus);
    if (existingDuplicate) {
      console.log(`[WhatsApp Service] Duplicate notification for Order #${tokenNumber} with status "${newStatus}" detected. Skipping.`);
      return {
        skipped: true,
        isDuplicate: true,
        logEntry: existingDuplicate,
      };
    }

    // Items summary
    const itemsSummary = (order.items || [])
      .map((i) => `${i.quantity}x ${i.name}`)
      .join(', ') || 'Campus Meal';

    // Calculate Estimated Timing
    const prepMins = Number(options.estimatedPrepMinutes) || order.estimatedPrepMinutes || 12;
    const readyTimeObj = new Date(Date.now() + prepMins * 60 * 1000);
    const formattedReadyTime = readyTimeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Generate Standard Message text based on the 6 requested statuses
    let messageText = '';
    const config = getMetaConfig();
    const templateName = config.templates[newStatus] || null;

    switch (newStatus) {
      case 'Placed':
        messageText = `🎉 *MITS Canteen — Order Placed!*\n\nHello *${studentName}*!\nYour order has been placed successfully!\n\n🎫 *Token Number:* #${tokenNumber}\n🍽️ *Items:* ${itemsSummary}\n💰 *Total Amount:* ₹${finalAmount} (${paymentMethod})\n⏳ *Estimated Wait:* ~${prepMins} Minutes\n📍 *Pickup Counter:* MITS Main Canteen (Counter 1, MITS Gwalior)\n\nWe will update you on WhatsApp as your meal is prepared. Thank you! 🚀`;
        break;

      case 'Accepted':
        messageText = `👨‍🍳 *MITS Canteen — Order Accepted!*\n\nHello *${studentName}*!\nYour order has been accepted by the canteen.\n\n🎫 *Token Number:* #${tokenNumber}\n⏳ *Estimated Preparation Time:* ~${prepMins} Minutes\n⏰ *Expected Ready By:* ${formattedReadyTime}\n📍 *Pickup Counter:* MITS Main Canteen (Counter 1, MITS Gwalior)\n🍽️ *Items:* ${itemsSummary}\n\nOur kitchen has started preparing your food fresh! 🍳`;
        break;

      case 'Preparing':
        messageText = `🔥 *MITS Canteen — Food Being Prepared!*\n\nHello *${studentName}*!\nYour food is being prepared.\n\n🎫 *Token Number:* #${tokenNumber}\n🍽️ *Items:* ${itemsSummary}\n📍 *Pickup Counter:* MITS Main Canteen (Counter 1, MITS Gwalior)\n\nAlmost ready! We will send you another message the moment it is ready for collection. ⏳`;
        break;

      case 'Ready for Pickup':
        messageText = `🔔 *MITS Canteen — Order Ready for Pickup!*\n\nHello *${studentName}*!\nYour order is ready! Please collect it from the canteen.\n\n🎫 *Token Number:* #${tokenNumber}\n📍 *Pickup Counter:* MITS Main Canteen (Counter 1, MITS Gwalior)\n🍽️ *Items:* ${itemsSummary}\n\nPlease show your Token Number or QR Pass at Counter 1 for contactless collection.\n\nEnjoy your meal! 😋`;
        break;

      case 'Completed':
        messageText = `✅ *MITS Canteen — Order Completed!*\n\nHello *${studentName}*!\nYour order has been completed. Thank you!\n\n🎫 *Token Number:* #${tokenNumber}\n💰 *Amount:* ₹${finalAmount}\n📍 *Counter:* MITS Main Canteen (Counter 1, MITS Gwalior)\n\nWe hope you enjoyed your meal! Have a great day ahead! 🌟`;
        break;

      case 'Cancelled':
        const cancelReason = options.note || order.orderNotes || 'Cancelled by canteen administration';
        messageText = `❌ *MITS Canteen — Order Cancelled*\n\nHello *${studentName}*!\nYour order has been cancelled.\n\n🎫 *Token Number:* #${tokenNumber}\n⚠️ *Reason:* ${cancelReason}\n💰 *Amount:* ₹${finalAmount}\n\nIf you have already paid, your refund will be processed or you may collect cash at the counter. For help, contact MITS Main Canteen. 🙏`;
        break;

      default:
        messageText = `ℹ️ *MITS Canteen Alert*\n\nHello *${studentName}*!\nYour order *#${tokenNumber}* status has been updated to *${newStatus}*.\n\nCounter: MITS Main Canteen (Counter 1, MITS Gwalior)`;
        break;
    }

    // Direct WhatsApp web link for 1-click fallback in UI
    const whatsappWebUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(messageText)}`;

    // Initial Database Log entry (QUEUED)
    const logEntry = await NotificationLog.create({
      order: order._id,
      orderStatus: newStatus,
      tokenNumber,
      studentName,
      recipientPhone: targetPhone,
      channel: 'WHATSAPP',
      message: messageText,
      deliveryStatus: 'QUEUED',
      templateName,
      counter,
      sentAt: new Date(),
    });

    // Send via Meta WhatsApp Cloud API using Axios
    const apiResult = await sendMetaWhatsAppMessage({
      toPhone: targetPhone,
      messageText,
      templateName,
    });

    if (apiResult.success) {
      logEntry.deliveryStatus = 'SENT';
      logEntry.waMessageId = apiResult.waMessageId;
      logEntry.statusTimestamps = {
        sentAt: new Date(),
      };
      logEntry.rawResponse = apiResult.responseData;
      await logEntry.save();
      console.log(`[WhatsApp Service] Meta WhatsApp Cloud API successfully sent "${newStatus}" notification to ${targetPhone} (wamid: ${apiResult.waMessageId})`);
    } else {
      logEntry.deliveryStatus = 'FAILED';
      logEntry.errorMessage = apiResult.error || 'Meta API delivery failed';
      logEntry.statusTimestamps = {
        failedAt: new Date(),
      };
      logEntry.rawResponse = apiResult.errorDetails || null;
      await logEntry.save();
      console.warn(`[WhatsApp Service] Notification saved to log as FAILED: ${apiResult.error}`);
    }

    // Real-time notification event via Socket.IO
    if (io) {
      io.emit('notification:whatsapp', {
        id: logEntry._id,
        orderId: order._id,
        orderStatus: newStatus,
        tokenNumber,
        studentName,
        phone: targetPhone,
        deliveryStatus: logEntry.deliveryStatus,
        waMessageId: logEntry.waMessageId,
        message: messageText,
        whatsappWebUrl,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    return {
      success: apiResult.success,
      logEntry,
      messageText,
      whatsappWebUrl,
      waMessageId: logEntry.waMessageId,
      deliveryStatus: logEntry.deliveryStatus,
    };
  } catch (err) {
    console.error('[WhatsApp Service] Unexpected error dispatching WhatsApp notification:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Handle Incoming Meta WhatsApp Webhook Status Updates (Sent, Delivered, Read, Failed)
 */
const handleWhatsAppWebhookEvent = async (webhookBody, io = null) => {
  try {
    if (!webhookBody || webhookBody.object !== 'whatsapp_business_account') {
      return { handled: false, reason: 'NOT_WHATSAPP_OBJECT' };
    }

    const entries = webhookBody.entry || [];
    let updatedCount = 0;

    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};
        const statuses = value.statuses || [];

        for (const statusObj of statuses) {
          const waMessageId = statusObj.id;
          const status = statusObj.status; // 'sent', 'delivered', 'read', 'failed'
          const recipientId = statusObj.recipient_id;
          const timestamp = statusObj.timestamp ? new Date(Number(statusObj.timestamp) * 1000) : new Date();

          if (!waMessageId) continue;

          // Find log by Meta message id
          const log = await NotificationLog.findOne({ waMessageId });
          if (log) {
            const mappedStatus = status.toUpperCase(); // 'SENT', 'DELIVERED', 'READ', 'FAILED'
            log.deliveryStatus = mappedStatus;

            if (!log.statusTimestamps) {
              log.statusTimestamps = {};
            }

            if (status === 'sent') log.statusTimestamps.sentAt = timestamp;
            if (status === 'delivered') log.statusTimestamps.deliveredAt = timestamp;
            if (status === 'read') log.statusTimestamps.readAt = timestamp;
            if (status === 'failed') {
              log.statusTimestamps.failedAt = timestamp;
              const errors = statusObj.errors || [];
              log.errorMessage = errors.map((e) => `${e.code}: ${e.title} - ${e.message}`).join('; ');
            }

            await log.save();
            updatedCount++;

            console.log(`[WhatsApp Webhook] Message ${waMessageId} updated to ${mappedStatus} for recipient ${recipientId}`);

            // Broadcast delivery event to admin & active clients
            if (io) {
              io.emit('whatsapp:status_update', {
                logId: log._id,
                orderId: log.order,
                waMessageId,
                status: mappedStatus,
                recipientPhone: recipientId,
                timestamp,
              });
            }
          }
        }
      }
    }

    return { handled: true, updatedCount };
  } catch (err) {
    console.error('[WhatsApp Webhook] Error processing webhook event:', err);
    return { handled: false, error: err.message };
  }
};

/**
 * Send Login OTP to Customer's WhatsApp Number
 */
const sendOtpViaWhatsApp = async (rawPhone, otpCode) => {
  const formattedPhone = formatPhoneNumber(rawPhone);
  const messageText = `🔐 *MITS Gwalior Canteen - Security OTP*\n\nYour one-time login verification code is: *${otpCode}*\n\nValid for 5 minutes. Please do not share this code with anyone. Enjoy your meal at MITS Main Canteen Counter 1! 🍛`;

  try {
    const res = await sendMetaWhatsAppMessage({
      toPhone: formattedPhone,
      messageText,
    });
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = {
  formatPhoneNumber,
  hasCustomerConsent,
  sendMetaWhatsAppMessage,
  sendOtpViaWhatsApp,
  sendOrderPlacedNotification,
  sendOrderAcceptedNotification,
  sendOrderPreparingNotification,
  sendOrderReadyNotification,
  sendOrderCompletedNotification,
  sendOrderCancelledNotification,
  sendOrderStatusNotification,
  handleWhatsAppWebhookEvent,
};
