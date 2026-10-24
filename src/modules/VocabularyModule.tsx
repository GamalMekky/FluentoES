import React, { useState } from 'react';
import {
  Layers,
  RotateCw,
  Check,
  X,
  Volume2,
  AlertCircle,
  Sparkles,
  BookMarked,
  FileText,
  Plus,
} from 'lucide-react';
import { SRSCard, MistakeItem, DialectType, UILanguageMode, SpanishSentenceCard } from '../types';
import { loadSRSDeck, saveSRSDeck, loadMistakeBank, saveMistakeBank, addCardToSRSDeck } from '../utils/storage';
import { calculateSM2, isCardDueToday } from '../utils/srs';
import { playSpanishTTS } from '../utils/speech';

interface VocabularyModuleProps {
  dialect: DialectType;
  uiLanguageMode: UILanguageMode;
}

export const VocabularyModule: React.FC<VocabularyModuleProps> = ({
  dialect,
  uiLanguageMode,
}) => {
  const [activeTab, setActiveTab] = useState<'srs' | 'mistakes' | 'frequency' | 'false_friends' | 'reader'>('srs');
  const [srsDeck, setSrsDeck] = useState<SRSCard[]>(() => loadSRSDeck());
  const [mistakeBank, setMistakeBank] = useState<MistakeItem[]>(() => loadMistakeBank());

  // SRS Study Session state
  const dueCards = srsDeck.filter(isCardDueToday);
  const [currentDueIdx, setCurrentDueIdx] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [studyMode, setStudyMode] = useState<'es_to_ar' | 'ar_to_es' | 'listening'>('es_to_ar');

  // Reader state
  const readerStory = {
    title: 'Primer día en el centro de atención al cliente en Madrid',
    titleAr: 'اليوم الأول في مركز خدمة العملاء بمدريد',
    text: 'Hoy es mi primer día de trabajo en el centro de llamadas. Me pongo los auriculares y abro el sistema informático. Mi supervisor me dice que lo más importante es escuchar al cliente con mucha paciencia y responder siempre de usted.',
  };
  const [selectedWord, setSelectedWord] = useState<{ word: string; translation: string } | null>(null);

  // Arabic loanwords / false friends dataset
  const arabicLoanwords = [
    { es: 'Almohada', ar: 'مِخَدّة (مشتقة من: المِخدّة)', note: 'أكثر من 4000 كلمة في الإسبانية أصلها عربي أندلسي تبدأ غالباً بـ Al-.' },
    { es: 'Aceite', ar: 'زيت الزيتون (مشتقة من: الزيت)', note: 'الزيت في الإسبانية هو Aceite، والزيتون هو Aceituna.' },
    { es: 'Azúcar', ar: 'سكر (مشتقة من: السُكّر)', note: 'نفس الكلمة والنطق تقريباً.' },
    { es: 'Barrio', ar: 'حي أو منطقة سكنية (مشتقة من: بَرّ / برّي)', note: 'مستخدمة يومياً في كل مدن إسبانيا.' },
    { es: 'Ojalá', ar: 'يا ليت / إن شاء الله (مشتقة من: لو شاء الله)', note: 'يأتي بعدها دائماً Subjuntivo.' },
    { es: 'Alcalde', ar: 'عمدة المدينة (مشتقة من: القاضي)', note: 'مسؤول بلدية المدينة.' },
    { es: 'Tarifa', ar: 'تعريفة / باقة أسعار (مشتقة من: تعريفة / طريفة)', note: 'كلمة أساسية يومياً في الكول سنتر.' },
    { es: 'Aduana', ar: 'الجمارك (مشتقة من: الديوان)', note: 'تستخدم في الشحن والتجارة الدولية.' },
  ];

  // Frequency vocab
  const frequencyLists = {
    A1: [
      { es: 'Llamar', ar: 'يتصل هاتفياً / ينادي' },
      { es: 'Ayudar', ar: 'يساعد' },
      { es: 'Factura', ar: 'فاتورة' },
      { es: 'Esperar', ar: 'ينتظر / يتمنى' },
      { es: 'Preguntar', ar: 'يسأل' },
    ],
    A2: [
      { es: 'Reclamación', ar: 'شكوى واعتراض رسمي' },
      { es: 'Titular', ar: 'صاحب العقد أو الحساب' },
      { es: 'Devolución', ar: 'استرداد مالي / إرجاع' },
      { es: 'Comprobar', ar: 'يتحقق ويفحص' },
      { es: 'Avería', ar: 'عطل فني' },
    ],
    B1: [
      { es: 'Descuento', ar: 'خصم أو تخفيض' },
      { es: 'Suscripción', ar: 'اشتراك دوري' },
      { es: 'Incidencia', ar: 'مشكلة تشغيلية عاجلة' },
      { es: 'Tramitar', ar: 'يباشر معاملة أو إجراء' },
      { es: 'Penalización', ar: 'غرامة أو شرط جزائي' },
    ],
    B2: [
      { es: 'Desestimar', ar: 'يرفض الشكوى لعدم الاختصاص' },
      { es: 'Indemnización', ar: 'تعويض مالي عن ضرر' },
      { es: 'Incompatibilidad', ar: 'تعارض فني أو شروط متضاربة' },
      { es: 'Proceder a', ar: 'يشرع رسمياً في تنفيذ الإجراء' },
      { es: 'Abono en cuenta', ar: 'تسوية مالية في رصيد الحساب' },
    ],
  };

  const handleSM2Rate = (quality: number) => {
    if (dueCards.length === 0) return;
    const currentCard = dueCards[currentDueIdx];
    const updated = calculateSM2(currentCard, quality);

    const newDeck = srsDeck.map((c) => (c.id === updated.id ? updated : c));
    setSrsDeck(newDeck);
    saveSRSDeck(newDeck);

    setIsAnswerRevealed(false);
    if (currentDueIdx < dueCards.length - 1) {
      setCurrentDueIdx((prev) => prev + 1);
    } else {
      setCurrentDueIdx(0);
    }
  };

  const handleResolveMistake = (id: string) => {
    const updated = mistakeBank.map((m) => (m.id === id ? { ...m, resolved: !m.resolved } : m));
    setMistakeBank(updated);
    saveMistakeBank(updated);
  };

  const handleAddMistakeToSRS = (m: MistakeItem) => {
    const card: SpanishSentenceCard = {
      id: `mistake_card_${m.id}`,
      spanish: m.correction,
      transliterationAr: 'مراجعة من بنك الأخطاء',
      ipa: '',
      arabic: m.explanationAr,
      register: 'رسمي',
      category: m.category,
    };
    addCardToSRSDeck(card);
    setSrsDeck(loadSRSDeck());
  };

  const currentDueCard = dueCards[currentDueIdx];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              المفردات والتكرار المتباعد (SRS & Vocabulario)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            خوارزمية SM-2 لتثبيت الجمل في الذاكرة طويلة المدى، وبنك الأخطاء التلقائي، والمفردات ذات الأصل العربي.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
          {[
            { id: 'srs', label: `المراجعة اليومية (${dueCards.length})` },
            { id: 'mistakes', label: `بنك الأخطاء (${mistakeBank.filter((m) => !m.resolved).length})` },
            { id: 'frequency', label: 'القوائم حسب المستوى' },
            { id: 'false_friends', label: 'أصول عربية 🇪🇸' },
            { id: 'reader', label: 'القارئ الذكي' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SM-2 SRS REVIEW SESSION */}
      {activeTab === 'srs' && (
        <div className="max-w-xl mx-auto space-y-6">
          {dueCards.length === 0 ? (
            <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Check className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                أحسنت! لا توجد بطاقات متأخرة للمراجعة اليوم
              </h3>
              <p className="text-xs text-slate-500">
                يمكنك إضافة جمل جديدة لمراجعتك بالضغط على زر "احفظ في بطاقاتي" في أي درس أو سيناريو.
              </p>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              {/* Card Header & Controls */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  بطاقة {currentDueIdx + 1} من {dueCards.length}
                </span>

                <div className="flex items-center gap-1">
                  {(['es_to_ar', 'ar_to_es', 'listening'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setStudyMode(m)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        studyMode === m
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m === 'es_to_ar' ? 'إسباني ➔ عربي' : m === 'ar_to_es' ? 'عربي ➔ إسباني' : 'استماع 🎧'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Front of Card */}
              <div className="text-center py-6 space-y-4">
                {studyMode === 'es_to_ar' && (
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]" dir="ltr">
                    {currentDueCard.card.spanish}
                  </p>
                )}

                {studyMode === 'ar_to_es' && (
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {currentDueCard.card.arabic}
                  </p>
                )}

                {studyMode === 'listening' && (
                  <div className="space-y-3">
                    <button
                      onClick={() => playSpanishTTS(currentDueCard.card.spanish, dialect, 0.9)}
                      className="p-5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md inline-flex items-center justify-center transition-transform active:scale-95"
                    >
                      <Volume2 className="w-8 h-8" />
                    </button>
                    <p className="text-xs text-slate-400">استمع للجملة وخمن معناها قبل كشف الإجابة.</p>
                  </div>
                )}

                <button
                  onClick={() => playSpanishTTS(currentDueCard.card.spanish, dialect, 1.0)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-semibold"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>نطق الجملة</span>
                </button>
              </div>

              {/* Reveal Button or Answer */}
              {!isAnswerRevealed ? (
                <button
                  onClick={() => setIsAnswerRevealed(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  كشف الإجابة والترجمة
                </button>
              ) : (
                <div className="space-y-5 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-right space-y-2">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {currentDueCard.card.arabic}
                    </p>
                    <p className="font-mono text-sm text-amber-800 dark:text-amber-300" dir="ltr">
                      {currentDueCard.card.spanish}
                    </p>
                    <span className="text-xs text-slate-500 block">
                      🗣️ النطق: «{currentDueCard.card.transliterationAr}»
                    </span>
                  </div>

                  {/* SM-2 Rating Buttons (0 to 5) */}
                  <div className="space-y-2 text-center">
                    <span className="text-xs text-slate-500 block font-semibold">
                      كيف كان تذكرك للجملة؟ (خوارزمية SM-2)
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => handleSM2Rate(1)}
                        className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-colors"
                      >
                        نسيتها تماماً
                        <span className="block text-[10px] opacity-70">إعادة غداً</span>
                      </button>
                      <button
                        onClick={() => handleSM2Rate(3)}
                        className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors"
                      >
                        بصعوبة
                        <span className="block text-[10px] opacity-70">بعد يومين</span>
                      </button>
                      <button
                        onClick={() => handleSM2Rate(4)}
                        className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-colors"
                      >
                        جيد
                        <span className="block text-[10px] opacity-70">بعد 4 أيام</span>
                      </button>
                      <button
                        onClick={() => handleSM2Rate(5)}
                        className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
                      >
                        تذكر فوري!
                        <span className="block text-[10px] opacity-70">بعد أسبوع</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MISTAKE BANK */}
      {activeTab === 'mistakes' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            🧠 <strong>بنك الأخطاء الذكي (Banco de Errores):</strong> يتم تسجيل كل خطأ ترتكبه في أي اختبار أو محاكاة مكالمة تلقائياً هنا ليتحول إلى عنصر مراجعة حتى تتخلص منه نهائياً قبل مقابلة العمل.
          </div>

          <div className="space-y-3">
            {mistakeBank.map((m) => (
              <div
                key={m.id}
                className={`p-5 rounded-3xl border transition-all space-y-3 ${
                  m.resolved
                    ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/60 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    تصنيف: {m.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddMistakeToSRS(m)}
                      className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة للمراجعة</span>
                    </button>
                    <button
                      onClick={() => handleResolveMistake(m.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        m.resolved
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {m.resolved ? 'مُتقن ✅' : 'تم تصحيحه؟'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1 font-mono text-xs" dir="ltr">
                  <p className="text-rose-600 line-through font-bold">❌ {m.mistake}</p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-bold">✅ {m.correction}</p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-['Cairo',sans-serif]">
                  💡 التوضيح: {m.explanationAr}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FREQUENCY VOCAB LISTS */}
      {activeTab === 'frequency' && (
        <div className="max-w-2xl mx-auto space-y-5">
          {(['A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
            <div
              key={lvl}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  أهم مفردات مستوى {lvl} الأكثر تكراراً في العمل
                </h3>
                <span className="text-xs font-mono text-amber-600 font-bold">Nivel {lvl}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" dir="ltr">
                {frequencyLists[lvl].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{item.es}</span>
                    <span className="text-slate-600 dark:text-slate-300 font-['Cairo',sans-serif]" dir="rtl">{item.ar}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: ARABIC LOANWORDS */}
      {activeTab === 'false_friends' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            🇪🇸 <strong>الكلمات الإسبانية ذات الأصل العربي:</strong> أكثر من 4000 كلمة في اللغة الإسبانية تعود أصولها إلى الحضارة الأندلسية، ومعرفتها تسهل عليك حفظ مئات الكلمات دون مجهود!
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {arabicLoanwords.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="text-base font-extrabold text-amber-700 dark:text-amber-400" dir="ltr">
                    {item.es}
                  </span>
                  <button
                    onClick={() => playSpanishTTS(item.es, dialect, 1.0)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {item.ar}
                </p>
                <p className="text-[11px] text-slate-500 leading-normal">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COMPREHENSIBLE INPUT READER */}
      {activeTab === 'reader' && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                القارئ التفاعلي الذكي (Lector Interactivo)
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {readerStory.title}
              </h3>
            </div>
            <button
              onClick={() => playSpanishTTS(readerStory.text, dialect, 0.9)}
              className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-400">
            اضغط على أي كلمة في القصة الإسبانية لمعرفة معناها وإضافتها لبطاقات المراجعة فوراً:
          </p>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 leading-loose text-base font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 dark:text-slate-200 flex flex-wrap gap-1.5" dir="ltr">
            {readerStory.text.split(' ').map((w, idx) => (
              <span
                key={idx}
                onClick={() => setSelectedWord({ word: w.replace(/[.,]/g, ''), translation: 'مفردة من قصة الكول سنتر' })}
                className="cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-900/60 rounded px-1 transition-colors"
              >
                {w}
              </span>
            ))}
          </div>

          {selectedWord && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 flex items-center justify-between text-xs animate-in fade-in">
              <div>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 block" dir="ltr">
                  {selectedWord.word}
                </span>
                <span className="text-slate-600 dark:text-slate-300">ترجمة ومعنى الكلمة في سياق النص</span>
              </div>
              <button
                onClick={() => {
                  addCardToSRSDeck({
                    id: `reader_${Date.now()}`,
                    spanish: selectedWord.word,
                    transliterationAr: 'مفردة من القارئ',
                    ipa: '',
                    arabic: selectedWord.translation,
                    register: 'محايد',
                  });
                  setSrsDeck(loadSRSDeck());
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-600 transition-colors"
              >
                + حفظ في البطاقات
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
