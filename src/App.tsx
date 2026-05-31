import { useState } from 'react';
import { VoiceAssistant } from './components/VoiceAssistant';
import { Dashboard } from './components/Dashboard';
import type { Sentiment, Department } from './utils/SentimentEngine';

function App() {
  const [state, setState] = useState({
    sentiment: 'neutral' as Sentiment,
    department: 'None' as Department,
    language: 'English',
    isOnTrack: true
  });

  const handleUpdate = (newData: any) => {
    setState((prev: any) => ({ ...prev, ...newData }));
  };

  return (
    <div className="app-container">
      <main>
        <VoiceAssistant onUpdate={handleUpdate} />
        
        <div className="glass-card" style={{ marginTop: '2rem' }}>
          <h3>Process Overview</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Our AI identifies your language and emotional state in real-time to ensure you are connected to the most suitable expert.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <div className="glass-card" style={{ flex: 1, padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>STEP 1</div>
              <div style={{ fontWeight: 700 }}>Identify Language</div>
            </div>
            <div className="glass-card" style={{ flex: 1, padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>STEP 2</div>
              <div style={{ fontWeight: 700 }}>Sentiment Analysis</div>
            </div>
            <div className="glass-card" style={{ flex: 1, padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>STEP 3</div>
              <div style={{ fontWeight: 700 }}>Smart Routing</div>
            </div>
          </div>
        </div>
      </main>

      <Dashboard 
        currentSentiment={state.sentiment}
        currentDept={state.department}
        language={state.language}
        isOnTrack={state.isOnTrack}
      />
    </div>
  );
}

export default App;
