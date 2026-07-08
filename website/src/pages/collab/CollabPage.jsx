import React from 'react';

export default function CollabPage({ onBack }) {
  return (
    <div className="collab-page" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Collaboration</h1>
      <p>Collaborative workspace features coming soon.</p>
      {onBack && (
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          ← Back
        </button>
      )}
    </div>
  );
}
