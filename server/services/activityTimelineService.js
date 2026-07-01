const timelines = new Map();

export const activityTimelineService = {
  addActivity(userId, activity) {
    if (!timelines.has(userId)) {
      timelines.set(userId, []);
    }

    timelines.get(userId).unshift({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...activity,
    });
  },

  getTimeline(userId) {
    return timelines.get(userId) || [];
  },

  getMonthlySummary(userId) {
    const activities = timelines.get(userId) || {};

    const summary = {};

    for (const item of activities) {
      const month = item.timestamp.slice(0, 7);

      summary[month] = (summary[month] || 0) + 1;
    }

    return summary;
  },

  getStats(userId) {
    const list = timelines.get(userId) || [];

    return {
      totalActivities: list.length,
      eventRegistrations: list.filter(a => a.type === "event").length,
      portfolioUpdates: list.filter(a => a.type === "portfolio").length,
      achievements: list.filter(a => a.type === "achievement").length,
    };
  }
};