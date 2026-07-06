// admin-dashboard/src/components/MentorshipMetrics.jsx
import React from 'react';

export default function MentorshipMetrics({ completionRate = 72, satisfactionScore = 4.6 }) {
  return (
    <div className="metrics-grid" style={{ display: 'flex', gap: '1.5rem', padding: '1rem' }}>
      <div
        className="metric-card"
        style={{ background: '#f4f4f5', padding: '1.5rem', borderRadius: '8px', flex: 1 }}
      >
        <h4>Program Completion Rate</h4>
        <p
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: completionRate >= 70 ? 'green' : 'orange',
          }}
        >
          {completionRate}%
        </p>
        <small>Target: Over 70% Milestone completion</small>
      </div>

      <div
        className="metric-card"
        style={{ background: '#f4f4f5', padding: '1.5rem', borderRadius: '8px', flex: 1 }}
      >
        <h4>Average Satisfaction Level</h4>
        <p
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: satisfactionScore >= 4.5 ? 'green' : 'red',
          }}
        >
          {satisfactionScore} / 5.0 ★
        </p>
        <small>Target: 4.5 Stars overall rating</small>
      </div>
    </div>
  );
}
