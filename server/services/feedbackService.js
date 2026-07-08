const feedbacks = [];
const actionItems = [];

export const feedbackService = {
  async submitFeedback(data) {
    let sentiment = 'neutral';
    if (data.suggestions || data.bestParts) {
      const text = `${data.suggestions} ${data.bestParts}`.toLowerCase();
      if (text.includes('great') || text.includes('awesome') || text.includes('excellent')) {
        sentiment = 'positive';
      } else if (text.includes('bad') || text.includes('poor') || text.includes('worst')) {
        sentiment = 'negative';
      }
    }

    const newFeedback = {
      id: Date.now().toString(),
      eventId: data.eventId,
      userId: data.userId || null,
      ratingOverall: data.ratingOverall,
      wouldAttendAgain: data.wouldAttendAgain,
      recommendFriend: data.recommendFriend,
      ratingVenue: data.ratingVenue,
      ratingContent: data.ratingContent,
      ratingSpeaker: data.ratingSpeaker,
      ratingPace: data.ratingPace,
      suggestions: data.suggestions,
      bestParts: data.bestParts,
      sentiment: sentiment,
      createdAt: new Date(),
    };
    feedbacks.push(newFeedback);
    return newFeedback;
  },

  async getFeedbackAnalytics(eventId) {
    const eventFeedbacks = feedbacks.filter((f) => f.eventId === eventId);
    if (eventFeedbacks.length === 0) {
      return {
        totalResponses: 0,
        averageRating: 0,
        sentiments: { positive: 0, neutral: 0, negative: 0 },
      };
    }
    const sumRatings = eventFeedbacks.reduce((acc, curr) => acc + curr.ratingOverall, 0);
    const averageRating = sumRatings / eventFeedbacks.length;
    const sentiments = eventFeedbacks.reduce(
      (acc, curr) => {
        acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );

    return {
      totalResponses: eventFeedbacks.length,
      averageRating: parseFloat(averageRating.toFixed(2)),
      sentiments,
    };
  },

  async getFeedbacks(eventId) {
    return feedbacks.filter((f) => f.eventId === eventId).sort((a, b) => b.createdAt - a.createdAt);
  },

  async createActionItem(data) {
    const item = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      eventId: data.eventId,
      assigneeId: data.assigneeId || null,
      status: data.status || 'pending',
      createdAt: new Date(),
    };
    actionItems.push(item);
    return item;
  },

  async getActionItems(eventId) {
    return actionItems
      .filter((a) => a.eventId === eventId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
};
