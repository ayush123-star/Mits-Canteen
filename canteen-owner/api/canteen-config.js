// Centralized Serverless API for Vercel deployment - /api/canteen-config
// Manages canteen details, payment QR code image, UPI ID, and Payee Name across all portals
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);

const CACHE_FILE = '/tmp/canteenConfigCache.json';

let canonicalData = {};
try {
  canonicalData = require('./canonicalData.json');
} catch (_) {}

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Breakfast', icon: 'SunMedium', displayOrder: 1 },
  { id: 'cat-2', name: 'Lunch', icon: 'Utensils', displayOrder: 2 },
  { id: 'cat-3', name: 'Fast Food', icon: 'Flame', displayOrder: 3 },
  { id: 'cat-4', name: 'Snacks', icon: 'Cookie', displayOrder: 4 },
  { id: 'cat-5', name: 'Beverages', icon: 'Coffee', displayOrder: 5 },
  { id: 'cat-6', name: 'Combos', icon: 'Layers', displayOrder: 6 },
];

let canteenConfigCache = {
  id: 'canteen-1',
  name: 'MITS Main Canteen',
  upiId: 'pandeyayush1603-1@okicici',
  upiMerchantName: 'Ayush Pandey',
  qrCodeImage: '',
  homepageConfig: {
    configVersion: 4,
    cravingsTitle: 'Popular Campus Cravings',
    cravingsSubtitle: 'Top rated and most ordered items across campus this week.',
    featuredCravingsIds: [],
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
  },
  deletedFoodIds: ['food-12'],
  menuItems: Array.isArray(canonicalData.menuItems)
    ? canonicalData.menuItems.filter((m) => m.id !== 'food-12' && m._id !== 'food-12')
    : null,
  categories: DEFAULT_CATEGORIES,
  inventoryItems: Array.isArray(canonicalData.inventoryItems) ? canonicalData.inventoryItems : null,
  recipes: Array.isArray(canonicalData.recipes) ? canonicalData.recipes : null,
  updatedAt: Date.now(),
};

function loadDiskCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const content = fs.readFileSync(CACHE_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (data && typeof data === 'object') {
        const mergedDeleted = Array.from(new Set([...(canteenConfigCache.deletedFoodIds || []), ...(data.deletedFoodIds || [])]));
        canteenConfigCache = {
          ...canteenConfigCache,
          ...data,
          deletedFoodIds: mergedDeleted,
          homepageConfig: {
            ...canteenConfigCache.homepageConfig,
            ...(data.homepageConfig || {}),
            featuredCravingsIds: Array.isArray(data.homepageConfig?.featuredCravingsIds)
              ? data.homepageConfig.featuredCravingsIds.filter((id) => !mergedDeleted.includes(id))
              : (canteenConfigCache.homepageConfig?.featuredCravingsIds || []),
          },
        };
        if (Array.isArray(canteenConfigCache.menuItems)) {
          canteenConfigCache.menuItems = canteenConfigCache.menuItems.filter(
            (m) => !mergedDeleted.includes(m.id) && !mergedDeleted.includes(m._id)
          );
        }
      }
    }
  } catch (_) {}
}

function saveDiskCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(canteenConfigCache), 'utf-8');
  } catch (_) {}
}

// Initial attempt to load from disk
loadDiskCache();

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
    loadDiskCache();

    // POST, PATCH, PUT: Update canteen config / payment QR
    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
      let payload = req.body || {};
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch (_) {}
      }
      if (payload.homepageConfig !== undefined) {
        const incomingHp = payload.homepageConfig;
        const incomingVer = Number(incomingHp.configVersion || incomingHp.updatedAt || Date.now());

        canteenConfigCache.homepageConfig = {
          ...canteenConfigCache.homepageConfig,
          ...incomingHp,
          configVersion: incomingVer,
          updatedAt: incomingVer,
          featuredCravingsIds: Array.isArray(incomingHp.featuredCravingsIds)
            ? incomingHp.featuredCravingsIds
            : (canteenConfigCache.homepageConfig?.featuredCravingsIds || []),
          dailyDiscounts: {
            ...(canteenConfigCache.homepageConfig?.dailyDiscounts || {}),
            ...(incomingHp.dailyDiscounts || {}),
          },
          specialOfferBanner: {
            ...(canteenConfigCache.homepageConfig?.specialOfferBanner || {}),
            ...(incomingHp.specialOfferBanner || {}),
          },
        };
      }

      if (Array.isArray(payload.deletedFoodIds)) {
        canteenConfigCache.deletedFoodIds = Array.from(new Set([...(canteenConfigCache.deletedFoodIds || []), ...payload.deletedFoodIds]));
      }

      if (Array.isArray(payload.menuItems)) {
        const deletedSet = new Set(canteenConfigCache.deletedFoodIds || []);
        canteenConfigCache.menuItems = payload.menuItems.filter((m) => !deletedSet.has(m.id) && !deletedSet.has(m._id));
        const activeIds = new Set(canteenConfigCache.menuItems.map((m) => m.id || m._id));
        if (canteenConfigCache.homepageConfig?.featuredCravingsIds) {
          canteenConfigCache.homepageConfig.featuredCravingsIds = canteenConfigCache.homepageConfig.featuredCravingsIds.filter((id) => activeIds.has(id));
        }
      }

      canteenConfigCache = {
        ...canteenConfigCache,
        ...payload,
        deletedFoodIds: canteenConfigCache.deletedFoodIds,
        qrCodeImage: payload.qrCodeImage !== undefined ? payload.qrCodeImage : canteenConfigCache.qrCodeImage,
        upiId: payload.upiId || canteenConfigCache.upiId,
        upiMerchantName: payload.upiMerchantName || payload.name || canteenConfigCache.upiMerchantName,
        homepageConfig: canteenConfigCache.homepageConfig,
        menuItems: canteenConfigCache.menuItems,
        categories: Array.isArray(payload.categories) ? payload.categories : canteenConfigCache.categories,
        inventoryItems: Array.isArray(payload.inventoryItems) ? payload.inventoryItems : canteenConfigCache.inventoryItems,
        recipes: Array.isArray(payload.recipes) ? payload.recipes : canteenConfigCache.recipes,
        updatedAt: Date.now(),
      };
      saveDiskCache();
      return res.status(200).json({ success: true, config: canteenConfigCache });
    }

    // DELETE: Delete a food item or inventory SKU from cache permanently
    if (req.method === 'DELETE') {
      const foodId = req.query?.foodId || req.body?.foodId;
      if (foodId) {
        canteenConfigCache.deletedFoodIds = Array.from(new Set([...(canteenConfigCache.deletedFoodIds || []), foodId]));
        if (Array.isArray(canteenConfigCache.menuItems)) {
          canteenConfigCache.menuItems = canteenConfigCache.menuItems.filter((m) => m.id !== foodId && m._id !== foodId);
        }
        if (canteenConfigCache.homepageConfig?.featuredCravingsIds) {
          canteenConfigCache.homepageConfig.featuredCravingsIds = canteenConfigCache.homepageConfig.featuredCravingsIds.filter((id) => id !== foodId);
        }
      }
      saveDiskCache();
      return res.status(200).json({ success: true, config: canteenConfigCache });
    }

    // GET: Fetch current canteen config (Always filter out any deleted dishes)
    if (Array.isArray(canteenConfigCache.menuItems) && Array.isArray(canteenConfigCache.deletedFoodIds)) {
      const delSet = new Set(canteenConfigCache.deletedFoodIds);
      canteenConfigCache.menuItems = canteenConfigCache.menuItems.filter((m) => !delSet.has(m.id) && !delSet.has(m._id));
    }
    return res.status(200).json({ success: true, config: canteenConfigCache });
  } catch (err) {
    return res.status(200).json({ success: true, config: canteenConfigCache });
  }
}
