import React, { useEffect } from 'react';
import { useFollowedActivityFeed } from '../../hooks/useFollow';
import './FollowedActivityFeed.css';

/**
 * FollowedActivityFeed Component
 * Displays activity feed from followed users
 *
 * Props:
 *   - limit: number - Items per page
 *   - onActivityClick: function - Callback when an activity is clicked
 */
export function FollowedActivityFeed({ limit = 20, onActivityClick }) {
  const { activities, isLoading, error, page, total, fetchActivityFeed, setPage, totalPages } =
    useFollowedActivityFeed();

  useEffect(() => {
    fetchActivityFeed(1);
  }, [fetchActivityFeed]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      fetchActivityFeed(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      fetchActivityFeed(page + 1);
    }
  };

  const handleActivityClick = (activity) => {
    if (onActivityClick) {
      onActivityClick(activity);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading && activities.length === 0) {
    return (
      <div className="activity-feed-container loading">
        <div className="activity-feed-spinner"></div>
        <p>Loading activity feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-feed-container error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="activity-feed-container">
      <div className="activity-feed-header">
        <h3>Following Activity</h3>
        <span className="activity-count">{total}</span>
      </div>

      {activities.length === 0 ? (
        <div className="activity-feed-empty">
          <p>No activity from followed users yet</p>
          <p className="activity-feed-empty-hint">Follow some users to see their activities</p>
        </div>
      ) : (
        <>
          <div className="activity-feed-list">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="activity-feed-item"
                onClick={() => handleActivityClick(activity)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleActivityClick(activity);
                  }
                }}
              >
                <div className="activity-feed-user">
                  {activity.user_avatar_url && (
                    <img
                      src={activity.user_avatar_url}
                      alt={activity.user_full_name}
                      className="activity-feed-avatar"
                    />
                  )}
                  <div className="activity-feed-user-info">
                    <p className="activity-feed-user-name">{activity.user_full_name}</p>
                    <p className="activity-feed-timestamp">{formatDate(activity.created_at)}</p>
                  </div>
                </div>

                <div className="activity-feed-content">
                  <h4 className="activity-feed-title">{activity.name}</h4>
                  {activity.tagline && <p className="activity-feed-tagline">{activity.tagline}</p>}
                  {activity.description && (
                    <p className="activity-feed-description">
                      {activity.description.length > 150
                        ? `${activity.description.substring(0, 150)}...`
                        : activity.description}
                    </p>
                  )}
                  {activity.date_text && (
                    <p className="activity-feed-date">📅 {activity.date_text}</p>
                  )}
                  {activity.status && (
                    <span
                      className={`activity-feed-status status-${activity.status.toLowerCase()}`}
                    >
                      {activity.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="activity-feed-pagination">
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

export default FollowedActivityFeed;
