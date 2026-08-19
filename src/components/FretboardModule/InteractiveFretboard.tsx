import React, { useState } from 'react';
import { audioEngine } from '../../utils/audioSynthesizer';
import {
  Layers,
  Volume2,
  Sparkles,
  RotateCcw,
  Sliders,
  Eye,
  Info,
  CheckCircle2
} from 'lucide-react';

const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// 6 strings standard tuning notes from 1st (high E) down to 6th (low E)
const STRINGS_OPEN = [
  { note: 'E', octave: 4, baseFreq: 329.63, stringNum: 1 },
  { note: 'B', octave: 3, baseFreq: 246.94, stringNum: 2 },
  { note: 'G', octave: 3, baseFreq: 196.00, stringNum: 3 },
  { note: 'D', octave: 3, baseFreq: 146.83, stringNum: 4 },
  { note: 'A', octave: 2, baseFreq: 110.00, stringNum: 5 },
  { note: 'E', octave: 2, baseFreq: 82.41, stringNum: 6 }
];

export const InteractiveFretboard: React.FC = () => {
  const [rootKey, setRootKey] = useState<string>('A');
  const [scaleType, setScaleType] = useState<string>('pentatonic_minor');
  const [displayMode, setDisplayMode] = useState<'notes' | 'degrees' | 'fingers'>('notes');
  const [isLeftHanded, setIsLeftHanded] = useState<boolean>(false);
  const [numFrets, setNumFrets] = useState<number>(15);

  const getScaleIntervals = () => {
    switch (scaleType) {
      case 'pentatonic_minor':
        return [
          { semitone: 0, degree: '1 (Tónica)', finger: 1, color: 'root' },
          { semitone: 3, degree: 'b3 (3ª Menor)', finger: 4, color: 'third' },
          { semitone: 5, degree: '4 (4ª Justa)', finger: 1, color: 'fourth' },
          { semitone: 7, degree: '5 (5ª Justa)', finger: 3, color: 'fifth' },
          { semitone: 10, degree: 'b7 (7ª Menor)', finger: 1, color: 'seventh' }
        ];
      case 'pentatonic_major':
        return [
          { semitone: 0, degree: '1 (Tónica)', finger: 2, color: 'root' },
          { semitone: 2, degree: '2 (2ª Mayor)', finger: 4, color: 'second' },
          { semitone: 4, degree: '3 (3ª Mayor)', finger: 1, color: 'third' },
          { semitone: 7, degree: '5 (5ª Justa)', finger: 1, color: 'fifth' },
          { semitone: 9, degree: '6 (6ª Mayor)', finger: 4, color: 'sixth' }
        ];
      case 'blues_minor':
        return [
          { semitone: 0, degree: '1 (Tónica)', finger: 1, color: 'root' },
          { semitone: 3, degree: 'b3 (3ª Menor)', finger: 4, color: 'third' },
          { semitone: 5, degree: '4 (4ª Justa)', finger: 1, color: 'fourth' },
          { semitone: 6, degree: 'b5 (Blue Note)', finger: 2, color: 'blue_note' },
          { semitone: 7, degree: '5 (5ª Justa)', finger: 3, color: 'fifth' },
          { semitone: 10, degree: 'b7 (7ª Menor)', finger: 1, color: 'seventh' }
        ];
      case 'caged_triad_major':
        return [
          { semitone: 0, degree: '1 (Tónica)', finger: 1, color: 'root' },
          { semitone: 4, degree: '3 (3ª Mayor)', finger: 2, color: 'third' },
          { semitone: 7, degree: '5 (5ª Justa)', finger: 3, color: 'fifth' }
        ];
      case 'dorian':
        return [
          { semitone: 0, degree: '1 (Tónica)', finger: 1, color: 'root' },
          { semitone: 2, degree: '2 (2ª)', finger: 2, color: 'second' },
          { semitone: 3, degree: 'b3 (3ª)', finger: 3, color: 'third' },
          { semitone: 5, degree: '4 (4ª)', finger: 1, color: 'fourth' },
          { semitone: 7, degree: '5 (5ª)', finger: 3, color: 'fifth' },
          { semitone: 9, degree: '6 (6ª Mayor)', finger: 4, color: 'sixth' },
          { semitone: 10, degree: 'b7 (7ª)', finger: 1, color: 'seventh' }
        ];
      default:
        return [
          { semitone: 0, degree: '1 (Tónica)', finger: 1, color: 'root' },
          { semitone: 3, degree: 'b3', finger: 4, color: 'third' },
          { semitone: 5, degree: '4', finger: 1, color: 'fourth' },
          { semitone: 7, degree: '5', finger: 3, color: 'fifth' },
          { semitone: 10, degree: 'b7', finger: 1, color: 'seventh' }
        ];
    }
  };

  const scaleIntervals = getScaleIntervals();
  const rootIndex = CHROMATIC_SCALE.indexOf(rootKey);

  const scaleMap = new Map<string, { degree: string; finger: number; color: string }>();
  scaleIntervals.forEach((item) => {
    const note = CHROMATIC_SCALE[(rootIndex + item.semitone) % 12];
    scaleMap.set(note, { degree: item.degree, finger: item.finger, color: item.color });
  });

  const handleFretClick = (stringBaseFreq: number, fret: number) => {
    const freq = stringBaseFreq * Math.pow(2, fret / 12);
    audioEngine.playGuitarPluck(freq, 2.8, 0.9);
  };

  const isFretMarker = (fret: number) => [3, 5, 7, 9, 15, 17, 19, 21].includes(fret);
  const isDoubleFretMarker = (fret: number) => fret === 12;

  const displayStrings = isLeftHanded ? [...STRINGS_OPEN].reverse() : STRINGS_OPEN;

  const getBadgeStyle = (noteName: string) => {
    const info = scaleMap.get(noteName);
    if (!info) return 'bg-slate-800/80 text-slate-500 border border-slate-700';

    if (info.color === 'root') {
      return 'bg-rose-600 text-white ring-2 ring-rose-400 font-black shadow-lg shadow-rose-600/30 scale-105';
    }
    if (info.color === 'blue_note') {
      return 'bg-indigo-600 text-white ring-2 ring-indigo-300 font-bold shadow-lg shadow-indigo-600/30';
    }
    if (info.color === 'third') {
      return 'bg-emerald-600 text-white ring-1 ring-emerald-300 font-bold';
    }
    if (info.color === 'fifth') {
      return 'bg-blue-600 text-white ring-1 ring-blue-300 font-bold';
    }
    return 'bg-amber-600 text-slate-950 font-bold';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Mode Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-amber-400" /> Diapasón Interactivo Unificado 2D
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Mapeo inteligente de escalas, arpegios e intervalos con digitación anatómica sugerida.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Root Key Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <span className="text-slate-500 font-bold">Tónica:</span>
              <select
                value={rootKey}
                onChange={(e) => setRootKey(e.target.value)}
                className="bg-transparent font-bold text-rose-400 outline-none cursor-pointer"
              >
                {CHROMATIC_SCALE.map((n) => (
                  <option key={n} value={n} className="bg-slate-900">
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Scale / Mode selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <span className="text-slate-500 font-bold">Escala:</span>
              <select
                value={scaleType}
                onChange={(e) => setScaleType(e.target.value)}
                className="bg-transparent font-semibold text-slate-100 outline-none cursor-pointer"
              >
                <optgroup label="Pentatónicas & Blues" className="bg-slate-900">
                  <option value="pentatonic_minor">Pentatónica Menor (Rock / Blues)</option>
                  <option value="pentatonic_major">Pentatónica Mayor (Country / Pop)</option>
                  <option value="blues_minor">Escala de Blues (con Blue Note b5)</option>
                </optgroup>
                <optgroup label="Sistema CAGED & Tríadas" className="bg-slate-900">
                  <option value="caged_triad_major">Tríada Mayor CAGED (1 - 3 - 5)</option>
                  <option value="dorian">Modo Dórico (Santana / Jazz Rock)</option>
                </optgroup>
              </select>
            </div>

            {/* Display Mode (Notes vs Degrees vs Fingers) */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setDisplayMode('notes')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  displayMode === 'notes' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Notas
              </button>
              <button
                onClick={() => setDisplayMode('degrees')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  displayMode === 'degrees' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Grados
              </button>
              <button
                onClick={() => setDisplayMode('fingers')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  displayMode === 'fingers' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Dedos (1-4)
              </button>
            </div>

            {/* Left Handed / Mirror Toggle */}
            <button
              onClick={() => setIsLeftHanded(!isLeftHanded)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isLeftHanded
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isLeftHanded ? 'Modo Zurdos (Activo)' : 'Modo Diestros'}
            </button>
          </div>
        </div>

        {/* Fretboard SVG / Visual Neck */}
        <div className="overflow-x-auto pb-4 pt-2">
          <div className="min-w-[760px] bg-gradient-to-b from-amber-950/40 via-amber-950/20 to-slate-950 border-2 border-amber-900/40 rounded-2xl p-4 shadow-2xl relative select-none">
            {/* Top Fret numbers */}
            <div
              className="grid grid-cols-[50px_repeat(var(--num-frets),1fr)] text-center text-xs font-mono text-slate-500 mb-2"
              style={{ '--num-frets': numFrets } as any}
            >
              <span>0 (Nut)</span>
              {Array.from({ length: numFrets }).map((_, f) => (
                <span key={f} className={f + 1 === 12 ? 'text-amber-400 font-bold' : ''}>
                  {f + 1}
                </span>
              ))}
            </div>

            {/* 6 Guitar Strings */}
            <div className="space-y-4 relative py-2">
              {displayStrings.map((str, sIdx) => {
                const openNoteIndex = CHROMATIC_SCALE.indexOf(str.note);

                return (
                  <div
                    key={sIdx}
                    className="grid grid-cols-[50px_repeat(var(--num-frets),1fr)] items-center relative"
                    style={{ '--num-frets': numFrets } as any}
                  >
                    {/* Metallic string line */}
                    <div
                      className="absolute left-12 right-0 bg-slate-400/80 -translate-y-1/2 pointer-events-none"
                      style={{
                        top: '50%',
                        height: `${Math.max(1.5, (6 - sIdx) * 0.7)}px`,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}
                    />

                    {/* Open String (Fret 0) */}
                    <div className="flex justify-center z-10">
                      {(() => {
                        const noteName = str.note;
                        const scaleInfo = scaleMap.get(noteName);
                        const isScaleNote = !!scaleInfo;

                        const displayText =
                          displayMode === 'degrees' && scaleInfo
                            ? scaleInfo.degree.split(' ')[0]
                            : displayMode === 'fingers' && scaleInfo
                            ? `D${scaleInfo.finger}`
                            : noteName;

                        return (
                          <button
                            onClick={() => handleFretClick(str.baseFreq, 0)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-transform hover:scale-110 cursor-pointer shadow-md ${getBadgeStyle(
                              noteName
                            )}`}
                          >
                            {displayText}
                          </button>
                        );
                      })()}
                    </div>

                    {/* Frets 1 to N */}
                    {Array.from({ length: numFrets }).map((_, fIdx) => {
                      const fretNumber = fIdx + 1;
                      const noteIndex = (openNoteIndex + fretNumber) % 12;
                      const noteName = CHROMATIC_SCALE[noteIndex];
                      const scaleInfo = scaleMap.get(noteName);
                      const inScale = !!scaleInfo;

                      const displayText =
                        displayMode === 'degrees' && scaleInfo
                          ? scaleInfo.degree.split(' ')[0]
                          : displayMode === 'fingers' && scaleInfo
                          ? `D${scaleInfo.finger}`
                          : noteName;

                      return (
                        <div
                          key={fIdx}
                          className="flex justify-center items-center z-10 relative h-9 border-r border-slate-700/60"
                        >
                          {/* Fret inlays */}
                          {sIdx === 2 && isFretMarker(fretNumber) && (
                            <div className="absolute w-3 h-3 rounded-full bg-slate-700/40 pointer-events-none -z-0" />
                          )}
                          {sIdx === 2 && isDoubleFretMarker(fretNumber) && (
                            <div className="absolute flex gap-1 pointer-events-none -z-0">
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
                            </div>
                          )}

                          {inScale ? (
                            <button
                              onClick={() => handleFretClick(str.baseFreq, fretNumber)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all hover:scale-115 cursor-pointer shadow-lg ${getBadgeStyle(
                                noteName
                              )}`}
                              title={`${noteName} (${scaleInfo?.degree}) - Traste ${fretNumber}`}
                            >
                              {displayText}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleFretClick(str.baseFreq, fretNumber)}
                              className="w-5 h-5 rounded-full opacity-0 hover:opacity-100 hover:bg-slate-700 text-slate-400 text-[9px] flex items-center justify-center transition-all cursor-pointer"
                            >
                              {noteName}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Color Legend Footer */}
        <div className="mt-4 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-600 shadow-sm" />
              <span className="text-slate-300 font-bold">Tónica / Raíz (Rojo)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 shadow-sm" />
              <span className="text-slate-300 font-bold">3ªs Mayores / Menores (Verde)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-600 shadow-sm" />
              <span className="text-slate-300 font-bold">5ªs Justas (Azul)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 shadow-sm" />
              <span className="text-slate-300 font-bold">Blue Note b5 (Índigo)</span>
            </div>
          </div>

          <span className="text-slate-500 font-mono">
            Guía de Dedos: 1=Índice, 2=Medio, 3=Anular, 4=Meñique
          </span>
        </div>
      </div>
    </div>
  );
};
