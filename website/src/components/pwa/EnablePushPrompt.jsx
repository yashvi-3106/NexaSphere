import { useEffect, useState } from 'react';
import '../../styles/pwa.css';
import { subscribeToPush, isPushAlreadySubscribed } from '../../utils/push';

export default function EnablePushPrompt() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | working | done | error

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const subscribed = await isPushAlreadySubscribed();
        if (subscribed) {
          if (!cancelled) {
            setVisible(false);
            setStatus('done');
          }
          return;
        }

        // If user previously denied, don't nag.
        try {
          if (localStorage.getItem('ns-push-permission-denied') === 'true') {
            if (!cancelled) {
              setVisible(false);
              setStatus('done');
            }
            return;
          }
        } catch {
          // ignore
        }

        if (!cancelled) {
          // Show after short delay so first paint stays fast.
          setTimeout(() => {
            if (!cancelled) setVisible(true);
          }, 2500);
        }
      } catch {
        if (!cancelled) setVisible(false);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEnable = async () => {
    setStatus('working');
    try {
      const res = await subscribeToPush();
      if (res?.ok) {
        setStatus('done');
        setVisible(false);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (!visible) return null;

  return (
    <div
      className="pwa-enable-push"
      role="dialog"
      aria-label="Enable notifications"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 99999,
        maxWidth: 360,
        background: 'var(--bg)',
        border: '1px solid rgba(204,17,17,0.22)',
        borderRadius: 16,
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        padding: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          aria-hidden="true"
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(204,17,17,0.12)',
            border: '1px solid rgba(204,17,17,0.22)',
            flexShrink: 0,
          }}
        >
          🔔
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>
            Get event updates
          </div>
          <div style={{ color: 'var(--t2)', fontSize: 13, lineHeight: 1.35 }}>
            Enable push notifications to get updates about registrations, reminders, and
            announcements.
          </div>

          {status === 'working' && (
            <div style={{ marginTop: 10, color: 'var(--t2)', fontSize: 12 }}>Subscribing…</div>
          )}
          {status === 'error' && (
            <div style={{ marginTop: 10, color: 'var(--c1)', fontSize: 12 }}>
              Could not enable notifications on this device.
            </div>
          )}
        </div>

        <button
          onClick={() => setVisible(false)}
          aria-label="Dismiss"
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--t2)',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button
          onClick={handleEnable}
          disabled={status === 'working'}
          style={{
            flex: 1,
            borderRadius: 12,
            border: '1px solid rgba(204,17,17,0.4)',
            background: 'linear-gradient(135deg,#CC1111,#880000)',
            color: '#fff',
            fontWeight: 800,
            padding: '10px 12px',
            cursor: status === 'working' ? 'not-allowed' : 'pointer',
            opacity: status === 'working' ? 0.7 : 1,
          }}
        >
          Enable notifications
        </button>
        <button
          onClick={() => setVisible(false)}
          style={{
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            color: 'var(--t2)',
            fontWeight: 700,
            padding: '10px 12px',
            cursor: 'pointer',
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
