import type { Sentiment, Department } from '../utils/SentimentEngine';

export interface Ticket {
  id: string;
  description: string;
  department: Department;
  assignedAgent: string;
  sentiment: Sentiment;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Escalated' | 'Resolved';
  createdAt: string;
  startTime: number; // unix timestamp
  resolutionTime?: number; // duration in seconds
}
