import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Volume2,
  BookmarkPlus,
  RefreshCw,
  Sparkles,
  Check,
  User,
  Trash2,
} from 'lucide-react';
import { UserProfile, DialectType } from '../types';
import { playSpanishTTS } from '../utils/speech';
import { addCardToSRSDeck } from '../utils/storage';

interface AiTutorModuleProps {
  profile: UserProfile;
  dialect: DialectType;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export const AiTutorModule: React.FC<AiTutorModuleProps> = ({
  profile,
  dialect,
}) => {
  const [tutorMode, setTutorMode] = useState<'explain_ar' | 'conversation_es' | 'strict_corrector' | 'roleplay'>('explain_ar');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('fluento_es_tutor_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: `¡Hola! أنا دون رافائيل (Don Rafael)، مدرّسك الشخصي للإسبانية للوصول إلى مستوى B2 للعمل في الكول سنتر.
أنا تحت أمرك: اسألني عن أي زمن، أو قاعدة، أو ترجمة جملة، أو اطلب مني محاكاة مكالمة أو تصحيح إيميل للعميل!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedMsgId, setSavedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('fluento_es_tutor_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    'بسطها لي أكتر بمثال مصري',
    'اديني 3 جمل من كول سنتر فودافون إسبانيا',
    'إزاي أقول للعميل "حقك عليا والخطأ مش هيتكرر"؟',
    'امتحني بسؤال سريع في Subjuntivo',
    'إيه الفرق بين Por و Para في الشغل؟',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          mode: tutorMode,
          level: profile.level,
          dialect,
          userMistakes: profile.weakAreas,
        }),
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'عذراً، لم أتمكن من الرد، برجاء المحاولة مجدداً.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error('Chat error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSnippet = (text: string, msgId: string) => {
    // Extract Spanish line if possible
    const lines = text.split('\n');
    const firstSpanishLine = lines.find((l) => /[a-zA-Záéíóúñ¿¡]/.test(l)) || text.substring(0, 80);

    addCardToSRSDeck({
      id: `tutor_save_${Date.now()}`,
      spanish: firstSpanishLine.replace(/[*_#]/g, '').trim(),
      transliterationAr: 'محفوظة من شات المدرّس دون رافائيل',
      ipa: '',
      arabic: text.substring(0, 100),
      register: 'رسمي',
    });

    setSavedMsgId(msgId);
    setTimeout(() => setSavedMsgId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: 'تم بدء جلسة محادثة جديدة. كيف يمكنني مساعدتك اليوم في رحلتك نحو B2؟',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Tutor Header Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                المدرّس الذكي: دون رافائيل (Don Rafael)
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              مدربك الخصوصي لمستوى B2 والكول سنتر الإسباني · لهجة: {dialect}
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          title="مسح محادثة الشات والبدء من جديد"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Tutor Modes Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: 'explain_ar', label: 'اشرح لي بالعربي' },
          { id: 'conversation_es', label: 'محادثة إسبانية لطيفة' },
          { id: 'strict_corrector', label: 'مصحح كول سنتر صارم' },
          { id: 'roleplay', label: 'لعب أدوار (عميل/زميل)' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setTutorMode(m.id as any)}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
              tutorMode === m.id
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Box */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs min-h-[420px] max-h-[520px] overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400 font-bold">
              {m.role === 'user' ? (
                <>
                  <span>أنت</span>
                  <User className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-amber-500" />
                  <span>دون رافائيل</span>
                </>
              )}
              <span>· {m.time}</span>
            </div>

            <div
              className={`p-4 rounded-3xl max-w-[90%] sm:max-w-[80%] text-xs leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-700 font-normal shadow-xs'
              }`}
            >
              {m.content}

              {m.role === 'assistant' && (
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                  <button
                    onClick={() => playSpanishTTS(m.content, dialect, 0.95)}
                    title="نطق الإسبانية بالصوت"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>نطق</span>
                  </button>
                  <button
                    onClick={() => handleSaveSnippet(m.content, m.id)}
                    title="حفظ في مراجعة التكرار المتباعد"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-[11px]"
                  >
                    {savedMsgId === m.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <BookmarkPlus className="w-3.5 h-3.5" />
                    )}
                    <span>حفظ للبطاقات</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 text-xs text-amber-600 font-bold animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>دون رافائيل يكتب الرد...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(qp)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold whitespace-nowrap transition-colors border border-slate-200 dark:border-slate-700"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2">
        <textarea
          rows={1}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="اكتب سؤالك بالعربي أو بالإسباني هنا..."
          className="flex-1 p-3 bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden resize-none"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputMessage.trim()}
          className="p-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
