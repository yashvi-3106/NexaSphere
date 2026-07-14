/**
 * useSearch
 * ==========
 * Minimal client-side search hook used by SearchBar.
 *
 * Provides:
 *  - local filtering over provided `activities` and `events`
 *  - grouping of results by type
 *  - recent searches storage
 */

import { useState, useMemo, useCallback, useEffect } from 'react';

const RECENT_KEY = 'ns_recent_searches';

function safeLower(v) {
  return String(v || '').toLowerCase();
}

function uniqBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const it of arr) {
    const k = keyFn(it);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(it);
    }
  }
  return out;
}

export function useSearch(activities = {}, events = []) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setRecentSearches(parsed);
    } catch {
      // ignore
    }
  }, []);

  const persistRecent = useCallback((next) => {
    setRecentSearches(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const addRecentSearch = useCallback(
    (term) => {
      const t = String(term || '').trim();
      if (!t) return;
      persistRecent([t, ...recentSearches.filter((x) => x !== t)].slice(0, 8));
    },
    [persistRecent, recentSearches]
  );

  const removeRecentSearch = useCallback(
    (term) => {
      const t = String(term || '').trim();
      persistRecent(recentSearches.filter((x) => x !== t));
    },
    [persistRecent, recentSearches]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilter('all');
    setError(null);
  }, []);

  const baseResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results = [];

    // Events
    for (const ev of events || []) {
      const hay = [ev.name, ev.shortName, ev.title].filter(Boolean).join(' ');
      if (safeLower(hay).includes(q)) {
        results.push({
          id: ev.id ?? ev.name ?? ev.shortName,
          type: 'event',
          title: ev.name || ev.title || ev.shortName || 'Event',
          description: ev.description || '',
          event: { id: ev.id ?? ev.name, name: ev.name || ev.title },
          key: ev.id ?? ev.name,
          url: `/events/${encodeURIComponent(ev.id ?? ev.name)}`,
        });
      }
    }

    // Activities + conducted events
    for (const act of Object.values(activities || {})) {
      const actKey = act.key || act.id || act.title || act.name;
      const actHay = [act.title, act.name, act.description].filter(Boolean).join(' ');
      if (safeLower(actHay).includes(q)) {
        results.push({
          id: actKey,
          type: 'activity',
          title: act.title || act.name,
          description: act.description || '',
          key: actKey,
          url: `/activities/${encodeURIComponent(actKey)}`,
        });
      }

      for (const cev of act.conductedEvents || []) {
        const hay2 = [cev.name, cev.shortName].filter(Boolean).join(' ');
        if (safeLower(hay2).includes(q)) {
          results.push({
            id: cev.id ?? cev.name ?? cev.shortName,
            type: 'event',
            title: cev.name || cev.shortName,
            description: cev.description || '',
            event: { id: cev.id ?? cev.name, name: cev.name || cev.shortName },
            key: cev.id ?? cev.name,
            url: `/events/${encodeURIComponent(cev.id ?? cev.name)}`,
          });
        }
      }
    }

    return uniqBy(results, (r) => `${r.type}::${r.id}`);
  }, [activities, events, query]);

  const filteredResults = useMemo(() => {
    if (filter === 'all') return baseResults;

    const allowed = new Set();
    if (filter === 'events') allowed.add('event');
    else if (filter === 'activities' || filter === 'members') allowed.add('activity');
    else if (filter === 'posts') allowed.add('post');
    else if (filter === 'resources') allowed.add('resource');
    else if (filter === 'users') allowed.add('user');

    return baseResults.filter((r) => allowed.has(r.type));
  }, [baseResults, filter]);

  const groupedResults = useMemo(() => {
    const groups = {};
    for (const r of filteredResults) {
      const gKey = r.type === 'event' ? 'event' : r.type === 'activity' ? 'activity' : r.type;
      if (!groups[gKey]) groups[gKey] = [];
      groups[gKey].push(r);
    }

    return {
      event: groups.event || [],
      activity: groups.activity || [],
    };
  }, [filteredResults]);

  useEffect(() => {
    if (!query.trim()) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const t = setTimeout(() => {
      setLoading(false);
    }, 120);

    return () => clearTimeout(t);
  }, [query, filter]);

  return {
    query,
    setQuery,
    filter,
    setFilter,
    results: filteredResults,
    groupedResults,
    loading,
    error,
    clearSearch,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
  };
}
