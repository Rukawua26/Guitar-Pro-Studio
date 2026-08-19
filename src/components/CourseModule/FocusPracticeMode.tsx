import React, { useState, useEffect, useRef } from 'react';
import { Lesson } from '../../types/course';
import { audioEngine } from '../../utils/audioSynthesizer';
import { InteractiveVideoPlayer } from './InteractiveVideoPlayer';
import { InteractiveFretboard } from '../FretboardModule/InteractiveFretboard';
import {
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Flame,
  Zap,
  Volume2,
  X,
  Radio,
  FileCode,
  Music,
  CheckCircle2
} from 'lucide-react';

interface FocusPracticeModeProps {
  lesson: Lesson;
  onClose: () => void;
}

export const FocusPracticeMode: React.FC<FocusPracticeModeProps> = ({ lesson, onClose }) => {
  const [bpm, setBpm] = useState<number>(lesson.bpmObjetivo || 80);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState<boolean>(false);
  const [autoSpeedTrainer, setAutoSpeedTrainer] = useState<boolean>(false);
  const [cleanCyclesCount, setCleanCyclesCount] = useState<number>(0);
  const [currentBeat, setCurrentBeat] = useState<number>(0);

  const metronomeIntervalRef = useRef<number | null>(null);

  // Metronome click with auto-accelerator (+2 BPM every 4 measures / 16 beats)
  useEffect(() => {
    if (isMetronomePlaying) {
      const intervalMs = (60 / bpm) * 1000;
      let beatCounter = 0;

      metronomeIntervalRef.current = window.setInterval(() => {
        const isAccent = beatCounter % 4 === 0;
        setCurrentBeat(beatCounter % 4);
        audioEngine.playMetronomeClick(isAccent, bpm, 0.7);

        beatCounter++;

        // Auto accelerate every 16 beats (4 bars) if enabled
        if (autoSpeedTrainer && beatCounter % 16 === 0) {
          setBpm((prev) => {
            const next = Math.min(240, prev + 2);
            return next;
          });
          setCleanCyclesCount((c) => c + 1);
        }
      }, intervalMs);
    } else {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    }

    return () => {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    };
  }, [isMetronomePlaying, bpm, autoSpeedTrainer]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19] text-slate-100 flex flex-col overflow-y-auto animate-fadeIn">
      {/* Top Minimalist Focus Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800/90 px-4 sm:px-8 py-3.5 flex items-center justify-between backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Modo Enfoque de Práctica
              </span>
              <span className="text-xs text-slate-400 font-medium">Nivel {lesson.nivel}</span>
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-100 leading-tight">
              {lesson.titulo}
            </h2>
          </div>
        </div>

        {/* Action Controls & Close */}
        <div className="flex items-center gap-3">
          {/* Speed Trainer Toggle */}
          <button
            onClick={() => setAutoSpeedTrainer(!autoSpeedTrainer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              autoSpeedTrainer
                ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Acelerador (+2 BPM): {autoSpeedTrainer ? 'ACTIVO' : 'OFF'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Salir del Modo Enfoque (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Focus Canvas: Video + Tab + Metronome / Fretboard */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Split: Video Player (Left) + Smart Metronome (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Video Lesson Player (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
            <InteractiveVideoPlayer lesson={lesson} />
          </div>

          {/* Smart Practice Metronome & Rhythm Pulse (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" /> Pulso Rítmico de Práctica
                </span>
                <span className="text-xs font-mono text-amber-400">
                  {autoSpeedTrainer && `Ciclos: ${cleanCyclesCount}`}
                </span>
              </div>

              {/* Visual Beat Indicator Lights */}
              <div className="grid grid-cols-4 gap-2 my-2">
                {[0, 1, 2, 3].map((b) => (
                  <div
                    key={b}
                    className={`h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all duration-75 ${
                      isMetronomePlaying && currentBeat === b
                        ? b === 0
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-105'
                          : 'bg-amber-400 text-slate-950 shadow-md scale-105'
                        : 'bg-slate-950 text-slate-600 border border-slate-800'
                    }`}
                  >
                    {b + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Large BPM Display */}
            <div className="flex items-center justify-center gap-4 py-2">
              <button
                onClick={() => setBpm((b) => Math.max(30, b - 5))}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-2xl font-mono font-bold text-xs cursor-pointer"
              >
                -5
              </button>
              <div className="text-center">
                <span className="text-5xl font-black font-mono tracking-tight text-slate-100 block">
                  {bpm}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                  BPM Actual
                </span>
              </div>
              <button
                onClick={() => setBpm((b) => Math.min(240, b + 5))}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-2xl font-mono font-bold text-xs cursor-pointer"
              >
                +5
              </button>
            </div>

            {/* Metronome Start/Stop */}
            <button
              onClick={() => setIsMetronomePlaying(!isMetronomePlaying)}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
                isMetronomePlaying
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/30'
              }`}
            >
              {isMetronomePlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" /> Pausar Metrónomo
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> Iniciar Pulso
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tablature Snippet & Synchronized Fretboard */}
        <div className="space-y-6">
          {lesson.tabSnippet && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" /> Tablatura del Ejercicio
                </span>
                <span className="text-xs text-slate-500 font-mono">Lectura Directa</span>
              </div>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-emerald-400 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed shadow-inner">
                {lesson.tabSnippet}
              </pre>
            </div>
          )}

          {/* Interactive Fretboard Visualizer */}
          <InteractiveFretboard />
        </div>
      </div>
    </div>
  );
};
