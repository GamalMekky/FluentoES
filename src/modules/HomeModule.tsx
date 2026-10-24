import React from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  Play,
  Flame,
  Award,
  ChevronLeft,
  Sparkles,
  BarChart3,
  ShieldAlert,
  Headphones,
  Mic,
  BookOpen,
  Volume2,
} from 'lucide-react';
import { UserProfile, DialectType, UILanguageMode } from '../types';
import { NavTabId } from '../components/BottomNav';

interface HomeModuleProps {
  profile: UserProfile;
  srsDueCount: number;
  onNavigateTab: (tab: NavTabId) => void;
  onOpenPlacement: () => void;
  dialect: DialectType;
  uiLanguageMode: UILanguageMode;
}

export const HomeModule: React.FC<HomeModuleProps> = ({
  profile,
  srsDueCount,
  onNavigateTab,
  onOpenPlacement,
}) => {
  // 12-week syllabus definition
  const roadmapWeeks = [
    { week: 1, level: 'A1', title: 'الأسبوع 1: الأبجدية، النطق الملكي، والتحيات المهنية', focus: 'الحاضر البسيط + افتتاح المكالمة' },
    { week: 2, level: 'A1', title: 'الأسبوع 2: أدوات الاستفهام، الأرقام والبيانات الأمنية (DNI)', focus: 'Ser vs Estar + التحقق من الهوية' },
    { week: 3, level: 'A1', title: 'الأسبوع 3: الحركات المالية، والماضي القريب المركب (Hoy)', focus: 'Pretérito Perfecto + مراجعة الرصيد' },
    { week: 4, level: 'A2', title: 'الأسبوع 4: أحداث الماضي التام المنتهية (Ayer)', focus: 'Pretérito Indefinido + الأعطال الفنية' },
    { week: 5, level: 'A2', title: 'الأسبوع 5: وصف الحالات والتأدب بالماضي المستمر (Quería)', focus: 'Pretérito Imperfecto + وضع العميل في الانتظار' },
    { week: 6, level: 'A2', title: 'الأسبوع 6: صراع الماضي (Indefinido vs Imperfecto)', focus: 'القصص والشكاوى + سرعة الرد' },
    { week: 7, level: 'B1', title: 'الأسبوع 7: صيغة الشرط والتأدب الملكي (¿Podría usted...?)', focus: 'Condicional Simple + امتصاص غضب العميل' },
    { week: 8, level: 'B1', title: 'الأسبوع 8: أوامر الدعم الفني والتوجيه (Usted)', focus: 'Imperativo + استكشاف مشاكل الراوتر' },
    { week: 9, level: 'B1', title: 'الأسبوع 9: ركيزة B2 الكبرى (Presente de Subjuntivo)', focus: 'الشك والضرورة (Es necesario que...)' },
    { week: 10, level: 'B2', title: 'الأسبوع 10: الجمل الشرطية والافتراضات المعقدة (Si estuviera...)', focus: 'التعويضات المالية والحلول البديلة' },
    { week: 11, level: 'B2', title: 'الأسبوع 11: الكلام المنقول ومبني للمجهول بـ Se', focus: 'نقل كلام العميل للمشرف بدقة احترافية' },
    { week: 12, level: 'B2', title: 'الأسبوع 12: محاكاة مقابلات التوظيف ومكالمات السرعة القصوى', focus: 'Mock Interview B2 Call Center' },
  ];

  // Daily 6-part plan
  const dailyTasks = [
    {
      id: 'task_srs',
      title: '1. الإحماء بمراجعة بطاقات التكرار المتباعد (SRS)',
      duration: '10 دقائق',
      description: srsDueCount > 0 ? `لديك ${srsDueCount} بطاقات مستحقة المراجعة اليوم لتثبيت الذاكرة.` : 'لا توجد بطاقات متأخرة اليوم، راجع بطاقات جديدة!',
      icon: Clock,
      actionLabel: 'ابدأ المراجعة',
      targetTab: 'vocab' as NavTabId,
      done: false,
    },
    {
      id: 'task_grammar',
      title: '2. درس القواعد الجديد: أزمنة الإسبانية لخدمة العملاء',
      duration: '20 دقيقة',
      description: 'شرح مبسط مع مقارنة بالعامية المصرية وتدريب تصريف فوري.',
      icon: BookOpen,
      actionLabel: 'فتح مختبر الأزمنة',
      targetTab: 'tenses' as NavTabId,
      done: true,
    },
    {
      id: 'task_pronunciation',
      title: '3. تدريب نطق صوتي: أصوات P vs B والراء المشددة (RR)',
      duration: '15 دقيقة',
      description: 'سجل صوتك وقارنه بمخارج الحروف الإسبانية مع نصائح وضع الشفاه.',
      icon: Mic,
      actionLabel: 'مختبر النطق',
      targetTab: 'speaking' as NavTabId,
      done: false,
    },
    {
      id: 'task_callcenter',
      title: '4. محاكاة مكالمة كول سنتر حية مع عميل ذكاء اصطناعي',
      duration: '20 دقيقة',
      description: 'التعامل مع عميل إسباني غاضب يشتكي من فاتورة مرتفعة بصيغة Usted.',
      icon: Headphones,
      actionLabel: 'بدء المحاكاة',
      targetTab: 'callcenter' as NavTabId,
      done: false,
    },
    {
      id: 'task_culture',
      title: '5. مقتطف ثقافي ومثل إسباني يومي (Refrán)',
      duration: '5 دقائق',
      description: 'ثقافة مدن إسبانيا والمصطلحات الدارجة في الشارع والمجتمع.',
      icon: Sparkles,
      actionLabel: 'استكشف الثقافة',
      targetTab: 'culture' as NavTabId,
      done: false,
    },
    {
      id: 'task_speaking_challenge',
      title: '6. تحدي التحدث الحر لمدة 60 ثانية (Fluency Drill)',
      duration: '10 دقائق',
      description: 'تحدث عن يومك أو حل مشكلة عميل دون توقف والذكاء الاصطناعي يقيم سرعتك.',
      icon: Volume2,
      actionLabel: 'خوض التحدي',
      targetTab: 'challenges' as NavTabId,
      done: false,
    },
  ];

  // Skills radar metric values
  const skills = [
    { name: 'الاستماع (Comprensión)', value: 68, color: 'bg-blue-600' },
    { name: 'التحدث والنطق (Habla)', value: 62, color: 'bg-amber-600' },
    { name: 'الأزمنة والقواعد (Gramática)', value: 75, color: 'bg-emerald-600' },
    { name: 'المفردات والكول سنتر (Léxico)', value: 70, color: 'bg-indigo-600' },
    { name: 'الكتابة والإيميلات (Escritura)', value: 58, color: 'bg-purple-600' },
  ];

  const overallReadiness = Math.round(
    skills.reduce((acc, curr) => acc + curr.value, 0) / skills.length
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Visual Banner (Madrid Call Center) */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900 min-h-[220px] md:min-h-[260px] flex flex-col justify-end p-6 md:p-8 text-white">
        <img
          src="/src/assets/images/hero_call_center_spain_1792879191643.jpg"
          alt="مركز خدمة عملاء في مدريد"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

        <div className="relative z-10 max-w-2xl text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-3">
            <span>🇪🇸 هدف الـ 12 أسبوعاً: الوصول إلى B2 والعمل في كول سنتر إسباني</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-white">
            أهلاً بك في <span className="text-amber-400">Fluento ES</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            تطبيقك الشخصي المصمم خصيصاً للمتحدثين بالمصرية والعربية لاجتياز مقابلات مراكز الاتصال الإسبانية
            والتحدث بثقة وطبيعية تامة وبلا تلعثم.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('callcenter')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>بدء محاكي المكالمات الهاتفية</span>
            </button>
            {!profile.placed && (
              <button
                onClick={onOpenPlacement}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>اختبار تحديد المستوى (10 أسئلة)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress & B2 Readiness Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KPI 1: B2 Readiness Gauge */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-bold">جاهزية مستوى B2 للكول سنتر</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                {overallReadiness}%
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                +4% هذا الأسبوع
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${overallReadiness}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            المستوى المستهدف: اجتياز المقابلة الشفهية واختبارات لغة التوظيف (DELE / SIELE / HR Call).
          </p>
        </div>

        {/* KPI 2: Daily Study Goal & Streak */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-bold">الخطة اليومية (60-90 دقيقة)</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                {profile.todayStudiedMinutes}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                من إجمالي {profile.dailyGoalMinutes} دقيقة
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-orange-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (profile.todayStudiedMinutes / profile.dailyGoalMinutes) * 100)}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            أنت تحافظ على شعلة دراسة متصلة لمدة {profile.streak} أيام متتالية!
          </p>
        </div>

        {/* KPI 3: Weakest Areas Alert */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-bold">أبرز النقاط التي تحتاج تقوية</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="space-y-1.5 mt-2">
              {profile.weakAreas.slice(0, 3).map((area, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
                >
                  <span>{area}</span>
                  <span className="text-[10px] text-rose-500 font-mono">يحتاج مراجعة</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('vocab')}
            className="mt-3 text-xs text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 self-start"
          >
            <span>فتح بنك الأخطاء الكامل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Skills Radar / Breakdown bars */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              رادار المهارات الخمس المطلوبة للتوظيف
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            مستواك الحالي: <strong className="text-slate-900 dark:text-slate-100">{profile.level}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>{skill.name}</span>
                <span className="font-mono tabular-nums">{skill.value}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${skill.color}`}
                  style={{ width: `${skill.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6-Part Daily Plan */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              خطة اليوم التدريبية (~75 دقيقة)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              مقسمة إلى 6 محطات سريعة ومركزة لتغطية كافة جوانب الطلاقة.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {dailyTasks.map((task) => {
            const Icon = task.icon;
            return (
              <div
                key={task.id}
                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {task.title}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                        {task.duration}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-normal">
                      {task.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab(task.targetTab)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0 self-end sm:self-center"
                >
                  <span>{task.actionLabel}</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 12-Week Roadmap (A1 -> B2) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              خريطة الطريق لـ 12 أسبوعاً (من الصفر إلى B2)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            أنت الآن في: <strong className="text-amber-600">الأسبوع {profile.currentWeek}</strong>
          </span>
        </div>

        <div className="space-y-2.5">
          {roadmapWeeks.map((wk) => {
            const isCurrent = profile.currentWeek === wk.week;
            const isDone = profile.currentWeek > wk.week;
            return (
              <div
                key={wk.week}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                    : isDone
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : isCurrent
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : wk.week}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {wk.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 rounded font-bold text-slate-600 dark:text-slate-300">
                        {wk.level}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      التركيز: {wk.focus}
                    </span>
                  </div>
                </div>

                {isCurrent && (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-1 rounded-md shrink-0">
                    أسبوعك الحالي
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
