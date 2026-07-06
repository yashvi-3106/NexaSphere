// website/src/pages/MentorshipOnboarding.jsx
import React, { useState } from 'react';

export default function MentorshipOnboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: 'mentee',
    skills: [],
    timezone: '',
    communicationStyle: '',
    availability: [],
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div
      className="onboarding-container"
      style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}
    >
      <h2>Mentorship Program Profile Setup</h2>

      {step === 1 && (
        <div>
          <h3>Step 1: Choose Your Role</h3>
          <button
            onClick={() => setFormData({ ...formData, role: 'mentor' })}
            style={{ border: formData.role === 'mentor' ? '2px solid green' : '1px solid ccc' }}
          >
            Mentor
          </button>
          <button
            onClick={() => setFormData({ ...formData, role: 'mentee' })}
            style={{ border: formData.role === 'mentee' ? '2px solid green' : '1px solid ccc' }}
          >
            Mentee
          </button>
          <br />
          <button onClick={nextStep} style={{ marginTop: '1rem' }}>
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>Step 2: Skills & Core Preferences</h3>
          <input
            type="text"
            placeholder="e.g. React, Node.js, Python (comma separated)"
            onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',') })}
          />
          <br />
          <button onClick={prevStep}>Back</button>
          <button onClick={nextStep} style={{ marginLeft: '1rem' }}>
            Next
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3>Step 3: Setup Logistics</h3>
          <select onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}>
            <option value="">Select Timezone</option>
            <option value="IST">IST (UTC +5:30)</option>
            <option value="EST">EST (UTC -5:00)</option>
          </select>
          <br />
          <button onClick={prevStep}>Back</button>
          <button
            onClick={() => alert('Profile Setup Complete!')}
            style={{ marginLeft: '1rem', backgroundColor: 'green', color: '#fff' }}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
