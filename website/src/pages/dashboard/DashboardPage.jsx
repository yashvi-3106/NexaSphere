import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InterestSelector from '../../components/dashboard/InterestSelector';
import QuestTracker from '../../components/dashboard/QuestTracker';
import Leaderboard from '../../components/dashboard/Leaderboard';
import AiMentor from '../../components/dashboard/AiMentor';
import SlackSettings from '../../components/dashboard/SlackSettings';
import { DashboardCardSkeleton } from '../../components/ui/skeleton/DashboardCardSkeleton';
import { buildUrl, getAiApiBase, getApiBase } from '../../utils/runtimeConfig';
import { useTheme } from '../../hooks/useTheme';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { STORAGE_KEYS } from '../../utils/storageKeys';

export default function DashboardPage({ onBack }) {
  const [currentUser] = useState({ id: 'user_123', name: 'Explorer' });
  const [interests, setInterests] = useState([]);
  const [quests, setQuests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeframe, setTimeframe] = useState('all');
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const isDemoMode = !getApiBase();

  useEffect(() => {
    setQuests([
      {
        id: 'q1',
        title: 'Complete AI Review',
        description: 'Submit code to the AI Mentor.',
        xpReward: 100,
        completed: false,
      },
      {
        id: 'q2',
        title: 'Select Interests',
        description: 'Choose at least 3 tech interests.',
        xpReward: 50,
        completed: false,
      },
    ]);
  }, []);

  useEffect(() => {
    // Simulated data based on timeframe
    const data = {
      all: [
        { id: 'u1', userId: 'user_123', username: 'Explorer', xp: 450, level: 3, streak: 5 },
        { id: 'u2', userId: 'user_456', username: 'TechNinja', xp: 850, level: 5, streak: 12 },
        { id: 'u3', userId: 'user_789', username: 'CodeMaster', xp: 320, level: 2, streak: 0 },
      ].sort((a, b) => b.xp - a.xp),
      week: [
        { id: 'u2', userId: 'user_456', username: 'TechNinja', xp: 200, level: 5, streak: 12 },
      ],
      month: [{ id: 'u1', userId: 'user_123', username: 'Explorer', xp: 350, level: 3, streak: 5 }],
    };
    setLeaderboard(data[timeframe] || data.all);
  }, [timeframe]);

  const toggleInterest = (domain) => {
    setInterests((prev) => {
      const newInterests = prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain];
      if (newInterests.length >= 3) completeQuest('q2');
      return newInterests;
    });
  };

  const completeQuest = (questId) => {
    setQuests((prev) => prev.map((q) => (q.id === questId ? { ...q, completed: true } : q)));
  };

  const fetchRecommendations = async () => {
    if (interests.length === 0) return;
    setLoadingRecs(true);
    try {
      const recommendationsUrl = buildUrl(getAiApiBase(), `/recommend/events/${currentUser.id}`);
      if (recommendationsUrl) {
        const res = await fetch(recommendationsUrl);
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data.recommended_events || []);
        }
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('[DashboardPage] Failed to fetch recommendations:', e.message);
      }
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchRecommendations(), 1000);
    return () => clearTimeout(timer);
  }, [interests]);

  return (
    <div
      className="dashboard-page"
      style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--t1)' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            background: 'linear-gradient(90deg, #fff, var(--c1))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome back, {currentUser.name}
        </h1>
        {onBack && (
          <button
            onClick={onBack}
            className="btn"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--b2)',
              color: 'var(--t1)',
            }}
          >
            Home
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              background: 'var(--bg-glass)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--b2)',
            }}
          >
            <InterestSelector selectedInterests={interests} onToggleInterest={toggleInterest} />
          </div>
          <div
            style={{
              background: 'var(--bg-glass)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--b2)',
            }}
          >
            <h3
              style={{
                marginBottom: '12px',
                color: 'var(--t1)',
                fontFamily: 'Orbitron, sans-serif',
              }}
            >
              Theme Settings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>
                Choose your appearance preference:
              </span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={() => setTheme('light')}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: currentTheme === 'light' ? 'var(--c1)' : 'rgba(255,255,255,0.04)',
                    color: currentTheme === 'light' ? '#fff' : 'var(--t1)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: currentTheme === 'light' ? '700' : '500',
                  }}
                  onMouseOver={(e) => {
                    if (currentTheme !== 'light')
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseOut={(e) => {
                    if (currentTheme !== 'light')
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: currentTheme === 'dark' ? 'var(--c1)' : 'rgba(255,255,255,0.04)',
                    color: currentTheme === 'dark' ? '#fff' : 'var(--t1)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: currentTheme === 'dark' ? '700' : '500',
                  }}
                  onMouseOver={(e) => {
                    if (currentTheme !== 'dark')
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseOut={(e) => {
                    if (currentTheme !== 'dark')
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                >
                  Dark
                </button>
                <button
                  onClick={() => setTheme('system')}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: currentTheme === 'system' ? 'var(--c1)' : 'rgba(255,255,255,0.04)',
                    color: currentTheme === 'system' ? '#fff' : 'var(--t1)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: currentTheme === 'system' ? '700' : '500',
                  }}
                  onMouseOver={(e) => {
                    if (currentTheme !== 'system')
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseOut={(e) => {
                    if (currentTheme !== 'system')
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                >
                  System
                </button>
              </div>
            </div>

            {/* Admin Integrations Card */}
            {(currentUser.role === 'admin' ||
              currentUser.role === 'SuperAdmin' ||
              currentUser.role === 'faculty') && (
              <div
                style={{
                  background: 'var(--bg-glass)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(204,17,17,0.15)',
                  marginTop: '20px',
                }}
              >
                <h3
                  style={{
                    marginBottom: '12px',
                    fontSize: '1.05rem',
                    color: 'var(--t1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  ⚙️ Admin Integrations
                </h3>
                <button
                  onClick={() => navigate('/admin/webhooks')}
                  style={{
                    width: '100%',
                    background: 'rgba(204,17,17,0.15)',
                    border: '1px solid var(--c1)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Manage Webhooks
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              background: 'var(--bg-glass)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--b2)',
            }}
          >
            <h3 style={{ marginBottom: '16px', color: 'var(--t1)' }}>
              Personalized Recommendations
            </h3>
            {interests.length === 0 ? (
              <p style={{ color: 'var(--t2)' }}>Select interests to see recommendations!</p>
            ) : loadingRecs ? (
              <DashboardCardSkeleton />
            ) : (
              recommendations.map((rec, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--c1-50)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: 'var(--c1)' }}>{rec.title}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {isDemoMode && (
            <p style={{ color: '#f59e0b', fontSize: '0.8rem' }}>⚠ Demo mode — sample data only.</p>
          )}
          <QuestTracker quests={quests} onCompleteQuest={completeQuest} />
          <Leaderboard
            users={leaderboard}
            currentUserId={currentUser.id}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <AiMentor />
        </div>
      </div>

      <SlackSettings currentUser={currentUser} authUser={authUser} />
    </div>
  );
}
