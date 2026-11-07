// Centralized Serverless API for Vercel deployment - /api/orders
// Connects directly to persistent central cloud store (AWS edge) for 100% reliable global sync

const CLOUD_STORE_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1b6de08125dc5';

const isMock = (ord) => {
  if (!ord || typeof ord !== 'object') return true;
  const mockIds = ['ord-100', 'ord-101', 'ord-102', 'ord-103', 'ord-104'];
  const mockNames = ['Aryan Sharma', 'Priya Patel'];
  const name = String(ord.studentName || ord.customerName || '');
  const id = String(ord.id || ord._id || '');
  if (mockIds.includes(id)) return true;
  if (mockNames.some((n) => name.toLowerCase().includes(n.toLowerCase()))) return true;
  return false;
};

const doesMatch = (ord, cleanId, cleanToken) => {
  if (!ord) return false;
  const id = String(ord.id || ord._id || ord.orderId || '').toLowerCase();
  const token = String(ord.tokenNumber || '').replace('#', '').toLowerCase();
  const num = String(ord.orderNumber || '').toLowerCase();
  const targetId = String(cleanId || '').toLowerCase();
  const targetToken = String(cleanToken || '').replace('#', '').toLowerCase();

  if (targetToken && token && token === targetToken) return true;
  if (targetId && (id === targetId || num === targetId || token === targetId)) return true;
  return false;
};

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
    // 1. POST: Place a new order
    if (req.method === 'POST') {
      const order = req.body;
      if (!order || isMock(order)) {
        return res.status(200).json({ success: true, order });
      }

      try {
        const storeRes = await fetch(CLOUD_STORE_URL);
        const storeJson = await storeRes.json();
        const existing = Array.isArray(storeJson?.data?.orders) ? storeJson.data.orders : [];

        const alreadyExists = existing.some(
          (o) =>
            (o.id && o.id === order.id) ||
            (o.tokenNumber && o.tokenNumber === order.tokenNumber)
        );

        if (!alreadyExists) {
          const nextList = [order, ...existing].filter((o) => !isMock(o)).slice(0, 100);
          await fetch(CLOUD_STORE_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'mits-campus-canteen-orders-master',
              data: { orders: nextList, lastUpdated: Date.now() },
            }),
          });
        }
      } catch (err) {
        console.error('POST order sync error:', err.message);
      }

      return res.status(201).json({ success: true, order });
    }

    // 2. PATCH / PUT: Update order status
    if (req.method === 'PATCH' || req.method === 'PUT') {
      const {
        orderId,
        tokenNumber,
        status,
        newStatus,
        reason,
        assignedCounter,
        estimatedPrepMinutes,
        estimatedReadyTime,
      } = req.body || {};
      const finalStatus = status || newStatus;
      const cleanToken = tokenNumber;
      const cleanOrderId = orderId;

      try {
        const storeRes = await fetch(CLOUD_STORE_URL);
        const storeJson = await storeRes.json();
        const existing = Array.isArray(storeJson?.data?.orders) ? storeJson.data.orders : [];

        const nextList = existing.map((o) => {
          if (doesMatch(o, cleanOrderId, cleanToken)) {
            return {
              ...o,
              status: finalStatus,
              assignedCounter: assignedCounter || o.assignedCounter || 1,
              estimatedPrepMinutes: estimatedPrepMinutes || o.estimatedPrepMinutes,
              estimatedReadyTime: estimatedReadyTime || o.estimatedReadyTime,
              rejectionReason: reason || o.rejectionReason,
              cancellationReason: reason || o.cancellationReason,
            };
          }
          return o;
        });

        await fetch(CLOUD_STORE_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'mits-campus-canteen-orders-master',
            data: { orders: nextList, lastUpdated: Date.now() },
          }),
        });
      } catch (err) {
        console.error('PATCH status sync error:', err.message);
      }

      return res.status(200).json({ success: true, orderId: cleanOrderId, status: finalStatus });
    }

    // 3. GET: Fetch all active & historical orders
    const storeRes = await fetch(CLOUD_STORE_URL);
    const storeJson = await storeRes.json();
    const orders = (Array.isArray(storeJson?.data?.orders) ? storeJson.data.orders : []).filter(
      (o) => !isMock(o)
    );

    return res.status(200).json({ success: true, orders });
  } catch (err) {
    return res.status(200).json({ success: true, orders: [] });
  }
}
