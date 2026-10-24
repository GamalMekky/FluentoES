import React, { useState } from 'react';
import { Award, CheckCircle, XCircle, ArrowLeft, ArrowRight, Sparkles, X } from 'lucide-react';
import { placementQuestions } from '../data/placementTestData';
import { CEFRLevel } from '../types';

interface PlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (level: CEFRLevel) => void;
}

export const PlacementModal: React.FC<PlacementModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [computedLevel, setComputedLevel] = useState<CEFRLevel>('A1');
  const [correctCount, setCorrectCount] = useState(0);

  if (!isOpen) return null;

  const currentQ = placementQuestions[currentIndex];
  const userChoice = selectedAnswers[currentQ.id];
  const isCorrect = userChoice === currentQ.correctAnswer;

  const handlePickOption = (option: string) => {
    if (showExplanation) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: option }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIndex < placementQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate final score
      let score = 0;
      placementQuestions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctAnswer) {
          score += 1;
        }
      });
      setCorrectCount(score);

      let lvl: CEFRLevel = 'A1';
      if (score >= 9) lvl = 'B2';
      else if (score >= 7) lvl = 'B1';
      else if (score >= 4) lvl = 'A2';
      else lvl = 'A1';

      setComputedLevel(lvl);
      setIsFinished(true);
    }
  };

  const handleApplyLevel = () => {
    onComplete(computedLevel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              اختبار تحديد المستوى الذكي (10 أسئلة)
            </h3>
          </div>
        </div>

        {!isFinished ? (
          <div className="py-5">
            {/* Progress indicators */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
              <span>السؤال {currentIndex + 1} من {placementQuestions.length}</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                مستوى السؤال: {currentQ.level}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / placementQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="mb-4">
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] mb-1.5" dir="ltr">
                {currentQ.question}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {currentQ.questionAr}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5 mb-5" dir="ltr">
              {currentQ.options.map((opt, i) => {
                let btnStyle =
                  'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100';

                if (showExplanation) {
                  if (opt === currentQ.correctAnswer) {
                    btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold';
                  } else if (userChoice === opt) {
                    btnStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-300';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handlePickOption(opt)}
                    className={`w-full p-3.5 rounded-xl border text-left font-['Plus_Jakarta_Sans',sans-serif] text-sm transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {showExplanation && opt === currentQ.correctAnswer && (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    )}
                    {showExplanation && userChoice === opt && opt !== currentQ.correctAnswer && (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card */}
            {showExplanation && (
              <div
                className={`p-4 rounded-2xl mb-5 text-xs leading-relaxed animate-in fade-in ${
                  isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>إجابة صحيحة! أحسنت.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>إجابة غير دقيقة. الإجابة الصحيحة هي: {currentQ.correctAnswer}</span>
                    </>
                  )}
                </div>
                <p>{currentQ.explanationAr}</p>
              </div>
            )}

            {/* Next button */}
            {showExplanation && (
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <span>{currentIndex < placementQuestions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة النهائية'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Finished State */
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
              <Sparkles className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">
              مبارك! تم تحديد مستواك في الإسبانية
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              أجبت بشكل صحيح على {correctCount} من إجمالي {placementQuestions.length} أسئلة تشخيصية.
            </p>

            <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-900/60 mb-6 max-w-sm mx-auto">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block mb-1">
                مستواك الحالي المقترح:
              </span>
              <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                {computedLevel}
              </span>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-normal">
                {computedLevel === 'A1' && 'بداية ممتازة من الصفر. خطتك ستركز على بناء الحصيلة والأساسيات وأزمنة الحاضر والتأدب.'}
                {computedLevel === 'A2' && 'لديك أساسيات جيدة جداً! سنركز على التمييز بين أزمنة الماضي والتحدث بطلاقة وسيناريوهات الكول سنتر.'}
                {computedLevel === 'B1' && 'مستوى متقدم ممتاز! أنت على بُعد خطوات من B2 والتركيز سيكون على Subjuntivo ومكالمات العملاء المعقدة.'}
                {computedLevel === 'B2' && 'مستوى احترافي B2! جاهز لمقابلات الكول سنتر والحديث السريع والتعامل مع أي شكوى هاتفية.'}
              </p>
            </div>

            <button
              onClick={handleApplyLevel}
              className="w-full max-w-sm py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-95"
            >
              اعتماد المستوى والبدء في الخطة اليومية (+50 XP)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
