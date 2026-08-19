import React, { useState, useEffect } from 'react';
import { GuitarProvider, useGuitar } from './context/GuitarContext';
import { Navbar } from './components/Common/Navbar';
import { CourseDashboard } from './components/CourseModule/CourseDashboard';
import { GuitarTuner } from './components/TunerModule/GuitarTuner';
import { StudioRecorder } from './components/RecorderModule/StudioRecorder';
import { InteractiveFretboard } from './components/FretboardModule/InteractiveFretboard';
import { Metronome } from './components/MetronomeModule/Metronome';
import { ChordLibraryExplorer } from './components/ChordModule/ChordLibraryExplorer';
import { PracticeJournal } from './components/JournalModule/PracticeJournal';
import { UserProfileModal } from './components/ProfileModule/UserProfileModal';
import { QuickGuideModal } from './components/Common/QuickGuideModal';
import { KeyboardShortcutsModal } from './components/Common/KeyboardShortcutsModal';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useGuitar();
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        setShowProfileModal(false);
        setShowGuideModal(false);
        setShowShortcutsModal(false);
      } else if (e.key === '1') {
        setActiveTab('course');
      } else if (e.key === '2') {
        setActiveTab('tuner');
      } else if (e.key === '3') {
        setActiveTab('recorder');
      } else if (e.key === '4') {
        setActiveTab('fretboard');
      } else if (e.key === '5') {
        setActiveTab('metronome');
      } else if (e.key === '6') {
        setActiveTab('chords');
      } else if (e.key === '7') {
        setActiveTab('journal');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Navbar
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenGuide={() => setShowGuideModal(true)}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'course' && <CourseDashboard />}
        {activeTab === 'tuner' && <GuitarTuner />}
        {activeTab === 'recorder' && <StudioRecorder />}
        {activeTab === 'fretboard' && <InteractiveFretboard />}
        {activeTab === 'metronome' && <Metronome />}
        {activeTab === 'chords' && <ChordLibraryExplorer />}
        {activeTab === 'journal' && <PracticeJournal />}
      </main>

      {/* Modern Studio Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>GuitarStudio Pro • Sistema de 7 Niveles & Web Audio DSP</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setShowGuideModal(true)} className="hover:text-amber-400 cursor-pointer">
              Guía de Inicio
            </button>
            <span>•</span>
            <button onClick={() => setShowShortcutsModal(true)} className="hover:text-amber-400 cursor-pointer">
              Atajos de Teclado
            </button>
            <span>•</span>
            <button onClick={() => setShowProfileModal(true)} className="hover:text-amber-400 cursor-pointer">
              Copia de Seguridad
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showProfileModal && <UserProfileModal onClose={() => setShowProfileModal(false)} />}
      {showGuideModal && <QuickGuideModal onClose={() => setShowGuideModal(false)} />}
      {showShortcutsModal && <KeyboardShortcutsModal onClose={() => setShowShortcutsModal(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <GuitarProvider>
      <AppContent />
    </GuitarProvider>
  );
}
