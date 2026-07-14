// admin-dashboard/src/components/StatsGrid.jsx
// Grid of stat cards shown on the admin dashboard home page

import { StatCard } from './StatCard';
import { useAdminStats } from '../hooks/useAdminStats';

export function StatsGrid() {
  const { stats, loading, error } = useAdminStats();

  if (error) {
    return (
      <div className="stats-error" role="alert">
        ⚠️ Could not load platform stats: {error}
      </div>
    );
  }

  return (
    <section className="stats-grid" aria-label="Platform statistics">
      <StatCard icon="📅" label="Active Events" value={stats?.activeEvents} loading={loading} />
      <StatCard icon="📋" label="Total Events" value={stats?.totalEvents} loading={loading} />
      <StatCard
        icon="👥"
        label="Core Team Members"
        value={stats?.totalTeamMembers}
        loading={loading}
      />
      <StatCard
        icon="📨"
        label="Pending Memberships"
        value={stats?.pendingMemberships}
        highlight
        loading={loading}
      />
      <StatCard
        icon="📝"
        label="Pending Recruitments"
        value={stats?.pendingRecruitments}
        highlight
        loading={loading}
      />
      <StatCard
        icon="📊"
        label="Total Applications"
        value={stats?.totalApplications}
        loading={loading}
      />
    </section>
  );
}
