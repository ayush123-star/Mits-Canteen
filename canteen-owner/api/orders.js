// Serverless API for Vercel deployment - /api/orders
// Provides persistent orders endpoint and relays to real-time cloud stream

const TOPIC = 'mits_campus_canteen_sync_prod_2026';
const CLOUD_URL = `https://ntfy.sh/${TOPIC}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const order = req.body;
      try {
        await fetch(CLOUD_URL, {
          method: 'POST',
          headers: { 'Title': 'NEW_ORDER' },
          body: JSON.stringify({ type: 'NEW_ORDER', newOrder: order }),
        });
      } catch (_) {}
      return res.status(201).json({ success: true, order });
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const { orderId, tokenNumber, status, newStatus, reason, updatedOrder } = req.body || {};
      const finalStatus = status || newStatus;
      try {
        await fetch(CLOUD_URL, {
          method: 'POST',
          headers: { 'Title': 'STATUS_UPDATED' },
          body: JSON.stringify({
            type: 'STATUS_UPDATED',
            orderId,
            tokenNumber: tokenNumber || updatedOrder?.tokenNumber,
            newStatus: finalStatus,
            reason,
            updatedOrder,
          }),
        });
      } catch (_) {}
      return res.status(200).json({ success: true, orderId, status: finalStatus });
    }

    // Default GET: fetch recent events from cloud and aggregate
    const cloudRes = await fetch(`${CLOUD_URL}/json?poll=1&since=12h`);
    const text = await cloudRes.text();
    const lines = text.trim().split('\n');
    const ordersMap = new Map();

    for (const line of lines) {
      if (!line) continue;
      try {
        const item = JSON.parse(line);
        if (item.message) {
          const parsed = JSON.parse(item.message);
          if (parsed.type === 'NEW_ORDER' && parsed.newOrder) {
            const key = parsed.newOrder.tokenNumber || parsed.newOrder.id || parsed.newOrder._id;
            ordersMap.set(key, parsed.newOrder);
          } else if (parsed.type === 'STATUS_UPDATED') {
            const token = parsed.tokenNumber || parsed.updatedOrder?.tokenNumber;
            const id = parsed.orderId || parsed.updatedOrder?.id || parsed.updatedOrder?._id;
            const nextStatus = parsed.newStatus || parsed.updatedOrder?.status;

            for (const [k, v] of ordersMap.entries()) {
              if (
                k === token ||
                k === id ||
                (token && v.tokenNumber === token) ||
                (id && (v.id === id || v._id === id))
              ) {
                ordersMap.set(k, {
                  ...v,
                  status: nextStatus,
                  rejectionReason: parsed.reason || v.rejectionReason,
                  cancellationReason: parsed.reason || v.cancellationReason,
                });
              }
            }
          }
        }
      } catch (_) {}
    }

    return res.status(200).json({ success: true, orders: Array.from(ordersMap.values()) });
  } catch (err) {
    return res.status(200).json({ success: true, orders: [] });
  }
}
