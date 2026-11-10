// Centralized Serverless API for Vercel deployment - /api/feedback
// Instant Cross-Domain Feedback Synchronization between Student App and Canteen Owner Dashboard
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);

const CACHE_FILE = '/tmp/canteenFeedbackCache.json';

const INITIAL_FEEDBACK_DEFAULT = [];

let serverFeedbackCache = [];

const isMockFeedback = (fb) => {
  if (!fb) return true;
  const id = String(fb.id || '');
  if (['fb-1', 'fb-2', 'fb-3'].includes(id)) return true;
  if (id.startsWith('fb-test-')) return true;
  if (['Aryan Sharma', 'Priya Patel', 'Karan Mehra'].includes(fb.studentName)) return true;
  return false;
};

try {
  if (fs.existsSync(CACHE_FILE)) {
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      serverFeedbackCache = parsed.filter((f) => !isMockFeedback(f));
    }
  }
} catch (_) {}

const saveCacheToDisk = () => {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(serverFeedbackCache.filter((f) => !isMockFeedback(f)).slice(0, 150)), 'utf8');
  } catch (_) {}
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
    // 1. POST: Submit new student feedback
    if (req.method === 'POST') {
      const fb = req.body || {};
      if (!fb || typeof fb !== 'object') {
        return res.status(400).json({ success: false, message: 'Invalid feedback data' });
      }

      const newFb = {
        id: fb.id || ('fb-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)),
        studentId: fb.studentId || '',
        studentName: fb.studentName || 'Student Diner',
        foodItemId: fb.foodItemId || fb.foodId || '',
        foodName: fb.foodName || fb.foodItem || 'Campus Dish',
        foodItem: fb.foodName || fb.foodItem || 'Campus Dish',
        rating: Math.min(5, Math.max(1, Number(fb.rating) || 5)),
        comment: String(fb.comment || '').trim(),
        tags: Array.isArray(fb.tags) ? fb.tags : [],
        date: fb.date || new Date().toISOString().split('T')[0],
        createdAt: fb.createdAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: Date.now(),
      };

      // Add to beginning of feedback cache
      serverFeedbackCache = [newFb, ...serverFeedbackCache.filter((f) => f.id !== newFb.id)].slice(0, 150);
      saveCacheToDisk();

      return res.status(201).json({ success: true, feedback: newFb, total: serverFeedbackCache.length });
    }

    // 2. DELETE: Remove feedback by id or clear all
    if (req.method === 'DELETE') {
      const targetId = req.query?.id || req.body?.id || req.body?.feedbackId;
      if (targetId && targetId !== 'all') {
        serverFeedbackCache = serverFeedbackCache.filter((f) => f.id !== targetId && f._id !== targetId);
      } else {
        serverFeedbackCache = [];
      }
      saveCacheToDisk();
      return res.status(200).json({ success: true, feedback: serverFeedbackCache });
    }

    // 3. GET: Fetch all campus reviews & student feedback
    return res.status(200).json({ success: true, feedback: serverFeedbackCache });
  } catch (err) {
    return res.status(200).json({ success: true, feedback: serverFeedbackCache });
  }
}
