// Centralized Serverless API for Vercel deployment - /api/orders
// Clean 200 OK responses with zero external rate limits
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);

const CACHE_FILE = '/tmp/canteenOrdersCache.json';

let canonicalData = {};
try {
  canonicalData = require('./canonicalData.json');
} catch (_) {}

let serverOrdersCache = Array.isArray(canonicalData?.orders) ? [...canonicalData.orders] : [];

try {
  if (fs.existsSync(CACHE_FILE)) {
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      serverOrdersCache = parsed.filter((o) => !isMock(o) && !String(o.id || '').startsWith('ord-ayush-10'));
    }
  }
} catch (_) {}

const saveCacheToDisk = () => {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(serverOrdersCache.filter((o) => !isMock(o) && !String(o.id || '').startsWith('ord-ayush-10')).slice(0, 150)), 'utf8');
  } catch (_) {}
};

const isMock = (ord) => {
  if (!ord || typeof ord !== 'object') return true;
  const mockIds = ['ord-100', 'ord-101', 'ord-102', 'ord-103', 'ord-104'];
  const mockNames = ['Aryan Sharma', 'Priya Patel'];
  const name = String(ord.studentName || ord.customerName || '');
  const id = String(ord.id || ord._id || '');
  if (mockIds.includes(id)) return true;
  if (mockNames.some((n) => name.toLowerCase().includes(n.toLowerCase()))) return true;
  if (id.startsWith('ord-ayush-10')) return true;
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
      if (order && !isMock(order)) {
        const exists = serverOrdersCache.some(
          (o) =>
            (o.id && o.id === order.id) ||
            (o.tokenNumber && o.tokenNumber === order.tokenNumber)
        );
        if (!exists) {
          serverOrdersCache = [order, ...serverOrdersCache].slice(0, 100);
          saveCacheToDisk();
        }
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

      serverOrdersCache = serverOrdersCache.map((o) => {
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

      saveCacheToDisk();
      return res.status(200).json({ success: true, orderId: cleanOrderId, status: finalStatus });
    }

    // 3. DELETE: Wipe all orders clean for fresh start
    if (req.method === 'DELETE') {
      serverOrdersCache = [];
      saveCacheToDisk();
      return res.status(200).json({ success: true, message: 'All orders wiped clean for fresh start', orders: [] });
    }

    // 4. GET: Fetch orders
    const orders = serverOrdersCache.filter((o) => !isMock(o));
    return res.status(200).json({ success: true, orders });
  } catch (err) {
    return res.status(200).json({ success: true, orders: [] });
  }
}
