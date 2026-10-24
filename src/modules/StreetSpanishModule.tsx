import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { streetExpressions } from '../data/streetSpanishData';
import { StreetExpression, DialectType, UILanguageMode } from '../types';
import { playSpanishTTS } from '../utils/speech';

interface StreetSpanishModuleProps {
  dialect: DialectType;
  uiLanguageMode: UILanguageMode;
}

export const StreetSpanishModule: React.FC<StreetSpanishModuleProps> = ({
  dialect,
  uiLanguageMode,
}) => {
  const [activeTab, setActiveTab] = useState<'expressions' | 'native_checker' | 'quiz'>('expressions');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Native checker state
  const [checkerSentence, setCheckerSentence] = useState('');
  const [checkerContext, setCheckerContext] = useState('general');
  const [checkerLoading, setCheckerLoading] = useState(false);
  const [checkerResult, setCheckerResult] = useState<any>(null);

  // Slang Quiz state
  const slangQuizQuestions = [
    {
      q: 'إذا قال لك زميلك الإسباني في العمل: "Estoy hecho polvo"، فماذا يقصد؟',
      options: ['أنه ميت من التعب والإرهاق الشديد', 'أنه جائع جداً ويريد الأكل', 'أنه ربح أموالاً كثيرة', 'أنه غاضب من المشرف'],
      answer: 'أنه ميت من التعب والإرهاق الشديد',
      explAr: 'تعبير "estar hecho polvo" يعني حرفياً تحول لغبار، ويقصد به الإرهاق التام.',
    },
    {
      q: 'عميل قال لك في مكالمة رسمية: "¡Esto es una chapuza!". ما هو الرد السليم؟',
      options: [
        'Lamento que tenga esa impresión, le envío un técnico experto de inmediato.',
        '¡Pues vaya chapuza, tío!',
        'No digas eso de mi curro.',
        '¿Cuánto pavos quieres?',
      ],
      answer: 'Lamento que tenga esa impresión, le envío un técnico experto de inmediato.',
      explAr: 'Chapuza تعني عملاً سيئاً ورديئاً، وموظف الكول سنتر يمتص غضبه بأدب ورسمية دون استخدام العامية.',
    },
  ];
  const [quizIdx, setQuizIdx] = useState(0);
  const [userQuizChoice, setUserQuizChoice] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'كل التعبيرات' },
    { id: 'greetings', label: 'التحيات والكلام اليومي' },
    { id: 'agreement', label: 'الموافقة والإعجاب' },
    { id: 'surprise', label: 'المفاجأة والدهشة' },
    { id: 'work', label: 'الشغل والكول سنتر' },
    { id: 'money', label: 'الفلوس والأسعار' },
    { id: 'fillers', label: 'لوازم اللسان الحشوية' },
    { id: 'reductions', label: 'اختصارات الكلام السريع' },
    { id: 'insults_warning', label: '⚠️ إهانات للتعرف عليها فقط' },
  ];

  const filteredExpressions = streetExpressions.filter((exp) => {
    const matchesCat = selectedCategory === 'all' || exp.category === selectedCategory;
    const matchesSearch =
      exp.streetSpanish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.arabic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.standardSpanish.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCheckNative = async () => {
    if (!checkerSentence.trim() || checkerLoading) return;
    setCheckerLoading(true);
    setCheckerResult(null);

    try {
      const response = await fetch('/api/gemini/native-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence: checkerSentence,
          dialect,
          context: checkerContext,
        }),
      });
      const data = await response.json();
      setCheckerResult(data);
    } catch (e) {
      console.error('Native checker error:', e);
    } finally {
      setCheckerLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              الشارع الإسباني (Street Spanish & Jerga)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تعبيرات الحياة اليومية الحقيقية مع مقابلها الفصيح، متى تستخدمها ومتى تحذر منها تماماً في الكول سنتر.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setActiveTab('expressions')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'expressions'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            قاموس الشارع (80+)
          </button>
          <button
            onClick={() => setActiveTab('native_checker')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'native_checker'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            فاحص ابن البلد AI
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'quiz'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            كويز العامية
          </button>
        </div>
      </div>

      {/* TAB 1: EXPRESSIONS LIST */}
      {activeTab === 'expressions' && (
        <div className="space-y-6">
          {/* Search & Categories */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن كلمة عامية أو ترجمتها بالعربية (مثال: tío, currar, pasta)..."
                className="w-full py-3 pr-10 pl-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Expressions Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExpressions.map((exp) => (
              <div
                key={exp.id}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-4 transition-all ${
                  exp.category === 'insults_warning'
                    ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header: Street vs Standard */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="text-left font-['Plus_Jakarta_Sans',sans-serif]" dir="ltr">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-extrabold text-amber-700 dark:text-amber-400">
                        {exp.streetSpanish}
                      </h3>
                      <button
                        onClick={() => playSpanishTTS(exp.streetSpanish, dialect, 1.0)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-slate-400 block font-mono">
                      المقابل الفصيح: {exp.standardSpanish}
                    </span>
                  </div>

                  <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {exp.register}
                  </span>
                </div>

                {/* Arabic Translation & Pronunciation */}
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {exp.arabic}
                  </p>
                  <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    🗣️ النطق: «{exp.transliterationAr}»
                  </span>
                </div>

                {/* When to use vs When NOT to use (Call center warning) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60 text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                      ✅ أين ومتى تقال:
                    </span>
                    {exp.whenToUseAr}
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/60 text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-rose-800 dark:text-rose-300 block mb-0.5">
                      ⚠️ متى تحذر منها (الكول سنتر):
                    </span>
                    {exp.whenNOTToUseAr}
                  </div>
                </div>

                {/* Sample Dialogue */}
                {exp.dialogue.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 block">حوار واقعي في الشارع:</span>
                    <div className="space-y-1 font-mono" dir="ltr">
                      <p className="text-slate-900 dark:text-slate-100">
                        <strong>A:</strong> {exp.dialogue[0].speakerA}
                      </p>
                      <p className="text-amber-700 dark:text-amber-400 font-bold">
                        <strong>B:</strong> {exp.dialogue[0].speakerB}
                      </p>
                    </div>
                    <div className="text-[11px] text-slate-500 font-['Cairo',sans-serif] pt-1 border-t border-slate-200 dark:border-slate-700">
                      {exp.dialogue[0].arabicA} — {exp.dialogue[0].arabicB}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: "WOULD A NATIVE SAY THIS?" CHECKER */}
      {activeTab === 'native_checker' && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              فاحص الجمل "هل يقولها الإسباني الأصلي هكذا؟"
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            اكتب أي جملة بالإسبانية، والذكاء الاصطناعي سيخبرك إن كانت تبدو لغة كتب وروبوت، أم لغة شارع طبيعية، وما إذا كانت مناسبة لمكالمة كول سنتر رسمية.
          </p>

          <div className="space-y-3" dir="ltr">
            <textarea
              rows={3}
              value={checkerSentence}
              onChange={(e) => setCheckerSentence(e.target.value)}
              placeholder="Ejemplo: Yo quiero decirte que tu problema no tiene solución..."
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex items-center justify-between text-xs" dir="rtl">
              <span className="text-slate-500">السياق:</span>
              <div className="flex items-center gap-1">
                {['general', 'callcenter', 'street'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCheckerContext(c)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      checkerContext === c
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {c === 'general' ? 'عام' : c === 'callcenter' ? 'كول سنتر' : 'شارع وأصدقاء'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCheckNative}
              disabled={checkerLoading || !checkerSentence.trim()}
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-sm transition-all"
            >
              {checkerLoading ? 'جارٍ الفحص اللغوي الدقيق...' : 'افحص طبيعية الجملة الآن'}
            </button>
          </div>

          {/* Results */}
          {checkerResult && (
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  حكم المتحدث الأصلي:
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  {checkerResult.naturalness_rating === 'natural' ? 'طبيعية جداً ✅' : checkerResult.naturalness_rating === 'textbook' ? 'لغة كتب وروبوتية 📖' : 'عامية شارع 🗣️'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {checkerResult.verdict_ar}
              </div>

              {/* Call center version */}
              {checkerResult.call_center_formal_version && (
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
                  <span className="font-bold text-blue-900 dark:text-blue-200 block mb-1">
                    💼 كيف تصيغها بأدب واحترافية للعميل في الكول سنتر:
                  </span>
                  <p className="font-mono text-slate-900 dark:text-slate-100 font-bold text-sm mb-1" dir="ltr">
                    "{checkerResult.call_center_formal_version.spanish}"
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    {checkerResult.call_center_formal_version.arabic}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SLANG QUIZ */}
      {activeTab === 'quiz' && (
        <div className="max-w-xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              اختبار فهم الشارع والعامية الإسبانية
            </h3>
            <span className="text-xs text-slate-400">سؤال {quizIdx + 1} من {slangQuizQuestions.length}</span>
          </div>

          {(() => {
            const currentQ = slangQuizQuestions[quizIdx];
            return (
              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-normal">
                  {currentQ.q}
                </p>

                <div className="space-y-2.5">
                  {currentQ.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setUserQuizChoice(opt)}
                      className={`w-full p-3.5 rounded-2xl border text-right text-xs transition-all ${
                        userQuizChoice === opt
                          ? opt === currentQ.answer
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                            : 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {userQuizChoice && (
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed animate-in fade-in ${
                      userQuizChoice === currentQ.answer
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200'
                        : 'bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-200'
                    }`}
                  >
                    <span className="font-bold block mb-1">
                      {userQuizChoice === currentQ.answer ? 'إجابة صحيحة 100%! 👍' : `خطأ. الإجابة الصحيحة هي: ${currentQ.answer}`}
                    </span>
                    <p>{currentQ.explAr}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
