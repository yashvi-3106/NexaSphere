/**
 * OfflineBanner — NexaSphere PWA
 * ================================
 * Displays a slide-down banner when the user goes offline.
 * Shows:
 *  - Offline state: "📡 You're offline — X actions queued"
 *  - Syncing state: spinner + "Syncing…"
 *  - Back-online flash: "✅ Back online — all synced!" (auto-hides after 3s)
 *  - Sync toasts for success/failure with retry support
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useOfflineSync } from '../../hooks/useOfflineSync.js';
import '../../styles/pwa.css';

export default function OfflineBanner() {
  const { isOnline, isSyncing, queuedCount, syncNow, syncStats } = useOfflineSync();

  // Whether the banner is currently visible
  const [visible, setVisible] = useState(false);
  // "online" means we just came back online (green variant)
  const [showOnline, setShowOnline] = useState(false);
  const [toast, setToast] = useState(null);
  const onlineTimerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const prevOnlineRef = useRef(navigator.onLine);

  const clearToastTimer = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (nextToast) => {
      clearToastTimer();
      setToast(nextToast);

      const timeout = nextToast.variant === 'error' ? 8000 : 4500;
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
      }, timeout);
    },
    [clearToastTimer]
  );

  useEffect(() => {
    if (!isOnline) {
      // Gone offline — show immediately
      setShowOnline(false);
      setVisible(true);
      if (onlineTimerRef.current) clearTimeout(onlineTimerRef.current);
    } else {
      // Just came back online
      if (!prevOnlineRef.current) {
        // Show green "back online" variant for 3 seconds
        setShowOnline(true);
        setVisible(true);
        onlineTimerRef.current = setTimeout(() => {
          setVisible(false);
          setShowOnline(false);
        }, 3500);
      }
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    const onSyncComplete = (event) => {
      const { synced = 0, failed = 0 } = event.detail || {};
      if (synced === 0 && failed === 0) return;

      showToast(
        failed > 0
          ? {
              variant: 'error',
              title: 'Sync finished with errors',
              message: `${synced} queued action${synced === 1 ? '' : 's'} synced, but ${failed} failed. Review the banner details and retry when ready.`,
            }
          : {
              variant: 'success',
              title: 'Sync complete',
              message: `${synced} queued action${synced === 1 ? '' : 's'} synced successfully.`,
            }
      );
    };

    const onSyncFailed = (event) => {
      const detail = event.detail || {};
      const failedPath = (() => {
        try {
          return new URL(detail.url, window.location.origin).pathname;
        } catch {
          return detail.url || 'the queued request';
        }
      })();

      showToast({
        variant: 'error',
        title: 'Sync failed',
        message: detail.error
          ? `${failedPath} could not be synced. ${detail.error}`
          : `${failedPath} could not be synced. Try again once the connection is stable.`,
      });
    };

    window.addEventListener('nexasphere:sync-complete', onSyncComplete);
    window.addEventListener('nexasphere:sync-failed', onSyncFailed);

    return () => {
      window.removeEventListener('nexasphere:sync-complete', onSyncComplete);
      window.removeEventListener('nexasphere:sync-failed', onSyncFailed);
    };
  }, [showToast]);

  // Also hide after sync completes if we're online
  useEffect(() => {
    if (isOnline && !isSyncing && queuedCount === 0 && showOnline) {
      onlineTimerRef.current = setTimeout(() => {
        setVisible(false);
        setShowOnline(false);
      }, 2000);
    }
    return () => {
      if (onlineTimerRef.current) clearTimeout(onlineTimerRef.current);
    };
  }, [isOnline, isSyncing, queuedCount, showOnline]);

  useEffect(
    () => () => {
      if (onlineTimerRef.current) clearTimeout(onlineTimerRef.current);
      clearToastTimer();
    },
    [clearToastTimer]
  );

  // Render nothing initially (banner is hidden via CSS transform)
  return (
    <>
      <div
        className={`pwa-offline-banner${visible ? ' pwa-banner--visible' : ''}${showOnline ? ' pwa-banner--online' : ''}`}
        role="status"
        aria-live="polite"
        aria-label={
          showOnline ? 'Connection restored' : isOnline ? 'Network status' : 'You are offline'
        }
      >
        <div className="pwa-banner__left">
          <div className="pwa-banner__icon" aria-hidden="true">
            {showOnline ? '✅' : isSyncing ? '🔄' : '📡'}
          </div>
          <div className="pwa-banner__text">
            <span className="pwa-banner__title">
              {showOnline ? 'Back Online' : isSyncing ? 'Syncing…' : "You're Offline"}
            </span>
            <span className="pwa-banner__subtitle">
              {showOnline
                ? syncStats.failed > 0
                  ? `${syncStats.synced} synced, ${syncStats.failed} failed — check your actions`
                  : 'All changes have been synced successfully'
                : isSyncing
                  ? `Syncing ${queuedCount} queued action${queuedCount !== 1 ? 's' : ''}…`
                  : 'Changes will sync when you reconnect'}
            </span>
          </div>
        </div>

        <div className="pwa-banner__right">
          {isSyncing && <span className="pwa-spinner" aria-hidden="true" />}

          {!isOnline && queuedCount > 0 && (
            <span className="pwa-banner__badge" aria-label={`${queuedCount} actions queued`}>
              <span className="pwa-dot" aria-hidden="true" />
              {queuedCount} queued
            </span>
          )}

          {isOnline && !isSyncing && queuedCount > 0 && (
            <button
              className="pwa-banner__sync-btn"
              onClick={syncNow}
              aria-label="Sync queued changes now"
            >
              Sync Now
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div className="pwa-toast-container bottom-right" aria-live="polite">
          <div
            className="pwa-toast-card"
            role={toast.variant === 'error' ? 'alert' : 'status'}
            aria-label={toast.title}
          >
            <div className="pwa-toast-header">
              <div
                className={`pwa-toast-icon ${toast.variant === 'error' ? 'warning' : 'success'}`}
              >
                {toast.variant === 'error' ? (
                  <AlertTriangle size={20} />
                ) : (
                  <CheckCircle2 size={20} />
                )}
              </div>
              <div className="pwa-toast-body">
                <h4 className="pwa-toast-title">{toast.title}</h4>
                <p className="pwa-toast-description">{toast.message}</p>
              </div>
              <button
                type="button"
                className="pwa-btn-close"
                onClick={() => {
                  clearToastTimer();
                  setToast(null);
                }}
                aria-label="Dismiss sync notification"
              >
                <X size={14} />
              </button>
            </div>
            {toast.variant === 'error' && queuedCount > 0 && isOnline && (
              <div className="pwa-toast-actions">
                <button className="pwa-banner__sync-btn" onClick={syncNow}>
                  Retry Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
