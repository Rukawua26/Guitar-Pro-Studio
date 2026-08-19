export interface Lesson {
  id: string;
  nivel: number;
  categoria: 'Principiante' | 'Intermedio' | 'Avanzado';
  titulo: string;
  teoria: string;
  ejercicios: string[];
  cancion_referencia: string;
  canal_youtube: string;
  tabSnippet?: string;
  chords?: string[];
  bpmObjetivo?: number;
  puntosClave?: string[];
}

export interface ChordShape {
  name: string;
  frets: (number | 'x')[]; // 6 strings from low E to high E: e.g. ['x', 0, 2, 2, 2, 0] for A
  fingers?: (number | 'x')[];
  baseFret?: number;
  category?: 'Abierto' | 'Cejilla' | 'Séptima' | 'Power Chord' | 'Extendido';
}

export interface TunerNote {
  note: string;
  octave: number;
  frequency: number;
  stringIndex?: number;
  name: string;
}

export interface TuningPreset {
  id: string;
  name: string;
  description: string;
  notes: { note: string; octave: number; freq: number; stringName: string }[];
}

export interface AudioRecording {
  id: string;
  title: string;
  createdAt: number;
  duration: number;
  blobUrl: string;
  blobSize: number;
  bpm?: number;
  lessonId?: string;
  tags: string[];
  notes?: string;
}

export interface PracticeSession {
  id: string;
  timestamp: number;
  minutes: number;
  lessonId?: string;
  notes: string;
  exercisesCompleted: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  experienceLevel: 'Principiante' | 'Intermedio' | 'Avanzado';
  joinedDate: number;
  completedExercises: Record<string, boolean>; // key: `${lessonId}_${exerciseIndex}`
  practiceHistory: PracticeSession[];
  oneMinuteRecords: Record<string, number>; // e.g. "D_A": 36
  savedChords: string[];
  theme: 'dark' | 'midnight' | 'studio-warm';
  a4Freq: number;
  soundEnabled: boolean;
  language: 'es' | 'en';
  dailyGoalMinutes: number;
}
