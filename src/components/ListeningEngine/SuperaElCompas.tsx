import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGuitar } from '../../context/GuitarContext';
import { yinDetector, getPitchInfo } from '../../utils/audioTuner';
import { audioEngine } from '../../utils/audioSynthesizer';
import { CHORD_LIBRARY } from '../../data/courseData';
import { ChordDiagram } from '../Common/ChordDiagram';
import {
  Mic,
  MicOff,
  Flame,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  Volume2,
  Sliders,
  ChevronRight,
  Music,
  Activity,
  ArrowRight,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TargetStep {
  label: string;
  type: 'chord' | 'single_note';
  targetNote?: string;
  targetFreq?: number;
  chordKey?: string;
  notesInChord?: string[];
  fingeringDesc?: string;
}

interface SongChallenge {
  id: string;
  title: string;
  level: string;
  artist: string;
  bpm: number;
  description: string;
  steps: TargetStep[];
}

const CHALLENGES_CATALOG: SongChallenge[] = [
  {
    id: 'knockin',
    title: "Knockin' on Heaven's Door",
    level: 'Nivel 1 (Principiante)',
    artist: 'Bob Dylan',
    bpm: 70,
    description: 'Domina las transiciones fluidas de acordes abiertos básicos con sincronía rítmica.',
    steps: [
      { label: 'G Mayor', type: 'chord', chordKey: 'G', notesInChord: ['G', 'B', 'D'], fingeringDesc: 'Dedos 1, 2, 3 en trastes 3, 2, 3' },
      { label: 'D Mayor', type: 'chord', chordKey: 'D', notesInChord: ['D', 'F#', 'A'], fingeringDesc: 'Dedos 1, 2, 3 en trastes 2, 3, 2' },
      { label: 'Am (La Menor)', type: 'chord', chordKey: 'Am', notesInChord: ['A', 'C', 'E'], fingeringDesc: 'Dedos 1, 2, 3 en trastes 1, 2, 2' },
      { label: 'G Mayor', type: 'chord', chordKey: 'G', notesInChord: ['G', 'B', 'D'], fingeringDesc: 'Dedos 1, 2, 3 en trastes 3, 2, 3' },
      { label: 'D Mayor', type: 'chord', chordKey: 'D', notesInChord: ['D', 'F#', 'A'], fingeringDesc: 'Dedos 1, 2, 3 en trastes 2, 3, 2' },
      { label: 'C Mayor', type: 'chord', chordKey: 'C', notesInChord: ['C', 'E', 'G'], fingeringDesc: 'Dedos 1, 2, 3 en trastes 1, 2, 3' }
    ]
  },
  {
    id: 'pop_anthem',
    title: 'Himno Pop/Rock Universal (I - V - vi - IV)',
    level: 'Nivel 1 - 2',
    artist: 'Progresión Canónica',
    bpm: 80,
    description: 'La progresión más famosa de la historia: C - G - Am - F.',
    steps: [
      { label: 'C (Do Mayor)', type: 'chord', chordKey: 'C', notesInChord: ['C', 'E', 'G'], fingeringDesc: 'Dedos 1, 2, 3' },
      { label: 'G (Sol Mayor)', type: 'chord', chordKey: 'G', notesInChord: ['G', 'B', 'D'], fingeringDesc: 'Dedos 1, 2, 3' },
      { label: 'Am (La Menor)', type: 'chord', chordKey: 'Am', notesInChord: ['A', 'C', 'E'], fingeringDesc: 'Dedos 1, 2, 3' },
      { label: 'F (Fa con Cejilla)', type: 'chord', chordKey: 'F', notesInChord: ['F', 'A', 'C'], fingeringDesc: 'Cejilla en traste 1' }
    ]
  },
  {
    id: 'sultans',
    title: 'Sultans of Swing (Riff Armónico CAGED)',
    level: 'Niveles 3 - 4',
    artist: 'Dire Straits',
    bpm: 95,
    description: 'Comprensión de cejillas y formas de tríadas CAGED a lo largo del mástil.',
    steps: [
      { label: 'Dm (Re Menor)', type: 'chord', chordKey: 'Dm', notesInChord: ['D', 'F', 'A'], fingeringDesc: 'Forma Dm en traste 1 o Cejilla traste 5' },
      { label: 'C (Do Mayor)', type: 'chord', chordKey: 'C', notesInChord: ['C', 'E', 'G'], fingeringDesc: 'Forma A en traste 3' },
      { label: 'Bb (Si Bemol Mayor)', type: 'chord', chordKey: 'A', notesInChord: ['A#', 'D', 'F'], fingeringDesc: 'Cejilla en traste 1 (cuerda 5)' },
      { label: 'A7 (La Dominante)', type: 'chord', chordKey: 'A7', notesInChord: ['A', 'C#', 'E', 'G'], fingeringDesc: 'Acorde de tensión de resolución' }
    ]
  },
  {
    id: 'cliffs_lick',
    title: 'Cliffs of Dover (Fraseo Pentatónico)',
    level: 'Niveles 6 - 7',
    artist: 'Eric Johnson',
    bpm: 110,
    description: 'Secuencia melódica de alta precisión con púa alternada y notas limpias.',
    steps: [
      { label: 'Nota G4 (392 Hz)', type: 'single_note', targetNote: 'G', targetFreq: 392.00, fingeringDesc: 'Cuerda 1, Traste 3' },
      { label: 'Nota E4 (329.6 Hz)', type: 'single_note', targetNote: 'E', targetFreq: 329.63, fingeringDesc: 'Cuerda 1 al aire o Cuerda 2 Traste 5' },
      { label: 'Nota D4 (293.6 Hz)', type: 'single_note', targetNote: 'D', targetFreq: 293.66, fingeringDesc: 'Cuerda 2, Traste 3' },
      { label: 'Nota B3 (246.9 Hz)', type: 'single_note', targetNote: 'B', targetFreq: 246.94, fingeringDesc: 'Cuerda 2 al aire o Cuerda 3 Traste 4' },
      { label: 'Nota A3 (220 Hz)', type: 'single_note', targetNote: 'A', targetFreq: 220.00, fingeringDesc: 'Cuerda 3, Traste 2' }
    ]
  },
  {
    id: 'penta_a_minor',
    title: 'Escala Pentatónica Menor en La (5 Notas)',
    level: 'Nivel 2 - 3',
    artist: 'Fundamento Rock & Blues',
    bpm: 85,
    description: 'Toca las 5 notas de la primera posición de la pentatónica de La menor en orden ascendente.',
    steps: [
      { label: 'Tónica A (110 Hz)', type: 'single_note', targetNote: 'A', targetFreq: 110.00, fingeringDesc: 'Cuerda 6, Traste 5 (Índice)' },
      { label: 'b3 C (130.8 Hz)', type: 'single_note', targetNote: 'C', targetFreq: 130.81, fingeringDesc: 'Cuerda 6, Traste 8 (Meñique)' },
      { label: '4 D (146.8 Hz)', type: 'single_note', targetNote: 'D', targetFreq: 146.83, fingeringDesc: 'Cuerda 5, Traste 5 (Índice)' },
      { label: '5 E (164.8 Hz)', type: 'single_note', targetNote: 'E', targetFreq: 164.81, fingeringDesc: 'Cuerda 5, Traste 7 (Anular)' },
      { label: 'b7 G (196 Hz)', type: 'single_note', targetNote: 'G', targetFreq: 196.00, fingeringDesc: 'Cuerda 4, Traste 5 (Índice)' }
    ]
  }
];

export const SuperaElCompas: React.FC = () => {
  const { addNotification, saveOneMinuteRecord } = useGuitar();

  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('knockin');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [detectedPitch, setDetectedPitch] = useState<{ note: string; octave: number; freq: number; cents: number } | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [isHitActive, setIsHitActive] = useState<boolean>(false);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [correctHits, setCorrectHits] = useState<number>(0);
  const [noiseGate, setNoiseGate] = useState<number>(0.012);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState<boolean>(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastAdvanceTimeRef = useRef<number>(0);

  const currentChallenge = CHALLENGES_CATALOG.find((c) => c.id === selectedChallengeId) || CHALLENGES_CATALOG[0];
  const currentStep = currentChallenge.steps[currentStepIndex] || currentChallenge.steps[0];

  const stopListening = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsListening(false);
    setDetectedPitch(null);
  }, []);

  const startListening = async () => {
    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false
          }
        });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      if (!stream) throw new Error('No audio stream');
      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListening(true);
      yinDetector.resetSmoothing();
      runEvaluationLoop();
    } catch (err) {
      alert('No se pudo acceder al micrófono. Recuerda permitir el acceso en el navegador o usa el botón "Avanzar Compás Manualmente" para practicar.');
      setIsListening(false);
    }
  };

  const advanceStep = () => {
    const now = performance.now();
    if (now - lastAdvanceTimeRef.current < 450) return; // Debounce
    lastAdvanceTimeRef.current = now;

    // Trigger visual hit & audio feedback
    setIsHitActive(true);
    setTimeout(() => setIsHitActive(false), 380);

    audioEngine.playInTuneAffirmation();

    setCorrectHits((prev) => prev + 1);
    setTotalAttempts((prev) => prev + 1);

    setStreak((prev) => {
      const next = prev + 1;
      if (next > bestStreak) setBestStreak(next);
      if (next >= 10) setComboMultiplier(4);
      else if (next >= 6) setComboMultiplier(3);
      else if (next >= 3) setComboMultiplier(2);
      else setComboMultiplier(1);
      return next;
    });

    setScore((s) => s + 100 * comboMultiplier);

    if (currentStepIndex + 1 >= currentChallenge.steps.length) {
      // Loop or victory
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}

      addNotification(
        '¡Compás Completado! 🏆',
        `Completaste la secuencia "${currentChallenge.title}" con éxito.`,
        'success'
      );
      setCurrentStepIndex(0);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const runEvaluationLoop = () => {
    if (!analyserRef.current || !audioCtxRef.current) return;

    const analyser = analyserRef.current;
    const timeBuffer = new Float32Array(analyser.fftSize);

    const checkPitch = () => {
      analyser.getFloatTimeDomainData(timeBuffer);

      // Calculate RMS energy
      let sum = 0;
      for (let i = 0; i < timeBuffer.length; i++) {
        sum += timeBuffer[i] * timeBuffer[i];
      }
      const rms = Math.sqrt(sum / timeBuffer.length);

      if (rms >= noiseGate) {
        const result = yinDetector.detectPitch(
          timeBuffer,
          audioCtxRef.current!.sampleRate,
          noiseGate
        );

        if (result && result.frequency > 50 && result.frequency < 1200) {
          const info = getPitchInfo(result.frequency, 440);
          if (info) {
            setDetectedPitch({
              note: info.note,
              octave: info.octave,
              freq: info.frequency,
              cents: info.cents
            });

            // Evaluate if detected pitch matches target
            const step = currentChallenge.steps[currentStepIndex];
            let isMatch = false;

            if (step.type === 'single_note' && step.targetNote) {
              // Exact pitch class match
              if (info.note === step.targetNote) {
                isMatch = true;
              }
            } else if (step.type === 'chord') {
              // Matches any root or fundamental tone of the target chord
              if (step.notesInChord && step.notesInChord.includes(info.note)) {
                isMatch = true;
              }
            }

            if (isMatch) {
              advanceStep();
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(checkPitch);
    };

    checkPitch();
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  const handleManualHit = () => {
    advanceStep();
  };

  const handleResetChallenge = () => {
    setCurrentStepIndex(0);
    setStreak(0);
    setScore(0);
  };

  const accuracy = totalAttempts > 0 ? Math.round((correctHits / totalAttempts) * 100) : 100;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner / Listening Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shadow-inner">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              <span>Motor de Evaluación por Micrófono: "Supera el Compás"</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Listening Engine
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Toca tu guitarra real frente al micrófono. La plataforma detecta tus frecuencias y avanza el compás solo cuando ejecutas el acorde correcto.
            </p>
          </div>
        </div>

        {/* Start / Stop & Mic Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xl cursor-pointer ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-500/50'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30 ring-2 ring-emerald-400/40'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" /> Detener Escucha
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" /> Activar Micrófono Real
              </>
            )}
          </button>
        </div>
      </div>

      {/* Repertoire Selector Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Music className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-300">Seleccionar Desafío:</span>
          <select
            value={selectedChallengeId}
            onChange={(e) => {
              setSelectedChallengeId(e.target.value);
              setCurrentStepIndex(0);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-bold outline-none cursor-pointer"
          >
            {CHALLENGES_CATALOG.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                {c.title} ({c.level})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-slate-400">
            Tempo: <strong className="text-amber-400">{currentChallenge.bpm} BPM</strong>
          </span>
          <span className="text-slate-400">
            Artista: <strong className="text-slate-200">{currentChallenge.artist}</strong>
          </span>
        </div>
      </div>

      {/* Gamification Stats HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <Flame className="w-6 h-6 text-amber-500" />
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-bold block">Racha de Aciertos</span>
            <span className="text-xl font-black text-amber-400 font-mono">{streak} 🔥</span>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <Zap className="w-6 h-6 text-emerald-400" />
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-bold block">Multiplicador</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{comboMultiplier}x COMBO</span>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <Award className="w-6 h-6 text-purple-400" />
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-bold block">Puntaje Total</span>
            <span className="text-xl font-black text-purple-300 font-mono">{score} PTS</span>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-blue-400" />
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-bold block">Compás Activo</span>
            <span className="text-xl font-black text-blue-300 font-mono">
              {currentStepIndex + 1} / {currentChallenge.steps.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage: Timeline & Active Chord / Note */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Target Hero Card (8 Cols) */}
        <div
          className={`lg:col-span-8 rounded-3xl p-6 sm:p-8 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
            isHitActive
              ? 'bg-emerald-950/60 border-emerald-400 ring-4 ring-emerald-500/30 scale-[1.01]'
              : 'bg-slate-900/90 border-slate-800 shadow-2xl'
          }`}
        >
          {/* Top Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                {isListening ? 'ESCUCHANDO TU GUITARRA...' : 'ESPERANDO ACTIVACIÓN DE MICRÓFONO'}
              </span>
            </div>

            <button
              onClick={handleResetChallenge}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reiniciar Secuencia
            </button>
          </div>

          {/* Central Target Display */}
          <div className="flex flex-col items-center justify-center my-6 space-y-4 text-center">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
              {currentStep.type === 'chord' ? 'Toca el Acorde en tu Guitarra' : 'Toca la Nota Objetivo'}
            </span>

            <div className="text-5xl sm:text-6xl font-black text-slate-100 tracking-tight flex items-center gap-3">
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                {currentStep.label}
              </span>
            </div>

            {currentStep.fingeringDesc && (
              <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                Digitación: <strong className="text-amber-400">{currentStep.fingeringDesc}</strong>
              </div>
            )}

            {/* Realtime Detected Pitch Banner */}
            <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-400">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Nota Capturada:</span>
              </div>
              <span className="text-base font-black text-emerald-400">
                {detectedPitch ? `${detectedPitch.note}${detectedPitch.octave} (${detectedPitch.freq.toFixed(1)} Hz)` : '-- (Silencio)'}
              </span>
            </div>
          </div>

          {/* Timeline of upcoming measures */}
          <div className="space-y-2 mt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Línea de Tiempo del Compás:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {currentChallenge.steps.map((step, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isPassed = idx < currentStepIndex;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 scale-105 ring-2 ring-amber-300'
                        : isPassed
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 opacity-60'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-[10px] block font-mono">#{idx + 1}</span>
                    <span className="text-xs font-bold truncate block">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Chord Diagram & Manual Validation (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Chord Diagram Card */}
          {currentStep.chordKey && CHORD_LIBRARY[currentStep.chordKey] && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400 uppercase mb-3">Diagrama de Postura</span>
              <ChordDiagram chord={CHORD_LIBRARY[currentStep.chordKey]} size="md" />
            </div>
          )}

          {/* Manual Validation / Audio Test */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3 text-center">
            <span className="text-xs font-bold text-slate-400">¿Sin micrófono a mano?</span>
            <button
              onClick={handleManualHit}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Zap className="w-4 h-4" /> Avanzar Compás Manualmente
            </button>
            <p className="text-[11px] text-slate-500 leading-tight">
              Úsalo para practicar la digitación y avanzar al siguiente compás a tu propio ritmo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
