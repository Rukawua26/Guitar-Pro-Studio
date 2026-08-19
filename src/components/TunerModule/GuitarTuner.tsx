import React, { useState, useEffect, useRef, useCallback } from 'react';
import { STANDARD_TUNING_NOTES, TUNING_PRESETS } from '../../data/courseData';
import { yinDetector, getPitchInfo, PitchDetectionResult } from '../../utils/audioTuner';
import { audioEngine } from '../../utils/audioSynthesizer';
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  Sliders,
  Music,
  Radio,
  VolumeX,
  Sparkles,
  Zap,
  Activity,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  HelpCircle,
  Play,
  Pause,
  Info,
  ShieldAlert,
  Compass
} from 'lucide-react';

export const GuitarTuner: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [pitchData, setPitchData] = useState<PitchDetectionResult | null>(null);
  const [currentRms, setCurrentRms] = useState<number>(0);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('standard');
  const [a4Freq, setA4Freq] = useState<number>(440);
  const [noiseGate, setNoiseGate] = useState<number>(0.008);
  const [activeRefNote, setActiveRefNote] = useState<string | null>(null);
  const [micError, setMicError] = useState<{ type: string; title: string; message: string; hint: string } | null>(null);
  const [autoTargetString, setAutoTargetString] = useState<number | null>(null);
  const [chimePlayedForNote, setChimePlayedForNote] = useState<string | null>(null);
  const [isToneDronePlaying, setIsToneDronePlaying] = useState<boolean>(false);
  const [droneStringIdx, setDroneStringIdx] = useState<number>(0);
  const [isSimulatingDSP, setIsSimulatingDSP] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const needleRef = useRef<SVGGElement | null>(null);
  const droneIntervalRef = useRef<number | null>(null);

  const currentPreset = TUNING_PRESETS.find((p) => p.id === selectedPresetId) || TUNING_PRESETS[0];

  const stopAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    if (droneIntervalRef.current) {
      clearInterval(droneIntervalRef.current);
      droneIntervalRef.current = null;
    }
    setIsToneDronePlaying(false);
    setIsSimulatingDSP(false);
    yinDetector.resetSmoothing();
    setIsListening(false);
    setPitchData(null);
    setCurrentRms(0);
  }, []);

  const startAudio = async () => {
    setMicError(null);
    setIsSimulatingDSP(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError({
        type: 'Unsupported',
        title: 'Navegador no compatible con captura de audio',
        message: 'Tu navegador actual no tiene activada la API MediaDevices.',
        hint: 'Usa una versión moderna de Google Chrome, Firefox, Edge o Safari, o usa el modo "Afinar de Oído / Generador de Tono" a la derecha.'
      });
      return;
    }

    try {
      let stream: MediaStream | null = null;
      try {
        // First try optimal raw studio constraints
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false
          }
        });
      } catch (firstErr) {
        console.warn('Advanced constraints rejected, attempting basic fallback audio...', firstErr);
        // Fallback to basic audio constraint
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      if (!stream) {
        throw new Error('No se pudo inicializar el flujo de audio.');
      }

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
      runPitchDetection();
    } catch (err: unknown) {
      console.error('Microphone capture error:', err);
      const errorObj = err as { name?: string; message?: string };
      const errName = errorObj.name || '';

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setMicError({
          type: 'NotAllowed',
          title: 'Permiso de micrófono bloqueado en el navegador',
          message: 'El navegador ha bloqueado el acceso al micrófono para esta página.',
          hint: 'Haz clic en el icono de candado 🔒 o configuración en la barra de direcciones superior del navegador y cambia "Micrófono" a "Permitir", luego pulsa "Reintentar Conexión".'
        });
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setMicError({
          type: 'NotFound',
          title: 'No se detectó ningún micrófono conectado',
          message: 'No se encontró ningún hardware de entrada de audio disponible en el sistema.',
          hint: 'Conecta tus auriculares, interfaz de audio USB o micrófono interno, o utiliza el modo de "Afinar de Oído con Tonos de Referencia".'
        });
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setMicError({
          type: 'NotReadable',
          title: 'El micrófono está ocupado por otra aplicación',
          message: 'Otra pestaña o aplicación (Zoom, Discord, DAW) está usando el micrófono de forma exclusiva.',
          hint: 'Cierra las otras aplicaciones que usen audio y pulsa "Reintentar Conexión".'
        });
      } else {
        setMicError({
          type: 'Generic',
          title: 'Acceso al micrófono restringido',
          message: errorObj.message || 'No se pudo abrir el canal de audio del sistema.',
          hint: 'Verifica los permisos del navegador o afina con los tonos enriquecidos del panel derecho.'
        });
      }

      setIsListening(false);
    }
  };

  // Simulated Test Pluck to let the user test the DSP needle anytime even without hardware
  const simulatePluckTest = (freq: number, centsOffset: number = 0) => {
    setIsSimulatingDSP(true);
    setMicError(null);

    const testFreq = freq * Math.pow(2, centsOffset / 1200);
    audioEngine.playGuitarPluck(testFreq, 2.5, 0.9);

    const info = getPitchInfo(testFreq, a4Freq);
    if (info) {
      setPitchData({
        ...info,
        cents: Math.round(centsOffset)
      });

      const clampedCents = Math.max(-50, Math.min(50, centsOffset));
      const angle = (clampedCents / 50) * 45;
      if (needleRef.current) {
        needleRef.current.style.transform = `rotate3d(0, 0, 1, ${angle}deg)`;
      }

      let closestIndex = 0;
      let minDiff = Infinity;
      currentPreset.notes.forEach((str, idx) => {
        const diff = Math.abs(str.freq - testFreq);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = idx;
        }
      });
      setAutoTargetString(closestIndex);

      if (Math.abs(centsOffset) <= 5) {
        audioEngine.playInTuneAffirmation();
      }
    }
  };

  const runPitchDetection = () => {
    if (!analyserRef.current || !audioCtxRef.current) return;

    const analyser = analyserRef.current;
    const timeBuffer = new Float32Array(analyser.fftSize);
    const freqBuffer = new Uint8Array(analyser.frequencyBinCount);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    const updateLoop = () => {
      analyser.getFloatTimeDomainData(timeBuffer);
      analyser.getByteFrequencyData(freqBuffer);

      // 1. Calculate RMS energy
      let sum = 0;
      for (let i = 0; i < timeBuffer.length; i++) {
        sum += timeBuffer[i] * timeBuffer[i];
      }
      const rms = Math.sqrt(sum / timeBuffer.length);
      setCurrentRms(rms);

      // 2. Render live futuristic oscilloscope + FFT glow on canvas
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw glowing frequency bars in background
        const barWidth = canvas.width / 64;
        for (let i = 0; i < 64; i++) {
          const val = freqBuffer[i * 2] / 255;
          const barHeight = val * canvas.height * 0.7;
          ctx.fillStyle =
            rms >= noiseGate
              ? `rgba(16, 185, 129, ${0.15 + val * 0.3})`
              : 'rgba(51, 65, 85, 0.15)';
          ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
        }

        // Draw foreground waveform line
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = rms >= noiseGate ? '#34d399' : '#475569';
        ctx.shadowColor = rms >= noiseGate ? '#10b981' : 'transparent';
        ctx.shadowBlur = 6;
        ctx.beginPath();

        const sliceWidth = canvas.width / timeBuffer.length;
        let x = 0;
        for (let i = 0; i < timeBuffer.length; i++) {
          const v = timeBuffer[i] * 2.2;
          const y = canvas.height / 2 + v * (canvas.height / 2);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 3. YIN Pitch Detection Algorithm
      const result = yinDetector.detectPitch(
        timeBuffer,
        audioCtxRef.current!.sampleRate,
        noiseGate
      );

      if (result && result.frequency > 0) {
        const info = getPitchInfo(result.frequency, a4Freq);
        if (info) {
          setPitchData(info);

          // Rotate needle directly with GPU-accelerated transform
          const clampedCents = Math.max(-50, Math.min(50, info.cents));
          const angle = (clampedCents / 50) * 45;
          if (needleRef.current) {
            needleRef.current.style.transform = `rotate3d(0, 0, 1, ${angle}deg)`;
          }

          // Match closest preset string
          let closestIndex = 0;
          let minDiff = Infinity;
          currentPreset.notes.forEach((str, idx) => {
            const diff = Math.abs(str.freq - info.frequency);
            if (diff < minDiff) {
              minDiff = diff;
              closestIndex = idx;
            }
          });
          setAutoTargetString(closestIndex);

          // Play subtle sparkle chime if newly in-tune
          if (info.inTune && chimePlayedForNote !== info.note + info.octave) {
            setChimePlayedForNote(info.note + info.octave);
            audioEngine.playInTuneAffirmation();
          }
        }
      } else {
        // Signal decayed or below noise gate
        if (needleRef.current && rms < noiseGate * 0.7) {
          needleRef.current.style.transform = 'rotate3d(0, 0, 1, 0deg)';
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    updateLoop();
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const handlePlayRefNote = (freq: number, noteName: string) => {
    setActiveRefNote(noteName);
    audioEngine.playGuitarPluck(freq, 3.2, 0.9);
    setTimeout(() => {
      setActiveRefNote(null);
    }, 3200);
  };

  // Toggle continuous drone playback for hands-free ear tuning
  const toggleHandsFreeDrone = () => {
    if (isToneDronePlaying) {
      if (droneIntervalRef.current) clearInterval(droneIntervalRef.current);
      droneIntervalRef.current = null;
      setIsToneDronePlaying(false);
    } else {
      setIsToneDronePlaying(true);
      const str = currentPreset.notes[droneStringIdx];
      audioEngine.playGuitarPluck(str.freq, 2.5, 0.85);

      droneIntervalRef.current = window.setInterval(() => {
        setDroneStringIdx((prev) => {
          const next = (prev + 1) % currentPreset.notes.length;
          const nextStr = currentPreset.notes[next];
          audioEngine.playGuitarPluck(nextStr.freq, 2.5, 0.85);
          return next;
        });
      }, 3500);
    }
  };

  const cents = pitchData ? pitchData.cents : 0;
  const isInTune = pitchData ? Math.abs(pitchData.cents) <= 5 : false;
  const isNear = pitchData ? Math.abs(pitchData.cents) <= 15 && !isInTune : false;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Preset Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shadow-inner">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              <span>Afinador Digital DSP de Precisión YIN</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ±5 Cents Pro
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Detección de Tono por Algoritmo YIN con Supresión de Ruido y Modo de Referencia Acústica.
            </p>
          </div>
        </div>

        {/* Master Preset Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Preset Selector */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2 text-xs text-slate-300">
            <Music className="w-4 h-4 text-amber-400" />
            <select
              value={selectedPresetId}
              onChange={(e) => {
                setSelectedPresetId(e.target.value);
                setAutoTargetString(null);
              }}
              className="bg-transparent text-slate-200 font-semibold outline-none cursor-pointer"
            >
              {TUNING_PRESETS.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start/Stop Button */}
          <button
            onClick={isListening ? stopAudio : startAudio}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xl cursor-pointer ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-500/50 animate-pulse'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30 ring-2 ring-emerald-400/40'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" /> Detener Micrófono
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" /> Iniciar Afinación
              </>
            )}
          </button>
        </div>
      </div>

      {/* Helpful Permission / Hardware Diagnostic Box if Error */}
      {micError && (
        <div className="p-5 bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 border border-rose-800/80 rounded-3xl text-slate-200 shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  {micError.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1">{micError.message}</p>
                <p className="text-xs text-amber-300/90 mt-1 font-medium bg-amber-950/40 border border-amber-800/40 rounded-xl p-2.5">
                  💡 <strong>Solución rápida:</strong> {micError.hint}
                </p>
              </div>
            </div>

            <button
              onClick={() => setMicError(null)}
              className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer p-1"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800/80">
            <button
              onClick={startAudio}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reintentar Conexión de Micrófono
            </button>

            <button
              onClick={() => simulatePluckTest(currentPreset.notes[0].freq, 0)}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Probar Aguja DSP con Tono Sintético
            </button>

            <button
              onClick={toggleHandsFreeDrone}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Afinar de Oído (Tonos Continuos)
            </button>
          </div>
        </div>
      )}

      {/* Main Tuner Display & Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Analog Arc Meter & Note Centerpiece (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-between relative overflow-hidden">
          {/* Header Status Line */}
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">
              {currentPreset.name}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isListening || isSimulatingDSP
                    ? (currentRms >= noiseGate || isSimulatingDSP)
                      ? 'bg-emerald-400 shadow-md shadow-emerald-400 animate-ping'
                      : 'bg-amber-400'
                    : 'bg-slate-600'
                }`}
              />
              <span className="text-xs text-slate-400 font-mono font-semibold">
                {isListening
                  ? currentRms >= noiseGate
                    ? 'PULSACIÓN DETECTADA (YIN)'
                    : 'ESPERANDO CUERDA...'
                  : isSimulatingDSP
                  ? 'MODO SIMULADOR DSP ACTIVO'
                  : 'DSP INACTIVO'}
              </span>
            </div>
          </div>

          {/* Central Chromatic Badge with Dynamic Halo */}
          <div className="flex flex-col items-center justify-center my-4 relative">
            {/* Outer Animated Glow Halo */}
            <div
              className={`absolute -inset-4 rounded-full transition-all duration-300 blur-xl opacity-40 pointer-events-none ${
                !pitchData
                  ? 'bg-transparent'
                  : isInTune
                  ? 'bg-emerald-500 animate-pulse opacity-80'
                  : isNear
                  ? 'bg-amber-500 opacity-50'
                  : 'bg-rose-500 opacity-40'
              }`}
            />

            {/* Inner Circular Card */}
            <div
              className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-200 shadow-2xl relative z-10 ${
                !pitchData
                  ? 'border-slate-800 bg-slate-950 text-slate-600'
                  : isInTune
                  ? 'border-emerald-400 bg-gradient-to-b from-emerald-950/80 to-slate-950 text-emerald-300 shadow-emerald-500/40 scale-105 ring-4 ring-emerald-500/20'
                  : isNear
                  ? 'border-amber-400 bg-gradient-to-b from-amber-950/60 to-slate-950 text-amber-300 shadow-amber-500/30'
                  : 'border-rose-500 bg-gradient-to-b from-rose-950/60 to-slate-950 text-rose-400 shadow-rose-500/30'
              }`}
            >
              <span className="text-6xl font-black tracking-tighter leading-none">
                {pitchData ? pitchData.note : '--'}
              </span>
              <span className="text-xs font-bold font-mono mt-1 opacity-80">
                {pitchData ? `Octava ${pitchData.octave}` : 'Toca una cuerda'}
              </span>
            </div>

            {/* Dynamic Tuning Direction Badge */}
            {pitchData && (
              <div
                className={`absolute -bottom-5 z-20 font-black text-xs uppercase px-4 py-1 rounded-full flex items-center gap-1.5 shadow-xl transition-all ${
                  isInTune
                    ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-300 shadow-emerald-400/30 animate-bounce'
                    : cents < -5
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 shadow-amber-500/20'
                    : 'bg-rose-500 text-white ring-2 ring-rose-400 shadow-rose-500/20'
                }`}
              >
                {isInTune ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡AFINACIÓN PERFECTA!</span>
                  </>
                ) : cents < -5 ? (
                  <>
                    <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
                    <span>TENSAR CUERDA (BEMOL ♭)</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
                    <span>AFLOJAR CUERDA (SOSTENIDO ♯)</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Analog Meter Arc & GPU-Accelerated Needle */}
          <div className="w-full max-w-lg my-5 flex flex-col items-center">
            <div className="relative w-full h-32 flex items-end justify-center overflow-hidden">
              <svg viewBox="0 0 200 100" className="w-full h-full">
                {/* Background Arc */}
                <path
                  d="M 20 90 A 80 80 0 0 1 180 90"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="10"
                  strokeLinecap="round"
                />

                {/* Safe In-Tune Zone (±5 cents center) */}
                <path
                  d="M 92 10 A 80 80 0 0 1 108 10"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="14"
                  strokeLinecap="round"
                />

                {/* Left/Right Warning Zones */}
                <path
                  d="M 72 20 A 80 80 0 0 1 90 11"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="10"
                />
                <path
                  d="M 110 11 A 80 80 0 0 1 128 20"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="10"
                />

                {/* Calibration Ticks */}
                {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((val) => {
                  const rad = ((val + 90) * Math.PI) / 180;
                  const x1 = 100 - 70 * Math.cos(rad);
                  const y1 = 90 - 70 * Math.sin(rad);
                  const x2 = 100 - 80 * Math.cos(rad);
                  const y2 = 90 - 80 * Math.sin(rad);
                  return (
                    <line
                      key={val}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={val === 0 ? '#10b981' : '#475569'}
                      strokeWidth={val === 0 ? 3 : 1.5}
                    />
                  );
                })}

                {/* GPU-Accelerated Needle Group */}
                <g
                  ref={needleRef}
                  style={{
                    transformOrigin: '100px 90px',
                    transition: 'transform 0.08s cubic-bezier(0.2, 0.8, 0.4, 1)'
                  }}
                >
                  <line
                    x1="100"
                    y1="90"
                    x2="100"
                    y2="16"
                    stroke={
                      isInTune ? '#34d399' : isNear ? '#fbbf24' : '#f87171'
                    }
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="90" r="6.5" fill="#f8fafc" />
                </g>
              </svg>
            </div>

            {/* Microtonal Cents Readout */}
            <div className="flex items-center justify-between w-full px-4 sm:px-8 text-xs font-mono mt-2">
              <span className="text-rose-400 font-bold">-50 ♭</span>
              <span
                className={`text-lg font-black tracking-tight ${
                  isInTune
                    ? 'text-emerald-400'
                    : isNear
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {pitchData
                  ? `${pitchData.cents > 0 ? '+' : ''}${pitchData.cents} cents`
                  : '0 cents'}
              </span>
              <span className="text-rose-400 font-bold">+50 ♯</span>
            </div>
          </div>

          {/* Hz Frequency Realtime Analytics */}
          <div className="grid grid-cols-2 gap-4 w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center">
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold block">
                Frecuencia Fundamental (YIN)
              </span>
              <span className="text-xl font-mono font-black text-slate-100">
                {pitchData ? `${pitchData.frequency} Hz` : '-- Hz'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold block">
                Frecuencia de Referencia
              </span>
              <span className="text-xl font-mono font-black text-amber-400">
                {pitchData ? `${pitchData.targetFrequency} Hz` : '-- Hz'}
              </span>
            </div>
          </div>

          {/* Live Waveform & Spectrum Visualizer */}
          <div className="w-full mt-4">
            <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block mb-1.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Espectrograma & Forma de Onda en Tiempo Real
            </span>
            <div className="h-14 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
              <canvas ref={canvasRef} width={640} height={56} className="w-full h-full block" />
            </div>
          </div>
        </div>

        {/* Right Column: Reference Tuning Pegs & RMS Gate (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="font-extrabold text-slate-200 text-sm flex items-center gap-2">
                <Music className="w-4 h-4 text-amber-400" />
                <span>Cuerdas del Preset</span>
              </h3>
              <button
                onClick={toggleHandsFreeDrone}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                  isToneDronePlaying
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {isToneDronePlaying ? (
                  <>
                    <Pause className="w-3 h-3" /> Detener Ciclo
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" /> Secuencia Manos Libres
                  </>
                )}
              </button>
            </div>

            {/* Individual Reference Strings */}
            <div className="space-y-2.5">
              {currentPreset.notes.map((str, index) => {
                const isAutoTarget = autoTargetString === index && (isListening || isSimulatingDSP);
                const isPlaying = activeRefNote === str.stringName || (isToneDronePlaying && droneStringIdx === index);

                return (
                  <div
                    key={index}
                    onClick={() => {
                      handlePlayRefNote(str.freq, str.stringName);
                      simulatePluckTest(str.freq, 0);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                      isPlaying
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20'
                        : isAutoTarget
                        ? 'bg-slate-850 border-emerald-500 shadow-md ring-2 ring-emerald-500/40'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                          isAutoTarget
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                            : 'bg-slate-900 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950'
                        }`}
                      >
                        {str.note}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-100">
                          {str.stringName}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {str.freq.toFixed(2)} Hz
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          simulatePluckTest(str.freq, -18);
                        }}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-amber-400 rounded-lg font-mono"
                        title="Simular Cuerda Bemol (-18 cents)"
                      >
                        ♭ Test
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayRefNote(str.freq, str.stringName);
                          simulatePluckTest(str.freq, 0);
                        }}
                        className="p-2 text-slate-400 group-hover:text-amber-400 bg-slate-900 rounded-xl transition-colors cursor-pointer"
                        title="Escuchar tono sintetizado"
                      >
                        <Volume2
                          className={`w-4 h-4 ${
                            isPlaying ? 'text-amber-400 animate-pulse' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Noise Gate & Signal Settings */}
          <div className="pt-4 border-t border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" /> Puerta de Ruido (RMS Gate)
              </span>
              <span className="font-mono text-amber-400">
                {(noiseGate * 1000).toFixed(0)} mV
              </span>
            </div>
            <input
              type="range"
              min="0.002"
              max="0.035"
              step="0.002"
              value={noiseGate}
              onChange={(e) => setNoiseGate(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Filtra el ruido ambiente para capturar con mayor precisión el ataque de tu guitarra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
