// Serverless API for Vercel deployment - /api/orders/live-tokens
const TOPIC = 'mits_campus_canteen_sync_prod_2026';
const CLOUD_URL = `https://ntfy.sh/${TOPIC}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
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
                ordersMap.set(k, { ...v, status: nextStatus });
              }
            }
          }
        }
      } catch (_) {}
    }

    const allOrders = Array.from(ordersMap.values());
    const preparing = allOrders.filter((o) => ['Accepted', 'Preparing'].includes(o.status));
    const ready = allOrders.filter((o) => o.status === 'Ready for Pickup');
    const recentlyCompleted = allOrders.filter((o) => ['Completed', 'Collected'].includes(o.status)).slice(0, 10);

    const totalActive = preparing.length + ready.length;
    const avgWaitMinutes =
      preparing.length > 0
        ? Math.round(
            preparing.reduce((acc, o) => acc + (o.estimatedPrepMinutes || 10), 0) / preparing.length
          )
        : 8;

    return res.status(200).json({
      success: true,
      data: {
        preparing,
        ready,
        recentlyCompleted,
        stats: {
          totalActive,
          avgWaitMinutes,
          countersActive: 1,
        },
      },
    });
  } catch (err) {
    return res.status(200).json({
      success: true,
      data: {
        preparing: [],
        ready: [],
        recentlyCompleted: [],
        stats: {
          totalActive: 0,
          avgWaitMinutes: 8,
          countersActive: 1,
        },
      },
    });
  }
}
