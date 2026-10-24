import React, { useState } from 'react';
import {
  Landmark,
  Sparkles,
  MapPin,
  HelpCircle,
  Eye,
  CheckCircle2,
  Volume2,
  ArrowRight,
} from 'lucide-react';
import { cultureCards } from '../data/cultureData';
import { SentenceCard } from '../components/SentenceCard';
import { CultureCard, DialectType, UILanguageMode } from '../types';
import { playSpanishTTS } from '../utils/speech';

interface CultureModuleProps {
  dialect: DialectType;
  uiLanguageMode: UILanguageMode;
}

export const CultureModule: React.FC<CultureModuleProps> = ({
  dialect,
  uiLanguageMode,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'cities' | 'refranes_cards' | 'etiquette'>('daily');
  const [revealedRefranes, setRevealedRefranes] = useState<Record<string, boolean>>({});

  const cities = cultureCards.filter((c) => c.type === 'city');
  const refranes = cultureCards.filter((c) => c.type === 'refran');
  const etiquetteItems = cultureCards.filter((c) => c.type === 'etiquette');

  // Daily Culture Snippet
  const dailySnippet = {
    title: 'La Sobremesa: المقدّس الإسباني بعد الغداء',
    titleEs: 'El arte de la sobremesa española',
    spanishText: 'En España, la comida no termina cuando se acaba el plato. La sobremesa es la costumbre de quedarse charlando alrededor de la mesa con la familia o los amigos durante una o dos horas, tomando café o una infusión. Es un momento sagrado de conexión humana.',
    arabicText: 'في إسبانيا، لا تنتهي الوجبة بمجرد فراغ الأطباق. "السوبريميسا" هي العادة الإسبانية الأصيلة بالبقاء جالسين حول المائدة مع العائلة أو الأصدقاء لمدة ساعة أو ساعتين لتبادل الأحاديث الودية مع رشف فنجان القهوة. إنها لحظة مقدسة للتواصل الإنساني والترابط الاجتماعي.',
    vocabWords: [
      { es: 'La sobremesa', ar: 'الحديث الطويل حول مائدة الطعام بعد الانتهاء' },
      { es: 'Charlar', ar: 'يتحدث ويدردش بود' },
      { es: 'Costumbre', ar: 'عادة وتقاليد متوارثة' },
    ],
    quiz: {
      question: 'ما هي مدة جلسة السوبريميسا المعتادة في العطلات الإسبانية؟',
      options: ['من ساعة إلى ساعتين تقريباً', 'خمس دقائق فقط', 'عشرون دقيقة', 'لا تحدث في العطلات'],
      answer: 'من ساعة إلى ساعتين تقريباً',
      explanationAr: 'تستمر جلسة السوبريميسا وقتاً طويلاً لأن الإسبان يعتبرون الحديث وتبادل القصص جزءاً أساسياً من متعة الوجبة.',
    },
  };

  const [dailyQuizChoice, setDailyQuizChoice] = useState<string | null>(null);

  const toggleRevealRefran = (id: string) => {
    setRevealedRefranes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Visual Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900 min-h-[170px] flex flex-col justify-end p-6 text-white">
        <img
          src="/src/assets/images/culture_gran_via_madrid_1792879191994.jpg"
          alt="شارع غران فيا في مدريد"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="relative z-10 max-w-xl text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
            <Landmark className="w-3.5 h-3.5 text-amber-400" />
            <span>ثقافة إسبانيا وأمثال الشارع (Cultura y Refranes)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
            الثقافة، المدن، والأمثال الشعبية
          </h2>
          <p className="text-xs text-slate-300 leading-normal">
            فهم نفسية العميل الإسباني، عادات اليوم وجدول المواعيد، الأمثال الدارجة وما يقابلها في العامية المصرية.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'daily', label: 'المقتطف الثقافي اليومي' },
          { id: 'refranes_cards', label: 'بطاقات الأمثال الشعبية (Refranes)' },
          { id: 'cities', label: 'مدن إسبانيا ولهجاتها' },
          { id: 'etiquette', label: 'الإتيكيت وعادات المجتمع' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: DAILY CULTURE SNIPPET */}
      {activeTab === 'daily' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  مقتطف اليوم الثقافي
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {dailySnippet.title}
                </h3>
              </div>
              <button
                onClick={() => playSpanishTTS(dailySnippet.spanishText, dialect, 0.9)}
                className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 hover:bg-amber-100"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Spanish snippet */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800" dir="ltr">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">Español:</span>
              <p className="font-['Plus_Jakarta_Sans',sans-serif] text-sm leading-relaxed text-slate-900 dark:text-slate-100 font-semibold">
                {dailySnippet.spanishText}
              </p>
            </div>

            {/* Arabic translation */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1">الترجمة الكاملة:</span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {dailySnippet.arabicText}
              </p>
            </div>

            {/* 3 Vocab words */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 block mb-2">
                3 مفردات لغوية أساسية من النص:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {dailySnippet.vocabWords.map((vw, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 text-xs">
                    <span className="font-bold font-mono text-amber-700 dark:text-amber-400 block" dir="ltr">
                      {vw.es}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                      {vw.ar}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini quiz */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 space-y-3 text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                سؤال الاستيعاب السريع: {dailySnippet.quiz.question}
              </span>
              <div className="space-y-1.5">
                {dailySnippet.quiz.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setDailyQuizChoice(opt)}
                    className={`w-full p-2.5 rounded-xl border text-right transition-all ${
                      dailyQuizChoice === opt
                        ? opt === dailySnippet.quiz.answer
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold'
                          : 'bg-rose-100 border-rose-500 text-rose-900'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {dailyQuizChoice && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                  {dailySnippet.quiz.explanationAr}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REFRANES CARDS (GUESS & REVEAL) */}
      {activeTab === 'refranes_cards' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            🎭 <strong>بطاقات الأمثال الشعبية (Refranes Españoles):</strong> حاول تخمين المعنى المقصود والمثل المقابل في مصر والعالم العربي ثم اضغط "كشف المعنى والمثل المقابل".
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {refranes.map((ref) => {
              const isRevealed = !!revealedRefranes[ref.id];
              return (
                <div
                  key={ref.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        مثل إسباني شهير
                      </span>
                      <button
                        onClick={() => playSpanishTTS(ref.title, dialect, 0.95)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="text-lg font-bold font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 dark:text-slate-100 mb-1" dir="ltr">
                      «{ref.title}»
                    </h4>
                    <p className="text-xs text-slate-500 mb-2">
                      الترجمة الحرفية: {ref.refranLiteralAr}
                    </p>
                  </div>

                  {isRevealed ? (
                    <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 text-xs space-y-2 animate-in fade-in">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">
                          💡 المعنى الحقيقي البلاغي:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300">{ref.refranRealMeaningAr}</p>
                      </div>

                      <div className="pt-2 border-t border-amber-200/40 dark:border-amber-800/40">
                        <span className="font-bold text-amber-900 dark:text-amber-300 block mb-0.5">
                          🇪🇬 المثل المقابل في مصر والعالم العربي:
                        </span>
                        <p className="text-amber-800 dark:text-amber-200 font-bold">{ref.refranArabicEquivalent}</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleRevealRefran(ref.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>خمن واكشف المعنى والمثل المقابل</span>
                    </button>
                  )}

                  {ref.exampleSentence && (
                    <div className="pt-2">
                      <SentenceCard
                        card={ref.exampleSentence}
                        dialect={dialect}
                        uiLanguageMode={uiLanguageMode}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CITIES & ACCENTS */}
      {activeTab === 'cities' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cities.map((city) => (
              <div
                key={city.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {city.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {city.descriptionAr}
                </p>

                {city.accentTipsAr && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-bold block mb-1">🗣️ خصائص لهجة أهل المدينة:</span>
                    {city.accentTipsAr}
                  </div>
                )}

                {city.stereotypesAndFood && (
                  <div className="text-xs text-slate-500">
                    🍽️ <strong>أشهر الأكلات:</strong> {city.stereotypesAndFood}
                  </div>
                )}

                {city.exampleSentence && (
                  <div className="pt-2">
                    <SentenceCard
                      card={city.exampleSentence}
                      dialect={dialect}
                      uiLanguageMode={uiLanguageMode}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ETIQUETTE & CUSTOMS */}
      {activeTab === 'etiquette' && (
        <div className="max-w-2xl mx-auto space-y-4">
          {etiquetteItems.map((et) => (
            <div
              key={et.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {et.title}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {et.descriptionAr}
              </p>
              {et.accentTipsAr && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  {et.accentTipsAr}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
