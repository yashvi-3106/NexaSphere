import { useState, useCallback } from 'react';

/**
 * Hook for managing follow/unfollow operations
 */
export function useFollow(userId) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check follow status
  const checkFollowStatus = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/student/follows/status/${userId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsFollowing(false);
          return;
        }
        throw new Error('Failed to check follow status');
      }

      const data = await response.json();
      setIsFollowing(data.isFollowing || false);
      setError(null);
    } catch (err) {
      console.error('Error checking follow status:', err);
      setError(err.message);
    }
  }, [userId]);

  // Follow user
  const follow = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/student/follows/${userId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to follow user');
      }

      setIsFollowing(true);
    } catch (err) {
      console.error('Error following user:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Unfollow user
  const unfollow = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/student/follows/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unfollow user');
      }

      setIsFollowing(false);
    } catch (err) {
      console.error('Error unfollowing user:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Toggle follow/unfollow
  const toggle = useCallback(async () => {
    if (isFollowing) {
      await unfollow();
    } else {
      await follow();
    }
  }, [isFollowing, follow, unfollow]);

  return {
    isFollowing,
    isLoading,
    error,
    follow,
    unfollow,
    toggle,
    checkFollowStatus,
  };
}

/**
 * Hook for fetching follower/following lists
 */
export function useFollowList(userId, type = 'followers') {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchList = useCallback(
    async (pageNum = 1) => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const endpoint =
          type === 'followers'
            ? `/api/student/users/${userId}/followers`
            : `/api/student/users/${userId}/following`;

        const response = await fetch(`${endpoint}?page=${pageNum}&limit=${limit}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ${type}`);
        }

        const data = await response.json();
        setItems(type === 'followers' ? data.followers : data.following);
        setPage(pageNum);
        setTotal(data.pagination?.total || 0);
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${type}:`, err);
        setError(err.message);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, type, limit]
  );

  return {
    items,
    isLoading,
    error,
    page,
    total,
    limit,
    fetchList,
    setPage,
    setLimit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Hook for fetching follow counts
 */
export function useFollowCounts(userId) {
  const [counts, setCounts] = useState({ followersCount: 0, followingCount: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCounts = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/student/users/${userId}/follow-counts`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch follow counts');
      }

      const data = await response.json();
      setCounts({
        followersCount: data.followersCount || 0,
        followingCount: data.followingCount || 0,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching follow counts:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    counts,
    isLoading,
    error,
    fetchCounts,
  };
}

/**
 * Hook for fetching activity feed from followed users
 */
export function useFollowedActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchActivityFeed = useCallback(
    async (pageNum = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/student/activity-feed/followed?page=${pageNum}&limit=${limit}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch activity feed');
        }

        const data = await response.json();
        setActivities(data.activities || []);
        setPage(pageNum);
        setTotal(data.pagination?.total || 0);
        setError(null);
      } catch (err) {
        console.error('Error fetching activity feed:', err);
        setError(err.message);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  return {
    activities,
    isLoading,
    error,
    page,
    total,
    limit,
    fetchActivityFeed,
    setPage,
    setLimit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Hook for fetching current user's following list
 */
export function useCurrentUserFollowing() {
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchFollowing = useCallback(
    async (pageNum = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/student/me/following?page=${pageNum}&limit=${limit}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch following list');
        }

        const data = await response.json();
        setFollowing(data.following || []);
        setPage(pageNum);
        setTotal(data.pagination?.total || 0);
        setError(null);
      } catch (err) {
        console.error('Error fetching following:', err);
        setError(err.message);
        setFollowing([]);
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  return {
    following,
    isLoading,
    error,
    page,
    total,
    limit,
    fetchFollowing,
    setPage,
    setLimit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
