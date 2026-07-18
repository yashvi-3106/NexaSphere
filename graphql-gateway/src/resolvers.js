import fetch from 'node-fetch';

const SERVER_BASE_URL = process.env.NEXASPHERE_SERVER_URL || 'http://localhost:8787';

export const resolvers = {
  Query: {
    events: async (_parent, { page, limit, status }) => {
      const params = new URLSearchParams({ page, limit, ...(status ? { status } : {}) });
      const res = await fetch(`${SERVER_BASE_URL}/api/content/events?${params}`);
      if (!res.ok) {
        throw new Error(`Upstream events API returned ${res.status}`);
      }
      return res.json();
    },
    event: async (_parent, { id }) => {
      const res = await fetch(`${SERVER_BASE_URL}/api/content/events?limit=100`);
      if (!res.ok) {
        throw new Error(`Upstream events API returned ${res.status}`);
      }
      const data = await res.json();
      return data.events.find((e) => String(e.id) === String(id)) || null;
    },
  },
};
