import { Router } from 'express';
import { requireStudentAuth } from '../middleware/studentAuthMiddleware.js';
import * as moderationController from '../controllers/moderationController.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

/**
 * POST /moderation/ai-check — Server-side AI content moderation proxy.
 * Calls Gemini API using the server-side GEMINI_API_KEY (never exposed to client).
 */
router.post('/ai-check', requireStudentAuth, async (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'content string is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ flags: [], confidence: 0, explanation: 'AI moderation not configured' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Analyze the following content for toxicity, hate speech, harassment, and inappropriate material.
      Content: "${content}"
      
      Return a JSON object with:
      - isAppropriate: boolean
      - categories: array of detected issues (spam, hate_speech, harassment, toxic, violence, self_harm, sexual)
      - severity: low/medium/high/critical
      - confidence: number between 0-1
      - explanation: brief reason
      
      Only return valid JSON, no other text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = JSON.parse(text);

    return res.json({
      flags: parsed.categories?.map((cat) => ({ type: cat, confidence: parsed.confidence })) || [],
      confidence: parsed.confidence || 0.7,
      explanation: parsed.explanation,
    });
  } catch (error) {
    console.error('[AI Moderation] Error:', error.message);
    return res.json({ flags: [], confidence: 0, explanation: 'AI moderation unavailable' });
  }
});

// Public endpoint for submitting reports
router.post('/reports', moderationController.createFlag);

// All other moderation routes require student auth
router.use(requireStudentAuth);

// Flagged Content
router.get('/moderation/flags', moderationController.getFlags);
router.get('/moderation/flags/:id', moderationController.getFlagById);
router.put('/moderation/flags/:id/resolve', moderationController.resolveFlag);
router.put('/moderation/flags/:id/approve', moderationController.approveFlag);
router.put('/moderation/flags/:id/remove', moderationController.removeFlaggedContent);
router.put('/moderation/flags/:id/escalate', moderationController.escalateFlag);
router.delete('/moderation/flags/:id', moderationController.deleteFlag);

// User Warnings
router.post('/moderation/users/:userId/warn', moderationController.warnUser);
router.get('/moderation/users/:userId/warnings', moderationController.getUserWarnings);
router.get('/moderation/users/:userId/history', moderationController.getUserContentHistory);
router.post('/moderation/users/:userId/approve-all', moderationController.approveAllFromUser);

// Moderator Notes
router.post('/moderation/notes', moderationController.addModeratorNote);
router.get('/moderation/notes', moderationController.getModeratorNotes);

// Appeals
router.post('/moderation/appeals', moderationController.submitAppeal);
router.get('/moderation/appeals', moderationController.getAppeals);
router.put('/moderation/appeals/:id/review', moderationController.reviewAppeal);

// Analytics
router.get('/moderation/stats', moderationController.getFlagStats);
router.get('/moderation/stats/by-type', moderationController.getFlagStatsByType);
router.get('/moderation/stats/volume', moderationController.getFlagVolumeOverTime);
router.get('/moderation/stats/top-violators', moderationController.getTopViolatingUsers);
router.get('/moderation/stats/workload', moderationController.getModeratorWorkload);

// Bulk Actions
router.post('/moderation/bulk-resolve', moderationController.bulkResolve);

export default router;
