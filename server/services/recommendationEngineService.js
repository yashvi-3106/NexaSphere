const recommendationEngineService = {
  getRecommendations(userId) {
    return {
      userId,
      personalized: true,
      recommendations: {
        events: [
          {
            id: "event1",
            title: "AI Workshop",
            score: 96,
            reason: "Based on your previous event registrations"
          },
          {
            id: "event2",
            title: "Hackathon 2026",
            score: 93,
            reason: "Trending among AI students"
          }
        ],

        clubs: [
          {
            id: "club1",
            name: "AI Club",
            score: 95
          },
          {
            id: "club2",
            name: "Coding Club",
            score: 89
          }
        ],

        portfolios: [
          {
            id: "portfolio1",
            owner: "Rahul",
            title: "Machine Learning Projects"
          }
        ],

        resources: [
          {
            id: "resource1",
            title: "Node.js Backend Guide"
          }
        ]
      }
    };
  },

  getTrendingRecommendations() {
    return {
      events: [
        "Hackathon",
        "Web Development Bootcamp"
      ],

      clubs: [
        "Robotics Club",
        "AI Club"
      ],

      announcements: [
        "Placement Drive",
        "Tech Fest"
      ]
    };
  },

  submitFeedback(userId, recommendationId, feedback) {
    return {
      message: "Feedback recorded successfully",
      userId,
      recommendationId,
      feedback
    };
  },

  updateInterests(userId, interests) {
    return {
      message: "User interests updated",
      userId,
      interests
    };
  },

  getRecommendationStats() {
    return {
      totalRecommendations: 2400,
      accepted: 1700,
      rejected: 350,
      ignored: 350,
      accuracy: "88%"
    };
  }
};

module.exports = recommendationEngineService;