import React, { useState, useEffect } from 'react';
import type { Sentiment, Department } from '../utils/SentimentEngine';

interface DashboardProps {
  currentSentiment: Sentiment;
  currentDept: Department;
  language: string;
  isOnTrack: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentSentiment, currentDept, language, isOnTrack }) => {
  const [resolutionTime, setResolutionTime] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (active) {
      interval = setInterval(() => {
        setResolutionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [active]);

  // Start timer when a department is assigned
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

  return (
    <div className="sidebar">
      <div className="glass-card">
        <h3>Live Monitoring</h3>
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

      <div className="glass-card">
        <h3>Efficiency Indices</h3>
        <div className="stat-item">
          <span>Resolution Time:</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
            {formatTime(resolutionTime)}
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          * Target resolution time: &lt; 5:00 mins
        </p>
      </div>

      <div className="glass-card">
        <h3>Satisfaction Score</h3>
        <div style={{ fontSize: '2rem', textAlign: 'center', margin: '1rem 0' }}>
          {currentSentiment === 'happy' ? '⭐️⭐️⭐️⭐️⭐️' : 
           currentSentiment === 'angry' ? '⭐️' : 
           currentSentiment === 'unsatisfied' ? '⭐️⭐️' : '⭐️⭐️⭐️⭐️'}
        </div>
      </div>
    </div>
  );
};
