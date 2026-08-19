import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../../utils/audioSynthesizer';
import { Play, Pause, Plus, Minus, RotateCcw, Volume2, Sparkles, Sliders } from 'lucide-react';

export const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState<number>(90);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState<number>(4);
  const [subdivision, setSubdivision] = useState<'quarter' | 'eighth' | 'sixteenth' | 'triplet'>('quarter');
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  const intervalRef = useRef<number | null>(null);
  const currentBeatRef = useRef<number>(0);

  const getTempoName = (tempo: number) => {
    if (tempo < 60) return 'Largo (Muy lento)';
    if (tempo < 76) return 'Adagio (Lento y solemne)';
    if (tempo < 108) return 'Andante (Paso tranquilo)';
    if (tempo < 120) return 'Moderato (Moderado)';
    if (tempo < 168) return 'Allegro (Rápido y alegre)';
    if (tempo < 200) return 'Presto (Muy rápido)';
    return 'Prestissimo (Extremo)';
  };

  const getSubdivisionMultiplier = () => {
    switch (subdivision) {
      case 'eighth': return 2;
      case 'sixteenth': return 4;
      case 'triplet': return 3;
      default: return 1;
    }
  };

  const startMetronome = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const mult = getSubdivisionMultiplier();
    const intervalMs = (60000 / bpm) / mult;
    currentBeatRef.current = 0;
    setCurrentBeat(0);

    // Play first tick
    audioEngine.playMetronomeClick(true, bpm);

    intervalRef.current = window.setInterval(() => {
      currentBeatRef.current = (currentBeatRef.current + 1) % (beatsPerMeasure * mult);
      const isMainBeat = currentBeatRef.current % mult === 0;
      const isFirstBeat = currentBeatRef.current === 0;

      setCurrentBeat(Math.floor(currentBeatRef.current / mult));
      audioEngine.playMetronomeClick(isFirstBeat, bpm);
    }, intervalMs);

    setIsPlaying(true);
  };

  const stopMetronome = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
    currentBeatRef.current = 0;
  };

  useEffect(() => {
    if (isPlaying) {
      startMetronome();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [bpm, beatsPerMeasure, subdivision]);

  const handleTapTempo = () => {
    const now = Date.now();
    const newTaps = [...tapTimes.filter(t => now - t < 3000), now];
    setTapTimes(newTaps);

    if (newTaps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 30 && calculatedBpm <= 260) {
        setBpm(calculatedBpm);
      }
    }
  };

  // Metronome pendulum angle
  const pendulumAngle = isPlaying ? (currentBeat % 2 === 0 ? -22 : 22) : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-2xl mx-auto backdrop-blur-md relative overflow-hidden">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-100">
          Metrónomo & Entrenador de Tempo
        </h2>
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest mt-1 block">
          {getTempoName(bpm)}
        </span>
      </div>

      {/* Visual Beat Indicators */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {Array.from({ length: beatsPerMeasure }).map((_, idx) => {
          const isActive = isPlaying && currentBeat === idx;
          const isFirst = idx === 0;

          return (
            <div
              key={idx}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-100 ${
                isActive
                  ? isFirst
                    ? 'bg-rose-500 text-white scale-110 shadow-lg shadow-rose-500/30'
                    : 'bg-amber-400 text-slate-950 scale-105 shadow-md shadow-amber-400/30'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/50'
              }`}
            >
              {idx + 1}
            </div>
          );
        })}
      </div>

      {/* Main BPM Display & Speed Buttons */}
      <div className="flex items-center justify-center gap-6 my-6">
        <button
          onClick={() => setBpm(b => Math.max(30, b - 5))}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors font-bold text-xs cursor-pointer"
        >
          -5
        </button>
        <button
          onClick={() => setBpm(b => Math.max(30, b - 1))}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors cursor-pointer"
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-6xl font-black font-mono tracking-tighter text-slate-100">
            {bpm}
          </span>
          <span className="text-xs text-slate-400 uppercase tracking-widest block mt-1 font-semibold">
            BPM (Pulsos / Min)
          </span>
        </div>

        <button
          onClick={() => setBpm(b => Math.min(260, b + 1))}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={() => setBpm(b => Math.min(260, b + 5))}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors font-bold text-xs cursor-pointer"
        >
          +5
        </button>
      </div>

      {/* BPM Slider */}
      <div className="px-4 mb-8">
        <input
          type="range"
          min="30"
          max="240"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
          <span>30 BPM (Lento)</span>
          <span>120 BPM (Estándar)</span>
          <span>240 BPM (Rápido)</span>
        </div>
      </div>

      {/* Controls Bar: Time Signature & Subdivisions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {/* Time signature */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Compás</span>
          <div className="flex gap-1">
            {[2, 3, 4, 6].map(beats => (
              <button
                key={beats}
                onClick={() => setBeatsPerMeasure(beats)}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  beatsPerMeasure === beats ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {beats}/4
              </button>
            ))}
          </div>
        </div>

        {/* Subdivision */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Subdivisión</span>
          <select
            value={subdivision}
            onChange={(e) => setSubdivision(e.target.value as any)}
            className="w-full bg-slate-800 text-slate-200 text-xs font-medium rounded-lg p-1.5 outline-none"
          >
            <option value="quarter">Negras (1/4)</option>
            <option value="eighth">Corcheas (1/8)</option>
            <option value="sixteenth">Semicorcheas (1/16)</option>
            <option value="triplet">Tresillos (1/3)</option>
          </select>
        </div>

        {/* Tap Tempo Button */}
        <div className="col-span-2 sm:col-span-1 bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center">
          <button
            onClick={handleTapTempo}
            className="w-full h-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-lg transition-colors uppercase tracking-wider cursor-pointer"
          >
            Tap Tempo (T)
          </button>
        </div>
      </div>

      {/* Main Start / Pause Action */}
      <div className="flex justify-center">
        <button
          onClick={isPlaying ? stopMetronome : startMetronome}
          className={`px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all shadow-xl cursor-pointer ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/30'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-6 h-6 fill-current" /> Pausar Metrónomo
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current" /> Iniciar Metrónomo
            </>
          )}
        </button>
      </div>
    </div>
  );
};
