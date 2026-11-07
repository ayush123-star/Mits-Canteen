// Serverless API for Vercel deployment - /api/orders/live-tokens
// Clean 200 OK responses with zero external rate limits

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
