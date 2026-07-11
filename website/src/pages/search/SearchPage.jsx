import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Zap,
  Calendar,
  Users,
  User,
  Folder,
  MessageSquare,
  BookOpen,
  X,
  Sparkles,
} from 'lucide-react';
import { getApiBase } from '../../utils/runtimeConfig';
import Footer from '../../shared/Footer';

const TYPE_CONFIG = {
  activity: {
    bg: 'rgba(204,17,17,0.15)',
    color: 'var(--c1)',
    icon: <Zap size={18} color="var(--c1)" />,
    label: 'Activity',
  },
  event: {
    bg: 'rgba(90,90,255,0.15)',
    color: '#9999ff',
    icon: <Calendar size={18} color="#9999ff" />,
    label: 'Event',
  },
  member: {
    bg: 'rgba(0,200,100,0.15)',
    color: '#00c864',
    icon: <Users size={18} color="#00c864" />,
    label: 'Core Team',
  },
  user: {
    bg: 'rgba(0,200,255,0.15)',
    color: '#00c8ff',
    icon: <User size={18} color="#00c8ff" />,
    label: 'User',
  },
  portfolio: {
    bg: 'rgba(255,100,255,0.15)',
    color: '#ff64ff',
    icon: <User size={18} color="#ff64ff" />,
    label: 'Portfolio',
  },
  community: {
    bg: 'rgba(245,158,11,0.15)',
    color: '#f59e0b',
    icon: <Folder size={18} color="#f59e0b" />,
    label: 'Community',
  },
  post: {
    bg: 'rgba(167,139,250,0.15)',
    color: '#a78bfa',
    icon: <MessageSquare size={18} color="#a78bfa" />,
    label: 'Discussion',
  },
  resource: {
    bg: 'rgba(34,197,94,0.15)',
    color: '#22c55e',
    icon: <BookOpen size={18} color="#22c55e" />,
    label: 'Resource',
  },
};

const FILTER_OPTIONS = [
  { key: 'all', label: 'All Results' },
  { key: 'events', label: 'Events' },
  { key: 'posts', label: 'Discussions' },
  { key: 'resources', label: 'Resources' },
  { key: 'members', label: 'Core Team' },
  { key: 'users', label: 'Users' },
  { key: 'activities', label: 'Activities' },
];

function Highlight({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = String(text).split(new RegExp(`(${safe})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            style={{
              background: 'rgba(204,17,17,0.85)',
              color: '#fff',
              borderRadius: '3px',
              padding: '0 2px',
              fontWeight: 700,
            }}
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'all';

  const [inputVal, setInputVal] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState(initialType);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync state if URL search parameters change
  useEffect(() => {
    setInputVal(initialQuery);
    setActiveFilter(initialType);
  }, [initialQuery, initialType]);

  // Debounced input query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputVal.trim() !== initialQuery) {
        setSearchParams({ q: inputVal.trim(), type: activeFilter });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [inputVal, setSearchParams, activeFilter, initialQuery]);

  useEffect(() => {
    if (!initialQuery.trim() || initialQuery.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      const apiBase = getApiBase();
      if (!apiBase) {
        setError('Search is currently in offline mode.');
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams({
          q: initialQuery.trim(),
          type: activeFilter,
          limit: '40',
        });
        const res = await fetch(`${apiBase}/api/search?${params}`);
        if (!res.ok) {
          throw new Error('Search request failed.');
        }
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error('Dedicated search page fetch error:', err);
        setError('Failed to load search results. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [initialQuery, activeFilter]);

  const handleFilterClick = (filterKey) => {
    setActiveFilter(filterKey);
    setSearchParams({ q: initialQuery, type: filterKey });
  };

  const handleResultClick = (result) => {
    // Add to recent searches history
    try {
      const saved = localStorage.getItem('ns_recent_searches');
      const searches = saved ? JSON.parse(saved) : [];
      const filtered = searches.filter((s) => s.toLowerCase() !== initialQuery.toLowerCase());
      const next = [initialQuery, ...filtered].slice(0, 10);
      localStorage.setItem('ns_recent_searches', JSON.stringify(next));
    } catch {}

    if (result.type === 'activity') navigate(`/activities/${encodeURIComponent(result.id)}`);
    else if (result.type === 'event') navigate(`/events/${result.id}`);
    else if (result.type === 'member') navigate(`/team`);
    else if (result.type === 'user' || result.type === 'portfolio')
      window.location.href = result.url;
    else if (result.type === 'community' || result.type === 'post' || result.type === 'resource')
      navigate(result.url);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div
        className="roadmaps-page-container"
        style={{
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '40px 20px 100px',
        }}
      >
        {/* Header navigation back */}
        <div style={{ marginBottom: '28px' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-sm btn-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '16px',
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1
            className="roadmaps-title"
            style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            Search Results <Sparkles size={22} color="var(--c1)" />
          </h1>
        </div>

        {/* Big Search Input Field */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--bdr)',
            borderRadius: '16px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            marginBottom: '32px',
          }}
        >
          <Search size={22} color="var(--c1)" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type to search anything on NexaSphere..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--t1)',
              fontSize: '1.2rem',
              fontFamily: 'inherit',
            }}
          />
          {inputVal && (
            <button
              onClick={() => setInputVal('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--t2)',
                display: 'flex',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Layout: Sidebar filters + Grid results */}
        <div style={{ display: 'flex', gap: '32px', flexDirection: 'row', flexWrap: 'wrap' }}>
          {/* Sidebar / Filters */}
          <div style={{ width: '240px', flexShrink: 0 }}>
            <div
              style={{
                position: 'sticky',
                top: '100px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--t3)',
                  padding: '0 12px 10px',
                  borderBottom: '1px solid var(--bdr)',
                  marginBottom: '8px',
                }}
              >
                Filter Category
              </div>
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleFilterClick(opt.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeFilter === opt.key ? 'var(--c1)' : 'transparent',
                    color: activeFilter === opt.key ? '#fff' : 'var(--t2)',
                    fontSize: '0.9rem',
                    fontWeight: activeFilter === opt.key ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results Display Area */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            {loading && (
              <div style={{ padding: '80px 0', textAlign: 'center' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '3px solid rgba(204,17,17,0.2)',
                    borderTop: '3px solid #CC1111',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 20px',
                  }}
                />
                <span style={{ color: 'var(--t2)', fontSize: '0.95rem' }}>
                  Searching for matches...
                </span>
              </div>
            )}

            {error && !loading && (
              <div
                style={{
                  background: 'rgba(204,17,17,0.08)',
                  border: '1px solid rgba(204,17,17,0.2)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  color: '#CC1111',
                }}
              >
                {error}
              </div>
            )}

            {!loading && !error && results.length === 0 && (
              <div
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--bdr)',
                  borderRadius: '16px',
                  padding: '80px 20px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔍</div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    color: 'var(--t1)',
                    fontWeight: 700,
                    marginBottom: '8px',
                  }}
                >
                  No Results Found
                </h3>
                <p
                  style={{
                    color: 'var(--t2)',
                    fontSize: '0.95rem',
                    maxWidth: '400px',
                    margin: '0 auto',
                  }}
                >
                  We couldn't find any matches for "{initialQuery}". Try adjusting your query or
                  category filters.
                </p>
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              <div>
                <div
                  style={{
                    color: 'var(--t3)',
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                    paddingLeft: '4px',
                  }}
                >
                  Found {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;
                  {initialQuery}&rdquo;
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <AnimatePresence>
                    {results.map((result, idx) => {
                      const tc = TYPE_CONFIG[result.type] || TYPE_CONFIG.event;
                      return (
                        <motion.div
                          key={`${result.id}-${result.type}-${idx}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                          onClick={() => handleResultClick(result)}
                          style={{
                            background: 'var(--card)',
                            border: '1px solid var(--bdr)',
                            borderRadius: '14px',
                            padding: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '20px',
                            alignItems: 'center',
                            transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--c1)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--bdr)';
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '12px',
                              background: tc.bg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {tc.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '4px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '2px 10px',
                                  borderRadius: '12px',
                                  background: tc.bg,
                                  color: tc.color,
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {tc.label}
                              </span>
                              {result.date && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--t3)' }}>
                                  {new Date(result.date).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>
                            <h3
                              style={{
                                fontSize: '1.05rem',
                                fontWeight: 700,
                                color: 'var(--t1)',
                                margin: '0 0 6px',
                              }}
                            >
                              <Highlight text={result.title} query={initialQuery} />
                            </h3>
                            {result.description && (
                              <p
                                style={{
                                  color: 'var(--t2)',
                                  fontSize: '0.85rem',
                                  lineHeight: '1.5',
                                  margin: 0,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                <Highlight text={result.description} query={initialQuery} />
                              </p>
                            )}
                            {result.tags && result.tags.length > 0 && (
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '6px',
                                  flexWrap: 'wrap',
                                  marginTop: '10px',
                                }}
                              >
                                {result.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    style={{
                                      fontSize: '0.7rem',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      background: 'rgba(255,255,255,0.05)',
                                      color: 'var(--t3)',
                                    }}
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <ArrowRight size={18} color="var(--t3)" style={{ flexShrink: 0 }} />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer onAdmin={() => {}} onProjects={() => {}} onRoadmaps={() => {}} />
    </div>
  );
}
