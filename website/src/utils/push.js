/**
 * NexaSphere Push Utilities
 * =========================
 * Client-side helpers for push notifications:
 *  - Request permission
 *  - Subscribe using Push API (VAPID)
 *  - Send subscription to backend
 *
 * NOTE:
 *  - This project currently has SW notification handlers (public/sw.js),
 *    but no verified Push subscription flow in the client.
 *  - Implementing subscription in a single place keeps behavior consistent.
 */

const STORAGE_KEYS = {
  PUSH_SUBSCRIBED: 'ns-push-subscribed',
  PUSH_PERMISSION_DENIED: 'ns-push-permission-denied',
};

function getVapidPublicKey() {
  // Prefer build-time env var. Fallback to localStorage (for dev).
  const envKey = import.meta?.env?.VITE_VAPID_PUBLIC_KEY;
  if (envKey) return envKey;

  try {
    return localStorage.getItem('ns-vapid-public-key');
  } catch {
    return null;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function ensurePermission() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return { ok: false, reason: 'not-supported' };
  }

  if (!('PushManager' in window)) {
    return { ok: false, reason: 'pushmanager-missing' };
  }

  let permission = Notification.permission;
  if (permission === 'granted') return { ok: true };
  if (permission === 'denied') {
    return { ok: false, reason: 'denied' };
  }

  // permission === 'default'
  permission = await Notification.requestPermission();
  if (permission === 'granted') return { ok: true };

  try {
    localStorage.setItem(STORAGE_KEYS.PUSH_PERMISSION_DENIED, 'true');
  } catch {
    // ignore
  }

  return { ok: false, reason: permission };
}

async function getOrCreateSubscription(swReg, vapidPublicKey) {
  // Existing subscription?
  let subscription = await swReg.pushManager.getSubscription();
  if (subscription) return subscription;

  if (!vapidPublicKey) {
    throw new Error('Missing VAPID public key (VITE_VAPID_PUBLIC_KEY)');
  }

  subscription = await swReg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  return subscription;
}

/**
 * Subscribes the browser to Push notifications and POSTs subscription to backend.
 *
 * Backend contract (expected):
 *   POST /api/notifications/push/subscribe
 *   body: { endpoint, keys }
 */
export async function subscribeToPush() {
  const permission = await ensurePermission();
  if (!permission.ok) return permission;

  const vapidPublicKey = getVapidPublicKey();
  if (!vapidPublicKey) {
    return { ok: false, reason: 'missing-vapid-public-key' };
  }

  const swReg = await navigator.serviceWorker.ready;
  const subscription = await getOrCreateSubscription(swReg, vapidPublicKey);

  // Send subscription to backend
  // (If endpoint differs, update here)
  const payload = {
    endpoint: subscription.endpoint,
    keys: subscription.toJSON().keys,
  };

  const res = await fetch('/api/notifications/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Push subscribe backend failed: ${res.status}`);
  }

  try {
    localStorage.setItem(STORAGE_KEYS.PUSH_SUBSCRIBED, 'true');
  } catch {
    // ignore
  }

  return { ok: true };
}

export async function isPushAlreadySubscribed() {
  try {
    if (localStorage.getItem(STORAGE_KEYS.PUSH_SUBSCRIBED) === 'true') {
      return true;
    }
  } catch {
    // ignore
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  const swReg = await navigator.serviceWorker.ready;
  return Boolean(await swReg.pushManager.getSubscription());
}
