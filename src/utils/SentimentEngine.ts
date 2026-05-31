export type Sentiment = 'neutral' | 'angry' | 'happy' | 'confused' | 'unsatisfied';
export type Department = 'Support' | 'Sales' | 'Technical' | 'Billing' | 'Senior Manager' | 'None';

interface AnalysisResult {
  sentiment: Sentiment;
  department: Department;
  language: string;
  isOnTrack: boolean;
  confidence: number;
}

const KEYWORDS = {
  Technical: ['broken', 'not working', 'error', 'bug', 'crash', 'slow', 'login'],
  Billing: ['invoice', 'charge', 'payment', 'refund', 'money', 'subscription', 'price'],
  Sales: ['buy', 'purchase', 'deal', 'offer', 'interested', 'upgrade'],
  Support: ['help', 'question', 'how to', 'guide', 'info', 'information'],
};

const ANGER_KEYWORDS = ['angry', 'upset', 'worst', 'terrible', 'annoyed', 'useless', 'fix it now', 'supervisor'];
const UNSATISFIED_KEYWORDS = ['not satisfied', 'didn\'t help', 'still broken', 'useless', 'wrong'];

export const analyzeTranscript = (transcript: string): AnalysisResult => {
  const lowercase = transcript.toLowerCase();
  
  // 1. Language Detection (Simplistic mock for browser)
  // In a real app, we'd use a library or API.
  let language = 'English';
  if (/[áéíóú]/.test(lowercase)) language = 'Spanish';
  if (/[äöüß]/.test(lowercase)) language = 'German';
  if (/[àâçéèêëîïôûù]/.test(lowercase)) language = 'French';

  // 2. Sentiment Analysis
  let sentiment: Sentiment = 'neutral';
  if (ANGER_KEYWORDS.some(word => lowercase.includes(word))) {
    sentiment = 'angry';
  } else if (UNSATISFIED_KEYWORDS.some(word => lowercase.includes(word))) {
    sentiment = 'unsatisfied';
  }

  // 3. Department Routing
  let department: Department = 'None';
  if (sentiment === 'angry') {
    department = 'Senior Manager';
  } else {
    for (const [dept, words] of Object.entries(KEYWORDS)) {
      if (words.some(word => lowercase.includes(word))) {
        department = dept as Department;
        break;
      }
    }
  }

  // 4. Track monitoring (Are they asking relevant questions?)
  const isOnTrack = department !== 'None' || lowercase.length > 20;

  return {
    sentiment,
    department,
    language,
    isOnTrack,
    confidence: 0.85,
  };
};
