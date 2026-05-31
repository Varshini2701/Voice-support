import React, { useEffect, useState } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import type { Sentiment, Department } from '../utils/SentimentEngine';
import { analyzeTranscript } from '../utils/SentimentEngine';

interface VoiceAssistantProps {
  onUpdate: (data: { sentiment: Sentiment, department: Department, language: string, isOnTrack: boolean }) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onUpdate }) => {
  const { isListening, transcript, error, startListening, speak } = useSpeech();
  const [displayText, setDisplayText] = useState('Click to start conversation...');

  useEffect(() => {
    if (transcript) {
      const result = analyzeTranscript(transcript);
      onUpdate(result);
      
      if (!isListening) {
        handleResolution(result);
      }
    }
  }, [transcript, isListening]);

  const handleResolution = (result: any) => {
    let response = `I understand you are having an issue. `;
    
    if (result.department !== 'None') {
      response += `Transferring you to the ${result.department} department.`;
    } else {
      response += `Could you please tell me more about your concern so I can help best?`;
    }

    if (result.sentiment === 'angry') {
      response = "I apologize for the frustration. I am immediately transferring you to our Senior Manager.";
    }

    setDisplayText(response);
    speak(response);
  };

  const toggleListening = () => {
    if (!isListening) {
      setDisplayText('Listening...');
      startListening();
    }
  };

  return (
    <div className="glass-card voice-section">
      <h1 className="gradient-text">Voice Support AI</h1>
      <div className={`visualizer-ring ${isListening ? 'active' : ''}`}>
        <img 
          src="/ai_support_mascot.png" 
          alt="AI Mascot" 
          style={{ width: '80%', height: '80%', borderRadius: '50%', objectFit: 'cover', zIndex: 1 }} 
        />
      </div>
      
      <button className="btn" onClick={toggleListening} disabled={isListening}>
        {isListening ? 'Analyzing...' : 'Start Query'}
      </button>

      <div className="transcript-area">
        {transcript || displayText}
      </div>

      {error && <div style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</div>}
    </div>
  );
};
