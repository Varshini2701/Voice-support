import React, { useState, useEffect } from 'react';
import type { Sentiment, Department } from '../utils/SentimentEngine';
import type { Ticket } from '../types/Ticket';

interface DashboardProps {
  currentSentiment: Sentiment;
  currentDept: Department;
  language: string;
  isOnTrack: boolean;
  tickets: Ticket[];
  onResolveTicket: (id: string, duration: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  currentSentiment, 
  currentDept, 
  language, 
  isOnTrack,
  tickets,
  onResolveTicket
}) => {
  const [resolutionTime, setResolutionTime] = useState(0);
  const [active, setActive] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Main interaction session timer
  useEffect(() => {
    let interval: any;
    if (active) {
      interval = setInterval(() => {
        setResolutionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [active]);

  // Tick timer for open tickets
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Start session timer when a department is assigned
  useEffect(() => {
    if (currentDept !== 'None') {
      setActive(true);
    }
  }, [currentDept]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityClass = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'Critical': return 'badge-angry';
      case 'High': return 'badge-warning';
      case 'Medium': return 'badge-neutral';
      default: return 'badge-success';
    }
  };

  return (
    <div className="sidebar">
      {/* 1. Active Call Metrics */}
      <div className="glass-card">
        <h3>Live Session</h3>
        <div className="stat-item">
          <span>Language:</span>
          <span style={{ fontWeight: 700 }}>{language}</span>
        </div>
        <div className="stat-item">
          <span>Sentiment:</span>
          <span className={`status-badge badge-${currentSentiment === 'angry' ? 'angry' : currentSentiment === 'unsatisfied' ? 'angry' : 'neutral'}`}>
            {currentSentiment}
          </span>
        </div>
        <div className="stat-item">
          <span>Department:</span>
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{currentDept}</span>
        </div>
        <div className="stat-item">
          <span>Customer Track:</span>
          <span className={`status-badge ${isOnTrack ? 'badge-success' : 'badge-angry'}`}>
            {isOnTrack ? 'On Track' : 'Off Track'}
          </span>
        </div>
      </div>

      {/* 2. Session Efficiency */}
      <div className="glass-card">
        <h3>Active Call Timer</h3>
        <div className="stat-item">
          <span>Resolution Time:</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
            {formatTime(resolutionTime)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
          <div style={{ fontSize: '2rem' }}>
            {currentSentiment === 'happy' ? '⭐️⭐️⭐️⭐️⭐️' : 
             currentSentiment === 'angry' ? '⭐️' : 
             currentSentiment === 'unsatisfied' ? '⭐️⭐️' : '⭐️⭐️⭐️⭐️'}
          </div>
        </div>
      </div>

      {/* 3. Real-time Ticket Routing & Queue */}
      <div className="glass-card">
        <h3>Ticket Queue ({tickets.filter(t => t.status !== 'Resolved').length} Active)</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Real-time tracking of tasks routed to support agents:
        </p>

        <div className="ticket-list">
          {tickets.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' }}>
              No tickets created yet.
            </div>
          ) : (
            tickets.map((tkt) => {
              const isOpen = tkt.status !== 'Resolved';
              const elapsedSeconds = isOpen 
                ? Math.floor((now - tkt.startTime) / 1000) 
                : tkt.resolutionTime || 0;

              return (
                <div key={tkt.id} className="ticket-card" style={{ marginBottom: '1rem' }}>
                  <div className="ticket-card-header">
                    <span className="ticket-id">{tkt.id}</span>
                    <span className={`status-badge ${getPriorityClass(tkt.priority)}`}>
                      {tkt.priority}
                    </span>
                  </div>
                  
                  <div className="ticket-card-body">
                    <p className="ticket-desc">"{tkt.description}"</p>
                    <div className="ticket-detail-row">
                      <span>👤 {tkt.assignedAgent}</span>
                      <span className="ticket-elapsed">🕒 {formatTime(elapsedSeconds)}</span>
                    </div>
                  </div>

                  <div className="ticket-card-footer">
                    {isOpen ? (
                      <button 
                        className="resolve-btn"
                        onClick={() => onResolveTicket(tkt.id, elapsedSeconds)}
                      >
                        ✔ Resolve Task
                      </button>
                    ) : (
                      <span className="resolved-status">✅ Resolved in {formatTime(elapsedSeconds)}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

