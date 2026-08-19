import React, { useState, useEffect, useRef, useCallback } from 'react';
import { STANDARD_TUNING_NOTES, TUNING_PRESETS } from '../../data/courseData';
import { autoCorrelate, getPitchInfo, PitchDetectionResult } from '../../utils/audioTuner';
import { audioEngine } from '../../utils/audioSynthesizer';
import { Mic, MicOff, Volume2, CheckCircle2, Sliders, Music, Radio, VolumeX } from 'lucide-react';

export const GuitarTuner: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [pitchData, setPitchData] = useState<PitchDetectionResult | null>(null);
  const [currentRms, setCurrentRms] = useState<number>(0);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('standard');
  const [a4Freq, setA4Freq] = useState<number>(440);
  const [noiseGate, setNoiseGate] = useState<number>(0.01);
  const [activeRefNote, setActiveRefNote] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [autoTargetString, setAutoTargetString] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentPreset = TUNING_PRESETS.find(p => p.id === selectedPresetId) || TUNING_PRESETS[0];

  const stopAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
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

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListening(true);
      runPitchDetection();
    } catch (err: unknown) {
      console.error("Microphone access error:", err);
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
    const buffer = new Float32Array(analyser.fftSize);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    const updateLoop = () => {
      analyser.getFloatTimeDomainData(buffer);

      // 1. Calculate RMS energy
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) {
        sum += buffer[i] * buffer[i];
      }
      const rms = Math.sqrt(sum / buffer.length);
      setCurrentRms(rms);

      // 2. Render live oscilloscope waveform on canvas
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = rms >= noiseGate ? '#10b981' : '#475569';
        ctx.beginPath();

        const sliceWidth = canvas.width / buffer.length;
        let x = 0;
        for (let i = 0; i < buffer.length; i++) {
          const v = buffer[i] * 2;
          const y = (canvas.height / 2) + v * (canvas.height / 2);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
      }

      // 3. Autocorrelation Pitch Detection
      const fundamentalFreq = autoCorrelate(buffer, audioCtxRef.current!.sampleRate, noiseGate);

      if (fundamentalFreq !== -1) {
        const info = getPitchInfo(fundamentalFreq, a4Freq);
        if (info) {
          setPitchData(info);

          // Find closest preset string
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
    audioEngine.playGuitarPluck(freq, 3.5, 0.9);
    setTimeout(() => {
      setActiveRefNote(null);
    }, 3500);
  };

  // Cent visual helpers
  const cents = pitchData ? pitchData.cents : 0;
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const needleAngle = (clampedCents / 50) * 45; // -45deg to +45deg
  const isInTune = pitchData ? Math.abs(pitchData.cents) <= 4 : false;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Preset Selector Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shadow-inner">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              Afinador Digital de Alta Precisión
            </h2>
            <p className="text-xs text-slate-400">
              Web Audio DSP • Algoritmo de Autocorrelación y Filtro RMS en tiempo real
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span className="text-slate-400">A4:</span>
            <select
              value={a4Freq}
              onChange={(e) => setA4Freq(Number(e.target.value))}
              className="bg-transparent text-amber-400 font-bold outline-none cursor-pointer"
            >
              <option value={432} className="bg-slate-900">432 Hz (Verdi)</option>
              <option value={440} className="bg-slate-900">440 Hz (Estándar)</option>
              <option value={442} className="bg-slate-900">442 Hz (Orquestal)</option>
              <option value={444} className="bg-slate-900">444 Hz</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="bg-transparent text-slate-200 font-medium outline-none cursor-pointer"
            >
              {TUNING_PRESETS.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start / Stop Mic Button */}
          <button
            onClick={isListening ? stopAudio : startAudio}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" /> Detener Micrófono
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" /> Activar Micrófono
              </>
            )}
          </button>
        </div>
      </div>

      {micError && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-sm flex items-center gap-3">
          <VolumeX className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{micError}</span>
        </div>
      )}

      {/* Main Tuner Display & Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Center: The Gauge & Pitch Meter */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-between relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              {currentPreset.name}
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isListening ? (currentRms >= noiseGate ? 'bg-emerald-500 animate-ping' : 'bg-amber-500') : 'bg-slate-600'}`} />
              <span className="text-xs text-slate-400 font-mono">
                {isListening ? (currentRms >= noiseGate ? 'SEÑAL ACTIVA' : 'ESPERANDO NOTA...') : 'MICRÓFONO INACTIVO'}
              </span>
            </div>
          </div>

          {/* Big Note Badge & Cent Offset */}
          <div className="flex flex-col items-center justify-center my-4 relative">
            <div
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-300 shadow-2xl ${
                !isListening
                  ? 'border-slate-800 bg-slate-950/50 text-slate-600'
                  : isInTune
                  ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400 shadow-emerald-500/20 scale-105'
                  : Math.abs(cents) <= 15
                  ? 'border-amber-500 bg-amber-950/30 text-amber-400 shadow-amber-500/20'
                  : 'border-rose-500 bg-rose-950/30 text-rose-400 shadow-rose-500/20'
              }`}
            >
              <span className="text-5xl font-black tracking-tighter">
                {pitchData ? pitchData.note : '--'}
              </span>
              <span className="text-sm font-semibold opacity-75 font-mono">
                {pitchData ? `Octava ${pitchData.octave}` : 'Toca una cuerda'}
              </span>
            </div>

            {/* In-Tune Banner */}
            {isInTune && isListening && (
              <div className="absolute -bottom-4 bg-emerald-500 text-slate-950 font-black text-xs uppercase px-4 py-1 rounded-full flex items-center gap-1.5 shadow-lg animate-bounce">
                <CheckCircle2 className="w-3.5 h-3.5" /> ¡AFINADO PERFECTO!
              </div>
            )}
          </div>

          {/* Analog Meter Arc & Needle */}
          <div className="w-full max-w-md my-4 flex flex-col items-center">
            <div className="relative w-full h-28 flex items-end justify-center overflow-hidden">
              {/* Dial Arc Scale */}
              <svg viewBox="0 0 200 100" className="w-full h-full">
                {/* Arc track */}
                <path
                  d="M 20 90 A 80 80 0 0 1 180 90"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Safe zone green center */}
                <path
                  d="M 92 10 A 80 80 0 0 1 108 10"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                />
                {/* Tick marks */}
                {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map(val => {
                  const rad = ((val + 90) * Math.PI) / 180;
                  const x1 = 100 - 72 * Math.cos(rad);
                  const y1 = 90 - 72 * Math.sin(rad);
                  const x2 = 100 - 80 * Math.cos(rad);
                  const y2 = 90 - 80 * Math.sin(rad);
                  return (
                    <line
                      key={val}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={val === 0 ? '#10b981' : '#64748b'}
                      strokeWidth={val === 0 ? 2.5 : 1.5}
                    />
                  );
                })}
                {/* Needle */}
                <g
                  style={{
                    transformOrigin: '100px 90px',
                    transform: `rotate(${isListening ? needleAngle : 0}deg)`,
                    transition: 'transform 0.12s ease-out'
                  }}
                >
                  <line
                    x1="100"
                    y1="90"
                    x2="100"
                    y2="18"
                    stroke={isInTune ? '#10b981' : Math.abs(cents) <= 15 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="90" r="6" fill="#f8fafc" />
                </g>
              </svg>
            </div>

            {/* Cents numerical offset */}
            <div className="flex items-center justify-between w-full px-6 text-xs font-mono mt-1">
              <span className="text-rose-400 font-bold">-50 Cents (Bemol ♭)</span>
              <span className={`text-base font-extrabold ${isInTune ? 'text-emerald-400' : 'text-slate-200'}`}>
                {pitchData ? `${pitchData.cents > 0 ? '+' : ''}${pitchData.cents} cents` : '0 cents'}
              </span>
              <span className="text-rose-400 font-bold">+50 Cents (Sostenido ♯)</span>
            </div>
          </div>

          {/* Frequencies breakdown */}
          <div className="grid grid-cols-2 gap-4 w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-center">
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                Frecuencia Detectada
              </span>
              <span className="text-lg font-mono font-bold text-slate-100">
                {pitchData ? `${pitchData.frequency} Hz` : '-- Hz'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                Frecuencia Objetivo
              </span>
              <span className="text-lg font-mono font-bold text-amber-400">
                {pitchData ? `${pitchData.targetFrequency} Hz` : '-- Hz'}
              </span>
            </div>
          </div>

          {/* Live Waveform Canvas */}
          <div className="w-full mt-4">
            <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
              Osciloscopio de Entrada de Audio
            </span>
            <div className="h-12 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
              <canvas ref={canvasRef} width={600} height={48} className="w-full h-full block" />
            </div>
          </div>
        </div>

        {/* Right Column: Headstock / String Tuning Pegs */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-200 text-sm flex items-center justify-between mb-3">
              <span>Cuerdas de Referencia</span>
              <span className="text-xs text-slate-400 font-normal">Pulsa para oír tono</span>
            </h3>

            {/* String list with individual sound buttons */}
            <div className="space-y-2">
              {currentPreset.notes.map((str, index) => {
                const isAutoTarget = autoTargetString === index && isListening;
                const isPlaying = activeRefNote === str.stringName;

                return (
                  <div
                    key={index}
                    onClick={() => handlePlayRefNote(str.freq, str.stringName)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
                      isPlaying
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : isAutoTarget
                        ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          isAutoTarget ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950'
                        }`}
                      >
                        {str.note}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-200">
                          {str.stringName}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {str.freq.toFixed(2)} Hz
                        </div>
                      </div>
                    </div>

                    <button
                      className="p-2 text-slate-400 group-hover:text-amber-400 bg-slate-900 rounded-lg transition-colors"
                      title="Escuchar tono sintetizado"
                    >
                      <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-amber-400 animate-pulse' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Noise gate and Sensitivity adjustment */}
          <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" /> Puerta de Ruido (RMS Gate)
              </span>
              <span className="font-mono text-slate-300">{(noiseGate * 1000).toFixed(0)}</span>
            </div>
            <input
              type="range"
              min="0.002"
              max="0.04"
              step="0.002"
              value={noiseGate}
              onChange={(e) => setNoiseGate(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ajusta hacia la derecha si hay ruido ambiental en tu habitación para evitar lecturas falsas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
