import React, { useEffect, useState } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import type { Sentiment, Department } from '../utils/SentimentEngine';
import { analyzeTranscript, getResponseTemplate } from '../utils/SentimentEngine';
import type { Ticket } from '../types/Ticket';

interface VoiceAssistantProps {
  onUpdate: (data: { sentiment: Sentiment, department: Department, language: string, isOnTrack: boolean }) => void;
  onTicketCreated: (ticket: Ticket) => void;
}

interface ChatMessage {
  id: string;
  sender: 'customer' | 'ai';
  text: string;
  language?: string;
  sentiment?: Sentiment;
  department?: Department;
  timestamp: string;
}

const PRESET_QUERIES = [
  { text: "My login password fails and screen gets stuck", label: "💻 Technical (EN)" },
  { text: "I have been double charged on my card and I am angry!", label: "😡 Billing Anger (EN)" },
  { text: "Hola, ¿cómo puedo ver mi factura de este mes?", label: "🇪🇸 Billing (ES)" },
  { text: "Bonjour, je ne suis pas satisfait de votre service client", label: "🇫🇷 Dissatisfaction (FR)" },
  { text: "Hallo, ich möchte eine neue Lizenz kaufen", label: "🇩🇪 Sales (DE)" },
];

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onUpdate, onTicketCreated }) => {
  const { isListening, isSpeaking, transcript, error, startListening, speak, setTranscript } = useSpeech();
  const [displayText, setDisplayText] = useState('Click "Start Query" or select a preset to begin...');
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [currentLang, setCurrentLang] = useState('en-US');

  useEffect(() => {
    if (transcript) {
      const result = analyzeTranscript(transcript);
      onUpdate(result);
      setCurrentLang(result.langCode);
      
      if (!isListening) {
        // Complete the interaction cycle
        handleInteractionComplete(transcript, result);
      }
    }
  }, [transcript, isListening]);

  const handleInteractionComplete = (textInput: string, result: any) => {
    const response = getResponseTemplate(result);
    
    // Add customer query to chat log
    const customerMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'customer',
      text: textInput,
      language: result.language,
      sentiment: result.sentiment,
      department: result.department,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    // Add AI response to chat log
    const aiMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'ai',
      text: response,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setChatLog(prev => [customerMsg, aiMsg, ...prev]);
    setDisplayText(response);
    speak(response, result.langCode);

    // Map Agent
    let agent = "System Triage Bot";
    if (result.department === 'Technical') agent = "Tech Agent Alex";
    else if (result.department === 'Billing') agent = "Billing Agent Clara";
    else if (result.department === 'Sales') agent = "Sales Agent Marcus";
    else if (result.department === 'Support') agent = "Support Agent Ryan";
    else if (result.department === 'Senior Manager') agent = "Senior Manager Sarah";

    // Map Priority
    let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
    if (result.sentiment === 'angry') priority = 'Critical';
    else if (result.sentiment === 'unsatisfied') priority = 'High';

    // Map Status
    const status = result.sentiment === 'angry' ? 'Escalated' : 'Open';

    // Create a new support ticket
    const ticket: Ticket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      description: textInput,
      department: result.department,
      assignedAgent: agent,
      sentiment: result.sentiment,
      priority,
      status,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      startTime: Date.now()
    };

    onTicketCreated(ticket);
  };

  const handlePresetClick = (text: string) => {
    setTranscript(text);
    const result = analyzeTranscript(text);
    onUpdate(result);
    setCurrentLang(result.langCode);
    handleInteractionComplete(text, result);
  };

  const toggleListening = () => {
    if (!isListening) {
      setDisplayText('Listening...');
      startListening(currentLang);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Voice Visualizer Hub */}
      <div className="glass-card voice-section">
        <h1 className="gradient-text">AuraVox Support</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Real-time language, sentiment, and smart department routing system
        </p>

        <div className="visualizer-container">
          <div className={`visualizer-ring ${isListening ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`}>
            <img 
              src="/ai_support_mascot.png" 
              alt="AI Mascot" 
              style={{ width: '80%', height: '80%', borderRadius: '50%', objectFit: 'cover', zIndex: 1 }} 
            />
          </div>

          {/* Waveform Visualization */}
          {(isListening || isSpeaking) && (
            <div className="waveform">
              <span className={`wave-bar ${isListening ? 'listening' : 'speaking'}`}></span>
              <span className={`wave-bar ${isListening ? 'listening' : 'speaking'}`}></span>
              <span className={`wave-bar ${isListening ? 'listening' : 'speaking'}`}></span>
              <span className={`wave-bar ${isListening ? 'listening' : 'speaking'}`}></span>
              <span className={`wave-bar ${isListening ? 'listening' : 'speaking'}`}></span>
              <span className={`wave-bar ${isListening ? 'listening' : 'speaking'}`}></span>
              <span className={`wave-bar ${isListening ? 'listening' : 'speaking'}`}></span>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button className="btn" onClick={toggleListening} disabled={isListening || isSpeaking}>
            {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Start Query'}
          </button>
          
          <select 
            className="language-selector" 
            value={currentLang} 
            onChange={(e) => setCurrentLang(e.target.value)}
            disabled={isListening || isSpeaking}
          >
            <option value="en-US">English (US)</option>
            <option value="es-ES">Spanish (ES)</option>
            <option value="fr-FR">French (FR)</option>
            <option value="de-DE">German (DE)</option>
          </select>
        </div>

        <div className="transcript-area">
          {transcript || displayText}
        </div>

        {error && <div style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</div>}
      </div>

      {/* 2. Simulation Sandbox presets */}
      <div className="glass-card">
        <h3>Simulation Presets</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Test different triggers without using a microphone:
        </p>
        <div className="preset-grid">
          {PRESET_QUERIES.map((preset, idx) => (
            <button key={idx} className="preset-btn" onClick={() => handlePresetClick(preset.text)}>
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Real-time Log Timeline */}
      {chatLog.length > 0 && (
        <div className="glass-card">
          <h3>Interaction Timeline</h3>
          <div className="chat-timeline">
            {chatLog.map((msg) => (
              <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender === 'ai' ? 'ai' : 'customer'}`}>
                <div className="chat-bubble">
                  <div className="chat-meta">
                    <span className="chat-sender">{msg.sender === 'ai' ? 'AuraVox AI' : 'Customer'}</span>
                    <span className="chat-time">{msg.timestamp}</span>
                  </div>
                  <div className="chat-text">{msg.text}</div>
                  
                  {msg.sender === 'customer' && (
                    <div className="chat-tags">
                      <span className="badge-tag">🌐 {msg.language}</span>
                      <span className="badge-tag">🎭 {msg.sentiment}</span>
                      <span className="badge-tag">🏢 {msg.department}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

