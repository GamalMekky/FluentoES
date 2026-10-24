import { SRSCard, SpanishSentenceCard } from '../types';

export function createNewSRSCard(
  card: SpanishSentenceCard,
  type: 'es_to_ar' | 'ar_to_es' | 'listening' | 'cloze' = 'es_to_ar'
): SRSCard {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: `srs_${card.id}_${Date.now()}`,
    card,
    interval: 1,
    repetition: 0,
    efactor: 2.5,
    nextReviewDate: today,
    type,
    reviewsCount: 0,
    history: [],
  };
}

/**
 * SM-2 Spaced Repetition calculation
 * @param card Current SRS card
 * @param quality 0 (forgot completely) to 5 (perfect instant recall)
 */
export function calculateSM2(card: SRSCard, quality: number): SRSCard {
  const q = Math.max(0, Math.min(5, quality));
  let { interval, repetition, efactor } = card;

  if (q >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  // Calculate new easiness factor
  efactor = efactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (efactor < 1.3) {
    efactor = 1.3;
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  const nextReviewDate = nextDate.toISOString().split('T')[0];

  return {
    ...card,
    interval,
    repetition,
    efactor: Number(efactor.toFixed(2)),
    nextReviewDate,
    reviewsCount: card.reviewsCount + 1,
    history: [...card.history, q],
  };
}

export function isCardDueToday(card: SRSCard): boolean {
  const today = new Date().toISOString().split('T')[0];
  return card.nextReviewDate <= today;
}
