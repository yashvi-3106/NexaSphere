import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * RevenueDashboardPage
 *
 * Admin-only revenue analytics dashboard for the dynamic pricing engine.
 * Shows per-event revenue estimates, pricing tier breakdown, capacity utilization,
 * revenue uplift vs baseline, and a summary of all events.
 */
export default function RevenueDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`${API_BASE}/api/pricing/analytics/all`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAnalytics(data.analytics || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  // Aggregate totals
  const totals = (analytics || []).reduce(
    (acc, e) => ({
      revenue: acc.revenue + (e.revenueEstimate || 0),
      baseline: acc.baseline + (e.baselineRevenue || 0),
      uplift: acc.uplift + (e.revenueUplift || 0),
      registrations: acc.registrations + (e.registrations || 0),
    }),
    { revenue: 0, baseline: 0, uplift: 0, registrations: 0 }
  );

  if (loading) {
    return (
      <div style={styles.page}>
        <h1 style={styles.heading}>Revenue Analytics Dashboard</h1>
        <div style={styles.loadingGrid}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={styles.skeletonCard} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <h1 style={styles.heading}>Revenue Analytics Dashboard</h1>
        <div style={styles.errorBox}>
          <span>⚠️</span> Failed to load analytics: {error}
        </div>
      </div>
    );
  }

  if (!analytics || analytics.length === 0) {
    return (
      <div style={styles.page}>
        <h1 style={styles.heading}>Revenue Analytics Dashboard</h1>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📊</div>
          <p style={styles.emptyText}>No pricing data configured yet.</p>
          <p style={styles.emptySubtext}>
            Set up dynamic pricing for events via{' '}
            <code>POST /api/pricing/config/:eventId</code> to see analytics here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.heading}>Revenue Analytics Dashboard</h1>
          <p style={styles.subheading}>
            Dynamic pricing performance across {analytics.length} event
            {analytics.length !== 1 ? 's' : ''}
          </p>
        </div>
        <span style={styles.badge}>Admin Only</span>
      </header>

      {/* ── Summary KPI Cards ── */}
      <div style={styles.kpiGrid}>
        <KpiCard
          label="Total Revenue Estimate"
          value={`₹${totals.revenue.toLocaleString()}`}
          sub={`₹${totals.baseline.toLocaleString()} baseline`}
          color="var(--color-primary, #6366f1)"
          icon="💰"
        />
        <KpiCard
          label="Revenue Uplift"
          value={`₹${totals.uplift.toLocaleString()}`}
          sub="vs base pricing"
          color={totals.uplift >= 0 ? '#10b981' : '#ef4444'}
          icon={totals.uplift >= 0 ? '📈' : '📉'}
        />
        <KpiCard
          label="Total Registrations"
          value={totals.registrations.toLocaleString()}
          sub="across all priced events"
          color="#f59e0b"
          icon="🎟️"
        />
        <KpiCard
          label="Events with Pricing"
          value={analytics.length}
          sub="actively tracked"
          color="#8b5cf6"
          icon="🗓️"
        />
      </div>

      {/* ── Per-Event Table ── */}
      <section style={styles.tableSection}>
        <h2 style={styles.sectionTitle}>Per-Event Breakdown</h2>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <Th>Event ID</Th>
                <Th>Base Price</Th>
                <Th>Current Price</Th>
                <Th>Registrations</Th>
                <Th>Capacity</Th>
                <Th>Revenue Estimate</Th>
                <Th>Uplift</Th>
              </tr>
            </thead>
            <tbody>
              {analytics.map((event, idx) => {
                const uplift = event.revenueUplift || 0;
                const isPositive = uplift >= 0;
                return (
                  <tr key={event.eventId} style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={styles.td}>
                      <code style={styles.eventId}>{event.eventId}</code>
                    </td>
                    <td style={styles.td}>₹{(event.basePrice || 0).toLocaleString()}</td>
                    <td style={{ ...styles.td, fontWeight: 700 }}>
                      ₹{(event.currentPrice || 0).toLocaleString()}
                    </td>
                    <td style={styles.td}>{event.registrations || 0}</td>
                    <td style={styles.td}>
                      <UtilizationBadge pct={event.capacityUtilization || 0} />
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>
                      ₹{(event.revenueEstimate || 0).toLocaleString()}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        color: isPositive ? '#10b981' : '#ef4444',
                        fontWeight: 600,
                      }}
                    >
                      {isPositive ? '+' : ''}₹{uplift.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Pricing Tier Legend ── */}
      <section style={styles.legendSection}>
        <h2 style={styles.sectionTitle}>Pricing Tier Reference</h2>
        <div style={styles.legendGrid}>
          {TIER_LEGEND.map((t) => (
            <div key={t.label} style={styles.legendCard}>
              <span style={styles.legendIcon}>{t.icon}</span>
              <div>
                <div style={styles.legendLabel}>{t.label}</div>
                <div style={styles.legendDesc}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, icon }) {
  return (
    <div style={{ ...styles.kpiCard, borderTop: `4px solid ${color}` }}>
      <div style={styles.kpiIcon}>{icon}</div>
      <div style={{ ...styles.kpiValue, color }}>{value}</div>
      <div style={styles.kpiLabel}>{label}</div>
      <div style={styles.kpiSub}>{sub}</div>
    </div>
  );
}

function Th({ children }) {
  return <th style={styles.th}>{children}</th>;
}

function UtilizationBadge({ pct }) {
  const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981';
  return (
    <span
      style={{
        background: `${color}1a`,
        color,
        border: `1px solid ${color}40`,
        borderRadius: 6,
        padding: '2px 8px',
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {pct}%
    </span>
  );
}

// ── Static data ───────────────────────────────────────────────────────────────

const TIER_LEGEND = [
  { icon: '🐦', label: 'Early Bird (−20%)', desc: '>30 days before event' },
  { icon: '🎯', label: 'Standard Rate (0%)', desc: '15–30 days before event' },
  { icon: '⚡', label: 'Last Minute (+20%)', desc: '3–15 days before event' },
  { icon: '🔥', label: 'Final Days (+50%)', desc: '<3 days before event' },
  { icon: '📈', label: 'High Demand +10%', desc: '≥80% capacity filled' },
  { icon: '🚨', label: 'Almost Full +25%', desc: '≥95% capacity filled' },
  { icon: '💸', label: 'Low Demand −15%', desc: '≤20% capacity filled' },
  { icon: '🎁', label: 'Loyalty Discount −10%', desc: 'Returning attendees (3+ past events)' },
];

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  page: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '2rem 1.5rem',
    fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    color: 'var(--color-text, #1f2937)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  heading: {
    fontSize: '1.75rem',
    fontWeight: 800,
    margin: '0 0 0.25rem',
    color: 'var(--color-heading, #111827)',
  },
  subheading: {
    fontSize: '0.95rem',
    color: 'var(--color-muted, #6b7280)',
    margin: 0,
  },
  badge: {
    background: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: 8,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2.5rem',
  },
  kpiCard: {
    background: 'var(--color-surface, #fff)',
    border: '1px solid var(--color-border, #e5e7eb)',
    borderRadius: 12,
    padding: '1.25rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  kpiIcon: { fontSize: '1.5rem', marginBottom: '0.5rem' },
  kpiValue: { fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 },
  kpiLabel: { fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' },
  kpiSub: { fontSize: '0.8rem', color: '#9ca3af', marginTop: 2 },
  tableSection: { marginBottom: '2.5rem' },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: 'var(--color-heading, #111827)',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: 10,
    border: '1px solid var(--color-border, #e5e7eb)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  theadRow: { background: 'var(--color-surface-alt, #f9fafb)' },
  th: {
    padding: '10px 14px',
    textAlign: 'left',
    fontWeight: 700,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#6b7280',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap',
  },
  td: { padding: '11px 14px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
  rowEven: { background: '#fff' },
  rowOdd: { background: '#fafafa' },
  eventId: { background: '#f3f4f6', borderRadius: 4, padding: '2px 6px', fontSize: '0.8rem', fontFamily: 'monospace' },
  legendSection: {},
  legendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '0.75rem',
  },
  legendCard: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
    background: 'var(--color-surface, #fff)',
    border: '1px solid var(--color-border, #e5e7eb)',
    borderRadius: 10,
    padding: '0.85rem',
  },
  legendIcon: { fontSize: '1.25rem', flexShrink: 0 },
  legendLabel: { fontWeight: 700, fontSize: '0.88rem' },
  legendDesc: { color: '#6b7280', fontSize: '0.8rem', marginTop: 2 },
  loadingGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' },
  skeletonCard: { height: 120, background: '#f3f4f6', borderRadius: 12, animation: 'pulse 1.5s infinite' },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 10,
    padding: '1rem 1.25rem',
    color: '#b91c1c',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  emptyState: { textAlign: 'center', padding: '4rem 2rem' },
  emptyIcon: { fontSize: '3rem', marginBottom: '1rem' },
  emptyText: { fontSize: '1.1rem', fontWeight: 600, color: '#374151', margin: '0 0 0.5rem' },
  emptySubtext: { color: '#6b7280', fontSize: '0.9rem' },
};
