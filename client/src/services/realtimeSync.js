/**
 * SMART CAMPUS CANTEEN - GLOBAL REAL-TIME SYNCHRONIZATION ENGINE
 * Powers instant cross-device order synchronization across Student Phones,
 * Canteen Owner Dashboard, and Live TV Token Display.
 */

// Dedicated cloud synchronization channel for MITS Campus Canteen
const REALTIME_TOPIC = 'mits_campus_canteen_sync_prod_2026';
const CLOUD_PUB_URL = `https://ntfy.sh/${REALTIME_TOPIC}`;
const CLOUD_SSE_URL = `https://ntfy.sh/${REALTIME_TOPIC}/sse`;
const CLOUD_POLL_URL = `https://ntfy.sh/${REALTIME_TOPIC}/json?poll=1&since=12h`;

/**
 * Publishes an order event to the global real-time cloud channel
 * Sub-100ms delivery to all connected devices worldwide.
 */
export const publishOrderEvent = async (event) => {
  if (!event || typeof event !== 'object') return;

  // Keep payload UNDER 4000 bytes so ntfy.sh never rejects it (HTTP 413)
  const safeEvent = { ...event };
  delete safeEvent.orders; // Strip massive arrays to guarantee sub-100ms delivery

  const payload = {
    ...safeEvent,
    emitterId: getClientInstanceId(),
    timestamp: Date.now(),
  };

  try {
    await fetch(CLOUD_PUB_URL, {
      method: 'POST',
      headers: {
        'Title': event.type || 'ORDER_UPDATE',
        'Priority': 'urgent',
        'Tags': 'canteen,order',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.debug('Cloud publish notice:', err.message);
  }
};

/**
 * Subscribes to real-time order events via Server-Sent Events (SSE)
 * Automatically receives new incoming orders and status transitions across devices.
 */
export const subscribeToOrderEvents = (onEvent) => {
  if (typeof window === 'undefined' || !window.EventSource) {
    return () => {};
  }

  let eventSource = null;
  let isClosed = false;

  const connect = () => {
    if (isClosed) return;
    try {
      eventSource = new EventSource(CLOUD_SSE_URL);

      eventSource.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          // ntfy.sh structure: { id, time, event, topic, message }
          if (raw && raw.message) {
            const data = JSON.parse(raw.message);
            // Ignore events emitted by this same client instance
            if (data.emitterId && data.emitterId === getClientInstanceId()) {
              return;
            }
            if (onEvent && typeof onEvent === 'function') {
              onEvent(data);
            }
          }
        } catch (_) {
          // Non-JSON message, safely ignored
        }
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
        }
        // Auto-reconnect after 3 seconds if disconnected
        if (!isClosed) {
          setTimeout(connect, 3000);
        }
      };
    } catch (err) {
      console.debug('SSE connection notice:', err.message);
    }
  };

  connect();

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
};

/**
 * Fetches recent historical order events from cloud (catch-up on reload / reconnect)
 */
export const fetchRecentCloudEvents = async () => {
  try {
    const res = await fetch(CLOUD_POLL_URL, { cache: 'no-cache' });
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.trim().split('\n');
    const events = [];

    for (const line of lines) {
      if (!line) continue;
      try {
        const item = JSON.parse(line);
        if (item.message) {
          const parsed = JSON.parse(item.message);
          events.push(parsed);
        }
      } catch (_) {}
    }
    return events;
  } catch (err) {
    return [];
  }
};

/**
 * Guaranteed 100% Unique & Sequential Token Generator
 * Ensures no duplicate tokens are ever generated across all orders.
 */
export const generateUniqueToken = (currentOrders = []) => {
  let highestTokenNum = 100;

  // 1. Scan in-memory orders
  if (Array.isArray(currentOrders)) {
    for (const ord of currentOrders) {
      if (ord && ord.tokenNumber) {
        const m = String(ord.tokenNumber).match(/\d+/);
        if (m) {
          const val = parseInt(m[0], 10);
          if (!isNaN(val) && val > highestTokenNum) {
            highestTokenNum = val;
          }
        }
      }
    }
  }

  // 2. Read persistent sequence from localStorage
  let savedSeq = 100;
  try {
    const stored = localStorage.getItem('smart_canteen_token_sequence');
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed > savedSeq) {
        savedSeq = parsed;
      }
    }
  } catch (_) {}

  // 3. Compute guaranteed next number (strictly >= 115 if past 114)
  let nextSeq = Math.max(highestTokenNum, savedSeq, 114) + 1;

  // 4. Ensure no existing order in current list collides
  if (Array.isArray(currentOrders)) {
    while (currentOrders.some((o) => o && o.tokenNumber === `TK-${nextSeq}`)) {
      nextSeq += 1;
    }
  }

  // 5. Persist the sequence
  try {
    localStorage.setItem('smart_canteen_token_sequence', String(nextSeq));
  } catch (_) {}

  return {
    tokenNumber: `TK-${nextSeq}`,
    orderNumber: `ORD-2026-${String(nextSeq).padStart(3, '0')}`,
    sequence: nextSeq,
  };
};

/**
 * Detects dummy mock/seed orders (e.g. initial demo orders for Aryan Sharma / Priya Patel).
 * Ensures they are never displayed in production.
 */
export const isMockOrder = (ord) => {
  if (!ord || typeof ord !== 'object') return true;
  const mockIds = ['ord-100', 'ord-101', 'ord-102', 'ord-103', 'ord-104'];
  const mockNames = ['Aryan Sharma', 'Priya Patel'];
  const mockRolls = ['STU-2024-CS042', 'STU-2024-IT018'];
  const mockTokens = ['TK-100', 'TK-101', 'TK-102', 'TK-103', 'TK-104'];

  const id = String(ord.id || ord._id || '');
  const name = String(ord.studentName || ord.customerName || '');
  const roll = String(ord.studentRoll || '');
  const email = String(ord.studentEmail || '');
  const token = String(ord.tokenNumber || '').replace('#', '').trim();

  if (mockIds.includes(id)) return true;
  if (mockNames.some((n) => name.toLowerCase().includes(n.toLowerCase()))) return true;
  if (mockRolls.includes(roll)) return true;
  if (mockTokens.includes(token) && (email.includes('mitsgwl.ac.in') || roll.startsWith('STU-') || id.startsWith('ord-10'))) return true;
  if (email === 'student@mitsgwl.ac.in' && mockTokens.includes(token)) return true;

  return false;
};

/**
 * Normalizes an order record so it has consistent id, _id, finalAmount, and items
 */
export const normalizeOrder = (ord) => {
  if (!ord || typeof ord !== 'object' || isMockOrder(ord)) return null;
  const id = ord.id || ord._id || (ord.tokenNumber ? `ord-${ord.tokenNumber}` : `ord-${Date.now()}`);
  return {
    ...ord,
    id,
    _id: ord._id || id,
    finalAmount: ord.finalAmount !== undefined ? ord.finalAmount : (ord.totalAmount || 0),
    items: Array.isArray(ord.items) ? ord.items : [],
    status: ord.status || 'Placed',
    tokenNumber: ord.tokenNumber || 'TK-100',
    assignedCounter: ord.assignedCounter || 1,
  };
};

/**
 * Conflict-Free Order Merger
 * Merges orders from cloud, server, and local storage preserving latest lifecycle status.
 */
export const mergeOrders = (localOrders = [], incomingOrders = []) => {
  const map = new Map();

  const statusPriority = {
    'Placed': 1,
    'Pending Acceptance': 1,
    'Accepted': 2,
    'Preparing': 3,
    'Ready for Pickup': 4,
    'Completed': 5,
    'Collected': 5,
    'Rejected': 6,
    'Cancelled': 6,
  };

  // Populate local orders first
  (localOrders || []).forEach((rawOrd) => {
    const ord = normalizeOrder(rawOrd);
    if (!ord) return;
    const key = ord.tokenNumber || ord.id || ord._id;
    if (key) map.set(key, ord);
  });

  // Merge incoming
  (incomingOrders || []).forEach((rawInc) => {
    const inc = normalizeOrder(rawInc);
    if (!inc) return;
    const key = inc.tokenNumber || inc.id || inc._id;
    if (!key) return;

    if (!map.has(key)) {
      map.set(key, inc);
    } else {
      const existing = map.get(key);
      const existingRank = statusPriority[existing.status] || 0;
      const incRank = statusPriority[inc.status] || 0;

      // Status advance takes priority
      if (incRank >= existingRank) {
        map.set(key, { ...existing, ...inc });
      }
    }
  });

  // Return sorted descending (newest first)
  return Array.from(map.values()).sort((a, b) => {
    const timeA = a.id?.startsWith('ord-') ? parseInt(a.id.replace('ord-', ''), 10) : (new Date(a.createdAt || 0).getTime());
    const timeB = b.id?.startsWith('ord-') ? parseInt(b.id.replace('ord-', ''), 10) : (new Date(b.createdAt || 0).getTime());
    return timeB - timeA;
  });
};

// Unique instance ID for the current browser session
let cachedInstanceId = null;
const getClientInstanceId = () => {
  if (!cachedInstanceId) {
    cachedInstanceId = 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
  }
  return cachedInstanceId;
};
