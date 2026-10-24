import { DialectType } from '../types';

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function playSpanishTTS(
  text: string,
  dialect: DialectType = 'Spain (Castellano)',
  rate: number = 1.0,
  onEnd?: () => void
): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis is not supported in this browser.');
      onEnd?.();
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean any unwanted brackets or annotations for clean speech
    const cleanText = text.replace(/\[.*?\]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance = utterance;

    utterance.rate = rate; // 0.7x or 1.0x
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const targetLangCode = dialect.includes('Spain') ? 'es-ES' : 'es-MX';

    // Prioritize natural voices
    const selectedVoice =
      voices.find((v) => v.lang === targetLangCode && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Pablo') || v.name.includes('Jorge') || v.name.includes('Mónica'))) ||
      voices.find((v) => v.lang.startsWith(targetLangCode.substring(0, 2))) ||
      voices.find((v) => v.lang.includes('es'));

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      utterance.lang = targetLangCode;
    }

    utterance.onend = () => {
      currentUtterance = null;
      onEnd?.();
      resolve();
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      currentUtterance = null;
      onEnd?.();
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpanishTTS(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}
