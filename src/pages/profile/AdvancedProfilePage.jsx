import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdvancedProfilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get('/api/auth/profile/advanced');
        if (!mounted) return;
        setData(res.data);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.error || e.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24, color: '#fff' }}>
        <p>Loading advanced profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: '#fff' }}>
        <p style={{ color: '#CC1111' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, color: '#fff' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        Advanced Profile (Thin Slice)
      </h1>

      <pre
        style={{
          background: '#111',
          border: '1px solid #222',
          padding: 16,
          borderRadius: 12,
          overflow: 'auto',
          color: '#D1D5DB',
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
