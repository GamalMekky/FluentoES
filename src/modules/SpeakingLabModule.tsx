import React, { useState } from 'react';
import {
  Mic,
  Volume2,
  Repeat,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  RotateCcw,
} from 'lucide-react';
import { spanishSoundRules, minimalPairsList } from '../data/phoneticsData';
import { SentenceCard } from '../components/SentenceCard';
import { DialectType, UILanguageMode, SpanishSentenceCard } from '../types';
import { playSpanishTTS } from '../utils/speech';

interface SpeakingLabModuleProps {
  dialect: DialectType;
  uiLanguageMode: UILanguageMode;
}

export const SpeakingLabModule: React.FC<SpeakingLabModuleProps> = ({
  dialect,
  uiLanguageMode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'phonetics' | 'minimal_pairs' | 'shadowing' | 'fluency_drill' | 'dictation' | 'sentence_puzzle'>('phonetics');

  // Shadowing sentences
  const shadowingSentences: SpanishSentenceCard[] = [
    {
      id: 'shad_1',
      spanish: 'Por favor, ¿podría facilitarme el número de su documento de identidad?',
      transliterationAr: 'بور فابور، بودريا فاثيليتارمي إل نوميرو دي سو دوكومينتو دي إيدينتيداد؟',
      ipa: '/poɾ faˈβoɾ poˈðɾi.a faθiliˈtaɾme el ˈnumeɾo ðe su ðokuˈmento ðe iðentiˈðað/',
      arabic: 'من فضلك، هل يمكن لحضرتك تزويدي برقم وثيقة هويتك؟',
      register: 'رسمي',
      category: 'كول سنتر',
    },
    {
      id: 'shad_2',
      spanish: 'Comprendo perfectamente su enfado y ahora mismo procedo a gestionar su solicitud.',
      transliterationAr: 'كومبريندو بيرفكتامينتي سو إنفادو إي أورا ميسمو بروثيدو أ خيستيونار سو سوليثيتود.',
      ipa: '/komˈpɾendo peɾfeɡtaˈmente sw emˈfaðo i aˈoɾa ˈmizmo pɾoˈθeðo a xestjoˈnaɾ su soliθiˈtuð/',
      arabic: 'أفهم تماماً غضب حضرتك وفي هذه اللحظة بالذات أشرع في معالجة طلبك.',
      register: 'رسمي',
      category: 'كول سنتر',
    },
    {
      id: 'shad_3',
      spanish: 'Le confirmo que la incidencia técnica ha quedado resuelta sin coste adicional.',
      transliterationAr: 'لي كونفيرمو كي لا إنثيدينثيا تيكنيكا أ كيدادو ريسويلتا سين كوستي أديثيونال.',
      ipa: '/le komˈfiɾmo ke la nθiˈðenθja ˈteɡnika a keˈðaðo reˈswelta siŋ ˈkoste aðiθjoˈnal/',
      arabic: 'أؤكد لحضرتك أن المشكلة الفنية قد تم حلها دون أي تكلفة إضافية.',
      register: 'رسمي',
      category: 'كول سنتر',
    },
  ];

  // Fluency drill state
  const topics = [
    'صف روتينك الصباحي في العمل (Describe tu rutina de trabajo)',
    'حل مشكلة عميل انقطع عنه الإنترنت (Resuelve la incidencia de internet de un cliente)',
    'ماذا ستفعل لو ربحت جائزة كبرى؟ (¿Qué harías si ganaras la lotería?)',
    'قدم نفسك في مقابلة كول سنتر (Preséntate en una entrevista de trabajo)',
  ];
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [fluencyText, setFluencyText] = useState('');
  const [fluencyEvaluating, setFluencyEvaluating] = useState(false);
  const [fluencyResult, setFluencyResult] = useState<any>(null);

  // Dictation state
  const dictationTasks = [
    {
      es: 'Buenos días, le atiende Carlos de atención al cliente.',
      ar: 'صباح الخير، معك كارلوس من خدمة العملاء.',
    },
    {
      es: '¿Podría confirmar su código postal y dirección?',
      ar: 'هل يمكن لحضرتك تأكيد الرمز البريدي والعنوان؟',
    },
  ];
  const [currentDictIdx, setCurrentDictIdx] = useState(0);
  const [dictationInput, setDictationInput] = useState('');
  const [dictationChecked, setDictationChecked] = useState(false);

  // Sentence Puzzle state
  const puzzle = {
    promptAr: 'رتب الكلمات لتكوين جملة الكول سنتر: "هل يمكن لحضرتك تزويدي ببيانات حسابك؟"',
    words: ['¿Podría', 'facilitarme', 'los', 'datos', 'de', 'su', 'cuenta?'],
    correct: '¿Podría facilitarme los datos de su cuenta?',
  };
  const [shuffledWords, setShuffledWords] = useState<string[]>(['los', '¿Podría', 'de', 'facilitarme', 'cuenta?', 'su', 'datos']);
  const [selectedPuzzleWords, setSelectedPuzzleWords] = useState<string[]>([]);
  const [puzzleSuccess, setPuzzleSuccess] = useState<boolean | null>(null);

  const handleEvaluateFluency = async () => {
    if (!fluencyText.trim()) return;
    setFluencyEvaluating(true);
    setFluencyResult(null);

    try {
      const response = await fetch('/api/gemini/fluency-drill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          transcript: fluencyText,
          durationSeconds: 60,
        }),
      });
      const data = await response.json();
      setFluencyResult(data);
    } catch (e) {
      console.error('Fluency evaluation failed:', e);
    } finally {
      setFluencyEvaluating(false);
    }
  };

  const handlePickPuzzleWord = (word: string, index: number) => {
    setSelectedPuzzleWords((prev) => [...prev, word]);
    setShuffledWords((prev) => prev.filter((_, i) => i !== index));
    setPuzzleSuccess(null);
  };

  const handleRemovePuzzleWord = (word: string, index: number) => {
    setSelectedPuzzleWords((prev) => prev.filter((_, i) => i !== index));
    setShuffledWords((prev) => [...prev, word]);
    setPuzzleSuccess(null);
  };

  const handleCheckPuzzle = () => {
    const constructed = selectedPuzzleWords.join(' ');
    setPuzzleSuccess(constructed === puzzle.correct);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Visual Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900 min-h-[170px] flex flex-col justify-end p-6 text-white">
        <img
          src="/src/assets/images/speaking_lab_acoustics_1792879192054.jpg"
          alt="مختبر الصوتيات والنطق"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="relative z-10 max-w-xl text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
            <Mic className="w-3.5 h-3.5 text-amber-400" />
            <span>نظام النطق الإسباني للمصريين والعرب</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
            مختبر النطق والطلاقة الشفهية
          </h2>
          <p className="text-xs text-slate-300 leading-normal">
            إتقان الحركات الصوتية الخمس، وفارق P vs B، والراء المشددة، مع تحليل التسجيل الصوتي بالذكاء الاصطناعي متعدد الوسائط.
          </p>
        </div>
      </div>

      {/* Mode Sub-nav Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'phonetics', label: 'مخارج الحروف للمصريين' },
          { id: 'minimal_pairs', label: 'الأزواج الصوتية (Minimal Pairs)' },
          { id: 'shadowing', label: 'المحاكاة الفورية (Shadowing)' },
          { id: 'fluency_drill', label: 'تحدي الـ 60 ثانية (Fluency)' },
          { id: 'sentence_puzzle', label: 'ترتيب الجمل (Puzzles)' },
          { id: 'dictation', label: 'الإملاء والسماع (Dictation)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              activeSubTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. PHONETICS GUIDE */}
      {activeSubTab === 'phonetics' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spanishSoundRules.map((rule) => (
              <div
                key={rule.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold font-mono text-amber-700 dark:text-amber-400" dir="ltr">
                    {rule.letter}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    أهمية: {rule.difficultyForEgyptians}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {rule.nameAr}
                </h3>

                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <span className="font-bold block mb-0.5">👄 نصيحة وضع الفم والشفتين:</span>
                  {rule.mouthTipAr}
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                  <span className="font-bold block mb-0.5">⚠️ الفخ الشائع عند المصريين:</span>
                  {rule.egyptianTrapAr}
                </div>

                <div className="pt-2">
                  <SentenceCard
                    card={rule.audioExampleSentence}
                    dialect={dialect}
                    uiLanguageMode={uiLanguageMode}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MINIMAL PAIRS */}
      {activeSubTab === 'minimal_pairs' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
            💡 <strong>الأزواج المتطابقة (Minimal Pairs):</strong> كلمات تتشابه في كل الأصوات ما عدا صوت واحد فقط. إتقان الفرق بينها يمنع أي سوء تفاهم محرج مع العميل الإسباني (مثل الخلط بين لكن والكلب!).
          </div>

          <div className="space-y-5">
            {minimalPairsList.map((mp) => (
              <div
                key={mp.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    مقارنة: {mp.targetSoundContrast}
                  </span>
                  <div className="flex items-center gap-3 font-mono font-bold text-base" dir="ltr">
                    <span className="text-slate-900 dark:text-slate-100">{mp.word1}</span>
                    <span className="text-slate-400">vs</span>
                    <span className="text-amber-700 dark:text-amber-400">{mp.word2}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                  👄 {mp.tipAr}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <SentenceCard
                    card={mp.exampleSentence1}
                    dialect={dialect}
                    uiLanguageMode={uiLanguageMode}
                  />
                  <SentenceCard
                    card={mp.exampleSentence2}
                    dialect={dialect}
                    uiLanguageMode={uiLanguageMode}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SHADOWING MODE */}
      {activeSubTab === 'shadowing' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs leading-relaxed text-indigo-900 dark:text-indigo-200">
            🎙️ <strong>تقنية المحاكاة الظلية (Shadowing):</strong> استمع للجملة من زر الصوت 🔊 ثم اضغط فوراً على الميكروفون 🎤 وردد الجملة بنفس الإيقاع والنبرة والسرعة ليقوم الذكاء الاصطناعي بتقييم تطابقك الصوتي.
          </div>

          <div className="grid grid-cols-1 gap-4">
            {shadowingSentences.map((card) => (
              <SentenceCard
                key={card.id}
                card={card}
                dialect={dialect}
                uiLanguageMode={uiLanguageMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. FLUENCY DRILL (60 SECONDS) */}
      {activeSubTab === 'fluency_drill' && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              تحدي الطلاقة الشفهية لمدة 60 ثانية (Fluency Drill)
            </h3>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
              اختر موضوع التحدث:
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100"
            >
              {topics.map((t, i) => (
                <option key={i} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
              تحدث بالصوت أو اكتب تفريغ ما قلته خلال الدقيقة:
            </label>
            <textarea
              rows={4}
              value={fluencyText}
              onChange={(e) => setFluencyText(e.target.value)}
              placeholder="Hola, hoy quiero explicar cómo he resuelto una incidencia con un cliente enfadado..."
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] text-xs leading-relaxed"
              dir="ltr"
            />
          </div>

          <button
            onClick={handleEvaluateFluency}
            disabled={fluencyEvaluating || !fluencyText.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-sm transition-all"
          >
            {fluencyEvaluating ? 'جارٍ تحليل الطلاقة وسرعة الكلام...' : 'تقييم الطلاقة بالذكاء الاصطناعي (B2 Examiner)'}
          </button>

          {fluencyResult && (
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">السرعة (كلمة/دقيقة)</span>
                  <span className="text-xl font-bold font-mono text-amber-600">{fluencyResult.words_per_minute || 85} WPM</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">درجة الطلاقة</span>
                  <span className="text-xl font-bold font-mono text-emerald-600">{fluencyResult.overall_fluency_score || 78}%</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">دقة القواعد</span>
                  <span className="text-xl font-bold font-mono text-blue-600">{fluencyResult.grammar_score || 80}%</span>
                </div>
              </div>

              {fluencyResult.coach_feedback_ar && (
                <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <strong className="block text-slate-900 dark:text-slate-100 mb-1">💡 نصائح المدرب الشفهي:</strong>
                  {fluencyResult.coach_feedback_ar}
                </div>
              )}

              {fluencyResult.improved_b2_version && (
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 block mb-1">
                    🌟 كيف يصيغها موظف B2 محترف بطلاقة:
                  </span>
                  <p className="font-mono text-slate-800 dark:text-slate-200 mb-1" dir="ltr">
                    "{fluencyResult.improved_b2_version}"
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 font-['Cairo',sans-serif]">
                    {fluencyResult.improved_b2_ar}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. SENTENCE PUZZLE */}
      {activeSubTab === 'sentence_puzzle' && (
        <div className="max-w-xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mb-1">
              لغز ترتيب الكلمات (Word-Order Puzzle):
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {puzzle.promptAr}
            </p>
          </div>

          {/* Constructed Sentence Area */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 min-h-[70px] border border-dashed border-slate-300 dark:border-slate-700 flex flex-wrap items-center gap-2" dir="ltr">
            {selectedPuzzleWords.length === 0 ? (
              <span className="text-xs text-slate-400 italic">اضغط على الكلمات بالأسفل لترتيبها هنا بالترتيب الصحيح...</span>
            ) : (
              selectedPuzzleWords.map((w, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRemovePuzzleWord(w, idx)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs font-mono shadow-xs hover:bg-amber-600 transition-colors"
                >
                  {w} ✕
                </button>
              ))
            )}
          </div>

          {/* Word Bank */}
          <div className="flex flex-wrap gap-2 justify-center" dir="ltr">
            {shuffledWords.map((w, idx) => (
              <button
                key={idx}
                onClick={() => handlePickPuzzleWord(w, idx)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs transition-colors border border-slate-200 dark:border-slate-700"
              >
                {w}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleCheckPuzzle}
              disabled={selectedPuzzleWords.length === 0}
              className="flex-1 py-3 px-5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              تحقق من الترتيب
            </button>
            <button
              onClick={() => {
                setShuffledWords(['los', '¿Podría', 'de', 'facilitarme', 'cuenta?', 'su', 'datos']);
                setSelectedPuzzleWords([]);
                setPuzzleSuccess(null);
              }}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {puzzleSuccess !== null && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold animate-in fade-in ${
                puzzleSuccess
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {puzzleSuccess ? '🎉 ترتيب صحيح ممتاز! جملة كول سنتر قياسية.' : '❌ الترتيب غير سليم، تذكر أن الفعل Podría يليه المصدر facilitarme مباشرة.'}
            </div>
          )}
        </div>
      )}

      {/* 6. DICTATION */}
      {activeSubTab === 'dictation' && (
        <div className="max-w-xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              تمرين الإملاء والتمييز السمعي (Dictation)
            </h3>
            <span className="text-xs text-slate-400">تدريب {currentDictIdx + 1} من {dictationTasks.length}</span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-3">
            <span className="text-xs text-slate-500 block">اضغط للاستماع ثم اكتب ما سمعته بدقة:</span>
            <button
              onClick={() => playSpanishTTS(dictationTasks[currentDictIdx].es, dialect, 0.85)}
              className="p-4 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md inline-flex items-center justify-center transition-transform active:scale-95"
            >
              <Volume2 className="w-6 h-6" />
            </button>
            <p className="text-xs text-slate-400">ملاحظة: تأكد من علامات الاستفهام والنبرات (tildes).</p>
          </div>

          <div dir="ltr">
            <input
              type="text"
              value={dictationInput}
              onChange={(e) => {
                setDictationInput(e.target.value);
                setDictationChecked(false);
              }}
              placeholder="اكتب ما سمعته بالإسبانية هنا..."
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] text-sm font-semibold"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDictationChecked(true)}
              className="flex-1 py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
            >
              مطابقة الإملاء
            </button>
            {currentDictIdx < dictationTasks.length - 1 && (
              <button
                onClick={() => {
                  setCurrentDictIdx((prev) => prev + 1);
                  setDictationInput('');
                  setDictationChecked(false);
                }}
                className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                التالي ➔
              </button>
            )}
          </div>

          {dictationChecked && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2 animate-in fade-in">
              <span className="font-bold text-slate-500 block">الجملة الأصلية الصحيحة:</span>
              <p className="font-mono text-sm text-slate-900 dark:text-slate-100 font-bold" dir="ltr">
                {dictationTasks[currentDictIdx].es}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                الترجمة: {dictationTasks[currentDictIdx].ar}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
