import React from 'react';
import { Flame, Moon, Sun, Settings, Globe } from 'lucide-react';
import { UserProfile, DialectType, UILanguageMode } from '../types';

interface TopHeaderProps {
  profile: UserProfile;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onSelectLanguageMode: (mode: UILanguageMode) => void;
  onSelectDialect: (dialect: DialectType) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  profile,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  onSelectLanguageMode,
  onSelectDialect,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
              Fluento<span className="text-amber-700 dark:text-amber-400">ES</span>
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
              {profile.level} · B2 Goal
            </span>
          </div>
        </div>

        {/* Zone 2: Streak & Language mode toggle (Single-line controls) */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          {/* Daily streak */}
          <div
            title={`حماسك مستمر لـ ${profile.streak} أيام متتالية!`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-900 text-orange-600 dark:text-orange-400 text-xs font-bold whitespace-nowrap shrink-0"
          >
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            <span className="font-mono tabular-nums">{profile.streak}</span>
            <span className="hidden sm:inline">أيام شعلة</span>
          </div>

          {/* XP */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs font-bold whitespace-nowrap shrink-0">
            <span className="font-mono tabular-nums">{profile.xp}</span> XP
          </div>

          {/* UI Language Filter Segmented Control */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => onSelectLanguageMode('ar_es')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${
                profile.uiLanguageMode === 'ar_es'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              عربي + Es
            </button>
            <button
              onClick={() => onSelectLanguageMode('ar_only')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${
                profile.uiLanguageMode === 'ar_only'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => onSelectLanguageMode('es_only')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${
                profile.uiLanguageMode === 'es_only'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Es فقط
            </button>
          </div>
        </div>

        {/* Zone 3: Actions (Dialect, Dark Mode, Settings) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Dialect selector */}
          <button
            onClick={() =>
              onSelectDialect(
                profile.dialect === 'Spain (Castellano)'
                  ? 'Latin America (neutral)'
                  : 'Spain (Castellano)'
              )
            }
            title={`اللهجة الحالية: ${profile.dialect}`}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate max-w-[110px]">
              {profile.dialect === 'Spain (Castellano)' ? '🇪🇸 إسبانيا' : '🌎 لاتينو'}
            </span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            aria-label="تبديل المظهر"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            title="الإعدادات واستعادة التقدم"
            aria-label="الإعدادات"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
