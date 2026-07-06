import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as rrweb from 'rrweb';
import apiClient from '../utils/apiClient.js';

const SessionRecordingContext = createContext({});

export const useSessionRecording = () => useContext(SessionRecordingContext);

export function SessionRecordingProvider({ children, sessionId }) {
  const [consentGranted, setConsentGranted] = useState(false);
  const eventsBuffer = useRef([]);
  const stopFn = useRef(null);

  useEffect(() => {
    // Check localStorage for consent
    if (localStorage.getItem('ns_tracking_consent') === 'true') {
      setConsentGranted(true);
    }
  }, []);

  const grantConsent = () => {
    localStorage.setItem('ns_tracking_consent', 'true');
    setConsentGranted(true);
  };

  useEffect(() => {
    if (!consentGranted || !sessionId) return;

    try {
      stopFn.current = rrweb.record({
        emit(event) {
          eventsBuffer.current.push(event);
        },
        // Mask passwords natively, and allow explicit masking via .rr-block
        maskInputOptions: { password: true },
        blockClass: 'rr-block',
        ignoreClass: 'rr-ignore',
      });
    } catch (err) {
      console.error('Failed to start rrweb recording', err);
    }

    const interval = setInterval(async () => {
      if (eventsBuffer.current.length > 0) {
        const eventsToSend = [...eventsBuffer.current];
        eventsBuffer.current = [];
        try {
          await apiClient('/api/analytics/recordings', {
            method: 'POST',
            body: JSON.stringify({
              sessionId,
              eventsJson: eventsToSend,
            }),
          });
        } catch (e) {
          console.error('Failed to save recordings', e);
          // If fail, we might want to push them back, but let's keep it simple
        }
      }
    }, 10000); // Flush every 10 seconds

    return () => {
      if (stopFn.current) stopFn.current();
      clearInterval(interval);
    };
  }, [consentGranted, sessionId]);

  return (
    <SessionRecordingContext.Provider value={{ consentGranted, grantConsent }}>
      {children}
    </SessionRecordingContext.Provider>
  );
}
