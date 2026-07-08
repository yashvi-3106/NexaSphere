export function setupFetchInterceptor() {
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';

    try {
      const response = await originalFetch.apply(this, args);

      if (response.status === 401) {
        // Exclude endpoints that handle 401 themselves
        if (!url.includes('/api/auth/me') && !url.includes('/api/auth/login')) {
          window.dispatchEvent(new CustomEvent('session-expired'));
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  };
}
