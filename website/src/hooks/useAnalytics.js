import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../utils/apiClient.js';
import { useStudentAuth } from '../context/StudentAuthContext';

let sessionId = localStorage.getItem('ns_analytics_session_id');
if (!sessionId) {
  sessionId = crypto.randomUUID();
  localStorage.setItem('ns_analytics_session_id', sessionId);
}

export function useAnalytics() {
  const location = useLocation();
  const { isAuthenticated, user } = useStudentAuth();

  const logEvent = useCallback((eventType, metadata = {}) => {
    // Only send if consent is given or tracking is enabled (omitted for brevity, assume true)
    const event = {
      type: eventType,
      url: window.location.pathname,
      selector: metadata.selector,
      metadata,
    };

    // Buffer or send immediately
    apiClient('/api/analytics/events', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        events: [event],
      }),
    }).catch(console.error);
  }, []);

  // Track page views
  useEffect(() => {
    logEvent('page_view', { path: location.pathname });
  }, [location.pathname, logEvent]);

  // Track global clicks for heatmap
  useEffect(() => {
    const handleClick = (e) => {
      // Find closest semantic element or use path
      let target = e.target;
      let selector = '';
      if (target.id) {
        selector = `#${target.id}`;
      } else if (target.className && typeof target.className === 'string') {
        selector = `.${target.className.split(' ').join('.')}`;
      } else {
        selector = target.tagName.toLowerCase();
      }

      logEvent('click', {
        selector,
        x: e.clientX,
        y: e.clientY,
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [logEvent]);

  // Start Session on Mount
  useEffect(() => {
    const startSession = async () => {
      try {
        await apiClient('/api/analytics/session', {
          method: 'POST',
          body: JSON.stringify({
            id: sessionId,
            device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            browser: navigator.userAgent,
          }),
        });
      } catch (e) {
        console.error('Failed to start analytics session', e);
      }
    };
    startSession();
  }, []);

  return { logEvent, sessionId };
}
