import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/apiClient';
import { useTheme } from '../hooks/useTheme';

export const StudentAuthContext = createContext(null);

const TOKEN_KEY = 'ns_student_token';

export function StudentAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (token) => {
    try {
      const data = await apiClient('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, token);
      if (data.user) {
        localStorage.setItem(
          'ns_user',
          JSON.stringify({
            id: data.user.sub || data.user.id,
            email: data.user.email,
            name: data.user.name,
          })
        );
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('ns_user');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      fetchMe(storedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  useEffect(() => {
    const handleSessionExpired = () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('ns_user');
      setUser(null);
      alert('Your session has expired. Please log in again.');
      window.location.href = '/login';
    };
    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, []);

  const login = useCallback((provider) => {
    window.location.href = `/api/auth/${provider}`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('ns_user');
    setUser(null);
  }, []);

  const { setTheme } = useTheme();

  useEffect(() => {
    if (user && user.theme) {
      setTheme(user.theme);
    }
  }, [user, setTheme]);

  const value = { user, loading, login, logout, isAuthenticated: !!user };

  return <StudentAuthContext.Provider value={value}>{children}</StudentAuthContext.Provider>;
}

export function useStudentAuth() {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) throw new Error('useStudentAuth must be used within StudentAuthProvider');
  return ctx;
}
