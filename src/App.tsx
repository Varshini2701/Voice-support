import { useState } from 'react';
import { VoiceAssistant } from './components/VoiceAssistant';
import { Dashboard } from './components/Dashboard';
import type { Sentiment, Department } from './utils/SentimentEngine';
import type { Ticket } from './types/Ticket';

function App() {
  const [state, setState] = useState({
    sentiment: 'neutral' as Sentiment,
    department: 'None' as Department,
    language: 'English',
    isOnTrack: true
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const handleUpdate = (newData: any) => {
    setState((prev: any) => ({ ...prev, ...newData }));
  };

  const handleTicketCreated = (newTicket: Ticket) => {
    setTickets(prev => [newTicket, ...prev]);
  };

  const handleResolveTicket = (ticketId: string, duration: number) => {
    setTickets(prev => prev.map(tkt => {
      if (tkt.id === ticketId) {
        return {
          ...tkt,
          status: 'Resolved' as const,
          resolutionTime: duration
        };
      }
      return tkt;
    }));
  };

  return (
    <div className="app-container">
      <main>
        <VoiceAssistant 
          onUpdate={handleUpdate} 
          onTicketCreated={handleTicketCreated}
        />
        
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
        tickets={tickets}
        onResolveTicket={handleResolveTicket}
      />
    </div>
  );
}

export default App;

