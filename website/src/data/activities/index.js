// ── NexaSphere Activity Pages — Master Index ──
// Each activity lives in its own file.
// To add a new activity: create a new file here, import it, and add it to activityPages.
// To update an activity's events: edit ONLY that activity's file.

import hackathon from './hackathon';
import codathon from './codathon';
import ideathon from './ideathon';
import promptathon from './promptathon';
import workshop from './workshop';
import insightSession from './insightSession';
import openSourceDay from './openSourceDay';
import techDebate from './techDebate';

// Keys must exactly match the activity title in src/data/activitiesData.js
export const activityPages = {
  Hackathon: hackathon,
  Codathon: codathon,
  Ideathon: ideathon,
  Promptathon: promptathon,
  Workshop: workshop,
  'Insight Session': insightSession,
  'Open Source Day': openSourceDay,
  'Tech Debate': techDebate,
};

export const activities = [
  {
    ...hackathon,
    id: 1,
    difficultyLevel: 'intermediate',
    chips: ['Team Event', 'Coding', 'Innovation', 'Prizes'],
    features: [
      '24–48 hour team sprints',
      'Real-world problem statements',
      'Mentors & technical support',
      'Cash prizes & certificates',
    ],
  },
  {
    ...codathon,
    id: 2,
    difficultyLevel: 'advanced',
    chips: ['Competitive', 'Algorithms', 'DSA', 'Leaderboard'],
    features: [
      'Multi-round elimination format',
      'Ranked on speed & correctness',
      'Beginner to advanced tracks',
      'Platform: Codeforces / LeetCode',
    ],
  },
  {
    ...ideathon,
    id: 3,
    difficultyLevel: 'beginner',
    chips: ['No-Code', 'Creativity', 'Pitching', 'Strategy'],
    features: [
      'Open to all branches',
      'Pitch to a panel of judges',
      'Ideation + prototype rounds',
      'Best idea wins recognition',
    ],
  },
  {
    ...promptathon,
    id: 4,
    difficultyLevel: 'beginner',
    chips: ['Prompt Engineering', 'AI Tools', 'Creative Thinking', 'Problem Solving'],
    features: [
      'Multi-round prompt battles',
      'Judged on creativity & accuracy',
      'Real-world AI tasks',
      'Leaderboard & prizes',
    ],
  },
  {
    ...workshop,
    id: 5,
    difficultyLevel: 'beginner',
    chips: ['New Technologies', 'Practical Skills', 'Tool Mastery', 'Applied Learning'],
    features: [
      'Live coding sessions',
      'Take-home projects',
      'Q&A with experts',
      'Beginner to advanced tracks',
    ],
  },
  {
    ...insightSession,
    id: 6,
    difficultyLevel: 'beginner',
    chips: ['Career', 'Industry Trends', 'Panels', 'Networking'],
    features: [
      'Expert & alumni speakers',
      'Interactive Q&A sessions',
      'Career roadmap guidance',
      'Both online & offline formats',
    ],
  },
  {
    ...openSourceDay,
    id: 7,
    difficultyLevel: 'beginner',
    chips: ['Git', 'Open Source', 'Code Review', 'Documentation'],
    features: [
      'First-PR guidance',
      'Project selection help',
      'Git & GitHub deep dive',
      'Community recognition',
    ],
  },
  {
    ...techDebate,
    id: 8,
    difficultyLevel: 'intermediate',
    chips: ['Public Speaking', 'Critical Thinking', 'Tech Topics', 'Audience Vote'],
    features: [
      'Structured Oxford-style format',
      'Expert & peer judging',
      'Both sides argued fairly',
      'Audience participation & vote',
    ],
  },
];

export const difficultyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];
