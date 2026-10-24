export type RegisterType = 'رسمي' | 'محايد' | 'عامي' | 'شارع' | 'إيحاء فظ ⚠️';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type DialectType = 'Spain (Castellano)' | 'Latin America (neutral)';

export type UILanguageMode = 'ar_only' | 'ar_es' | 'es_only';

export interface SpanishSentenceCard {
  id: string;
  spanish: string;
  transliterationAr: string;
  ipa: string;
  arabic: string;
  register: RegisterType;
  notes?: string;
  category?: string;
  audioUrl?: string;
}

export interface UserProfile {
  level: CEFRLevel;
  xp: number;
  streak: number;
  lastActiveDate: string;
  dailyGoalMinutes: number;
  todayStudiedMinutes: number;
  dialect: DialectType;
  uiLanguageMode: UILanguageMode;
  weakAreas: string[];
  placed: boolean;
  completedDays: number[];
  currentWeek: number;
}

export interface SRSCard {
  id: string;
  card: SpanishSentenceCard;
  interval: number;
  repetition: number;
  efactor: number;
  nextReviewDate: string;
  type: 'es_to_ar' | 'ar_to_es' | 'listening' | 'cloze';
  reviewsCount: number;
  history: number[];
}

export interface MistakeItem {
  id: string;
  category: string;
  mistake: string;
  correction: string;
  explanationAr: string;
  timestamp: string;
  resolved: boolean;
}

export interface TenseLesson {
  id: string;
  name: string;
  nameAr: string;
  order: number;
  level: CEFRLevel;
  whenToUseAr: string;
  arabicComparison: string;
  timelineDescription: string;
  formation: {
    regular: {
      ar: string[];
      er: string[];
      ir: string[];
      pronouns: string[];
    };
    irregulars: {
      verb: string;
      meaningAr: string;
      forms: string[];
    }[];
  };
  sentences: SpanishSentenceCard[];
  commonMistakes: {
    mistake: string;
    correction: string;
    reasonAr: string;
  }[];
  miniExercises: {
    id: string;
    type: 'fill_in' | 'conjugation' | 'translate' | 'spot_error';
    question: string;
    options?: string[];
    answer: string;
    explanationAr: string;
  }[];
  finalChallenge: {
    title: string;
    questions: {
      id: string;
      question: string;
      options: string[];
      answer: string;
      explanationAr: string;
    }[];
  };
}

export interface StreetExpression {
  id: string;
  streetSpanish: string;
  standardSpanish: string;
  transliterationAr: string;
  ipa: string;
  arabic: string;
  category: 'greetings' | 'agreement' | 'surprise' | 'money' | 'friends' | 'party' | 'work' | 'fillers' | 'insults_warning' | 'reductions';
  register: RegisterType;
  whenToUseAr: string;
  whenNOTToUseAr: string; // e.g. "إياك تستخدمها في الكول سنتر مع عميل!"
  dialogue: {
    speakerA: string;
    speakerB: string;
    arabicA: string;
    arabicB: string;
  }[];
  spainVsLatamNote?: string;
}

export interface CallCenterScenario {
  id: string;
  title: string;
  titleAr: string;
  category: string;
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم' | 'احترافي';
  contextAr: string;
  customerPersona: 'angry' | 'confused' | 'fast_speaker' | 'calm' | 'regional_andaluz';
  openingPhrase: SpanishSentenceCard;
  steps: {
    stepNumber: number;
    goalAr: string;
    recommendedPhrases: SpanishSentenceCard[];
    customerLikelySay: string;
    customerLikelySayAr: string;
  }[];
  dosAndDonts: {
    dos: string[];
    donts: string[];
  };
}

export interface CultureCard {
  id: string;
  type: 'city' | 'refran' | 'etiquette' | 'dialect_diff';
  title: string;
  titleAr: string;
  descriptionEs?: string;
  descriptionAr?: string;
  refranLiteralAr?: string;
  refranRealMeaningAr?: string;
  refranArabicEquivalent?: string;
  exampleSentence?: SpanishSentenceCard;
  accentTipsAr?: string;
  stereotypesAndFood?: string;
  quiz?: {
    question: string;
    options: string[];
    answer: string;
    explanationAr: string;
  };
}

export interface PronunciationEvaluationResult {
  transcript_heard: string;
  overall_score_0_100: number;
  word_by_word: {
    word: string;
    ok: boolean;
    problem: string;
    tip_ar: string;
  }[];
  problem_sounds: string[];
  corrected_version: string;
  natural_alternative_street: string;
  is_alternative_used_in_real_street_speech: boolean;
  explanation_ar: string;
}
