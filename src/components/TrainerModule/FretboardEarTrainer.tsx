import React, { useState, useEffect } from 'react';
import { audioEngine } from '../../utils/audioSynthesizer';
import {
  Brain,
  Headphones,
  Award,
  Flame,
  Zap,
  Volume2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Base frequencies for 6 strings (Low E to High E)
const STRING_OPEN_NOTES = [
  { note: 'E', octave: 4, freq: 329.63 }, // 1st string High E
  { note: 'B', octave: 3, freq: 246.94 }, // 2nd string B
  { note: 'G', octave: 3, freq: 196.00 }, // 3rd string G
  { note: 'D', octave: 3, freq: 146.83 }, // 4th string D
  { note: 'A', octave: 2, freq: 110.00 }, // 5th string A
  { note: 'E', octave: 2, freq: 82.41 }   // 6th string Low E
];

const INTERVAL_TRAINING = [
  { name: 'Unísono (Misma Nota)', semitones: 0, desc: 'Dos notas idénticas' },
  { name: 'Segunda Menor (1 semitono)', semitones: 1, desc: 'Tensión cinematográfica (Tiburón)' },
  { name: 'Tercera Mayor (4 semitonos)', semitones: 4, desc: 'Sonido brillante, alegre (Mayor)' },
  { name: 'Tercera Menor (3 semitonos)', semitones: 3, desc: 'Sonido melancólico (Menor)' },
  { name: 'Cuarta Justa (5 semitonos)', semitones: 5, desc: 'Himno / Marcha' },
  { name: 'Quinta Justa (7 semitonos)', semitones: 7, desc: 'Power chord clásico, estabilidad' },
  { name: 'Octava (12 semitonos)', semitones: 12, desc: 'Misma nota una octava más aguda' }
];

const CHORD_EAR_TRAINING = [
  { name: 'Acorde Mayor', frets: [0, 2, 2, 1, 0, 'x'] as (number | 'x')[], desc: 'Luminoso, estable' },
  { name: 'Acorde Menor', frets: [0, 1, 2, 2, 0, 'x'] as (number | 'x')[], desc: 'Triste, nostálgico' },
  { name: 'Acorde Séptima Dominante (7)', frets: [0, 2, 0, 2, 0, 'x'] as (number | 'x')[], desc: 'Tensión blues/rock' }
];

export const FretboardEarTrainer: React.FC = () => {
  const [mode, setMode] = useState<'fretboard' | 'intervals' | 'chords'>('fretboard');

  // Fretboard Note Flashcard Quiz state
  const [currentFretPos, setCurrentFretPos] = useState<{ string: number; fret: number }>({ string: 5, fret: 5 });
  const [correctAnswer, setCorrectAnswer] = useState<string>('A');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);

  // Interval Ear Training state
  const [currentInterval, setCurrentInterval] = useState<typeof INTERVAL_TRAINING[0]>(INTERVAL_TRAINING[2]);
  const [baseIntervalFreq, setBaseIntervalFreq] = useState<number>(220); // A3

  // Chord Ear Training state
  const [currentEarChord, setCurrentEarChord] = useState<typeof CHORD_EAR_TRAINING[0]>(CHORD_EAR_TRAINING[0]);

  // Calculate note name from string and fret
  const calculateNote = (stringIdx: number, fret: number): { note: string; freq: number } => {
    const openNote = STRING_OPEN_NOTES[stringIdx];
    const openNoteIdx = NOTE_NAMES.indexOf(openNote.note);
    const targetIdx = (openNoteIdx + fret) % 12;
    const noteName = NOTE_NAMES[targetIdx];
    const freq = openNote.freq * Math.pow(2, fret / 12);
    return { note: noteName, freq };
  };

  // Generate a new random flashcard
  const generateNewFretCard = () => {
    setFeedback(null);
    const randomString = Math.floor(Math.random() * 6);
    const randomFret = Math.floor(Math.random() * 13); // 0 to 12
    const { note, freq } = calculateNote(randomString, randomFret);

    setCurrentFretPos({ string: randomString, fret: randomFret });
    setCorrectAnswer(note);

    // Play note with Karplus-Strong
    audioEngine.playKarplusStrong(freq, 2.0, 0.8, randomString);
  };

  // Generate new interval challenge
  const generateNewInterval = () => {
    setFeedback(null);
    const randomInterval = INTERVAL_TRAINING[Math.floor(Math.random() * INTERVAL_TRAINING.length)];
    const randomBaseFreq = 160 + Math.random() * 180; // random base pitch between E3 and E4

    setCurrentInterval(randomInterval);
    setBaseIntervalFreq(randomBaseFreq);

    const secondFreq = randomBaseFreq * Math.pow(2, randomInterval.semitones / 12);
    audioEngine.playInterval(randomBaseFreq, secondFreq);
  };

  // Generate new chord ear challenge
  const generateNewChordEar = () => {
    setFeedback(null);
    const randomChord = CHORD_EAR_TRAINING[Math.floor(Math.random() * CHORD_EAR_TRAINING.length)];
    setCurrentEarChord(randomChord);
    audioEngine.playChord(randomChord.frets, 1, 35);
  };

  // Check user guess
  const handleGuess = (guessedNoteOrName: string) => {
    setTotalAttempts((prev) => prev + 1);

    let isCorrect = false;
    if (mode === 'fretboard') {
      isCorrect = guessedNoteOrName === correctAnswer;
    } else if (mode === 'intervals') {
      isCorrect = guessedNoteOrName === currentInterval.name;
    } else if (mode === 'chords') {
      isCorrect = guessedNoteOrName === currentEarChord.name;
    }

    if (isCorrect) {
      setFeedback('correct');
      setCorrectCount((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
      audioEngine.playInTuneAffirmation();
      setTimeout(() => {
        if (mode === 'fretboard') generateNewFretCard();
        if (mode === 'intervals') generateNewInterval();
        if (mode === 'chords') generateNewChordEar();
      }, 1000);
    } else {
      setFeedback('wrong');
      setStreak(0);
    }
  };

  // Replay sound
  const handleReplayAudio = () => {
    if (mode === 'fretboard') {
      const { freq } = calculateNote(currentFretPos.string, currentFretPos.fret);
      audioEngine.playKarplusStrong(freq, 2.2, 0.85, currentFretPos.string);
    } else if (mode === 'intervals') {
      const secondFreq = baseIntervalFreq * Math.pow(2, currentInterval.semitones / 12);
      audioEngine.playInterval(baseIntervalFreq, secondFreq);
    } else if (mode === 'chords') {
      audioEngine.playChord(currentEarChord.frets, 1, 35);
    }
  };

  useEffect(() => {
    if (mode === 'fretboard') generateNewFretCard();
    if (mode === 'intervals') generateNewInterval();
    if (mode === 'chords') generateNewChordEar();
  }, [mode]);

  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 100;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>Entrenador de Memoria del Diapasón & Oído</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Repetición Espaciada
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Memoriza los 12 trastes del mástil y desarrolla oído relativo profesional
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setMode('fretboard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'fretboard' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Diapasón
          </button>
          <button
            onClick={() => setMode('intervals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'intervals' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Intervalos
          </button>
          <button
            onClick={() => setMode('chords')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'chords' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Acordes de Oído
          </button>
        </div>
      </div>

      {/* Gamification Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <Flame className="w-5 h-5 text-amber-500" />
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Racha Actual</span>
            <span className="text-base font-black text-amber-400 font-mono">{streak} 🔥</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <Award className="w-5 h-5 text-purple-400" />
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Mejor Racha</span>
            <span className="text-base font-black text-purple-300 font-mono">{bestStreak}</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <Zap className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Precisión</span>
            <span className="text-base font-black text-emerald-400 font-mono">{accuracy}%</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-400" />
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Aciertos Totales</span>
            <span className="text-base font-black text-blue-300 font-mono">
              {correctCount} / {totalAttempts}
            </span>
          </div>
        </div>
      </div>

      {/* Main Challenge Card */}
      <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
        {/* Visual Cue */}
        {mode === 'fretboard' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Identifica la Nota
            </span>
            <div className="flex items-center justify-center gap-4">
              <div className="px-5 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono font-bold text-lg">
                Cuerda: <strong className="text-white">{STRING_OPEN_NOTES[currentFretPos.string].note} (Cuerda {6 - currentFretPos.string})</strong>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-lg">
                Traste: <strong className="text-white">{currentFretPos.fret}</strong>
              </div>
            </div>
          </div>
        )}

        {mode === 'intervals' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Headphones className="w-4 h-4 text-purple-400" /> Escucha el Intervalo
            </span>
            <p className="text-sm text-slate-300 max-w-md">
              Escucha con atención las dos notas consecutivas e identifica la distancia intervalar.
            </p>
          </div>
        )}

        {mode === 'chords' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Headphones className="w-4 h-4 text-purple-400" /> Identifica la Calidad del Acorde
            </span>
            <p className="text-sm text-slate-300 max-w-md">
              Escucha el rasgueo e identifica si el acorde es Mayor, Menor o Séptima de Dominante.
            </p>
          </div>
        )}

        {/* Audio Replay Button */}
        <button
          onClick={handleReplayAudio}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md"
        >
          <Volume2 className="w-4 h-4" />
          <span>Repetir Sonido</span>
        </button>

        {/* Feedback Message */}
        {feedback === 'correct' && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>¡Excelente! Respuesta correcta.</span>
          </div>
        )}

        {feedback === 'wrong' && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-2 animate-shake">
            <XCircle className="w-4 h-4" />
            <span>
              Incorrecto. {mode === 'fretboard' && `La nota correcta era ${correctAnswer}.`}
            </span>
          </div>
        )}

        {/* Answer Selection Buttons */}
        <div className="w-full max-w-xl">
          {mode === 'fretboard' && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {NOTE_NAMES.map((note) => (
                <button
                  key={note}
                  onClick={() => handleGuess(note)}
                  className="py-3 px-2 rounded-xl bg-slate-900 hover:bg-purple-600/30 hover:border-purple-500 border border-slate-800 text-slate-100 font-mono font-bold text-sm transition-all cursor-pointer"
                >
                  {note}
                </button>
              ))}
            </div>
          )}

          {mode === 'intervals' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INTERVAL_TRAINING.map((inter) => (
                <button
                  key={inter.name}
                  onClick={() => handleGuess(inter.name)}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-purple-600/30 hover:border-purple-500 border border-slate-800 text-left transition-all cursor-pointer"
                >
                  <div className="font-bold text-xs text-slate-100">{inter.name}</div>
                  <div className="text-[11px] text-slate-400">{inter.desc}</div>
                </button>
              ))}
            </div>
          )}

          {mode === 'chords' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CHORD_EAR_TRAINING.map((chord) => (
                <button
                  key={chord.name}
                  onClick={() => handleGuess(chord.name)}
                  className="p-4 rounded-xl bg-slate-900 hover:bg-purple-600/30 hover:border-purple-500 border border-slate-800 text-center transition-all cursor-pointer"
                >
                  <div className="font-bold text-sm text-slate-100">{chord.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{chord.desc}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
