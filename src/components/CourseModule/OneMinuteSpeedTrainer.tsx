import React, { useState, useEffect, useRef } from 'react';
import { useGuitar } from '../../context/GuitarContext';
import { audioEngine } from '../../utils/audioSynthesizer';
import { Play, RotateCcw, Award, Zap, ChevronRight } from 'lucide-react';

interface OneMinuteSpeedTrainerProps {
  defaultPair?: string;
  onClose?: () => void;
}

export const OneMinuteSpeedTrainer: React.FC<OneMinuteSpeedTrainerProps> = ({
  defaultPair = 'D_A'
}) => {
  const { profile, saveOneMinuteRecord } = useGuitar();
  const [selectedPair, setSelectedPair] = useState<string>(defaultPair);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [count, setCount] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const PAIRS = [
    { id: 'D_A', label: 'Re Mayor (D) ↔ La Mayor (A)', level: 'Nivel 1' },
    { id: 'A_E', label: 'La Mayor (A) ↔ Mi Mayor (E)', level: 'Nivel 1' },
    { id: 'G_C', label: 'Sol Mayor (G) ↔ Do Mayor (C)', level: 'Nivel 2' },
    { id: 'C_D', label: 'Do Mayor (C) ↔ Re Mayor (D)', level: 'Nivel 2' },
    { id: 'F_C', label: 'Fa Cejilla (F) ↔ Do Mayor (C)', level: 'Nivel 3' },
    { id: 'Bm_Em', label: 'Si menor (Bm) ↔ Mi menor (Em)', level: 'Nivel 3' }
  ];

  const currentRecord = profile.oneMinuteRecords[selectedPair] || 0;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            setIsFinished(true);
            audioEngine.playMetronomeClick(true);
            return 0;
          }
          if (prev <= 5) {
            audioEngine.playMetronomeClick(false);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // When timer finishes, save result
  useEffect(() => {
    if (isFinished) {
      saveOneMinuteRecord(selectedPair, count);
    }
  }, [isFinished]);

  const handleStart = () => {
    setTimeLeft(60);
    setCount(0);
    setIsActive(true);
    setIsFinished(false);
    audioEngine.playMetronomeClick(true);
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(60);
    setCount(0);
  };

  const handleIncrement = () => {
    if (!isActive && !isFinished) {
      handleStart();
      setCount(1);
      return;
    }
    if (isActive) {
      setCount(prev => prev + 1);
      audioEngine.playMetronomeClick(false);
    }
  };

  // Keyboard shortcut: Spacebar to count
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (isActive || (!isActive && !isFinished))) {
        e.preventDefault();
        handleIncrement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isFinished]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
              <Zap className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-slate-100">
              Entrenador de Cambios de 1 Minuto
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Mide tu velocidad de transición limpia entre acordes en 60 segundos.
          </p>
        </div>

        {/* Pair selector */}
        <select
          value={selectedPair}
          onChange={(e) => {
            setSelectedPair(e.target.value);
            handleReset();
          }}
          disabled={isActive}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2 outline-none focus:border-amber-500 transition-colors"
        >
          {PAIRS.map(p => (
            <option key={p.id} value={p.id}>
              {p.label} ({p.level})
            </option>
          ))}
        </select>
      </div>

      {/* Dashboard Timer & Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Timer Card */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Tiempo Restante
          </span>
          <span className={`text-4xl font-mono font-extrabold ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-slate-100'}`}>
            {timeLeft}s
          </span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-rose-500' : 'bg-amber-500'}`}
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>
        </div>

        {/* Live Count Card */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Cambios Realizados
          </span>
          <span className="text-4xl font-mono font-extrabold text-amber-400">
            {count}
          </span>
          <span className="text-xs text-slate-400 mt-2">
            Objetivo Nivel 1: <strong className="text-emerald-400">30+ cambios/min</strong>
          </span>
        </div>

        {/* Personal Best Card */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" /> Récord Personal
          </span>
          <span className="text-4xl font-mono font-extrabold text-emerald-400">
            {currentRecord}
          </span>
          <span className="text-xs text-slate-400 mt-2">
            {count > currentRecord ? '🔥 ¡Superando tu marca!' : 'Tu mejor registro'}
          </span>
        </div>
      </div>

      {/* Main Big Tapping Button */}
      <div className="flex flex-col items-center justify-center gap-4 py-4">
        <button
          onClick={handleIncrement}
          className={`w-full max-w-md py-8 px-6 rounded-2xl font-bold text-2xl tracking-wider transition-all transform active:scale-95 shadow-xl flex flex-col items-center justify-center gap-2 cursor-pointer ${
            isActive
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
              : isFinished
              ? 'bg-slate-800 text-slate-300 border border-slate-700'
              : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-emerald-500/20'
          }`}
        >
          {isActive ? (
            <>
              <span>¡CAMBIO LIMPIO! (+1)</span>
              <span className="text-xs font-normal text-slate-900 font-mono">
                Haz clic o pulsa [ESPACIO] con cada acorde
              </span>
            </>
          ) : isFinished ? (
            <>
              <span className="text-emerald-400">¡Tiempo Cumplido!</span>
              <span className="text-sm font-medium text-slate-300">
                Lograste {count} cambios por minuto
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-2">
                <Play className="w-6 h-6 fill-current" /> INICIAR DRILL (60s)
              </span>
              <span className="text-xs font-normal opacity-80">
                Pulsa para empezar la cuenta regresiva
              </span>
            </>
          )}
        </button>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {isActive && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Reiniciar
            </button>
          )}
          {isFinished && (
            <button
              onClick={handleStart}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <Play className="w-4 h-4 fill-current" /> Intentar de Nuevo
            </button>
          )}
        </div>
      </div>

      {/* Pro tip footer */}
      <div className="mt-4 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-center gap-3 text-xs text-slate-400">
        <span className="text-amber-400 font-bold">Consejo de JustinGuitar:</span>
        <span>
          Prioriza la limpieza del sonido antes que la velocidad. Cuenta solo los cambios donde todas las cuerdas suenen claras sin muteos involuntarios.
        </span>
      </div>
    </div>
  );
};
