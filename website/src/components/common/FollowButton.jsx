import React, { useEffect, useState } from 'react';
import { useFollow } from '../../hooks/useFollow';
import './FollowButton.css';

/**
 * FollowButton Component
 * Shows a button to follow/unfollow a user
 *
 * Props:
 *   - userId: number - The ID of the user to follow/unfollow
 *   - onFollowChange: function - Callback when follow status changes
 *   - className: string - Additional CSS classes
 *   - disabled: boolean - Whether the button is disabled
 */
export function FollowButton({ userId, onFollowChange, className = '', disabled = false }) {
  const { isFollowing, isLoading, error, toggle, checkFollowStatus } = useFollow(userId);
  const [showMessage, setShowMessage] = useState('');

  useEffect(() => {
    checkFollowStatus();
  }, [userId, checkFollowStatus]);

  const handleClick = async () => {
    try {
      await toggle();
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
      if (!isFollowing) {
        setShowMessage('Followed!');
      } else {
        setShowMessage('Unfollowed');
      }
      setTimeout(() => setShowMessage(''), 2000);
    } catch (err) {
      setShowMessage(`Error: ${err.message}`);
      setTimeout(() => setShowMessage(''), 3000);
    }
  };

  return (
    <div className={`follow-button-container ${className}`}>
      <button
        className={`follow-button ${isFollowing ? 'following' : 'not-following'} ${
          isLoading ? 'loading' : ''
        }`}
        onClick={handleClick}
        disabled={disabled || isLoading}
        title={isFollowing ? 'Unfollow this user' : 'Follow this user'}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            {isFollowing ? 'Unfollowing...' : 'Following...'}
          </>
        ) : isFollowing ? (
          'Following'
        ) : (
          'Follow'
        )}
      </button>
      {showMessage && <div className="follow-message">{showMessage}</div>}
      {error && <div className="follow-error">{error}</div>}
    </div>
  );
}

export default FollowButton;
