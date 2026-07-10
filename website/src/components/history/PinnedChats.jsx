import React, { useState, useEffect } from 'react';
import { getPinnedPrompts, togglePinPrompt } from '../../lib/promptStore';
import './PinnedChats.css';

const PinnedChats = ({ onSelectPrompt, workspace = 'default' }) => {
  const [pinnedPrompts, setPinnedPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPinnedPrompts = async () => {
    setLoading(true);
    setError(null);
    try {
      const pinned = await getPinnedPrompts(workspace);
      setPinnedPrompts(pinned);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[PinnedChats] Error loading pinned prompts:', err.message);
      }
      setError('Failed to load pinned chats. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPinnedPrompts();
  }, [workspace]);

  const handleUnpin = async (e, id) => {
    e.stopPropagation();
    await togglePinPrompt(id);
    loadPinnedPrompts();
  };

  const handleSelectPrompt = (prompt) => {
    onSelectPrompt(prompt);
  };

  if (error) {
    return (
      <div className="pinned-chats-container">
        <div className="pinned-header">
          <h4>📌 Pinned Conversations</h4>
        </div>
        <div className="pinned-error" style={{ color: '#ef4444', padding: '12px 16px', fontSize: '0.9rem' }}>
          {error}
        </div>
      </div>
    );
  }

  if (pinnedPrompts.length === 0) {
    return null;
  }

  return (
    <div className="pinned-chats-container">
      <div className="pinned-header">
        <h4>📌 Pinned Conversations</h4>
        <span className="pin-count">{pinnedPrompts.length}</span>
      </div>

      <div className="pinned-list">
        {pinnedPrompts.map((prompt) => (
          <div key={prompt.id} className="pinned-item" onClick={() => handleSelectPrompt(prompt)}>
            <div className="pinned-content">
              <p className="pinned-text">{prompt.userPrompt.substring(0, 45)}...</p>
              <span className="pinned-icon">📌</span>
            </div>
            <button className="unpin-btn" title="Unpin" onClick={(e) => handleUnpin(e, prompt.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedChats;
