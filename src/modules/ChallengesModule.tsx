import React, { useState } from 'react';
import {
  Award,
  PenTool,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Flame,
  FileCheck,
  TrendingUp,
  BarChart,
  Volume2,
} from 'lucide-react';
import { UserProfile, DialectType } from '../types';
import { playSpanishTTS } from '../utils/speech';

interface ChallengesModuleProps {
  profile: UserProfile;
  dialect: DialectType;
}

export const ChallengesModule: React.FC<ChallengesModuleProps> = ({
  profile,
  dialect,
}) => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'dele_exam' | 'writing_lab' | 'weekly_report'>('challenges');

  // Writing Lab state
  const [writingTaskType, setWritingTaskType] = useState('customer_email');
  const [writingText, setWritingText] = useState('');
  const [writingEvaluating, setWritingEvaluating] = useState(false);
  const [writingResult, setWritingResult] = useState<any>(null);

  // DELE Mock Exam state
  const mockExamQuestions = [
    {
      section: 'Comprensión de lectura (فهم المقروء B2)',
      text: 'Estimado cliente: Le comunicamos que, debido a tareas de mantenimiento en la red central de fibra óptica, el servicio podría experimentar cortes intermitentes entre las 02:00 y las 06:00 horas del próximo jueves. Rogamos disculpen las molestias.',
      q: 'متى وماذا سيحدث لخدمة الإنترنت وفقاً للإشعار؟',
      options: [
        'انقطاعات متقطعة فجر الخميس القادم بسبب صيانة في شبكة الألياف',
        'قطع نهائي للخدمة طوال يوم الخميس',
        'زيادة سرعة الإنترنت اعتباراً من الخميس',
        'تغيير أجهزة الراوتر لجميع العملاء',
      ],
      answer: 'انقطاعات متقطعة فجر الخميس القادم بسبب صيانة في شبكة الألياف',
      explAr: 'كلمة "cortes intermitentes" تعني انقطاعات متقطعة، و"mantenimiento" تعني صيانة.',
    },
    {
      section: 'Gramática y Uso de la lengua (قواعد وتراكيب B2)',
      text: 'No creo que el importe de la factura _______ (estar) justificado con el consumo real.',
      q: 'اختر الصيغة النحوية الصحيحة لإكمال الجملة:',
      options: ['esté', 'está', 'estuvo', 'estará'],
      answer: 'esté',
      explAr: 'بعد أسلوب الشك المنفي (No creo que...) نستخدم Subjuntivo: esté.',
    },
  ];
  const [examAnswers, setExamAnswers] = useState<Record<number, string>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);

  const handleEvaluateWriting = async () => {
    if (!writingText.trim() || writingEvaluating) return;
    setWritingEvaluating(true);
    setWritingResult(null);

    try {
      const response = await fetch('/api/gemini/writing-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: writingText,
          taskType: writingTaskType,
          dialect,
        }),
      });
      const data = await response.json();
      setWritingResult(data);
    } catch (e) {
      console.error('Writing eval failed:', e);
    } finally {
      setWritingEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              الامتحانات والتحديات ومختبر الكتابة
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تحديات يومية وأسبوعية، اختبارات محاكاة لشهادة DELE/SIELE B2، وتصحيح الإيميلات المهنية بالذكاء الاصطناعي.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
          {[
            { id: 'challenges', label: 'تحديات الأسبوع 🏆' },
            { id: 'writing_lab', label: 'مختبر الكتابة والإيميل' },
            { id: 'dele_exam', label: 'امتحان B2 التجريبي' },
            { id: 'weekly_report', label: 'التقرير الأسبوعي' },
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

      {/* TAB 1: CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Daily Challenge */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">تحدي اليوم</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              تسجيل نطق 5 جمل كول سنتر بصوت نقي
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
              سجل صوتك في مختبر النطق وحقق نسبة تطابق صوتي أعلى من 85% في صوت P vs B.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">المكافأة: +30 XP</span>
              <span className="text-emerald-600 font-bold">مكتمل 3/5</span>
            </div>
          </div>

          {/* Weekly Challenge */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">تحدي الأسبوع</span>
              <Award className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              محاكاة 3 مكالمات مع العميل الغاضب
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
              إنجاز 3 مكالمات دعم كاملة واستخدام عبارات نزع الفتيل وصيغة Usted دون أي مخالفة للجودة.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">المكافأة: +80 XP</span>
              <span className="text-amber-600 font-bold">1/3 مكالمات</span>
            </div>
          </div>

          {/* Boss-Level End of Week Challenge */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-900">
              <span>تحدي الزعيم الأسبوعي (Boss Challenge)</span>
              <span>🔥 B2 Gate</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-950">
              المقابلة الشفهية الشاملة مع المشرف
            </h3>
            <p className="text-xs text-slate-900/90 leading-relaxed font-medium">
              مزيج متكامل من: أسئلة الماضي التام والمستمر، استماع لمكالمة عميل سريع، والرد بارتجال خلال 60 ثانية.
            </p>
            <button
              onClick={() => setActiveTab('dele_exam')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-900 transition-colors"
            >
              دخول تحدي الزعيم الآن
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: WRITING LAB */}
      {activeTab === 'writing_lab' && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PenTool className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                مختبر الكتابة والإيميلات الرسمية (Laboratorio de Escritura)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              اكتب رداً على عميل أو شكوى، والذكاء الاصطناعي سيقوم بتصحيح القواعد وتتبع التغييرات (Tracked Changes) وإعادة صياغتها بأسلوب B2 احترافي.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-2">نوع المهمة الكتابية:</label>
            <select
              value={writingTaskType}
              onChange={(e) => setWritingTaskType(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100"
            >
              <option value="customer_email">إيميل رسمي لعميل بخصوص تسوية فاتورة (Email al cliente)</option>
              <option value="ticket_resolution">تقرير إغلاق تذكرة دعم فني للمشرف (Ticket de soporte)</option>
              <option value="complaint_response">رد على شكوى رسمية للتعويض (Respuesta a reclamación)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-2">النص المكتوب بالإسبانية:</label>
            <textarea
              rows={5}
              value={writingText}
              onChange={(e) => setWritingText(e.target.value)}
              placeholder="Estimado señor Martínez: Le escribo para informarle que hemos revisado su factura..."
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] text-xs leading-relaxed"
              dir="ltr"
            />
          </div>

          <button
            onClick={handleEvaluateWriting}
            disabled={writingEvaluating || !writingText.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-sm transition-all"
          >
            {writingEvaluating ? 'جارٍ التدقيق الإملائي وتتبع التغييرات...' : 'تدقيق النص وإعادة الصياغة الاحترافية (B2)'}
          </button>

          {/* Writing Evaluation Results */}
          {writingResult && (
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  درجة التقييم اللغوي:
                </span>
                <span className="font-mono font-bold text-base text-amber-600">
                  {writingResult.score_0_100}% · المستوى المتحقق: {writingResult.cefr_level_achieved}
                </span>
              </div>

              {/* Tracked changes */}
              {writingResult.tracked_changes && writingResult.tracked_changes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 block">التصحيحات وتتبع الأخطاء:</span>
                  {writingResult.tracked_changes.map((tc: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex items-center gap-2 mb-1" dir="ltr">
                        <span className="text-rose-600 line-through font-mono font-semibold">❌ {tc.original}</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">➔ {tc.suggested}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{tc.rule_ar}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Professional B2 Rewrite */}
              {writingResult.professional_b2_rewrite && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs space-y-2">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 block">
                    🌟 إعادة الصياغة المؤسسية بمستوى B2 الفاخر:
                  </span>
                  <p className="font-mono text-slate-900 dark:text-slate-100 font-semibold leading-relaxed" dir="ltr">
                    "{writingResult.professional_b2_rewrite}"
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 font-['Cairo',sans-serif]">
                    {writingResult.rewrite_ar}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DELE B1/B2 MOCK EXAM */}
      {activeTab === 'dele_exam' && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                نموذج محاكاة رسمي (Modelo de Examen DELE / SIELE)
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                امتحان تشخيص الكفاءة B1/B2
              </h3>
            </div>
          </div>

          <div className="space-y-6">
            {mockExamQuestions.map((q, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-xs space-y-3">
                <span className="font-bold text-amber-700 dark:text-amber-400 block">
                  {q.section}
                </span>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 leading-relaxed" dir="ltr">
                  "{q.text}"
                </div>

                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {q.q}
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setExamAnswers((prev) => ({ ...prev, [idx]: opt }))}
                      className={`w-full p-3 rounded-xl border text-right transition-all ${
                        examAnswers[idx] === opt
                          ? examSubmitted
                            ? opt === q.answer
                              ? 'bg-emerald-100 border-emerald-500 font-bold text-emerald-900'
                              : 'bg-rose-100 border-rose-500 text-rose-900'
                            : 'bg-amber-100 dark:bg-amber-950 border-amber-400 text-slate-900 dark:text-slate-100 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {examSubmitted && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                    💡 {q.explAr}
                  </p>
                )}
              </div>
            ))}
          </div>

          {!examSubmitted ? (
            <button
              onClick={() => setExamSubmitted(true)}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              تسليم الامتحان وعرض النتيجة والتقييم
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center text-xs space-y-1">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 block text-sm">
                🎉 تم إنهاء الامتحان بنجاح (+50 XP)!
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                أظهرت فهماً ممتازاً لنصوص الصيانة واستخدام صيغة Subjuntivo المنصوبة.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: WEEKLY AUTO-GENERATED REPORT */}
      {activeTab === 'weekly_report' && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                التقرير الأسبوعي الذكي
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                تقرير تطور الأداء وخطة الأسبوع القادم
              </h3>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">ساعات المذاكرة</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">8.5 س</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">جمل تم إتقانها</span>
              <span className="text-xl font-bold font-mono text-amber-600">42 جملة</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">مكالمات مكتملة</span>
              <span className="text-xl font-bold font-mono text-emerald-600">6 مكالمات</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs space-y-1.5">
            <span className="font-bold text-emerald-900 dark:text-emerald-300 block">
              🚀 أبرز ما تحسّن لديك هذا الأسبوع:
            </span>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
              <li>التفريق التلقائي بين Hoy (Pretérito Perfecto) و Ayer (Indefinido) دون تردد.</li>
              <li>انخفاض الخلط بين P و B أثناء الحديث بنسبة 70%.</li>
              <li>الافتتاحية الرسمية للكول سنتر أصبحت سلسة وطبيعية للغاية.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1.5">
            <span className="font-bold text-amber-900 dark:text-amber-300 block">
              🎯 خطتك المخصصة للأسبوع القادم:
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              التركيز على أزمنة الـ Subjuntivo في سيناريوهات الأعطال الفنية، والتمرن على مكالمات الاستماع السريعة بلهجة إشبيلية وجنوب إسبانيا.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
