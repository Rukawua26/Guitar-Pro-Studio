import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../../utils/audioSynthesizer';
import {
  Disc,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  Sliders,
  Sparkles,
  Music,
  Plus,
  Trash2,
  Zap,
  Activity,
  Layers
} from 'lucide-react';

interface ChordStep {
  root: string; // e.g. 'A', 'C', 'E'
  quality: 'maj' | 'min' | '7' | 'm7' | 'maj7' | '9' | '5';
  frets: (number | 'x')[];
  bassFreq: number;
}

interface ProgressionPreset {
  id: string;
  name: string;
  genre: 'Blues' | 'Rock' | 'Pop' | 'Jazz' | 'Funk' | 'Flamenco';
  defaultBpm: number;
  timeSignature: '4/4';
  scaleSuggestion: string;
  chords: ChordStep[];
}

const CHORD_LIBRARY_MAP: Record<string, { frets: (number | 'x')[]; bassFreq: number }> = {
  'A_maj': { frets: ['x', 0, 2, 2, 2, 0], bassFreq: 110.0 },
  'A_min': { frets: ['x', 0, 2, 2, 1, 0], bassFreq: 110.0 },
  'A_7': { frets: ['x', 0, 2, 0, 2, 0], bassFreq: 110.0 },
  'A_m7': { frets: ['x', 0, 2, 0, 1, 0], bassFreq: 110.0 },
  'C_maj': { frets: ['x', 3, 2, 0, 1, 0], bassFreq: 130.81 },
  'C_maj7': { frets: ['x', 3, 2, 0, 0, 0], bassFreq: 130.81 },
  'D_maj': { frets: ['x', 'x', 0, 2, 3, 2], bassFreq: 146.83 },
  'D_min': { frets: ['x', 'x', 0, 2, 3, 1], bassFreq: 146.83 },
  'D_7': { frets: ['x', 'x', 0, 2, 1, 2], bassFreq: 146.83 },
  'D_m7': { frets: ['x', 'x', 0, 2, 1, 1], bassFreq: 146.83 },
  'E_maj': { frets: [0, 2, 2, 1, 0, 0], bassFreq: 82.41 },
  'E_min': { frets: [0, 2, 2, 0, 0, 0], bassFreq: 82.41 },
  'E_7': { frets: [0, 2, 0, 1, 0, 0], bassFreq: 82.41 },
  'E_9': { frets: [0, 2, 0, 1, 0, 2], bassFreq: 82.41 },
  'F_maj': { frets: [1, 3, 3, 2, 1, 1], bassFreq: 87.31 },
  'G_maj': { frets: [3, 2, 0, 0, 0, 3], bassFreq: 98.0 },
  'G_7': { frets: [3, 2, 0, 0, 0, 1], bassFreq: 98.0 },
  'B_min': { frets: ['x', 2, 4, 4, 3, 2], bassFreq: 123.47 },
  'B_7': { frets: ['x', 2, 1, 2, 0, 2], bassFreq: 123.47 }
};

const PRESETS: ProgressionPreset[] = [
  {
    id: 'blues_12_bar_a',
    name: '12-Bar Blues Clásico en La (A)',
    genre: 'Blues',
    defaultBpm: 95,
    timeSignature: '4/4',
    scaleSuggestion: 'Pentatónica Menor de A (Trastes 5-8) & Escala Blues con Blue Note (D#)',
    chords: [
      { root: 'A', quality: '7', frets: CHORD_LIBRARY_MAP['A_7'].frets, bassFreq: 110.0 },
      { root: 'A', quality: '7', frets: CHORD_LIBRARY_MAP['A_7'].frets, bassFreq: 110.0 },
      { root: 'A', quality: '7', frets: CHORD_LIBRARY_MAP['A_7'].frets, bassFreq: 110.0 },
      { root: 'A', quality: '7', frets: CHORD_LIBRARY_MAP['A_7'].frets, bassFreq: 110.0 },
      { root: 'D', quality: '7', frets: CHORD_LIBRARY_MAP['D_7'].frets, bassFreq: 146.83 },
      { root: 'D', quality: '7', frets: CHORD_LIBRARY_MAP['D_7'].frets, bassFreq: 146.83 },
      { root: 'A', quality: '7', frets: CHORD_LIBRARY_MAP['A_7'].frets, bassFreq: 110.0 },
      { root: 'A', quality: '7', frets: CHORD_LIBRARY_MAP['A_7'].frets, bassFreq: 110.0 },
      { root: 'E', quality: '7', frets: CHORD_LIBRARY_MAP['E_7'].frets, bassFreq: 82.41 },
      { root: 'D', quality: '7', frets: CHORD_LIBRARY_MAP['D_7'].frets, bassFreq: 146.83 },
      { root: 'A', quality: '7', frets: CHORD_LIBRARY_MAP['A_7'].frets, bassFreq: 110.0 },
      { root: 'E', quality: '7', frets: CHORD_LIBRARY_MAP['E_7'].frets, bassFreq: 82.41 }
    ]
  },
  {
    id: 'pop_rock_axis',
    name: 'Progresión Himno Pop/Rock (C - G - Am - F)',
    genre: 'Pop',
    defaultBpm: 105,
    timeSignature: '4/4',
    scaleSuggestion: 'Escala Mayor de C & Pentatónica Mayor de C / Pentatónica Menor de Am',
    chords: [
      { root: 'C', quality: 'maj', frets: CHORD_LIBRARY_MAP['C_maj'].frets, bassFreq: 130.81 },
      { root: 'G', quality: 'maj', frets: CHORD_LIBRARY_MAP['G_maj'].frets, bassFreq: 98.0 },
      { root: 'A', quality: 'min', frets: CHORD_LIBRARY_MAP['A_min'].frets, bassFreq: 110.0 },
      { root: 'F', quality: 'maj', frets: CHORD_LIBRARY_MAP['F_maj'].frets, bassFreq: 87.31 }
    ]
  },
  {
    id: 'rock_minor_em',
    name: 'Balada & Solo Rock en Mi Menor (Em - C - G - D)',
    genre: 'Rock',
    defaultBpm: 88,
    timeSignature: '4/4',
    scaleSuggestion: 'Pentatónica Menor de Em (Trastes 0-3 y 12-15) & Modo Eólico de Mi',
    chords: [
      { root: 'E', quality: 'min', frets: CHORD_LIBRARY_MAP['E_min'].frets, bassFreq: 82.41 },
      { root: 'C', quality: 'maj', frets: CHORD_LIBRARY_MAP['C_maj'].frets, bassFreq: 130.81 },
      { root: 'G', quality: 'maj', frets: CHORD_LIBRARY_MAP['G_maj'].frets, bassFreq: 98.0 },
      { root: 'D', quality: 'maj', frets: CHORD_LIBRARY_MAP['D_maj'].frets, bassFreq: 146.83 }
    ]
  },
  {
    id: 'jazz_ii_v_i',
    name: 'Jazz Cadencia II - V - I (Dm7 - G7 - Cmaj7)',
    genre: 'Jazz',
    defaultBpm: 110,
    timeSignature: '4/4',
    scaleSuggestion: 'Modo Dórico sobre Dm7, Mixolidio sobre G7, Jónico/Lidio sobre Cmaj7',
    chords: [
      { root: 'D', quality: 'm7', frets: CHORD_LIBRARY_MAP['D_m7'].frets, bassFreq: 146.83 },
      { root: 'G', quality: '7', frets: CHORD_LIBRARY_MAP['G_7'].frets, bassFreq: 98.0 },
      { root: 'C', quality: 'maj7', frets: CHORD_LIBRARY_MAP['C_maj7'].frets, bassFreq: 130.81 },
      { root: 'C', quality: 'maj7', frets: CHORD_LIBRARY_MAP['C_maj7'].frets, bassFreq: 130.81 }
    ]
  },
  {
    id: 'funk_groove_e9',
    name: 'Funk Groove Explosivo (E9 - A7)',
    genre: 'Funk',
    defaultBpm: 100,
    timeSignature: '4/4',
    scaleSuggestion: 'Modo Dórico de Mi & Pentatónica Menor con sexta mayor (C#)',
    chords: [
      { root: 'E', quality: '9', frets: CHORD_LIBRARY_MAP['E_9'].frets, bassFreq: 82.41 },
      { root: 'E', quality: '9', frets: CHORD_LIBRARY_MAP['E_9'].frets, bassFreq: 82.41 },
      { root: 'A', quality: '7', frets: CHORD_LIBRARY_MAP['A_7'].frets, bassFreq: 110.0 },
      { root: 'E', quality: '9', frets: CHORD_LIBRARY_MAP['E_9'].frets, bassFreq: 82.41 }
    ]
  },
  {
    id: 'flamenco_andalusian',
    name: 'Cadencia Andaluza Española (Am - G - F - E)',
    genre: 'Flamenco',
    defaultBpm: 92,
    timeSignature: '4/4',
    scaleSuggestion: 'Modo Frigio de Mi & Escala Menor Armónica de La',
    chords: [
      { root: 'A', quality: 'min', frets: CHORD_LIBRARY_MAP['A_min'].frets, bassFreq: 110.0 },
      { root: 'G', quality: 'maj', frets: CHORD_LIBRARY_MAP['G_maj'].frets, bassFreq: 98.0 },
      { root: 'F', quality: 'maj', frets: CHORD_LIBRARY_MAP['F_maj'].frets, bassFreq: 87.31 },
      { root: 'E', quality: 'maj', frets: CHORD_LIBRARY_MAP['E_maj'].frets, bassFreq: 82.41 }
    ]
  }
];

export const BackingTrackStudio: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<ProgressionPreset>(PRESETS[0]);
  const [bpm, setBpm] = useState<number>(selectedPreset.defaultBpm);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Playback cursor state
  const [currentBar, setCurrentBar] = useState<number>(0);
  const [currentBeat, setCurrentBeat] = useState<number>(0); // 0 to 3 (beat 1 to 4)

  // Mixer Channel Volumes & Mutes
  const [drumVol, setDrumVol] = useState<number>(0.85);
  const [bassVol, setBassVol] = useState<number>(0.8);
  const [guitarVol, setGuitarVol] = useState<number>(0.75);
  const [clickVol, setClickVol] = useState<number>(0.0); // off by default

  const [muteDrums, setMuteDrums] = useState<boolean>(false);
  const [muteBass, setMuteBass] = useState<boolean>(false);
  const [muteGuitar, setMuteGuitar] = useState<boolean>(false);
  const [muteClick, setMuteClick] = useState<boolean>(false);

  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef({ isPlaying: false, currentBar: 0, currentBeat: 0, bpm: 95, selectedPreset: PRESETS[0] });

  // Update ref state
  useEffect(() => {
    stateRef.current = { isPlaying, currentBar, currentBeat, bpm, selectedPreset };
  }, [isPlaying, currentBar, currentBeat, bpm, selectedPreset]);

  // Handle Preset Change
  const handleSelectPreset = (p: ProgressionPreset) => {
    stopTrack();
    setSelectedPreset(p);
    setBpm(p.defaultBpm);
    setCurrentBar(0);
    setCurrentBeat(0);
  };

  // Sound Dispatcher for each Beat (Quarter note)
  const triggerBeatAudio = (barIdx: number, beatIdx: number) => {
    const chord = selectedPreset.chords[barIdx % selectedPreset.chords.length];

    // 1. DRUMS (4/4 groove)
    if (!muteDrums && drumVol > 0) {
      // Kick on beat 1 and beat 3
      if (beatIdx === 0 || beatIdx === 2) {
        audioEngine.playDrumKick(drumVol);
      }
      // Snare on beat 2 and beat 4
      if (beatIdx === 1 || beatIdx === 3) {
        audioEngine.playDrumSnare(drumVol);
      }
      // Hi-Hat on all 4 beats
      audioEngine.playDrumHiHat(false, drumVol * 0.7);
    }

    // 2. BASS
    if (!muteBass && bassVol > 0 && chord) {
      // Root note on Beat 1, 5th or octave on Beat 3
      if (beatIdx === 0) {
        audioEngine.playBassNote(chord.bassFreq, 1.2, bassVol);
      } else if (beatIdx === 2) {
        audioEngine.playBassNote(chord.bassFreq * 1.5, 0.9, bassVol * 0.85);
      }
    }

    // 3. RHYTHM GUITAR STRUM
    if (!muteGuitar && guitarVol > 0 && chord) {
      // Strum on beats 1, 2, 3, 4 with syncopated dynamics
      if (beatIdx === 0 || beatIdx === 2) {
        audioEngine.playChord(chord.frets, 1, 25);
      } else if (beatIdx === 1 || beatIdx === 3) {
        // Offbeat acoustic strum
        audioEngine.playChord(chord.frets, 1, 18);
      }
    }

    // 4. METRONOME CLICK
    if (!muteClick && clickVol > 0) {
      audioEngine.playMetronomeClick(beatIdx === 0, bpm, clickVol);
    }
  };

  // Start Playback Loop
  const startTrack = () => {
    setIsPlaying(true);
    let bar = currentBar;
    let beat = currentBeat;

    const tick = () => {
      triggerBeatAudio(bar, beat);
      setCurrentBar(bar);
      setCurrentBeat(beat);

      beat++;
      if (beat >= 4) {
        beat = 0;
        bar = (bar + 1) % selectedPreset.chords.length;
      }

      const beatMs = (60 / bpm) * 1000;
      loopTimerRef.current = setTimeout(tick, beatMs);
    };

    tick();
  };

  const stopTrack = () => {
    setIsPlaying(false);
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopTrack();
    } else {
      startTrack();
    }
  };

  const resetTrack = () => {
    stopTrack();
    setCurrentBar(0);
    setCurrentBeat(0);
  };

  useEffect(() => {
    return () => {
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    };
  }, []);

  const activeChord = selectedPreset.chords[currentBar % selectedPreset.chords.length];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Disc className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>Estudio de Backing Tracks & Jamming</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Banda Virtual DSP
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Generador multi-pista en tiempo real (Batería, Bajo, Guitarra y Clic) para improvisar solos
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedPreset.id}
            onChange={(e) => {
              const p = PRESETS.find((item) => item.id === e.target.value);
              if (p) handleSelectPreset(p);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl focus:border-amber-500 outline-none cursor-pointer max-w-xs truncate"
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.genre})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Soloing Guide Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Escala Recomendada para Improvisar:</span>
          </div>
          <p className="text-slate-200 font-medium text-sm">{selectedPreset.scaleSuggestion}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-amber-300 font-mono font-bold">
            Acorde Actual: {activeChord?.root} {activeChord?.quality}
          </span>
        </div>
      </div>

      {/* Main Transport Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950/90 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayback}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pausar Jam' : 'Iniciar Pista'}</span>
          </button>

          <button
            onClick={resetTrack}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl cursor-pointer"
            title="Volver al compás 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* BPM Selector */}
        <div className="flex items-center gap-3">
          <Gauge className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-300">Tempo:</span>
          <span className="font-mono font-bold text-amber-400 text-sm w-12">{bpm} BPM</span>
          <input
            type="range"
            min={50}
            max={180}
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
            className="w-24 sm:w-36 accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Beat Meter Lights (1 - 2 - 3 - 4) */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-2 rounded-xl border border-slate-800">
          {[0, 1, 2, 3].map((b) => {
            const isCurrentBeat = isPlaying && currentBeat === b;
            const isAccent = b === 0;

            return (
              <div
                key={b}
                className={`w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center transition-all ${
                  isCurrentBeat
                    ? isAccent
                      ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg shadow-amber-400/50 ring-2 ring-white'
                      : 'bg-emerald-400 text-slate-950 scale-105 shadow-md ring-1 ring-white'
                    : 'bg-slate-950 text-slate-600 border border-slate-800'
                }`}
              >
                {b + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chord Progression Score Grid */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400">Progresión de Compases ({selectedPreset.chords.length} compases):</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {selectedPreset.chords.map((chord, idx) => {
            const isCurrent = isPlaying && currentBar === idx;

            return (
              <div
                key={idx}
                onClick={() => {
                  setCurrentBar(idx);
                  setCurrentBeat(0);
                  triggerBeatAudio(idx, 0);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-center relative overflow-hidden ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-500 shadow-xl ring-2 ring-amber-500/40 scale-105'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-500 uppercase">Compás {idx + 1}</div>
                <div className={`text-xl sm:text-2xl font-black mt-1 ${isCurrent ? 'text-amber-400' : 'text-slate-100'}`}>
                  {chord.root}
                  <span className="text-xs font-normal ml-0.5">{chord.quality}</span>
                </div>
                {isCurrent && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Track Mixer Channels */}
      <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-inner">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Mezclador de Canales de la Pista (DSP Multi-Track):</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Drums Channel */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">🥁 Batería</span>
              <button
                onClick={() => setMuteDrums(!muteDrums)}
                className={`p-1 rounded cursor-pointer ${muteDrums ? 'text-rose-400' : 'text-slate-400 hover:text-white'}`}
              >
                {muteDrums ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muteDrums ? 0 : drumVol}
              onChange={(e) => setDrumVol(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Bass Channel */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">🎸 Bajo Eléctrico</span>
              <button
                onClick={() => setMuteBass(!muteBass)}
                className={`p-1 rounded cursor-pointer ${muteBass ? 'text-rose-400' : 'text-slate-400 hover:text-white'}`}
              >
                {muteBass ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muteBass ? 0 : bassVol}
              onChange={(e) => setBassVol(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Rhythm Guitar Channel */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">🎵 Guitarra Rítmica</span>
              <button
                onClick={() => setMuteGuitar(!muteGuitar)}
                className={`p-1 rounded cursor-pointer ${muteGuitar ? 'text-rose-400' : 'text-slate-400 hover:text-white'}`}
              >
                {muteGuitar ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muteGuitar ? 0 : guitarVol}
              onChange={(e) => setGuitarVol(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Click / Metronome Channel */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">⏱️ Clic de Pulso</span>
              <button
                onClick={() => setMuteClick(!muteClick)}
                className={`p-1 rounded cursor-pointer ${muteClick ? 'text-rose-400' : 'text-slate-400 hover:text-white'}`}
              >
                {muteClick ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muteClick ? 0 : clickVol}
              onChange={(e) => setClickVol(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
