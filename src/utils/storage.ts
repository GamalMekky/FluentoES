import { UserProfile, SRSCard, MistakeItem, SpanishSentenceCard } from '../types';
import { createNewSRSCard } from './srs';
import { callCenterPhraseBank } from '../data/callCenterData';

const STORAGE_KEYS = {
  USER_PROFILE: 'fluento_es_user_profile',
  SRS_DECK: 'fluento_es_srs_deck',
  MISTAKE_BANK: 'fluento_es_mistake_bank',
  CHAT_HISTORY: 'fluento_es_chat_history',
  THEME_MODE: 'fluento_es_theme_mode',
};

const defaultProfile: UserProfile = {
  level: 'A1',
  xp: 120,
  streak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  dailyGoalMinutes: 75,
  todayStudiedMinutes: 25,
  dialect: 'Spain (Castellano)',
  uiLanguageMode: 'ar_es',
  weakAreas: ['Subjuntivo', 'Pronunciación P vs B', 'Usted vs Tú'],
  placed: false,
  completedDays: [1, 2],
  currentWeek: 1,
};

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Check streak continuity
      const today = new Date().toISOString().split('T')[0];
      if (parsed.lastActiveDate !== today) {
        const lastDate = new Date(parsed.lastActiveDate);
        const nowDate = new Date(today);
        const diffDays = Math.round((nowDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          // Continuous streak
          parsed.streak = (parsed.streak || 0) + 1;
        } else if (diffDays > 1) {
          // Broken streak
          parsed.streak = 1;
        }
        parsed.lastActiveDate = today;
        parsed.todayStudiedMinutes = 0;
        saveUserProfile(parsed);
      }
      return { ...defaultProfile, ...parsed };
    }
  } catch (e) {
    console.error('Error loading user profile:', e);
  }
  return defaultProfile;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving user profile:', e);
  }
}

export function addXP(amount: number): UserProfile {
  const profile = loadUserProfile();
  profile.xp += amount;
  profile.todayStudiedMinutes = Math.min(profile.dailyGoalMinutes, profile.todayStudiedMinutes + Math.round(amount / 5));
  saveUserProfile(profile);
  return profile;
}

export function loadSRSDeck(): SRSCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SRS_DECK);
    if (raw) {
      const deck: SRSCard[] = JSON.parse(raw);
      if (deck.length > 0) return deck;
    }
  } catch (e) {
    console.error('Error loading SRS deck:', e);
  }

  // Pre-seed initial starter cards from the call center phrasebank
  const seedCards: SRSCard[] = callCenterPhraseBank.slice(0, 8).map((phrase) => createNewSRSCard(phrase));
  saveSRSDeck(seedCards);
  return seedCards;
}

export function saveSRSDeck(deck: SRSCard[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SRS_DECK, JSON.stringify(deck));
  } catch (e) {
    console.error('Error saving SRS deck:', e);
  }
}

export function addCardToSRSDeck(card: SpanishSentenceCard): { success: boolean; message: string } {
  const deck = loadSRSDeck();
  const exists = deck.some((item) => item.card.spanish.trim().toLowerCase() === card.spanish.trim().toLowerCase());
  if (exists) {
    return { success: false, message: 'هذه الجملة موجودة بالفعل في بطاقات التكرار المتباعد الخاصة بك.' };
  }
  const newCard = createNewSRSCard(card);
  deck.unshift(newCard);
  saveSRSDeck(deck);
  addXP(10);
  return { success: true, message: 'تم حفظ الجملة بنجاح في مراجعة التكرار المتباعد (+10 XP)!' };
}

export function loadMistakeBank(): MistakeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MISTAKE_BANK);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading mistake bank:', e);
  }

  // Initial pre-seeded realistic mistakes for Egyptian Arabic speakers
  const seedMistakes: MistakeItem[] = [
    {
      id: 'mist_1',
      category: 'الأزمنة والكينونة',
      mistake: 'Yo soy hablo con el cliente',
      correction: 'Hablo con el cliente',
      explanationAr: 'لا نضع فعل الكينونة soy قبل الفعل المصرف hablo. في الإسبانية نقول الفعل مباشرة.',
      timestamp: new Date().toISOString(),
      resolved: false,
    },
    {
      id: 'mist_2',
      category: 'صوتيات P vs B',
      mistake: 'El broblema de bagar la factura',
      correction: 'El problema de pagar la factura',
      explanationAr: 'إطلاق صوت P بالهواء الانفجاري بدلاً من B لتفادي الخطأ في كول سنتر إسبانيا.',
      timestamp: new Date().toISOString(),
      resolved: false,
    },
    {
      id: 'mist_3',
      category: 'صيغة الاحترام (Usted)',
      mistake: '¿Puedes confirmar tu DNI? (مع عميل)',
      correction: '¿Podría confirmar su DNI, por favor?',
      explanationAr: 'في الكول سنتر لا نخاطب العميل بصيغة tú أبداً بل بصيغة usted والشرط podría للتأدب.',
      timestamp: new Date().toISOString(),
      resolved: false,
    },
  ];
  saveMistakeBank(seedMistakes);
  return seedMistakes;
}

export function saveMistakeBank(bank: MistakeItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MISTAKE_BANK, JSON.stringify(bank));
  } catch (e) {
    console.error('Error saving mistake bank:', e);
  }
}

export function recordMistake(category: string, mistake: string, correction: string, explanationAr: string): void {
  const bank = loadMistakeBank();
  bank.unshift({
    id: `mist_${Date.now()}`,
    category,
    mistake,
    correction,
    explanationAr,
    timestamp: new Date().toISOString(),
    resolved: false,
  });
  saveMistakeBank(bank);
}

export function exportAllDataAsJSON(): string {
  const data = {
    exportDate: new Date().toISOString(),
    profile: loadUserProfile(),
    srsDeck: loadSRSDeck(),
    mistakeBank: loadMistakeBank(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllDataFromJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.profile) saveUserProfile(data.profile);
    if (data.srsDeck) saveSRSDeck(data.srsDeck);
    if (data.mistakeBank) saveMistakeBank(data.mistakeBank);
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}
