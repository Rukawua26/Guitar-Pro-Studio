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
  ArrowDown
} from 'lucide-react';

export const GuitarTuner: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [pitchData, setPitchData] = useState<PitchDetectionResult | null>(null);
  const [currentRms, setCurrentRms] = useState<number>(0);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('standard');
  const [a4Freq, setA4Freq] = useState<number>(440);
  const [noiseGate, setNoiseGate] = useState<number>(0.008);
  const [activeRefNote, setActiveRefNote] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [autoTargetString, setAutoTargetString] = useState<number | null>(null);
  const [chimePlayedForNote, setChimePlayedForNote] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const needleRef = useRef<SVGGElement | null>(null);

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
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    yinDetector.resetSmoothing();
    setIsListening(false);
    setPitchData(null);
    setCurrentRms(0);
  }, []);

  const startAudio = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false
        }
      });
      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListening(true);
      yinDetector.resetSmoothing();
      runPitchDetection();
    } catch (err: unknown) {
      console.error('Microphone access error:', err);
      setMicError(
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Permiso de micrófono denegado. Por favor permite el acceso en tu navegador para afinar.'
          : 'No se pudo acceder al micrófono del dispositivo. Verifica la conexión del hardware.'
      );
      setIsListening(false);
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
        const barWidth = (canvas.width / 64);
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
              Procesamiento de Señal Digital con Algoritmo YIN, Media Móvil Exponencial (EMA) y Supresión de Armónicos Graves.
            </p>
          </div>
        </div>

        {/* Master Preset Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* A4 Reference */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span className="text-slate-500 font-bold">A4:</span>
            <select
              value={a4Freq}
              onChange={(e) => setA4Freq(Number(e.target.value))}
              className="bg-transparent text-amber-400 font-bold outline-none cursor-pointer"
            >
              <option value={432} className="bg-slate-900">432 Hz (Verdi / Terrestre)</option>
              <option value={440} className="bg-slate-900">440 Hz (Estándar ISO)</option>
              <option value={442} className="bg-slate-900">442 Hz (Orquestal / Concierto)</option>
              <option value={444} className="bg-slate-900">444 Hz (Brillante)</option>
            </select>
          </div>

          {/* Preset Selector */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
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
            className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xl cursor-pointer ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse ring-2 ring-rose-500/50'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25 ring-2 ring-emerald-400/40'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" /> Detener Afinador
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" /> Iniciar Afinación
              </>
            )}
          </button>
        </div>
      </div>

      {micError && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-2xl text-rose-300 text-sm flex items-center gap-3 shadow-lg">
          <VolumeX className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{micError}</span>
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
                  isListening
                    ? currentRms >= noiseGate
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
                  : 'DSP INACTIVO'}
              </span>
            </div>
          </div>

          {/* Central Chromatic Badge with Dynamic Halo */}
          <div className="flex flex-col items-center justify-center my-4 relative">
            {/* Outer Animated Glow Halo */}
            <div
              className={`absolute -inset-4 rounded-full transition-all duration-300 blur-xl opacity-40 pointer-events-none ${
                !isListening
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
                !isListening
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
            {isListening && pitchData && (
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
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="font-extrabold text-slate-200 text-sm flex items-center gap-2">
                <Music className="w-4 h-4 text-amber-400" />
                <span>Cuerdas del Preset</span>
              </h3>
              <span className="text-[11px] text-slate-400">Toca para oír</span>
            </div>

            {/* Individual Reference Strings */}
            <div className="space-y-2.5">
              {currentPreset.notes.map((str, index) => {
                const isAutoTarget = autoTargetString === index && isListening;
                const isPlaying = activeRefNote === str.stringName;

                return (
                  <div
                    key={index}
                    onClick={() => handlePlayRefNote(str.freq, str.stringName)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                      isPlaying
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20'
                        : isAutoTarget
                        ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-2 ring-emerald-500/40'
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

                    <button
                      className="p-2 text-slate-400 group-hover:text-amber-400 bg-slate-900 rounded-xl transition-colors cursor-pointer"
                      title="Escuchar tono sintetizado enriquecido con armónicos"
                    >
                      <Volume2
                        className={`w-4 h-4 ${
                          isPlaying ? 'text-amber-400 animate-pulse' : ''
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Noise Gate & Signal Settings */}
          <div className="mt-6 pt-5 border-t border-slate-800/90 space-y-3">
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
              Filtra el ruido de ventiladores o ambiente acústico para capturar únicamente el ataque de tu guitarra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
