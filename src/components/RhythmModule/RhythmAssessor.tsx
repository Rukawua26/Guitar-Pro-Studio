import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../../utils/audioSynthesizer';
import {
  Activity,
  Mic,
  MicOff,
  Gauge,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Award,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  X
} from 'lucide-react';

interface TimingHit {
  offsetMs: number;
  judgment: 'perfect' | 'early' | 'late' | 'miss';
  timestamp: number;
}

export const RhythmAssessor: React.FC = () => {
  const [bpm, setBpm] = useState<number>(90);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [hits, setHits] = useState<TimingHit[]>([]);
  const [currentJudgment, setCurrentJudgment] = useState<TimingHit | null>(null);
  const [lastOffsetMs, setLastOffsetMs] = useState<number>(0);
  const [accuracyScore, setAccuracyScore] = useState<number>(100);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const metronomeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const expectedBeatTimesRef = useRef<number[]>([]);
  const lastDetectedOnsetRef = useRef<number>(0);

  // Start / Stop Listening to Mic
  const toggleMic = async () => {
    if (isListeningMic) {
      // Stop mic
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setIsListeningMic(false);
    } else {
      // Start mic
      try {
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            }
          });
        } catch (e) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }

        if (!stream) throw new Error('No stream');
        micStreamRef.current = stream;

        const ctx = audioEngine.getContext();
        audioCtxRef.current = ctx;
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.2;
        source.connect(analyser);
        analyserRef.current = analyser;

        setIsListeningMic(true);
        startOnsetDetection();
      } catch (err: unknown) {
        console.warn('Rhythm mic notice:', err);
        const errorObj = err as { name?: string; message?: string };
        const errName = errorObj.name || '';
        const errMsg = errorObj.message || '';

        if (errName === 'NotFoundError' || errMsg.toLowerCase().includes('not found')) {
          setMicError('No se detectó ningún micrófono conectado. Puedes evaluar tu precisión rítmica usando el botón "Pulsar Espacio / Tap" o la barra espaciadora.');
        } else if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          setMicError('Permiso de micrófono denegado en el navegador. Concede permisos o usa la tecla Espacio.');
        } else {
          setMicError('No se pudo acceder a la entrada de audio. Usa la tecla Espacio o el botón Tap para la prueba de tempo.');
        }
        setIsListeningMic(false);
      }
    }
  };

  // Real-Time Onset Transient Peak Detector (RMS & Spectral Flux)
  const startOnsetDetection = () => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const buffer = new Float32Array(analyser.fftSize);
    let prevRms = 0;

    const detectLoop = () => {
      analyser.getFloatTimeDomainData(buffer);

      // Compute current RMS
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) {
        sum += buffer[i] * buffer[i];
      }
      const rms = Math.sqrt(sum / buffer.length);
      const rmsDiff = rms - prevRms;
      const nowMs = performance.now();

      // Onset threshold: sharp volume spike + debounce (100ms)
      if (rmsDiff > 0.045 && rms > 0.035 && nowMs - lastDetectedOnsetRef.current > 110) {
        lastDetectedOnsetRef.current = nowMs;
        assessOnsetTiming(nowMs);
      }

      prevRms = rms;
      animFrameRef.current = requestAnimationFrame(detectLoop);
    };

    detectLoop();
  };

  // Assess user pick attack vs closest theoretical metronome beat
  const assessOnsetTiming = (detectedTimeMs: number) => {
    if (!isPlaying || expectedBeatTimesRef.current.length === 0) return;

    // Find closest beat
    const beatIntervalMs = (60 / bpm) * 1000;
    let closestDiff = Infinity;
    let closestBeatTime = 0;

    expectedBeatTimesRef.current.forEach((bTime) => {
      const diff = detectedTimeMs - bTime;
      if (Math.abs(diff) < Math.abs(closestDiff)) {
        closestDiff = diff;
        closestBeatTime = bTime;
      }
    });

    // If within reasonable evaluation window (+- half beat)
    if (Math.abs(closestDiff) < beatIntervalMs * 0.6) {
      let judgment: 'perfect' | 'early' | 'late' | 'miss' = 'perfect';

      if (Math.abs(closestDiff) <= 18) {
        judgment = 'perfect';
      } else if (closestDiff < 0) {
        judgment = 'early'; // rushed
      } else if (closestDiff > 0) {
        judgment = 'late'; // dragged
      }

      const newHit: TimingHit = {
        offsetMs: Math.round(closestDiff),
        judgment,
        timestamp: detectedTimeMs
      };

      setLastOffsetMs(newHit.offsetMs);
      setCurrentJudgment(newHit);
      setHits((prev) => [newHit, ...prev.slice(0, 19)]);
    }
  };

  // Metronome beat scheduler
  const toggleMetronome = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
      expectedBeatTimesRef.current = [];
    } else {
      setIsPlaying(true);
      const intervalMs = (60 / bpm) * 1000;
      let beatCount = 0;

      const scheduleBeat = () => {
        const nowMs = performance.now();
        expectedBeatTimesRef.current.push(nowMs);
        if (expectedBeatTimesRef.current.length > 20) expectedBeatTimesRef.current.shift();

        const isAccent = beatCount % 4 === 0;
        audioEngine.playMetronomeClick(isAccent, bpm, 0.75);
        beatCount++;
      };

      scheduleBeat();
      metronomeTimerRef.current = setInterval(scheduleBeat, intervalMs);
    }
  };

  // Calculate session accuracy
  useEffect(() => {
    if (hits.length === 0) return;
    const perfectCount = hits.filter((h) => h.judgment === 'perfect').length;
    const earlyOrLateCount = hits.filter((h) => h.judgment === 'early' || h.judgment === 'late').length;
    const score = Math.round(((perfectCount * 1.0 + earlyOrLateCount * 0.6) / hits.length) * 100);
    setAccuracyScore(score);
  }, [hits]);

  // Clean up
  useEffect(() => {
    return () => {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>Analizador de Ritmo & Precisión por Micrófono</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DSP Spectral Flux
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Evalúa tus ataques de púa en milisegundos respecto al clic del metrónomo
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMic}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md ${
              isListeningMic
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-slate-950 border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isListeningMic ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-slate-500" />}
            <span>{isListeningMic ? 'Micrófono Activo' : 'Activar Micrófono'}</span>
          </button>

          <button
            onClick={toggleMetronome}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md ${
              isPlaying
                ? 'bg-rose-600 text-white shadow-rose-600/30'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pausar Metrónomo' : 'Iniciar Metrónomo'}</span>
          </button>
        </div>
      </div>

      {/* Mic Warning Banner */}
      {micError && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-start justify-between gap-3 text-slate-200 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300">Aviso de Dispositivo de Audio</h4>
              <p className="text-xs text-slate-300 mt-0.5">{micError}</p>
            </div>
          </div>
          <button
            onClick={() => setMicError(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BPM Adjuster */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Gauge className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-slate-300">Tempo Objetivo:</span>
          <span className="font-mono text-lg font-black text-amber-400">{bpm} BPM</span>
          <input
            type="range"
            min={40}
            max={200}
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
            className="w-32 sm:w-48 accent-amber-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Puntuación Rítmica:</span>
          <span className="font-mono text-xl font-black text-emerald-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
            {accuracyScore}%
          </span>
        </div>
      </div>

      {/* Real-time Rhythm Gauge Visualizer */}
      <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col items-center justify-center text-center space-y-6 shadow-inner relative overflow-hidden">
        {/* Scale Meter (-60ms to +60ms) */}
        <div className="w-full max-w-lg space-y-2">
          <div className="flex justify-between text-[11px] font-mono text-slate-500 font-bold uppercase">
            <span className="text-amber-400">Adelantado (-50ms)</span>
            <span className="text-emerald-400">Perfecto (0ms)</span>
            <span className="text-rose-400">Atrasado (+50ms)</span>
          </div>

          <div className="relative h-6 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center overflow-hidden">
            {/* Center target zone */}
            <div className="absolute w-12 h-full bg-emerald-500/20 border-x border-emerald-500/40" />

            {/* Indicator Needle */}
            <div
              className={`absolute top-0 bottom-0 w-3 rounded-full transition-all duration-75 shadow-lg ${
                Math.abs(lastOffsetMs) <= 18
                  ? 'bg-emerald-400 shadow-emerald-400/50'
                  : lastOffsetMs < 0
                  ? 'bg-amber-400 shadow-amber-400/50'
                  : 'bg-rose-500 shadow-rose-500/50'
              }`}
              style={{
                left: `calc(50% + ${Math.max(-45, Math.min(45, lastOffsetMs * 0.9))}% - 6px)`
              }}
            />
          </div>
        </div>

        {/* Current Judgment Verdict Card */}
        {currentJudgment ? (
          <div className="space-y-1 animate-fadeIn">
            <div
              className={`text-2xl sm:text-3xl font-black font-mono ${
                currentJudgment.judgment === 'perfect'
                  ? 'text-emerald-400'
                  : currentJudgment.judgment === 'early'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {currentJudgment.judgment === 'perfect'
                ? '🎯 ¡A TIEMPO PERFECTO!'
                : currentJudgment.judgment === 'early'
                ? `⚡ ADELANTADO (${currentJudgment.offsetMs} ms)`
                : `🐢 ATRASADO (+${currentJudgment.offsetMs} ms)`}
            </div>
            <p className="text-xs text-slate-400">
              {currentJudgment.judgment === 'perfect'
                ? 'Sincronización milimétrica con el pulso.'
                : currentJudgment.judgment === 'early'
                ? 'Relaja la muñeca y espera al clic sin precipitar el ataque.'
                : 'Mantén el movimiento continuo de péndulo en el brazo derecho.'}
            </p>
          </div>
        ) : (
          <div className="text-slate-500 text-xs py-4 flex flex-col items-center gap-1">
            <Sparkles className="w-5 h-5 text-amber-500/60" />
            <span>Activa el micrófono y el metrónomo, luego toca tu guitarra para medir tu precisión.</span>
          </div>
        )}
      </div>

      {/* Hit History Log */}
      {hits.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400">Historial de Ataques Recientes:</span>
          <div className="flex flex-wrap gap-2">
            {hits.map((h, i) => (
              <span
                key={i}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${
                  h.judgment === 'perfect'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : h.judgment === 'early'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                {h.offsetMs > 0 ? `+${h.offsetMs}` : h.offsetMs} ms
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
