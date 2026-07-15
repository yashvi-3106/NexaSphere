import { Router } from 'express';
import { requireStudentAuth } from '../middleware/studentAuthMiddleware.js';
import * as moderationController from '../controllers/moderationController.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { validate } from '../middleware/validate.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import {
  aiCheckSchema,
  createFlagSchema,
  resolveFlagSchema,
  removeFlaggedContentSchema,
  warnUserSchema,
  addModeratorNoteSchema,
  submitAppealSchema,
  reviewAppealSchema,
  bulkResolveSchema,
} from '../validators/routes/moderationSchemas.js';

const router = Router();

/**
 * POST /moderation/ai-check — Server-side AI content moderation proxy.
 * Calls Gemini API using the server-side GEMINI_API_KEY (never exposed to client).
 */
router.post('/ai-check', apiRateLimiter, validate(aiCheckSchema), requireStudentAuth, async (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content || typeof content !== 'string') {
      return sendError(req, res, 'content string is required', 400, 'VALIDATION_ERROR');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return sendSuccess(res, { flags: [], confidence: 0, explanation: 'AI moderation not configured' });
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

    return sendSuccess(res, {
      flags: parsed.categories?.map((cat) => ({ type: cat, confidence: parsed.confidence })) || [],
      confidence: parsed.confidence || 0.7,
      explanation: parsed.explanation,
    });
  } catch (error) {
    console.error('[AI Moderation] Error:', error.message);
    return sendSuccess(res, { flags: [], confidence: 0, explanation: 'AI moderation unavailable' });
  }
});

// Public endpoint for submitting reports
router.post('/reports', validate(createFlagSchema), moderationController.createFlag);

// All other moderation routes require student auth
router.use(requireStudentAuth);

// Flagged Content
router.get('/moderation/flags', moderationController.getFlags);
router.get('/moderation/flags/:id', moderationController.getFlagById);
router.put('/moderation/flags/:id/resolve', validate(resolveFlagSchema), moderationController.resolveFlag);
router.put('/moderation/flags/:id/approve', moderationController.approveFlag);
router.put('/moderation/flags/:id/remove', validate(removeFlaggedContentSchema), moderationController.removeFlaggedContent);
router.put('/moderation/flags/:id/escalate', moderationController.escalateFlag);
router.delete('/moderation/flags/:id', moderationController.deleteFlag);

// User Warnings
router.post('/moderation/users/:userId/warn', validate(warnUserSchema), moderationController.warnUser);
router.get('/moderation/users/:userId/warnings', moderationController.getUserWarnings);
router.get('/moderation/users/:userId/history', moderationController.getUserContentHistory);
router.post('/moderation/users/:userId/approve-all', moderationController.approveAllFromUser);

// Moderator Notes
router.post('/moderation/notes', validate(addModeratorNoteSchema), moderationController.addModeratorNote);
router.get('/moderation/notes', moderationController.getModeratorNotes);

// Appeals
router.post('/moderation/appeals', validate(submitAppealSchema), moderationController.submitAppeal);
router.get('/moderation/appeals', moderationController.getAppeals);
router.put('/moderation/appeals/:id/review', validate(reviewAppealSchema), moderationController.reviewAppeal);

// Analytics
router.get('/moderation/stats', moderationController.getFlagStats);
router.get('/moderation/stats/by-type', moderationController.getFlagStatsByType);
router.get('/moderation/stats/volume', moderationController.getFlagVolumeOverTime);
router.get('/moderation/stats/top-violators', moderationController.getTopViolatingUsers);
router.get('/moderation/stats/workload', moderationController.getModeratorWorkload);

// Bulk Actions
router.post('/moderation/bulk-resolve', validate(bulkResolveSchema), moderationController.bulkResolve);

export default router;
