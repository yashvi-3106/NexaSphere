/**
 * Formats a timestamp as a relative time string (e.g., "5m ago", "2h ago").
 *
 * @param {string|number|Date} timestamp - The timestamp to format.
 * @returns {string} A human-readable relative time string.
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Unknown time';

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }

  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return `${Math.floor(diff / 604800)}w ago`;
}
