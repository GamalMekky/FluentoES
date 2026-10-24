import React, { useState } from 'react';
import {
  BookOpen,
  Shuffle,
  GitCompare,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';
import { tensesLessons } from '../data/tensesData';
import { SentenceCard } from '../components/SentenceCard';
import { TenseLesson, DialectType, UILanguageMode } from '../types';
import { recordMistake } from '../utils/storage';

interface TensesLabModuleProps {
  dialect: DialectType;
  uiLanguageMode: UILanguageMode;
}

export const TensesLabModule: React.FC<TensesLabModuleProps> = ({
  dialect,
  uiLanguageMode,
}) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'conjugator' | 'contrast'>('lessons');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(tensesLessons[0].id);

  // Mini-exercises interactive state
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [exerciseFeedback, setExerciseFeedback] = useState<Record<string, boolean>>({});

  // Conjugation Trainer state
  const [trainerVerb, setTrainerVerb] = useState({ verb: 'Trabajar (يعمل)', tense: 'Presente', pronoun: 'Nosotros', answer: 'trabajamos' });
  const [trainerInput, setTrainerInput] = useState('');
  const [trainerResult, setTrainerResult] = useState<boolean | null>(null);
  const [trainerScore, setTrainerScore] = useState(0);

  // Contrast Trainer state
  const contrastPairs = [
    {
      title: 'Pretérito Indefinido vs Pretérito Imperfecto (الماضي التام vs الماضي المستمر)',
      ruleAr: 'الـ Indefinido للحدث القاطع المكتمل في توقيت محدد (Ayer hablé)، والـ Imperfecto للوصف والعادة وخلفية الأحداث (Cuando era joven, hablaba).',
      examples: [
        { es: 'Ayer llamé al cliente a las diez.', ar: 'أمس اتصلت بالعميل في العاشرة (حدث قاطع = Indefinido).' },
        { es: 'El cliente estaba muy enfadado cuando le llamé.', ar: 'العميل كان غاضباً جداً (وصف حالة = Imperfecto) عندما اتصلت به (حدث قاطع = Indefinido).' },
      ],
      quiz: {
        q: 'Mientras yo _______ (revisar) la cuenta, la llamada se cortó.',
        options: ['revisaba', 'revisé', 'he revisado'],
        answer: 'revisaba',
        explAr: 'حدث مستمر في الخلفية قطعه حدث آخر، لذلك نستخدم Imperfecto: revisaba.',
      },
    },
    {
      title: 'Ser vs Estar (يكون الدائم vs يكون المؤقت/المكان)',
      ruleAr: 'Ser للهوية، الجنسية، المهنة، والصفات الثابتة (Soy agente de soporte). Estar للمكان، والحالة المؤقتة والمشاعر (Estoy ocupado, El rúter está averiado).',
      examples: [
        { es: 'Soy agente telefónico en Vodafone.', ar: 'أنا موظف خدمة عملاء في فودافون (مهنة ثابتة = Ser).' },
        { es: 'Estoy disponible para atender su llamada.', ar: 'أنا متاح حالياً للرد على مكالمتك (حالة مؤقتة = Estar).' },
      ],
      quiz: {
        q: 'La factura _______ incorrecta porque hay un error en el total.',
        options: ['está', 'es', 'sea'],
        answer: 'está',
        explAr: 'الخطأ حالة عارضة ومؤقتة في الفاتورة وليست هوية ثابتة، لذلك نستخدم está.',
      },
    },
    {
      title: 'Por vs Para (بسبب / عبر vs لأجل / لكي / الموعد النهائي)',
      ruleAr: 'Por للسبب، المدة، والواسطة (por teléfono, por correo). Para للهدف، المستقبل، والمستلم (para el cliente, para mañana).',
      examples: [
        { es: 'Le llamo por su reclamación.', ar: 'أتصل بحضرتك بخصوص/بسبب شكواك (سبب = Por).' },
        { es: 'Este informe es para el supervisor.', ar: 'هذا التقرير مخصص للمشرف (المستلم/الهدف = Para).' },
      ],
      quiz: {
        q: 'Le enviaremos el técnico _______ comprobar la instalación.',
        options: ['para', 'por', 'de'],
        answer: 'para',
        explAr: 'لكي يتحقق / لأجل التحقق (هدف وغرض = Para).',
      },
    },
    {
      title: 'Subjuntivo vs Indicativo (الشك والرغبة vs اليقين والواقع)',
      ruleAr: 'Indicativo للحقائق المؤكدة (Sé que usted pagó). Subjuntivo للشك، الطلب، والرجاء (Quiero que usted pague, Dudo que sea verdad).',
      examples: [
        { es: 'Es verdad que el servicio funciona.', ar: 'حقيقة مؤكدة = Indicativo.' },
        { es: 'Espero que el servicio funcione bien.', ar: 'تمنٍ ورجاء = Subjuntivo.' },
      ],
      quiz: {
        q: 'No creo que el fallo _______ (ser) de nuestro servidor.',
        options: ['sea', 'es', 'era'],
        answer: 'sea',
        explAr: 'بعد نفي الاعتقاد (No creo que...) نستخدم دائماً Subjuntivo: sea.',
      },
    },
  ];

  const [activeContrastIdx, setActiveContrastIdx] = useState(0);
  const [contrastUserChoice, setContrastUserChoice] = useState<string | null>(null);

  const currentLesson = tensesLessons.find((l) => l.id === selectedLessonId) || tensesLessons[0];

  const handleAnswerExercise = (exId: string, choice: string, correct: string, explAr: string) => {
    setExerciseAnswers((prev) => ({ ...prev, [exId]: choice }));
    const isOk = choice.trim().toLowerCase() === correct.trim().toLowerCase();
    setExerciseFeedback((prev) => ({ ...prev, [exId]: isOk }));

    if (!isOk) {
      recordMistake('الأزمنة', choice, correct, explAr);
    }
  };

  const handleNextTrainerVerb = () => {
    const verbs = [
      { verb: 'Hablar (يتحدث)', tense: 'Presente', pronoun: 'Yo', answer: 'hablo' },
      { verb: 'Comer (يأكل)', tense: 'Pretérito Perfecto', pronoun: 'Yo', answer: 'he comido' },
      { verb: 'Llamar (يتصل)', tense: 'Pretérito Indefinido', pronoun: 'Usted', answer: 'llamó' },
      { verb: 'Hacer (يعمل)', tense: 'Pretérito Indefinido', pronoun: 'Yo', answer: 'hice' },
      { verb: 'Poder (يستطيع)', tense: 'Condicional Simple', pronoun: 'Usted', answer: 'podría' },
      { verb: 'Tener (يمتلك)', tense: 'Presente de Subjuntivo', pronoun: 'Usted', answer: 'tenga' },
      { verb: 'Decir (يقول)', tense: 'Pretérito Indefinido', pronoun: 'Él', answer: 'dijo' },
      { verb: 'Ir (يذهب)', tense: 'Futuro Simple', pronoun: 'Nosotros', answer: 'iremos' },
    ];
    const random = verbs[Math.floor(Math.random() * verbs.length)];
    setTrainerVerb(random);
    setTrainerInput('');
    setTrainerResult(null);
  };

  const handleCheckTrainer = () => {
    const isCorrect = trainerInput.trim().toLowerCase() === trainerVerb.answer.toLowerCase();
    setTrainerResult(isCorrect);
    if (isCorrect) {
      setTrainerScore((prev) => prev + 10);
    } else {
      recordMistake('تصريف الأفعال', trainerInput, trainerVerb.answer, `تصريف ${trainerVerb.verb} مع ${trainerVerb.pronoun} في زمن ${trainerVerb.tense}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Section Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              مختبر الأزمنة الإسبانية (Tenses Lab)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            شرح مبسط مع المقارنة بالفصحى والعامية المصرية، وجداول تصريف تفاعلية، وتطبيقات كول سنتر واقعية.
          </p>
        </div>

        {/* Segmented Control for Tense Modes */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'lessons'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>الدروس (12 زمناً)</span>
          </button>

          <button
            onClick={() => setActiveTab('conjugator')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'conjugator'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>مدرب التصريف</span>
          </button>

          <button
            onClick={() => setActiveTab('contrast')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'contrast'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>مدرب الفروق</span>
          </button>
        </div>
      </div>

      {/* MODE 1: LESSONS */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          {/* Horizontal Tenses Scroller */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {tensesLessons.map((lesson) => {
              const isSelected = selectedLessonId === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`px-4 py-2.5 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-mono ml-1.5 opacity-80">#{lesson.order}</span>
                  <span>{lesson.name}</span>
                </button>
              );
            })}
          </div>

          {/* Lesson Content Area */}
          <div className="space-y-6">
            {/* 1. Header & Timeline */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    الدرس {currentLesson.order} · المستوى {currentLesson.level}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
                    {currentLesson.name} ({currentLesson.nameAr})
                  </h3>
                </div>
              </div>

              {/* When to use & Egyptian Arabic comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs leading-relaxed">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    📌 متى يُستخدم هذا الزمن في الإسبانية؟
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">{currentLesson.whenToUseAr}</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 text-xs leading-relaxed">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">
                    🇪🇬 كيف نفهمه بالعامية المصرية؟
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">{currentLesson.arabicComparison}</p>
                </div>
              </div>

              {/* Visual Timeline Bar */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs">
                <div className="flex items-center gap-2 mb-2 font-bold text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span>الخط الزمني (Línea del Tiempo):</span>
                </div>
                <p className="text-slate-300 leading-normal">{currentLesson.timelineDescription}</p>
              </div>
            </div>

            {/* 2. Formation Table */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                جدول النهايات للأفعال المنتظمة (Terminaciones Regulares)
              </h4>

              <div className="overflow-x-auto" dir="ltr">
                <table className="w-full text-left font-['Plus_Jakarta_Sans',sans-serif] text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <th className="py-2.5 px-3">الضمير (Pronombre)</th>
                      <th className="py-2.5 px-3">-AR Verbs</th>
                      <th className="py-2.5 px-3">-ER Verbs</th>
                      <th className="py-2.5 px-3">-IR Verbs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {currentLesson.formation.regular.pronouns.map((pron, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">{pron}</td>
                        <td className="py-2 px-3 text-amber-700 dark:text-amber-400 font-bold">{currentLesson.formation.regular.ar[idx]}</td>
                        <td className="py-2 px-3 text-blue-700 dark:text-blue-400 font-bold">{currentLesson.formation.regular.er[idx]}</td>
                        <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400 font-bold">{currentLesson.formation.regular.ir[idx]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Key Irregular Verbs */}
              {currentLesson.formation.irregulars.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                    أهم الأفعال الشاذة غير المنتظمة (Verbos Irregulares Clave):
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3" dir="ltr">
                    {currentLesson.formation.irregulars.map((irr, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                        <span className="font-bold text-amber-800 dark:text-amber-400 font-['Plus_Jakarta_Sans',sans-serif] block mb-0.5">
                          {irr.verb}
                        </span>
                        <span className="text-[11px] text-slate-500 block mb-1.5 text-right font-['Cairo',sans-serif]">
                          {irr.meaningAr}
                        </span>
                        <p className="font-mono text-slate-700 dark:text-slate-300 text-[11px] leading-tight">
                          {irr.forms.join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Example Sentences in the mandatory 7-part card format */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  جمل نموذجية في الكول سنتر والحياة اليومية ({currentLesson.sentences.length} بطاقات)
                </h4>
                <span className="text-xs text-slate-500">مصحوبة بالنطق الصوتي والتحليل بالذكاء الاصطناعي</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {currentLesson.sentences.map((card) => (
                  <SentenceCard
                    key={card.id}
                    card={card}
                    dialect={dialect}
                    uiLanguageMode={uiLanguageMode}
                  />
                ))}
              </div>
            </div>

            {/* 4. Common Mistakes for Arabic Speakers */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  أشهر الأخطاء الشائعة للمتحدثين بالعربية والمصريين
                </h4>
              </div>

              <div className="space-y-3">
                {currentLesson.commonMistakes.map((mistake, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs">
                    <div className="flex items-center gap-2 mb-1.5" dir="ltr">
                      <span className="text-rose-600 font-bold line-through font-mono">❌ {mistake.mistake}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2" dir="ltr">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">✅ {mistake.correction}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      💡 السبب: {mistake.reasonAr}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Mini Exercises */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  تدريبات سريعة لتثبيت الزمن
                </h4>
              </div>

              <div className="space-y-4">
                {currentLesson.miniExercises.map((ex) => {
                  const userAnswer = exerciseAnswers[ex.id];
                  const hasAnswered = userAnswer !== undefined;
                  const isOk = exerciseFeedback[ex.id];

                  return (
                    <div key={ex.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-xs space-y-3">
                      <p className="font-bold text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]" dir="ltr">
                        {ex.question}
                      </p>

                      {ex.options && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" dir="ltr">
                          {ex.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleAnswerExercise(ex.id, opt, ex.answer, ex.explanationAr)}
                              className={`p-2 rounded-xl border font-mono text-xs font-semibold transition-all ${
                                hasAnswered
                                  ? opt === ex.answer
                                    ? 'bg-emerald-100 border-emerald-500 text-emerald-800 font-bold'
                                    : userAnswer === opt
                                    ? 'bg-rose-100 border-rose-500 text-rose-800'
                                    : 'bg-white dark:bg-slate-700 border-slate-200 opacity-60'
                                  : 'bg-white dark:bg-slate-700 border-slate-200 hover:border-amber-400'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}

                      {hasAnswered && (
                        <div
                          className={`p-3 rounded-xl leading-relaxed ${
                            isOk
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200'
                          }`}
                        >
                          <span className="font-bold block mb-0.5">
                            {isOk ? 'إجابة صحيحة! أحسنت.' : `إجابة غير صحيحة. الصحيح هو: "${ex.answer}"`}
                          </span>
                          <p>{ex.explanationAr}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: CONJUGATION TRAINER */}
      {activeTab === 'conjugator' && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                مدرب التصريف العشوائي الفوري
              </h3>
            </div>
            <div className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-xl">
              النقاط: {trainerScore} XP
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
              صرف الفعل التالي:
            </span>
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] mb-2" dir="ltr">
              {trainerVerb.verb}
            </h4>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80">
                الزمن: {trainerVerb.tense}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                الضمير: {trainerVerb.pronoun}
              </span>
            </div>
          </div>

          <div className="space-y-3" dir="ltr">
            <input
              type="text"
              value={trainerInput}
              onChange={(e) => setTrainerInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckTrainer()}
              placeholder="اكتب تصريف الفعل هنا..."
              className="w-full text-center text-lg font-mono font-bold py-3.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={handleCheckTrainer}
                className="flex-1 py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
              >
                تأكيد الإجابة
              </button>
              <button
                onClick={handleNextTrainerVerb}
                className="py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                فعل آخر ↻
              </button>
            </div>
          </div>

          {trainerResult !== null && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold animate-in fade-in ${
                trainerResult
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300'
              }`}
            >
              {trainerResult ? (
                <span>🎉 إجابة صحيحة ممتازة! (+10 XP)</span>
              ) : (
                <span>❌ خطأ، التصريف الصحيح هو: <strong>{trainerVerb.answer}</strong></span>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODE 3: CONTRAST TRAINER */}
      {activeTab === 'contrast' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Contrast Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {contrastPairs.map((pair, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveContrastIdx(idx);
                  setContrastUserChoice(null);
                }}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                  activeContrastIdx === idx
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {pair.title.split('(')[0]}
              </button>
            ))}
          </div>

          {/* Active Contrast Details */}
          {(() => {
            const pair = contrastPairs[activeContrastIdx];
            return (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {pair.title}
                  </h3>
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">
                      💡 القاعدة الذهبية للتمييز:
                    </span>
                    {pair.ruleAr}
                  </div>
                </div>

                {/* Side-by-side examples */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="ltr">
                  {pair.examples.map((ex, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <p className="font-bold text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
                        {ex.es}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 font-['Cairo',sans-serif] text-right" dir="rtl">
                        {ex.ar}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Interactive Contrast Quiz */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    اختبر فهمك للفرق في سياق عملي:
                  </h4>
                  <p className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100" dir="ltr">
                    {pair.quiz.q}
                  </p>

                  <div className="grid grid-cols-3 gap-2" dir="ltr">
                    {pair.quiz.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setContrastUserChoice(opt)}
                        className={`p-3 rounded-xl border text-xs font-bold font-mono transition-all ${
                          contrastUserChoice === opt
                            ? opt === pair.quiz.answer
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                              : 'bg-rose-100 border-rose-500 text-rose-800'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {contrastUserChoice && (
                    <div
                      className={`p-3 rounded-xl text-xs leading-relaxed ${
                        contrastUserChoice === pair.quiz.answer
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      <span className="font-bold block mb-0.5">
                        {contrastUserChoice === pair.quiz.answer ? 'صحيح 100%!' : `غير دقيق. الإجابة الصحيحة هي: ${pair.quiz.answer}`}
                      </span>
                      <p>{pair.quiz.explAr}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
