export type Sentiment = 'neutral' | 'angry' | 'happy' | 'confused' | 'unsatisfied';
export type Department = 'Support' | 'Sales' | 'Technical' | 'Billing' | 'Senior Manager' | 'None';

interface AnalysisResult {
  sentiment: Sentiment;
  department: Department;
  language: string;
  langCode: string;
  isOnTrack: boolean;
  confidence: number;
}

const KEYWORDS = {
  Technical: [
    'broken', 'not working', 'error', 'bug', 'crash', 'slow', 'login',
    'roto', 'no funciona', 'fallo', 'lento',
    'cassé', 'ne fonctionne pas', 'erreur', 'lent',
    'kaputt', 'funktioniert nicht', 'fehler', 'langsam'
  ],
  Billing: [
    'invoice', 'charge', 'payment', 'refund', 'money', 'subscription', 'price',
    'factura', 'pago', 'reembolso', 'dinero', 'precio',
    'facture', 'paiement', 'remboursement', 'argent', 'prix',
    'rechnung', 'zahlung', 'rückerstattung', 'geld', 'preis'
  ],
  Sales: [
    'buy', 'purchase', 'deal', 'offer', 'interested', 'upgrade',
    'comprar', 'oferta', 'interesado',
    'acheter', 'offre', 'intéressé',
    'kaufen', 'angebot', 'interessiert'
  ],
  Support: [
    'help', 'question', 'how to', 'guide', 'info', 'information',
    'ayuda', 'pregunta', 'guía',
    'aide', 'question', 'guide',
    'hilfe', 'frage', 'anleitung'
  ],
};

const ANGER_KEYWORDS = [
  'angry', 'upset', 'worst', 'terrible', 'annoyed', 'useless', 'fix it now', 'supervisor',
  'enojado', 'enfadado', 'terrible', 'peor', 'gerente', 'jefe',
  'en colère', 'fâché', 'terrible', 'pire', 'directeur',
  'wütend', 'ärgerlich', 'schrecklich', 'schlimmste', 'chef'
];

const UNSATISFIED_KEYWORDS = [
  'not satisfied', 'didn\'t help', 'still broken', 'useless', 'wrong',
  'no satisfecho', 'no sirvió', 'incorrecto',
  'pas satisfait', 'inutile', 'incorrect',
  'nicht zufrieden', 'nutzlos', 'falsch'
];

export const analyzeTranscript = (transcript: string): AnalysisResult => {
  const lowercase = transcript.toLowerCase();
  
  // 1. Language Detection
  let language = 'English';
  let langCode = 'en-US';

  // Check language triggers
  if (/[áéíóúñ]/.test(lowercase) || lowercase.includes('ayuda') || lowercase.includes('hola') || lowercase.includes('pago')) {
    language = 'Spanish';
    langCode = 'es-ES';
  } else if (/[äöüß]/.test(lowercase) || lowercase.includes('hilfe') || lowercase.includes('hallo') || lowercase.includes('zahlung')) {
    language = 'German';
    langCode = 'de-DE';
  } else if (/[àâçéèêëîïôûù]/.test(lowercase) || lowercase.includes('aide') || lowercase.includes('bonjour') || lowercase.includes('facture')) {
    language = 'French';
    langCode = 'fr-FR';
  }

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
  const isOnTrack = department !== 'None' || lowercase.length > 15;

  return {
    sentiment,
    department,
    language,
    langCode,
    isOnTrack,
    confidence: 0.90,
  };
};

export const getResponseTemplate = (result: AnalysisResult): string => {
  const responses: Record<string, Record<string, string>> = {
    'en-US': {
      intro: "I understand your issue. ",
      transfer: `Transferring you to the ${result.department} department.`,
      fallback: "Could you please tell me more about your concern so I can direct you properly?",
      escalation: "I apologize for the frustration. I am immediately transferring you to our Senior Manager.",
      unsatisfied: "I'm sorry you are not satisfied. Let's start again: how can I help you today?"
    },
    'es-ES': {
      intro: "Entiendo su inconveniente. ",
      transfer: `Transfiriendo al departamento de ${result.department === 'Technical' ? 'Soporte Técnico' : result.department === 'Billing' ? 'Facturación' : result.department === 'Sales' ? 'Ventas' : 'Atención al Cliente'}.`,
      fallback: "¿Podría darme más detalles sobre su consulta para poder dirigirle correctamente?",
      escalation: "Lamento mucho la frustración. Le transferiré de inmediato con nuestro Gerente Senior.",
      unsatisfied: "Lamento que no esté satisfecho. Intentémoslo de nuevo: ¿cómo puedo ayudarle hoy?"
    },
    'fr-FR': {
      intro: "Je comprends votre problème. ",
      transfer: `Transfert au département ${result.department === 'Technical' ? 'Technique' : result.department === 'Billing' ? 'Facturation' : result.department === 'Sales' ? 'Ventes' : 'Support'}.`,
      fallback: "Pourriez-vous m'en dire plus afin que je puisse vous orienter au mieux ?",
      escalation: "Je m'excuse pour la frustration. Je vous transfère immédiatement à notre Directeur Principal.",
      unsatisfied: "Désolé que cela ne vous convienne pas. Recommençons : comment puis-je vous aider ?"
    },
    'de-DE': {
      intro: "Ich verstehe Ihr Anliegen. ",
      transfer: `Ich leite Sie an die Abteilung ${result.department === 'Technical' ? 'Technik' : result.department === 'Billing' ? 'Abrechnung' : result.department === 'Sales' ? 'Vertrieb' : 'Support'} weiter.`,
      fallback: "Könnten Sie mir bitte mehr Details nennen, damit ich Sie richtig weiterleiten kann?",
      escalation: "Ich entschuldige mich für die Unannehmlichkeiten. Ich verbinde Sie sofort mit unserem leitenden Manager.",
      unsatisfied: "Es tut mir leid, dass Sie nicht zufrieden sind. Versuchen wir es noch einmal: Wie kann ich Ihnen helfen?"
    }
  };

  const templates = responses[result.langCode] || responses['en-US'];

  if (result.sentiment === 'angry') {
    return templates.escalation;
  }
  if (result.sentiment === 'unsatisfied') {
    return templates.unsatisfied;
  }
  if (result.department !== 'None') {
    return templates.intro + templates.transfer;
  }
  return templates.fallback;
};

