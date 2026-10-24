import { DialectType } from '../types';
import { generateAudioCacheKey, getCachedAudioBlob, saveAudioBlobToCache } from './audioCache';

export interface TTSVoiceConfig {
  id: string;
  nameAr: string;
  gender: 'female' | 'male';
  descriptionAr: string;
  accent: 'Spain' | 'Neutral';
  recommended?: boolean;
}

export const AVAILABLE_TTS_VOICES: TTSVoiceConfig[] = [
  {
    id: 'Kore',
    nameAr: 'كوري (Kore) - ممثلة إسبانية محترفة',
    gender: 'female',
    descriptionAr: 'صوت أنثوي دافئ، واضح المخارج، نبرة مدريدية طبيعية ومريحة للتعلم.',
    accent: 'Spain',
    recommended: true,
  },
  {
    id: 'Zephyr',
    nameAr: 'زيفير (Zephyr) - صوت حيوي ومشرق',
    gender: 'female',
    descriptionAr: 'صوت أنثوي شابة بحيوية طبيعية، ممتاز للمحادثات السريعة والشارع.',
    accent: 'Spain',
  },
  {
    id: 'Puck',
    nameAr: 'باك (Puck) - صوت شبابي ودود',
    gender: 'male',
    descriptionAr: 'صوت ذكوري معتدل النبرة، أسلوب ودود ومناسب لخدمة العملاء الراقية.',
    accent: 'Spain',
  },
  {
    id: 'Charon',
    nameAr: 'شارون (Charon) - صوت وقور وعميق',
    gender: 'male',
    descriptionAr: 'صوت ذكوري عميق ورسمي، ممتاز لمكالمات الأعمال وتسجيلات الإشعارات الرسمية.',
    accent: 'Spain',
  },
  {
    id: 'Fenrir',
    nameAr: 'فينرير (Fenrir) - صوت حازم ودقيق',
    gender: 'male',
    descriptionAr: 'صوت ذكوري قوي بنطق حاد للأصوات ومخارج الحروف.',
    accent: 'Spain',
  },
];

export const VOICE_TEST_SENTENCES = [
  {
    id: 'test_rr',
    spanish: 'El perro corre rápido por el barrio de Chamberí.',
    transliterationAr: 'إل بيرّو كورّي رابيدو بور إل باريو دي تشامبيري.',
    arabic: 'الكلب يجري سريعاً في حي تشامبيري بمدريد (اختبار الراء المشددة RR).',
    phonemeFocus: 'الراء المشددة (RR) والراء الخفيفة (R)',
  },
  {
    id: 'test_ceceo',
    spanish: 'Muchas gracias por su paciencia, señor Zaragoza.',
    transliterationAr: 'موتشاس غراثياس بور سو باثيينثيا، سينيور ثاراغوثا.',
    arabic: 'شكراً جزيلاً لصبر حضرتك يا سيد ساراجوسا (اختبار ثاء إسبانيا Z/C).',
    phonemeFocus: 'الثاء الإسبانية (Ceceo / Distinción [θ])',
  },
  {
    id: 'test_jota',
    spanish: 'El trabajo de atención al cliente de Jorge es genial.',
    transliterationAr: 'إل تراباخو دي أتينثيون أل كلينتي دي خورخي إس خينيال.',
    arabic: 'عمل خدمة العملاء الخاص بخورخي رائع وممتاز (اختبار حرف الخاء J/G).',
    phonemeFocus: 'الخاء الإسبانية (Jota [x])',
  },
  {
    id: 'test_pb',
    spanish: 'Por favor, pulse el botón para confirmar el pago del recibo.',
    transliterationAr: 'بور فابور، بولسي إل بوتون بارا كونفيرمار إل باغو ديل ريثيبو.',
    arabic: 'من فضلك، اضغط الزر لتأكيد سداد الفاتورة (اختبار فارق P عن B).',
    phonemeFocus: 'صوت P الانفجاري مقابل B المجهور',
  },
  {
    id: 'test_callcenter',
    spanish: 'Buenos días, le atiende el departamento de soporte técnico, ¿en qué puedo ayudarle hoy?',
    transliterationAr: 'بويناس دياس، لي أتييندي إل ديبارتامينتو دي سوبورتي تيكنيكو، إن كي بويدو أيودارلي أوي؟',
    arabic: 'صباح الخير، معك قسم الدعم الفني، كيف يمكنني مساعدة حضرتك اليوم؟',
    phonemeFocus: 'نبرة الكول سنتر وصيغة الاحترام (Usted)',
  },
];

export function getActiveTTSVoice(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('fluento_tts_voice') || 'Kore';
  }
  return 'Kore';
}

export function setActiveTTSVoice(voiceId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fluento_tts_voice', voiceId);
  }
}

// Current active HTML Audio or Utterance
let currentAudioElement: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

// Track if a speech request is currently in flight
let activePlaybackId: number = 0;

/**
 * Clean text to extract purely the Spanish phonetic sentence,
 * stripping Arabic explanations, register brackets, tags, etc.
 */
export function extractCleanSpanish(text: string): string {
  if (!text) return '';
  const cleaned = text
    .replace(/\[.*?\]/g, '') // remove brackets like [رسمي] or [θ]
    .replace(/\(.*?\)/g, '') // remove parenthetical notes
    // remove Arabic script blocks
    .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '')
    .replace(/[«»""'']/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.length >= 2 ? cleaned : text.replace(/\[.*?\]/g, '').trim();
}

/**
 * Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Fallback to Web Speech API with strict native Spanish voice selection
 */
function playWebSpeechFallback(
  cleanSpanishText: string,
  dialect: DialectType,
  rate: number,
  onEnd?: () => void,
  onError?: (err: string) => void
): void {
  if (!('speechSynthesis' in window)) {
    onError?.('متصفحك لا يدعم قراءة النصوص.');
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanSpanishText);
  currentUtterance = utterance;

  utterance.rate = rate === 0.7 ? 0.8 : rate;
  utterance.pitch = 1.0;

  const targetLang = dialect.includes('Spain') ? 'es-ES' : 'es-MX';
  utterance.lang = targetLang;

  const selectAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    // Prioritize genuine native Spanish voices and female voices
    const isSpain = dialect.includes('Spain');

    const spanishVoices = voices.filter(
      (v) => v.lang.startsWith('es') || v.lang.includes('Spanish')
    );

    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (isSpain) {
      selectedVoice =
        spanishVoices.find((v) => v.lang === 'es-ES' && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Mónica') || v.name.includes('Pablo'))) ||
        spanishVoices.find((v) => v.lang === 'es-ES') ||
        spanishVoices.find((v) => v.lang.startsWith('es'));
    } else {
      selectedVoice =
        spanishVoices.find((v) => (v.lang === 'es-MX' || v.lang === 'es-US') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Paulina'))) ||
        spanishVoices.find((v) => v.lang.startsWith('es'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      console.warn('No native Spanish voice found in browser voices.');
    }

    utterance.onend = () => {
      currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.error('Web Speech fallback error:', e);
      currentUtterance = null;
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    selectAndSpeak();
  } else {
    // Wait for voiceschanged event
    window.speechSynthesis.onvoiceschanged = () => {
      selectAndSpeak();
    };
    // Safety fallback if voiceschanged never fires
    setTimeout(() => {
      if (currentUtterance === utterance) {
        selectAndSpeak();
      }
    }, 350);
  }
}

/**
 * Play Spanish TTS with Gemini TTS primary engine and IndexedDB caching.
 * Supported everywhere in the application.
 */
export async function playSpanishTTS(
  text: string,
  dialect: DialectType = 'Spain (Castellano)',
  rate: number = 1.0,
  onEnd?: () => void,
  onLoading?: (isLoading: boolean) => void,
  onError?: (err: string) => void
): Promise<void> {
  const thisPlaybackId = ++activePlaybackId;

  // Stop any currently playing audio
  stopSpanishTTS();

  const cleanSpanish = extractCleanSpanish(text);
  if (!cleanSpanish) {
    onEnd?.();
    return;
  }

  const voiceName = getActiveTTSVoice();
  const cacheKey = generateAudioCacheKey(cleanSpanish, voiceName, dialect, rate);

  onLoading?.(true);

  // 1. Check IndexedDB Cache
  try {
    const cachedBlob = await getCachedAudioBlob(cacheKey);
    if (cachedBlob && thisPlaybackId === activePlaybackId) {
      onLoading?.(false);
      await playAudioBlob(cachedBlob, rate, onEnd, onError);
      return;
    }
  } catch (err) {
    console.warn('Cache lookup failed, proceeding to API:', err);
  }

  // 2. Fetch from Gemini TTS Server Endpoint
  try {
    const response = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanSpanish,
        voiceName,
        dialect,
        speed: rate,
        mode: rate === 0.7 ? 'slow' : 'normal',
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS server responded with ${response.status}`);
    }

    const data = await response.json();
    if (!data.audioBase64) {
      throw new Error('Empty audio payload received');
    }

    if (thisPlaybackId !== activePlaybackId) {
      // User triggered another sound while waiting
      return;
    }

    onLoading?.(false);

    // Create Audio Blob from base64 WAV
    const arrayBuffer = base64ToArrayBuffer(data.audioBase64);
    const audioBlob = new Blob([arrayBuffer], { type: data.mimeType || 'audio/wav' });

    // Save to IndexedDB cache in background
    saveAudioBlobToCache(cacheKey, audioBlob).catch(console.warn);

    // Play Audio
    await playAudioBlob(audioBlob, rate, onEnd, onError);
  } catch (apiError: any) {
    console.warn('Gemini TTS failed or offline, falling back to Web Speech API:', apiError);
    onLoading?.(false);

    if (thisPlaybackId === activePlaybackId) {
      playWebSpeechFallback(cleanSpanish, dialect, rate, onEnd, onError);
    }
  }
}

/**
 * Play audio Blob using HTMLAudioElement with mobile-friendly gesture handling
 */
function playAudioBlob(
  blob: Blob,
  playbackRate: number,
  onEnd?: () => void,
  onError?: (err: string) => void
): Promise<void> {
  return new Promise((resolve) => {
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    currentAudioElement = audio;

    // Apply playback speed
    if (playbackRate === 0.7) {
      audio.playbackRate = 0.82; // comfortable slow pace without robotic distortion
    } else {
      audio.playbackRate = playbackRate;
    }

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      if (currentAudioElement === audio) {
        currentAudioElement = null;
      }
      onEnd?.();
      resolve();
    };

    audio.onerror = (e) => {
      console.error('Audio playback error:', e);
      URL.revokeObjectURL(audioUrl);
      if (currentAudioElement === audio) {
        currentAudioElement = null;
      }
      onError?.('تعذر تشغيل الصوت في المتصفح.');
      onEnd?.();
      resolve();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Autoplay prevented or interrupted:', err);
        URL.revokeObjectURL(audioUrl);
        if (currentAudioElement === audio) {
          currentAudioElement = null;
        }
        onEnd?.();
        resolve();
      });
    }
  });
}

/**
 * Pre-cache TTS audio in background for subsequent cards in lessons
 */
export async function prefetchSpanishTTS(
  sentences: string[],
  dialect: DialectType = 'Spain (Castellano)',
  rate: number = 1.0
): Promise<void> {
  const voiceName = getActiveTTSVoice();
  for (const sentence of sentences.slice(0, 5)) {
    const cleanSpanish = extractCleanSpanish(sentence);
    if (!cleanSpanish) continue;

    const cacheKey = generateAudioCacheKey(cleanSpanish, voiceName, dialect, rate);
    try {
      const exists = await getCachedAudioBlob(cacheKey);
      if (exists) continue;

      const response = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanSpanish,
          voiceName,
          dialect,
          speed: rate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioBase64) {
          const arrayBuffer = base64ToArrayBuffer(data.audioBase64);
          const blob = new Blob([arrayBuffer], { type: data.mimeType || 'audio/wav' });
          await saveAudioBlobToCache(cacheKey, blob);
        }
      }
    } catch {
      // Quiet fail on prefetch
      break;
    }
  }
}

/**
 * Stop any ongoing TTS audio playback
 */
export function stopSpanishTTS(): void {
  activePlaybackId++;

  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch (e) {
      console.warn(e);
    }
    currentAudioElement = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}
