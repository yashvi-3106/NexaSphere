import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AdminIcon } from '../components/AdminIcon';
import { Toast } from '../components/Toast';

export function UserSegmentation() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [graduationYear, setGraduationYear] = useState('');

  const [previewUsers, setPreviewUsers] = useState(null);

  const fetchSegments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/admin/segments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setSegments(data.segments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name) return alert('Name is required');

    const criteria = {};
    if (activityLevel) criteria.activityLevel = activityLevel;
    if (graduationYear) criteria.graduationYear = parseInt(graduationYear, 10);

    try {
      await fetch(`${import.meta.env.VITE_API_BASE}/api/admin/segments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name, description, criteria, auto_update: true }),
      });
      setShowForm(false);
      setName('');
      setDescription('');
      setActivityLevel('');
      setGraduationYear('');
      fetchSegments();
    } catch (e) {
      alert('Failed to save segment');
    }
  };

  const handlePreview = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/admin/segments/${id}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setPreviewUsers(data.users);
    } catch (e) {
      alert('Preview failed');
    }
  };

  const triggerAutoSegment = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE}/api/admin/segments/auto/trigger`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Auto-segmentation job triggered successfully');
    } catch (e) {
      alert('Failed to trigger job');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="page bg-gray-50 min-h-screen p-8 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Segments</h2>
        <div className="flex gap-2">
          <button
            onClick={triggerAutoSegment}
            className="bg-green-600 text-white px-4 py-2 rounded shadow"
          >
            Run Auto-Segmentation
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow"
          >
            + New Segment
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h3 className="font-bold mb-4">Create New Segment</h3>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="w-full border p-2 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                className="w-full border p-2 rounded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Activity Level</label>
              <select
                className="w-full border p-2 rounded"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
              >
                <option value="">Any</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Graduation Year</label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g. 2026"
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-600 px-4 py-2"
              >
                Cancel
              </button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {segments.map((seg) => (
          <div
            key={seg.id}
            className="bg-white p-6 rounded-lg shadow-sm border flex justify-between items-center"
          >
            <div>
              <h4 className="font-bold text-lg">{seg.name}</h4>
              <p className="text-sm text-gray-500 mb-2">{seg.description}</p>
              <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded inline-block">
                Criteria: {JSON.stringify(seg.criteria)}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePreview(seg.id)}
                className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50"
              >
                Preview Users
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewUsers && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Segment Preview ({previewUsers.length} Users)</h3>
            <button
              onClick={() => setPreviewUsers(null)}
              className="text-gray-500 hover:text-gray-800"
            >
              &times; Close
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 border-b">ID</th>
                  <th className="p-2 border-b">Name</th>
                  <th className="p-2 border-b">Email</th>
                </tr>
              </thead>
              <tbody>
                {previewUsers.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="p-2 text-gray-500 font-mono text-xs">{u.id}</td>
                    <td className="p-2">{u.full_name || 'N/A'}</td>
                    <td className="p-2">{u.email}</td>
                  </tr>
                ))}
                {previewUsers.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-4 text-center text-gray-500">
                      No users match this segment
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
