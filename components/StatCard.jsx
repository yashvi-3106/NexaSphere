// admin-dashboard/src/components/StatCard.jsx
// A single stat card for the admin dashboard home grid

export function StatCard({ icon, label, value, highlight = false, loading = false }) {
  return (
    <div className={`stat-card ${highlight ? 'stat-card--highlight' : ''}`}>
      <div className="stat-card__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="stat-card__body">
        <p className="stat-card__label">{label}</p>
        {loading ? (
          <p className="stat-card__value stat-card__value--loading">—</p>
        ) : (
          <p className="stat-card__value">{value ?? '—'}</p>
        )}
      </div>
    </div>
  );
}
