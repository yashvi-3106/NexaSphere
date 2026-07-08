import React, { useEffect } from 'react';
import { useFollowList, useFollowCounts } from '../../hooks/useFollow';
import './FollowList.css';

/**
 * FollowList Component
 * Displays a list of followers or following users
 *
 * Props:
 *   - userId: number - The user ID to fetch followers/following for
 *   - type: string - 'followers' or 'following'
 *   - title: string - Title to display
 *   - limit: number - Initial limit of items per page
 *   - onUserClick: function - Callback when a user is clicked
 */
export function FollowList({ userId, type = 'followers', title, limit = 20, onUserClick }) {
  const { items, isLoading, error, page, total, fetchList, setPage, totalPages } = useFollowList(
    userId,
    type
  );

  useEffect(() => {
    if (userId) {
      fetchList(1);
    }
  }, [userId, type, fetchList]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      fetchList(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      fetchList(page + 1);
    }
  };

  const handleUserClick = (user) => {
    if (onUserClick) {
      onUserClick(user);
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="follow-list-container loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="follow-list-container error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="follow-list-container">
      <div className="follow-list-header">
        <h3>{title || (type === 'followers' ? 'Followers' : 'Following')}</h3>
        <span className="follow-count">{total}</span>
      </div>

      {items.length === 0 ? (
        <div className="follow-list-empty">
          <p>No {type === 'followers' ? 'followers' : 'users being followed'} yet</p>
        </div>
      ) : (
        <>
          <div className="follow-list">
            {items.map((user) => (
              <div
                key={user.id}
                className="follow-list-item"
                onClick={() => handleUserClick(user)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUserClick(user);
                  }
                }}
              >
                {user.avatar_url && (
                  <img src={user.avatar_url} alt={user.full_name} className="follow-list-avatar" />
                )}
                <div className="follow-list-info">
                  <p className="follow-list-name">{user.full_name}</p>
                  <p className="follow-list-email">{user.email}</p>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="follow-list-pagination">
              <button onClick={handlePreviousPage} disabled={page === 1} className="pagination-btn">
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page >= totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * FollowStats Component
 * Displays follower and following counts
 *
 * Props:
 *   - userId: number - The user ID to fetch counts for
 *   - onFollowersClick: function - Callback when followers count is clicked
 *   - onFollowingClick: function - Callback when following count is clicked
 */
export function FollowStats({ userId, onFollowersClick, onFollowingClick }) {
  const { counts, isLoading, fetchCounts } = useFollowCounts(userId);

  useEffect(() => {
    if (userId) {
      fetchCounts();
    }
  }, [userId, fetchCounts]);

  return (
    <div className="follow-stats-container">
      <div
        className="follow-stat"
        onClick={onFollowersClick}
        role={onFollowersClick ? 'button' : undefined}
        tabIndex={onFollowersClick ? 0 : undefined}
      >
        <div className="follow-stat-count">{isLoading ? '-' : counts.followersCount}</div>
        <div className="follow-stat-label">Followers</div>
      </div>

      <div className="follow-stat-divider"></div>

      <div
        className="follow-stat"
        onClick={onFollowingClick}
        role={onFollowingClick ? 'button' : undefined}
        tabIndex={onFollowingClick ? 0 : undefined}
      >
        <div className="follow-stat-count">{isLoading ? '-' : counts.followingCount}</div>
        <div className="follow-stat-label">Following</div>
      </div>
    </div>
  );
}

export default FollowList;
