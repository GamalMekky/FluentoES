import React, { useState } from 'react';
import {
  Headphones,
  Mic,
  MessageSquare,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Send,
  PhoneCall,
  PhoneOff,
  UserCheck,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { callCenterScenarios, callCenterPhraseBank } from '../data/callCenterData';
import { SentenceCard } from '../components/SentenceCard';
import { DialectType, UILanguageMode } from '../types';
import { playSpanishTTS } from '../utils/speech';

interface CallCenterModuleProps {
  dialect: DialectType;
  uiLanguageMode: UILanguageMode;
}

export const CallCenterModule: React.FC<CallCenterModuleProps> = ({
  dialect,
  uiLanguageMode,
}) => {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'roleplay' | 'listening' | 'phrasebank' | 'interview'>('roleplay');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(callCenterScenarios[0].id);

  // Role-play interactive call simulator state
  const [customerPersona, setCustomerPersona] = useState<'angry' | 'confused' | 'fast_speaker' | 'calm' | 'regional_andaluz'>('angry');
  const [callActive, setCallActive] = useState(false);
  const [agentInput, setAgentInput] = useState('');
  const [callHistory, setCallHistory] = useState<{ role: 'customer' | 'agent'; text: string; time: string }[]>([]);
  const [evaluatingTurn, setEvaluatingTurn] = useState(false);
  const [lastTurnFeedback, setLastTurnFeedback] = useState<any>(null);

  // Phrasebank filter
  const [phraseCategory, setPhraseCategory] = useState<string>('الكل');

  // Customer Listening Practice state
  const listeningCalls = [
    {
      id: 'call_1',
      audioText: 'Hola, muy buenas. Mire, le llamo porque en la última factura de marzo me han cobrado una suscripción a un canal de televisión que yo jamás he contratado. Son quince euros de más y exijo que me lo descuenten inmediatamente de la cuenta.',
      speedOptions: [0.75, 1.0, 1.15],
      question: 'ما هي المشكلة الأساسية التي يشتكي منها العميل في اتصاله؟',
      options: [
        'خصم 15 يورو مقابل قناة تلفزيونية لم يطلب الاشتراك فيها إطلاقاً',
        'انقطاع خدمة الإنترنت المنزلي منذ أسبوع',
        'تأخر وصول الفني لتركيب جهاز الراوتر',
        'رغبته في تغيير رقم هاتفه الجوال',
      ],
      answer: 'خصم 15 يورو مقابل قناة تلفزيونية لم يطلب الاشتراك فيها إطلاقاً',
      explanationAr: 'العميل ذكر بوضوح: "me han cobrado una suscripción a un canal de televisión que yo jamás he contratado. Son quince euros de más".',
    },
    {
      id: 'call_2',
      audioText: 'Buenos días. Quería saber si para dar de baja la línea móvil de mi padre tengo que enviar algún documento firmado o si basta con el DNI por correo electrónico.',
      speedOptions: [0.8, 1.0, 1.2],
      question: 'ما هو الإجراء الذي يستفسر عنه العميل بخصوص والده؟',
      options: [
        'المستندات المطلوبة لإلغاء خط الهاتف المحمول (Dar de baja)',
        'تغيير باقة الإنترنت إلى الألياف الضوئية',
        'شراء هاتف ذكي جديد بالتقسيط',
        'تأجيل موعد سداد الفاتورة',
      ],
      answer: 'المستندات المطلوبة لإلغاء خط الهاتف المحمول (Dar de baja)',
      explanationAr: 'كلمة "dar de baja" تعني إلغاء الاشتراك أو الخط رسمياً.',
    },
  ];
  const [activeCallIdx, setActiveCallIdx] = useState(0);
  const [listeningUserChoice, setListeningUserChoice] = useState<string | null>(null);

  // Mock Interview Questions state
  const interviewQuestions = [
    {
      q: '¿Por qué quieres trabajar en un centro de atención telefónica en español?',
      qAr: 'لماذا ترغب في العمل في مركز اتصال باللغة الإسبانية؟',
      idealAns: 'Porque me apasiona la comunicación y resolver problemas para los clientes con rapidez y empatía. He desarrollado mi nivel B2 en español enfocándome en el trato formal de cortesía (Usted) y la gestión de incidencias.',
      idealAnsAr: 'لأنني شغوف بالتواصل وحل المشكلات للعملاء بسرعة وتعاطف. لقد طوّرت مستواي إلى B2 بالتركيز على صيغة الاحترام الرسمية وإدارة الشكاوى والأعطال.',
    },
    {
      q: '¿Cómo manejas a un cliente muy enfadado que no para de gritar?',
      qAr: 'كيف تتعامل مع عميل غاضب جداً لا يتوقف عن الصراخ؟',
      idealAns: 'En primer lugar, mantengo la calma y escucho activamente sin interrumpirle. Luego, utilizo frases de desescalada como "Comprendo perfectamente su enfado y tiene toda la razón en sentirse así". Finalmente, me comprometo personalmente con una solución clara.',
      idealAnsAr: 'أولاً، أحافظ على هدوئي التام وأنصت باهتمام دون مقاطعة. ثم أستخدم عبارات نزع الفتيل مثل "أتفهم تماماً غضب حضرتك". وأخيراً، ألتزم شخصياً بتقديم حل واضح وملموس.',
    },
  ];

  const currentScenario = callCenterScenarios.find((s) => s.id === selectedScenarioId) || callCenterScenarios[0];

  const categories = ['الكل', 'الترحيب والبداية', 'التحقق الأمني', 'الانتظار والتحويل', 'امتصاص الغضب والاعتذار', 'الفواتير والماليات', 'الدعم الفني', 'استبقاء العملاء والعروض'];

  const filteredPhrases = phraseCategory === 'الكل'
    ? callCenterPhraseBank
    : callCenterPhraseBank.filter((p) => p.category === phraseCategory);

  const handleStartCall = () => {
    setCallActive(true);
    setCallHistory([
      {
        role: 'customer',
        text: customerPersona === 'angry'
          ? '¡Oiga! ¡Llevo media hora esperando y me parece una falta de respeto total! ¿Quién me atiende?'
          : customerPersona === 'confused'
          ? 'Hola, buenos días... mire, es que no entiendo por qué no tengo internet y las luces parpadean en rojo...'
          : 'Buenos días, llamaba para consultar unas dudas sobre mi última factura si es tan amable.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setLastTurnFeedback(null);
  };

  const handleSendAgentReply = async () => {
    if (!agentInput.trim() || evaluatingTurn) return;
    const userText = agentInput.trim();
    setAgentInput('');

    const newHist = [
      ...callHistory,
      {
        role: 'agent' as const,
        text: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setCallHistory(newHist);
    setEvaluatingTurn(true);

    try {
      const response = await fetch('/api/gemini/callcenter-roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: currentScenario.title,
          customerPersona,
          history: newHist,
          lastAgentMessage: userText,
          dialect,
        }),
      });

      const data = await response.json();
      setLastTurnFeedback(data);

      if (data.customer_reply) {
        setCallHistory((prev) => [
          ...prev,
          {
            role: 'customer',
            text: data.customer_reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        // Speak customer response with native Spanish TTS
        playSpanishTTS(data.customer_reply, dialect, 1.0);
      }
    } catch (e) {
      console.error('Call roleplay turn error:', e);
    } finally {
      setEvaluatingTurn(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
            <Headphones className="w-3.5 h-3.5" />
            <span>وحدة الكول سنتر الوظيفية (Unidad de Call Center B2)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            محاكاة خدمة العملاء والتحضير للتوظيف
          </h2>
          <p className="text-xs text-slate-300 leading-normal max-w-xl">
            تدريب شفهي مكثف على السكربتات المعتمدة، صيغة الاحترام Usted، إدارة العملاء الغاضبين، وبنك الـ 150 عبارة الاحترافية.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-800 rounded-2xl border border-slate-700">
          {[
            { id: 'roleplay', label: 'المحاكي التفاعلي 📞' },
            { id: 'scenarios', label: 'السيناريوهات (10)' },
            { id: 'phrasebank', label: 'بنك الـ 150 عبارة' },
            { id: 'listening', label: 'مكالمات استماع' },
            { id: 'interview', label: 'أسئلة المقابلة' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: AI ROLEPLAY CALL SIMULATOR */}
      {activeTab === 'roleplay' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Sidebar: Configuration */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                إعدادات العميل والمكالمة
              </h3>
              <p className="text-xs text-slate-500">اختر شخصية العميل ومستوى صعوبة الحوار:</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-2">
                شخصية العميل المتصل (Persona del Cliente):
              </label>
              <div className="space-y-2">
                {[
                  { id: 'angry', label: 'عميل غاضب جداً يصرخ (Enfadado)', desc: 'خصم غير مبرر ويرفض الهدوء' },
                  { id: 'confused', label: 'عميل مسن مشوش (Confuso)', desc: 'لا يعرف إعدادات الراوتر ويسأل ببطء' },
                  { id: 'fast_speaker', label: 'عميل تنفيذي سريع جداً (Hablante Rápido)', desc: 'كلام سريع واختصارات عامية' },
                  { id: 'calm', label: 'عميل هادئ ومتعاون (Tranquilo)', desc: 'استفسار روتيني عن تجديد العقد' },
                  { id: 'regional_andaluz', label: 'لهجة أندلسية سريعة (Andaluz)', desc: 'حذف S وسرعة إيقاعية عالية' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCustomerPersona(p.id as any);
                      if (callActive) setCallActive(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-right transition-all ${
                      customerPersona === p.id
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-slate-900 dark:text-slate-100 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xs block">{p.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {!callActive ? (
              <button
                onClick={handleStartCall}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>بدء استقبال المكالمة الشفهية</span>
              </button>
            ) : (
              <button
                onClick={() => setCallActive(false)}
                className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>إنهاء المكالمة</span>
              </button>
            )}
          </div>

          {/* Right/Center: Call Interface */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[500px]">
            {/* Call Header Status */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    callActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                  }`}
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    {callActive ? 'المكالمة جارية على الهواء (En directo)' : 'الهاتف متاح لاستقبال المكالمات'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    العميل: {customerPersona} · اللهجة: {dialect}
                  </span>
                </div>
              </div>

              {callActive && (
                <button
                  onClick={() => {
                    const lastCust = [...callHistory].reverse().find((m) => m.role === 'customer');
                    if (lastCust) playSpanishTTS(lastCust.text, dialect, 1.0);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>إعادة سماع العميل</span>
                </button>
              )}
            </div>

            {/* Messages Chat Flow */}
            <div className="py-4 space-y-3.5 overflow-y-auto max-h-[360px] pr-1">
              {!callActive && callHistory.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <PhoneCall className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs">اضغط على "بدء استقبال المكالمة" لتجربة مكالمة حقيقية مع العميل.</p>
                </div>
              ) : (
                callHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      item.role === 'customer' ? 'items-start' : 'items-end'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                      {item.role === 'customer' ? '👤 العميل (Cliente):' : '🎧 أنت (Agente de soporte):'}
                    </span>
                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed ${
                        item.role === 'customer'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700'
                          : 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                      }`}
                      dir="ltr"
                    >
                      {item.text}
                    </div>
                  </div>
                ))
              )}

              {evaluatingTurn && (
                <div className="text-xs text-amber-600 dark:text-amber-400 font-bold animate-pulse text-center py-2">
                  العميل يستمع لردك ويراجع تقييم الأدب والحل...
                </div>
              )}
            </div>

            {/* Feedback on Last Turn */}
            {lastTurnFeedback && (
              <div className="my-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900 dark:text-slate-100">
                    📊 تقييم ردك الأخير:
                  </span>
                  <span className="font-mono text-amber-600">
                    الدرجة: {lastTurnFeedback.score_0_100}%
                  </span>
                </div>

                {lastTurnFeedback.ideal_agent_answer_es && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                      🌟 الرد المثالي لموظف B2 محترف (Frase Ideal):
                    </span>
                    <p className="font-mono text-slate-900 dark:text-slate-100 font-semibold mb-1" dir="ltr">
                      "{lastTurnFeedback.ideal_agent_answer_es}"
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 font-['Cairo',sans-serif]">
                      {lastTurnFeedback.ideal_agent_answer_ar}
                    </p>
                  </div>
                )}

                {lastTurnFeedback.tone_feedback_ar && (
                  <p className="text-slate-600 dark:text-slate-400">
                    💡 ملاحظة المشرف: {lastTurnFeedback.tone_feedback_ar}
                  </p>
                )}
              </div>
            )}

            {/* Agent Input Bar */}
            {callActive && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAgentReply()}
                  placeholder="اكتب ردك باللغة الإسبانية الرسمية (بصيغة Usted)..."
                  className="flex-1 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-['Plus_Jakarta_Sans',sans-serif] focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  dir="ltr"
                />

                <button
                  onClick={handleSendAgentReply}
                  disabled={evaluatingTurn || !agentInput.trim()}
                  className="p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCENARIOS */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {callCenterScenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`px-4 py-2.5 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  selectedScenarioId === sc.id
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {sc.title}
              </button>
            ))}
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  {currentScenario.category} · صعوبة: {currentScenario.difficulty}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {currentScenario.title} ({currentScenario.titleAr})
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentScenario.contextAr}
            </p>

            {/* Opening Phrase Card */}
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-2">
                العبارة الافتتاحية النموذجية للسيناريو:
              </span>
              <SentenceCard
                card={currentScenario.openingPhrase}
                dialect={dialect}
                uiLanguageMode={uiLanguageMode}
              />
            </div>

            {/* Recommended Steps */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                خطوات تنفيذ المكالمة وحوارات العميل المتوقعة:
              </h4>
              {currentScenario.steps.map((st) => (
                <div key={st.stepNumber} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                  <span className="font-bold text-amber-700 dark:text-amber-400 block">
                    الخطوة {st.stepNumber}: {st.goalAr}
                  </span>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700" dir="ltr">
                    <span className="text-[10px] text-slate-400 block mb-1">العميل غالباً سيقول:</span>
                    <p className="font-mono font-semibold text-slate-900 dark:text-slate-100 mb-1">"{st.customerLikelySay}"</p>
                    <p className="text-slate-600 dark:text-slate-300 text-right font-['Cairo',sans-serif]" dir="rtl">
                      الترجمة: {st.customerLikelySayAr}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {st.recommendedPhrases.map((rp) => (
                      <SentenceCard
                        key={rp.id}
                        card={rp}
                        dialect={dialect}
                        uiLanguageMode={uiLanguageMode}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Do's & Don'ts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-2">
                  ✅ ما يجب فعله في هذه المكالمة (Lo que DEBES hacer):
                </span>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
                  {currentScenario.dosAndDonts.dos.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/60">
                <span className="font-bold text-rose-900 dark:text-rose-300 block mb-2">
                  ❌ أخطاء قاتلة تجنبها تماماً (Lo que NUNCA debes decir):
                </span>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
                  {currentScenario.dosAndDonts.donts.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PHRASEBANK (150 PHRASES) */}
      {activeTab === 'phrasebank' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setPhraseCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  phraseCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredPhrases.map((phrase) => (
              <SentenceCard
                key={phrase.id}
                card={phrase}
                dialect={dialect}
                uiLanguageMode={uiLanguageMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LISTENING PRACTICE */}
      {activeTab === 'listening' && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              تدريب الاستماع لمكالمات العملاء الحقيقية
            </h3>
            <span className="text-xs text-slate-400">مكالمة {activeCallIdx + 1} من {listeningCalls.length}</span>
          </div>

          {(() => {
            const currentCall = listeningCalls[activeCallIdx];
            return (
              <div className="space-y-5">
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-4">
                  <span className="text-xs text-slate-500 block">
                    استمع للمكالمة المسجلة من العميل الإسباني:
                  </span>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => playSpanishTTS(currentCall.audioText, dialect, 1.0)}
                      className="p-4 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md inline-flex items-center justify-center transition-transform active:scale-95"
                    >
                      <Volume2 className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-slate-400">السرعة:</span>
                    {currentCall.speedOptions.map((spd) => (
                      <button
                        key={spd}
                        onClick={() => playSpanishTTS(currentCall.audioText, dialect, spd)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300"
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comprehension Question */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {currentCall.question}
                  </h4>

                  <div className="space-y-2">
                    {currentCall.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setListeningUserChoice(opt)}
                        className={`w-full p-3.5 rounded-2xl border text-right text-xs transition-all ${
                          listeningUserChoice === opt
                            ? opt === currentCall.answer
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {listeningUserChoice && (
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed animate-in fade-in ${
                        listeningUserChoice === currentCall.answer
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200'
                          : 'bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-200'
                      }`}
                    >
                      <span className="font-bold block mb-1">
                        {listeningUserChoice === currentCall.answer ? 'إجابة صحيحة تماماً! أحسنت الاستماع.' : `إجابة خاطئة. الإجابة الصحيحة هي: ${currentCall.answer}`}
                      </span>
                      <p>{currentCall.explanationAr}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 5: MOCK INTERVIEW */}
      {activeTab === 'interview' && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            💼 <strong>محاكاة مقابلة التوظيف الشفهية (Entrevista de Trabajo):</strong> أهم الأسئلة التي يطرحها مسؤول التوظيف (Recruiter / Team Leader) الإسباني والإجابات النموذجية بمستوى B2 الفصيح.
          </div>

          <div className="space-y-4">
            {interviewQuestions.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    السؤال {idx + 1}
                  </span>
                  <button
                    onClick={() => playSpanishTTS(item.q, dialect, 1.0)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] mb-1" dir="ltr">
                    {item.q}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {item.qAr}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      🌟 الإجابة النموذجية لمستوى B2:
                    </span>
                    <button
                      onClick={() => playSpanishTTS(item.idealAns, dialect, 0.95)}
                      className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="font-mono text-slate-800 dark:text-slate-200 leading-relaxed" dir="ltr">
                    "{item.idealAns}"
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 font-['Cairo',sans-serif]">
                    {item.idealAnsAr}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
