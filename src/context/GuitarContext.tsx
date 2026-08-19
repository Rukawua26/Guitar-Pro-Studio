import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, PracticeSession, AudioRecording } from '../types/course';
import confetti from 'canvas-confetti';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

interface GuitarContextType {
  activeTab: 'course' | 'tuner' | 'recorder' | 'fretboard' | 'metronome' | 'chords' | 'journal';
  setActiveTab: (tab: 'course' | 'tuner' | 'recorder' | 'fretboard' | 'metronome' | 'chords' | 'journal') => void;
  selectedLessonId: string;
  setSelectedLessonId: (id: string) => void;
  profile: UserProfile;
  toggleExercise: (lessonId: string, index: number) => void;
  isExerciseDone: (lessonId: string, index: number) => boolean;
  getLessonProgress: (lessonId: string, totalExercises: number) => number;
  getTotalProgress: () => number;
  logPractice: (minutes: number, notes: string, lessonId?: string) => void;
  recordings: AudioRecording[];
  saveRecording: (recording: AudioRecording) => void;
  deleteRecording: (id: string) => void;
  saveOneMinuteRecord: (pair: string, count: number) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  exportUserData: (format: 'json' | 'csv') => void;
  importUserData: (jsonData: string) => boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Guitarrista Pro',
  email: 'usuario@guitarstudio.app',
  experienceLevel: 'Principiante',
  joinedDate: Date.now(),
  completedExercises: {},
  practiceHistory: [
    {
      id: 'demo-1',
      timestamp: Date.now() - 86400000 * 2,
      minutes: 25,
      lessonId: '1.1',
      notes: 'Práctica de postura y Araña en trastes 5-8. Buena respuesta de la mano izquierda.',
      exercisesCompleted: ['1.1_0']
    },
    {
      id: 'demo-2',
      timestamp: Date.now() - 86400000,
      minutes: 30,
      lessonId: '1.1',
      notes: 'Acordes D, A, E y primeros cambios de 1 minuto.',
      exercisesCompleted: ['1.1_1', '1.1_2']
    }
  ],
  oneMinuteRecords: {
    'D_A': 28,
    'A_E': 32
  },
  savedChords: ['D', 'A', 'E', 'G', 'C'],
  theme: 'dark',
  a4Freq: 440,
  soundEnabled: true,
  language: 'es',
  dailyGoalMinutes: 30
};

const GuitarContext = createContext<GuitarContextType | undefined>(undefined);

export const GuitarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'course' | 'tuner' | 'recorder' | 'fretboard' | 'metronome' | 'chords' | 'journal'>('course');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('1.1');

  // Load profile from localStorage
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('guitar_studio_profile_v1');
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Error loading stored profile:", e);
    }
    return DEFAULT_PROFILE;
  });

  // Load recordings
  const [recordings, setRecordings] = useState<AudioRecording[]>(() => {
    try {
      const saved = localStorage.getItem('guitar_studio_recordings_meta');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Error loading recordings meta:", e);
    }
    return [];
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-welcome',
      title: '¡Bienvenido a GuitarStudio Pro!',
      message: 'Comienza explorando el Nivel 1 o calibra tu instrumento con el afinador por micrófono.',
      timestamp: Date.now(),
      type: 'info',
      read: false
    }
  ]);

  // Save profile changes
  useEffect(() => {
    try {
      localStorage.setItem('guitar_studio_profile_v1', JSON.stringify(profile));
    } catch (e) {
      console.warn("Error saving profile to localStorage:", e);
    }
  }, [profile]);

  // Save recordings meta
  useEffect(() => {
    try {
      localStorage.setItem('guitar_studio_recordings_meta', JSON.stringify(recordings));
    } catch (e) {
      console.warn("Error saving recordings to localStorage:", e);
    }
  }, [recordings]);

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      title,
      message,
      timestamp: Date.now(),
      type,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const isExerciseDone = (lessonId: string, index: number): boolean => {
    return !!profile.completedExercises[`${lessonId}_${index}`];
  };

  const toggleExercise = (lessonId: string, index: number) => {
    const key = `${lessonId}_${index}`;
    const willBeDone = !profile.completedExercises[key];

    setProfile(prev => {
      const nextCompleted = { ...prev.completedExercises };
      if (willBeDone) {
        nextCompleted[key] = true;
      } else {
        delete nextCompleted[key];
      }
      return {
        ...prev,
        completedExercises: nextCompleted
      };
    });

    if (willBeDone) {
      // Fire festive confetti animation on exercise completion!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899']
        });
      } catch (e) {
        // ignore
      }

      addNotification(
        '¡Ejercicio Completado! 🎸',
        `Has completado un ejercicio en la lección ${lessonId}. ¡Sigue así!`,
        'success'
      );
    }
  };

  const getLessonProgress = (lessonId: string, totalExercises: number): number => {
    if (totalExercises === 0) return 0;
    let completed = 0;
    for (let i = 0; i < totalExercises; i++) {
      if (profile.completedExercises[`${lessonId}_${i}`]) {
        completed++;
      }
    }
    return Math.round((completed / totalExercises) * 100);
  };

  const getTotalProgress = (): number => {
    // 7 levels with 3 exercises each = 21 total exercises
    const totalExercises = 21;
    const completedCount = Object.keys(profile.completedExercises).length;
    return Math.min(100, Math.round((completedCount / totalExercises) * 100));
  };

  const logPractice = (minutes: number, notes: string, lessonId?: string) => {
    const session: PracticeSession = {
      id: 'session_' + Date.now(),
      timestamp: Date.now(),
      minutes,
      notes,
      lessonId,
      exercisesCompleted: Object.keys(profile.completedExercises)
    };

    setProfile(prev => ({
      ...prev,
      practiceHistory: [session, ...prev.practiceHistory]
    }));

    addNotification(
      'Sesión de Práctica Guardada ⏱️',
      `Registraste ${minutes} minutos de práctica en tu diario.`,
      'success'
    );
  };

  const saveRecording = (rec: AudioRecording) => {
    setRecordings(prev => [rec, ...prev]);
    addNotification(
      'Grabación Guardada 🎙️',
      `"${rec.title}" se ha guardado en tu estudio.`,
      'success'
    );
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
  };

  const saveOneMinuteRecord = (pair: string, count: number) => {
    const currentBest = profile.oneMinuteRecords[pair] || 0;
    const isNewRecord = count > currentBest;

    setProfile(prev => ({
      ...prev,
      oneMinuteRecords: {
        ...prev.oneMinuteRecords,
        [pair]: Math.max(currentBest, count)
      }
    }));

    if (isNewRecord) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      addNotification(
        '¡Nuevo Récord de Velocidad! ⚡',
        `¡Lograste ${count} cambios por minuto para ${pair.replace('_', ' → ')}!`,
        'success'
      );
    }
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...data }));
  };

  const exportUserData = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ profile, recordings }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `guitar_studio_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      // Export practice CSV
      let csvContent = "data:text/csv;charset=utf-8,Fecha,Minutos,Lección,Notas\n";
      profile.practiceHistory.forEach(sess => {
        const dateStr = new Date(sess.timestamp).toLocaleDateString();
        const safeNotes = `"${(sess.notes || '').replace(/"/g, '""')}"`;
        csvContent += `${dateStr},${sess.minutes},${sess.lessonId || 'Libre'},${safeNotes}\n`;
      });
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", encodeURI(csvContent));
      downloadAnchor.setAttribute("download", `guitar_practica_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  const importUserData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.profile) {
        setProfile({ ...DEFAULT_PROFILE, ...parsed.profile });
      }
      if (Array.isArray(parsed.recordings)) {
        setRecordings(parsed.recordings);
      }
      addNotification('Datos Restaurados', 'Tu perfil y grabaciones han sido sincronizados correctamente.', 'success');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <GuitarContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedLessonId,
        setSelectedLessonId,
        profile,
        toggleExercise,
        isExerciseDone,
        getLessonProgress,
        getTotalProgress,
        logPractice,
        recordings,
        saveRecording,
        deleteRecording,
        saveOneMinuteRecord,
        notifications,
        markNotificationRead,
        clearNotifications,
        addNotification,
        updateProfile,
        exportUserData,
        importUserData
      }}
    >
      {children}
    </GuitarContext.Provider>
  );
};

export const useGuitar = () => {
  const context = useContext(GuitarContext);
  if (!context) throw new Error('useGuitar must be used within GuitarProvider');
  return context;
};
