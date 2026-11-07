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
      // Relay to real-time cloud stream
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
      const { orderId, status, updatedOrder } = req.body;
      try {
        await fetch(CLOUD_URL, {
          method: 'POST',
          headers: { 'Title': 'STATUS_UPDATED' },
          body: JSON.stringify({ type: 'STATUS_UPDATED', orderId, newStatus: status, updatedOrder }),
        });
      } catch (_) {}
      return res.status(200).json({ success: true, orderId, status });
    }

    // Default GET: fetch recent events from cloud
    const cloudRes = await fetch(`${CLOUD_URL}/json?poll=1&since=12h`);
    const text = await cloudRes.text();
    const lines = text.trim().split('\n');
    const cloudOrders = [];

    for (const line of lines) {
      if (!line) continue;
      try {
        const item = JSON.parse(line);
        if (item.message) {
          const parsed = JSON.parse(item.message);
          if (parsed.type === 'NEW_ORDER' && parsed.newOrder) {
            cloudOrders.push(parsed.newOrder);
          }
        }
      } catch (_) {}
    }

    return res.status(200).json({ success: true, orders: cloudOrders });
  } catch (err) {
    return res.status(200).json({ success: true, orders: [] });
  }
}
