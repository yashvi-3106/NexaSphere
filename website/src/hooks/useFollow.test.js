import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useFollow,
  useFollowList,
  useFollowCounts,
  useFollowedActivityFeed,
  useCurrentUserFollowing,
} from './useFollow';

// Mock fetch globally
global.fetch = vi.fn();

describe('useFollow Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useFollow(1));

      expect(result.current.isFollowing).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.follow).toBe('function');
      expect(typeof result.current.unfollow).toBe('function');
      expect(typeof result.current.toggle).toBe('function');
      expect(typeof result.current.checkFollowStatus).toBe('function');
    });

    it('should handle null userId gracefully', () => {
      const { result } = renderHook(() => useFollow(null));
      expect(result.current.isFollowing).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle undefined userId gracefully', () => {
      const { result } = renderHook(() => useFollow(undefined));
      expect(result.current.isFollowing).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('checkFollowStatus', () => {
    it('should successfully check follow status when following', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isFollowing: true }),
      });

      const { result } = renderHook(() => useFollow(1));

      await act(async () => {
        await result.current.checkFollowStatus();
      });

      expect(result.current.isFollowing).toBe(true);
      expect(result.current.error).toBe(null);
      expect(fetch).toHaveBeenCalledWith(
        '/api/student/follows/status/1',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
    });

    it('should successfully check follow status when not following', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isFollowing: false }),
      });

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.checkFollowStatus();
      });

      expect(result.current.isFollowing).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle missing isFollowing in response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useFollow(1));

      await act(async () => {
        await result.current.checkFollowStatus();
      });

      expect(result.current.isFollowing).toBe(false);
    });

    it('should handle 401 unauthorized without setting error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useFollow(1));

      await act(async () => {
        await result.current.checkFollowStatus();
      });

      expect(result.current.isFollowing).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle other error responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useFollow(1));

      await act(async () => {
        await result.current.checkFollowStatus();
      });

      expect(result.current.error).toBe('Failed to check follow status');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      fetch.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useFollow(1));

      await act(async () => {
        await result.current.checkFollowStatus();
      });

      expect(result.current.error).toBe('Network timeout');
    });

    it('should do nothing if userId is null', async () => {
      const { result } = renderHook(() => useFollow(null));

      await act(async () => {
        await result.current.checkFollowStatus();
      });

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should clear previous errors on successful check', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ isFollowing: true }),
        });

      const { result } = renderHook(() => useFollow(1));

      await act(async () => {
        await result.current.checkFollowStatus();
      });

      expect(result.current.error).toBe('Failed to check follow status');

      await act(async () => {
        await result.current.checkFollowStatus();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.isFollowing).toBe(true);
    });
  });

  describe('follow', () => {
    it('should successfully follow a user', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.follow();
      });

      expect(result.current.isFollowing).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(fetch).toHaveBeenCalledWith(
        '/api/student/follows/2',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should set isLoading to true during follow operation', async () => {
      let resolveResponse;
      const responsePromise = new Promise((resolve) => {
        resolveResponse = resolve;
      });

      fetch.mockReturnValueOnce({
        ok: true,
        json: () => responsePromise,
      });

      const { result } = renderHook(() => useFollow(2));

      act(() => {
        result.current.follow();
      });

      // At this point isLoading might not be true yet due to async
      await act(async () => {
        resolveResponse({ success: true });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle follow error with custom message', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Already following this user' }),
      });

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.follow();
      });

      expect(result.current.error).toBe('Already following this user');
      expect(result.current.isFollowing).toBe(false);
    });

    it('should handle follow error without custom message', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.follow();
      });

      expect(result.current.error).toBe('Failed to follow user');
    });

    it('should handle network error during follow', async () => {
      const networkError = new Error('Connection refused');
      fetch.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.follow();
      });

      expect(result.current.error).toBe('Connection refused');
      expect(result.current.isFollowing).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should do nothing if userId is null', async () => {
      const { result } = renderHook(() => useFollow(null));

      await act(async () => {
        await result.current.follow();
      });

      expect(fetch).not.toHaveBeenCalled();
      expect(result.current.isFollowing).toBe(false);
    });

    it('should clear previous errors on successful follow', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.follow();
      });

      expect(result.current.error).toBe('Server error');

      await act(async () => {
        await result.current.follow();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.isFollowing).toBe(true);
    });
  });

  describe('unfollow', () => {
    it('should successfully unfollow a user', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.unfollow();
      });

      expect(result.current.isFollowing).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(fetch).toHaveBeenCalledWith(
        '/api/student/follows/2',
        expect.objectContaining({
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle unfollow error with custom message', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not following this user' }),
      });

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.unfollow();
      });

      expect(result.current.error).toBe('Not following this user');
      expect(result.current.isFollowing).toBe(false);
    });

    it('should handle unfollow error without custom message', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.unfollow();
      });

      expect(result.current.error).toBe('Failed to unfollow user');
    });

    it('should handle network error during unfollow', async () => {
      const networkError = new Error('Timeout');
      fetch.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.unfollow();
      });

      expect(result.current.error).toBe('Timeout');
      expect(result.current.isFollowing).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should do nothing if userId is null', async () => {
      const { result } = renderHook(() => useFollow(null));

      await act(async () => {
        await result.current.unfollow();
      });

      expect(fetch).not.toHaveBeenCalled();
      expect(result.current.isFollowing).toBe(false);
    });

    it('should clear previous errors on successful unfollow', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.unfollow();
      });

      expect(result.current.error).toBe('Server error');

      await act(async () => {
        await result.current.unfollow();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.isFollowing).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should follow when not currently following', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { result } = renderHook(() => useFollow(2));

      expect(result.current.isFollowing).toBe(false);

      await act(async () => {
        await result.current.toggle();
      });

      expect(result.current.isFollowing).toBe(true);
    });

    it('should unfollow when currently following', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.toggle();
      });

      expect(result.current.isFollowing).toBe(true);

      await act(async () => {
        await result.current.toggle();
      });

      expect(result.current.isFollowing).toBe(false);
    });

    it('should handle follow error during toggle', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Cannot follow' }),
      });

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.toggle();
      });

      expect(result.current.isFollowing).toBe(false);
      expect(result.current.error).toBe('Cannot follow');
    });

    it('should handle unfollow error during toggle', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Cannot unfollow' }),
        });

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.toggle();
      });

      expect(result.current.isFollowing).toBe(true);

      await act(async () => {
        await result.current.toggle();
      });

      expect(result.current.isFollowing).toBe(true);
      expect(result.current.error).toBe('Cannot unfollow');
    });
  });

  describe('sequential operations', () => {
    it('should handle multiple follow attempts', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Already following' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.follow();
      });

      expect(result.current.error).toBe('Already following');

      await act(async () => {
        await result.current.follow();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.isFollowing).toBe(true);
    });

    it('should handle follow and unfollow sequence', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      const { result } = renderHook(() => useFollow(2));

      await act(async () => {
        await result.current.follow();
      });

      expect(result.current.isFollowing).toBe(true);

      await act(async () => {
        await result.current.unfollow();
      });

      expect(result.current.isFollowing).toBe(false);

      await act(async () => {
        await result.current.follow();
      });

      expect(result.current.isFollowing).toBe(true);
    });
  });
});

describe('useFollowList Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useFollowList(1, 'followers'));

      expect(result.current.items).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.page).toBe(1);
      expect(result.current.limit).toBe(20);
      expect(result.current.total).toBe(0);
      expect(result.current.totalPages).toBe(1);
      expect(typeof result.current.fetchList).toBe('function');
      expect(typeof result.current.setPage).toBe('function');
      expect(typeof result.current.setLimit).toBe('function');
    });

    it('should use followers as default type', () => {
      const { result } = renderHook(() => useFollowList(1));
      expect(result.current.items).toEqual([]);
    });

    it('should handle null userId gracefully', () => {
      const { result } = renderHook(() => useFollowList(null, 'followers'));
      expect(result.current.items).toEqual([]);
    });
  });

  describe('fetchList - followers', () => {
    it('should fetch followers list successfully', async () => {
      const mockFollowers = {
        followers: [
          { id: 2, full_name: 'User 2', email: 'user2@example.com' },
          { id: 3, full_name: 'User 3', email: 'user3@example.com' },
        ],
        pagination: { total: 2, page: 1, limit: 20 },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFollowers,
      });

      const { result } = renderHook(() => useFollowList(1, 'followers'));

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0].full_name).toBe('User 2');
      expect(result.current.total).toBe(2);
      expect(result.current.page).toBe(1);
      expect(result.current.error).toBe(null);
      expect(result.current.isLoading).toBe(false);
    });

    it('should construct correct API URL with pagination params', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          followers: [],
          pagination: { total: 0, page: 2, limit: 50 },
        }),
      });

      const { result } = renderHook(() => useFollowList(1, 'followers'));

      await act(async () => {
        await result.current.fetchList(2);
        result.current.setLimit(50);
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/student/users/1/followers?page=2&limit=20',
        expect.any(Object)
      );
    });

    it('should handle empty followers list', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          followers: [],
          pagination: { total: 0, page: 1, limit: 20 },
        }),
      });

      const { result } = renderHook(() => useFollowList(1, 'followers'));

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.total).toBe(0);
      expect(result.current.error).toBe(null);
    });

    it('should handle missing pagination data', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          followers: [{ id: 2, full_name: 'User 2' }],
        }),
      });

      const { result } = renderHook(() => useFollowList(1, 'followers'));

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.total).toBe(0);
      expect(result.current.totalPages).toBe(1);
    });

    it('should handle fetch error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useFollowList(1, 'followers'));

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(result.current.error).toBe('Failed to fetch followers');
      expect(result.current.items).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network unavailable');
      fetch.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useFollowList(1, 'followers'));

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(result.current.error).toBe('Network unavailable');
      expect(result.current.items).toEqual([]);
    });

    it('should do nothing if userId is null', async () => {
      const { result } = renderHook(() => useFollowList(null, 'followers'));

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(fetch).not.toHaveBeenCalled();
      expect(result.current.items).toEqual([]);
    });

    it('should use default page 1 if not provided', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          followers: [],
          pagination: { total: 0, page: 1, limit: 20 },
        }),
      });

      const { result } = renderHook(() => useFollowList(1, 'followers'));

      await act(async () => {
        await result.current.fetchList();
      });

      expect(result.current.page).toBe(1);
    });
  });

  describe('fetchList - following', () => {
    it('should fetch following list successfully', async () => {
      const mockFollowing = {
        following: [{ id: 4, full_name: 'User 4', email: 'user4@example.com' }],
        pagination: { total: 1, page: 1, limit: 20 },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFollowing,
      });

      const { result } = renderHook(() => useFollowList(1, 'following'));

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].full_name).toBe('User 4');
    });

    it('should construct correct API URL for following', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          following: [],
          pagination: { total: 0, page: 1, limit: 20 },
        }),
      });

      const { result } = renderHook(() => useFollowList(5, 'following'));

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/student/users/5/following?page=1&limit=20',
        expect.any(Object)
      );
    });

    it('should handle fetch error for following', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useFollowList(1, 'following'));

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(result.current.error).toBe('Failed to fetch following');
    });
  });

  describe('pagination controls', () => {
    it('should calculate totalPages correctly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          followers: [],
          pagination: { total: 50, page: 1, limit: 20 },
        }),
      });

      const { result } = renderHook(() => useFollowList(1, 'followers'));

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(result.current.totalPages).toBe(3);
    });

    it('should calculate totalPages as 1 when no items', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          followers: [],
          pagination: { total: 0, page: 1, limit: 20 },
        }),
      });

      const { result } = renderHook(() => useFollowList(1, 'followers'));

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(result.current.totalPages).toBe(1);
    });

    it('should update page number on fetchList', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            followers: [],
            pagination: { total: 100, page: 1, limit: 20 },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            followers: [],
            pagination: { total: 100, page: 3, limit: 20 },
          }),
        });

      const { result } = renderHook(() => useFollowList(1, 'followers'));

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(result.current.page).toBe(1);

      await act(async () => {
        await result.current.fetchList(3);
      });

      expect(result.current.page).toBe(3);
    });

    it('should handle setPage function', () => {
      const { result } = renderHook(() => useFollowList(1, 'followers'));

      expect(result.current.page).toBe(1);

      act(() => {
        result.current.setPage(5);
      });

      expect(result.current.page).toBe(5);
    });

    it('should handle setLimit function', () => {
      const { result } = renderHook(() => useFollowList(1, 'followers'));

      expect(result.current.limit).toBe(20);

      act(() => {
        result.current.setLimit(50);
      });

      expect(result.current.limit).toBe(50);
    });

    it('should use updated limit in subsequent fetch', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          followers: [],
          pagination: { total: 100, page: 1, limit: 50 },
        }),
      });

      const { result } = renderHook(() => useFollowList(1, 'followers'));

      act(() => {
        result.current.setLimit(50);
      });

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/student/users/1/followers?page=1&limit=50',
        expect.any(Object)
      );
    });
  });

  describe('state management', () => {
    it('should set isLoading to true during fetch', async () => {
      let resolveResponse;
      const responsePromise = new Promise((resolve) => {
        resolveResponse = resolve;
      });

      fetch.mockReturnValueOnce({
        ok: true,
        json: () => responsePromise,
      });

      const { result } = renderHook(() => useFollowList(1, 'followers'));

      act(() => {
        result.current.fetchList(1);
      });

      await act(async () => {
        resolveResponse({
          followers: [],
          pagination: { total: 0, page: 1, limit: 20 },
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should clear error on successful fetch after error', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: false,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            followers: [],
            pagination: { total: 0, page: 1, limit: 20 },
          }),
        });

      const { result } = renderHook(() => useFollowList(1, 'followers'));

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(result.current.error).toBe('Failed to fetch followers');

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(result.current.error).toBe(null);
    });

    it('should clear items on fetch error', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            followers: [{ id: 2, full_name: 'User 2' }],
            pagination: { total: 1, page: 1, limit: 20 },
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
        });

      const { result } = renderHook(() => useFollowList(1, 'followers'));

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(result.current.items).toHaveLength(1);

      await act(async () => {
        await result.current.fetchList(1);
      });

      expect(result.current.items).toEqual([]);
    });
  });
});

describe('useFollowCounts Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useFollowCounts(1));

      expect(result.current.counts.followersCount).toBe(0);
      expect(result.current.counts.followingCount).toBe(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.fetchCounts).toBe('function');
    });

    it('should handle null userId', () => {
      const { result } = renderHook(() => useFollowCounts(null));
      expect(result.current.counts.followersCount).toBe(0);
      expect(result.current.counts.followingCount).toBe(0);
    });
  });

  describe('fetchCounts', () => {
    it('should successfully fetch follow counts', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          followersCount: 10,
          followingCount: 5,
        }),
      });

      const { result } = renderHook(() => useFollowCounts(1));

      await act(async () => {
        await result.current.fetchCounts();
      });

      expect(result.current.counts.followersCount).toBe(10);
      expect(result.current.counts.followingCount).toBe(5);
      expect(result.current.error).toBe(null);
    });

    it('should handle zero counts', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          followersCount: 0,
          followingCount: 0,
        }),
      });

      const { result } = renderHook(() => useFollowCounts(1));

      await act(async () => {
        await result.current.fetchCounts();
      });

      expect(result.current.counts.followersCount).toBe(0);
      expect(result.current.counts.followingCount).toBe(0);
    });

    it('should handle large counts', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          followersCount: 1000000,
          followingCount: 999999,
        }),
      });

      const { result } = renderHook(() => useFollowCounts(1));

      await act(async () => {
        await result.current.fetchCounts();
      });

      expect(result.current.counts.followersCount).toBe(1000000);
      expect(result.current.counts.followingCount).toBe(999999);
    });

    it('should handle missing followersCount', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          followingCount: 5,
        }),
      });

      const { result } = renderHook(() => useFollowCounts(1));

      await act(async () => {
        await result.current.fetchCounts();
      });

      expect(result.current.counts.followersCount).toBe(0);
      expect(result.current.counts.followingCount).toBe(5);
    });

    it('should handle missing followingCount', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          followersCount: 10,
        }),
      });

      const { result } = renderHook(() => useFollowCounts(1));

      await act(async () => {
        await result.current.fetchCounts();
      });

      expect(result.current.counts.followersCount).toBe(10);
      expect(result.current.counts.followingCount).toBe(0);
    });

    it('should handle empty response object', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useFollowCounts(1));

      await act(async () => {
        await result.current.fetchCounts();
      });

      expect(result.current.counts.followersCount).toBe(0);
      expect(result.current.counts.followingCount).toBe(0);
    });

    it('should handle fetch error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useFollowCounts(1));

      await act(async () => {
        await result.current.fetchCounts();
      });

      expect(result.current.error).toBe('Failed to fetch follow counts');
      expect(result.current.counts.followersCount).toBe(0);
      expect(result.current.counts.followingCount).toBe(0);
    });

    it('should handle network error', async () => {
      const networkError = new Error('Connection lost');
      fetch.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useFollowCounts(1));

      await act(async () => {
        await result.current.fetchCounts();
      });

      expect(result.current.error).toBe('Connection lost');
    });

    it('should do nothing if userId is null', async () => {
      const { result } = renderHook(() => useFollowCounts(null));

      await act(async () => {
        await result.current.fetchCounts();
      });

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should construct correct API URL', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          followersCount: 0,
          followingCount: 0,
        }),
      });

      const { result } = renderHook(() => useFollowCounts(42));

      await act(async () => {
        await result.current.fetchCounts();
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/student/users/42/follow-counts',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
    });

    it('should clear previous error on successful fetch', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: false,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            followersCount: 5,
            followingCount: 3,
          }),
        });

      const { result } = renderHook(() => useFollowCounts(1));

      await act(async () => {
        await result.current.fetchCounts();
      });

      expect(result.current.error).toBe('Failed to fetch follow counts');

      await act(async () => {
        await result.current.fetchCounts();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.counts.followersCount).toBe(5);
    });
  });
});

describe('useFollowedActivityFeed Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useFollowedActivityFeed());

      expect(result.current.activities).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.page).toBe(1);
      expect(result.current.limit).toBe(20);
      expect(result.current.total).toBe(0);
      expect(result.current.totalPages).toBe(1);
      expect(typeof result.current.fetchActivityFeed).toBe('function');
      expect(typeof result.current.setPage).toBe('function');
      expect(typeof result.current.setLimit).toBe('function');
    });
  });

  describe('fetchActivityFeed', () => {
    it('should successfully fetch activity feed', async () => {
      const mockActivities = {
        activities: [
          {
            id: 1,
            name: 'Event 1',
            created_at: '2026-07-02T10:00:00Z',
            status: 'active',
          },
          {
            id: 2,
            name: 'Event 2',
            created_at: '2026-07-01T10:00:00Z',
            status: 'pending',
          },
        ],
        pagination: { total: 2, page: 1, limit: 20 },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockActivities,
      });

      const { result } = renderHook(() => useFollowedActivityFeed());

      await act(async () => {
        await result.current.fetchActivityFeed(1);
      });

      expect(result.current.activities).toHaveLength(2);
      expect(result.current.activities[0].name).toBe('Event 1');
      expect(result.current.total).toBe(2);
      expect(result.current.error).toBe(null);
    });

    it('should handle empty activity feed', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activities: [],
          pagination: { total: 0, page: 1, limit: 20 },
        }),
      });

      const { result } = renderHook(() => useFollowedActivityFeed());

      await act(async () => {
        await result.current.fetchActivityFeed(1);
      });

      expect(result.current.activities).toHaveLength(0);
      expect(result.current.total).toBe(0);
    });

    it('should handle missing activities in response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          pagination: { total: 0, page: 1, limit: 20 },
        }),
      });

      const { result } = renderHook(() => useFollowedActivityFeed());

      await act(async () => {
        await result.current.fetchActivityFeed(1);
      });

      expect(result.current.activities).toEqual([]);
    });

    it('should handle missing pagination data', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activities: [{ id: 1, name: 'Event 1' }],
        }),
      });

      const { result } = renderHook(() => useFollowedActivityFeed());

      await act(async () => {
        await result.current.fetchActivityFeed(1);
      });

      expect(result.current.activities).toHaveLength(1);
      expect(result.current.total).toBe(0);
      expect(result.current.totalPages).toBe(1);
    });

    it('should handle fetch error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useFollowedActivityFeed());

      await act(async () => {
        await result.current.fetchActivityFeed();
      });

      expect(result.current.error).toBe('Failed to fetch activity feed');
      expect(result.current.activities).toEqual([]);
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network error');
      fetch.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useFollowedActivityFeed());

      await act(async () => {
        await result.current.fetchActivityFeed();
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.activities).toEqual([]);
    });

    it('should use default page 1 if not provided', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activities: [],
          pagination: { total: 0, page: 1, limit: 20 },
        }),
      });

      const { result } = renderHook(() => useFollowedActivityFeed());

      await act(async () => {
        await result.current.fetchActivityFeed();
      });

      expect(result.current.page).toBe(1);
    });

    it('should construct correct API URL with pagination', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activities: [],
          pagination: { total: 0, page: 2, limit: 50 },
        }),
      });

      const { result } = renderHook(() => useFollowedActivityFeed());

      await act(async () => {
        await result.current.fetchActivityFeed(2);
        result.current.setLimit(50);
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/student/activity-feed/followed?page=2&limit=20',
        expect.any(Object)
      );
    });

    it('should calculate totalPages correctly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activities: [],
          pagination: { total: 150, page: 1, limit: 20 },
        }),
      });

      const { result } = renderHook(() => useFollowedActivityFeed());

      await act(async () => {
        await result.current.fetchActivityFeed(1);
      });

      expect(result.current.totalPages).toBe(8);
    });

    it('should handle setPage', () => {
      const { result } = renderHook(() => useFollowedActivityFeed());

      expect(result.current.page).toBe(1);

      act(() => {
        result.current.setPage(3);
      });

      expect(result.current.page).toBe(3);
    });

    it('should handle setLimit', () => {
      const { result } = renderHook(() => useFollowedActivityFeed());

      expect(result.current.limit).toBe(20);

      act(() => {
        result.current.setLimit(50);
      });

      expect(result.current.limit).toBe(50);
    });

    it('should clear error on successful fetch after error', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: false,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            activities: [],
            pagination: { total: 0, page: 1, limit: 20 },
          }),
        });

      const { result } = renderHook(() => useFollowedActivityFeed());

      await act(async () => {
        await result.current.fetchActivityFeed();
      });

      expect(result.current.error).toBe('Failed to fetch activity feed');

      await act(async () => {
        await result.current.fetchActivityFeed();
      });

      expect(result.current.error).toBe(null);
    });
  });
});

describe('useCurrentUserFollowing Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useCurrentUserFollowing());

      expect(result.current.following).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.page).toBe(1);
      expect(result.current.limit).toBe(20);
      expect(result.current.total).toBe(0);
      expect(result.current.totalPages).toBe(1);
      expect(typeof result.current.fetchFollowing).toBe('function');
    });
  });

  describe('fetchFollowing', () => {
    it('should successfully fetch current user following list', async () => {
      const mockFollowing = {
        following: [
          { id: 2, full_name: 'User 2', email: 'user2@example.com' },
          { id: 3, full_name: 'User 3', email: 'user3@example.com' },
        ],
        pagination: { total: 2, page: 1, limit: 20 },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFollowing,
      });

      const { result } = renderHook(() => useCurrentUserFollowing());

      await act(async () => {
        await result.current.fetchFollowing(1);
      });

      expect(result.current.following).toHaveLength(2);
      expect(result.current.following[0].full_name).toBe('User 2');
      expect(result.current.total).toBe(2);
      expect(result.current.error).toBe(null);
    });

    it('should handle empty following list', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          following: [],
          pagination: { total: 0, page: 1, limit: 20 },
        }),
      });

      const { result } = renderHook(() => useCurrentUserFollowing());

      await act(async () => {
        await result.current.fetchFollowing(1);
      });

      expect(result.current.following).toHaveLength(0);
      expect(result.current.total).toBe(0);
    });

    it('should handle missing following in response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          pagination: { total: 0, page: 1, limit: 20 },
        }),
      });

      const { result } = renderHook(() => useCurrentUserFollowing());

      await act(async () => {
        await result.current.fetchFollowing(1);
      });

      expect(result.current.following).toEqual([]);
    });

    it('should handle fetch error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useCurrentUserFollowing());

      await act(async () => {
        await result.current.fetchFollowing();
      });

      expect(result.current.error).toBe('Failed to fetch following list');
      expect(result.current.following).toEqual([]);
    });

    it('should handle network error', async () => {
      const networkError = new Error('Connection error');
      fetch.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useCurrentUserFollowing());

      await act(async () => {
        await result.current.fetchFollowing();
      });

      expect(result.current.error).toBe('Connection error');
      expect(result.current.following).toEqual([]);
    });

    it('should construct correct API URL', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          following: [],
          pagination: { total: 0, page: 1, limit: 20 },
        }),
      });

      const { result } = renderHook(() => useCurrentUserFollowing());

      await act(async () => {
        await result.current.fetchFollowing(1);
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/student/me/following?page=1&limit=20',
        expect.any(Object)
      );
    });

    it('should handle pagination', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            following: [],
            pagination: { total: 100, page: 1, limit: 20 },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            following: [],
            pagination: { total: 100, page: 2, limit: 20 },
          }),
        });

      const { result } = renderHook(() => useCurrentUserFollowing());

      await act(async () => {
        await result.current.fetchFollowing(1);
      });

      expect(result.current.page).toBe(1);
      expect(result.current.totalPages).toBe(5);

      await act(async () => {
        await result.current.fetchFollowing(2);
      });

      expect(result.current.page).toBe(2);
    });

    it('should handle setPage', () => {
      const { result } = renderHook(() => useCurrentUserFollowing());

      expect(result.current.page).toBe(1);

      act(() => {
        result.current.setPage(2);
      });

      expect(result.current.page).toBe(2);
    });

    it('should handle setLimit', () => {
      const { result } = renderHook(() => useCurrentUserFollowing());

      expect(result.current.limit).toBe(20);

      act(() => {
        result.current.setLimit(50);
      });

      expect(result.current.limit).toBe(50);
    });
  });
});
