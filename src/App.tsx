/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopHeader } from './components/TopHeader';
import { BottomNav, NavTabId } from './components/BottomNav';
import { PlacementModal } from './components/PlacementModal';
import { SettingsModal } from './components/SettingsModal';
import { HomeModule } from './modules/HomeModule';
import { TensesLabModule } from './modules/TensesLabModule';
import { SpeakingLabModule } from './modules/SpeakingLabModule';
import { CallCenterModule } from './modules/CallCenterModule';
import { StreetSpanishModule } from './modules/StreetSpanishModule';
import { CultureModule } from './modules/CultureModule';
import { VocabularyModule } from './modules/VocabularyModule';
import { AiTutorModule } from './modules/AiTutorModule';
import { ChallengesModule } from './modules/ChallengesModule';
import { UserProfile, DialectType, UILanguageMode, CEFRLevel } from './types';
import { loadUserProfile, saveUserProfile, loadSRSDeck } from './utils/storage';
import { isCardDueToday } from './utils/srs';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('fluento_theme') === 'dark' ||
      (!('fluento_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isPlacementOpen, setIsPlacementOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync dark mode class with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fluento_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fluento_theme', 'light');
    }
  }, [darkMode]);

  // Open placement on first launch if not placed
  useEffect(() => {
    if (!profile.placed) {
      const timer = setTimeout(() => {
        setIsPlacementOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [profile.placed]);

  const srsDeck = loadSRSDeck();
  const srsDueCount = srsDeck.filter(isCardDueToday).length;

  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveUserProfile(updated);
  };

  const handlePlacementComplete = (assignedLevel: CEFRLevel) => {
    const updated: UserProfile = {
      ...profile,
      level: assignedLevel,
      placed: true,
      xp: profile.xp + 50,
    };
    handleUpdateProfile(updated);
  };

  const handleSelectLanguageMode = (mode: UILanguageMode) => {
    handleUpdateProfile({ ...profile, uiLanguageMode: mode });
  };

  const handleSelectDialect = (dialect: DialectType) => {
    handleUpdateProfile({ ...profile, dialect });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-['Cairo',sans-serif]">
      {/* Top Header */}
      <TopHeader
        profile={profile}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSelectLanguageMode={handleSelectLanguageMode}
        onSelectDialect={handleSelectDialect}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-24 md:pb-28">
        {activeTab === 'home' && (
          <HomeModule
            profile={profile}
            srsDueCount={srsDueCount}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenPlacement={() => setIsPlacementOpen(true)}
            dialect={profile.dialect}
            uiLanguageMode={profile.uiLanguageMode}
          />
        )}

        {activeTab === 'tenses' && (
          <TensesLabModule
            dialect={profile.dialect}
            uiLanguageMode={profile.uiLanguageMode}
          />
        )}

        {activeTab === 'speaking' && (
          <SpeakingLabModule
            dialect={profile.dialect}
            uiLanguageMode={profile.uiLanguageMode}
          />
        )}

        {activeTab === 'callcenter' && (
          <CallCenterModule
            dialect={profile.dialect}
            uiLanguageMode={profile.uiLanguageMode}
          />
        )}

        {activeTab === 'street' && (
          <StreetSpanishModule
            dialect={profile.dialect}
            uiLanguageMode={profile.uiLanguageMode}
          />
        )}

        {activeTab === 'culture' && (
          <CultureModule
            dialect={profile.dialect}
            uiLanguageMode={profile.uiLanguageMode}
          />
        )}

        {activeTab === 'vocab' && (
          <VocabularyModule
            dialect={profile.dialect}
            uiLanguageMode={profile.uiLanguageMode}
          />
        )}

        {activeTab === 'tutor' && (
          <AiTutorModule
            profile={profile}
            dialect={profile.dialect}
          />
        )}

        {activeTab === 'challenges' && (
          <ChallengesModule
            profile={profile}
            dialect={profile.dialect}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        srsDueCount={srsDueCount}
      />

      {/* Diagnostic Placement Test Modal */}
      <PlacementModal
        isOpen={isPlacementOpen}
        onClose={() => setIsPlacementOpen(false)}
        onComplete={handlePlacementComplete}
      />

      {/* Settings & Export/Import Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onRetakePlacement={() => setIsPlacementOpen(true)}
      />
    </div>
  );
}
