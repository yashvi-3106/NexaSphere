import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SYSTEM_CATEGORIES = [
  'Workshop',
  'Hackathon',
  'Guest Speaker',
  'Social Event',
  'Study Session',
];

export default function TemplateLibrary() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch templates from the Express backend API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        // Using relative path or appending VITE_API_BASE matching your Axios/fetch global setup
        const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:8787';
        const response = await fetch(`${baseUrl}/api/templates?search=${search}`);
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchTemplates();
    }, 300); // 300ms Debounce to prevent rapid API hammering

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Filter local state by selected category tab
  const filteredTemplates = templates.filter(
    (t) =>
      selectedCategory === 'All' || t.category?.toLowerCase() === selectedCategory.toLowerCase()
  );

  const handleUseTemplate = (template) => {
    // Navigate to Create Event page while transferring the template configurations via React Router state
    navigate('/create-event', { state: { template } });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Event Template Library</h1>
      <p className="text-gray-600 mb-6">
        Clone pre-configured structures to rapidly launch your next activity.
      </p>

      {/* Search & Category Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <input
          type="text"
          placeholder="Search templates by title or category..."
          className="w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['All', ...SYSTEM_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Dashboard Layout */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading templates...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No matching templates found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 uppercase">
                    {template.category || 'General'}
                  </span>
                  {template.isSystem && (
                    <span className="text-xs text-gray-400 font-medium">System Default</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{template.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{template.description}</p>
              </div>

              <button
                onClick={() => setSelectedTemplate(template)}
                className="w-full mt-4 text-center border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 rounded-lg transition-colors text-sm"
              >
                Preview Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🔍 Preview Modal Overlay Component */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 relative shadow-xl">
            <h2 className="text-2xl font-bold mb-1">{selectedTemplate.title}</h2>
            <p className="text-sm text-blue-600 mb-4 font-medium uppercase tracking-wider">
              {selectedTemplate.category}
            </p>

            <hr className="mb-4" />

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Base Description Template
                </h4>
                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {selectedTemplate.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex gap-6 text-sm">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    Est. Duration
                  </h4>
                  <p className="font-semibold text-gray-900">
                    {selectedTemplate.defaultDuration
                      ? `${selectedTemplate.defaultDuration} mins`
                      : 'Flexible'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    Target Capacity
                  </h4>
                  <p className="font-semibold text-gray-900">
                    {selectedTemplate.defaultCapacity || 'Unlimited'}
                  </p>
                </div>
              </div>

              {/* Recommended Pre-Event Checklists rendering */}
              {selectedTemplate.checklist && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Recommended Checklist
                  </h4>
                  <ul className="space-y-1.5">
                    {JSON.parse(JSON.stringify(selectedTemplate.checklist)).map((task, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">✓</span> {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const template = selectedTemplate;
                  setSelectedTemplate(null);
                  handleUseTemplate(template);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm shadow-sm"
              >
                Use & Clone Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
