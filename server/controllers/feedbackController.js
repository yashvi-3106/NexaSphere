import { feedbackService } from '../services/feedbackService.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const submitFeedback = async (req, res) => {
  try {
    const feedback = await feedbackService.submitFeedback(req.body);
    sendSuccess(res, { feedback }, 201);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    sendError(req, res, 'Internal Server Error', 500, 'INTERNAL_ERROR');
  }
};

export const getFeedbackAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;
    const analytics = await feedbackService.getFeedbackAnalytics(eventId);
    sendSuccess(res, { analytics });
  } catch (error) {
    console.error('Error getting feedback analytics:', error);
    sendError(req, res, 'Internal Server Error', 500, 'INTERNAL_ERROR');
  }
};

export const getFeedbacks = async (req, res) => {
  try {
    const { eventId } = req.params;
    const feedbacks = await feedbackService.getFeedbacks(eventId);
    sendSuccess(res, { feedbacks });
  } catch (error) {
    console.error('Error getting feedbacks:', error);
    sendError(req, res, 'Internal Server Error', 500, 'INTERNAL_ERROR');
  }
};

export const createActionItem = async (req, res) => {
  try {
    const actionItem = await feedbackService.createActionItem(req.body);
    sendSuccess(res, { actionItem }, 201);
  } catch (error) {
    console.error('Error creating action item:', error);
    sendError(req, res, 'Internal Server Error', 500, 'INTERNAL_ERROR');
  }
};

export const getActionItems = async (req, res) => {
  try {
    const { eventId } = req.params;
    const actionItems = await feedbackService.getActionItems(eventId);
    sendSuccess(res, { actionItems });
  } catch (error) {
    console.error('Error getting action items:', error);
    sendError(req, res, 'Internal Server Error', 500, 'INTERNAL_ERROR');
  }
};
