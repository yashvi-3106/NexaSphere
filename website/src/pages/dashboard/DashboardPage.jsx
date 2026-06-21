import React, { useState, useEffect } from 'react';
import InterestSelector from '../../components/dashboard/InterestSelector';
import QuestTracker from '../../components/dashboard/QuestTracker';
import Leaderboard from '../../components/dashboard/Leaderboard';
import AiMentor from '../../components/dashboard/AiMentor';
import { buildUrl, getAiApiBase, getApiBase } from '../../utils/runtimeConfig';

function DashboardCardSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skeleton-${i}`}
          style={{
            padding: '12px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        >
          <div
            style={{
              height: '16px',
              width: '60%',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              marginBottom: '8px',
            }}
          />
          <div
            style={{
              height: '12px',
              width: '40%',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
            }}
          />
        </div>
      ))}
    </div>
  );
}

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
        { id: 'u1', userId: 'user_123', username: 'Explorer', xp: 450, level: 3 },
        { id: 'u2', userId: 'user_456', username: 'TechNinja', xp: 850, level: 5 },
        { id: 'u3', userId: 'user_789', username: 'CodeMaster', xp: 320, level: 2 },
      ].sort((a, b) => b.xp - a.xp),
      week: [{ id: 'u2', userId: 'user_456', username: 'TechNinja', xp: 200, level: 5 }],
      month: [{ id: 'u1', userId: 'user_123', username: 'Explorer', xp: 350, level: 3 }],
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
      console.error(e);
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
    </div>
  );
}
