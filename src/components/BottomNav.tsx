import React, { useState } from 'react';
import {
  Compass,
  Headphones,
  Mic,
  BookOpen,
  Sparkles,
  Landmark,
  Layers,
  Bot,
  Award,
  Menu,
  X,
} from 'lucide-react';

export type NavTabId =
  | 'home'
  | 'callcenter'
  | 'speaking'
  | 'tenses'
  | 'street'
  | 'culture'
  | 'vocab'
  | 'tutor'
  | 'challenges';

interface BottomNavProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  srsDueCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  srsDueCount = 0,
}) => {
  const [showDrawer, setShowDrawer] = useState(false);

  const allTabs: { id: NavTabId; labelAr: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', labelAr: 'الرئيسية', icon: Compass },
    { id: 'callcenter', labelAr: 'الكول سنتر', icon: Headphones },
    { id: 'speaking', labelAr: 'مختبر النطق', icon: Mic },
    { id: 'tenses', labelAr: 'الأزمنة', icon: BookOpen },
    { id: 'street', labelAr: 'الشارع', icon: Sparkles },
    { id: 'culture', labelAr: 'الثقافة', icon: Landmark },
    { id: 'vocab', labelAr: 'التكرار SRS', icon: Layers },
    { id: 'tutor', labelAr: 'مدرّس AI', icon: Bot },
    { id: 'challenges', labelAr: 'الامتحانات', icon: Award },
  ];

  const primaryMobileTabs = allTabs.slice(0, 4);

  const handlePickTab = (id: NavTabId) => {
    onSelectTab(id);
    setShowDrawer(false);
  };

  return (
    <>
      {/* Mobile Drawer for other tabs */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs md:hidden animate-in fade-in duration-200">
          <div className="rounded-t-3xl bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-5 shadow-2xl max-h-[80vh] overflow-y-auto">
            {/* Grab handle bar */}
            <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                جميع وحدات وتطبيقات Fluento ES
              </span>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {allTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handlePickTab(tab.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span className="text-xs text-center">{tab.labelAr}</span>
                    {tab.id === 'vocab' && srsDueCount > 0 && (
                      <span className="mt-1 px-1.5 py-0.2 bg-red-600 text-white text-[10px] rounded-full">
                        {srsDueCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          {/* Desktop & Tablet: Full 9 tabs visible */}
          <div className="hidden md:flex items-center justify-between h-16 gap-1">
            {allTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-colors shrink-0 ${
                    isActive
                      ? 'text-amber-700 dark:text-amber-400 font-bold bg-amber-50/70 dark:bg-amber-950/50'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5 mb-0.5" />
                    {tab.id === 'vocab' && srsDueCount > 0 && (
                      <span className="absolute -top-1 -right-2 px-1 bg-red-600 text-white text-[9px] rounded-full font-bold">
                        {srsDueCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] whitespace-nowrap">{tab.labelAr}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile: 4 primary tabs + "More" drawer button */}
          <div className="grid grid-cols-5 items-center h-16 md:hidden">
            {primaryMobileTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex flex-col items-center justify-center h-full transition-colors ${
                    isActive
                      ? 'text-amber-700 dark:text-amber-400 font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] tracking-tight">{tab.labelAr}</span>
                </button>
              );
            })}

            {/* More Drawer Button */}
            <button
              onClick={() => setShowDrawer(true)}
              className={`flex flex-col items-center justify-center h-full transition-colors ${
                !['home', 'callcenter', 'speaking', 'tenses'].includes(activeTab)
                  ? 'text-amber-700 dark:text-amber-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="relative">
                <Menu className="w-5 h-5 mb-0.5" />
                {srsDueCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">المزيد...</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
