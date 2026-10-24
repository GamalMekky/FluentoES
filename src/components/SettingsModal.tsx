import React, { useState } from 'react';
import { X, Download, Upload, RotateCcw, Globe, Target, Award, Check, AlertCircle } from 'lucide-react';
import { UserProfile, DialectType, CEFRLevel } from '../types';
import { exportAllDataAsJSON, importAllDataFromJSON } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onRetakePlacement: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onRetakePlacement,
}) => {
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fluento_es_progress_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAllDataFromJSON(content);
      if (success) {
        setImportStatus('تم استيراد تقدمك بنجاح! سيتم تحديث الصفحة.');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setImportStatus('عذراً، الملف غير صالح أو تالف.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            الإعدادات ومزامنة التقدم
          </h3>
        </div>

        <div className="py-4 space-y-5">
          {/* 1. Dialect Selection */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
              <Globe className="w-3.5 h-3.5 inline ml-1 text-amber-500" />
              اللهجة المستهدفة (Dialecto de Referencia):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  onUpdateProfile({ ...profile, dialect: 'Spain (Castellano)' })
                }
                className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                  profile.dialect === 'Spain (Castellano)'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                🇪🇸 إسبانيا (Castellano)
                <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                  تتميز بـ Vosotros ونطق الثاء (Ceceo)
                </span>
              </button>
              <button
                onClick={() =>
                  onUpdateProfile({ ...profile, dialect: 'Latin America (neutral)' })
                }
                className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                  profile.dialect === 'Latin America (neutral)'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                🌎 أمريكا اللاتينية (محايدة)
                <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                  تستخدم Ustedes ونطق السين (Seseo)
                </span>
              </button>
            </div>
          </div>

          {/* 2. Manual Level Adjustment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => {
                  onClose();
                  onRetakePlacement();
                }}
                className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline"
              >
                إعادة اختبار تحديد المستوى ↻
              </button>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                <Award className="w-3.5 h-3.5 inline ml-1 text-amber-500" />
                المستوى التعليمي الحالي:
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2 font-mono">
              {(['A1', 'A2', 'B1', 'B2'] as CEFRLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onUpdateProfile({ ...profile, level: lvl })}
                  className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all ${
                    profile.level === lvl
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Daily Study Goal */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
              <Target className="w-3.5 h-3.5 inline ml-1 text-amber-500" />
              الهدف اليومي للمذاكرة (كول سنتر):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[45, 60, 75, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => onUpdateProfile({ ...profile, dailyGoalMinutes: mins })}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    profile.dailyGoalMinutes === mins
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {mins} دقيقة
                </button>
              ))}
            </div>
          </div>

          {/* 4. Export & Import Progress JSON */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
              النسخ الاحتياطي ومزامنة البيانات (JSON):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExport}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4" />}
                <span>تصدير ملف التقدم (JSON)</span>
              </button>

              <label className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>استيراد ملف التقدم</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
