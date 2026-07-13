import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import OfflineBanner from '../pwa/OfflineBanner.jsx';

const mockHookState = vi.hoisted(() => ({
  isOnline: true,
  isSyncing: false,
  queuedCount: 2,
  syncNow: vi.fn(),
  syncStats: { synced: 0, failed: 0 },
}));

vi.mock('../../hooks/useOfflineSync.js', () => ({
  useOfflineSync: () => mockHookState,
}));

describe('OfflineBanner', () => {
  beforeEach(() => {
    mockHookState.syncNow.mockClear();
    Object.assign(mockHookState, {
      isOnline: true,
      isSyncing: false,
      queuedCount: 2,
      syncStats: { synced: 0, failed: 0 },
    });
  });

  it('shows a retry toast when sync fails and exposes manual retry', () => {
    render(<OfflineBanner />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent('nexasphere:sync-failed', {
          detail: {
            url: '/api/events/123/register',
            error: 'Request timed out',
          },
        })
      );
    });

    expect(screen.getByText('Sync failed')).toBeInTheDocument();
    expect(
      screen.getByText('/api/events/123/register could not be synced. Request timed out')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Retry Now/i }));
    expect(mockHookState.syncNow).toHaveBeenCalledTimes(1);
  });

  it('shows a success toast when sync completes cleanly', () => {
    render(<OfflineBanner />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent('nexasphere:sync-complete', {
          detail: { synced: 2, failed: 0 },
        })
      );
    });

    expect(screen.getByText('Sync complete')).toBeInTheDocument();
    expect(screen.getByText('2 queued actions synced successfully.')).toBeInTheDocument();
  });
});
