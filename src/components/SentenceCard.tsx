import React, { useState, useRef } from 'react';
import { Volume2, Mic, MicOff, BookmarkPlus, Check, Sparkles, AlertCircle, RefreshCw, X } from 'lucide-react';
import { SpanishSentenceCard, PronunciationEvaluationResult, DialectType, UILanguageMode } from '../types';
import { playSpanishTTS, stopSpanishTTS } from '../utils/speech';
import { AudioRecorder } from '../utils/audioRecorder';
import { addCardToSRSDeck } from '../utils/storage';

interface SentenceCardProps {
  card: SpanishSentenceCard;
  dialect?: DialectType;
  uiLanguageMode?: UILanguageMode;
  onSavedToDeck?: () => void;
}

export const SentenceCard: React.FC<SentenceCardProps> = ({
  card,
  dialect = 'Spain (Castellano)',
  uiLanguageMode = 'ar_es',
  onSavedToDeck,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.7 | 1.0>(1.0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PronunciationEvaluationResult | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);

  const handlePlayTTS = async (customSpeed?: 0.7 | 1.0) => {
    const playSpeed = customSpeed ?? speed;
    setIsPlaying(true);
    try {
      await playSpanishTTS(card.spanish, dialect, playSpeed, () => {
        setIsPlaying(false);
      });
    } catch {
      setIsPlaying(false);
    }
  };

  const handleToggleSpeed = () => {
    const nextSpeed = speed === 1.0 ? 0.7 : 1.0;
    setSpeed(nextSpeed);
    handlePlayTTS(nextSpeed);
  };

  const handleStartRecording = async () => {
    setErrorMessage(null);
    try {
      recorderRef.current = new AudioRecorder();
      await recorderRef.current.start();
      setIsRecording(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'تعذر تشغيل الميكروفون');
      setIsRecording(false);
    }
  };

  const handleStopRecordingAndAnalyze = async () => {
    if (!recorderRef.current || !isRecording) return;
    setIsRecording(false);
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await recorderRef.current.stop();
      if (result.audioBlob) {
        const audioUrl = URL.createObjectURL(result.audioBlob);
        setUserAudioUrl(audioUrl);
      }

      // Send to server-side Gemini endpoint
      const response = await fetch('/api/gemini/analyze-pronunciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSentence: card.spanish,
          audioBase64: result.base64Audio,
          mimeType: result.mimeType,
          dialect,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل تحليل النطق بالذكاء الاصطناعي');
      }

      const data: PronunciationEvaluationResult = await response.json();
      setAnalysisResult(data);
      setShowFeedbackModal(true);
    } catch (err: any) {
      console.error('Audio analysis error:', err);
      setErrorMessage('حدث خطأ أثناء تحليل النطق، تأكد من اتصال الإنترنت وحاول مجدداً.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToDeck = () => {
    const res = addCardToSRSDeck(card);
    if (res.success) {
      setSavedSuccess(true);
      onSavedToDeck?.();
      setTimeout(() => setSavedSuccess(false), 2500);
    } else {
      setErrorMessage(res.message);
      setTimeout(() => setErrorMessage(null), 3500);
    }
  };

  const getRegisterBadge = (reg: string) => {
    switch (reg) {
      case 'رسمي':
        return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900';
      case 'عامي':
        return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900';
      case 'شارع':
        return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900';
      case 'إيحاء فظ ⚠️':
        return 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 font-bold';
      default:
        return 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow transition-shadow">
      {/* Top Bar inside card: Category & Register tag */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className={`px-2.5 py-0.5 rounded-md border text-[11px] ${getRegisterBadge(card.register)}`}>
            {card.register}
          </span>
          {card.category && (
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">
              · {card.category}
            </span>
          )}
        </div>

        {/* Action Controls: Listen, Speed, Record, Save */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* TTS Listen Button */}
          <button
            onClick={() => handlePlayTTS()}
            title="استمع للنطق الأصلي"
            aria-label="استمع للنطق"
            className={`p-2 rounded-xl transition-colors flex items-center justify-center ${
              isPlaying
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Speed Toggle (0.7x / 1.0x) */}
          <button
            onClick={handleToggleSpeed}
            title="سرعة النطق (0.7x بطيء / 1.0x عادي)"
            aria-label="سرعة النطق"
            className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {speed}x
          </button>

          {/* Record & Analyze Voice Button */}
          <button
            onClick={isRecording ? handleStopRecordingAndAnalyze : handleStartRecording}
            disabled={isAnalyzing}
            title={isRecording ? 'إيقاف التسجيل وتحليل النطق' : 'سجل صوتك وقارنه مع الأصل بالذكاء الاصطناعي'}
            aria-label="تسجيل ونطق"
            className={`p-2 rounded-xl transition-all flex items-center justify-center ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse'
                : isAnalyzing
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 animate-spin'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4" />
            ) : isRecording ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Save to SRS Deck */}
          <button
            onClick={handleSaveToDeck}
            title="حفظ في بطاقات التكرار المتباعد"
            aria-label="حفظ في البطاقات"
            className={`p-2 rounded-xl transition-colors flex items-center justify-center ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Recording live banner */}
      {isRecording && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-center justify-between text-xs text-red-700 dark:text-red-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>جارٍ التسجيل... انطق الجملة بصوت واضح ثم اضغط الميكروفون مجدداً للإرسال.</span>
          </div>
          <button
            onClick={handleStopRecordingAndAnalyze}
            className="px-2.5 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700"
          >
            إنهاء وتحليل
          </button>
        </div>
      )}

      {/* 1. Spanish Sentence (Large, LTR block) */}
      {uiLanguageMode !== 'ar_only' && (
        <div className="text-left font-['Plus_Jakarta_Sans',sans-serif] mb-2" dir="ltr">
          <p className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
            {card.spanish}
          </p>
        </div>
      )}

      {/* 2. Arabic Transliteration & IPA */}
      <div className="mb-2.5 flex flex-wrap items-baseline gap-2 text-xs">
        <span className="text-amber-800 dark:text-amber-300 font-medium">
          🗣️ النطق بالحروف العربية: «{card.transliterationAr}»
        </span>
        <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]" dir="ltr">
          [{card.ipa}]
        </span>
      </div>

      {/* 3. FULL Arabic Translation */}
      {uiLanguageMode !== 'es_only' && (
        <div className="mb-2 text-right">
          <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
            {card.arabic}
          </p>
        </div>
      )}

      {/* Notes / Call center context */}
      {card.notes && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-normal border-t border-slate-100 dark:border-slate-800/80 pt-2">
          💡 {card.notes}
        </p>
      )}

      {/* Error Message notification */}
      {errorMessage && (
        <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pronunciation Feedback Modal */}
      {showFeedbackModal && analysisResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  تقرير تقييم النطق بالذكاء الاصطناعي
                </h3>
              </div>
            </div>

            {/* Score & Heard text */}
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">درجة الدقة الصوتية</span>
                  <span className="text-3xl font-extrabold text-amber-700 dark:text-amber-400 font-mono">
                    {analysisResult.overall_score_0_100}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {userAudioUrl && (
                    <audio src={userAudioUrl} controls className="h-8 max-w-[160px]" />
                  )}
                  <button
                    onClick={() => handlePlayTTS(1.0)}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>الأصل</span>
                  </button>
                </div>
              </div>

              {/* What was heard */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/60 text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-200 block mb-1">
                  ما سمعه الذكاء الاصطناعي من نطقك:
                </span>
                <p className="font-mono text-slate-800 dark:text-slate-200 text-sm" dir="ltr">
                  "{analysisResult.transcript_heard}"
                </p>
              </div>

              {/* Word by word breakdown */}
              {analysisResult.word_by_word && analysisResult.word_by_word.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                    التحليل الصوتي كلمة بكلمة:
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-3" dir="ltr">
                    {analysisResult.word_by_word.map((wb, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                          wb.ok
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                        title={wb.problem}
                      >
                        {wb.word}
                      </span>
                    ))}
                  </div>

                  {/* Mouth position tips */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {analysisResult.word_by_word
                      .filter((wb) => !wb.ok && wb.tip_ar)
                      .map((wb, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-xs"
                        >
                          <span className="font-bold text-rose-700 dark:text-rose-400 font-mono" dir="ltr">
                            {wb.word}:
                          </span>{' '}
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {wb.tip_ar}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* General feedback in Egyptian Arabic */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                  💡 تقييم وتوجيه المدرّس:
                </span>
                {analysisResult.explanation_ar}
              </div>

              {/* Street alternative */}
              {analysisResult.natural_alternative_street && (
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 block mb-0.5">
                    🇪🇸 كيف ينطقها ابن البلد في الشارع الإسباني:
                  </span>
                  <p className="font-mono text-indigo-700 dark:text-indigo-300 font-semibold" dir="ltr">
                    "{analysisResult.natural_alternative_street}"
                  </p>
                </div>
              )}
            </div>

            {/* Footer action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                فهمت، شكراً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
