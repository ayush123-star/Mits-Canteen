const express = require('express');
const router = express.Router();
const { handleWhatsAppWebhookEvent } = require('../services/whatsappService');

/**
 * Meta WhatsApp Webhook Verification Endpoint
 * 
 * Used by Meta when configuring or validating Webhook URLs in Meta App Dashboard:
 * Dashboard -> WhatsApp -> Configuration -> Webhook -> Edit -> Callback URL
 */
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'mits_canteen_whatsapp_verify_token_2026';

  if (mode === 'subscribe' && token === expectedVerifyToken) {
    console.log('[Meta Webhook] Successfully verified webhook challenge token!');
    return res.status(200).send(challenge);
  } else {
    console.warn('[Meta Webhook] Webhook verification failed. Token mismatch or invalid mode.');
    return res.sendStatus(403);
  }
});

/**
 * Meta WhatsApp Webhook Event Receiver Endpoint
 * 
 * Receives delivery updates from Meta:
 * - 'sent' (Single tick)
 * - 'delivered' (Double grey ticks)
 * - 'read' (Blue ticks)
 * - 'failed' (Delivery failure, error code)
 */
router.post('/whatsapp', async (req, res) => {
  try {
    const io = req.app.get('socketio');
    const result = await handleWhatsAppWebhookEvent(req.body, io);

    // Meta strictly requires a 200 OK response to acknowledge event delivery
    return res.status(200).json({ status: 'EVENT_RECEIVED', result });
  } catch (err) {
    console.error('[Meta Webhook] Error processing event:', err);
    // Always return 200 to prevent Meta from retrying failed event endlessly
    return res.status(200).json({ status: 'ERROR_RECORDED', error: err.message });
  }
});

module.exports = router;
