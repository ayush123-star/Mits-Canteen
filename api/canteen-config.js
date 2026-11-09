// Centralized Serverless API for Vercel deployment - /api/canteen-config
// Manages canteen details, payment QR code image, UPI ID, and Payee Name across all portals

let canteenConfigCache = {
  id: 'canteen-1',
  name: 'MITS Main Canteen',
  upiId: 'pandeyayush1603-1@okicici',
  upiMerchantName: 'Ayush Pandey',
  qrCodeImage: '',
  homepageConfig: {
    configVersion: 3,
    cravingsTitle: 'Popular Campus Cravings',
    cravingsSubtitle: 'Top rated and most ordered items across campus this week.',
    featuredCravingsIds: ['food-1', 'food-2', 'food-3', 'food-5'],
  },
  updatedAt: Date.now(),
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
    // POST, PATCH, PUT: Update canteen config / payment QR
    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
      const payload = req.body || {};
      canteenConfigCache = {
        ...canteenConfigCache,
        ...payload,
        qrCodeImage: payload.qrCodeImage !== undefined ? payload.qrCodeImage : canteenConfigCache.qrCodeImage,
        upiId: payload.upiId || canteenConfigCache.upiId,
        upiMerchantName: payload.upiMerchantName || payload.name || canteenConfigCache.upiMerchantName,
        homepageConfig: payload.homepageConfig !== undefined ? payload.homepageConfig : canteenConfigCache.homepageConfig,
        updatedAt: Date.now(),
      };
      return res.status(200).json({ success: true, config: canteenConfigCache });
    }

    // GET: Fetch current canteen config
    return res.status(200).json({ success: true, config: canteenConfigCache });
  } catch (err) {
    return res.status(200).json({ success: true, config: canteenConfigCache });
  }
}
